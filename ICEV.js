// ==UserScript==
// @name         CEV Auto-Fill v4
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Auto-fill CEV questions with persistent toasts and full QA support. DOESNT WORK ON ASSIGNMENTS WITH LESS THAN 1 ATTEMPT.
// @author       You
// @match        https://login.icevonline.com/mycourses/*/lesson/*/CEV*_Assess*/*
// @match        https://login.icevonline.com/mycourses/*/lesson/*/CEV*_Assess*
// @match        https://login.icevonline.com/mycourses/*/lesson/*
// @match        https://login.icevonline.com/mycourses/*/lesson/*/summary*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  /* ── CONFIG ─────────────────────────────────────────────── */
  const STORAGE_KEY    = "CEV_QA_MAP";
  const WAIT_INTERVAL  = 400;
  const TIMEOUT        = 20_000;
  const POST_DELAY     = 700;

  /* ── TOAST ───────────────────────────────────────────────── */
  const Toast = (() => {
    const wrap = Object.assign(document.createElement("div"), { style: "" });
    Object.assign(wrap.style, {
      position: "fixed", bottom: "20px", right: "20px",
      display: "flex", flexDirection: "column", gap: "10px",
      zIndex: "2147483647", pointerEvents: "none", maxWidth: "320px",
    });
    document.documentElement.appendChild(wrap);

    const COLORS = { info: "#3b82f6", filled: "#10b981", status: "#ef4444" };

    function show(msg, type = "info", dur = 3500) {
      const el = document.createElement("div");
      el.textContent = msg;
      Object.assign(el.style, {
        background: "rgba(25,25,25,0.95)", color: "#fff",
        padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
        lineHeight: "1.4", boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        borderLeft: `4px solid ${COLORS[type] ?? COLORS.info}`,
        opacity: "0", transform: "translateY(10px)",
        transition: "all 0.2s ease", backdropFilter: "blur(6px)",
      });
      wrap.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(10px)";
        setTimeout(() => el.remove(), 200);
      }, dur);
    }

    return {
      info:   (m, d) => show(m, "info",   d),
      filled: (m, d) => show(m, "filled", d),
      error:  (m, d) => show(m, "status", d),
    };
  })();

  /* ── UTILS ───────────────────────────────────────────────── */
  const wait     = ms => new Promise(r => setTimeout(r, ms));
  const $all     = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const trimText = v => {
    if (!v) return "";
    const s = typeof v === "object" && v.textContent != null ? v.textContent : String(v);
    return s.replace(/\s+/g, " ").trim();
  };
  const isVisible = el => {
    if (!el) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" &&
           s.opacity !== "0" && r.width > 0 && r.height > 0;
  };
  const getLessonID = () =>
    location.pathname.match(/\/lesson\/\d+\/([^/]+)/)?.[1] ?? null;

  const log = (msg, isErr = false) => {
    console.log(`[CEV] ${msg}`);
    isErr ? Toast.error(msg) : Toast.info(msg);
  };

  /* ── WAIT FOR PAGE READY ─────────────────────────────────── */
  async function waitFor(selector, extraCheck, label) {
    const deadline = Date.now() + TIMEOUT;
    while (Date.now() < deadline) {
      const el = document.querySelector(selector);
      if (el && isVisible(el) && extraCheck(el)) {
        await wait(POST_DELAY);
        log(`${label} ready`);
        return true;
      }
      await wait(WAIT_INTERVAL);
    }
    log(`Timeout waiting for ${label}`, true);
    return false;
  }

  const waitForLesson  = () => waitFor(
    ".lrn_response_innerbody, .lrn-assess-content",
    el => el.children.length > 0,
    "lesson"
  );
  const waitForSummary = () => waitFor(
    ".scoreCanvas",
    el => !!el.getAttribute("style"),
    "summary"
  );

  /* ── DISPATCH HELPERS ────────────────────────────────────── */
  function fireEvents(el, ...types) {
    types.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
  }
  function setSelectValue(select, text) {
    const opt = Array.from(select.options).find(o => o.textContent.trim() === text);
    if (!opt) { console.warn(`[CEV] select option not found: "${text}"`); return false; }
    select.value = opt.value;
    fireEvents(select, "change", "input");
    return true;
  }

  /* ── SUMMARY PARSER ──────────────────────────────────────── */
  async function parseSummary() {
    log("Parsing summary…");
    const lessonID = getLessonID();
    if (!lessonID) { log("Cannot detect lesson ID", true); return; }

    const qaMap = {};

    /* Dropdowns */
    $all(".lrn_clozedropdown").forEach((c, i) => {
      const qEl = c.querySelector(".lrn_response_input, .lrn_stimulus_content");
      const question = trimText(qEl) || `Dropdown ${i + 1}`;
      const answers = $all("li .lrn_responseText", c).map(trimText).filter(Boolean);
      if (answers.length) qaMap[question] = { type: "dropdown", answers };
    });

    /* Token Highlight */
    $all(".lrn_tokenhighlight_text").forEach((c, i) => {
      const question = trimText(
        c.closest(".lds-root")?.querySelector(".lrn_stimulus_content")
      ) || `Token Highlight ${i + 1}`;
      const answers = $all(".lrn_valid span", c).map(trimText).filter(Boolean);
      if (answers.length) qaMap[question] = { type: "token", answers };
    });

    /* MCQ */
    $all(".lrn_mcq").forEach((mcq, i) => {
      const question = trimText(mcq.querySelector(".lrn_stimulus_content")) || `MCQ ${i + 1}`;
      const answer = $all("label.lrn-label", mcq)
        .find(l => trimText(l.querySelector(".sr-only"))?.includes("this is the correct answer"))
        ?.querySelector(".lrn_contentWrapper")?.textContent.trim();
      if (answer) qaMap[question] = { type: "choice", answer };
    });

    /* Image Cloze */
    $all(".lrn_imageclozedropdown").forEach(w => {
      const container = w.querySelector(".lrn_imagecloze_container");
      const answerList = w.querySelector(".lrn_correctAnswerList");
      const img = container?.querySelector("img.lrn_imagecloze_image");
      if (!container || !answerList || !img) return;
      const url = img.src.split("?")[0];
      const answers = $all(".lrn_responseText", answerList).map(trimText).filter(Boolean);
      if (!answers.length) return;
      (qaMap.imageCloze ??= {})[url] = { type: "imagecloze", answers };
      console.log(`[CEV][ImageCloze] ${answers.length} answers for`, url);
    });

    /* Association / Drag-Drop */
    (() => {
      const tables = $all(".lrn_assoc_table");
      const answerLists = $all(".lrn_correctAnswerList");
      const map = {};
      tables.forEach((table, idx) => {
        const rows = $all(".lrn_assoc_row", table);
        const answers = $all(".lrn_responseText", answerLists[idx])
          .map(trimText).filter(Boolean);
        rows.forEach((row, i) => {
          const q = trimText(row.querySelector(".lrn_assoc_question"));
          const a = answers[i];
          if (q && a) map[q] = a;
        });
      });
      if (Object.keys(map).length) qaMap.assoc = { type: "assoc", answers: map };
    })();

    /* Matrix */
    $all(".lrn_choicematrix_type_inline").forEach((matrix, i) => {
      const question = trimText(
        matrix.closest(".lds-root")?.querySelector(".lrn_stimulus_content")
      ) || `Matrix ${i + 1}`;
      const answers = {};
      $all("tr.lrn_stem", matrix).forEach(row => {
        const stmt = trimText(row.querySelector("th .lrn-stem-text"));
        const label = trimText(row.querySelector("td.lrn_valid label .lrn_option_text"));
        if (stmt && label) answers[stmt] = label;
      });
      if (Object.keys(answers).length) qaMap[question] = { type: "matrix", answers };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lessonID, qaMap }));
    log(`QA map saved for lesson ${lessonID}`);
  }

  /* ── FILL ASSESSMENT ─────────────────────────────────────── */
  async function fillAssessment() {
    log("Filling assessment…");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const lessonID = getLessonID();

    if (!saved.qaMap || saved.lessonID !== lessonID) {
      log("⚠️ No QA map for this lesson. Fail it once to generate a summary first.", true);
      return;
    }

    const { qaMap } = saved;

    /* Dropdowns */
    const dropdownData = Object.values(qaMap).filter(q => q.type === "dropdown");
    $all(".lrn_clozedropdown").forEach((c, qi) => {
      const qData = dropdownData[qi];
      if (!qData) return;
      $all("select", c).forEach((sel, i) => {
        const ans = qData.answers[i];
        if (ans && setSelectValue(sel, ans)) Toast.filled(`Dropdown: "${ans}"`);
      });
    });

    /* Image Cloze */
    $all(".lrn_imagecloze_container").forEach(c => {
      const img = c.querySelector("img.lrn_imagecloze_image");
      if (!img) return;
      const data = qaMap.imageCloze?.[img.src.split("?")[0]];
      if (!data) return;
      $all(".lrn_imagecloze_response select", c).forEach((sel, i) => {
        const ans = data.answers[i];
        if (ans && setSelectValue(sel, ans)) {
          fireEvents(sel, "input");
          console.log(`[CEV][ImageCloze] Filled: ${ans}`);
        }
      });
    });

    /* All other .lds-root types */
    $all(".lds-root").forEach(q => {
      const stimulus = trimText(q.querySelector(".lrn_stimulus_content"));
      if (!stimulus) return;
      const qData = qaMap[stimulus];
      if (!qData) return;

      switch (qData.type) {
        case "token":
          $all(".lrn_token", q)
            .filter(t =>
              qData.answers.includes(trimText(t.querySelector("span"))) &&
              t.getAttribute("aria-pressed") !== "true"
            )
            .forEach(t => t.click());
          break;

        case "choice":
          $all("label.lrn-label", q)
            .find(l => trimText(l.querySelector(".lrn_contentWrapper")) === qData.answer)
            ?.click();
          break;

        case "cloze":
          Object.values(qData.answers).forEach(ans => {
            const dropZone = $all(".lrn_response_container", q)
              .find(dz => trimText(dz.querySelector(".lrn_btn_drag .lrn_item")) !== ans);
            const draggable = $all(".lrn_btn_drag .lrn_item")
              .find(el => trimText(el) === ans)?.parentElement;
            if (dropZone && draggable) {
              draggable.click();
              dropZone.click();
              Toast.filled(`Cloze: "${ans}"`);
            }
          });
          break;

        case "matrix":
          $all("tr.lrn_stem", q).forEach(row => {
            const stmt = trimText(row.querySelector("th .lrn-stem-text"));
            const correctAns = qData.answers[stmt];
            if (!correctAns) return;
            $all("td.lrn_option", row).forEach(td => {
              const input = td.querySelector("input[type=radio]");
              if (input && trimText(td.querySelector("label .lrn_option_text")) === correctAns)
                input.click();
            });
          });
          break;
      }
    });

    /* Association / Drag-Drop */
    const assocData = qaMap.assoc;
    if (assocData?.answers) {
      $all(".lrn_assoc_table").forEach(table => {
        $all(".lrn_assoc_row", table).forEach(row => {
          const question = trimText(row.querySelector(".lrn_assoc_question"));
          const answer   = assocData.answers[question];
          if (!question || !answer) return;
          const dropZone  = row.querySelector(".lrn_response_container");
          const draggable = $all(".lrn_btn_drag .lrn_item")
            .find(el => trimText(el) === answer)?.parentElement;
          if (dropZone && draggable) {
            draggable.click();
            dropZone.click();
            Toast.filled(`Drag-drop: "${answer}"`);
          } else {
            console.error("[CEV][Assoc] Missing elements for:", question, "→", answer);
          }
        });
      });
    }

    log("Assessment fill complete ✓");
  }

  /* ── CLICK LAST REVIEW ITEM ──────────────────────────────── */
  async function clickLastReviewItem() {
    const deadline = Date.now() + 5000;
    let items = [];
    while (Date.now() < deadline) {
      items = $all(".items-grid li.item-card");
      if (items.length) break;
      await wait(100);
    }
    if (!items.length) return;

    const last = items[items.length - 1];
    last.scrollIntoView({ behavior: "smooth", block: "center" });
    const target = last.querySelector(".inner") || last;
    ["pointerover", "pointerdown", "pointerup", "click"].forEach(type =>
      target.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, view: window, pointerType: "mouse",
      }))
    );
    last.focus({ preventScroll: true });
    Toast.info(`Clicked last item: ${last.dataset.reference || last.textContent.trim()}`);
  }

  /* ── REMOVE NAVBAR ───────────────────────────────────────── */
  (() => {
    const remove = () => document.querySelectorAll(".nav, #main-navbar").forEach(el => el.remove());
    remove();
    new MutationObserver(remove).observe(document.documentElement, { childList: true, subtree: true });
  })();

  /* ── MAIN ────────────────────────────────────────────────── */
  (async () => {
    if (location.href.includes("/summary")) {
      if (await waitForSummary()) await parseSummary();
    } else {
      if (await waitForLesson()) await fillAssessment();
      await clickLastReviewItem();
    }
  })();
})();
