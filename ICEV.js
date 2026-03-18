// ==UserScript==
// @name         CEV Auto-Fill v6
// @namespace    http://tampermonkey.net/
// @version      6.0
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

  if (/\/CEV[^/?#]+\/resume(\?.*)?$/.test(location.pathname)) {
    location.replace(location.pathname.replace(/\/resume$/, "") + "?resume=True");
    return;
  }
  if (window.self !== window.top) return;

  const VERSION = GM_info?.script?.version ?? "6.0";
  const DISCORD = "@nmsjayden";
  const WAIT_MS = 300, TIMEOUT = 25_000, POST_LOAD = 1200;

  let _allDone = false, _miniDragged = false, _shadowRoot = null;

  // ── Storage ──────────────────────────────────────────────────────
  const K = { LESSONS:"CEV_LESSONS", ANSWERS:"CEV_ANSWERS", SETTINGS:"CEV_SETTINGS",
              QUEUE:"CEV_QUEUE", PENDING:"CEV_PENDING_ACTION", POS:"CEV_PANEL_POS", LOGS:"CEV_LOGS" };

  const getJ = k => { try { const v = GM_getValue(k, null); return typeof v === "string" ? JSON.parse(v) : v; } catch { return null; } };
  const setJ = (k, v) => GM_setValue(k, JSON.stringify(v));
  const delJ = k => GM_deleteValue(k);

  const getLessons      = ()      => getJ(K.LESSONS)  || {};
  const saveLessons     = d       => setJ(K.LESSONS, d);
  const patchLesson     = (id, p) => { const a = getLessons(); a[id] = { ...(a[id]||{}), ...p }; saveLessons(a); };
  const getAnswers      = ()      => getJ(K.ANSWERS)  || {};
  const saveAnswers     = d       => setJ(K.ANSWERS, d);
  const getSettings     = ()      => getJ(K.SETTINGS) || {};
  const saveSettings    = p       => setJ(K.SETTINGS, { ...getSettings(), ...p });
  const isAutoOn        = ()      => getSettings().auto !== false;
  const isSkipPrompt    = ()      => getSettings().skipParsePrompt === true;
  const isAutoFirstRun  = ()      => getSettings().autoFirstRun !== false;
  const isSilentHL      = ()      => getSettings().silentHighlight === true;

  const setPending   = o => setJ(K.PENDING, o);
  const getPending   = () => getJ(K.PENDING);
  const clearPending = () => delJ(K.PENDING);
  const getQueue     = () => getJ(K.QUEUE) || [];
  const setQueue     = q  => setJ(K.QUEUE, q);
  const enqueue      = i  => { const q = getQueue(); if (!q.find(x => x.id === i.id)) { q.push(i); setQueue(q); } };
  const dequeue      = () => { const q = getQueue(); const i = q.shift(); setQueue(q); return i; };
  const clearQueue   = () => setQueue([]);

  if (!getJ(K.SETTINGS)) saveSettings({ auto: false, skipParsePrompt: false, autoFirstRun: true, silentHighlight: false });

  // ── One-time localStorage → GM migration ─────────────────────────
  (() => {
    const lessons = getLessons(), answers = getAnswers(); let changed = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k) continue;
      const prefixes = [["CEV_STATUS_", id => lessons[id] = { ...(lessons[id]||{}), status: localStorage.getItem(k) }],
                        ["CEV_QCOUNT_", id => lessons[id] = { ...(lessons[id]||{}), qcount: +localStorage.getItem(k) }],
                        ["CEV_SCORE_",  id => { try { lessons[id] = { ...(lessons[id]||{}), score: JSON.parse(localStorage.getItem(k)) }; } catch {} }],
                        ["CEV_QA_",     id => { try { const v = JSON.parse(localStorage.getItem(k)); if (v) answers[id] = v; } catch {} }],
                        ["CEV_FILL_RETRY_", id => lessons[id] = { ...(lessons[id]||{}), fillRetry: localStorage.getItem(k) }]];
      for (const [pfx, fn] of prefixes) {
        if (k.startsWith(pfx)) { fn(k.slice(pfx.length)); localStorage.removeItem(k); i--; changed = true; break; }
      }
    }
    if (changed) { saveLessons(lessons); saveAnswers(answers); }
    Object.values(K).forEach(k => { const raw = localStorage.getItem(k); if (raw && GM_getValue(k, null) === null) GM_setValue(k, raw); localStorage.removeItem(k); });
  })();

  // ── Utils ─────────────────────────────────────────────────────────
  const wait      = ms => new Promise(r => setTimeout(r, ms));
  const $all      = (s, r = document) => r ? Array.from(r.querySelectorAll(s)) : [];
  const $one      = (s, r = document) => r?.querySelector(s) ?? null;
  const trim      = v  => { if (!v) return ""; const s = typeof v === "object" && v.textContent != null ? v.textContent : String(v); return s.replace(/\s+/g, " ").trim(); };
  const isVisible = el => { if (!el) return false; const s = getComputedStyle(el), r = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0" && r.width > 0 && r.height > 0; };
  const getLID    = ()  => { const m = location.pathname.match(/\/lesson\/\d+\/(CEV[^/?#]+)/); return m?.[1] ?? location.pathname.match(/\/lesson\/\d+\/([^/?#]+)/)?.[1] ?? null; };
  const getLNum   = ()  => location.pathname.match(/\/lesson\/(\d+)/)?.[1] ?? null;
  const getCID    = ()  => location.pathname.match(/\/(?:mycourses|app\/courses)\/([^/]+)/)?.[1] ?? null;
  const getStatus = id  => getLessons()[id]?.status ?? "unseen";
  const setStatus = (id, v) => patchLesson(id, { status: v });
  const getQCount = id  => getLessons()[id]?.qcount ?? 0;
  const setQCount = (id, n) => patchLesson(id, { qcount: n });
  const getQAMap  = id  => getAnswers()[id] ?? {};
  const hasAnswers= id  => { const d = getQAMap(id); return !!d.qaMap && Object.keys(d.qaMap).length > 0; };
  const fireEvents= (el, ...types) => types.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
  const readScore = ()  => ({ percentage: $one(".scoreCanvas .score-text")?.textContent?.trim() ?? null, points: $all(".scoreCanvas .score-text")[1]?.textContent?.trim() ?? null });

  const statusLabel = s => ({ unseen:"Not seen", running:"In progress", answers_saved:"Answers saved", answers_partial:"Partial answers", filled:"Filled ✓", error:"Error", unsafe:"Unsafe (1 attempt)", ext_attempted:"Already attempted" }[s] ?? s);
  const statusClass = s => ({ running:"running", answers_saved:"saved", answers_partial:"partial", filled:"filled", error:"error", unsafe:"unsafe", ext_attempted:"ext_attempted" }[s] ?? "unseen");
  const fmtScore    = sc => sc?.points ? `${sc.percentage} · ${sc.points}` : (sc?.percentage ?? "");
  const countSt     = s  => Object.values(getLessons()).filter(l => l.status === s).length;

  // ── Logs ──────────────────────────────────────────────────────────
  const MAX_LOGS = 80;
  function addLog(level, msg, data) {
    const logs = getJ(K.LOGS) || [], last = logs[logs.length - 1];
    if (last?.level === level && last?.msg === msg) { last.count = (last.count||1) + 1; last.t = Date.now(); setJ(K.LOGS, logs); refreshLogs(); return; }
    logs.push({ t: Date.now(), level, msg, data: data ? JSON.stringify(data).slice(0, 300) : undefined });
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    setJ(K.LOGS, logs); refreshLogs();
  }
  const logInfo  = (m, d) => { console.log(`[CEV] ${m}`, d||"");   addLog("info",  m, d); };
  const logWarn  = (m, d) => { console.warn(`[CEV] ${m}`, d||"");  addLog("warn",  m, d); };
  const logError = (m, d) => { console.error(`[CEV] ${m}`, d||""); addLog("error", m, d); navigator.clipboard?.writeText(`[CEV v${VERSION}]\n${m}\n${location.href}\n${d ? JSON.stringify(d).slice(0,200) : ""}`).catch(()=>{}); Toast.error(`Error logged. Report to <b>${DISCORD}</b> on Discord.<br><small>Copied to clipboard.</small>`, 12000); };

  // ── Toast (closed shadow DOM) ─────────────────────────────────────
  const Toast = (() => {
    const host = document.createElement("div"); host.setAttribute("data-x-ui","");
    const shadow = host.attachShadow({ mode:"closed" });
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;bottom:80px;right:20px;display:flex;flex-direction:column-reverse;gap:8px;z-index:2147483646;pointer-events:none;max-width:320px;";
    shadow.appendChild(document.createElement("style")).textContent = "*{box-sizing:border-box}";
    shadow.appendChild(wrap);
    document.documentElement.appendChild(host);

    const T = { info:{accent:"#2563eb",icon:"ℹ",bg:"#eff6ff",text:"#1e40af"}, ok:{accent:"#16a34a",icon:"✓",bg:"#f0fdf4",text:"#15803d"}, warn:{accent:"#d97706",icon:"!",bg:"#fffbeb",text:"#92400e"}, err:{accent:"#dc2626",icon:"✕",bg:"#fef2f2",text:"#991b1b"} };

    function show(html, type="info", dur=4000) {
      const d=T[type], el=document.createElement("div");
      el.style.cssText = `background:${d.bg};border:1px solid ${d.accent}33;border-left:3px solid ${d.accent};color:${d.text};padding:10px 14px 10px 12px;border-radius:8px;font-size:12px;line-height:1.5;font-family:-apple-system,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,0.1);opacity:0;transform:translateY(6px);transition:opacity 0.2s,transform 0.2s;display:flex;align-items:flex-start;gap:8px;pointer-events:all;`;
      el.innerHTML = `<span style="flex-shrink:0;font-weight:600;font-size:11px;margin-top:1px">${d.icon}</span><span>${html}</span>`;
      wrap.prepend(el);
      requestAnimationFrame(() => { el.style.opacity="1"; el.style.transform="none"; });
      setTimeout(() => { el.style.opacity="0"; el.style.transform="translateY(6px)"; setTimeout(()=>el.remove(),220); }, dur);
    }

    function bigWarn(msg) {
      shadow.querySelector("#cev-warn")?.remove();
      const b = document.createElement("div"); b.id = "cev-warn";
      b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#fef2f2;color:#991b1b;font-family:-apple-system,sans-serif;font-size:13px;padding:12px 20px;border-bottom:2px solid #dc2626;box-shadow:0 2px 8px rgba(220,38,38,0.15);display:flex;align-items:center;gap:10px;pointer-events:all;";
      b.innerHTML = `<span style="font-size:16px">⚠️</span><span style="flex:1">${msg}</span><span style="cursor:pointer;opacity:0.6;font-size:18px" onclick="this.parentElement.remove()">✕</span>`;
      shadow.appendChild(b);
    }
    return { info:(m,d)=>show(m,"info",d), ok:(m,d)=>show(m,"ok",d), warn:(m,d)=>show(m,"warn",d), error:(m,d)=>show(m,"err",d), bigWarn };
  })();

  // ── Panel (closed shadow DOM) ─────────────────────────────────────
  function buildPanel() {
    if (_shadowRoot) return;
    const host = document.createElement("div"); host.setAttribute("data-x-widget",""); host.style.cssText = "all:initial;position:fixed;z-index:2147483645;";
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
    `;
    _shadowRoot.appendChild(style);

    const lid = getLID(), st = lid ? getStatus(lid) : "unseen";
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
            <div class="sr" id="scorerow" style="display:${getLessons()[lid]?.score?"":"none"}"><span class="sk">Last Score</span><span class="sv" id="scoreval" style="color:#16a34a;font-weight:600">${fmtScore(getLessons()[lid]?.score)}</span></div>
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
        </div>
        <div class="pane" id="pane-answers"><div id="answers-content"><div class="ano-answers">Navigate to an assessment to see answers.</div></div></div>
        <div class="pane" id="pane-settings">
          <div class="card">
            <div class="ct">Automation</div>
            <div class="setrow"><div><div class="setlbl">Skip parse prompt</div><div class="setdsc">Don't ask when answers are incomplete</div></div><label class="tgl"><input type="checkbox" id="skipprompt" ${isSkipPrompt()?"checked":""}><div class="ttr"><div class="tth"></div></div></label></div>
            <div class="setrow"><div><div class="setlbl">Auto first run</div><div class="setdsc">Auto-navigate and submit unseen assessments</div></div><label class="tgl"><input type="checkbox" id="autofirst" ${isAutoFirstRun()?"checked":""}><div class="ttr"><div class="tth"></div></div></label></div>
            <div class="setrow"><div><div class="setlbl">Silent highlight</div><div class="setdsc">Mark correct answers without auto-filling</div></div><label class="tgl"><input type="checkbox" id="silenthl" ${isSilentHL()?"checked":""}><div class="ttr"><div class="tth"></div></div></label></div>
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
    const doMin = () => { if (panel.classList.contains("minimized")||panel.classList.contains("is-minimizing")) return; panel.classList.add("is-minimizing"); setTimeout(()=>{panel.classList.add("minimized");panel.classList.remove("is-minimizing");},130); };
    const doExp = () => { if (!panel.classList.contains("minimized")) return; panel.classList.add("is-expanding"); panel.classList.remove("minimized"); setTimeout(()=>panel.classList.remove("is-expanding"),420); };
    _shadowRoot.getElementById("minbtn").addEventListener("click", e=>{e.stopPropagation();doMin();});
    panel.addEventListener("click", ()=>{ if (panel.classList.contains("minimized")&&!_miniDragged) doExp(); });
    makeDraggable(panel, _shadowRoot.getElementById("hd"), false);
    makeDraggable(panel, panel, true);

    // Tabs
    _shadowRoot.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", ()=>{
      _shadowRoot.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      _shadowRoot.querySelectorAll(".pane").forEach(p=>p.classList.remove("active"));
      tab.classList.add("active");
      _shadowRoot.getElementById(`pane-${tab.dataset.tab}`)?.classList.add("active");
      if (tab.dataset.tab==="answers") refreshAnswersPane();
    }));

    // Auto toggle
    const autobig = _shadowRoot.getElementById("autobig");
    const setAutoUI = on => { autobig.querySelector(".abl").textContent = on?"Automation On":"Automation Off"; autobig.querySelector(".abs").textContent = on?"Click to disable":"Click to enable"; autobig.classList.toggle("off",!on); updateDot(); };
    autobig.addEventListener("click", ()=>{ const on=!isAutoOn(); saveSettings({auto:on}); _shadowRoot.getElementById("autotgl").checked=on; setAutoUI(on); Toast.info(on?"Automation enabled":"Automation disabled"); });
    _shadowRoot.getElementById("autotgl").addEventListener("change", e=>{ saveSettings({auto:e.target.checked}); setAutoUI(e.target.checked); });

    // Settings
    _shadowRoot.getElementById("skipprompt").addEventListener("change", e=>saveSettings({skipParsePrompt:e.target.checked}));
    _shadowRoot.getElementById("autofirst").addEventListener("change",  e=>saveSettings({autoFirstRun:e.target.checked}));
    _shadowRoot.getElementById("silenthl").addEventListener("change",   e=>{ saveSettings({silentHighlight:e.target.checked}); e.target.checked ? applySilentHL() : clearSilentHL(); });

    // Buttons
    _shadowRoot.getElementById("resetbtn").addEventListener("click", ()=>{
      const id=getLID(); if(!id) return;
      const l=getLessons(); delete l[id]; saveLessons(l);
      const a=getAnswers(); delete a[id]; saveAnswers(a);
      refreshPanelStatus(); Toast.warn(`Reset ${id}`);
    });
    _shadowRoot.getElementById("clearqbtn").addEventListener("click", ()=>{ clearQueue(); clearPending(); refreshPanelStatus(); Toast.warn("Queue cleared"); });
    _shadowRoot.getElementById("clrlogs").addEventListener("click", ()=>{ setJ(K.LOGS,[]); refreshLogs(); });
    _shadowRoot.getElementById("lgsearch").addEventListener("input", ()=>refreshLogs());
    _shadowRoot.getElementById("exportbtn").addEventListener("click", ()=>{
      const data={lessons:getLessons(),answers:getAnswers(),settings:getSettings(),queue:getQueue(),exported:new Date().toISOString()};
      const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})); a.download=`cev-data-${Date.now()}.json`; a.click();
      Toast.ok("Data exported");
    });
    _shadowRoot.getElementById("nukebtn").addEventListener("click", ()=>{
      if (!confirm("Wipe ALL CEV data? This cannot be undone.")) return;
      GM_listValues().forEach(k=>GM_deleteValue(k));
      Toast.warn("All data wiped. Reload to reinitialize.");
    });
  }

  // ── Answers Pane ──────────────────────────────────────────────────
  function refreshAnswersPane() {
    if (!_shadowRoot) return;
    const el = _shadowRoot.getElementById("answers-content"); if (!el) return;
    const lid = getLID();
    if (!lid || !hasAnswers(lid)) { el.innerHTML = `<div class="ano-answers">${lid?"No saved answers for this lesson yet.":"Navigate to an assessment to see answers."}</div>`; return; }

    const { qaMap } = getQAMap(lid);
    const typeLabels = { choice:"Multiple Choice",text:"Short Answer",dropdown:"Fill in the Blank",order:"Ordering",token:"Highlight",matrix:"Matrix",cloze:"Drag & Drop",assoc:"Matching",imagecloze:"Image Blanks" };

    function getStimLive(w) {
      const std = $one(".lrn_stimulus_content", w); if (std) return trim(std);
      function fromTitle(el) { if (!el) return null; const c=el.cloneNode(true); c.querySelectorAll(".visually-hidden,.lrn-circle,[aria-hidden],canvas").forEach(e=>e.remove()); return trim(c)||null; }
      const inner = $one(".lrn-report-item-title", w); if (inner) { const t=fromTitle(inner); if(t) return t; }
      const ri = w.closest(".lrn-report-item,.lrn_report_item,[class*='report-item']");
      if (ri) { const title=$one(".lrn-report-item-title,.lrn_report_item_title,h3,h4",ri); if(title&&title!==w){const t=fromTitle(title);if(t)return t;} }
      return $one(".lrn_stem,.lrn-stem,.lrn_question_title",w) ? trim($one(".lrn_stem,.lrn-stem,.lrn_question_title",w)) : (w.id||null);
    }

    // liveWidgets used only for MCQ option rendering — needs stimulus text
    const liveWidgets = $all(".lrn_widget[id]").filter(w=>!!getStimLive(w));

    // Build URL→data lookup for imageCloze entries
    const icStoredByUrl = {};
    if (qaMap.imageCloze) {
      const ic = qaMap.imageCloze;
      if (ic.type === "imagecloze") {
        icStoredByUrl["__direct__"] = ic;
      } else {
        Object.entries(ic).forEach(([url, data]) => {
          icStoredByUrl[url.replace(/^https?:/, "").split("?")[0]] = data;
        });
      }
    }
    Object.entries(qaMap).forEach(([k, v]) => { if (v?.type === "imagecloze" && v.answers) icStoredByUrl[k] = v; });
    const icUrlKeys = Object.keys(icStoredByUrl);

    // Walk ALL widgets in DOM order to assign correct sequential numbers.
    // imagecloze widgets have no stimulus text so they get matched by image URL or index.
    let icIdx = 0;
    const allWidgets = $all(".lrn_widget[id]");
    const widgetEntries = [];
    allWidgets.forEach((w, domIdx) => {
      const isIC = w.classList.contains("lrn_imageclozedropdown") || w.classList.contains("lrn_imagecloze");
      let key, data;

      if (isIC) {
        const img = $one("img.lrn_imagecloze_image,img", w);
        const norm = img ? img.src.replace(/^https?:/, "").split("?")[0] : null;
        const urlKey = norm && icStoredByUrl[norm] ? norm : icUrlKeys[icIdx] ?? null;
        if (!urlKey) { icIdx++; return; }
        key = "__ic__" + urlKey;
        data = icStoredByUrl[urlKey];
        icIdx++;
      } else {
        const stim = getStimLive(w);
        if (!stim) return;
        key = stim;
        data = qaMap[stim];
        if (!data) return;
      }

      // Prefer an explicit question number from the page heading, fall back to DOM position
      let num = domIdx + 1;
      const ri = w.closest(".lrn-report-item,.lrn_report_item,[class*='report-item'],.item-card");
      if (ri) { const h=$one(".lrn-report-item-title,.lrn_report_item_title,h3,h4,.item-number",ri); if(h){const m=h.textContent.match(/\b(\d+)\b/);if(m)num=parseInt(m[1],10);} }
      widgetEntries.push({ key, num, data });
    });

    // Re-number by sorted DOM position so gaps in heading numbers don't matter
    widgetEntries.sort((a,b)=>a.num-b.num);
    widgetEntries.forEach((e,i)=>e.num=i+1);

    const orderedKeys = widgetEntries.map(e=>e.key);
    const numMap  = Object.fromEntries(widgetEntries.map(e=>[e.key,e.num]));
    const dataMap = Object.fromEntries(widgetEntries.map(e=>[e.key,e.data]));

    // Append assoc and any remaining qaMap keys not yet covered
    if (qaMap.assoc && !orderedKeys.includes("assoc")) orderedKeys.push("assoc");
    Object.keys(qaMap).forEach(k=>{ if(k!=="imageCloze"&&!orderedKeys.includes(k)) orderedKeys.push(k); });

    let fallback = widgetEntries.length;
    const blocks = [];

    function renderBlock(key, q, num) {
      if (!q||typeof q!=="object") return null;
      if (key==="imageCloze"&&!q.type) return null;
      const isIC = key.startsWith("__ic__");
      const isUUID = !isIC && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(key);
      const shortQ = isIC ? "Image cloze" : isUUID ? "(question text unavailable)" : (key.length>120?key.slice(0,120)+"…":key);
      let inner = "";
      switch (q.type) {
        case "choice": {
          const widget = liveWidgets.find(w=>getStimLive(w)===key);
          if (widget) $all("li.lrn-mcq-option",widget).forEach(li=>{ const t=trim($one(".lrn_contentWrapper",li)||$one(".lrn-possible-answer",li)||li); inner+=`<div class="aopt${t===q.answer?" correct":""}"><div class="aopt-radio"></div><span>${t}</span></div>`; });
          else inner=`<div class="aopt correct"><div class="aopt-radio"></div><span>${q.answer}</span></div>`;
          break;
        }
        case "text": inner=`<div class="atxt">✎ ${q.answer}</div>`; break;
        case "dropdown": case "imagecloze":
          inner=q.answers.map((a,i)=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:10px;color:#9ca3af;min-width:50px">Blank ${i+1}:</span><span class="adrop">${a}</span></div>`).join(""); break;
        case "order": inner=`<div style="font-size:10px;color:#9ca3af;margin-bottom:4px">Drag into this order:</div><ol class="aorder">${q.items.map((t,i)=>`<li data-n="${i+1}">${t}</li>`).join("")}</ol>`; break;
        case "token": inner=`<div style="font-size:10px;color:#9ca3af;margin-bottom:4px">Highlight these:</div><div class="atokens">${q.answers.map(a=>`<span class="atoken">${a}</span>`).join("")}</div>`; break;
        case "matrix": case "assoc": case "cloze":
          inner = q.type==="cloze"
            ? Object.entries(q.answers).map(([i,a])=>`<div class="adragzone">Blank ${+i+1}: ${a}</div>`).join("")
            : Object.entries(q.answers).map(([k,v])=>`<div class="apair"><span class="apair-q">${k}</span><span class="apair-arrow">→</span><span class="apair-a">${v}</span></div>`).join(""); break;
        default: inner=`<div class="atxt">${JSON.stringify(q).slice(0,100)}</div>`;
      }
      const displayKey = key==="assoc" ? "Matching questions" : shortQ;
      const tl = typeLabels[q.type]??q.type;
      return `<div class="aqblock"><div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#2563eb;color:white;font-size:10px;font-weight:700;flex-shrink:0">${num}</span><div class="aqtype" style="margin-bottom:0">${tl}</div></div><div class="aqq">${displayKey}</div>${inner}</div>`;
    }

    for (const key of orderedKeys) {
      // Use dataMap first (covers __ic__ synthetic keys), fall back to qaMap for regular keys
      const q = dataMap[key] ?? qaMap[key];
      if (!q) continue;
      if (key==="imageCloze"&&!q.type) continue;
      const block = renderBlock(key, q, numMap[key]??(++fallback));
      if (block) blocks.push(block);
    }
    el.innerHTML = blocks.length ? blocks.join("") : `<div class="ano-answers">No parseable answers in store.</div>`;
  }

  // ── Silent Highlight ──────────────────────────────────────────────
  const HL_ATTR = "data-x-hl";
  function clearSilentHL() {
    document.querySelectorAll(`[${HL_ATTR}]`).forEach(el=>{ el.style.cssText=el.getAttribute("data-x-hl-orig")||""; el.removeAttribute(HL_ATTR); el.removeAttribute("data-x-hl-orig"); });
  }
  function applySilentHL() {
    clearSilentHL();
    const lid = getLID(); if (!lid||!hasAnswers(lid)) return;
    const { qaMap } = getQAMap(lid);
    function hl(el, css) { el.setAttribute("data-x-hl-orig",el.style.cssText||""); el.setAttribute(HL_ATTR,"styled"); Object.assign(el.style,css); }
    const green = { background:"rgba(240,253,244,0.7)", outline:"2px solid #86efac", outlineOffset:"2px", borderRadius:"6px" };
    const greenSel = sel => { hl(sel,{background:"rgba(240,253,244,0.8)",outline:"2px solid #86efac",outlineOffset:"1px"}); Array.from(sel.options).forEach(o=>{ if(o.textContent.trim()===sel._cevAns) hl(o,{color:"#15803d",fontWeight:"600"}); }); };

    $all(".lrn_widget[id]").forEach(w=>{
      const stimulus=trim($one(".lrn_stimulus_content",w)); if(!stimulus) return;
      const q=qaMap[stimulus]; if(!q) return;
      switch (q.type) {
        case "choice": $all("li.lrn-mcq-option",w).forEach(li=>{ if(trim($one(".lrn_contentWrapper",li)||$one(".lrn-possible-answer",li)||li)===q.answer) hl(li,green); }); break;
        case "token":  $all(".lrn_token",w).forEach(t=>{ if(q.answers.includes(trim($one("span",t)||t))) hl(t,{background:"rgba(254,249,195,0.8)",outline:"2px solid #fde047",outlineOffset:"2px",borderRadius:"4px"}); }); break;
        case "matrix": $all("tr.lrn_stem",w).forEach(row=>{ const stmt=trim($one("th .lrn-stem-text,th .lrn_stem_label,th",row)),ans=q.answers[stmt]; if(!ans) return; $all("td.lrn_option,td[role='radio']",row).forEach(td=>{ if(trim($one("label .lrn_option_text,label",td))===ans) hl(td,{background:"rgba(240,253,244,0.8)",outline:"2px solid #86efac",outlineOffset:"-2px"}); }); }); break;
        case "dropdown": $all(".lrn_combobox",w).forEach((combo,i)=>{ const ans=q.answers[i]; if(!ans) return; const sp=$one(".lrn_clozedropdown_answer",combo),sel=$one("select",combo); if(sp) hl(sp,{...green,background:"rgba(240,253,244,0.9)"}); else if(sel){sel._cevAns=ans;greenSel(sel);} }); break;
        case "imagecloze": $all(".lrn_imagecloze_response",w).forEach((r,i)=>{ const ans=q.answers[i]; if(!ans) return; const sp=$one(".lrn_clozedropdown_answer",r),sel=$one("select",r); if(sp) hl(sp,{...green,background:"rgba(240,253,244,0.9)"}); else if(sel){sel._cevAns=ans;greenSel(sel);} }); break;
        case "cloze":  Object.entries(q.answers).forEach(([idx])=>{ const zones=$all(".lrn_response_container",w),zone=zones[parseInt(idx,10)]||zones.find(d=>!$one(".lrn_btn_drag",d)); if(zone) hl(zone,{outline:"2px solid #86efac",outlineOffset:"2px",borderRadius:"4px",background:"rgba(240,253,244,0.4)"}); }); break;
        case "assoc":  $all(".lrn_assoc_row",w).forEach(row=>{ const dz=$one(".lrn_response_container",row); if(dz) hl(dz,{outline:"2px solid #86efac",outlineOffset:"2px",borderRadius:"4px",background:"rgba(240,253,244,0.4)"}); }); break;
        case "text":   { const inp=$one("input[type=text],textarea",w); if(inp) hl(inp,{outline:"2px solid #86efac",background:"rgba(240,253,244,0.6)"}); break; }
        case "order":  $all(".lrn_source .lrn_draggable",w).forEach(el=>{ if(q.items.includes(trim($one(".lrn_item",el)||el))) hl(el,{outline:"2px solid #c4b5fd",outlineOffset:"2px",borderRadius:"4px",background:"rgba(245,243,255,0.6)"}); }); break;
      }
    });

    // imageCloze containers by image URL
    const icMap = {};
    if (qaMap.imageCloze) {
      qaMap.imageCloze.type==="imagecloze" ? (icMap["__d__"]=qaMap.imageCloze.answers) : Object.entries(qaMap.imageCloze).forEach(([u,d])=>{ if(d?.answers) icMap[u]=d.answers; });
    }
    Object.entries(qaMap).forEach(([k,v])=>{ if(v?.type==="imagecloze"&&v.answers) icMap[k]=v.answers; });
    $all(".lrn_imagecloze_container").forEach((c,ci)=>{
      const img=$one("img.lrn_imagecloze_image,img",c),url=img?img.src.replace(/^https?:/,"").split("?")[0]:null;
      const answers=url?(icMap[url]||icMap["https:"+url]||icMap["http:"+url]||Object.values(icMap)[ci]):Object.values(icMap)[ci];
      if (!answers) return;
      $all(".lrn_imagecloze_response",c).forEach((r,i)=>{ const ans=answers[i]; if(!ans) return; const sp=$one(".lrn_clozedropdown_answer",r),sel=$one("select",r); if(sp) hl(sp,{...green,background:"rgba(240,253,244,0.9)"}); else if(sel){sel._cevAns=ans;greenSel(sel);} });
    });

    // Standalone cloze dropdowns
    const ddData = Object.values(qaMap).filter(q=>q.type==="dropdown");
    $all(".lrn_clozedropdown").forEach((c,qi)=>{ const qd=ddData[qi]; if(!qd) return; $all(".lrn_combobox",c).forEach((combo,i)=>{ const ans=qd.answers[i]; if(!ans) return; const sp=$one(".lrn_clozedropdown_answer",combo),sel=$one("select",combo); if(sp) hl(sp,{...green,background:"rgba(240,253,244,0.9)"}); else if(sel){sel._cevAns=ans;greenSel(sel);} }); });
  }

  // ── Draggable ─────────────────────────────────────────────────────
  function makeDraggable(panel, handle, miniMode) {
    let ox=0,oy=0,sx=0,sy=0,active=false;
    handle.addEventListener("mousedown", e=>{
      if (miniMode&&!panel.classList.contains("minimized")) return;
      if (!miniMode&&panel.classList.contains("minimized")) return;
      if (!miniMode&&e.target.closest(".hbtn")) return;
      active=true; _miniDragged=false;
      const r=panel.getBoundingClientRect(); sx=e.clientX; sy=e.clientY; ox=r.left; oy=r.top;
      panel.style.right="unset"; panel.style.bottom="unset"; panel.style.left=ox+"px"; panel.style.top=oy+"px";
      document.body.style.userSelect="none"; e.preventDefault();
    });
    document.addEventListener("mousemove", e=>{ if(!active) return; const dx=e.clientX-sx,dy=e.clientY-sy; if(Math.abs(dx)>4||Math.abs(dy)>4) _miniDragged=true; const pw=miniMode?48:panel.offsetWidth,ph=miniMode?48:panel.offsetHeight; panel.style.left=Math.max(0,Math.min(window.innerWidth-pw,ox+dx))+"px"; panel.style.top=Math.max(0,Math.min(window.innerHeight-ph,oy+dy))+"px"; });
    document.addEventListener("mouseup", ()=>{ if(!active) return; active=false; document.body.style.userSelect=""; setJ(K.POS,{x:parseInt(panel.style.left),y:parseInt(panel.style.top)}); setTimeout(()=>{_miniDragged=false;},100); });
  }

  // ── Panel status refresh ──────────────────────────────────────────
  function updateDot() { if (!_shadowRoot) return; const dot=_shadowRoot.getElementById("dot"); if(dot) dot.className="dot"+(isAutoOn()?"":" off"); }
  function refreshPanelStatus() {
    if (!_shadowRoot) return;
    const id=getLID(),s=id?getStatus(id):"unseen";
    const sb=_shadowRoot.getElementById("sbadge"); if(sb&&id){sb.textContent=statusLabel(s);sb.className=`badge ${statusClass(s)}`;}
    const sc=id?getLessons()[id]?.score:null, row=_shadowRoot.getElementById("scorerow"), val=_shadowRoot.getElementById("scoreval");
    if(row&&val){row.style.display=sc?"":"none";val.textContent=fmtScore(sc);}
    const lidEl=_shadowRoot.getElementById("lid"); if(lidEl) lidEl.textContent=id??"Not on assessment";
    const q=getQueue().length, qv=_shadowRoot.getElementById("qval"), qbar=_shadowRoot.getElementById("qbar");
    if(qv) qv.textContent=`${q} assessment${q!==1?"s":""}`;
    if(qbar) qbar.style.width=`${Math.min(q*10,100)}%`;
    const sf=_shadowRoot.getElementById("stfilled"),ss=_shadowRoot.getElementById("stsaved"),se=_shadowRoot.getElementById("sterrors");
    if(sf) sf.textContent=countSt("filled"); if(ss) ss.textContent=countSt("answers_saved");
    if(se){const ec=countSt("error");se.textContent=ec;se.style.color=ec>0?"#dc2626":"";}
    updateDot();
  }

  function refreshLogs() {
    if (!_shadowRoot) return;
    const el=_shadowRoot.getElementById("logslist"); if(!el) return;
    const query=(_shadowRoot.getElementById("lgsearch")?.value||"").trim().toLowerCase();
    const logs=(getJ(K.LOGS)||[]).slice().reverse();
    if (!logs.length){el.innerHTML=`<div style="color:#9ca3af;font-size:11px;text-align:center;padding:12px">No logs yet</div>`;return;}
    function hl(t,q){if(!q)return t;return t.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi"),"<mark>$1</mark>");}
    const filtered=query?logs.filter(l=>l.msg.toLowerCase().includes(query)||(l.data||"").toLowerCase().includes(query)):logs;
    if(!filtered.length){el.innerHTML=`<div style="color:#9ca3af;font-size:11px;text-align:center;padding:12px">No matches for "${query}"</div>`;return;}
    el.innerHTML=filtered.map(l=>{
      const t=new Date(l.t),ts=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}`;
      const cnt=l.count&&l.count>1?`<span class="lgc">×${l.count}</span>`:"";
      const data=l.data?`<div style="color:#9ca3af;margin-top:2px;font-size:10px;word-break:break-all">${hl(l.data,query)}</div>`:"";
      return `<div class="lg ${l.level}"><span class="lgt">${ts}</span>${hl(l.msg,query)}${cnt}${data}</div>`;
    }).join("");
  }

  // ── Wait helpers ──────────────────────────────────────────────────
  async function waitFor(sel, check, label) {
    const deadline=Date.now()+TIMEOUT;
    while (Date.now()<deadline) { const el=$one(sel); if(el&&isVisible(el)&&check(el)){await wait(POST_LOAD);return true;} await wait(WAIT_MS); }
    logError(`Timeout: ${label}`); return false;
  }
  async function waitForSummary() {
    const deadline=Date.now()+TIMEOUT;
    while (Date.now()<deadline) { const ws=$all(".lrn_widget[id]"); if(ws.some(w=>$one(".lrn_stimulus_content",w)||$one(".lrn_correctAnswerList",w)||$one(".lrn_valid,.lrn_correct",w))){await wait(POST_LOAD);return true;} await wait(WAIT_MS); }
    if ($all(".lrn_widget[id]").length>0){logWarn("waitForSummary: fallback");await wait(POST_LOAD);return true;}
    logError("Timeout: summary"); return false;
  }
  const waitForLesson    = () => waitFor(".lrn_response_wrapper,.lrn-assess-content,.lrn_mcq", el=>el.children.length>0, "assessment");
  const waitForFinishBtn = () => waitFor("button.test-dialog-save-submit,button.lrn_btn_blue.test-submit,button.test-submit", el=>isVisible(el), "Finish button");

  function setSelectValue(sel, text) { const opt=Array.from(sel.options).find(o=>o.textContent.trim()===text); if(!opt){logWarn(`Option not found: "${text}"`);return false;} sel.value=opt.value; fireEvents(sel,"change","input"); return true; }

  function navigateToCourses() {
    const cid=getCID(),ln=getLNum()??location.pathname.match(/\/lessons\/(\d+)/)?.[1];
    const dest=cid&&ln?`https://login.icevonline.com/app/courses/${cid}/lessons/${ln}`:cid?`https://login.icevonline.com/app/courses/${cid}/lessons`:null;
    if (!dest||location.pathname.startsWith(`/app/courses/${cid}/lessons`)) return;
    location.href=dest;
  }

  // ── API ───────────────────────────────────────────────────────────
  async function fetchActivities(cid, ln) {
    try { const r=await fetch(`https://login.icevonline.com/api/v1/courses/${cid}/lessons/${ln}/activities`,{credentials:"include",headers:{Accept:"application/json"}}); return r.ok?await r.json():null; } catch{return null;}
  }
  async function getAttemptMap(cid, ln) {
    const data=await fetchActivities(cid,ln); if(!data) return null;
    const map={},items=Array.isArray(data)?data:(data.activities||data.data||[]);
    for (const item of items){const raw=item.activity_id||item.activityId||item.id||"";const m=String(raw).match(/(CEV[^/?#\s]+)/);if(!m)continue;map[m[1]]={taken:parseInt(item.attempts_taken??item.attemptsTaken??item.taken??0,10),total:parseInt(item.max_attempts??item.maxAttempts??item.total??3,10)};}
    return Object.keys(map).length?map:null;
  }

  // ── Submit ────────────────────────────────────────────────────────
  async function submitAssessment() {
    if (!isAutoOn()){Toast.warn("Automation off — not submitting");return;}
    logInfo("Submitting…"); Toast.info("Submitting…",2000);
    $one("button.test-submit")?.click(); await wait(1000);
    let btn=$one("button.test-dialog-save-submit");
    if (!btn||!isVisible(btn)) btn=$one("button.lrn_btn_blue.test-submit,button.test-submit.btn-lg");
    if (!btn||!isVisible(btn)){const found=await waitForFinishBtn();if(!found){logError("Confirm button not found");return;} btn=$one("button.test-dialog-save-submit")||$one("button.lrn_btn_blue.test-submit");}
    if (!btn){logError("Finish button missing");return;}
    btn.click(); Toast.ok("Submitted! Waiting for results…",5000); logInfo("Submitted");
    const id=getLID();if(id){setStatus(id,"filled");refreshPanelStatus();}
    if (isAutoOn()) setTimeout(()=>advanceQueue(),3000);
  }

  // ── Parse prompt ──────────────────────────────────────────────────
  function showParsePrompt({ lessonID, parsed, total }) {
    return new Promise(resolve=>{
      _shadowRoot?.querySelector("#parse-overlay")?.remove();
      const pct=total>0?`~${Math.round((parsed/total)*100)}%`:"unknown";
      const overlay=document.createElement("div"); overlay.id="parse-overlay";
      overlay.style.cssText="position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',-apple-system,sans-serif;";
      overlay.innerHTML=`<div style="background:white;border-radius:12px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden"><div style="background:#fef2f2;padding:16px 20px;border-bottom:1px solid #fecaca;display:flex;gap:10px;align-items:center"><span style="font-size:18px">⚠️</span><div><div style="font-weight:600;color:#991b1b;font-size:14px">Incomplete parse</div><div style="font-size:12px;color:#dc2626;margin-top:2px">${lessonID}</div></div></div><div style="padding:20px"><p style="margin:0 0 12px;font-size:13px;color:#374151;line-height:1.6">Only <strong>${parsed}</strong> of <strong>${total}</strong> questions were parsed.</p><div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center;margin:12px 0"><div style="font-size:32px;font-weight:700;color:#16a34a">${pct}</div><div style="font-size:11px;color:#9ca3af;margin-top:4px">estimated score</div></div><p style="margin:0 0 16px;font-size:11px;color:#9ca3af">Disable in Settings → Skip parse prompt.</p><div style="display:flex;gap:8px"><button id="pyes" style="flex:1;padding:9px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Continue anyway</button><button id="pno" style="flex:1;padding:9px;background:white;color:#374151;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Stop & fix manually</button></div></div></div>`;
      (_shadowRoot||document.documentElement).appendChild(overlay);
      overlay.querySelector("#pyes").onclick=()=>{overlay.remove();resolve(true);};
      overlay.querySelector("#pno").onclick=()=>{overlay.remove();resolve(false);};
    });
  }

  // ── Summary Parser ────────────────────────────────────────────────
  async function parseSummary(thenNavigateTo=null) {
    if (!isAutoOn()){Toast.warn("Automation off — not parsing");return;}
    const lid=getLID(); if(!lid){logError("Cannot detect lesson ID");return;}
    logInfo(`Parsing ${lid}…`);
    const qaMap={};let count=0;

    function getStimulus(w) {
      const std=$one(".lrn_stimulus_content",w); if(std) return trim(std);
      function fromTitle(el){if(!el)return null;const c=el.cloneNode(true);c.querySelectorAll(".visually-hidden,.lrn-circle,[aria-hidden],canvas,span[class*='score']").forEach(e=>e.remove());return trim(c)||null;}
      const inner=$one(".lrn-report-item-title",w); if(inner){const t=fromTitle(inner);if(t)return t;}
      const ri=w.closest(".lrn-report-item,.lrn_report_item,[class*='report-item']");
      if(ri){const title=$one(".lrn-report-item-title,.lrn_report_item_title,h3,h4",ri);if(title&&title!==w){const t=fromTitle(title);if(t)return t;}}
      const stem=$one(".lrn_stem,.lrn-stem,.lrn_question_title,.question-title",w); if(stem) return trim(stem);
      return w.id||null;
    }

    function getComboAnswers(w) {
      const combos=$all(".lrn_combobox.lrn_correct,.lrn_combobox.lrn_valid",w);
      if(!combos.length) return [];
      return combos.map(c=>({idx:parseInt($one("select",c)?.dataset?.inputid??"0",10),val:trim($one(".lrn_clozedropdown_answer",c))})).filter(o=>o.val).sort((a,b)=>a.idx-b.idx).map(o=>o.val);
    }

    $all(".lrn_widget[id]").forEach(w=>{
      const stimulus=getStimulus(w); if(!stimulus) return;
      const cls=w.classList;

      if (cls.contains("lrn_mcq")) {
        const cl=$one("li.lrn-mcq-option.lrn_correct,li.lrn-mcq-option.lrn_valid",w)||
          $all("li.lrn-mcq-option",w).find(li=>trimText($one(".sr-only",li)).toLowerCase().includes("correct answer"));
        if(cl){const a=trim($one(".lrn_contentWrapper",cl))||trim($one(".lrn-label-disabled",cl))||trim($one(".lrn-possible-answer",cl));if(a){qaMap[stimulus]={type:"choice",answer:a};count++;}}
        else logWarn(`MCQ no correct: ${stimulus.slice(0,50)}`);
        return;
      }
      if (cls.contains("lrn_sortlist")) {
        let items=$all(".lrn_target .lrn_response_container",w).map(c=>trim($one(".lrn_item",c))).filter(Boolean);
        if(!items.length) items=$all(".lrn_correctAnswerList li",w).map(li=>trim($one(".lrn_responseText",li))).filter(Boolean);
        if(items.length){qaMap[stimulus]={type:"order",items};count++;} return;
      }
      if (cls.contains("lrn_clozedropdown")) {
        let a=$all(".lrn_correctAnswerList .lrn_responseText,.lrn_correctAnswerList li",w).map(trim).filter(Boolean);
        if(!a.length) a=getComboAnswers(w);
        if(!a.length) a=$all(".lrn_clozedropdown_answer,.lrn_correct .lrn_responseText,.lrn_valid .lrn_responseText",w).map(trim).filter(Boolean);
        if(a.length){qaMap[stimulus]={type:"dropdown",answers:a};count++;} return;
      }
      if (cls.contains("lrn_tokenhighlight")) {
        const a=$all(".lrn_tokenhighlight_text .lrn_valid span",w).map(trim).filter(Boolean);
        if(a.length){qaMap[stimulus]={type:"token",answers:[...new Set(a)]};count++;} return;
      }
      if (cls.contains("lrn_choicematrix")) {
        const a={};
        $all("tr.lrn_stem",w).forEach(row=>{const stmt=trim($one("th .lrn-stem-text,th .lrn_stem_label,th",row)),lbl=trim($one("label .lrn_option_text,label",$one("td.lrn_valid",row)));if(stmt&&lbl)a[stmt]=lbl;});
        if(Object.keys(a).length){qaMap[stimulus]={type:"matrix",answers:a};count++;} return;
      }
      if (cls.contains("lrn_association")||cls.contains("lrn_assoc")) {
        const tables=$all(".lrn_assoc_table",w),ansLists=$all(".lrn_correctAnswerList",w),rowMap={};
        tables.forEach((t,ti)=>{ const al=$all("li",ansLists[ti]||w); $all(".lrn_assoc_row",t).forEach((r,ri)=>{ const q=trim($one(".lrn_assoc_question,.lrn_stem_label",r)),a=trim($one(".lrn_responseText",al[ri])); if(q&&a) rowMap[q]=a; }); });
        if(Object.keys(rowMap).length){qaMap.assoc={type:"assoc",answers:rowMap};count++;} return;
      }
      if (cls.contains("lrn_imageclozedropdown")||cls.contains("lrn_imagecloze")) {
        const img=$one("img.lrn_imagecloze_image,img[class*='imagecloze'],img",w),url=img?img.src.split("?")[0]:null;
        let a=$all(".lrn_correctAnswerList .lrn_responseText,.lrn_correctAnswerList li",w).map(trim).filter(Boolean);
        if(!a.length) a=getComboAnswers(w);
        if(!a.length) a=$all(".lrn_clozedropdown_answer",w).map(trim).filter(Boolean);
        if(a.length){if(url){if(!qaMap.imageCloze)qaMap.imageCloze={};qaMap.imageCloze[url]={type:"imagecloze",answers:a};}else{qaMap[stimulus]={type:"imagecloze",answers:a};}count++;} return;
      }
      if (cls.contains("lrn_shorttext")||cls.contains("lrn_formulaessay")) {
        const a=trim($one(".lrn_correctAnswerList .lrn_responseText,.lrn_correct_answer",w));
        if(a){qaMap[stimulus]={type:"text",answer:a};count++;} return;
      }
      if (cls.contains("lrn_clozeassociation")||cls.contains("lrn_clozednd")) {
        const a={};
        $all(".lrn_correctAnswerList li",w).forEach((li,i)=>{const t=trim($one(".lrn_responseText",li)||li);if(t)a[i]=t;});
        if(Object.keys(a).length){qaMap[stimulus]={type:"cloze",answers:a};count++;}
      }
    });

    const totalWidgets=$all(".lrn_widget[id]").filter(w=>$one(".lrn_stimulus_content",w)||$one(".lrn_correctAnswerList",w)||$one(".lrn_valid,.lrn_correct",w)).length;
    const isPartial=totalWidgets>0&&count<totalWidgets, isEmpty=count===0;
    logInfo(`Parsed ${count}/${totalWidgets} for ${lid}`);

    if (isEmpty||isPartial) {
      if (!isEmpty) {
        const _as=getAnswers();_as[lid]={lessonID:lid,qaMap,savedAt:Date.now()};saveAnswers(_as);
        setStatus(lid,"answers_partial");refreshPanelStatus();Toast.warn(`Partial: ${count}/${totalWidgets}`,5000);logWarn(`Partial parse ${count}/${totalWidgets}`,{lid});
      } else {
        setStatus(lid,"error");refreshPanelStatus();logError(`Zero answers for ${lid}`,{totalWidgets});
      }
      if (isSkipPrompt()&&!isEmpty){Toast.warn(`Continuing with ${count}/${totalWidgets}…`,4000);if(isAutoOn())setTimeout(()=>{location.href=thenNavigateTo??location.pathname.replace(/\/summary.*$/,"");},2000);return;}
      if (isSkipPrompt()&&isEmpty){if(isAutoOn())setTimeout(()=>advanceQueue(),3000);return;}
      const go=await showParsePrompt({lessonID:lid,parsed:isEmpty?0:count,total:totalWidgets});
      if (!go){
        saveSettings({auto:false});
        const ab=_shadowRoot?.getElementById("autobig");
        if(ab){ab.querySelector(".abl").textContent="Automation Off";ab.querySelector(".abs").textContent="Click to enable";ab.classList.add("off");}
        if(_shadowRoot)_shadowRoot.getElementById("autotgl").checked=false;
        updateDot();Toast.warn("Automation off — fix manually.",10000);return;
      }
      if(isEmpty){if(isAutoOn())setTimeout(()=>advanceQueue(),2000);return;}
    } else {
      const _as=getAnswers();_as[lid]={lessonID:lid,qaMap,savedAt:Date.now()};saveAnswers(_as);
      setStatus(lid,"answers_saved");refreshPanelStatus();
      Toast.ok(`Saved ${count} answers for ${lid}`,5000);logInfo(`Saved ${count} for ${lid}`);
    }
    if (isAutoOn()){Toast.info("Navigating to fill…",3000);setTimeout(()=>{location.href=thenNavigateTo??location.pathname.replace(/\/summary.*$/,"");},2000);}
  }

  // ── Fill Assessment ───────────────────────────────────────────────
  async function fillAssessment() {
    if (!isAutoOn()){Toast.warn("Automation off — not filling");return;}
    const lid=getLID(); if(!lid){logError("Cannot detect lesson ID for fill");return;}
    const status=getStatus(lid);
    if(status==="unsafe"){Toast.bigWarn(`${lid} is marked UNSAFE.`);return;}
    if(status==="error") {Toast.bigWarn(`${lid} has a parse error.`);return;}
    if(!hasAnswers(lid)){logError("No saved answers",{lid});Toast.bigWarn("No saved answers — cannot fill.");return;}
    const {qaMap}=getQAMap(lid);let filled=0;
    logInfo(`Filling ${lid}…`);Toast.info("Filling answers…",3000);

    const ddData=Object.values(qaMap).filter(q=>q.type==="dropdown");
    $all(".lrn_clozedropdown").forEach((c,qi)=>{ const qd=ddData[qi];if(!qd)return; $all("select",c).forEach((sel,i)=>{const a=qd.answers[i];if(a&&setSelectValue(sel,a))filled++;});});

    if (qaMap.imageCloze) {
      $all(".lrn_imagecloze_container").forEach(c=>{ const img=$one("img.lrn_imagecloze_image,img[class*='imagecloze']",c);if(!img)return; const data=qaMap.imageCloze[img.src.split("?")[0]];if(!data)return; $all(".lrn_imagecloze_response select,select",c).forEach((sel,i)=>{const a=data.answers[i];if(a&&setSelectValue(sel,a)){fireEvents(sel,"input");filled++;}});});
    }

    $all(".lrn_widget[id]").forEach(w=>{
      const stimulus=trim($one(".lrn_stimulus_content",w));if(!stimulus)return;
      const q=qaMap[stimulus];if(!q)return;
      switch(q.type){
        case "choice":{const m=$all("li.lrn-mcq-option label",w).find(l=>trim($one(".lrn_contentWrapper",l))===q.answer);if(m){const inp=m.closest("li")?.querySelector("input[type=radio]");inp?inp.click():m.click();filled++;}break;}
        case "token": $all(".lrn_token",w).filter(t=>q.answers.includes(trim($one("span",t)||t))&&t.getAttribute("aria-pressed")!=="true").forEach(t=>{t.click();filled++;});break;
        case "cloze": Object.values(q.answers).forEach(ans=>{const dz=$all(".lrn_response_container",w).find(d=>!$one(".lrn_btn_drag",d));const drag=$all(".lrn_btn_drag .lrn_item,.lrn_draggable",w).find(el=>trim(el)===ans)?.closest(".lrn_btn_drag,[draggable]");if(dz&&drag){drag.click();dz.click();filled++;}});break;
        case "matrix": $all("tr.lrn_stem",w).forEach(row=>{const stmt=trim($one("th .lrn-stem-text,th .lrn_stem_label,th",row)),ans=q.answers[stmt];if(!ans)return;$all("td.lrn_option,td[role='radio']",row).forEach(td=>{const inp=$one("input[type=radio]",td);if(inp&&trim($one("label .lrn_option_text,label",td))===ans){inp.click();filled++;}});});break;
        case "text":{const inp=$one("input[type=text],textarea",w);if(inp){inp.value=q.answer;fireEvents(inp,"input","change");filled++;}break;}
        case "order":{const ar=$one(".lrn_arrow_right",w);if(!ar)break;q.items.forEach(ans=>{const item=$all(".lrn_source .lrn_draggable",w).find(el=>trim($one(".lrn_item",el)||el)===ans);if(item){item.click();ar.click();filled++;}});break;}
      }
    });

    if (qaMap.assoc?.answers) {
      $all(".lrn_assoc_table,.lrn_assoc").forEach(table=>{$all(".lrn_assoc_row",table).forEach(row=>{const question=trim($one(".lrn_assoc_question,.lrn_stem_label",row)),answer=qaMap.assoc.answers[question];if(!question||!answer)return;const dz=$one(".lrn_response_container",row),drag=$all(".lrn_btn_drag .lrn_item,.lrn_draggable").find(el=>trim(el)===answer)?.closest(".lrn_btn_drag,[draggable]");if(dz&&drag){drag.click();dz.click();filled++;}});});
    }

    const expected=getQCount(lid),shortFill=expected>0&&filled<expected;
    if (filled===0||shortFill) {
      const alreadyRetried=getLessons()[lid]?.fillRetry==="1";
      if (alreadyRetried){patchLesson(lid,{fillRetry:null});setStatus(lid,"error");refreshPanelStatus();logError(`Fill failed after retry`,{lid,filled,expected});Toast.bigWarn(`Fill failed for ${lid}: ${filled}/${expected}. Report to ${DISCORD}.`);return;}
      patchLesson(lid,{fillRetry:"1"});
      setPending({id:lid,action:"retry_fill",assessUrl:location.href.split("?")[0]});
      Toast.warn(`Short fill (${filled}/${expected}) — retrying…`,6000);logWarn(`Short fill, retrying`,{filled,expected});
      await wait(2000);location.href=`https://login.icevonline.com/mycourses/${getCID()}/lesson/${getLNum()}`;return;
    }

    patchLesson(lid,{fillRetry:null});
    Toast.ok(`Filled ${filled} answer${filled!==1?"s":""} ✓`,4000);logInfo(`Fill complete: ${filled} for ${lid}`);
    refreshPanelStatus();
    if (isAutoOn()){Toast.info("Submitting in 2s…",2000);await wait(2000);await clickLastReviewItem();await wait(500);await submitAssessment();}
  }

  async function clickLastReviewItem() {
    const deadline=Date.now()+5000;let items=[];
    while(Date.now()<deadline){items=$all(".items-grid li.item-card");if(items.length)break;await wait(100);}
    if(!items.length) return;
    const last=items[items.length-1],target=$one(".inner",last)||last;
    last.scrollIntoView({behavior:"smooth",block:"center"});
    ["pointerover","pointerdown","pointerup","click"].forEach(type=>target.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:"mouse"})));
    last.focus({preventScroll:true});
  }

  // ── Course Page ───────────────────────────────────────────────────
  async function handleCoursePage() {
    const ready=await waitFor(".table-default tbody tr",el=>!!el.querySelector("td"),"course table");
    if(!ready) return;
    buildPanel();
    const cid=getCID(),ln=getLNum()??location.pathname.match(/\/lessons\/(\d+)/)?.[1]??"";
    const baseURL=`https://login.icevonline.com/mycourses/${cid}/lesson/${ln}`;
    const apiMap=await getAttemptMap(cid,ln);
    const assessments=[],seenIDs=new Set();

    $all(".table-default tbody tr").forEach(row=>{
      let href=null;
      const aLink=$one("a[href*='/CEV']:not([href*='/summary'])",row);
      if(aLink) href=aLink.getAttribute("href");
      else{const sl=$one("a[href*='/CEV'][href*='/summary']",row);if(sl)href=sl.getAttribute("href").replace(/\/summary.*$|(\?.*)/g,"");}
      if(!href) return;
      const idM=href.match(/\/(CEV[^/?#"]+)$/);if(!idM) return;
      const id=idM[1];if(seenIDs.has(id)) return;seenIDs.add(id);
      let taken=0,total=3;
      if(apiMap?.[id]){taken=apiMap[id].taken;total=apiMap[id].total;}
      else{const at=trim(row.querySelector("td:nth-child(2)")).match(/(\d+)\s*of\s*(\d+)/);if(at){taken=+at[1];total=+at[2];}}
      assessments.push({id,href:aLink?href:`${baseURL}/${id}`,summaryHref:$one("a[href*='/summary']",row)?.getAttribute("href")??null,taken,total,currentStatus:getStatus(id)});
    });

    assessments.forEach(a=>{
      const stored=getLessons()[a.id]||{};
      if(a.total===1&&stored.status==="unseen"){setStatus(a.id,"unsafe");if(!stored.loggedStatus)patchLesson(a.id,{loggedStatus:"unsafe"});return;}
      if(a.taken>=a.total&&!["filled","unsafe","ext_attempted"].includes(stored.status)){setStatus(a.id,"ext_attempted");if(!stored.loggedStatus)patchLesson(a.id,{loggedStatus:"ext_attempted"});}
    });

    if (!document.getElementById("cev-page-style")){
      const ps=document.createElement("style");ps.id="cev-page-style";
      ps.textContent=`.cev-bypass-btn{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;background:#fef9c3;color:#854d0e;border:1px solid #fde047;cursor:pointer;font-family:inherit;vertical-align:middle;margin-left:6px;transition:background .15s,border-color .15s;text-decoration:none;white-space:nowrap}.cev-bypass-btn:hover{background:#fef08a;border-color:#facc15}.cev-bypass-btn::before{content:"⚡ "}`;
      document.head.appendChild(ps);
    }

    const badgeCss={unseen:"background:#f3f4f6;color:#6b7280;border-color:#e5e7eb",running:"background:#eff6ff;color:#2563eb;border-color:#bfdbfe",saved:"background:#fffbeb;color:#d97706;border-color:#fde68a",partial:"background:#fff7ed;color:#ea580c;border-color:#fed7aa",filled:"background:#f0fdf4;color:#16a34a;border-color:#bbf7d0",error:"background:#fef2f2;color:#dc2626;border-color:#fecaca",unsafe:"background:#fef2f2;color:#dc2626;border-color:#fca5a5",ext_attempted:"background:#f3f4f6;color:#6b7280;border-color:#e5e7eb"};

    $all(".table-default tbody tr").forEach(row=>{
      const anyLink=$one("a[href*='/CEV']",row);if(!anyLink) return;
      const idM=anyLink.getAttribute("href").match(/\/(CEV[^/?#"]+?)(?:\/summary|\?|$)/);if(!idM) return;
      const id=idM[1];
      row.querySelectorAll(".cev-rb,.cev-bypass-btn").forEach(b=>b.remove());
      const st=getStatus(id),bt=row.querySelector("td:first-child");if(!bt)return;
      const badge=document.createElement("span");badge.className="cev-rb";
      badge.style.cssText=`margin-left:8px;vertical-align:middle;display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;border:1px solid transparent;white-space:nowrap;${badgeCss[statusClass(st)]||badgeCss.unseen}`;
      badge.textContent=statusLabel(st);bt.appendChild(badge);
      const sc=getLessons()[id]?.score;
      if(sc){const sb=badge.cloneNode();sb.style.cssText=badge.style.cssText.replace(/background:[^;]+/,"background:#f0fdf4").replace(/color:[^;]+/,"color:#16a34a").replace(/border-color:[^;]+/,"border-color:#bbf7d0");sb.textContent=fmtScore(sc);sb.className="cev-rb";bt.appendChild(sb);}
      const bypassBtn=document.createElement("a");bypassBtn.className="cev-bypass-btn";bypassBtn.href=`${baseURL}/${id}?resume=True`;bypassBtn.title=`Re-enter ${id}`;bypassBtn.textContent="Re-enter";
      bypassBtn.addEventListener("click",e=>{e.preventDefault();patchLesson(id,{fillRetry:null});logInfo(`Bypass: ${id}`);location.href=`${baseURL}/${id}?resume=True`;});
      (row.querySelectorAll("td")[row.querySelectorAll("td").length-1]||bt).appendChild(bypassBtn);
    });

    clearQueue(); _allDone=false; const skipped=[];
    assessments.forEach(a=>{
      const st=getStatus(a.id);
      if(["filled","unsafe","ext_attempted","error"].includes(st)){skipped.push(`${a.id}:${st}`);return;}
      if(a.taken>=a.total){skipped.push(`${a.id}:exhausted`);return;}
      if(hasAnswers(a.id))      enqueue({id:a.id,action:"fill",url:`${baseURL}/${a.id}`});
      else if(a.summaryHref)    enqueue({id:a.id,action:"parse_then_fill",summaryUrl:`https://login.icevonline.com${a.summaryHref}`,assessUrl:`${baseURL}/${a.id}`});
      else                      enqueue({id:a.id,action:"first_run",url:`${baseURL}/${a.id}`,baseURL});
    });
    const q=getQueue().length;
    if(skipped.length)logInfo(`Skipped: ${skipped.join(" | ")}`);
    logInfo(`Scan: ${assessments.length} total, ${q} queued`);
    Toast.info(`Found ${assessments.length} assessments — ${q} queued`);
    refreshPanelStatus();
    if(!isAutoOn()){Toast.info("Automation off — enable to proceed.",5000);return;}
    advanceQueue();
  }

  // ── Queue advance ─────────────────────────────────────────────────
  let _advancing=false;
  function advanceQueue() {
    if (!isAutoOn()||_advancing) return;
    _advancing=true; const next=dequeue(); _advancing=false;
    if (!next){if(!_allDone){_allDone=true;Toast.ok("All done! 🎉 Returning to course list…",6000);logInfo("Queue empty — done");setTimeout(()=>navigateToCourses(),3500);}return;}
    _allDone=false; logInfo(`Queue next: ${next.id} [${next.action}]`); Toast.info(`Next: ${next.id}`,3000);
    switch(next.action){
      case "fill":            setPending({id:next.id,action:"fill"});setTimeout(()=>{location.href=next.url;},1500);break;
      case "parse_then_fill": setPending({id:next.id,action:"fill_after_parse",assessUrl:next.assessUrl});setTimeout(()=>{location.href=next.summaryUrl;},1500);break;
      case "first_run":       setStatus(next.id,"running");setPending({id:next.id,action:"running",baseURL:next.baseURL});setTimeout(()=>{location.href=next.url;},1500);break;
    }
  }

  // ── Remove navbar ─────────────────────────────────────────────────
  (() => { const rm=()=>$all(".nav,#main-navbar").forEach(el=>el.remove()); rm(); new MutationObserver(rm).observe(document.documentElement,{childList:true,subtree:true}); })();

  // ── Console API ───────────────────────────────────────────────────
  window.CEV = {
    getAnswers:(id=getLID())=>getQAMap(id), getStatus:(id=getLID())=>getStatus(id),
    resetLesson:(id=getLID())=>{const l=getLessons();delete l[id];saveLessons(l);const a=getAnswers();delete a[id];saveAnswers(a);refreshPanelStatus();logInfo(`Reset ${id}`);},
    getQueue,clearQueue,getPending,clearPending,
    parse:parseSummary,fill:fillAssessment,submit:submitAssessment,
    highlight:applySilentHL,clearHighlight:clearSilentHL,
    getLogs:()=>getJ(K.LOGS)||[],
    fetchAPI:(cid=getCID(),ln=getLNum())=>fetchActivities(cid,ln),
    debug:()=>{const w=$all(".lrn_widget[id]");const info=w.map((el,i)=>({index:i,classes:[...el.classList].join("."),hasAnswerList:!!$one(".lrn_correctAnswerList",el),hasValid:!!$one(".lrn_valid,.lrn_correct",el),stimulus:trim($one(".lrn_stimulus_content",el))?.slice(0,80)??"(none)"}));logInfo(`Debug: ${w.length} widgets`,info);console.table(info);return info;},
    debugSummary:()=>{const w=$all(".lrn_widget[id]");const info=w.map((el,i)=>{const ri=el.closest(".lrn-report-item,.lrn_report_item,[class*='report-item']"),te=ri?$one(".lrn-report-item-title,h3,h4",ri):null,tc=te?.cloneNode(true);tc?.querySelectorAll(".visually-hidden,.lrn-circle,[aria-hidden],canvas").forEach(e=>e.remove());return{index:i,id:el.id,classes:[...el.classList].join(" "),stimulus:trim($one(".lrn_stimulus_content",el))||"(none)",reportTitle:tc?trim(tc):"(none)",hasCorrectAnswerList:!!$one(".lrn_correctAnswerList",el),correctAnswers:$all(".lrn_correctAnswerList .lrn_responseText,.lrn_correctAnswerList li",el).map(trim),hasValid:!!$one(".lrn_valid,.lrn_correct",el)};});console.table(info.map(r=>({...r}))); console.log("[CEV debugSummary]",info);return info;},
  };

  // ── First-run helpers ─────────────────────────────────────────────
  async function autoNavigateAndSubmitFirstRun(lid, baseURL) {
    Toast.info("Auto first-run: submitting…",5000);logInfo(`Auto first-run: ${lid}`);
    await clickLastReviewItem();await wait(800);
    setPending({id:lid,action:"find_summary",baseURL,assessId:lid});
    $one("button.test-submit,button.lrn_btn_blue.test-submit")?.click();
    let confirmBtn=null;const deadline=Date.now()+6000;
    while(Date.now()<deadline){confirmBtn=$one("button.test-dialog-save-submit")||$one("button.lrn_btn_blue[class*='submit']:not(.test-submit)")||$all("button").find(b=>/finish|submit|confirm/i.test(b.textContent)&&isVisible(b)&&b!==$one("button.test-submit"));if(confirmBtn&&isVisible(confirmBtn))break;await wait(300);}
    if(confirmBtn&&isVisible(confirmBtn)){confirmBtn.click();Toast.ok("First-run submitted ✓",5000);setStatus(lid,"running");setTimeout(()=>{location.href=`https://login.icevonline.com/mycourses/${getCID()}/lesson/${getLNum()}`;},3000);}
    else{logWarn("Confirm dialog not found — fallback intercept",{lid});clearPending();interceptFinishForFirstRun(lid,baseURL);}
  }

  function interceptFinishForFirstRun(lid, baseURL) {
    const poll=setInterval(()=>{const btn=$one("button.lrn_btn_blue.test-submit,button.test-submit");if(!btn||btn._cevIntercepted)return;btn._cevIntercepted=true;clearInterval(poll);btn.addEventListener("click",()=>{Toast.info("Submitted — finding summary…",5000);setPending({id:lid,action:"find_summary",baseURL,assessId:lid});setTimeout(()=>{location.href=`https://login.icevonline.com/mycourses/${getCID()}/lesson/${getLNum()}`;},3000);},{once:true});Toast.info("Click Finish when done.",5000);},500);
  }

  function interceptFinishForSilent(lid) {
    logInfo(`Silent intercept armed: ${lid}`);
    function onConfirm(){setStatus(lid,"filled");refreshPanelStatus();logInfo(`Silent submit: ${lid}`);Toast.ok(`${lid} marked complete ✓`,5000);}
    function attachTo(btn){if(btn._cevSilentIntercepted)return;btn._cevSilentIntercepted=true;btn.addEventListener("click",onConfirm,{once:true});logInfo("Silent confirm armed");}
    findAndAttach();const obs=new MutationObserver(()=>findAndAttach());obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>obs.disconnect(),30*60*1000);
    function findAndAttach(){const c=$one("button.test-dialog-save-submit");if(c&&isVisible(c))attachTo(c);}
  }

  async function handlePendingFindSummary(pending) {
    clearPending();
    const ready=await waitFor(".table-default tbody tr",el=>!!el.querySelector("td"),"course table");if(!ready){logError("Could not load table to find summary");return;}
    let summaryHref=null;
    $all(".table-default tbody tr").forEach(row=>{const link=$one("a[href*='/CEV']",row);if(!link)return;const idM=link.getAttribute("href").match(/\/(CEV[^/?#"]+?)(?:\/summary|\?|$)/);if(!idM||idM[1]!==pending.assessId)return;const sl=$one("a[href*='/summary']",row);if(sl)summaryHref=sl.getAttribute("href");});
    if(!summaryHref){logError(`Summary not found: ${pending.assessId}`);Toast.warn("Summary link not found. Refresh and try again.");return;}
    logInfo(`Found summary: ${pending.assessId}`);
    setPending({id:pending.assessId,action:"fill_after_parse",assessUrl:`${pending.baseURL}/${pending.assessId}`});
    setTimeout(()=>{location.href=`https://login.icevonline.com${summaryHref}`;},1500);
  }

  // ── Main router ───────────────────────────────────────────────────
  (async()=>{
    buildPanel();
    const path=location.pathname,href=location.href,pending=getPending();

    const isLessonList=(path.includes("/mycourses/")||path.includes("/app/courses/"))&&!path.match(/\/CEV[^/]*/)&&!href.includes("/summary");

    if (isLessonList) {
      if(pending?.action==="find_summary"){await handlePendingFindSummary(pending);return;}
      if(pending?.action==="retry_fill"){
        const p=pending;clearPending();
        const ready=await waitFor(".table-default tbody tr",el=>!!el.querySelector("td"),"course table");if(!ready){logError("Could not load table for retry");return;}
        let summaryHref=null;
        $all(".table-default tbody tr").forEach(row=>{const link=$one("a[href*='/CEV']",row);if(!link)return;const idM=link.getAttribute("href").match(/\/(CEV[^/?#"]+?)(?:\/summary|\?|$)/);if(!idM||idM[1]!==p.id)return;const sl=$one("a[href*='/summary']",row);if(sl)summaryHref=sl.getAttribute("href");});
        if(!summaryHref){logError(`No summary for retry: ${p.id}`);setStatus(p.id,"error");patchLesson(p.id,{fillRetry:null});return;}
        setPending({id:p.id,action:"fill_after_parse",assessUrl:p.assessUrl});
        setTimeout(()=>{location.href=`https://login.icevonline.com${summaryHref}`;},1500);return;
      }
      await handleCoursePage();return;
    }

    if (href.includes("/summary")) {
      await wait(POST_LOAD);
      const lid=getLID();
      if(lid&&getStatus(lid)==="filled"){
        await wait(1200);const score=readScore();
        if(score.percentage){patchLesson(lid,{score});logInfo(`Score: ${score.percentage} for ${lid}`);refreshPanelStatus();}
        Toast.ok(`${lid} — ${score.percentage||"score unavailable"} ✓`,6000);clearPending();
        if(isAutoOn())setTimeout(()=>advanceQueue(),2500);return;
      }
      if(lid){const existing=getLessons()[lid]?.score;if(!existing){const score=readScore();if(score.percentage){patchLesson(lid,{score});logInfo(`Score: ${score.percentage}`);refreshPanelStatus();}}}
      if(await waitForSummary()){
        if(pending?.action==="fill_after_parse"&&pending.id===lid){clearPending();await parseSummary(pending.assessUrl);}
        else await parseSummary(path.replace(/\/summary.*$/,""));
      }
      return;
    }

    if (await waitForLesson()) {
      const lid=getLID(),status=getStatus(lid);
      if(isSilentHL()&&hasAnswers(lid)){await wait(300);applySilentHL();}

      if(pending?.id===lid){
        if(pending.action==="fill"){clearPending();isSilentHL()?(interceptFinishForSilent(lid),Toast.info("Answers highlighted — submit manually.",6000)):await fillAssessment();return;}
        if(pending.action==="running"){
          clearPending();const qc=countQuestionsOnPage();if(qc>0)setQCount(lid,qc);
          setStatus(lid,"running");refreshPanelStatus();
          if(isAutoOn()&&isAutoFirstRun())await autoNavigateAndSubmitFirstRun(lid,pending.baseURL);
          else{Toast.info(`First run for ${lid} — complete it, then click Finish.`,10000);interceptFinishForFirstRun(lid,pending.baseURL);}
          return;
        }
      }

      if(status==="answers_saved"||hasAnswers(lid)){
        if(isSilentHL()){interceptFinishForSilent(lid);Toast.info("Answers highlighted — submit manually.",6000);}
        else if(status!=="running") await fillAssessment();
      } else if(status==="running"){
        const bURL=`https://login.icevonline.com/mycourses/${getCID()}/lesson/${getLNum()}`;
        if(isAutoOn()&&isAutoFirstRun()) await autoNavigateAndSubmitFirstRun(lid,bURL);
        else interceptFinishForFirstRun(lid,bURL);
      } else if(status==="unseen"){
        const qc=countQuestionsOnPage();if(qc>0)setQCount(lid,qc);
        setStatus(lid,"running");refreshPanelStatus();
        const bURL=`https://login.icevonline.com/mycourses/${getCID()}/lesson/${getLNum()}`;
        if(isAutoOn()&&isAutoFirstRun()) await autoNavigateAndSubmitFirstRun(lid,bURL);
        else{Toast.info("First run — complete it, Finish will continue.",8000);interceptFinishForFirstRun(lid,bURL);}
      }
      refreshAnswersPane();
    }

    function countQuestionsOnPage(){return $all(".lrn_widget[id]").filter(w=>!!$one(".lrn_stimulus_content",w)).length;}
  })();

})();
