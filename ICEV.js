// ==UserScript==
// @name         CEV Auto-Fill v6
// @namespace    http://tampermonkey.net/
// @version      7.2
// @description  CEV auto-filler — GM storage, shadow DOM, answers preview, silent highlight, bypass button
// @author       You
// @match        https://login.icevonline.com/mycourses/*/lesson/*
// @match        https://login.icevonline.com/mycourses/*/lesson/*/summary*
// @match        https://login.icevonline.com/app/courses/*/lessons/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_info
// @updateURL    https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ICEV.js
// @downloadURL  https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ICEV.js
// @run-at       document-idle
// ==/UserScript==


(function () {
  "use strict";

  // Redirect /resume paths to ?resume=True
  if (/\/CEV[^/?#]+\/resume(\?.*)?$/.test(location.pathname)) {
    location.replace(location.pathname.replace(/\/resume$/, "") + "?resume=True");
    return;
  }
  if (window.self !== window.top) return;

  const VERSION = GM_info?.script?.version ?? "7.2";
  const DISCORD = "@nmsjayden";
  const WAIT_MS = 500, TIMEOUT = 25_000, POST_LOAD = 1200;

  let _allDone = false, _miniDragged = false, _shadowRoot = null, _lastDiagnostic = "";
const cleanSpaces = s =>
  (s ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripLabel = s =>
  cleanSpaces(s).replace(/^[^:=]{1,20}\s*[:=]\s*/, "");

const mathLite = s =>
  stripLabel(s)
    .replace(/[×✕✖⋅•*]/g, "x")
    .replace(/[−–—]/g, "-");

const looseEq = (a,b) => mathLite(a) === mathLite(b);

const looseEndsWith = (a,b) => {
  const A = mathLite(a), B = mathLite(b);
  return A.endsWith(B) || B.endsWith(A);
};

  // ── Storage ──────────────────────────────────────────────────────────
  const K = {
    LESSONS:"CEV_LESSONS", ANSWERS:"CEV_ANSWERS", SETTINGS:"CEV_SETTINGS",
    QUEUE:"CEV_QUEUE", PENDING:"CEV_PENDING_ACTION", POS:"CEV_PANEL_POS", LOGS:"CEV_LOGS"
  };

  const getJ  = k => { try { const v = GM_getValue(k, null); return typeof v === "string" ? JSON.parse(v) : v; } catch { return null; } };
  const setJ  = (k, v) => GM_setValue(k, JSON.stringify(v));
  const delJ  = k => GM_deleteValue(k);

  const getLessons  = ()       => getJ(K.LESSONS)  || {};
  const saveLessons = d        => setJ(K.LESSONS, d);
  const patchLesson = (id, p)  => { const a = getLessons(); a[id] = { ...(a[id]||{}), ...p }; saveLessons(a); };
  const getAnswers  = ()       => getJ(K.ANSWERS)  || {};
  const saveAnswers = d        => setJ(K.ANSWERS, d);
  const getSettings = ()       => getJ(K.SETTINGS) || {};
  const saveSettings = p       => setJ(K.SETTINGS, { ...getSettings(), ...p });

  const isAutoOn        = () => getSettings().auto !== false;
  const isSkipPrompt    = () => getSettings().skipParsePrompt === true;
  const isSkipFillPrompt= () => getSettings().skipFillPrompt === true;
  const isAutoFirstRun  = () => getSettings().autoFirstRun !== false;
  const isSilentHL      = () => getSettings().silentHighlight === true;
  const isGradeTarget   = () => getSettings().gradeTarget === true;
  const getGradeMin     = () => Math.max(0, Math.min(100, getSettings().gradeMin ?? 70));
  const getGradeMax     = () => Math.max(0, Math.min(100, getSettings().gradeMax ?? 90));
  const isAutoRetry     = () => getSettings().autoRetry !== false;
  const getMaxRetries   = () => Math.max(1, Math.min(10, getSettings().maxRetries ?? 3));
  // Pick a fresh random int within [min,max]; if equal, return that value
  const rollGradeTarget = () => { const mn=getGradeMin(), mx=getGradeMax(); return mn>=mx ? mx : Math.floor(Math.random()*(mx-mn+1))+mn; };

  const setPending   = o => setJ(K.PENDING, o);
  const getPending   = () => getJ(K.PENDING);
  const clearPending = () => delJ(K.PENDING);
  const getQueue     = () => getJ(K.QUEUE) || [];
  const setQueue     = q  => setJ(K.QUEUE, q);
  const enqueue      = i  => { const q = getQueue(); if (!q.find(x => x.id === i.id)) { q.push(i); setQueue(q); } };
  const dequeue      = () => { const q = getQueue(); const i = q.shift(); setQueue(q); return i; };
  const clearQueue   = () => setQueue([]);

  if (!getJ(K.SETTINGS)) saveSettings({ auto: false, skipParsePrompt: false, skipFillPrompt: false, autoFirstRun: true, silentHighlight: false, autoRetry: true, maxRetries: 3 });

  // ── One-time localStorage → GM migration ──────────────────────────────
  (() => {
    const lessons = getLessons(), answers = getAnswers(); let changed = false;
    const prefixHandlers = [
      ["CEV_STATUS_",     id => { lessons[id] = { ...(lessons[id]||{}), status:     localStorage.getItem(`CEV_STATUS_${id}`)   }; }],
      ["CEV_QCOUNT_",     id => { lessons[id] = { ...(lessons[id]||{}), qcount: +   localStorage.getItem(`CEV_QCOUNT_${id}`)   }; }],
      ["CEV_SCORE_",      id => { try { lessons[id] = { ...(lessons[id]||{}), score: JSON.parse(localStorage.getItem(`CEV_SCORE_${id}`)) }; } catch {} }],
      ["CEV_QA_",         id => { try { const v = JSON.parse(localStorage.getItem(`CEV_QA_${id}`)); if (v) answers[id] = v; } catch {} }],
      ["CEV_FILL_RETRY_", id => { lessons[id] = { ...(lessons[id]||{}), fillRetry:  localStorage.getItem(`CEV_FILL_RETRY_${id}`) }; }],
    ];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k) continue;
      for (const [pfx, fn] of prefixHandlers) {
        if (k.startsWith(pfx)) { fn(k.slice(pfx.length)); localStorage.removeItem(k); i--; changed = true; break; }
      }
    }
    if (changed) { saveLessons(lessons); saveAnswers(answers); }
    Object.values(K).forEach(k => {
      const raw = localStorage.getItem(k);
      if (raw && GM_getValue(k, null) === null) GM_setValue(k, raw);
      localStorage.removeItem(k);
    });
  })();

  // ── Utils ────────────────────────────────────────────────────────────
  const wait       = ms => new Promise(r => setTimeout(r, ms));
  const $all       = (s, r = document) => r ? Array.from(r.querySelectorAll(s)) : [];
  const $one       = (s, r = document) => r?.querySelector(s) ?? null;
const trim = v => {
  if (!v) return "";

  const s =
    typeof v === "object" && v.textContent != null
      ? v.textContent
      : String(v);

  return s
    .replace(/\u00A0/g, " ")          // nbsp → space
    .replace(/[\u200B-\u200D\uFEFF]/g,"") // zero-width chars
    .replace(/\s+/g, " ")
    .trim();
};
  // Like trim() but for answer-list <li> elements: removes the index badge first so
  // "1" + "3 + 4 = 7" doesn't collapse into "13 + 4 = 7".
const trimLi = li => {
  if (!li) return "";

  const c = li.cloneNode(true);

  // remove index badge so "1" + "text" doesn't merge
  c.querySelector(".lrn_responseIndex")?.remove();

  // remove accessibility / hidden UI junk
  c.querySelectorAll(
    ".visually-hidden," +
    "[aria-hidden='true']," +
    "canvas,svg," +
    ".lrn-circle," +
    "span[class*='score']"
  ).forEach(e => e.remove());

  return c.textContent
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g,"")
    .replace(/\s+/g, " ")
    .trim();
};
  const isVisible  = el => {
    if (!el) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0" && r.width > 0 && r.height > 0;
  };
  const getLID     = () => location.pathname.match(/\/lesson\/\d+\/(CEV[^/?#]+)/)?.[1] ?? location.pathname.match(/\/lesson\/\d+\/([^/?#]+)/)?.[1] ?? null;
  const getLNum    = () => location.pathname.match(/\/lesson\/(\d+)/)?.[1] ?? null;
  const getCID     = () => location.pathname.match(/\/(?:mycourses|app\/courses)\/([^/]+)/)?.[1] ?? null;
  const getStatus  = id  => getLessons()[id]?.status ?? "unseen";
  const setStatus  = (id, v) => patchLesson(id, { status: v });
  const getQCount  = id  => getLessons()[id]?.qcount ?? 0;
  const setQCount  = (id, n) => patchLesson(id, { qcount: n });
  const getQAMap   = id  => getAnswers()[id] ?? {};
  const hasAnswers = id  => { const d = getQAMap(id); return !!d.qaMap && Object.keys(d.qaMap).length > 0; };
  const fireEvents = (el, ...types) => types.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
  const readScore  = ()  => ({
    percentage: $one(".scoreCanvas .score-text")?.textContent?.trim() ?? null,
    points:     $all(".scoreCanvas .score-text")[1]?.textContent?.trim() ?? null
  });

  // Strip iCEV's blank-index prefix artifact (e.g. "1structuring" → "structuring")
  // Only strips a leading digit when followed by a plain letter (a-zA-Z) — not before
  // digits, whitespace, punctuation, math symbols, $, (, %, /, ., etc.
  const stripAnswerPrefix = s => typeof s === "string" ? s.replace(/^\d(?=[a-zA-Z])/, "") : s;

  const STATUS_LABELS = { unseen:"Not seen", running:"In progress", answers_saved:"Answers saved", answers_partial:"Partial answers", filled:"Filled ✓", error:"Error", unsafe:"Unsafe (1 attempt)", ext_attempted:"Already attempted" };
  const STATUS_CLASSES = { running:"running", answers_saved:"saved", answers_partial:"partial", filled:"filled", error:"error", unsafe:"unsafe", ext_attempted:"ext_attempted" };
  const statusLabel = s => STATUS_LABELS[s] ?? s;
  const statusClass = s => STATUS_CLASSES[s] ?? "unseen";
  const fmtScore    = sc => sc?.points ? `${sc.percentage} · ${sc.points}` : (sc?.percentage ?? "");
  const countSt     = s  => Object.values(getLessons()).filter(l => l.status === s).length;

  // ── Logs ──────────────────────────────────────────────────────────────
  const MAX_LOGS = 80;
  function addLog(level, msg, data) {
    const logs = getJ(K.LOGS) || [], last = logs[logs.length - 1];
    if (last?.level === level && last?.msg === msg) {
      last.count = (last.count || 1) + 1; last.t = Date.now();
      setJ(K.LOGS, logs); refreshLogs(); return;
    }
    logs.push({ t: Date.now(), level, msg, data: data ? JSON.stringify(data).slice(0, 300) : undefined });
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    setJ(K.LOGS, logs); refreshLogs();
  }
  const logInfo  = (m, d) => { console.log(`[CEV] ${m}`,  d||""); addLog("info",  m, d); };
  const logWarn  = (m, d) => { console.warn(`[CEV] ${m}`, d||""); addLog("warn",  m, d); };
  const logError = (m, d) => {
    console.error(`[CEV] ${m}`, d||"");
    addLog("error", m, d);
    _lastDiagnostic = buildDiagnostic(m, d);
    Toast.error(`Error logged. Report to <b>${DISCORD}</b> on Discord.`, 12000);
  };

  function buildDiagnostic(m, d) {
    try {
      const lid = getLID(), lessonData = lid ? getLessons()[lid] : null;
      const savedAnswers = lid ? getQAMap(lid) : null;
      const recentLogs = (getJ(K.LOGS)||[]).slice(-20);
      let domSnap;
      try {
        domSnap = $all(".lrn_widget[id]").map(w => ({
          id: w.id,
          classes: [...w.classList].join(" "),
          stimulus: (trim($one(".lrn_stimulus_content",w))||"").slice(0,80),
          dropzones: $all(".lrn_dropzone,.lrn_response_container",w).map(dz=>({
            inputid: dz.dataset.inputid ?? null,
            empty: dz.classList.contains("lrn-dragdrop-empty"),
            text: (trim(dz)||"").slice(0,40),
          })),
          draggables: $all(".lrn_btn_drag",w).map(btn=>({
            text: (trim($one(".lrn_item",btn)||btn)||"").slice(0,30),
            pressed: btn.getAttribute("aria-pressed"),
            inPool: !btn.closest(".lrn_response_container,.lrn_dropzone"),
          })),
        }));
      } catch { domSnap = "DOM snapshot failed"; }

      return [
        `[CEV v${VERSION}] ERROR REPORT`,
        `Time   : ${new Date().toISOString()}`,
        `URL    : ${location.href}`,
        `Lesson : ${lid ?? "unknown"}`,
        `Status : ${lessonData?.status ?? "unknown"}`,
        "",
        "── Error ──────────────────────────────────────",
        m, d ? `Detail : ${JSON.stringify(d)}` : "",
        "",
        "── Lesson Data ────────────────────────────────",
        lessonData ? JSON.stringify(lessonData, null, 2) : "none",
        "",
        "── Saved Answers (qaMap keys + types) ─────────",
        savedAnswers?.qaMap
          ? Object.entries(savedAnswers.qaMap).map(([k,v]) =>
              `  "${k.slice(0,60)}" => type:${v?.type ?? "?"}, data:${JSON.stringify(v?.answers ?? v?.answer ?? v?.items ?? "?").slice(0,80)}`
            ).join("\n")
          : "none",
        "",
        "── Recent Logs (last 20) ───────────────────────",
        recentLogs.map(l =>
          `  [${l.level.toUpperCase()}] ${new Date(l.t).toISOString().slice(11,19)} ${l.msg}${l.data ? " | "+l.data : ""}${l.count>1?" (x"+l.count+")":""}`
        ).join("\n"),
        "",
        "── DOM Snapshot (lrn_widgets) ─────────────────",
        JSON.stringify(domSnap, null, 2),
        "",
        "── Settings ────────────────────────────────────",
        JSON.stringify(getSettings(), null, 2),
      ].join("\n");
    } catch {
      return `[CEV v${VERSION}]\n${m}\n${location.href}\n${d ? JSON.stringify(d).slice(0,300) : ""}`;
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard?.writeText)
      return navigator.clipboard.writeText(text).then(() => true).catch(() => execCommandCopy(text));
    return Promise.resolve(execCommandCopy(text));
  }
  function execCommandCopy(text) {
    try {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy"); ta.remove(); return ok;
    } catch { return false; }
  }

  // ── Toast (closed shadow DOM) ────────────────────────────────────────
  const Toast = (() => {
    const host = document.createElement("div"); host.setAttribute("data-x-ui","");
    const shadow = host.attachShadow({ mode:"closed" });
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;bottom:80px;right:20px;display:flex;flex-direction:column-reverse;gap:8px;z-index:2147483646;pointer-events:none;max-width:320px;";
    shadow.appendChild(document.createElement("style")).textContent = "*{box-sizing:border-box}";
    shadow.appendChild(wrap);
    document.documentElement.appendChild(host);

    const TYPES = {
      info:{ accent:"#2563eb", icon:"ℹ", bg:"#eff6ff", text:"#1e40af" },
      ok:  { accent:"#16a34a", icon:"✓", bg:"#f0fdf4", text:"#15803d" },
      warn:{ accent:"#d97706", icon:"!",  bg:"#fffbeb", text:"#92400e" },
      err: { accent:"#dc2626", icon:"✕", bg:"#fef2f2", text:"#991b1b" },
    };

    function show(html, type="info", dur=4000) {
      const d = TYPES[type], el = document.createElement("div");
      el.style.cssText = `background:${d.bg};border:1px solid ${d.accent}33;border-left:3px solid ${d.accent};color:${d.text};padding:10px 14px 10px 12px;border-radius:8px;font-size:12px;line-height:1.5;font-family:-apple-system,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,0.1);opacity:0;transform:translateY(6px);transition:opacity 0.2s,transform 0.2s;display:flex;align-items:flex-start;gap:8px;pointer-events:all;`;
      el.innerHTML = `<span style="flex-shrink:0;font-weight:600;font-size:11px;margin-top:1px">${d.icon}</span><span>${html}</span>`;
      wrap.prepend(el);
      requestAnimationFrame(() => { el.style.opacity="1"; el.style.transform="none"; });
      setTimeout(() => { el.style.opacity="0"; el.style.transform="translateY(6px)"; setTimeout(()=>el.remove(), 220); }, dur);
    }

    function bigWarn(msg) {
      shadow.querySelector("#cev-warn")?.remove();
      const b = Object.assign(document.createElement("div"), { id:"cev-warn" });
      b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#fef2f2;color:#991b1b;font-family:-apple-system,sans-serif;font-size:13px;padding:12px 20px;border-bottom:2px solid #dc2626;box-shadow:0 2px 8px rgba(220,38,38,0.15);display:flex;align-items:center;gap:10px;pointer-events:all;";
      b.innerHTML = `<span style="font-size:16px">⚠️</span><span style="flex:1">${msg}</span><span style="cursor:pointer;opacity:0.6;font-size:18px" onclick="this.parentElement.remove()">✕</span>`;
      shadow.appendChild(b);
    }

    return {
      info:  (m,d) => show(m,"info",d),
      ok:    (m,d) => show(m,"ok",d),
      warn:  (m,d) => show(m,"warn",d),
      error: (m,d) => show(m,"err",d),
      bigWarn,
    };
  })();

  // ── Panel (closed shadow DOM) ────────────────────────────────────────
  function buildPanel() {
    if (_shadowRoot) return;
    const host = document.createElement("div");
    host.setAttribute("data-x-widget","");
    host.style.cssText = "all:initial;position:fixed;z-index:2147483645;";
    _shadowRoot = host.attachShadow({ mode:"closed" });
    document.documentElement.appendChild(host);

    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
      *{box-sizing:border-box}
      #p{position:fixed;z-index:2147483645;font-family:'DM Sans',-apple-system,sans-serif;font-size:13px;width:280px;background:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05),0 10px 28px rgba(0,0,0,0.12);border:1px solid #e5e7eb;overflow:hidden;user-select:none;transition:border-radius .45s cubic-bezier(.34,1.56,.64,1),width .45s cubic-bezier(.34,1.56,.64,1),height .45s cubic-bezier(.34,1.56,.64,1),box-shadow .4s,border-color .3s}
      #p.minimized{width:48px!important;height:48px!important;border-radius:50%!important;border-color:transparent!important;cursor:grab;box-shadow:0 2px 8px rgba(37,99,235,0.4),0 6px 20px rgba(37,99,235,0.25);overflow:hidden}
      #p.minimized:active{cursor:grabbing}
      #p.minimized #hd{border-bottom-color:transparent!important;padding:0!important;width:48px;height:48px;min-height:48px;cursor:inherit;overflow:hidden}
      #p.is-minimizing #tb,#p.is-minimizing #bd,#p.minimized #tb,#p.minimized #bd{opacity:0;pointer-events:none;transition:opacity .1s}
      #p.is-minimizing #hdm,#p.minimized #hdm{opacity:0;transform:scale(.6);transition:opacity .1s,transform .1s;pointer-events:none}
      #mi{display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:700;width:48px;height:48px;position:absolute;top:0;left:0;opacity:0;transform:scale(.5);transition:opacity .2s .3s,transform .3s cubic-bezier(.34,1.56,.64,1) .3s;pointer-events:none}
      #p.minimized #mi{opacity:1;transform:scale(1)}
      #p.is-expanding #tb,#p.is-expanding #bd{opacity:0;pointer-events:none}
      #p.is-expanding #mi{opacity:0!important;transform:scale(.5)!important;transition:opacity .08s,transform .08s!important}
      #tb,#bd{opacity:1;transition:opacity .2s .3s}
      #hdm{opacity:1;transform:scale(1);transition:opacity .2s .3s,transform .25s cubic-bezier(.34,1.56,.64,1) .3s}
      #hd{background:#2563eb;padding:12px 14px 10px;cursor:grab;display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid rgba(255,255,255,0.15);position:relative}
      #hd:active{cursor:grabbing}
      #hdm{display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px}
      #hdl{display:flex;align-items:center;gap:8px}
      .dot{width:8px;height:8px;border-radius:50%;background:#86efac;flex-shrink:0;box-shadow:0 0 0 2px rgba(134,239,172,0.3);transition:background .3s,box-shadow .3s}
      .dot.off{background:rgba(255,255,255,0.3);box-shadow:none}
      #htitle{color:white;font-size:13px;font-weight:600;letter-spacing:-.01em;line-height:1.2}
      #hsub{color:rgba(255,255,255,.65);font-size:10px}
      .hbtn{background:rgba(255,255,255,.15);border:none;color:white;width:26px;height:26px;border-radius:6px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:background .15s;font-family:inherit}
      .hbtn:hover{background:rgba(255,255,255,.25)}
      #tb{display:flex;background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:0 14px;overflow-x:auto}
      #tb::-webkit-scrollbar{display:none}
      .tab{padding:9px 10px;font-size:12px;font-weight:500;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;flex-shrink:0;transition:color .15s,border-color .15s;white-space:nowrap;font-family:inherit;background:none;border-top:none;border-left:none;border-right:none}
      .tab.active{color:#2563eb;border-bottom-color:#2563eb}
      .tab:hover:not(.active){color:#374151}
      #bd{max-height:420px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#e5e7eb transparent}
      #bd::-webkit-scrollbar{width:4px}
      #bd::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:2px}
      .pane{display:none;padding:14px}
      .pane.active{display:block}
      #pane-answers{user-select:text;cursor:text}
      .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;margin-bottom:8px}
      .card:last-child{margin-bottom:0}
      .ct{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:6px}
      .sr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:3px 0}
      .sk{font-size:12px;color:#6b7280}
      .sv{font-size:12px;font-weight:500;color:#111827;text-align:right;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;border:1px solid transparent;white-space:nowrap}
      .badge.unseen{background:#f3f4f6;color:#6b7280;border-color:#e5e7eb}
      .badge.running{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}
      .badge.saved{background:#fffbeb;color:#d97706;border-color:#fde68a}
      .badge.partial{background:#fff7ed;color:#ea580c;border-color:#fed7aa}
      .badge.filled{background:#f0fdf4;color:#16a34a;border-color:#bbf7d0}
      .badge.error{background:#fef2f2;color:#dc2626;border-color:#fecaca}
      .badge.unsafe,.badge.ext_attempted{background:#f3f4f6;color:#6b7280;border-color:#e5e7eb}
      .pw{background:#e5e7eb;border-radius:4px;height:6px;overflow:hidden;margin-top:6px}
      .pb{height:100%;background:#2563eb;border-radius:4px;transition:width .4s}
      #autobig{display:flex;align-items:center;justify-content:space-between;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:background .15s}
      #autobig:hover{background:#dbeafe}
      #autobig.off{background:#f3f4f6;border-color:#e5e7eb}
      #autobig .abl{font-size:13px;font-weight:600;color:#1e40af}
      #autobig.off .abl{color:#6b7280}
      #autobig .abs{font-size:11px;color:#6b7280;margin-top:1px}
      .setrow{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #f3f4f6}
      .setrow:last-child{border-bottom:none}
      .setlbl{font-size:12px;font-weight:500;color:#374151;line-height:1.4}
      .setdsc{font-size:11px;color:#9ca3af;margin-top:2px}
      .tgl{position:relative;width:36px;height:20px;flex-shrink:0;cursor:pointer;margin-top:1px}
      .tgl input{opacity:0;width:0;height:0;position:absolute}
      .ttr{position:absolute;inset:0;border-radius:10px;background:#d1d5db;border:1px solid #d1d5db;transition:background .2s,border-color .2s}
      .tgl input:checked~.ttr{background:#2563eb;border-color:#2563eb}
      .tth{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:transform .2s}
      .tgl input:checked~.ttr .tth{transform:translateX(16px)}
      #logslist{font-size:11px;font-family:'Menlo','Consolas',monospace;display:flex;flex-direction:column;gap:4px}
      .lg{padding:5px 8px;border-radius:5px;border-left:2px solid transparent;color:#374151;background:#f9fafb;line-height:1.4;cursor:text;user-select:text}
      .lg.info{border-left-color:#2563eb}
      .lg.warn{border-left-color:#d97706;background:#fffbeb;color:#92400e}
      .lg.error{border-left-color:#dc2626;background:#fef2f2;color:#991b1b}
      .lgt{font-size:9px;color:#9ca3af;margin-right:4px}
      .lg mark{background:#fef08a;color:inherit;border-radius:2px;padding:0 1px}
      .lgc{display:inline-block;background:#2563eb;color:white;font-size:9px;font-weight:700;border-radius:8px;padding:0 5px;margin-left:5px;vertical-align:middle;font-family:-apple-system,sans-serif;line-height:16px}
      .lg.warn .lgc{background:#d97706}
      .lg.error .lgc{background:#dc2626}
      #lgsearch{width:100%;padding:5px 8px;border-radius:6px;border:1px solid #e5e7eb;background:white;font-size:11px;font-family:'Menlo','Consolas',monospace;color:#374151;outline:none;margin-bottom:8px;transition:border-color .15s;box-sizing:border-box}
      #lgsearch:focus{border-color:#93c5fd}
      .dr{display:flex;gap:6px;margin-top:8px}
      .gbtn{flex:1;padding:7px 10px;border-radius:7px;border:1px solid #e5e7eb;background:white;color:#6b7280;font-size:11px;font-weight:500;cursor:pointer;transition:background .15s,border-color .15s,color .15s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:4px}
      .gbtn:hover{background:#fef2f2;border-color:#fecaca;color:#dc2626}
      .gbtn.blue:hover{background:#eff6ff;border-color:#bfdbfe;color:#2563eb}
      .aqblock{margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f3f4f6}
      .aqblock:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
      .aqq{font-size:11px;font-weight:600;color:#374151;margin-bottom:6px;line-height:1.4}
      .aqtype{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:4px}
      .aopt{display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:6px;font-size:11px;color:#6b7280;margin-bottom:2px}
      .aopt.correct{background:#f0fdf4;color:#15803d;font-weight:600;border:1px solid #bbf7d0}
      .aopt-radio{width:12px;height:12px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0}
      .aopt.correct .aopt-radio{border-color:#16a34a;background:#16a34a;box-shadow:inset 0 0 0 2px white}
      .atxt{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:6px 10px;font-size:11px;color:#15803d;font-weight:500}
      .adrop{display:inline-flex;align-items:center;gap:4px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:4px 10px;font-size:11px;color:#1d4ed8;font-weight:500}
      .adrop::before{content:"▾ "}
      .aorder{list-style:none;padding:0;margin:0}
      .aorder li{display:flex;align-items:center;gap:6px;padding:3px 8px;font-size:11px;color:#374151;border-radius:4px;margin-bottom:2px;background:#f9fafb;border:1px solid #e5e7eb}
      .aorder li::before{content:attr(data-n);font-size:9px;font-weight:700;color:#9ca3af;min-width:14px}
      .atokens{display:flex;flex-wrap:wrap;gap:4px}
      .atoken{padding:2px 8px;border-radius:12px;font-size:11px;background:#fef9c3;border:1px solid #fde047;color:#854d0e;font-weight:500}
      .apair{display:flex;align-items:center;gap:6px;font-size:11px;margin-bottom:4px}
      .apair-q{color:#6b7280;flex:1}
      .apair-a{background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;padding:2px 8px;color:#1d4ed8;font-weight:500;flex-shrink:0}
      .apair-arrow{color:#9ca3af;flex-shrink:0}
      .adragzone{background:#f0fdf4;border:1px dashed #86efac;border-radius:6px;padding:6px 10px;font-size:11px;color:#15803d;font-weight:500;margin-bottom:3px;display:flex;align-items:center;gap:6px}
      .adragzone::before{content:"→";color:#86efac;font-weight:700}
      .ano-answers{color:#9ca3af;font-size:11px;text-align:center;padding:20px 0}
      .grade-range-wrap{display:flex;flex-direction:column;gap:6px;margin-top:6px}
      .grade-track{position:relative;height:6px;background:#e5e7eb;border-radius:3px}
      .grade-fill{position:absolute;height:100%;background:#2563eb;border-radius:3px;transition:left .15s,width .15s}
      .grade-thumb{position:absolute;top:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:white;border:2px solid #2563eb;cursor:grab;box-shadow:0 1px 3px rgba(0,0,0,0.2)}
      .grade-thumb:active{cursor:grabbing}
      .grade-labels{display:flex;justify-content:space-between;font-size:10px;color:#9ca3af}
      .grade-vals{display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:600}
      .grade-val{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:5px;padding:2px 7px}
      .grade-dash{color:#9ca3af;font-size:10px}
      #graderow{display:none}
      #graderow.visible{display:block}
    `;
    _shadowRoot.appendChild(style);

    const lid = getLID(), st = lid ? getStatus(lid) : "unseen";
    const sc   = getLessons()[lid]?.score;
    const panel = document.createElement("div"); panel.id = "p";
    panel.innerHTML = `
      <div id="hd">
        <div id="mi">C</div>
        <div id="hdm">
          <div id="hdl"><div class="dot" id="dot"></div><div><div id="htitle">CEV Auto-Fill</div><div id="hsub">v${VERSION}</div></div></div>
          <div><button class="hbtn" id="minbtn" title="Minimize">—</button></div>
        </div>
      </div>
      <div id="tb">
        <button class="tab active" data-tab="info">Info</button>
        <button class="tab" data-tab="answers">Answers</button>
        <button class="tab" data-tab="settings">Settings</button>
        <button class="tab" data-tab="logs">Logs</button>
      </div>
      <div id="bd">
        <div class="pane active" id="pane-info">
          <div id="autobig" class="${isAutoOn()?"":"off"}">
            <div><div class="abl">${isAutoOn()?"Automation On":"Automation Off"}</div><div class="abs">${isAutoOn()?"Click to disable":"Click to enable"}</div></div>
            <label class="tgl" onclick="event.stopPropagation()"><input type="checkbox" id="autotgl" ${isAutoOn()?"checked":""}><div class="ttr"><div class="tth"></div></div></label>
          </div>
          <div class="card">
            <div class="ct">Current Lesson</div>
            <div class="sr"><span class="sk">ID</span><span class="sv" id="lid" style="color:#2563eb;font-family:'Menlo',monospace;font-size:11px">${lid??"Not on assessment"}</span></div>
            <div class="sr"><span class="sk">Status</span><span class="badge ${statusClass(st)}" id="sbadge">${statusLabel(st)}</span></div>
            <div class="sr" id="scorerow" style="display:${sc?"":"none"}"><span class="sk">Last Score</span><span class="sv" id="scoreval" style="color:#16a34a;font-weight:600">${fmtScore(sc)}</span></div>
            <div class="sr" id="predrow" style="display:none"><span class="sk">Grade target</span><span class="sv" id="predval" style="color:#7c3aed;font-weight:600"></span></div>
          </div>
          <div class="card">
            <div class="ct">Queue</div>
            <div class="sr"><span class="sk">Pending</span><span class="sv" id="qval">${getQueue().length} assessments</span></div>
            <div class="pw"><div class="pb" id="qbar" style="width:0%"></div></div>
          </div>
          <div class="card">
            <div class="ct">Stats</div>
            <div class="sr"><span class="sk">Total filled</span><span class="sv" id="stfilled">${countSt("filled")}</span></div>
            <div class="sr"><span class="sk">Saved answers</span><span class="sv" id="stsaved">${countSt("answers_saved")}</span></div>
            <div class="sr"><span class="sk">Errors</span><span class="sv" id="sterrors" style="color:${countSt("error")>0?"#dc2626":""}">${countSt("error")}</span></div>
          </div>
          <div class="dr">
            <button class="gbtn" id="resetbtn">↺ Reset lesson</button>
            <button class="gbtn" id="clearqbtn">✕ Clear queue</button>
          </div>
          <div class="dr" style="margin-top:6px">
            <button class="gbtn blue" id="clearblanks">⌫ Clear all blanks</button>
          </div>
        </div>
        <div class="pane" id="pane-answers"><div id="answers-content"><div class="ano-answers">Navigate to an assessment to see answers.</div></div></div>
        <div class="pane" id="pane-settings">
          <div class="card">
            <div class="ct">Automation</div>
            ${[
              ["skipprompt",    "skipParsePrompt",   isSkipPrompt(),     "Skip parse prompt",  "Don't ask when summary answers are incomplete"],
              ["skipfillprompt","skipFillPrompt",     isSkipFillPrompt(), "Skip fill prompt",   "Don't ask when a fill answer fails on lesson page"],
              ["autofirst",     "autoFirstRun",       isAutoFirstRun(),   "Auto first run",     "Auto-navigate and submit unseen assessments"],
              ["silenthl",      "silentHighlight",    isSilentHL(),       "Silent highlight",   "Mark correct answers without auto-filling"],
              ["autoretry",     "autoRetry",          isAutoRetry(),      "Auto retry on short fill", "Clear blanks & re-fill in-place without reloading"],
            ].map(([id,,checked,lbl,dsc]) =>
              `<div class="setrow"><div><div class="setlbl">${lbl}</div><div class="setdsc">${dsc}</div></div><label class="tgl"><input type="checkbox" id="${id}" ${checked?"checked":""}><div class="ttr"><div class="tth"></div></div></label></div>`
            ).join("")}
            <div class="setrow" id="maxretriesrow" style="${isAutoRetry()?"":"display:none"}"><div><div class="setlbl">Max retries</div><div class="setdsc">How many times to retry before prompting</div></div><input id="maxretriesinp" type="number" min="1" max="10" value="${getMaxRetries()}" style="width:52px;padding:4px 6px;border-radius:6px;border:1px solid #e5e7eb;font-size:12px;text-align:center;font-family:inherit;outline:none"></div>
          </div>
          <div class="card">
            <div class="ct">Grade Target</div>
            <div class="setrow"><div><div class="setlbl">Enable grade range</div><div class="setdsc">Fill only enough to land randomly in your target range</div></div><label class="tgl"><input type="checkbox" id="gradetgl" ${isGradeTarget()?"checked":""}><div class="ttr"><div class="tth"></div></div></label></div>
            <div id="graderow" class="${isGradeTarget()?"visible":""}">
              <div class="grade-vals"><span class="grade-val" id="gminlbl">${getGradeMin()}%</span><span class="grade-dash">to</span><span class="grade-val" id="gmaxlbl">${getGradeMax()}%</span></div>
              <div class="grade-range-wrap" style="margin-top:8px">
                <div class="grade-track" id="gtrack">
                  <div class="grade-fill" id="gfill"></div>
                  <div class="grade-thumb" id="gthumb-min"></div>
                  <div class="grade-thumb" id="gthumb-max"></div>
                </div>
                <div class="grade-labels"><span>0%</span><span>50%</span><span>100%</span></div>
              </div>
              <div style="font-size:10px;color:#9ca3af;margin-top:6px;text-align:center">A random grade will be picked inside this range each fill</div>
            </div>
          </div>
          <div class="card"><div class="ct">About</div><div class="sr"><span class="sk">Version</span><span class="sv">v${VERSION}</span></div><div class="sr"><span class="sk">Report bugs to</span><span class="sv" style="color:#2563eb">${DISCORD} on Discord</span></div></div>
          <div class="card"><div class="ct">Data</div><div class="dr" style="margin-top:0"><button class="gbtn blue" id="exportbtn">↓ Export data</button><button class="gbtn" id="nukebtn">✕ Wipe all data</button></div></div>
        </div>
        <div class="pane" id="pane-logs">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#9ca3af">Recent activity</span><button class="gbtn" id="clrlogs" style="padding:4px 8px;font-size:10px;flex:none">Clear</button></div>
          <input id="lgsearch" type="text" placeholder="Filter logs…" autocomplete="off" spellcheck="false">
          <div id="logslist"></div>
        </div>
      </div>`;

    const pos = getJ(K.POS);
    if (pos) { panel.style.left=pos.x+"px"; panel.style.top=pos.y+"px"; panel.style.right="unset"; panel.style.bottom="unset"; }
    else { panel.style.bottom="20px"; panel.style.right="20px"; }
    _shadowRoot.appendChild(panel);
    updateDot(); refreshLogs(); refreshAnswersPane();

    // Minimize/expand
    const doMin = () => {
      if (panel.classList.contains("minimized")||panel.classList.contains("is-minimizing")) return;
      panel.classList.add("is-minimizing");
      setTimeout(() => { panel.classList.add("minimized"); panel.classList.remove("is-minimizing"); }, 130);
    };
    const doExp = () => {
      if (!panel.classList.contains("minimized")) return;
      panel.classList.add("is-expanding"); panel.classList.remove("minimized");
      setTimeout(() => panel.classList.remove("is-expanding"), 420);
    };
    _shadowRoot.getElementById("minbtn").addEventListener("click", e => { e.stopPropagation(); doMin(); });
    panel.addEventListener("click", () => { if (panel.classList.contains("minimized") && !_miniDragged) doExp(); });
    makeDraggable(panel, _shadowRoot.getElementById("hd"), false);
    makeDraggable(panel, panel, true);

    // Tabs
    _shadowRoot.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
      _shadowRoot.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      _shadowRoot.querySelectorAll(".pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      _shadowRoot.getElementById(`pane-${tab.dataset.tab}`)?.classList.add("active");
      if (tab.dataset.tab === "answers") refreshAnswersPane();
    }));

    // Auto toggle — keep autobig click and checkbox in sync
    const autobig   = _shadowRoot.getElementById("autobig");
    const autotgl   = _shadowRoot.getElementById("autotgl");
    const setAutoUI = on => {
      autobig.querySelector(".abl").textContent = on ? "Automation On"  : "Automation Off";
      autobig.querySelector(".abs").textContent = on ? "Click to disable" : "Click to enable";
      autobig.classList.toggle("off", !on); updateDot();
    };
    autobig.addEventListener("click", () => {
      const on = !isAutoOn(); saveSettings({ auto: on }); autotgl.checked = on; setAutoUI(on);
      Toast.info(on ? "Automation enabled" : "Automation disabled");
    });
    autotgl.addEventListener("change", e => { saveSettings({ auto: e.target.checked }); setAutoUI(e.target.checked); });

    // Settings toggles
    const settingMap = {
      skipprompt:    "skipParsePrompt",
      skipfillprompt:"skipFillPrompt",
      autofirst:     "autoFirstRun",
    };
    Object.entries(settingMap).forEach(([id, key]) => {
      _shadowRoot.getElementById(id).addEventListener("change", e => saveSettings({ [key]: e.target.checked }));
    });
    _shadowRoot.getElementById("silenthl").addEventListener("change", e => {
      saveSettings({ silentHighlight: e.target.checked });
      if (e.target.checked) { applySilentHL(); startHLObserver(); }
      else { clearSilentHL(); stopHLObserver(); }
    });
    _shadowRoot.getElementById("autoretry").addEventListener("change", e => {
      saveSettings({ autoRetry: e.target.checked });
      const row = _shadowRoot.getElementById("maxretriesrow");
      if (row) row.style.display = e.target.checked ? "" : "none";
    });
    _shadowRoot.getElementById("maxretriesinp").addEventListener("change", e => {
      const v = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 3));
      e.target.value = v;
      saveSettings({ maxRetries: v });
    });

    // Grade target toggle + dual-thumb range slider
    const gradeRow   = _shadowRoot.getElementById("graderow");
    const gminLbl    = _shadowRoot.getElementById("gminlbl");
    const gmaxLbl    = _shadowRoot.getElementById("gmaxlbl");
    const gtrack     = _shadowRoot.getElementById("gtrack");
    const gfill      = _shadowRoot.getElementById("gfill");
    const gthumbMin  = _shadowRoot.getElementById("gthumb-min");
    const gthumbMax  = _shadowRoot.getElementById("gthumb-max");

    function updateGradeSliderUI() {
      const mn=getGradeMin(), mx=getGradeMax();
      const pMin=mn, pMax=mx;
      gfill.style.left=pMin+"%"; gfill.style.width=(pMax-pMin)+"%";
      gthumbMin.style.left=pMin+"%"; gthumbMax.style.left=pMax+"%";
      gminLbl.textContent=mn+"%"; gmaxLbl.textContent=mx+"%";
    }
    updateGradeSliderUI();

    _shadowRoot.getElementById("gradetgl").addEventListener("change", e => {
      saveSettings({ gradeTarget: e.target.checked });
      gradeRow.classList.toggle("visible", e.target.checked);
      refreshPredictedGrade();
    });

    // Dual thumb drag logic
    function makeThumbDraggable(thumb, isMin) {
      let dragging=false;
      thumb.addEventListener("mousedown", e => { dragging=true; e.preventDefault(); });
      document.addEventListener("mousemove", e => {
        if (!dragging) return;
        const rect=gtrack.getBoundingClientRect();
        let pct=Math.round(Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100)));
        const mn=getGradeMin(), mx=getGradeMax();
        if (isMin) { const v=Math.min(pct, mx-1); saveSettings({gradeMin:v}); }
        else       { const v=Math.max(pct, mn+1); saveSettings({gradeMax:v}); }
        updateGradeSliderUI(); refreshPredictedGrade();
      });
      document.addEventListener("mouseup", () => { dragging=false; });
    }
    makeThumbDraggable(gthumbMin, true);
    makeThumbDraggable(gthumbMax, false);

    // Buttons
    _shadowRoot.getElementById("resetbtn").addEventListener("click", () => {
      const id = getLID(); if (!id) return;
      const l = getLessons(); delete l[id]; saveLessons(l);
      const a = getAnswers(); delete a[id]; saveAnswers(a);
      refreshPanelStatus(); refreshPredictedGrade(); Toast.warn(`Reset ${id}`);
    });
    _shadowRoot.getElementById("clearqbtn").addEventListener("click", () => { clearQueue(); clearPending(); refreshPanelStatus(); Toast.warn("Queue cleared"); });
    _shadowRoot.getElementById("clearblanks").addEventListener("click", async () => {
      Toast.info("Clearing all pages…", 3000);
      await clearAllBlanks();
      Toast.warn("All blanks cleared");
    });
    _shadowRoot.getElementById("clrlogs").addEventListener("click",   () => { setJ(K.LOGS,[]); refreshLogs(); });
    _shadowRoot.getElementById("lgsearch").addEventListener("input",  () => refreshLogs());
    _shadowRoot.getElementById("exportbtn").addEventListener("click", () => {
      const data = { lessons:getLessons(), answers:getAnswers(), settings:getSettings(), queue:getQueue(), exported:new Date().toISOString() };
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], { type:"application/json" }));
      a.download = `cev-data-${Date.now()}.json`; a.click();
      Toast.ok("Data exported");
    });
    _shadowRoot.getElementById("nukebtn").addEventListener("click", () => {
      if (!confirm("Wipe ALL CEV data? This cannot be undone.")) return;
      GM_listValues().forEach(k => GM_deleteValue(k));
      Toast.warn("All data wiped. Reload to reinitialize.");
    });
  }

  // ── Clear All Blanks ──────────────────────────────────────────────────
  function clearAllBlanks() {
    // Reset all dropdown selects to blank/first option
    $all("select").forEach(sel => {
      if (sel.selectedIndex > 0) { sel.selectedIndex = 0; fireEvents(sel, "change", "input"); }
    });
    // Clear text inputs and textareas
    $all("input[type=text], textarea").forEach(inp => {
      if (inp.value) { inp.value = ""; fireEvents(inp, "input", "change"); }
    });
    // Uncheck any selected radio buttons
    $all("input[type=radio]:checked").forEach(inp => {
      inp.checked = false; fireEvents(inp, "change");
    });
    // Unpress token highlights
    $all(".lrn_token[aria-pressed='true']").forEach(t => t.click());

    // ── Drag-and-drop clearing ──────────────────────────────────────────
    // iCEV's drag-drop is a two-step interaction:
    //   Step 1: click the placed draggable → sets aria-pressed="true" (selects it)
    //   Step 2: click the lrn_possibilityList → returns it to the pool
    //
    // Background page items (lrn_invisible / aria-hidden) can't be clicked via
    // the normal event path, so we clear those by directly removing the placed
    // element and reinserting it into the possibility list container.
    //
    // We scan ALL learnosity-item containers, not just the visible one.

    $all(".learnosity-item, .lrn_widget[id]").forEach(container => {
      // Find every drop zone in this widget/page
      const dropzones = $all(".lrn_response_container.lrn_dropzone, .lrn_assoc_col2.lrn_dragdrop", container);
      const pool = $one(".lrn_possibilityList", container);

      dropzones.forEach(dz => {
        // Snapshot children — DOM mutates as we move elements
        const placed = Array.from(dz.querySelectorAll(".lrn_btn_drag, .lrn_draggable"))
          .filter(el => !el.closest(".lrn_possibilityList"));
        if (!placed.length) return;

        const isHidden = dz.classList.contains("lrn_invisible") ||
                         dz.getAttribute("aria-hidden") === "true" ||
                         container.classList.contains("lrn_invisible");

        placed.forEach(drag => {
          if (isHidden || !pool) {
            // Background page or no pool ref: move the element directly
            // Reset its aria/state attrs to match the pool's resting state
            drag.setAttribute("aria-pressed", "false");
            drag.classList.remove("lrn_active", "lrn_selected", "lrn-dragdrop-selected");
            if (pool) {
              pool.appendChild(drag);
            } else {
              // No pool visible — just reset the drop zone empty marker
              dz.classList.add("lrn-dragdrop-empty");
              try { drag.remove(); } catch {}
            }
            fireEvents(dz, "change", "input");
          } else {
            // Visible page: use iCEV's two-step click protocol
            // Step 1: click the draggable to select it (aria-pressed → true)
            drag.click();
            // Step 2: click the pool to return it
            if (pool) pool.click();
          }
        });
      });
    });

    // Order widgets: select each placed item then click ← arrow to send back
    $all(".lrn_target .lrn_draggable, .lrn_sortlist_target .lrn_draggable").forEach(item => {
      try {
        item.click();
        const arrowLeft = item.closest(".lrn_widget")?.querySelector(".lrn_arrow_left");
        if (arrowLeft) arrowLeft.click();
      } catch {}
    });

    logInfo("All blanks cleared");
  }

  // ── Answers Pane ──────────────────────────────────────────────────────
  function refreshAnswersPane() {
    if (!_shadowRoot) return;
    const el = _shadowRoot.getElementById("answers-content"); if (!el) return;
    const lid = getLID();
    if (!lid || !hasAnswers(lid)) {
      el.innerHTML = `<div class="ano-answers">${lid ? "No saved answers for this lesson yet." : "Navigate to an assessment to see answers."}</div>`;
      return;
    }

    const { qaMap } = getQAMap(lid);
    const TYPE_LABELS = { choice:"Multiple Choice", text:"Short Answer", dropdown:"Fill in the Blank", order:"Ordering", token:"Highlight", matrix:"Matrix", cloze:"Drag & Drop", assoc:"Matching", imagecloze:"Image Blanks" };

    // Build live widget stimulus→widget map for MCQ option rendering
    const liveByStim = {};
    $all(".lrn_widget[id]").forEach(w => {
      const std = $one(".lrn_stimulus_content",w); if (!std) return;
      const s = trim(std); if (s) liveByStim[s] = w;
    });

    const blocks = [];
    let num = 0;
    const renderedKeys = new Set();

    Object.entries(qaMap).forEach(([k, q]) => {
      if (!q || typeof q !== "object") return;
      if (k === "imageCloze") return;
      renderedKeys.add(k); num++;
      blocks.push(renderEntry(k, q, num));
    });

    // Legacy: qaMap.imageCloze stored by URL — only render URLs not already covered by a
    // main qaMap entry with type "imagecloze" (avoid double-counting each imagecloze question)
    const renderedImageClozeAnswers = new Set(
      Object.values(qaMap)
        .filter(q => q?.type === "imagecloze")
        .map(q => JSON.stringify(q.answers))
    );
    if (qaMap.imageCloze && typeof qaMap.imageCloze === "object" && !qaMap.imageCloze.type) {
      Object.entries(qaMap.imageCloze).forEach(([url, q]) => {
        if (!q?.answers) return;
        if (renderedImageClozeAnswers.has(JSON.stringify(q.answers))) return; // already shown above
        num++; blocks.push(renderEntry(url, q, num));
      });
    }

    function renderEntry(key, q, n) {
      const isURL  = /^\/\/|^https?:\/\//.test(key);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(key);
      let shortQ;
      if (isURL) {
        shortQ = "Image cloze";
      } else if (q.type === "assoc") {
        if (!key || key === "assoc" || isUUID) {
          // _stim: original stimulus saved by parser when dedup occurred (new parses).
          // Fallback: scan qaMap for any non-UUID assoc entry — its key IS the shared stimulus text.
          const rawStim = q._stim
            || Object.keys(qaMap).find(k =>
                qaMap[k]?.type === "assoc" && k !== "assoc"
                && !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(k))
            || "";
          if (rawStim) {
            const ni = rawStim.indexOf("NOTE");
            const r = (ni > 2 ? rawStim.slice(0, ni) : rawStim).trim().replace(/[.\s]+$/, "");
            shortQ = r.length > 2 ? (r.length > 120 ? r.slice(0, 120) + "\u2026" : r) : "Matching";
          } else {
            const firstRow = q.rowOrder?.[0] || Object.keys(q.answers || {})[0] || "";
            shortQ = firstRow ? (firstRow.length > 100 ? firstRow.slice(0, 100) + "\u2026" : firstRow) : "Matching";
          }
        } else {
          // key IS the full stimulus text stored at parse time.
          // Strip iCEV boilerplate starting at "NOTE".
          const noteIdx = key.indexOf("NOTE");
          const raw = (noteIdx > 2 ? key.slice(0, noteIdx) : key).trim().replace(/[.\s]+$/, "");
          shortQ = raw.length > 2 ? (raw.length > 120 ? raw.slice(0, 120) + "\u2026" : raw) : "Matching";
        }
      } else if (isUUID) {
        shortQ = "(question text unavailable)";
      } else {
        shortQ = key.length > 120 ? key.slice(0, 120) + "\u2026" : key;
      }
      const tl = TYPE_LABELS[q.type] ?? q.type;
      let inner = "";

      switch (q.type) {
        case "choice": {
          const w = liveByStim[key];
          if (w) {
            $all("li.lrn-mcq-option",w).forEach(li => {
              const t = trim($one(".lrn_contentWrapper",li)||$one(".lrn-possible-answer",li)||li);
              inner += `<div class="aopt${mathLite(t)===mathLite(q.answer)?" correct":""}"><div class="aopt-radio"></div><span>${t}</span></div>`;
            });
          } else {
            inner = `<div class="aopt correct"><div class="aopt-radio"></div><span>${q.answer}</span></div>`;
          }
          break;
        }
        case "text":
          inner = `<div class="atxt">✎ ${q.answer}</div>`; break;
        case "dropdown": case "imagecloze":
          inner = q.answers.map((a,i) =>
            `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:10px;color:#9ca3af;min-width:50px">Blank ${i+1}:</span>${a?`<span class="adrop">${stripAnswerPrefix(a)}</span>`:`<span style="font-size:10px;color:#f87171;font-style:italic">missing — re-parse</span>`}</div>`
          ).join(""); break;
        case "order":
          inner = `<div style="font-size:10px;color:#9ca3af;margin-bottom:4px">Drag into this order:</div><ol class="aorder">${q.items.map((t,i)=>`<li data-n="${i+1}">${t}</li>`).join("")}</ol>`; break;
        case "token":
          inner = `<div style="font-size:10px;color:#9ca3af;margin-bottom:4px">Highlight these:</div><div class="atokens">${q.answers.map(a=>`<span class="atoken">${a}</span>`).join("")}</div>`; break;
        case "cloze":
          inner = Object.entries(q.answers).sort((a,b)=>+a[0]-+b[0]).map(([i,a])=>`<div class="adragzone">Blank ${+i+1}: ${a}</div>`).join(""); break;
        case "matrix":
          inner = Object.entries(q.answers).map(([k,v])=>`<div class="apair"><span class="apair-q">${k}</span><span class="apair-arrow">→</span><span class="apair-a">${v}</span></div>`).join(""); break;
        case "assoc": {
          const orderedKeys = q.rowOrder?.length ? q.rowOrder : Object.keys(q.answers);
          inner = orderedKeys.map(k => q.answers[k] ? `<div class="apair"><span class="apair-q">${k}</span><span class="apair-arrow">→</span><span class="apair-a">${q.answers[k]}</span></div>` : "").join(""); break;
        }
        default:
          inner = `<div class="atxt">${JSON.stringify(q).slice(0,100)}</div>`;
      }

      return `<div class="aqblock"><div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#2563eb;color:white;font-size:10px;font-weight:700;flex-shrink:0">${n}</span><div class="aqtype" style="margin-bottom:0">${tl}</div></div><div class="aqq">${shortQ}</div>${inner}</div>`;
    }

    el.innerHTML = blocks.length ? blocks.join("") : `<div class="ano-answers">No parseable answers in store.</div>`;
  }

  // ── Silent Highlight ──────────────────────────────────────────────────
  const HL_ATTR = "data-x-hl";

  function ensureHLStyles() {
    if (document.getElementById("cev-hl-styles")) return;
    const s = document.createElement("style"); s.id = "cev-hl-styles";
    s.textContent = `
      @keyframes cev-pulse        { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.25)}  50%{box-shadow:0 0 0 4px rgba(34,197,94,0.12)} }
      @keyframes cev-pulse-purple { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.25)} 50%{box-shadow:0 0 0 4px rgba(139,92,246,0.12)} }
      @keyframes cev-pulse-amber  { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.25)} 50%{box-shadow:0 0 0 4px rgba(245,158,11,0.12)} }
      .cev-hl-choice { background:linear-gradient(135deg,rgba(240,253,244,0.95),rgba(220,252,231,0.85))!important; outline:1.5px solid rgba(34,197,94,0.55)!important; outline-offset:1px!important; border-radius:8px!important; animation:cev-pulse 2.8s ease-in-out infinite; }
      .cev-hl-token  { background:linear-gradient(135deg,rgba(254,252,232,0.95),rgba(254,249,195,0.85))!important; outline:1.5px solid rgba(234,179,8,0.55)!important;  outline-offset:1px!important; border-radius:4px!important; animation:cev-pulse-amber 2.8s ease-in-out infinite; }
      .cev-hl-matrix { background:linear-gradient(135deg,rgba(240,253,244,0.9),rgba(220,252,231,0.75))!important;  outline:1.5px solid rgba(34,197,94,0.45)!important;  outline-offset:-1px!important; border-radius:6px!important; }
      .cev-hl-text   { background:rgba(240,253,244,0.7)!important; outline:1.5px solid rgba(34,197,94,0.5)!important; outline-offset:1px!important; border-radius:6px!important; animation:cev-pulse 3s ease-in-out infinite; }
      .cev-hl-select { background:rgba(240,253,244,0.8)!important; outline:1.5px solid rgba(34,197,94,0.5)!important; outline-offset:1px!important; border-radius:5px!important; }
      .cev-hl-order  { background:white!important; border:1.5px solid rgba(139,92,246,0.45)!important; border-radius:8px!important; box-shadow:0 1px 6px rgba(139,92,246,0.15),0 2px 12px rgba(139,92,246,0.08)!important; color:#374151!important; transition:box-shadow .15s,border-color .15s!important; }
      .cev-hl-order:hover { border-color:rgba(139,92,246,0.7)!important; box-shadow:0 2px 10px rgba(139,92,246,0.25)!important; }
      .cev-assoc-src  { border:1.5px solid rgba(34,197,94,0.55)!important; border-radius:8px!important; transition:border-color .15s!important; }
      .cev-assoc-src:hover,.cev-assoc-src:focus,.cev-assoc-src.lrn_active,.cev-assoc-src[aria-pressed="true"] { border-color:rgba(34,197,94,0.9)!important; }
      .cev-dnd-zone  { outline:2px dashed rgba(34,197,94,0.6)!important; outline-offset:2px!important; border-radius:6px!important; background:rgba(240,253,244,0.35)!important; transition:background .2s; }
      .cev-dnd-zone:hover { background:rgba(240,253,244,0.6)!important; }
      /* Chips are now inline spans injected into the DOM flow — not absolute */
      .cev-dnd-chip  { display:inline-block!important; background:linear-gradient(135deg,#16a34a,#15803d)!important; color:white!important; font-size:10px!important; font-weight:700!important; font-family:-apple-system,'DM Sans',sans-serif!important; white-space:nowrap!important; padding:2px 8px!important; border-radius:20px!important; box-shadow:0 1px 4px rgba(0,0,0,0.18)!important; pointer-events:none!important; z-index:9999!important; letter-spacing:.01em!important; max-width:200px!important; overflow:hidden!important; text-overflow:ellipsis!important; line-height:1.5!important; vertical-align:middle!important; margin-left:6px!important; }
      .cev-assoc-zone  { outline:1px dashed rgba(37,99,235,0.25)!important; border-radius:6px!important; transition:outline-color .2s,background .2s; }
      .cev-assoc-zone.cev-assoc-active { outline:1px dashed rgba(34,197,94,0.6)!important; background:rgba(240,253,244,0.2)!important; }
      .cev-wrong-item .lrn_item { color:#dc2626!important; font-weight:inherit!important; }
      #cev-connector-svg { position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998;overflow:visible; }
      /* Draggable — minimal cursor hint only; no background/transform overrides so iCEV drag-ghost renders cleanly */
      .lrn_btn_drag.cev-assoc-src, .lrn_draggable.cev-assoc-src { cursor:grab!important; }
      .lrn_btn_drag.cev-assoc-src:active, .lrn_draggable.cev-assoc-src.lrn_active,
      .lrn_btn_drag.cev-assoc-src[aria-pressed="true"], .lrn_draggable.cev-assoc-src[aria-pressed="true"] { cursor:grabbing!important; }
      .lrn_btn_drag.cev-wrong-item, .lrn_draggable.cev-wrong-item { border-color:#fca5a5!important; background:rgba(254,226,226,0.4)!important; }
      /* Order: number badge injected as inline sibling after the item text */
      .cev-order-badge { display:inline-flex!important; align-items:center!important; justify-content:center!important; margin-left:6px!important; background:linear-gradient(135deg,#7c3aed,#6d28d9)!important; color:white!important; font-size:9px!important; font-weight:700!important; font-family:-apple-system,'DM Sans',sans-serif!important; width:18px!important; height:18px!important; border-radius:50%!important; box-shadow:0 1px 3px rgba(0,0,0,0.2)!important; pointer-events:none!important; vertical-align:middle!important; flex-shrink:0!important; }
      /* Cloze zone label — shown as a block below the zone so it can't be clipped */
      .cev-cloze-label { display:block!important; margin-top:4px!important; background:linear-gradient(135deg,#16a34a,#15803d)!important; color:white!important; font-size:10px!important; font-weight:700!important; font-family:-apple-system,'DM Sans',sans-serif!important; padding:2px 8px!important; border-radius:6px!important; text-align:center!important; pointer-events:none!important; line-height:1.5!important; white-space:nowrap!important; overflow:hidden!important; text-overflow:ellipsis!important; }
    `;
    document.head.appendChild(s);
  }

  const HL_CLASSES = ["cev-hl-choice","cev-hl-token","cev-hl-matrix","cev-hl-text","cev-hl-select","cev-hl-order","cev-dnd-zone","cev-assoc-zone"];

  function clearSilentHL() {
    document.querySelectorAll(".cev-dnd-chip,.cev-cloze-label,.cev-assoc-inline,.cev-order-badge").forEach(el => el.remove());
    document.querySelectorAll(HL_CLASSES.join(",")).forEach(el => el.classList.remove(...HL_CLASSES));
    document.querySelectorAll(".cev-wrong-item").forEach(el => el.classList.remove("cev-wrong-item"));
    document.querySelectorAll(".cev-assoc-active").forEach(el => el.classList.remove("cev-assoc-active"));
    // Remove connector SVG entirely
    document.getElementById("cev-connector-svg")?.remove();
    // Clean up per-draggable state
    document.querySelectorAll(".cev-assoc-src").forEach(el => {
      if (el._cevConnectorGroup) { el._cevConnectorGroup.remove(); delete el._cevConnectorGroup; }
      if (el._cevAttrObs) { el._cevAttrObs.disconnect(); delete el._cevAttrObs; }
      delete el._cevTargetZone;
      delete el._cevConnected;
      el.classList.remove("cev-assoc-src");
    });
    document.querySelectorAll("[data-cev-correct]").forEach(el => {
      if (el._cevObserver) { el._cevObserver.disconnect(); delete el._cevObserver; }
      delete el.dataset.cevCorrect;
    });
    document.querySelectorAll(`[${HL_ATTR}]`).forEach(el => {
      el.style.cssText = el.getAttribute("data-x-hl-orig") || "";
      el.removeAttribute(HL_ATTR); el.removeAttribute("data-x-hl-orig");
    });
  }

  function applySilentHL() {
    ensureHLStyles(); clearSilentHL();
    const lid = getLID(); if (!lid || !hasAnswers(lid)) return;
    const { qaMap, stimToId={} } = getQAMap(lid);

    // Inject an inline pill badge AFTER a target element (never absolute — can't be clipped)
    function inlineChip(afterEl, text, cls) {
      if (!afterEl || afterEl.querySelector(`.${cls}`)) return;
      const chip = document.createElement("span");
      chip.className = cls; chip.textContent = text;
      afterEl.appendChild(chip);
    }

    // Inject a block label AFTER a target element (for drop zones where inline doesn't fit)
    function blockLabel(afterEl, text) {
      if (!afterEl || afterEl.nextElementSibling?.classList.contains("cev-cloze-label")) return;
      const lbl = document.createElement("span");
      lbl.className = "cev-cloze-label"; lbl.textContent = "→ " + text;
      afterEl.insertAdjacentElement("afterend", lbl);
    }

    const hlSelect = (sel, ans) => {
      sel.classList.add("cev-hl-select");
      Array.from(sel.options).forEach(o => { if (o.textContent.trim() === ans) o.style.cssText = "color:#15803d;font-weight:700;background:#f0fdf4"; });
    };

    $all(".lrn_widget[id]").forEach(w => {
      const stimulus = trim($one(".lrn_stimulus_content",w));
      let q = null;

      if (stimulus) {
        if (qaMap[stimulus] !== undefined && stimToId[stimulus] === w.id) q = qaMap[stimulus];
        else if (qaMap[w.id] !== undefined) q = qaMap[w.id];
        else if (qaMap[stimulus] !== undefined && stimToId[stimulus] === undefined) q = qaMap[stimulus];
        // Normalized fallback
        if (!q) {
          const normStim = cleanSpaces(stimulus);
          const matchKey = Object.keys(qaMap).find(k => k !== "imageCloze" && cleanSpaces(k) === normStim);
          if (matchKey) q = qaMap[matchKey];
        }
      } else {
        // No stimulus — try widget id directly (assoc widgets often have no stimulus_content)
        if (qaMap[w.id] !== undefined) q = qaMap[w.id];
      }

      // Assoc fallback: match by row question text against every stored assoc entry
      // (handles cases where widget id differs between summary parse and live page)
      if (!q || q.type !== "assoc") {
        const isAssocWidget = w.classList.contains("lrn_association") || w.classList.contains("lrn_assoc") || !!$one(".lrn_assoc_row",w);
        if (isAssocWidget) {
          const rowTexts = $all(".lrn_assoc_question,.lrn_stem_label",w).map(el => trim(el)).filter(Boolean);
          if (rowTexts.length) {
            const allAssoc = Object.values(qaMap).filter(v => v?.type === "assoc");
            const matched = allAssoc.find(entry => rowTexts.some(rt => entry.answers && rt in entry.answers));
            if (matched) q = matched;
          }
        }
      }

      if (!q) return;

      switch (q.type) {
        case "choice":
          $all("li.lrn-mcq-option",w).forEach(li => {
            if (mathLite(trim($one(".lrn_contentWrapper",li)||$one(".lrn-possible-answer",li)||li)) === mathLite(q.answer))
              li.classList.add("cev-hl-choice");
          }); break;

        case "token":
          $all(".lrn_token",w).forEach(t => {
            if (q.answers.some(a => mathLite(a) === mathLite(trim($one("span",t)||t)))) t.classList.add("cev-hl-token");
          }); break;

        case "matrix":
          $all("tr.lrn_stem",w).forEach(row => {
            const stmt = trim($one("th .lrn-stem-text,th .lrn_stem_label,th",row)), ans = q.answers[stmt]; if (!ans) return;
            $all("td.lrn_option,td[role='radio']",row).forEach(td => {
              if (mathLite(trim($one("label .lrn_option_text,label",td))) === mathLite(ans)) td.classList.add("cev-hl-matrix");
            });
          }); break;

        case "dropdown":
        case "imagecloze":
          $all(q.type === "dropdown" ? ".lrn_combobox" : ".lrn_imagecloze_response", w).forEach((el,i) => {
            const ans = stripAnswerPrefix(q.answers[i]); if (!ans) return;
            const sp = $one(".lrn_clozedropdown_answer",el), sel = $one("select",el);
            if (sp) { sp.classList.add("cev-hl-select"); inlineChip(sp.parentElement||sp, ans, "cev-dnd-chip"); }
            else if (sel) hlSelect(sel, ans);
          }); break;

        case "cloze": {
          // Highlight source draggables that are used
          const usedAnswers = new Set(Object.values(q.answers).map(a => mathLite(a)));
          $all(".lrn_btn_drag,.lrn_draggable",w).forEach(el => {
            const t = mathLite(trim($one(".lrn_item",el)||el));
            if (usedAnswers.has(t)) el.classList.add("cev-hl-order");
          });
          // For each drop zone, outline it and inject a visible block label below it
          Object.entries(q.answers).sort((a,b)=>+a[0]-+b[0]).forEach(([idx, ans]) => {
            const zones = $all(".lrn_response_container,.lrn_dropzone",w);
            const zone = zones.find(d => d.dataset.inputid === String(idx)) || zones[parseInt(idx,10)];
            if (!zone) return;
            zone.classList.add("cev-dnd-zone");
            blockLabel(zone, ans);
          }); break;
        }

        case "assoc": {
          $all(".lrn_assoc_row",w).forEach(row => {
            const question = trim($one(".lrn_assoc_question,.lrn_stem_label",row));
            const answer   = q.answers[question]; if (!answer) return;
            const dz       = $one(".lrn_response_container,.lrn_dropzone",row); if (!dz) return;
            dz.classList.add("cev-assoc-zone");
            dz.dataset.cevCorrect = answer;

            // Search the whole document for the pool draggable matching this answer
            // iCEV often puts the possibility list outside the widget element entirely
            const normAnswer = mathLite(answer);
            const poolEl = $all(".lrn_btn_drag,.lrn_draggable")
              .filter(el => !el._cevTargetZone && !el.closest(".lrn_response_container,.lrn_dropzone"))
              .find(el => mathLite(trim($one(".lrn_item",el)||el)) === normAnswer);
            if (poolEl) {
              poolEl._cevTargetZone = dz;
              poolEl.classList.add("cev-assoc-src");
            }

            // Wrong-item detection — childList only, no subtree
            if (!dz._cevObserver) {
              const syncWrong = () => {
                const placed = $one(".lrn_btn_drag,.lrn_draggable", dz);
                if (placed) {
                  const correct = mathLite(trim($one(".lrn_item",placed)||placed)) === mathLite(dz.dataset.cevCorrect);
                  placed.classList.toggle("cev-wrong-item", !correct);
                }
              };
              dz._cevObserver = new MutationObserver(syncWrong);
              dz._cevObserver.observe(dz, { childList: true });
              syncWrong();
            }
          });

          ensureConnectorSVG();
          $all(".cev-assoc-src").forEach(el => {
            if (el._cevConnected) return;
            el._cevConnected = true;
            let _hideTimer = null, _isDragging = false;

            const cancelHide = () => { if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; } };
            const show = () => { cancelHide(); drawConnector(el); };
            const schedHide = () => {
              cancelHide();
              _hideTimer = setTimeout(() => { if (!_isDragging) clearConnector(el); _hideTimer = null; }, 90);
            };

            el.addEventListener("mouseenter", show);
            el.addEventListener("mouseleave", e => {
              // Ignore if cursor moved into a child element (e.g. .lrn_item span)
              if (el.contains(e.relatedTarget)) return;
              // Ignore if button is currently pressed/selected
              if (_isDragging) return;
              schedHide();
            });

            // pointerdown is the most reliable press signal — fires before iCEV's own handlers
            // rAF lets iCEV finish any synchronous DOM work (hide, move, blur) before we measure
            el.addEventListener("pointerdown", () => {
              _isDragging = true; cancelHide();
              requestAnimationFrame(() => { if (_isDragging) show(); });
            });
            el.addEventListener("pointerup",     () => { _isDragging = false; schedHide(); });
            el.addEventListener("pointercancel", () => { _isDragging = false; schedHide(); });

            el.addEventListener("touchstart", show, { passive: true });
            el.addEventListener("touchend",   schedHide, { passive: true });
            el.addEventListener("focus",      show);
            el.addEventListener("blur",       () => { if (!_isDragging) schedHide(); });

            // MutationObserver as backup: when iCEV sets aria-pressed="true" via keyboard or
            // programmatic selection, draw the connector after layout settles (rAF)
            const attrObs = new MutationObserver(() => {
              const pressed = el.getAttribute("aria-pressed") === "true";
              if (pressed) {
                _isDragging = true; cancelHide();
                // rAF so iCEV's synchronous layout changes finish before getBoundingClientRect
                requestAnimationFrame(() => { if (_isDragging) show(); });
              } else {
                _isDragging = false; schedHide();
              }
            });
            attrObs.observe(el, { attributes: true, attributeFilter: ["aria-pressed"] });
            el._cevAttrObs = attrObs;

            // Already pressed on attach (e.g. re-apply ran mid-interaction)
            if (el.getAttribute("aria-pressed") === "true") {
              _isDragging = true; requestAnimationFrame(() => { if (_isDragging) show(); });
            }
          });
          break;
        }

        case "text": {
          const inp = $one("input[type=text],textarea",w); if (inp) inp.classList.add("cev-hl-text"); break;
        }

        case "order":
          // Append numbered badge inline after each source item's label text
          $all(".lrn_source .lrn_draggable,.lrn_possibilityList .lrn_btn_drag",w).forEach(el => {
            const labelEl = $one(".lrn_item",el) || el;
            const t = mathLite(trim(labelEl));
            const pos = q.items.findIndex(item => mathLite(item) === t); if (pos === -1) return;
            el.classList.add("cev-hl-order");
            if (!el.querySelector(".cev-order-badge")) {
              const badge = document.createElement("span");
              badge.className = "cev-order-badge"; badge.textContent = String(pos+1);
              labelEl.appendChild(badge);
            }
          }); break;
      }
    });

    // imageCloze containers by image URL (standalone / legacy)
    const icMap = {};
    if (qaMap.imageCloze) {
      if (qaMap.imageCloze.type === "imagecloze") icMap["__d__"] = qaMap.imageCloze.answers;
      else Object.entries(qaMap.imageCloze).forEach(([u,d]) => { if (d?.answers) icMap[u] = d.answers; });
    }
    Object.entries(qaMap).forEach(([k,v]) => { if (v?.type === "imagecloze" && v.answers) icMap[k] = v.answers; });

    $all(".lrn_imagecloze_container").forEach((c,ci) => {
      const img = $one("img.lrn_imagecloze_image,img",c);
      const url = img ? img.src.replace(/^https?:/,"").split("?")[0] : null;
      const answers = url ? (icMap[url]||icMap["https:"+url]||icMap["http:"+url]||Object.values(icMap)[ci]) : Object.values(icMap)[ci];
      if (!answers) return;
      $all(".lrn_imagecloze_response",c).forEach((r,i) => {
        const ans = stripAnswerPrefix(answers[i]); if (!ans) return;
        const sp = $one(".lrn_clozedropdown_answer",r), sel = $one("select",r);
        if (sp) { sp.classList.add("cev-hl-select"); inlineChip(sp.parentElement||sp, ans, "cev-dnd-chip"); }
        else if (sel) hlSelect(sel, ans);
      });
    });

    // Standalone cloze dropdowns fallback
    const ddData = Object.values(qaMap).filter(q => q.type === "dropdown");
    $all(".lrn_clozedropdown").forEach((c,qi) => {
      const qd = ddData[qi]; if (!qd) return;
      $all(".lrn_combobox",c).forEach((combo,i) => {
        const ans = stripAnswerPrefix(qd.answers[i]); if (!ans) return;
        const sp = $one(".lrn_clozedropdown_answer",combo), sel = $one("select",combo);
        if (sp) { sp.classList.add("cev-hl-select"); inlineChip(sp.parentElement||sp, ans, "cev-dnd-chip"); }
        else if (sel) hlSelect(sel, ans);
      });
    });

    // Restore any connector that was active before this re-apply ran
    // (covers the case where applySilentHL was triggered while the user had an element pressed)
    $all(".cev-assoc-src").forEach(el => {
      if (el.getAttribute("aria-pressed") === "true") drawConnector(el);
    });
  }

  // ── Assoc connector line helpers ──────────────────────────────────────
  function ensureConnectorSVG() {
    if (document.getElementById("cev-connector-svg")) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.id = "cev-connector-svg";
    svg.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998;overflow:visible;";
    document.body.appendChild(svg);
  }

  function drawConnector(srcEl) {
    const svg = document.getElementById("cev-connector-svg"); if (!svg) return;
    clearConnector(srcEl);
    if (srcEl.closest(".lrn_response_container,.lrn_dropzone")) return;

    const dz = srcEl._cevTargetZone; if (!dz) return;

    // Don't draw if the correct item is already correctly placed
    const placed = $one(".lrn_btn_drag,.lrn_draggable", dz);
    if (placed && mathLite(trim($one(".lrn_item",placed)||placed)) === mathLite(dz.dataset.cevCorrect)) return;

    const sr = srcEl.getBoundingClientRect();
    const dr = dz.getBoundingClientRect();

    // Right-centre of draggable → exact centre of drop zone
    const x1 = sr.right,            y1 = sr.top  + sr.height / 2;
    const x2 = dr.left + dr.width/2, y2 = dr.top + dr.height / 2;

    // Gentle perpendicular bow
    const dx = x2-x1, dy = y2-y1;
    const len = Math.sqrt(dx*dx+dy*dy) || 1;
    const bow = Math.min(40, len * 0.25);
    const cx = (x1+x2)/2 - (dy/len)*bow;
    const cy = (y1+y2)/2 + (dx/len)*bow;

    // True quadratic bezier midpoint t=0.5
    const mx = 0.25*x1 + 0.5*cx + 0.25*x2;
    const my = 0.25*y1 + 0.5*cy + 0.25*y2;

    const g = document.createElementNS("http://www.w3.org/2000/svg","g");

    // Dashed line
    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
    path.setAttribute("stroke","rgba(34,197,94,0.5)");
    path.setAttribute("stroke-width","1.5");
    path.setAttribute("fill","none");
    path.setAttribute("stroke-dasharray","4 3");
    path.setAttribute("stroke-linecap","round");
    g.appendChild(path);

    // Small arrowhead pointing into the drop zone centre
    const endAngle = Math.atan2(y2-cy, x2-cx);
    const al = 7, spread = 0.4;
    const ax1 = x2 - al*Math.cos(endAngle-spread), ay1 = y2 - al*Math.sin(endAngle-spread);
    const ax2 = x2 - al*Math.cos(endAngle+spread), ay2 = y2 - al*Math.sin(endAngle+spread);
    const arrow = document.createElementNS("http://www.w3.org/2000/svg","polyline");
    arrow.setAttribute("points",`${ax1},${ay1} ${x2},${y2} ${ax2},${ay2}`);
    arrow.setAttribute("stroke","rgba(34,197,94,0.65)");
    arrow.setAttribute("stroke-width","1.5"); arrow.setAttribute("fill","none"); arrow.setAttribute("stroke-linecap","round");
    g.appendChild(arrow);

    // Pill label at bezier midpoint
    const word = dz.dataset.cevCorrect || "";
    const pw = Math.max(word.length*6.5+18, 32), ph = 17;
    const prect = document.createElementNS("http://www.w3.org/2000/svg","rect");
    prect.setAttribute("x", mx-pw/2); prect.setAttribute("y", my-ph/2);
    prect.setAttribute("width", pw);  prect.setAttribute("height", ph);
    prect.setAttribute("rx", 9);      prect.setAttribute("fill","rgba(22,163,74,0.88)");
    g.appendChild(prect);

    const txt = document.createElementNS("http://www.w3.org/2000/svg","text");
    txt.setAttribute("x", mx); txt.setAttribute("y", my+4);
    txt.setAttribute("text-anchor","middle");
    txt.setAttribute("font-size","9"); txt.setAttribute("font-weight","700");
    txt.setAttribute("font-family","-apple-system,'DM Sans',sans-serif");
    txt.setAttribute("fill","white"); txt.setAttribute("pointer-events","none");
    txt.textContent = word;
    g.appendChild(txt);

    svg.appendChild(g);
    dz.classList.add("cev-assoc-active");
    srcEl._cevConnectorGroup = g;
  }

  function clearConnector(srcEl) {
    srcEl?._cevConnectorGroup?.remove();
    if (srcEl?._cevConnectorGroup) delete srcEl._cevConnectorGroup;
    srcEl?._cevTargetZone?.classList.remove("cev-assoc-active");
  }

  // Re-apply connector labels are in DOM-flow so re-run on lazy render
  // ── Re-apply highlights when iCEV lazy-renders new question widgets into the DOM
  let _hlObserver = null;
  function startHLObserver() {
    if (_hlObserver) return;
    let debounce = null;
    _hlObserver = new MutationObserver(mutations => {
      if (!isSilentHL() || !hasAnswers(getLID())) return;
      // Only re-apply when iCEV lazy-renders a new question widget — ignore all other DOM noise
      // (hover effects, tooltips, iCEV internal counters, etc.)
      const hasNewWidget = mutations.some(m =>
        Array.from(m.addedNodes).some(n =>
          n.nodeType === 1 && (n.matches?.(".lrn_widget") || n.querySelector?.(".lrn_widget"))
        )
      );
      if (!hasNewWidget) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        // Pause observer so our own DOM writes don't re-trigger this
        _hlObserver.disconnect();
        applySilentHL();
        _hlObserver.observe(document.body, { childList:true, subtree:true });
      }, 350);
    });
    _hlObserver.observe(document.body, { childList:true, subtree:true });
  }
  function stopHLObserver() {
    _hlObserver?.disconnect(); _hlObserver = null;
  }

  // ── Draggable ─────────────────────────────────────────────────────────
  function makeDraggable(panel, handle, miniMode) {
    let ox=0, oy=0, sx=0, sy=0, active=false;
    handle.addEventListener("mousedown", e => {
      if (miniMode !== panel.classList.contains("minimized")) return;
      if (!miniMode && e.target.closest(".hbtn")) return;
      active=true; _miniDragged=false;
      const r = panel.getBoundingClientRect(); sx=e.clientX; sy=e.clientY; ox=r.left; oy=r.top;
      panel.style.right="unset"; panel.style.bottom="unset"; panel.style.left=ox+"px"; panel.style.top=oy+"px";
      document.body.style.userSelect="none"; e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (!active) return;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      if (Math.abs(dx)>4||Math.abs(dy)>4) _miniDragged=true;
      const pw=miniMode?48:panel.offsetWidth, ph=miniMode?48:panel.offsetHeight;
      panel.style.left = Math.max(0, Math.min(window.innerWidth-pw,  ox+dx))+"px";
      panel.style.top  = Math.max(0, Math.min(window.innerHeight-ph, oy+dy))+"px";
    });
    document.addEventListener("mouseup", () => {
      if (!active) return; active=false; document.body.style.userSelect="";
      setJ(K.POS, { x:parseInt(panel.style.left), y:parseInt(panel.style.top) });
      setTimeout(() => { _miniDragged=false; }, 100);
    });
  }

  // ── Panel status refresh ───────────────────────────────────────────────
  function updateDot() {
    const dot = _shadowRoot?.getElementById("dot"); if (dot) dot.className = "dot"+(isAutoOn()?"":" off");
  }
  function refreshPanelStatus() {
    if (!_shadowRoot) return;
    const id=getLID(), s=id?getStatus(id):"unseen";
    const sb=_shadowRoot.getElementById("sbadge"); if (sb&&id) { sb.textContent=statusLabel(s); sb.className=`badge ${statusClass(s)}`; }
    const sc=id?getLessons()[id]?.score:null;
    const row=_shadowRoot.getElementById("scorerow"), val=_shadowRoot.getElementById("scoreval");
    if (row&&val) { row.style.display=sc?"":"none"; val.textContent=fmtScore(sc); }
    const lidEl=_shadowRoot.getElementById("lid"); if (lidEl) lidEl.textContent=id??"Not on assessment";
    const q=getQueue().length, qv=_shadowRoot.getElementById("qval"), qbar=_shadowRoot.getElementById("qbar");
    if (qv) qv.textContent=`${q} assessment${q!==1?"s":""}`;
    if (qbar) qbar.style.width=`${Math.min(q*10,100)}%`;
    const sf=_shadowRoot.getElementById("stfilled"), ss=_shadowRoot.getElementById("stsaved"), se=_shadowRoot.getElementById("sterrors");
    if (sf) sf.textContent=countSt("filled");
    if (ss) ss.textContent=countSt("answers_saved");
    if (se) { const ec=countSt("error"); se.textContent=ec; se.style.color=ec>0?"#dc2626":""; }
    updateDot();
    refreshPredictedGrade();
  }

  // Shows the rolling grade target in the info pane when grade mode is on and we're on a lesson
  function refreshPredictedGrade() {
    if (!_shadowRoot) return;
    const el=_shadowRoot.getElementById("predrow"), val=_shadowRoot.getElementById("predval"); if (!el||!val) return;
    if (!isGradeTarget()) { el.style.display="none"; return; }
    const lid=getLID(); if (!lid) { el.style.display="none"; return; }
    const stored=getLessons()[lid]?.gradeTarget;
    if (stored) { val.textContent=`${stored}% target`; el.style.display="flex"; }
    else { val.textContent=`${getGradeMin()}–${getGradeMax()}% range`; el.style.display="flex"; }
  }

  function refreshLogs() {
    if (!_shadowRoot) return;
    const el = _shadowRoot.getElementById("logslist"); if (!el) return;
    const query = (_shadowRoot.getElementById("lgsearch")?.value||"").trim().toLowerCase();
    const logs = (getJ(K.LOGS)||[]).slice().reverse();
    if (!logs.length) { el.innerHTML=`<div style="color:#9ca3af;font-size:11px;text-align:center;padding:12px">No logs yet</div>`; return; }
    const hl = (t,q) => !q ? t : t.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"gi"),"<mark>$1</mark>");
    const filtered = query ? logs.filter(l => l.msg.toLowerCase().includes(query)||(l.data||"").toLowerCase().includes(query)) : logs;
    if (!filtered.length) { el.innerHTML=`<div style="color:#9ca3af;font-size:11px;text-align:center;padding:12px">No matches for "${query}"</div>`; return; }
    el.innerHTML = filtered.map(l => {
      const t=new Date(l.t), ts=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}`;
      const cnt = l.count&&l.count>1 ? `<span class="lgc">×${l.count}</span>` : "";
      const data = l.data ? `<div style="color:#9ca3af;margin-top:2px;font-size:10px;word-break:break-all">${hl(l.data,query)}</div>` : "";
      return `<div class="lg ${l.level}"><span class="lgt">${ts}</span>${hl(l.msg,query)}${cnt}${data}</div>`;
    }).join("");
  }

  // ── Wait helpers ───────────────────────────────────────────────────────
  async function waitFor(sel, check, label) {
    const deadline = Date.now()+TIMEOUT;
    while (Date.now()<deadline) { const el=$one(sel); if (el&&isVisible(el)&&check(el)) { await wait(POST_LOAD); return true; } await wait(WAIT_MS); }
    logError(`Timeout: ${label}`); return false;
  }
  async function waitForSummary() {
    const deadline = Date.now()+TIMEOUT;
    while (Date.now()<deadline) {
      const ws = $all(".lrn_widget[id]");
      if (ws.some(w => $one(".lrn_stimulus_content",w)||$one(".lrn_correctAnswerList",w)||$one(".lrn_valid,.lrn_correct",w))) { await wait(POST_LOAD); return true; }
      await wait(WAIT_MS);
    }
    if ($all(".lrn_widget[id]").length > 0) { logWarn("waitForSummary: fallback"); await wait(POST_LOAD); return true; }
    logError("Timeout: summary"); return false;
  }
async function waitForLesson() {
  const deadline = Date.now() + TIMEOUT;

  while (Date.now() < deadline) {
    // Check for general lesson widgets/content
    if ($all(".lrn_widget[id]").some(w => w.children.length > 0)) { await wait(POST_LOAD); return true; }
    if ($one(".lrn-assess-content,.lrn_assess,.items-grid,.test-content-wrapper")) { await wait(POST_LOAD); return true; }
    if ($one(".lds-root") && isVisible($one(".lds-root"))) { await wait(POST_LOAD); return true; }

    // Count cloze response wrappers
    const responseWrappers = $all(".lrn_response_wrapper");
    const totalQuestionsEl = $one("#lrn_accessible_items_count");
    let expectedQuestions = 0;
    if (totalQuestionsEl) {
      const match = totalQuestionsEl.textContent.match(/(\d+)\s+of\s+\d+/);
      if (match) expectedQuestions = parseInt(match[2], 10);
    }

    if (responseWrappers.length > 0 && responseWrappers.length === expectedQuestions) {
      await wait(POST_LOAD);
      return true;
    }

    await wait(WAIT_MS);
  }  // end while

  // fallback if any widgets exist but timed out
  if ($all(".lrn_widget[id]").length > 0) {
    logWarn("waitForLesson: fallback");
    await wait(POST_LOAD);
    return true;
  }

  logError("Timeout: assessment");
  return false;
}

function setSelectValue(sel, rawText) {
  const opts = Array.from(sel.options);
  const optText = o => o.textContent.trim();

  // exact
  let opt = opts.find(o => optText(o) === rawText);

  // strip label
  if (!opt) {
    const stripped = stripLabel(rawText);
    opt = opts.find(o => optText(o) === stripped);
  }

  // loose equality
  if (!opt) {
    opt = opts.find(o => looseEq(optText(o), rawText));
  }

  // suffix rescue
  if (!opt) {
    opt = opts.find(o => looseEndsWith(optText(o), rawText));
  }

  if (!opt) {
    logWarn(`Option not found: "${rawText}"`);
    return false;
  }

  sel.value = opt.value;
  fireEvents(sel,"change","input");
  return true;
}

  function navigateToCourses() {
    const cid=getCID(), ln=getLNum()??location.pathname.match(/\/lessons\/(\d+)/)?.[1];
    const dest = cid&&ln ? `https://login.icevonline.com/app/courses/${cid}/lessons/${ln}` : cid ? `https://login.icevonline.com/app/courses/${cid}/lessons` : null;
    if (!dest || location.pathname.startsWith(`/app/courses/${cid}/lessons`)) return;
    location.href = dest;
  }

  // ── API ────────────────────────────────────────────────────────────────
  async function fetchActivities(cid, ln) {
    try {
      const r = await fetch(`https://login.icevonline.com/api/v1/courses/${cid}/lessons/${ln}/activities`, { credentials:"include", headers:{ Accept:"application/json" } });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }
  async function getAttemptMap(cid, ln) {
    const data = await fetchActivities(cid, ln); if (!data) return null;
    const map={}, items=Array.isArray(data)?data:(data.activities||data.data||[]);
    for (const item of items) {
      const raw=item.activity_id||item.activityId||item.id||"";
      const m=String(raw).match(/(CEV[^/?#\s]+)/); if (!m) continue;
      map[m[1]] = {
        taken: parseInt(item.attempts_taken??item.attemptsTaken??item.taken??0, 10),
        total: parseInt(item.max_attempts??item.maxAttempts??item.total??3,    10),
      };
    }
    return Object.keys(map).length ? map : null;
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  async function submitAssessment() {
    if (!isAutoOn()) { Toast.warn("Automation off — not submitting"); return; }
    logInfo("Submitting…"); Toast.info("Submitting…",2000);
    $one("button.test-submit")?.click(); await wait(1000);
    let btn = $one("button.test-dialog-save-submit");
    if (!btn||!isVisible(btn)) btn = $one("button.lrn_btn_blue.test-submit,button.test-submit.btn-lg");
    if (!btn||!isVisible(btn)) { const found = await waitForFinishBtn(); if (!found) { logError("Confirm button not found"); return; } btn = $one("button.test-dialog-save-submit")||$one("button.lrn_btn_blue.test-submit"); }
    if (!btn) { logError("Finish button missing"); return; }
    btn.click(); Toast.ok("Submitted! Waiting for results…",5000); logInfo("Submitted");
    const id = getLID(); if (id) { setStatus(id,"filled"); refreshPanelStatus(); }
    // advanceQueue is called by the summary page handler to avoid double-advancing the queue
  }

  // ── Parse prompt ───────────────────────────────────────────────────────
  function showParsePrompt({ lessonID, parsed, total }) {
    return new Promise(resolve => {
      _shadowRoot?.querySelector("#parse-overlay")?.remove();
      const pct = total>0 ? `~${Math.round((parsed/total)*100)}%` : "unknown";
      const isFull = parsed === 0;
      const overlay = document.createElement("div"); overlay.id="parse-overlay";
      overlay.style.cssText="position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',-apple-system,sans-serif;";
      overlay.innerHTML=`<div style="background:white;border-radius:12px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.25);overflow:hidden">
        <div style="background:#fef2f2;padding:16px 20px;border-bottom:1px solid #fecaca;display:flex;gap:10px;align-items:center">
          <span style="font-size:20px">${isFull?"❌":"⚠️"}</span>
          <div><div style="font-weight:700;color:#991b1b;font-size:14px">${isFull?"Parse failed":"Incomplete parse"}</div><div style="font-size:12px;color:#dc2626;margin-top:2px">${lessonID}</div></div>
        </div>
        <div style="padding:20px">
          <p style="margin:0 0 12px;font-size:13px;color:#374151;line-height:1.6">${isFull
            ? "No answers could be parsed. The page layout may not be supported yet."
            : `Only <strong>${parsed}</strong> of <strong>${total}</strong> questions were parsed — some answers are missing.`}</p>
          ${!isFull ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center;margin:0 0 14px"><div style="font-size:28px;font-weight:700;color:#16a34a">${pct}</div><div style="font-size:11px;color:#9ca3af;margin-top:2px">estimated score with partial answers</div></div>` : ""}
          <button id="pcopy" style="width:100%;padding:10px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:6px">📋 Copy diagnostic to clipboard</button>
          <div style="display:flex;gap:8px;margin-bottom:8px">
            ${!isFull ? `<button id="pyes" style="flex:1;padding:10px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Continue with ${parsed}/${total}</button>` : ""}
            <button id="pno" style="flex:1;padding:10px;background:white;color:#374151;border:1px solid #d1d5db;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Stop &amp; fix manually</button>
          </div>
          <p style="margin:0;font-size:10px;color:#9ca3af;text-align:center">Copy the diagnostic and paste it to <strong>${DISCORD}</strong> on Discord · Disable in Settings → Skip parse prompt</p>
        </div>
      </div>`;
      (_shadowRoot||document.documentElement).appendChild(overlay);
      overlay.querySelector("#pcopy").addEventListener("click", async e => {
        const btn = e.currentTarget, ok = await copyToClipboard(_lastDiagnostic);
        btn.textContent = ok ? "✓ Copied!" : "⚠ Copy failed — try Ctrl+C on the text below";
        btn.style.background = ok ? "#16a34a" : "#dc2626";
        if (!ok) {
          const ta = Object.assign(document.createElement("textarea"), { value:_lastDiagnostic, readOnly:true });
          ta.style.cssText="width:100%;height:80px;font-size:10px;margin-top:8px;border:1px solid #e5e7eb;border-radius:6px;padding:6px;resize:none;box-sizing:border-box";
          btn.parentElement.insertBefore(ta, btn.nextSibling); ta.focus(); ta.select();
        }
      });
      overlay.querySelector("#pyes")?.addEventListener("click", () => { overlay.remove(); resolve(true); });
      overlay.querySelector("#pno").addEventListener("click",   () => { overlay.remove(); resolve(false); });
    });
  }

  // ── Fill error prompt ──────────────────────────────────────────────────
  function showFillPrompt({ lessonID, filled, expected }) {
    return new Promise(resolve => {
      _shadowRoot?.querySelector("#fill-overlay")?.remove();
      const overlay = document.createElement("div"); overlay.id="fill-overlay";
      overlay.style.cssText="position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',-apple-system,sans-serif;";
      overlay.innerHTML=`<div style="background:white;border-radius:12px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden"><div style="background:#fef2f2;padding:16px 20px;border-bottom:1px solid #fecaca;display:flex;gap:10px;align-items:center"><span style="font-size:18px">⚠️</span><div><div style="font-weight:600;color:#991b1b;font-size:14px">Fill incomplete</div><div style="font-size:12px;color:#dc2626;margin-top:2px">${lessonID}</div></div></div><div style="padding:20px"><p style="margin:0 0 12px;font-size:13px;color:#374151;line-height:1.6">Only <strong>${filled}</strong> of <strong>${expected}</strong> answers could be filled on the lesson page.</p><p style="margin:0 0 6px;font-size:12px;color:#6b7280">Some answers in the saved data may not match what's on screen. You can submit as-is or fix manually.</p><p style="margin:0 0 16px;font-size:11px;color:#9ca3af">Disable in Settings → Skip fill prompt.</p><div style="display:flex;gap:8px"><button id="fyes" style="flex:1;padding:9px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Submit anyway</button><button id="fno" style="flex:1;padding:9px;background:white;color:#374151;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Stop &amp; fix manually</button></div></div></div>`;
      (_shadowRoot||document.documentElement).appendChild(overlay);
      overlay.querySelector("#fyes").onclick = () => { overlay.remove(); resolve(true); };
      overlay.querySelector("#fno").onclick  = () => { overlay.remove(); resolve(false); };
    });
  }

  // ── Automation off helper ──────────────────────────────────────────────
  function disableAutomation() {
    saveSettings({ auto:false });
    const ab = _shadowRoot?.getElementById("autobig");
    if (ab) { ab.querySelector(".abl").textContent="Automation Off"; ab.querySelector(".abs").textContent="Click to enable"; ab.classList.add("off"); }
    if (_shadowRoot) _shadowRoot.getElementById("autotgl").checked=false;
    updateDot(); Toast.warn("Automation off — fix manually.",10000);
  }

  // ── Summary Parser ─────────────────────────────────────────────────────
  async function parseSummary(thenNavigateTo=null, alreadyCompleted=false) {
    if (!isAutoOn()&&!alreadyCompleted) logInfo("Automation off — parsing anyway for diagnostics");
    const lid = getLID(); if (!lid) { logError("Cannot detect lesson ID"); return; }
    logInfo(`Parsing ${lid}…`);
    const qaMap={}, stimToId={};
    let count=0;

    function getStimulus(w) {
      const std = $one(".lrn_stimulus_content",w); if (std) return trim(std);
      function fromTitle(el) {
        if (!el) return null;
        const c=el.cloneNode(true); c.querySelectorAll(".visually-hidden,.lrn-circle,[aria-hidden],canvas,span[class*='score']").forEach(e=>e.remove());
        return trim(c)||null;
      }
      const inner=$one(".lrn-report-item-title",w); if (inner) { const t=fromTitle(inner); if (t) return t; }
      const ri=w.closest(".lrn-report-item,.lrn_report_item,[class*='report-item']");
      if (ri) { const title=$one(".lrn-report-item-title,.lrn_report_item_title,h3,h4",ri); if (title&&title!==w) { const t=fromTitle(title); if (t) return t; } }
      const stem=$one(".lrn_stem,.lrn-stem,.lrn_question_title,.question-title",w); if (stem) return trim(stem);
      return w.id||null;
    }

    function getComboAnswers(w) {
      const combos = $all(".lrn_combobox.lrn_correct,.lrn_combobox.lrn_valid",w);
      if (combos.length) {
        const seen=new Set(), out=[];
        combos.forEach(c => {
          const sel=$one("select",c), idx=parseInt(sel?.dataset?.inputid??"0",10);
          if (seen.has(idx)) return; seen.add(idx);
          const ansEl=$one(".lrn_clozedropdown_answer",c);
          const ansSpans=$all("span:not(.lrn-accessibility-label)",ansEl||document.createElement("div"));
          const val=trim(ansSpans[0]||ansEl);
          if (val) out.push({idx,val});
        });
        return out.sort((a,b)=>a.idx-b.idx).map(o=>o.val);
      }
      const selects=$all("select.lrn_cloze_response",w);
      if (selects.length) {
        const seen=new Set(), out=[];
        selects.forEach(sel => {
          const idx=parseInt(sel.dataset?.inputid??"0",10); if (seen.has(idx)) return; seen.add(idx);
          const chosen=Array.from(sel.options).find(o=>o.selected&&o.value);
          if (chosen) out.push({idx,val:trim(chosen)});
        });
        if (out.length) return out.sort((a,b)=>a.idx-b.idx).map(o=>o.val);
      }
      return [];
    }

    $all(".lrn_widget[id]").forEach(w => {
      let stimulus = getStimulus(w);
      if (!stimulus) { logWarn(`parse: could not get stimulus for widget ${w.id} (classes: ${[...w.classList].join(" ")})`); return; }
      const cls = w.classList;
      const origStimulus = stimulus; // save before potential dedup rewrite
      // Deduplicate: if this stimulus text is already used AND mapped to a different widget,
      // fall back to the widget ID as the key so the second question isn't silently overwritten.
      if (qaMap[stimulus] !== undefined && stimToId[stimulus] !== w.id) stimulus = w.id||stimulus;
      stimToId[stimulus] = w.id;

      if (cls.contains("lrn_mcq")) {
        const cl = $one("li.lrn-mcq-option.lrn_correct,li.lrn-mcq-option.lrn_valid",w) ||
          $all("li.lrn-mcq-option",w).find(li => trim($one(".sr-only",li)).toLowerCase().includes("correct answer"));
        if (cl) {
          const a = trim($one(".lrn_contentWrapper",cl))||trim($one(".lrn-label-disabled",cl))||trim($one(".lrn-possible-answer",cl));
          if (a) { qaMap[stimulus]={type:"choice",answer:a}; count++; }
        } else logWarn(`MCQ no correct: ${stimulus.slice(0,50)}`);
        return;
      }
      if (cls.contains("lrn_sortlist")) {
        let items = $all(".lrn_target .lrn_response_container",w).map(c=>trim($one(".lrn_item",c))).filter(Boolean);
        if (!items.length) items=$all(".lrn_correctAnswerList li",w).map(li=>trim($one(".lrn_responseText",li))).filter(Boolean);
        if (items.length) { qaMap[stimulus]={type:"order",items}; count++; }
        else logWarn(`sortlist: no items found for "${stimulus.slice(0,60)}" (widget ${w.id})`);
        return;
      }
      if (cls.contains("lrn_clozedropdown")) {
        // Merge two sources: (A) correctAnswerList, (B) inline lrn_combobox correct/valid
        const byIdx={};
        $all(".lrn_correctAnswerList li",w).forEach(li => {
          const idxEl=$one(".lrn_responseIndex",li);
          const idx=idxEl?parseInt(trim(idxEl),10)-1:Object.keys(byIdx).length;
          const val=trim($one(".lrn_responseText",li))||trimLi(li);
          if (val && !byIdx[idx]) byIdx[idx]=val;
        });
        $all(".lrn_combobox.lrn_correct,.lrn_combobox.lrn_valid",w).forEach(c => {
          const idxEl=$one(".lrn_responseIndex",c), idx=idxEl?parseInt(trim(idxEl),10)-1:-1;
          if (idx<0) return;
          const val=trim($one(".lrn_clozedropdown_answer span:not(.lrn-accessibility-label)",c)||$one(".lrn_clozedropdown_answer",c));
          if (val && !byIdx[idx]) byIdx[idx]=val;
        });
        $all("select.lrn_cloze_response",w).forEach(sel => {
          const idx=parseInt(sel.dataset?.inputid??"0",10); if (byIdx[idx]) return;
          const chosen=Array.from(sel.options).find(o=>o.selected&&o.value); if (chosen) byIdx[idx]=trim(chosen);
        });
        if (Object.keys(byIdx).length) {
          // Cap byIdx entries to the actual number of blank selects in this widget.
          // iCEV sometimes lists ALL answer choices in correctAnswerList (not just the correct one),
          // which causes the script to think a single-blank question has multiple blanks.
          const actualBlanks = Math.max(
            $all("select.lrn_cloze_response, select[data-lrn-role]", w).length,
            $all(".lrn_combobox", w).length
          );
          if (actualBlanks > 0) {
            Object.keys(byIdx).map(Number).sort((a,b)=>a-b).slice(actualBlanks).forEach(k => delete byIdx[k]);
          }
          const allOptionTexts = [...new Set($all("select option",w).map(o=>o.textContent.trim()).filter(Boolean))];
          const reconcile = raw => {
            if (!allOptionTexts.length) return stripAnswerPrefix(raw);
            const stripped = stripAnswerPrefix(raw);
            if (allOptionTexts.includes(stripped)) return stripped;
            if (allOptionTexts.includes(raw)) return raw;
            const labelStripped = stripped.replace(/^[^=:]+=\s*|^[^=:]+:\s*/, "");
            if (labelStripped && allOptionTexts.includes(labelStripped)) return labelStripped;
            const suffixMatch = allOptionTexts.find(ot => ot.length > 2 && stripped.endsWith(ot));
            return suffixMatch ?? stripped;
          };
          const answers=Object.keys(byIdx).map(Number).sort((a,b)=>a-b).map(i=>reconcile(byIdx[i])).filter(Boolean);
          if (answers.length) { qaMap[stimulus]={type:"dropdown",answers}; count++; }
        }
        return;
      }
      if (cls.contains("lrn_tokenhighlight")) {
        const a=$all(".lrn_tokenhighlight_text .lrn_valid span",w).map(trim).filter(Boolean);
        if (a.length) { qaMap[stimulus]={type:"token",answers:[...new Set(a)]}; count++; }
        else logWarn(`token: no valid tokens for "${stimulus.slice(0,60)}" (widget ${w.id})`);
        return;
      }
      if (cls.contains("lrn_choicematrix")) {
        const a={};
        $all("tr.lrn_stem",w).forEach(row => {
          const stmt=trim($one("th .lrn-stem-text,th .lrn_stem_label,th",row));
          const lbl=trim($one("label .lrn_option_text,label",$one("td.lrn_valid",row)));
          if (stmt&&lbl) a[stmt]=lbl;
        });
        if (Object.keys(a).length) { qaMap[stimulus]={type:"matrix",answers:a}; count++; }
        else logWarn(`matrix: no valid rows for "${stimulus.slice(0,60)}" (widget ${w.id})`);
        return;
      }
      if (cls.contains("lrn_association")||cls.contains("lrn_assoc")) {
        const rowMap={}, rowOrder=[];
        $all(".lrn_assoc_row",w).forEach(row => {
          const rq=trim($one(".lrn_assoc_question,.lrn_stem_label",row)); if (!rq) return;
          const dropZone=$one(".lrn_response_container,.lrn_dropzone",row);
          // Method A: correct draggable already in drop zone
          const correctDrag=dropZone?$one(".lrn_btn_drag.lrn_correct,.lrn_draggable.lrn_correct",dropZone):null;
          if (correctDrag) { const a=trim($one(".lrn_item",correctDrag)||correctDrag); if(a){rowMap[rq]=a;rowOrder.push(rq);return;} }
          // Method B: lrn_valid on the zone itself
          const validZone=$one(".lrn_response_container.lrn_valid,.lrn_response_container.lrn_correct",row);
          if (validZone) { const a=trim($one(".lrn_item,.lrn_responseText",validZone)||validZone); if(a){rowMap[rq]=a;rowOrder.push(rq);return;} }
        });
        // Method C: legacy correctAnswerList
        if (!Object.keys(rowMap).length) {
          const ansLists=$all(".lrn_correctAnswerList",w);
          $all(".lrn_assoc_table",w).forEach((t,ti) => {
            const al=$all("li",ansLists[ti]||w);
            $all(".lrn_assoc_row",t).forEach((r,ri) => {
              const rq=trim($one(".lrn_assoc_question,.lrn_stem_label",r)), a=trim($one(".lrn_responseText",al[ri]));
              if (rq&&a) { rowMap[rq]=a; rowOrder.push(rq); }
            });
          });
        }
        // Method D: any placed draggable in drop zone
        if (!Object.keys(rowMap).length) {
          $all(".lrn_assoc_row",w).forEach(row => {
            const rq=trim($one(".lrn_assoc_question,.lrn_stem_label",row)); if (!rq) return;
            const dz=$one(".lrn_response_container,.lrn_dropzone",row); if (!dz) return;
            const placed=$one(".lrn_btn_drag,.lrn_draggable",dz); if (!placed) return;
            const a=trim($one(".lrn_item",placed)||placed)||placed.getAttribute("aria-label");
            if (a&&a!==rq) { rowMap[rq]=a; rowOrder.push(rq); }
          });
          if (Object.keys(rowMap).length) logInfo(`assoc Method D matched ${Object.keys(rowMap).length} rows for widget ${w.id}`);
        }
        if (Object.keys(rowMap).length) { qaMap[stimulus]={type:"assoc",answers:rowMap,rowOrder,...(stimulus!==origStimulus?{_stim:origStimulus}:{})}; count++; }
        else logWarn(`assoc: all parse methods failed for "${stimulus.slice(0,60)}" (widget ${w.id})`);
        return;
      }
      if (cls.contains("lrn_imageclozedropdown")||cls.contains("lrn_imagecloze")) {
        const imgEl=$one("img.lrn_imagecloze_image,img[class*='imagecloze'],img",w);
        const url=imgEl?(imgEl.src.replace(/^https?:/,"").split("?")[0]):null;
        let a=$all(".lrn_correctAnswerList li",w).map(li=>trim($one(".lrn_responseText",li))||trimLi(li)).filter(Boolean);
        if (!a.length) { a=getComboAnswers(w); }
        if (!a.length) a=$all(".lrn_clozedropdown_answer",w).map(el => trim($all("span:not(.lrn-accessibility-label)",el)[0]||el)).filter(Boolean);
        if (a.length) {
          // Reconcile each answer against actual option texts so stored value always matches what's fillable.
          // e.g. correctAnswerList says "A = 1/2 x b x h" but the option text is "1/2 x b x h".
          const allOptionTexts = [...new Set($all("select option",w).map(o=>o.textContent.trim()).filter(Boolean))];
          if (allOptionTexts.length) {
            a = a.map(raw => {
              if (allOptionTexts.includes(raw)) return raw;
              const stripped = stripAnswerPrefix(raw);
              if (allOptionTexts.includes(stripped)) return stripped;
              const labelStripped = raw.replace(/^[^=:]+=\s*|^[^=:]+:\s*/, "");
              if (labelStripped && allOptionTexts.includes(labelStripped)) return labelStripped;
              const suffixMatch = allOptionTexts.find(ot => ot.length > 2 && raw.endsWith(ot));
              return suffixMatch ?? raw;
            });
          }
          qaMap[stimulus]={type:"imagecloze",answers:a};
          if (url) { if (!qaMap.imageCloze) qaMap.imageCloze={}; qaMap.imageCloze[url]={type:"imagecloze",answers:a}; }
          count++;
        } else logWarn(`imagecloze: no answers for stimulus="${stimulus}" widget=${w.id}`);
        return;
      }
      if (cls.contains("lrn_shorttext")||cls.contains("lrn_formulaessay")) {
        const a=trim($one(".lrn_correctAnswerList .lrn_responseText,.lrn_correct_answer",w));
        if (a) { qaMap[stimulus]={type:"text",answer:a}; count++; }
        return;
      }
      if (cls.contains("lrn_clozeassociation")||cls.contains("lrn_clozednd")) {
        const a={};
        $all(".lrn_correctAnswerList li",w).forEach((li,i) => {
          const t=trim($one(".lrn_responseText",li))||trimLi(li); if (!t) return;
          const idxEl=$one(".lrn_responseIndex",li);
          a[idxEl?parseInt(trim(idxEl),10)-1:i]=t;
        });
        if (Object.keys(a).length) { qaMap[stimulus]={type:"cloze",answers:a}; count++; }
        else logWarn(`cloze: no answers for "${stimulus.slice(0,60)}" (widget ${w.id})`);
      }
    });

    const totalWidgets = $all(".lrn_widget[id]").filter(w =>
      $one(".lrn_stimulus_content",w)||$one(".lrn_correctAnswerList",w)||$one(".lrn_valid,.lrn_correct",w)||
      w.classList.contains("lrn_imageclozedropdown")||w.classList.contains("lrn_imagecloze")
    ).length;

    const score=readScore();
    if (score.percentage) { patchLesson(lid,{score}); logInfo(`Score: ${score.percentage} for ${lid}`); refreshPanelStatus(); }

    if (alreadyCompleted) {
      if (count>0) {
        const _as=getAnswers(); _as[lid]={lessonID:lid,qaMap,stimToId,savedAt:Date.now()}; saveAnswers(_as);
        setStatus(lid,"answers_saved"); refreshPanelStatus();
        Toast.ok(`Saved ${count} answers & score for ${lid}`,5000);
        logInfo(`[already-done] Saved ${count} answers for ${lid}`);
      } else {
        Toast.info(`Score recorded for ${lid}. No answers parsed.`,5000);
        logWarn(`[already-done] Zero answers parsed for ${lid}`);
      }
      refreshAnswersPane(); return;
    }

    const isEmpty=count===0, isPartial=totalWidgets>0&&count<totalWidgets;
    logInfo(`Parsed ${count}/${totalWidgets} for ${lid}`);

    if (isEmpty||isPartial) {
      const _as=getAnswers();
      if (!isEmpty) { _as[lid]={lessonID:lid,qaMap,stimToId,savedAt:Date.now()}; saveAnswers(_as); setStatus(lid,"answers_partial"); }
      else setStatus(lid,"error");
      refreshPanelStatus();
      logError(`Parse ${isEmpty?"failed":"incomplete"}: ${count}/${totalWidgets} for ${lid}`, {count,totalWidgets,lid});

      if (isSkipPrompt()&&!isEmpty) { Toast.warn(`Continuing with ${count}/${totalWidgets}…`,4000); if(isAutoOn()) setTimeout(()=>{location.href=thenNavigateTo??location.pathname.replace(/\/summary.*$/,"");},2000); return; }
      if (isSkipPrompt()&&isEmpty)  { if(isAutoOn()) setTimeout(()=>advanceQueue(),3000); return; }

      const go=await showParsePrompt({lessonID:lid,parsed:isEmpty?0:count,total:totalWidgets});
      if (!go) { disableAutomation(); return; }
      if (isEmpty) { if(isAutoOn()) setTimeout(()=>advanceQueue(),2000); return; }
    } else {
      const _as=getAnswers(); _as[lid]={lessonID:lid,qaMap,stimToId,savedAt:Date.now()}; saveAnswers(_as);
      setStatus(lid,"answers_saved"); refreshPanelStatus();
      Toast.ok(`Saved ${count} answers for ${lid}`,5000); logInfo(`Saved ${count} for ${lid}`);
    }
    if (isAutoOn()) { Toast.info("Navigating to fill…",3000); setTimeout(()=>{location.href=thenNavigateTo??location.pathname.replace(/\/summary.*$/,"");},2000); }
  }

  // ── Fill Assessment ────────────────────────────────────────────────────
  async function fillAssessment() {
    if (!isAutoOn()) { Toast.warn("Automation off — not filling"); return; }
    const lid=getLID(); if (!lid) { logError("Cannot detect lesson ID for fill"); return; }
    const status=getStatus(lid);
    if (status==="unsafe") { Toast.bigWarn(`${lid} is marked UNSAFE.`); return; }
    if (status==="error")  { Toast.bigWarn(`${lid} has a parse error.`); return; }
    if (!hasAnswers(lid))  { logError("No saved answers",{lid}); Toast.bigWarn("No saved answers — cannot fill."); return; }
    const {qaMap,stimToId={}}=getQAMap(lid); let filled=0;
    logInfo(`Filling ${lid}…`); Toast.info("Filling answers…",3000);

    // ── DEBUG: dump all saved answers for this lesson ──────────────────
    logInfo(`[fill:debug] ═══ Saved qaMap for "${lid}" ═══`, {
      totalKeys: Object.keys(qaMap).filter(k=>k!=="imageCloze").length,
      assocEntries: Object.entries(qaMap).filter(([,v])=>v?.type==="assoc").map(([stim,v])=>({
        stimulus: stim.slice(0,80),
        rowCount: Object.keys(v.answers||{}).length,
        keys: Object.keys(v.answers||{}).map(k=>k.slice(0,80)),
        vals: Object.values(v.answers||{}).map(v=>v.slice(0,80)),
      })),
      allTypes: Object.entries(qaMap).filter(([k])=>k!=="imageCloze").map(([k,v])=>({ key: k.slice(0,60), type: v?.type })),
    });
    // ── DEBUG: dump live widgets on this page ──────────────────────────
    logInfo(`[fill:debug] ═══ Live widgets on page ═══`, {
      widgetSummary: $all(".lrn_widget[id]").map(w => ({
        id: w.id,
        classes: [...w.classList].filter(c=>c.startsWith("lrn_")).join(" "),
        stimulus: trim($one(".lrn_stimulus_content",w))?.slice(0,60) ?? "(none)",
        assocRows: $all(".lrn_assoc_question,.lrn_stem_label",w).map(el=>trim(el).slice(0,60)),
      })),
    });

    // Allow the page DOM to fully settle before we start interacting with widgets
    await wait(1500);

    const ddData=Object.values(qaMap).filter(q=>q.type==="dropdown");
    const stimulusHandledDropdowns=new Set();

    // First pass: fill dropdowns matched by stimulus
    $all(".lrn_clozedropdown").forEach(c => {
      const w=c.closest(".lrn_widget[id]"); if (!w) return;
      const stimulus=trim($one(".lrn_stimulus_content",w)); if (!stimulus) return;
      let q=qaMap[stimulus];
      // Normalized fallback
      if (!q || q.type!=="dropdown") {
        const normStim = cleanSpaces(stimulus);
        const matchKey = Object.keys(qaMap).find(k => k !== "imageCloze" && cleanSpaces(k) === normStim && qaMap[k]?.type === "dropdown");
        if (matchKey) q = qaMap[matchKey];
      }
      if (!q||q.type!=="dropdown") return;
      stimulusHandledDropdowns.add(c);
      $all("select",c).forEach((sel,i) => {
        const a=q.answers[i];
        if (a && setSelectValue(sel,a)) filled++;
        else if (a) logWarn(`[fill:dropdown] Blank ${i+1}: option "${a}" not found in select`, { opts: Array.from(sel.options).map(o=>o.textContent.trim()) });
        else logWarn(`[fill:dropdown] Blank ${i+1}: no saved answer (stimulus match)`, { stimulus: stimulus.slice(0,60) });
      });
    });

    // Second pass: fallback index-based fill
    let ddIdx=0;
    $all(".lrn_clozedropdown").forEach(c => {
      if (stimulusHandledDropdowns.has(c)) { ddIdx++; return; }
      const qd=ddData[ddIdx++]; if (!qd) return;
      $all("select",c).forEach((sel,i) => {
        const a=qd.answers[i];
        if (a && setSelectValue(sel,a)) filled++;
        else if (a) logWarn(`[fill:dropdown-idx] Blank ${i+1}: option "${a}" not found in select`, { opts: Array.from(sel.options).map(o=>o.textContent.trim()) });
        else logWarn(`[fill:dropdown-idx] Blank ${i+1}: no saved answer (index-based fallback)`);
      });
    });

    // imageCloze fill
    if (qaMap.imageCloze) {
      $all(".lrn_imagecloze_container").forEach(c => {
        const img=$one("img.lrn_imagecloze_image,img[class*='imagecloze']",c); if (!img) return;
        const normUrl=img.src.replace(/^https?:/,"").split("?")[0];
        const data=qaMap.imageCloze[normUrl]||qaMap.imageCloze[img.src.split("?")[0]]; if (!data) return;
        $all(".lrn_imagecloze_response select,select",c).forEach((sel,i) => {
          const a=data.answers[i];
          if (a && setSelectValue(sel,a)) { fireEvents(sel,"input"); filled++; }
          else if (a) logWarn(`[fill:imageCloze] Blank ${i+1}: option "${a}" not found in select`, { opts: Array.from(sel.options).map(o=>o.textContent.trim()) });
          else logWarn(`[fill:imageCloze] Blank ${i+1}: no saved answer`);
        });
      });
    }

    const allAssocEntries=Object.values(qaMap).filter(q=>q?.type==="assoc");
    const usedAssocEntries=new Set();

    // Main widget fill loop — async so drag-drop operations can flush state between clicks
    for (const w of $all(".lrn_widget[id]")) {
      const stimulus=trim($one(".lrn_stimulus_content",w));
      let q=null;

      // ── ID suffix match: live IDs and saved IDs often share only the trailing portion
      // e.g. live "019d45a8-0312-..._713da259..." matches saved "019d45a7-d867-..._713da259..."
      // Extract suffix = everything after the last underscore (or the whole ID if no underscore).
      const wIdSuffix = w.id.includes("_") ? w.id.slice(w.id.lastIndexOf("_") + 1) : w.id;
      if (wIdSuffix && !q) {
        const suffixKey = Object.keys(qaMap).find(k => k !== "imageCloze" && k.includes("_") && k.slice(k.lastIndexOf("_") + 1) === wIdSuffix);
        if (suffixKey) { q = qaMap[suffixKey]; logInfo(`[fill:match] Widget "${w.id}" matched saved key by ID suffix "${wIdSuffix}"`); }
      }

      if (!q) {
        if (stimulus) {
          if (qaMap[stimulus]!==undefined&&stimToId[stimulus]===w.id) q=qaMap[stimulus];
          else if (qaMap[w.id]!==undefined) q=qaMap[w.id];
          else if (qaMap[stimulus]!==undefined&&stimToId[stimulus]===undefined) q=qaMap[stimulus];
          // Normalized fallback: find a stored key that matches after cleaning whitespace/special chars
          if (!q) {
            const normStim = cleanSpaces(stimulus);
            const matchKey = Object.keys(qaMap).find(k => k !== "imageCloze" && cleanSpaces(k) === normStim);
            if (matchKey) q = qaMap[matchKey];
          }
        } else if (qaMap[w.id]!==undefined) q=qaMap[w.id];
      }

      // Assoc fallback: match by row question text when ID mismatches between summary and live.
      // Uses best-overlap scoring: pick the unused assoc entry whose saved keys match the most live row texts.
      if ((!q||q.type!=="assoc") && (w.classList.contains("lrn_association")||w.classList.contains("lrn_assoc")||!!$one(".lrn_assoc_row",w))) {
        const rowTexts=$all(".lrn_assoc_question,.lrn_stem_label",w).map(el=>trim(el)).filter(Boolean);
        if (rowTexts.length) {
          let bestEntry=null, bestScore=0;
          for (const entry of allAssocEntries) {
            if (usedAssocEntries.has(entry)) continue;
            const keys = Object.keys(entry.answers||{});
            const vals = Object.values(entry.answers||{});
            // Count how many live row texts appear as keys OR values in this entry
            let score = 0;
            for (const rt of rowTexts) {
              const normRt = mathLite(rt);
              if (keys.some(k => mathLite(k) === normRt)) score += 2; // key match = stronger signal
              else if (vals.some(v => mathLite(v) === normRt)) score += 1;
            }
            if (score > bestScore) { bestScore = score; bestEntry = entry; }
          }
          if (bestEntry && bestScore > 0) {
            logInfo(`[fill:assoc] Matched widget ${w.id} to entry with score ${bestScore}/${rowTexts.length*2}`, { rowSample: rowTexts[0]?.slice(0,50), keySample: Object.keys(bestEntry.answers)[0]?.slice(0,50) });
            q=bestEntry;
          } else {
            // Log what we have vs what's on screen to help diagnose
            logWarn(`[fill:assoc] Could not match widget ${w.id} to any saved entry`, {
              liveRows: rowTexts.map(r=>r.slice(0,50)),
              savedEntries: allAssocEntries.filter(e=>!usedAssocEntries.has(e)).map(e=>Object.keys(e.answers||{}).map(k=>k.slice(0,40))),
            });
          }
        }
      }

      if (!q||q.type==="dropdown") {
        const wid = w.id, wstim = stimulus?.slice(0,60) ?? "(no stimulus)";
        if (!q) logWarn(`[fill:no-match] Widget ${wid} — no saved answer found`, { stimulus: wstim, widgetClasses: [...w.classList].join(" ") });
        continue;
      }

      switch (q.type) {
        case "choice": {
          const normAnswer = mathLite(q.answer);
          const allOpts = $all("li.lrn-mcq-option label",w).map(l => trim($one(".lrn_contentWrapper",l)||$one(".lrn-possible-answer",l)||l));
          const m=$all("li.lrn-mcq-option label",w).find(l=>{
            const txt = trim($one(".lrn_contentWrapper",l)||$one(".lrn-possible-answer",l)||l);
            return mathLite(txt) === normAnswer;
          });
          if (m) { const inp=m.closest("li")?.querySelector("input[type=radio]"); inp?inp.click():m.click(); filled++; }
          else logWarn(`[fill:choice] Answer "${q.answer}" not found among options`, { options: allOpts, widgetId: w.id });
          break;
        }
        case "token": {
          const tokenEls = $all(".lrn_token",w);
          const matched = tokenEls.filter(t=>{
            const txt = mathLite(trim($one("span",t)||t));
            return q.answers.some(a => mathLite(a) === txt) && t.getAttribute("aria-pressed")!=="true";
          });
          if (matched.length) matched.forEach(t=>{t.click();filled++;});
          else {
            const avail = tokenEls.map(t => trim($one("span",t)||t));
            logWarn(`[fill:token] No matching tokens found`, { want: q.answers, available: avail, widgetId: w.id });
          }
          break;
        }
        case "cloze": {
          const isHidden = w.classList.contains("lrn_invisible") ||
            w.closest(".learnosity-item")?.classList.contains("lrn_invisible") ||
            w.closest("[aria-hidden='true']") !== null;
          const zones=$all(".lrn_response_container,.lrn_dropzone",w).filter(d=>d.dataset.inputid!==undefined||d.classList.contains("lrn_dropzone"));
          const poolAll=$all(".lrn_possibilityList .lrn_btn_drag,.lrn_btn_drag[role='button']",w).filter(el=>!el.closest(".lrn_response_container,.lrn_dropzone"));
          for (const [idx,ans] of Object.entries(q.answers).sort((a,b)=>+a[0]-+b[0])) {
            const zone=zones.find(d=>d.dataset.inputid===String(idx))||zones[+idx];
            if (!zone) { logWarn(`[fill:cloze] Blank ${+idx+1}: drop zone not found`, { inputid: idx, zoneCount: zones.length, widgetId: w.id }); continue; }
            const normAns = mathLite(ans);
            const drag=poolAll.find(el=>mathLite(trim($one(".lrn_item",el)||el))===normAns);
            if (!drag) {
              const poolTexts = poolAll.map(el => trim($one(".lrn_item",el)||el));
              logWarn(`[fill:cloze] Blank ${+idx+1}: draggable "${ans}" not in pool`, { pool: poolTexts, widgetId: w.id });
              continue;
            }
            if (isHidden) {
              drag.setAttribute("aria-pressed", "false");
              drag.classList.remove("lrn_active", "lrn_selected", "lrn-dragdrop-selected");
              zone.appendChild(drag);
              zone.classList.remove("lrn-dragdrop-empty");
              fireEvents(zone, "change", "input");
            } else {
              drag.click();
              zone.click();
            }
            filled++;
          }
          break;
        }
        case "matrix":
          $all("tr.lrn_stem",w).forEach(row => {
            const stmt=trim($one("th .lrn-stem-text,th .lrn_stem_label,th",row)), ans=q.answers[stmt];
            if (!ans) { logWarn(`[fill:matrix] Row "${(stmt||"").slice(0,50)}" has no saved answer`, { widgetId: w.id }); return; }
            const normAns = mathLite(ans);
            let hit = false;
            $all("td.lrn_option,td[role='radio']",row).forEach(td => {
              const inp=$one("input[type=radio]",td);
              if (inp&&mathLite(trim($one("label .lrn_option_text,label",td)))===normAns) { inp.click(); filled++; hit=true; }
            });
            if (!hit) {
              const colLabels = $all("td.lrn_option,td[role='radio']",row).map(td=>trim($one("label .lrn_option_text,label",td)));
              logWarn(`[fill:matrix] Row "${(stmt||"").slice(0,50)}": answer "${ans}" not found`, { cols: colLabels, widgetId: w.id });
            }
          }); break;
        case "text": {
          const inp=$one("input[type=text],textarea",w);
          if (inp) { inp.value=q.answer; fireEvents(inp,"input","change"); filled++; }
          else logWarn(`[fill:text] No input/textarea found in widget`, { widgetId: w.id });
          break;
        }
        case "order": {
          const ar=$one(".lrn_arrow_right",w);
          if (!ar) { logWarn(`[fill:order] Arrow button not found`, { widgetId: w.id }); break; }
          const srcAll=$all(".lrn_source .lrn_draggable",w);
          for (const ans of q.items) {
            const normAns = mathLite(ans);
            const item=srcAll.find(el=>mathLite(trim($one(".lrn_item",el)||el))===normAns);
            if (!item) {
              const avail = srcAll.map(el=>trim($one(".lrn_item",el)||el));
              logWarn(`[fill:order] Item "${ans}" not found in source list`, { available: avail, widgetId: w.id });
              continue;
            }
            item.click();
            ar.click();
            filled++;
          }
          break;
        }
        case "assoc": {
          usedAssocEntries.add(q);

          // Determine if this widget is on a background (invisible) page
          const isWidgetHidden = w.classList.contains("lrn_invisible") ||
            w.closest(".learnosity-item")?.classList.contains("lrn_invisible") ||
            w.closest("[aria-hidden='true']") !== null;

          // Pool: prefer widget-scoped first, fall back to global
          // (iCEV sometimes renders the possibility list outside the widget element)
          const widgetPool = $one(".lrn_possibilityList", w);
          // Walk up ancestors looking for a possibility list sibling
          let poolEl = widgetPool;
          if (!poolEl) {
            let ancestor = w.parentElement;
            while (ancestor && ancestor !== document.body) {
              const pl = $one(".lrn_possibilityList", ancestor);
              if (pl) { poolEl = pl; break; }
              ancestor = ancestor.parentElement;
            }
          }
          if (!poolEl) {
            poolEl = $one(
              `.lrn_possibilityList[aria-label*="${$all(".lrn_assoc_question",w)[0]?.textContent?.slice(0,10) ?? ""}"]`
            ) || $all(".lrn_possibilityList").find(p => p.closest(".learnosity-item") === w.closest(".learnosity-item"));
          }
          const pool = $all(".lrn_btn_drag,.lrn_draggable", poolEl || w.closest(".learnosity-item") || document)
            .filter(el => !el.closest(".lrn_response_container,.lrn_dropzone"));
          const poolTexts = pool.map(btn => trim($one(".lrn_item",btn)||btn));

          // Detect inverted layout: on the live page the rows show definitions and draggables are
          // terms, but the summary page parsed it the other way round (rowMap[term]=definition).
          // Detect by checking if any live row text matches a *value* in q.answers rather than a key.
          const liveRowTexts = $all(".lrn_assoc_row",w)
            .map(r => trim($one(".lrn_assoc_question,.lrn_stem_label",r))).filter(Boolean);
          const savedKeys   = Object.keys(q.answers);
          const savedValues = Object.values(q.answers);
          const keyMatchCount   = liveRowTexts.filter(t => savedKeys.some(k => mathLite(k) === mathLite(t))).length;
          const valueMatchCount = liveRowTexts.filter(t => savedValues.some(v => mathLite(v) === mathLite(t))).length;
          // If values match the live rows better than keys do, the mapping is inverted — flip it
          const invertedMap = valueMatchCount > keyMatchCount
            ? Object.fromEntries(Object.entries(q.answers).map(([k,v]) => [v, k]))
            : null;
          if (invertedMap) logWarn(`[fill:assoc] Inverted layout detected — flipping key↔value map`, { widgetId: w.id, keyMatchCount, valueMatchCount });

          const answerMap = invertedMap ?? q.answers;

          // ── DEBUG: full pre-row dump ──────────────────────────────────────
          logInfo(`[fill:assoc] ▶ Widget "${w.id}" — starting fill`, {
            widgetId: w.id,
            isHidden: isWidgetHidden,
            stimulus: stimulus?.slice(0,80) ?? "(none)",
            liveRows: liveRowTexts,
            savedKeys: savedKeys.map(k=>k.slice(0,80)),
            savedValues: savedValues.map(v=>v.slice(0,80)),
            pool: poolTexts.map(t=>t.slice(0,60)),
            keyMatchCount,
            valueMatchCount,
            isInverted: !!invertedMap,
            poolSource: widgetPool ? "widget-scoped" : poolEl ? (poolEl !== widgetPool ? "ancestor-walk / aria-label / learnosity-item" : "?") : "document fallback",
          });

          for (const row of $all(".lrn_assoc_row",w)) {
            const question = trim($one(".lrn_assoc_question,.lrn_stem_label",row));
            if (!question) { logWarn(`[fill:assoc] Row has no question text`, { widgetId: w.id }); continue; }

            // Exact key lookup first, then normalised fallback
            let answer = answerMap[question];
            const exactHit = answer !== undefined;
            if (!answer) {
              const normQ = mathLite(question);
              const matchKey = Object.keys(answerMap).find(k => mathLite(k) === normQ);
              if (matchKey) { answer = answerMap[matchKey]; logInfo(`[fill:assoc] Row "${question.slice(0,60)}" — normalised key match → "${answer?.slice(0,60)}"`); }
            }
            if (!answer) {
              // ── DEBUG: full row failure dump ──────────────────────────────
              const normQ = mathLite(question);
              const normKeys = Object.keys(answerMap).map(k => ({ raw: k.slice(0,80), norm: mathLite(k).slice(0,80) }));
              logWarn(`[fill:assoc] ✗ No saved answer for row "${question.slice(0,80)}"`, {
                widgetId: w.id,
                rowText_raw: question,
                rowText_norm: normQ,
                exactHit,
                answerMapEntries: Object.entries(answerMap).map(([k,v]) => ({ key: k.slice(0,80), val: v.slice(0,80), keyNorm: mathLite(k).slice(0,80) })),
                normKeyComparison: normKeys.map(nk => ({ ...nk, matches: nk.norm === normQ })),
                poolTexts: poolTexts.map(t=>t.slice(0,60)),
                savedQAMap_allKeys: Object.keys(qaMap).filter(k=>k!=="imageCloze").map(k=>k.slice(0,60)),
              });
              continue;
            }
            // ── DEBUG: successful lookup ──────────────────────────────────
            logInfo(`[fill:assoc] ✓ Row "${question.slice(0,60)}" → answer "${answer.slice(0,60)}"`, { exactHit, widgetId: w.id });

            const dz = $one(".lrn_response_container.lrn_dropzone,.lrn_dropzone",row)
              || [...$all(".lrn_assoc_col2",row)].find(c=>c.classList.contains("lrn_dragdrop"));
            if (!dz) { logWarn(`[fill:assoc] Drop zone not found for row "${question.slice(0,50)}"`, { widgetId: w.id }); continue; }

            const normAnswer = mathLite(answer);
            const drag = pool.find(btn => mathLite(trim($one(".lrn_item",btn)||btn)) === normAnswer);
            if (!drag) {
              logWarn(`[fill:assoc] ✗ Draggable not found in pool for row "${question.slice(0,60)}"`, {
                widgetId: w.id,
                wantedAnswer_raw: answer,
                wantedAnswer_norm: normAnswer,
                poolTexts_raw: poolTexts.map(t=>t.slice(0,60)),
                poolTexts_norm: poolTexts.map(t=>mathLite(t).slice(0,60)),
                question: question.slice(0,60),
              });
              continue;
            }

            if (isWidgetHidden) {
              // Background page: DOM move directly — clicks are no-ops on hidden elements
              drag.setAttribute("aria-pressed", "false");
              drag.classList.remove("lrn_active", "lrn_selected", "lrn-dragdrop-selected");
              dz.appendChild(drag);
              dz.classList.remove("lrn-dragdrop-empty");
              fireEvents(dz, "change", "input");
            } else {
              // Visible page: iCEV two-step click
              drag.click();
              dz.click();
            }
            filled++;
          }
          // ── DEBUG: post-row summary ────────────────────────────────────
          logInfo(`[fill:assoc] ◀ Widget "${w.id}" done — filled ${filled} total so far`, { widgetId: w.id, rowCount: liveRowTexts.length });
          break;
        }
      }
    }

    // Expected total
    let expected_total=0;
    Object.entries(qaMap).forEach(([k,q]) => {
      if (!q||typeof q!=="object") return;
      if (k==="imageCloze") return; // URL-keyed lookup table only — answers already counted via stimulus-keyed imagecloze entries
      switch(q.type) {
        case "choice": case "text": expected_total+=1; break;
        case "dropdown": case "imagecloze": case "token": case "order": expected_total+=q.answers?.length||1; break;
        case "matrix": case "assoc": case "cloze": expected_total+=Object.keys(q.answers||{}).length; break;
      }
    });

    const effectiveExpected=expected_total||getQCount(lid);

    // ── Grade target: intentionally "un-fill" random answers to hit the target pct ──
    // We re-check filled after the target logic so shortFill detection stays accurate.
    if (isGradeTarget() && effectiveExpected > 0 && filled > 0) {
      // Use a stored target for this lesson so retries stay consistent
      let target = getLessons()[lid]?.gradeTarget;
      if (!target) { target = rollGradeTarget(); patchLesson(lid,{gradeTarget:target}); }
      // How many answers should we leave filled to reach the target?
      // Round to closest whole answer — e.g. 10 questions, 75% target → fill 7 or 8
      const wantFilled = Math.min(filled, Math.round(effectiveExpected * target / 100));
      if (wantFilled < filled) {
        const toSkip = filled - wantFilled;
        logInfo(`Grade target: ${target}% → keeping ${wantFilled}/${filled} answers, skipping ${toSkip}`);
        Toast.info(`Grade mode: targeting ~${target}% (skipping ${toSkip} answers)`,4000);
        // Build a flat list of all filled answer elements we can unset, shuffled randomly
        // We reset by un-clicking or clearing inputs — collect by type
        const undoable = [];

        // MCQ — click the selected radio again to deselect (or click empty area)
        $all(".lrn_widget[id]").forEach(w => {
          const stimulus=trim($one(".lrn_stimulus_content",w));
          let q=null;
          if (stimulus && qaMap[stimulus]!==undefined && stimToId[stimulus]===w.id) q=qaMap[stimulus];
          else if (qaMap[w.id]!==undefined) q=qaMap[w.id];
          if (!q) return;
          switch (q.type) {
            case "choice": {
              const checked=$one("li.lrn-mcq-option input[type=radio]:checked",w);
              if (checked) undoable.push(() => { checked.checked=false; fireEvents(checked,"change","input"); });
              break;
            }
            case "text": {
              const inp=$one("input[type=text],textarea",w);
              if (inp && inp.value) undoable.push(() => { inp.value=""; fireEvents(inp,"input","change"); });
              break;
            }
            case "token": {
              $all(".lrn_token[aria-pressed='true']",w).forEach(t => undoable.push(() => t.click()));
              break;
            }
            case "dropdown": {
              $all("select",w).forEach(sel => {
                if (sel.selectedIndex>0) undoable.push(() => { sel.selectedIndex=0; fireEvents(sel,"change","input"); });
              }); break;
            }
            case "imagecloze": {
              $all("select",w).forEach(sel => {
                if (sel.selectedIndex>0) undoable.push(() => { sel.selectedIndex=0; fireEvents(sel,"change","input"); });
              }); break;
            }
          }
        });

        // Shuffle and pick the ones to undo
        for (let i=undoable.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[undoable[i],undoable[j]]=[undoable[j],undoable[i]];}
        undoable.slice(0,toSkip).forEach(fn=>fn());
        filled = wantFilled;
      } else {
        logInfo(`Grade target: ${target}% → already at/below target, no skips needed`);
      }
      refreshPredictedGrade();
    } else {
      // Clear any stored target when grade mode is off
      if (!isGradeTarget() && getLessons()[lid]?.gradeTarget) patchLesson(lid,{gradeTarget:null});
    }
    logInfo(`Fill result: ${filled}/${effectiveExpected} for ${lid}`);
    // If grade target mode intentionally reduced the fill count, don't treat it as a short fill
    const gradeTargetActive = isGradeTarget() && !!getLessons()[lid]?.gradeTarget;
    const shortFill = !gradeTargetActive && expected_total>0 && filled<expected_total;

    if (filled===0||shortFill) {
      const retryCount = parseInt(getLessons()[lid]?.fillRetry ?? "0", 10) || 0;
      const maxR = getMaxRetries();

      // Auto retry: clear all blanks and re-fill in-place (no reload, no navigation)
      if (isAutoRetry() && retryCount < maxR) {
        patchLesson(lid, { fillRetry: String(retryCount + 1) });
        logWarn(`Short fill (${filled}/${effectiveExpected}), auto-retry ${retryCount + 1}/${maxR}`, {lid});
        Toast.warn(`Short fill (${filled}/${effectiveExpected}) — clearing & retrying (${retryCount + 1}/${maxR})…`, 5000);
        await wait(800);
        clearAllBlanks();
        await wait(600);
        // Re-run fill without advancing queue or navigating
        await fillAssessment();
        return;
      }

      // Exhausted retries (or auto-retry off)
      patchLesson(lid, { fillRetry: null });
      logWarn(`Short fill after ${retryCount} retries (${filled}/${effectiveExpected})`, {lid});
      if (isSkipFillPrompt()) {
        Toast.warn(`Fill incomplete (${filled}/${effectiveExpected}) — submitting anyway`, 5000);
        await clickLastReviewItem(); await wait(500); await submitAssessment(); return;
      }
      const go = await showFillPrompt({lessonID: lid, filled, expected: effectiveExpected});
      if (go) { await clickLastReviewItem(); await wait(500); await submitAssessment(); }
      else { setStatus(lid, "error"); refreshPanelStatus(); disableAutomation(); }
      return;
    }

    patchLesson(lid,{fillRetry:null});
    Toast.ok(`Filled ${filled}/${effectiveExpected} answers ✓`,4000);
    logInfo(`Fill complete: ${filled}/${effectiveExpected} for ${lid}`);
    refreshPanelStatus();
    if (isAutoOn()) { Toast.info("Submitting in 2s…",2000); await wait(2000); await clickLastReviewItem(); await wait(500); await submitAssessment(); }
  }

  async function clickLastReviewItem() {
    const deadline=Date.now()+5000; let items=[];
    while (Date.now()<deadline) { items=$all(".items-grid li.item-card"); if (items.length) break; await wait(100); }
    if (!items.length) return;
    const last=items[items.length-1], target=$one(".inner",last)||last;
    last.scrollIntoView({behavior:"smooth",block:"center"});
    ["pointerover","pointerdown","pointerup","click"].forEach(type => target.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:"mouse"})));
    last.focus({preventScroll:true});
  }

  // ── Course Page ────────────────────────────────────────────────────────
  async function handleCoursePage() {
    const ready=await waitFor(".table-default tbody tr",el=>!!el.querySelector("td"),"course table");
    if (!ready) return;
    buildPanel();
    const cid=getCID(), ln=getLNum()??location.pathname.match(/\/lessons\/(\d+)/)?.[1]??"";
    const baseURL=`https://login.icevonline.com/app/courses/${cid}/lessons/${ln}`;
    const apiMap=await getAttemptMap(cid,ln);
    const assessments=[], seenIDs=new Set();

    $all(".table-default tbody tr").forEach(row => {
      let href=null;
      const aLink=$one("a[href*='/CEV']:not([href*='/summary'])",row);
      if (aLink) href=aLink.getAttribute("href");
      else { const sl=$one("a[href*='/CEV'][href*='/summary']",row); if (sl) href=sl.getAttribute("href").replace(/\/summary.*$|(\?.*)/g,""); }
      if (!href) return;
      const idM=href.match(/\/(CEV[^/?#"]+)$/); if (!idM) return;
      const id=idM[1]; if (seenIDs.has(id)) return; seenIDs.add(id);
      let taken=0, total=3;
      if (apiMap?.[id]) { taken=apiMap[id].taken; total=apiMap[id].total; }
      else { const at=trim(row.querySelector("td:nth-child(2)")).match(/(\d+)\s*of\s*(\d+)/); if(at){taken=+at[1];total=+at[2];} }
      assessments.push({
        id, href: aLink?href:`${baseURL}/${id}`,
        summaryHref: $one("a[href*='/summary']",row)?.getAttribute("href")??null,
        taken, total, currentStatus: getStatus(id),
      });
    });

    // Mark unsafe (1-attempt) and externally attempted lessons
    assessments.forEach(a => {
      const stored=getLessons()[a.id]||{};
      if (a.total===1&&stored.status==="unseen") { setStatus(a.id,"unsafe"); if(!stored.loggedStatus) patchLesson(a.id,{loggedStatus:"unsafe"}); return; }
      if (a.taken>=a.total&&!["filled","unsafe","ext_attempted"].includes(stored.status)) { setStatus(a.id,"ext_attempted"); if(!stored.loggedStatus) patchLesson(a.id,{loggedStatus:"ext_attempted"}); }
    });

    // Inject page styles once
    if (!document.getElementById("cev-page-style")) {
      const ps=document.createElement("style"); ps.id="cev-page-style";
      ps.textContent=`.cev-bypass-btn{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;background:#fef9c3;color:#854d0e;border:1px solid #fde047;cursor:pointer;font-family:inherit;vertical-align:middle;margin-left:6px;transition:background .15s,border-color .15s;text-decoration:none;white-space:nowrap}.cev-bypass-btn:hover{background:#fef08a;border-color:#facc15}.cev-bypass-btn::before{content:"⚡ "}`;
      document.head.appendChild(ps);
    }

    const BADGE_CSS = {
      unseen:"background:#f3f4f6;color:#6b7280;border-color:#e5e7eb",
      running:"background:#eff6ff;color:#2563eb;border-color:#bfdbfe",
      saved:"background:#fffbeb;color:#d97706;border-color:#fde68a",
      partial:"background:#fff7ed;color:#ea580c;border-color:#fed7aa",
      filled:"background:#f0fdf4;color:#16a34a;border-color:#bbf7d0",
      error:"background:#fef2f2;color:#dc2626;border-color:#fecaca",
      unsafe:"background:#fef2f2;color:#dc2626;border-color:#fca5a5",
      ext_attempted:"background:#f3f4f6;color:#6b7280;border-color:#e5e7eb",
    };

    $all(".table-default tbody tr").forEach(row => {
      const anyLink=$one("a[href*='/CEV']",row); if (!anyLink) return;
      const idM=anyLink.getAttribute("href").match(/\/(CEV[^/?#"]+?)(?:\/summary|\?|$)/); if (!idM) return;
      const id=idM[1];
      row.querySelectorAll(".cev-rb,.cev-bypass-btn").forEach(b=>b.remove());
      const st=getStatus(id), bt=row.querySelector("td:first-child"); if (!bt) return;

      const badge=document.createElement("span"); badge.className="cev-rb";
      badge.style.cssText=`margin-left:8px;vertical-align:middle;display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;border:1px solid transparent;white-space:nowrap;${BADGE_CSS[statusClass(st)]||BADGE_CSS.unseen}`;
      badge.textContent=statusLabel(st); bt.appendChild(badge);

      const sc=getLessons()[id]?.score;
      if (sc) {
        const pct=parseFloat((sc.percentage||"").replace(/[^0-9.]/g,""));
        const scoreCss = isNaN(pct) ? "background:#f0fdf4;color:#16a34a;border-color:#bbf7d0"
          : pct>=90 ? "background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#15803d;border-color:#86efac"
          : pct>=75 ? "background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;border-color:#bbf7d0"
          : pct>=60 ? "background:linear-gradient(135deg,#fffbeb,#fef3c7);color:#b45309;border-color:#fcd34d"
          :           "background:linear-gradient(135deg,#fef2f2,#fee2e2);color:#dc2626;border-color:#fca5a5";
        const sb=document.createElement("span"); sb.className="cev-rb";
        sb.style.cssText=`margin-left:5px;vertical-align:middle;display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid transparent;white-space:nowrap;${scoreCss}`;
        sb.textContent=fmtScore(sc); bt.appendChild(sb);
      }

      const bypassBtn=document.createElement("a"); bypassBtn.className="cev-bypass-btn";
      bypassBtn.href=`${baseURL}/${id}?resume=True`; bypassBtn.title=`Re-enter ${id}`; bypassBtn.textContent="Re-enter";
      bypassBtn.addEventListener("click", e => { e.preventDefault(); patchLesson(id,{fillRetry:null}); logInfo(`Bypass: ${id}`); location.href=`${baseURL}/${id}?resume=True`; });
      (row.querySelectorAll("td")[row.querySelectorAll("td").length-1]||bt).appendChild(bypassBtn);
    });

    clearQueue(); _allDone=false; const skipped=[];
    assessments.forEach(a => {
      const st=getStatus(a.id);
      if (["filled","unsafe","ext_attempted","error"].includes(st)) { skipped.push(`${a.id}:${st}`); return; }
      if (a.taken>=a.total) { skipped.push(`${a.id}:exhausted`); return; }
      if (hasAnswers(a.id))       enqueue({id:a.id,action:"fill",url:`${baseURL}/${a.id}`});
      else if (a.summaryHref)     enqueue({id:a.id,action:"parse_then_fill",summaryUrl:`https://login.icevonline.com${a.summaryHref}`,assessUrl:`${baseURL}/${a.id}`});
      else                        enqueue({id:a.id,action:"first_run",url:`${baseURL}/${a.id}`,baseURL});
    });
    const q=getQueue().length;
    if (skipped.length) logInfo(`Skipped: ${skipped.join(" | ")}`);
    logInfo(`Scan: ${assessments.length} total, ${q} queued`);
    Toast.info(`Found ${assessments.length} assessments — ${q} queued`);
    refreshPanelStatus();
    if (!isAutoOn()) { Toast.info("Automation off — enable to proceed.",5000); return; }
    advanceQueue();
  }

  // ── Queue advance ──────────────────────────────────────────────────────
  let _advancing=false;
  function advanceQueue() {
    if (!isAutoOn()||_advancing) return;
    _advancing=true; const next=dequeue(); _advancing=false;
    if (!next) {
      if (!_allDone) { _allDone=true; Toast.ok("All done! 🎉",6000); logInfo("Queue empty — done"); setTimeout(()=>navigateToCourses(),3500); }
      return;
    }
    _allDone=false; logInfo(`Queue next: ${next.id} [${next.action}]`); Toast.info(`Next: ${next.id}`,3000);
    const DELAY=1500;
    switch (next.action) {
      case "fill":            setPending({id:next.id,action:"fill"});                                         setTimeout(()=>{location.href=next.url;},DELAY); break;
      case "parse_then_fill": setPending({id:next.id,action:"fill_after_parse",assessUrl:next.assessUrl});    setTimeout(()=>{location.href=next.summaryUrl;},DELAY); break;
      case "first_run":       setStatus(next.id,"running"); setPending({id:next.id,action:"running",baseURL:next.baseURL}); setTimeout(()=>{location.href=next.url;},DELAY); break;
    }
  }

  // ── Remove navbar ──────────────────────────────────────────────────────
  (() => { const rm=()=>$all(".nav,#main-navbar").forEach(el=>el.remove()); rm(); new MutationObserver(rm).observe(document.documentElement,{childList:true,subtree:true}); })();

  // ── Console API ────────────────────────────────────────────────────────
  window.CEV = {
    getAnswers: (id=getLID()) => getQAMap(id),
    getStatus:  (id=getLID()) => getStatus(id),
    resetLesson: (id=getLID()) => {
      const l=getLessons(); delete l[id]; saveLessons(l);
      const a=getAnswers(); delete a[id]; saveAnswers(a);
      refreshPanelStatus(); logInfo(`Reset ${id}`);
    },
    getQueue, clearQueue, getPending, clearPending,
    parse: parseSummary, fill: fillAssessment, submit: submitAssessment,
    highlight: applySilentHL, clearHighlight: clearSilentHL,
    getLogs: () => getJ(K.LOGS)||[],
    fetchAPI: (cid=getCID(),ln=getLNum()) => fetchActivities(cid,ln),
    debug: () => {
      const w=$all(".lrn_widget[id]");
      const info=w.map((el,i)=>({index:i,classes:[...el.classList].join("."),hasAnswerList:!!$one(".lrn_correctAnswerList",el),hasValid:!!$one(".lrn_valid,.lrn_correct",el),stimulus:trim($one(".lrn_stimulus_content",el))?.slice(0,80)??"(none)"}));
      logInfo(`Debug: ${w.length} widgets`,info); console.table(info); return info;
    },
    debugSummary: () => {
      const w=$all(".lrn_widget[id]");
      const info=w.map((el,i)=>{
        const ri=el.closest(".lrn-report-item,.lrn_report_item,[class*='report-item']"), te=ri?$one(".lrn-report-item-title,h3,h4",ri):null, tc=te?.cloneNode(true);
        tc?.querySelectorAll(".visually-hidden,.lrn-circle,[aria-hidden],canvas").forEach(e=>e.remove());
        return{index:i,id:el.id,classes:[...el.classList].join(" "),stimulus:trim($one(".lrn_stimulus_content",el))||"(none)",reportTitle:tc?trim(tc):"(none)",hasCorrectAnswerList:!!$one(".lrn_correctAnswerList",el),correctAnswers:$all(".lrn_correctAnswerList .lrn_responseText,.lrn_correctAnswerList li",el).map(trim),hasValid:!!$one(".lrn_valid,.lrn_correct",el)};
      });
      console.table(info.map(r=>({...r}))); console.log("[CEV debugSummary]",info); return info;
    },
  };

  // ── First-run helpers ──────────────────────────────────────────────────
  async function autoNavigateAndSubmitFirstRun(lid, baseURL) {
    Toast.info("Auto first-run: submitting…",5000); logInfo(`Auto first-run: ${lid}`);
    await clickLastReviewItem(); await wait(800);
    setPending({id:lid,action:"find_summary",baseURL,assessId:lid});
    $one("button.test-submit,button.lrn_btn_blue.test-submit")?.click();
    let confirmBtn=null; const deadline=Date.now()+6000;
    while (Date.now()<deadline) {
      confirmBtn=$one("button.test-dialog-save-submit")
        ||$one("button.lrn_btn_blue[class*='submit']:not(.test-submit)")
        ||$all("button").find(b=>/finish|submit|confirm/i.test(b.textContent)&&isVisible(b)&&b!==$one("button.test-submit"));
      if (confirmBtn&&isVisible(confirmBtn)) break;
      await wait(300);
    }
    if (confirmBtn&&isVisible(confirmBtn)) {
      confirmBtn.click(); Toast.ok("First-run submitted ✓",5000); setStatus(lid,"running");
      setTimeout(()=>{location.href=`https://login.icevonline.com/app/courses/${getCID()}/lessons/${getLNum()}`;},3000);
    } else {
      logWarn("Confirm dialog not found — fallback intercept",{lid}); clearPending(); interceptFinishForFirstRun(lid,baseURL);
    }
  }

  function interceptFinishForFirstRun(lid, baseURL) {
    const poll=setInterval(()=>{
      const btn=$one("button.lrn_btn_blue.test-submit,button.test-submit");
      if (!btn||btn._cevIntercepted) return;
      btn._cevIntercepted=true; clearInterval(poll);
      btn.addEventListener("click", () => {
        Toast.info("Submitted — finding summary…",5000);
        setPending({id:lid,action:"find_summary",baseURL,assessId:lid});
        setTimeout(()=>{location.href=`https://login.icevonline.com/app/courses/${getCID()}/lessons/${getLNum()}`;},3000);
      },{once:true});
      Toast.info("Click Finish when done.",5000);
    },500);
  }

  function interceptFinishForSilent(lid) {
    logInfo(`Silent intercept armed: ${lid}`);
    const onConfirm=()=>{setStatus(lid,"filled");refreshPanelStatus();logInfo(`Silent submit: ${lid}`);Toast.ok(`${lid} marked complete ✓`,5000);};
    function attachTo(btn) { if (btn._cevSilentIntercepted) return; btn._cevSilentIntercepted=true; btn.addEventListener("click",onConfirm,{once:true}); logInfo("Silent confirm armed"); }
    const findAndAttach=()=>{ const c=$one("button.test-dialog-save-submit"); if(c&&isVisible(c)) attachTo(c); };
    findAndAttach();
    const obs=new MutationObserver(findAndAttach); obs.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(), 30*60*1000);
  }

  async function handlePendingFindSummary(pending) {
    clearPending();
    const ready=await waitFor(".table-default tbody tr",el=>!!el.querySelector("td"),"course table"); if (!ready) { logError("Could not load table to find summary"); return; }
    let summaryHref=null;
    $all(".table-default tbody tr").forEach(row=>{
      const link=$one("a[href*='/CEV']",row); if (!link) return;
      const idM=link.getAttribute("href").match(/\/(CEV[^/?#"]+?)(?:\/summary|\?|$)/); if (!idM||idM[1]!==pending.assessId) return;
      const sl=$one("a[href*='/summary']",row); if (sl) summaryHref=sl.getAttribute("href");
    });
    if (!summaryHref) { logError(`Summary not found: ${pending.assessId}`); Toast.warn("Summary link not found. Refresh and try again."); return; }
    logInfo(`Found summary: ${pending.assessId}`);
    setPending({id:pending.assessId,action:"fill_after_parse",assessUrl:`${pending.baseURL}/${pending.assessId}`});
    setTimeout(()=>{location.href=`https://login.icevonline.com${summaryHref}`;},1500);
  }

  // ── Main router ────────────────────────────────────────────────────────
  (async () => {
    buildPanel();
    const path=location.pathname, href=location.href, pending=getPending();

    // ── "Resource not found" recovery ─────────────────────────────────────
    // If iCEV shows the error page, go back to the main lesson list and then
    // retry the same URL we were trying to reach.
    const notFoundEl = $one(".content p");
    if (notFoundEl && /the resource you requested could not be found/i.test(notFoundEl.textContent)) {
      const failedURL = location.href;
      logWarn(`[router] Not-found page detected — will retry: ${failedURL}`);
      Toast.warn("Page not found — retrying in 3 s…", 3000);
      // Store the URL we need to go back to, then navigate to the main course list.
      // On the next load the router will detect the stored retry and redirect.
      const cid = getCID(), ln = getLNum() ?? location.pathname.match(/\/lessons\/(\d+)/)?.[1];
      const mainURL = cid && ln
        ? `https://login.icevonline.com/app/courses/${cid}/lessons/${ln}`
        : cid
          ? `https://login.icevonline.com/app/courses/${cid}/lessons`
          : null;
      if (mainURL) {
        setPending({ ...(pending ?? {}), _notFoundRetry: failedURL });
        setTimeout(() => { location.href = mainURL; }, 2000);
      } else {
        logError("[router] Not-found page: could not determine main URL to redirect to");
      }
      return;
    }

    // ── Retry after not-found bounce ──────────────────────────────────────
    // If we landed on the main page because of a not-found retry, wait briefly
    // for the page to settle then navigate directly to the failed URL.
    if (pending?._notFoundRetry) {
      const retryURL = pending._notFoundRetry;
      // Remove the retry flag but keep the rest of pending intact
      const { _notFoundRetry, ...restPending } = pending;
      if (Object.keys(restPending).length) setPending(restPending); else clearPending();
      logInfo(`[router] Retrying after not-found: ${retryURL}`);
      Toast.info("Retrying…", 2000);
      setTimeout(() => { location.href = retryURL; }, 1500);
      return;
    }

    const isLessonList=(path.includes("/mycourses/")||path.includes("/app/courses/"))&&!path.match(/\/CEV[^/]*/)&&!href.includes("/summary");

    if (isLessonList) {
      if (pending?.action==="find_summary") { await handlePendingFindSummary(pending); return; }
      if (pending?.action==="retry_fill") {
        const p=pending; clearPending();
        const ready=await waitFor(".table-default tbody tr",el=>!!el.querySelector("td"),"course table"); if(!ready){logError("Could not load table for retry");return;}
        let summaryHref=null;
        $all(".table-default tbody tr").forEach(row=>{
          const link=$one("a[href*='/CEV']",row); if(!link) return;
          const idM=link.getAttribute("href").match(/\/(CEV[^/?#"]+?)(?:\/summary|\?|$)/); if(!idM||idM[1]!==p.id) return;
          const sl=$one("a[href*='/summary']",row); if(sl) summaryHref=sl.getAttribute("href");
        });
        if (!summaryHref) { logError(`No summary for retry: ${p.id}`); setStatus(p.id,"error"); patchLesson(p.id,{fillRetry:null}); return; }
        setPending({id:p.id,action:"fill_after_parse",assessUrl:p.assessUrl});
        setTimeout(()=>{location.href=`https://login.icevonline.com${summaryHref}`;},1500); return;
      }
      await handleCoursePage(); return;
    }

    if (href.includes("/summary")) {
      await wait(POST_LOAD);
      const lid=getLID();

      // Automation just filled → record score and advance
      if (lid&&getStatus(lid)==="filled"&&pending?.action!=="fill_after_parse") {
        await wait(1200); const score=readScore();
        if (score.percentage) { patchLesson(lid,{score}); logInfo(`Score: ${score.percentage} for ${lid}`); refreshPanelStatus(); }
        Toast.ok(`${lid} — ${score.percentage||"score unavailable"} ✓`,6000); clearPending();
        if (isAutoOn()) setTimeout(()=>advanceQueue(),2500); return;
      }

      // User manually navigated to an already-done summary
      if (lid&&["filled","ext_attempted"].includes(getStatus(lid))&&!pending) {
        if (await waitForSummary()) await parseSummary(null,true); return;
      }

      // Lesson has a parse error — always re-parse and show diagnostic
      if (lid&&getStatus(lid)==="error"&&!pending) {
        logInfo(`Re-parsing error lesson ${lid}…`);
        if (await waitForSummary()) await parseSummary(path.replace(/\/summary.*$/,""));
        return;
      }

      // Automation-driven parse
      if (lid) { const existing=getLessons()[lid]?.score; if(!existing){const score=readScore();if(score.percentage){patchLesson(lid,{score});logInfo(`Score: ${score.percentage}`);refreshPanelStatus();}}}
      if (await waitForSummary()) {
        if (pending?.action==="fill_after_parse"&&pending.id===lid) { clearPending(); await parseSummary(pending.assessUrl); }
        else await parseSummary(path.replace(/\/summary.*$/,""));
      }
      return;
    }

    if (await waitForLesson()) {
      const lid=getLID(), status=getStatus(lid);
      if (isSilentHL()&&hasAnswers(lid)) { await wait(300); applySilentHL(); startHLObserver(); }

      if (pending?.id===lid) {
        if (pending.action==="fill") {
          clearPending();
          if (isSilentHL()) { interceptFinishForSilent(lid); applySilentHL(); startHLObserver(); Toast.info("Answers highlighted — submit manually.",6000); }
          else await fillAssessment();
          return;
        }
        if (pending.action==="running") {
          clearPending();
          const qc=$all(".lrn_widget[id]").filter(w=>!!$one(".lrn_stimulus_content",w)).length;
          if (qc>0) setQCount(lid,qc);
          setStatus(lid,"running"); refreshPanelStatus();
          if (isAutoOn()&&isAutoFirstRun()) await autoNavigateAndSubmitFirstRun(lid,pending.baseURL);
          else { Toast.info(`First run for ${lid} — complete it, then click Finish.`,10000); interceptFinishForFirstRun(lid,pending.baseURL); }
          return;
        }
      }

      if (status==="error") {
        Toast.bigWarn(`Parse error on ${lid}. Go to the summary page and the script will re-parse and show you what went wrong.`);
        logWarn(`Lesson page loaded with error status: ${lid}`);
      } else if (status==="answers_saved"||hasAnswers(lid)) {
        if (isSilentHL()) { interceptFinishForSilent(lid); applySilentHL(); startHLObserver(); Toast.info("Answers highlighted — submit manually.",6000); }
        else if (status!=="running") await fillAssessment();
      } else if (status==="running") {
        const bURL=`https://login.icevonline.com/app/courses/${getCID()}/lessons/${getLNum()}`;
        if (isAutoOn()&&isAutoFirstRun()) await autoNavigateAndSubmitFirstRun(lid,bURL);
        else interceptFinishForFirstRun(lid,bURL);
      } else if (status==="unseen") {
        const qc=$all(".lrn_widget[id]").filter(w=>!!$one(".lrn_stimulus_content",w)).length;
        if (qc>0) setQCount(lid,qc);
        setStatus(lid,"running"); refreshPanelStatus();
        const bURL=`https://login.icevonline.com/app/courses/${getCID()}/lessons/${getLNum()}`;
        if (isAutoOn()&&isAutoFirstRun()) await autoNavigateAndSubmitFirstRun(lid,bURL);
        else { Toast.info("First run — complete it, Finish will continue.",8000); interceptFinishForFirstRun(lid,bURL); }
      }
      refreshAnswersPane();
    }
  })();

})();
