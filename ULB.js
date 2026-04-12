// ==UserScript==
// @name         Unknown Link Bypasser
// @namespace    http://tampermonkey.net/
// @version      6.6.6
// @description  Safelink bypasser + dl.surf + form-based + tpi.li + bstlar + wareguardv2 + subnise + reshortfly + lnbz.la + bloxscript.live + go.yorurl.com + jankariweb + how2guidess.com + phantomfluxkey + link-unlock.com + link4sub.com/tapvietcode.com + rojgarhindi.in + go.caslinks.com + gplinks.co + powergam.online + getpolsec.com + hehehub + sub4unlock.co + app.khaddavi.net + sfl.gl + ytsubme.com + aylink.co + biplabtewary.com + mwgamesyt.com.br + topjogosvip.online + legacyagency.com.br. Made by @Aro Moon
// @author       @Aro Moon
// @include      /^https:\/\/mtc\d+\.[^/]+\.[a-z.]+\//
// @match        https://dl.surf/f/*
// @match        https://shrtslug.biz/*
// @match        https://biovetro.net/*
// @match        https://technons.com/*
// @match        https://tournguide.com/*
// @match        https://dailyjobposting.xyz/*
// @match        https://tpi.li/*
// @match        https://challenges.cloudflare.com/*
// @match        https://airflowscript.com/key
// @match        https://stfly.biz/*
// @match        https://bstlar.com/*
// @match        https://wareguardv2.xyz/checkpoint*
// @match        https://subnise.com/link/*
// @match        https://reshortfly.com/*
// @match        https://lnbz.la/*
// @match        https://avnsgames.com/*
// @match        https://bloxscript.live/*
// @match        https://*.jankariweb.online/*
// @match        https://how2guidess.com/*
// @match        https://go.yorurl.com/*
// @match        https://v0-phantomfluxkey.vercel.app/*
// @match        https://link-unlock.com/*
// @match        https://link4sub.com/*
// @match        https://*.tapvietcode.com/*
// @match        https://rojgarhindi.in/*
// @match        https://go.caslinks.com/*
// @match        https://gplinks.co/*
// @match        https://powergam.online/*
// @match        https://sub4unlock.co/*
// @match        https://app.khaddavi.net/*
// @match        https://sfl.gl/ready/go*
// @match        https://biplabtewary.com/*
// @match        https://mwgamesyt.com.br/*
// @match        https://topjogosvip.online/*
// @match        https://legacyagency.com.br/*
// @match        https://www.ytsubme.com/s2u*
// @match        https://aylink.co/*
// @match        https://getpolsec.com/ad/*
// @match        https://hehehub-acsu123.pythonanywhere.com/api/getkey*
// @grant        GM_addElement
// @grant        unsafeWindow
// @connect      challenges.cloudflare.com
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ULB.js
// @updateURL    https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ULB.js
// ==/UserScript==

(function () {
    'use strict';

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║                     ★  USER CONFIGURATION  ★                       ║
    // ║  Easy to edit — no coding knowledge required!                       ║
    // ║  Change values between the quotes or true/false as described.       ║
    // ╚══════════════════════════════════════════════════════════════════════╝

    const CONFIG = {

        // ── Notification Position ──────────────────────────────────────────
        // Where toasts appear on screen. Options:
        //   'bottom-right'  'bottom-left'  'top-right'  'top-left'
        notifPosition: 'bottom-right',

        // ── Notification Duration (milliseconds) ──────────────────────────
        // How long success/info notifications stay visible before fading.
        //   4000 = 4 seconds. Set to 0 to keep them on screen until clicked.
        notifDuration: 4000,

        // ── Show Bypass Timer ──────────────────────────────────────────────
        // When true, toasts show how long the bypass took (e.g. "Done in 1.3s").
        showBypassTime: true,

        // ── Show Site Label in Toast ───────────────────────────────────────
        // When true, toasts show which bypasser handled the page.
        showSiteLabel: true,

        // ── Compact Mode ──────────────────────────────────────────────────
        // When true, notifications are smaller and less detailed.
        compactMode: false,

        // ── Auto-dismiss on Redirect ───────────────────────────────────────
        // When true, the notification is removed the moment navigation starts.
        autoDismissOnRedirect: true,

        // ── dl.surf: Show Download Button Automatically ────────────────────
        // When false, the bypass button is NOT shown; you must click manually.
        dlSurfAutoInject: true,

        // ── Safelink: Block Ads ────────────────────────────────────────────
        // When false, ads on safelink pages will NOT be removed.
        blockAds: true,

        // ── Phantom Flux Key: Direct Bypass URL ───────────────────────────
        // Target URL for the "Get Key" direct bypass button.
        phantomDirectUrl: 'https://pastefy.app/8PxwQFt8',

        // ── Cloudflare Challenge: Allowed Referrers ────────────────────────
        // Pages that are allowed to trigger the CF auto-click hook.
        // Add new safelink domains here if needed (comma-separated strings).
        cfAllowedRefs: [
            'airflowscript.com', 'dl.surf', 'tpi.li', 'lnbz.la',
            'go.yorurl.com', 'go.caslinks.com', 'mtc1.',
            'shrtslug.biz', 'biovetro.net', 'technons.com',
            'tournguide.com', 'dailyjobposting.xyz', 'stfly.biz',
            'gplinks.co',
        ],
    };

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║                    INTERNAL CODE — DO NOT EDIT                      ║
    // ╚══════════════════════════════════════════════════════════════════════╝

    // ═══════════════════════════════════════════════════════════════════════
    // §1  CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    const FORM_HOSTS = ['shrtslug.biz', 'biovetro.net', 'technons.com', 'tournguide.com', 'dailyjobposting.xyz', 'stfly.biz'];
    const TPI_HOSTS  = ['tpi.li'];

    const NOTIFY_TYPES = {
        info:    { accent: '#4f8ef7', icon: 'ℹ' },
        success: { accent: '#22c55e', icon: '✔' },
        warn:    { accent: '#f59e0b', icon: '⚠' },
        error:   { accent: '#ef4444', icon: '✖' },
        loading: { accent: '#a78bfa', icon: '◌' },
    };

    // ═══════════════════════════════════════════════════════════════════════
    // §2  CORE UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    /** Generate a random hex ID using the Web Crypto API. */
    function generateId() {
        const cr = window.crypto || window.msCrypto;
        if (cr?.randomUUID) return cr.randomUUID().replace(/-/g, '');
        const arr = new Uint8Array(16);
        cr.getRandomValues(arr);
        return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }

    /** Promise-based delay. */
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    /**
     * Wraps fn so it executes at most once; all subsequent calls silently
     * return the result of the first invocation.
     */
    function once(fn) {
        let called = false, result;
        return (...args) => {
            if (!called) { called = true; result = fn(...args); }
            return result;
        };
    }

    /**
     * Attempt to parse str as an http/https URL.
     * @returns {URL|null} Parsed URL, or null if invalid/unsafe.
     */
    function safeUrl(str) {
        if (typeof str !== 'string' || !str) return null;
        try {
            const u = new URL(str);
            return ['http:', 'https:'].includes(u.protocol) ? u : null;
        } catch {
            return null;
        }
    }

    /**
     * Race a promise against a timeout rejection.
     * @param {Promise} promise
     * @param {number}  ms       Milliseconds before rejecting.
     * @param {string}  [msg]    Error message on timeout.
     */
    function withTimeout(promise, ms, msg = 'Timed out') {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
        ]);
    }

    /** Run fn once immediately; if it throws or returns falsy, call it again. */
    function onReady(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn, { once: true });
    }

    /** Resolve with document.body once the DOM is ready. */
    const waitBody = () =>
        document.body
            ? Promise.resolve(document.body)
            : new Promise(r => document.addEventListener('DOMContentLoaded', () => r(document.body), { once: true }));

    /**
     * Resolve with the first matching element, or reject after timeout.
     * @param {string} sel       CSS selector.
     * @param {number} [interval=100]
     * @param {number} [timeout=20000]  0 = no timeout.
     */
    function waitForEl(sel, interval = 100, timeout = 20_000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(sel);
            if (el) return resolve(el);
            const iv = setInterval(() => {
                const found = document.querySelector(sel);
                if (found) { clearInterval(iv); clearTimeout(tid); resolve(found); }
            }, interval);
            const tid = timeout > 0
                ? setTimeout(() => { clearInterval(iv); reject(new Error(`waitForEl: "${sel}" not found after ${timeout}ms`)); }, timeout)
                : null;
        });
    }

    /**
     * Poll fn every intervalMs until it returns a truthy value.
     * Resolves with that value, or rejects after maxTries.
     * @param {Function} fn
     * @param {number}   [intervalMs=200]
     * @param {number}   [maxTries=150]
     * @returns {Promise}
     */
    function pollUntil(fn, intervalMs = 200, maxTries = 150) {
        return new Promise((resolve, reject) => {
            let tries = 0, settled = false;
            const settle = (ok, val) => {
                if (!settled) { settled = true; ok ? resolve(val) : reject(val); }
            };
            const check = () => {
                try {
                    const r = fn();
                    if (r) { settle(true, r); return true; }
                } catch (e) {
                    settle(false, e); return true;
                }
                return false;
            };
            if (check()) return;
            const iv = setInterval(() => {
                if (check() || ++tries >= maxTries) {
                    clearInterval(iv);
                    if (!settled) settle(false, new Error('pollUntil: condition not met after max tries'));
                }
            }, intervalMs);
        });
    }

    /**
     * Click element by ID once it appears in the DOM.
     * @param {string} id
     * @param {string} label    Used in the console warning.
     * @param {number} [maxTries=100]
     */
    function clickWhenReady(id, label, maxTries = 100) {
        const attempt = () => { const el = document.getElementById(id); if (el) { el.click(); return true; } return false; };
        const init = () => {
            if (attempt()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if (attempt() || ++tries >= maxTries) {
                    clearInterval(iv);
                    if (tries >= maxTries) console.warn(`[ULB] ${label}: #${id} not found after ${maxTries} tries`);
                }
            }, 200);
        };
        onReady(init);
    }

    /** Returns true when running on an iOS device (iPhone / iPad / iPod). */
    const isIOS = () =>
        /iP(hone|ad|od)/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    /** Create a high-resolution timer with an elapsed() helper. */
    function makeTimer() {
        const start = performance.now();
        return {
            elapsed: () => ((performance.now() - start) / 1000).toFixed(2),
            label:   () => `Done in ${((performance.now() - start) / 1000).toFixed(2)}s`,
        };
    }

    /**
     * Fetch a URL and parse the response body as JSON.
     * Throws on non-2xx status or malformed JSON.
     * @param {string}        url
     * @param {RequestInit}   [opts={}]
     * @returns {Promise<any>}
     */
    async function fetchJSON(url, opts = {}) {
        const r = await fetch(url, opts);
        if (!r.ok) throw new Error(`HTTP ${r.status}${r.statusText ? ' ' + r.statusText : ''}`);
        return r.json();
    }

    /**
     * Write text to the clipboard.
     * Falls back to the deprecated execCommand on environments without
     * the Clipboard API (e.g. some in-app browsers).
     * @param {string} text
     * @returns {Promise<void>}
     */
    function copyToClipboard(text) {
        if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        ta.remove();
        return Promise.resolve();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §3  NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    function _posStyles() {
        const p = CONFIG.notifPosition || 'bottom-right';
        const [v, h] = p.split('-');
        const vert  = v === 'top'
            ? `top:calc(28px + env(safe-area-inset-top,0px))`
            : `bottom:calc(28px + env(safe-area-inset-bottom,0px))`;
        const horiz = h === 'left'
            ? `left:calc(28px + env(safe-area-inset-left,0px))`
            : `right:calc(28px + env(safe-area-inset-right,0px))`;
        const dir   = v === 'top' ? 'column' : 'column-reverse';
        const slide = h === 'left' ? 'translateX(-20px)' : 'translateX(20px)';
        return { vert, horiz, dir, slide };
    }

    const CSS_CARD_BASE = [
        'background:linear-gradient(135deg,#1a1a2e,#16213e)',
        'border:1px solid rgba(255,255,255,.08)',
        'color:#e0e0e0',
        'border-radius:10px',
        'box-shadow:0 8px 32px rgba(0,0,0,.45)',
        'pointer-events:auto',
        'opacity:0',
        'transition:opacity .25s ease,transform .25s ease',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
    ].join(';');

    const CSS_LABEL = 'font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#666;margin-bottom';

    let _container = null;
    function getContainer() {
        if (_container?.isConnected) return _container;
        const { vert, horiz, dir } = _posStyles();
        _container = Object.assign(document.createElement('div'), { id: '__ulb_nc' });
        _container.style.cssText = [
            'position:fixed', vert, horiz,
            'z-index:2147483647',
            `display:flex;flex-direction:${dir};gap:10px`,
            'pointer-events:none',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
        ].join(';');
        document.body.appendChild(_container);
        return _container;
    }

    function ensureSpinStyle() {
        if (!document.getElementById('__ulb_style')) {
            const s = Object.assign(document.createElement('style'), {
                id: '__ulb_style',
                textContent: '@keyframes __ulb_spin{to{transform:rotate(360deg)}}',
            });
            document.head.appendChild(s);
        }
    }

    function mountCard(card) {
        const { slide } = _posStyles();
        card.style.transform = slide;
        getContainer().appendChild(card);
        requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateX(0)'; });
        return card;
    }

    function dismissCard(card) {
        const { slide } = _posStyles();
        card.style.opacity = '0';
        card.style.transform = slide;
        setTimeout(() => card.remove(), 280);
    }

    /**
     * Show a toast notification.
     * @param {string} message
     * @param {'info'|'success'|'warn'|'error'|'loading'} [type='info']
     * @param {number}  [duration]  Omit → CONFIG.notifDuration; 0 = persistent.
     * @param {object}  [opts]
     * @param {string}  [opts.site]  Site label shown in footer.
     * @param {string}  [opts.time]  Elapsed time string (e.g. "1.3s").
     * @returns {{ update(msg, type?, opts?):void, remove():void }}
     */
    function notify(message, type = 'info', duration, opts = {}) {
        const dur = duration === undefined ? CONFIG.notifDuration : duration;

        // If the DOM isn't ready yet, defer and return a proxy handle.
        if (!document.body) {
            const h = { update: () => {}, remove: () => {} };
            document.addEventListener('DOMContentLoaded', () => {
                const r = notify(message, type, dur, opts);
                h.update = r.update; h.remove = r.remove;
            }, { once: true });
            return h;
        }

        ensureSpinStyle();
        const { accent, icon } = NOTIFY_TYPES[type] || NOTIFY_TYPES.info;

        const pad  = CONFIG.compactMode ? '8px 12px'                            : '12px 16px';
        const mw   = CONFIG.compactMode ? 'min(200px,calc(100vw - 56px))'       : 'min(240px,calc(100vw - 56px))';
        const maxW = CONFIG.compactMode ? 'min(280px,calc(100vw - 56px))'       : 'min(320px,calc(100vw - 56px))';

        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid ${accent};padding:${pad};min-width:${mw};max-width:${maxW};display:flex;align-items:flex-start;gap:10px`;

        const iconEl = document.createElement('div');
        iconEl.style.cssText = `font-size:${CONFIG.compactMode ? '13' : '15'}px;color:${accent};margin-top:1px;flex-shrink:0`;
        iconEl.textContent = icon;

        const bodyEl = document.createElement('div');
        bodyEl.style.cssText = 'flex:1;min-width:0';

        if (!CONFIG.compactMode) {
            bodyEl.innerHTML = `<div style="${CSS_LABEL}:3px">Unknown Link Bypasser · @Aro Moon</div>`;
        }

        const msgEl = document.createElement('div');
        msgEl.style.cssText = `font-size:${CONFIG.compactMode ? '12' : '13'}px;line-height:1.4;color:#e0e0e0;word-break:break-word`;
        msgEl.textContent = message;
        bodyEl.appendChild(msgEl);

        // Footer row: site label + elapsed time.
        const footerEl = document.createElement('div');
        footerEl.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:4px;gap:8px';

        const siteEl = document.createElement('div');
        siteEl.style.cssText = 'font-size:10px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
        if (CONFIG.showSiteLabel && opts.site) siteEl.textContent = opts.site;

        const timeEl = document.createElement('div');
        timeEl.style.cssText = 'font-size:10px;color:#3d8b40;font-variant-numeric:tabular-nums;white-space:nowrap;flex-shrink:0';
        if (CONFIG.showBypassTime && opts.time) timeEl.textContent = `⏱ ${opts.time}`;

        if (opts.site || opts.time) {
            footerEl.append(siteEl, timeEl);
            bodyEl.appendChild(footerEl);
        }

        card.append(iconEl, bodyEl);
        mountCard(card);

        const setSpinning = on => {
            iconEl.style.animation = on ? '__ulb_spin 1s linear infinite' : '';
        };
        if (type === 'loading') setSpinning(true);

        let timer;
        const remove = () => { clearTimeout(timer); dismissCard(card); };
        const update = (newMsg, newType, newOpts = {}) => {
            clearTimeout(timer);
            msgEl.textContent = newMsg;
            if (newType && NOTIFY_TYPES[newType]) {
                const s = NOTIFY_TYPES[newType];
                iconEl.textContent = s.icon;
                iconEl.style.color = s.accent;
                card.style.borderLeftColor = s.accent;
                setSpinning(newType === 'loading');
            }
            if (CONFIG.showSiteLabel && newOpts.site) siteEl.textContent = newOpts.site;
            if (CONFIG.showBypassTime && newOpts.time) {
                timeEl.textContent = `⏱ ${newOpts.time}`;
                footerEl.append(siteEl, timeEl);
                if (!footerEl.parentNode) bodyEl.appendChild(footerEl);
            }
            if (dur > 0) timer = setTimeout(remove, dur);
        };
        if (dur > 0) timer = setTimeout(remove, dur);
        return { update, remove };
    }

    /** Show a self-advancing countdown card, then call onDone. */
    function showCountdown(seconds, onDone, subtitle = 'Redirect queued') {
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #4f8ef7;padding:14px 18px;min-width:min(240px,calc(100vw - 56px))`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:8px">Unknown Link Bypasser · @Aro Moon</div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                <div class="__ulb_cn" style="font-size:30px;font-weight:700;color:#fff;line-height:1;min-width:44px">${seconds}</div>
                <div style="color:#aaa;font-size:12px;line-height:1.5">
                    <div class="__ulb_cs">seconds remaining</div>
                    <div style="color:#555;font-size:10px;margin-top:2px">${subtitle}</div>
                </div>
            </div>
            <div style="background:rgba(255,255,255,.07);border-radius:999px;height:3px;overflow:hidden">
                <div class="__ulb_cb" style="height:100%;width:100%;background:linear-gradient(90deg,#4f8ef7,#a78bfa);border-radius:999px;transition:width 1s linear"></div>
            </div>`;
        mountCard(card);

        // Use local refs to avoid static-ID collisions when multiple countdowns run.
        const numEl = card.querySelector('.__ulb_cn');
        const barEl = card.querySelector('.__ulb_cb');
        const subEl = card.querySelector('.__ulb_cs');

        let rem = seconds;
        requestAnimationFrame(() => { barEl.style.width = `${((seconds - 1) / seconds) * 100}%`; });
        const iv = setInterval(() => {
            if (--rem <= 0) {
                clearInterval(iv);
                numEl.textContent = '0'; barEl.style.width = '0%'; subEl.textContent = 'done…';
                card.style.borderLeftColor = '#22c55e';
                setTimeout(() => { dismissCard(card); setTimeout(onDone, 280); }, 400);
            } else {
                numEl.textContent = rem;
                barEl.style.width = `${(rem / seconds) * 100}%`;
            }
        }, 1000);
    }

    /** Show a persistent success card with a manual fallback tap-link. */
    function showRedirectNotif(dest) {
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #22c55e;padding:14px 18px;min-width:min(240px,calc(100vw - 56px));max-width:min(320px,calc(100vw - 56px))`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <div class="__ulb_ri" style="font-size:15px;color:#22c55e;flex-shrink:0">✔</div>
                <div class="__ulb_rm" style="font-size:13px;color:#e0e0e0">Redirecting now…</div>
            </div>
            <a href="${dest}" style="display:block;text-align:center;font-size:12px;color:#22c55e;text-decoration:none;padding:8px 12px;border:1px solid rgba(34,197,94,.35);border-radius:7px;background:rgba(34,197,94,.08);font-weight:600">
                Tap here if nothing happens
            </a>`;
        mountCard(card);
        setTimeout(() => {
            const rm = card.querySelector('.__ulb_rm');
            const ri = card.querySelector('.__ulb_ri');
            if (rm) rm.textContent = 'Redirect may have stalled.';
            if (ri) { ri.textContent = '⚠'; ri.style.color = '#f59e0b'; }
            card.style.borderLeftColor = '#f59e0b';
        }, 3000);
    }

    /** Show a persistent action button that opens url in a new tab. */
    function showDirectBypassBtn(label, url, subtitle = 'Direct Bypass Available') {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => showDirectBypassBtn(label, url, subtitle), { once: true });
            return;
        }
        ensureSpinStyle();
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #f59e0b;padding:14px 18px;min-width:min(260px,calc(100vw - 56px));max-width:min(340px,calc(100vw - 56px));position:relative`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon</div>
            <div style="font-size:11px;color:#f59e0b;margin-bottom:10px;font-weight:600;letter-spacing:.5px">${subtitle}</div>
            <a href="${url}" target="_blank" rel="noopener"
               style="display:block;text-align:center;font-size:13px;font-weight:700;color:#fff;
                      text-decoration:none;padding:10px 14px;border-radius:8px;
                      background:linear-gradient(135deg,#f59e0b,#d97706);
                      box-shadow:0 2px 10px rgba(245,158,11,.35);
                      touch-action:manipulation;min-height:44px;line-height:24px">
                ⚡ ${label}
            </a>`;
        const closeBtn = Object.assign(document.createElement('div'), {
            style: 'position:absolute;top:8px;right:10px;font-size:14px;color:#555;cursor:pointer;padding:2px 5px;border-radius:4px',
            textContent: '✕',
        });
        closeBtn.addEventListener('click', () => dismissCard(card));
        card.appendChild(closeBtn);
        mountCard(card);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §4  CAPTCHA & CLOUDFLARE
    // ═══════════════════════════════════════════════════════════════════════

    /** Try every known strategy to extract a Cloudflare Turnstile sitekey. */
    function getSiteKey(fallback = null) {
        for (const sel of ['[data-sitekey]', '.cf-turnstile', 'iframe[src*="challenges.cloudflare.com"]']) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const k = el.dataset?.sitekey || el.getAttribute('data-sitekey');
            if (k) return k;
            const m = (el.getAttribute('src') || '').match(/[?&]sitekey=([^&]+)/);
            if (m) return m[1];
        }
        for (const s of document.querySelectorAll('script:not([src])')) {
            const m = s.textContent.match(/sitekey['"::\s]+([0-9a-zA-Z_\-]{20,})/);
            if (m) return m[1];
        }
        return fallback;
    }

    /**
     * Solve a Cloudflare Turnstile challenge via a full-screen overlay.
     * Resolves with the token string, or rejects after 60 s.
     * @param {string} sitekey
     * @returns {Promise<string>}
     */
    function solveTurnstile(sitekey) {
        if (!sitekey) return Promise.reject(new Error('[ULB/Turnstile] sitekey is required'));
        return new Promise((resolve, reject) => {
            const cbName = '__ulb_tsCb_' + generateId();

            // Full-screen overlay that beats every z-index war.
            const overlay = document.createElement('div');
            overlay.id = '__ulb_ts_overlay';
            overlay.style.cssText = [
                'all:initial', 'position:fixed', 'inset:0', 'z-index:2147483647',
                'display:flex', 'align-items:center', 'justify-content:center',
                'background:rgba(2,6,23,.82)', 'backdrop-filter:blur(6px)',
                '-webkit-backdrop-filter:blur(6px)',
                'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
                'transition:opacity .3s ease',
            ].join(';');

            const card = document.createElement('div');
            card.style.cssText = [
                'background:linear-gradient(145deg,#0f172a,#1e293b)',
                'border:1px solid rgba(99,102,241,.35)', 'border-radius:18px',
                'box-shadow:0 0 0 1px rgba(255,255,255,.04),0 32px 64px rgba(0,0,0,.7),0 0 80px rgba(99,102,241,.12)',
                'padding:32px 28px 28px', 'display:flex', 'flex-direction:column',
                'align-items:center', 'gap:16px',
                'min-width:340px', 'max-width:calc(100vw - 48px)', 'position:relative',
            ].join(';');

            // Spinner ring.
            const spinWrap = document.createElement('div');
            spinWrap.style.cssText = 'position:relative;width:48px;height:48px;flex-shrink:0';
            const spinRing = document.createElement('div');
            spinRing.id = '__ulb_ts_ring';
            spinRing.style.cssText = [
                'position:absolute;inset:0;border-radius:50%',
                'border:3px solid rgba(99,102,241,.18)',
                'border-top-color:#818cf8',
                'animation:__ulb_spin 0.9s linear infinite',
            ].join(';');
            const spinIcon = document.createElement('div');
            spinIcon.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px';
            spinIcon.textContent = '🔐';
            spinWrap.append(spinRing, spinIcon);

            // Text block.
            const textWrap = document.createElement('div');
            textWrap.style.cssText = 'text-align:center';
            const heading = document.createElement('div');
            heading.style.cssText = 'font-size:15px;font-weight:700;color:#e2e8f0;letter-spacing:.3px;margin-bottom:5px';
            heading.textContent = 'Solving CAPTCHA';
            const sub = document.createElement('div');
            sub.id = '__ulb_ts_sub';
            sub.style.cssText = 'font-size:12px;color:#64748b;line-height:1.5';
            sub.textContent = 'Please complete the challenge below if it appears…';
            textWrap.append(heading, sub);

            // The actual Turnstile widget div.
            const widgetDiv = document.createElement('div');
            widgetDiv.setAttribute('data-sitekey', sitekey);
            widgetDiv.setAttribute('data-callback', cbName);
            widgetDiv.setAttribute('data-theme', 'dark');
            widgetDiv.style.cssText = 'border-radius:8px;overflow:hidden';

            // Footer attribution.
            const footer = document.createElement('div');
            footer.style.cssText = 'font-size:10px;color:#334155;letter-spacing:1.2px;text-transform:uppercase;margin-top:4px';
            footer.textContent = 'Unknown Link Bypasser · @Aro Moon';

            card.append(spinWrap, textWrap, widgetDiv, footer);
            overlay.appendChild(card);

            const mountOverlay = () => {
                overlay.style.opacity = '0';
                (document.body || document.documentElement).appendChild(overlay);
                requestAnimationFrame(() => { overlay.style.opacity = '1'; });
            };
            if (document.body) mountOverlay();
            else document.addEventListener('DOMContentLoaded', mountOverlay, { once: true });

            // Auto-click the iframe checkbox if the widget renders one.
            const autoClickObs = new MutationObserver(() => {
                overlay.querySelectorAll('iframe').forEach(fr => {
                    try {
                        const cb = fr.contentDocument?.querySelector('input[type=checkbox]');
                        if (cb && !cb.checked) cb.click();
                    } catch (_) {}
                });
            });
            autoClickObs.observe(overlay, { childList: true, subtree: true });

            // Cleanup and 60s timeout.
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('[ULB/Turnstile] timed out after 60s'));
            }, 60_000);

            function cleanup() {
                clearTimeout(timeout);
                autoClickObs.disconnect();
                try { delete unsafeWindow[cbName]; } catch (_) {}
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 350);
            }

            const onToken = token => {
                const sub2 = overlay.querySelector('#__ulb_ts_sub');
                if (sub2) sub2.textContent = 'Solved ✓ — redirecting…';
                const ring = overlay.querySelector('#__ulb_ts_ring');
                if (ring) { ring.style.borderTopColor = '#22c55e'; ring.style.animationDuration = '0.3s'; }
                setTimeout(() => { cleanup(); resolve(token); }, 400);
            };
            unsafeWindow[cbName] = onToken;

            // Attempt to use the page's existing Turnstile API, otherwise inject it.
            const tryRenderApi = () => {
                const ts = unsafeWindow.turnstile;
                if (!ts?.render) return false;
                try { ts.render(widgetDiv, { sitekey, theme: 'dark', callback: onToken }); return true; }
                catch (e) { console.warn('[ULB/Turnstile] turnstile.render() threw:', e); return false; }
            };

            if (!tryRenderApi()) {
                if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
                    const s = Object.assign(document.createElement('script'), {
                        src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
                        async: true,
                    });
                    s.onload = () => tryRenderApi();
                    document.head.appendChild(s);
                } else {
                    const poll = setInterval(() => { if (tryRenderApi()) clearInterval(poll); }, 150);
                    setTimeout(() => clearInterval(poll), 10_000);
                }
            }
        });
    }

    // ── Cloudflare Challenge Frame Hook ────────────────────────────────────
    // Runs inside the challenge iframe to auto-tick the verify checkbox.

    function _runCfHook() {
        const spoofEvt = (e, props) => new Proxy(e, { get: (t, p) => p in props ? props[p] : t[p] });
        const _origAdd = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            return _origAdd.call(this, type, function (e) {
                const props = { isTrusted: true };
                if (location.hash.includes('origin='))
                    props.origin = decodeURIComponent(location.hash.split('origin=')[1]);
                return listener.call(this, spoofEvt(e, props));
            }, options);
        };

        const tryClick = (root, frameId) => {
            const cb = root.querySelector('input[type=checkbox]');
            if (cb && !cb.checked) {
                try { window.parent.postMessage({ __ulb: true, __ulb_clicked: true, id: frameId || '' }, '*'); } catch (_) {}
                cb.click();
            }
        };

        const frameId = (location.hash.match(/[#&]ulbid=([^&]+)/) || [])[1] || '';
        const shadowObs = new MutationObserver(muts => {
            for (const m of muts)
                m.addedNodes.forEach(n => {
                    if (n.nodeType !== 1) return;
                    const cb = n.matches?.('input[type=checkbox]') ? n : n.querySelector('input[type=checkbox]');
                    if (cb && !cb.checked) {
                        try { window.parent.postMessage({ __ulb: true, __ulb_clicked: true, id: frameId }, '*'); } catch (_) {}
                        cb.click();
                    }
                });
        });

        const _origShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (opt) {
            const root = _origShadow.call(this, opt);
            shadowObs.observe(root, { childList: true, subtree: true });
            Promise.resolve().then(() => tryClick(root, frameId));
            return root;
        };

        document.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
                shadowObs.observe(el.shadowRoot, { childList: true, subtree: true });
                tryClick(el.shadowRoot, frameId);
            }
        });
    }

    // Early return: only the CF hook runs inside challenge iframes.
    if (location.hostname === 'challenges.cloudflare.com') {
        if (CONFIG.cfAllowedRefs.some(h => document.referrer.includes(h))) _runCfHook();
        return;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §5  SHARED BYPASSER HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create a standard error handler bound to a notification handle.
     * Logs to the console, updates (or creates) a toast, and schedules removal.
     *
     * @param {string}      siteLabel
     * @param {object|null} nh          Notify handle, or null to fire a new toast.
     * @param {number}      [msClose=6000]
     * @returns {(label: string, err: Error|null) => void}
     */
    function makeErrHandler(siteLabel, nh, msClose = 6000) {
        return (label, err) => {
            console.error(`[ULB/${siteLabel}] ${label}`, err ?? '');
            const msg = `${siteLabel}: ${label}${err?.message ? ` — ${err.message}` : ''}`;
            if (nh) {
                nh.update(msg, 'error');
                setTimeout(() => nh.remove(), msClose);
            } else {
                notify(msg, 'error', msClose, { site: siteLabel });
            }
        };
    }

    /**
     * Validate url and redirect, updating the notification handle in the process.
     * Returns false (and shows an error) if the URL is missing or unsafe.
     *
     * @param {string}      url
     * @param {object|null} nh
     * @param {object}      [opts]
     * @param {object}      [opts.t]         makeTimer() result — adds elapsed time.
     * @param {string}      [opts.siteLabel]
     * @param {boolean}     [opts.autoDismiss=CONFIG.autoDismissOnRedirect]
     * @returns {boolean}
     */
    function safeRedirect(url, nh, opts = {}) {
        const { t, siteLabel, autoDismiss = CONFIG.autoDismissOnRedirect } = opts;
        if (!safeUrl(url)) {
            const msg = `Invalid or unsafe redirect URL`;
            console.error(`[ULB/${siteLabel ?? 'ULB'}] ${msg}:`, url);
            if (nh) {
                nh.update(`${siteLabel ? siteLabel + ': ' : ''}${msg}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            } else {
                notify(msg, 'error', 6000, siteLabel ? { site: siteLabel } : {});
            }
            return false;
        }
        if (nh) {
            const extra = {};
            if (siteLabel) extra.site = siteLabel;
            if (t)         extra.time = t.elapsed() + 's';
            nh.update('Redirecting…', 'success', extra);
            setTimeout(() => nh.remove(), autoDismiss ? 500 : 2000);
        }
        location.href = url;
        return true;
    }

    // ── lnbz.la / yorurl shared app_vars helpers ───────────────────────────

    /** Try to read the page's `app_vars` object from the window or inline scripts. */
    function _lnbzGetAppVars() {
        try { const v = unsafeWindow.app_vars; if (v && typeof v === 'object') return v; } catch (_) {}
        for (const s of document.querySelectorAll('script:not([src])')) {
            const m = s.textContent.match(/var\s+app_vars\s*=\s*(\{[\s\S]*?\});/);
            if (m) { try { return JSON.parse(m[1]); } catch (_) {} }
        }
        return null;
    }

    /**
     * Call cb(vars) once app_vars is available, or cb(null) after timeoutMs.
     * Guaranteed to call cb exactly once.
     */
    function _lnbzWaitForAppVars(cb, timeoutMs = 8000) {
        const v = _lnbzGetAppVars();
        if (v) { cb(v); return; }

        // Guard: cb must be called exactly once even if the observer and the
        // timeout both fire in quick succession.
        let done = false;
        const safeCb = val => { if (!done) { done = true; cb(val); } };

        const start = Date.now();
        const obs = new MutationObserver(() => {
            const v2 = _lnbzGetAppVars();
            if (v2) { obs.disconnect(); safeCb(v2); return; }
            if (Date.now() - start > timeoutMs) { obs.disconnect(); safeCb(null); }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { obs.disconnect(); safeCb(_lnbzGetAppVars()); }, timeoutMs);
    }

    /**
     * Handle a captcha-gated lnbz-style page: solve Turnstile then POST the form.
     */
    function _lnbzCaptchaPage(form) {
        const t  = makeTimer();
        const nh = notify('Solving captcha…', 'loading', 0);
        const handleError = makeErrHandler('captcha', nh, 7000);

        const submitWithToken = token => {
            let input = form.querySelector('[name="cf-turnstile-response"]');
            if (!input) {
                input = Object.assign(document.createElement('input'), { type: 'hidden', name: 'cf-turnstile-response' });
                form.appendChild(input);
            }
            input.value = token;
            nh.update('Captcha solved — submitting…', 'success', { time: t.elapsed() + 's' });
            setTimeout(() => nh.remove(), 1500);
            HTMLFormElement.prototype.submit.call(form);
        };

        _lnbzWaitForAppVars(vars => {
            const sitekey = vars?.turnstile_site_key || getSiteKey();
            if (sitekey) {
                solveTurnstile(sitekey).then(submitWithToken).catch(err => handleError('solver failed', err));
            } else {
                nh.update('Waiting for captcha…', 'loading');
                let elapsed = 0;
                const iv = setInterval(() => {
                    const c = form.querySelector('[name="cf-turnstile-response"]')?.value;
                    if (c && c.length > 20) { clearInterval(iv); submitWithToken(c); return; }
                    if ((elapsed += 500) >= 60_000) { clearInterval(iv); handleError('timed out after 60s', null); }
                }, 500);
            }
        });
    }

    /**
     * Shared logic for go.yorurl.com / go.caslinks.com (and similar lnbz-derivative sites).
     * Detects whether we're on an ad-countdown page or a captcha page, then handles both.
     */
    function _runYorurlLikeBypasser(siteLabel) {
        const doGoPage = form => {
            const t  = makeTimer();
            const nh = notify(`${siteLabel} — reading countdown…`, 'loading', 0, { site: siteLabel });
            const handleError = makeErrHandler(siteLabel, nh, 7000);

            const doFetch = async () => {
                nh.update(`${siteLabel} — fetching destination…`, 'loading', { site: siteLabel });
                try {
                    const params = new URLSearchParams();
                    form.querySelectorAll('input[type="hidden"]').forEach(inp => params.append(inp.name, inp.value));
                    const r = await fetch('/links/go', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest',
                            Accept: 'application/json, text/javascript, */*; q=0.01',
                        },
                        credentials: 'include',
                        body: params.toString(),
                    });
                    if (!r.ok) throw new Error(`Server returned HTTP ${r.status}`);
                    let d;
                    try { d = await r.json(); } catch { throw new Error('Response was not valid JSON'); }
                    if (!d.url) throw new Error('No destination URL in server response');
                    safeRedirect(d.url, nh, { t, siteLabel });
                } catch (err) { handleError('fetch failed', err); }
            };

            _lnbzWaitForAppVars(vars => {
                const secs = Math.max(1, parseInt(vars?.counter_value, 10) || 15);
                nh.update(`${siteLabel} — redirecting in ${secs}s…`, 'loading', { site: siteLabel });
                showCountdown(secs, doFetch, `${siteLabel} bypass`);
            });
        };

        const detect = () => {
            const adEl = document.querySelector('[name="ad_form_data"]');
            if (adEl) { doGoPage(adEl.closest('form') || document.querySelector('form')); return; }
            const form = document.querySelector('form');
            if (form) { _lnbzCaptchaPage(form); return; }
            const obs = new MutationObserver(() => {
                const adEl2 = document.querySelector('[name="ad_form_data"]');
                const form2 = document.querySelector('form');
                if (adEl2 || form2) {
                    obs.disconnect();
                    adEl2 ? doGoPage(adEl2.closest('form') || form2) : _lnbzCaptchaPage(form2);
                }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
            setTimeout(() => {
                obs.disconnect();
                if (!document.querySelector('[name="ad_form_data"]') && !document.querySelector('form'))
                    notify(`${siteLabel}: no form found — unsupported layout.`, 'error', 6000, { site: siteLabel });
            }, 15_000);
        };
        onReady(detect);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §6  ROUTER
    // ═══════════════════════════════════════════════════════════════════════

    const host = location.hostname;
    const path = location.pathname;

    try {
        if      (host.includes('dl.surf'))                  runDlSurf();
        else if (host.includes('airflowscript.com'))        runAirflowBypasser();
        else if (host.includes('bstlar.com'))               runBstlarBypasser();
        else if (host.includes('wareguardv2.xyz'))          runWareguardBypasser();
        else if (host.includes('subnise.com'))              runSubniseBypasser();
        else if (host.includes('reshortfly.com'))           runReshortflyBypasser();
        else if (host.includes('avnsgames.com'))            runAvnsGamesInterstitial();
        else if (host.includes('lnbz.la'))                  runLnbzLaBypasser();
        else if (host.includes('bloxscript.live'))          runBloxscriptBypasser();
        else if (host.includes('jankariweb'))               runJoberBypasser();
        else if (host.includes('how2guidess.com'))          runHow2GuidesBypasser();
        else if (host.includes('go.yorurl.com'))            runYorurlBypasser();
        else if (host.includes('go.caslinks.com'))          runCasLinksBypasser();
        else if (host.includes('gplinks.co'))               runGpLinksBypasser();
        else if (host.includes('powergam.online'))          runPowergamBypasser();
        else if (host.includes('rojgarhindi.in'))            runRojgarhindiBypasser();
        else if (host.includes('v0-phantomfluxkey.vercel.app')) runPhantomFluxKeyBypasser();
        else if (host.includes('link-unlock.com'))          runLinkUnlockBypasser();
        else if (host.includes('link4sub.com'))             runLink4SubBypasser();
        else if (host.includes('tapvietcode.com'))          runTapVietCodeBypasser();
        else if (TPI_HOSTS.some(h => host.includes(h)))    runTpiLiBypasser();
        else if (FORM_HOSTS.some(h => host.includes(h)))   runFormBypasser();
        else if (host.includes('sub4unlock.co'))             runSub4UnlockBypasser();
        else if (host.includes('app.khaddavi.net'))          runKhaddaviBypasser();
        else if (host.includes('sfl.gl'))                    runSflGlBypasser();
        else if (host.includes('ytsubme.com'))               runYtSubMeBypasser();
        else if (host.includes('aylink.co'))                 runAylinkBypasser();
        else if (host.includes('hehehub-acsu123.pythonanywhere.com') && /[?&]hwid=[\w.]+/.test(location.search))
                                                             runHehehubSkipper();
        else if (host.includes('getpolsec.com'))             runGetPolSecBypasser();
        else if (
            host.includes('biplabtewary.com')   ||
            host.includes('mwgamesyt.com.br')   ||
            host.includes('topjogosvip.online') ||
            host.includes('legacyagency.com.br')
        )                                                    runButtonFinderBypasser();
        else                                                 runSafelinkBypasser();
    } catch (routerErr) {
        console.error('[ULB] Uncaught router error:', routerErr);
        notify(`ULB: unexpected error — ${routerErr.message}`, 'error', 8000);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §7  BYPASSERS
    // ═══════════════════════════════════════════════════════════════════════

    // ── PhantomFluxKey ─────────────────────────────────────────────────────

    function runPhantomFluxKeyBypasser() {
        notify('PhantomFluxKey detected — showing direct bypass…', 'info', undefined, { site: 'phantomfluxkey' });
        showDirectBypassBtn('Direct Bypass — Get Key', CONFIG.phantomDirectUrl, 'PhantomFluxKey Direct Bypass');
    }

    // ── dl.surf ────────────────────────────────────────────────────────────

    function runDlSurf() {
        const API    = 'https://backendapi.dl.surf/api/file';
        const DL_KEY = '0x4AAAAAABbfHaaMuK4MmNeI';
        const slug   = location.pathname.split('/').filter(Boolean).pop();

        // dl.surf-specific fetchJSON: validates the .status field and unwraps .data.
        const dlFetch = async (url, opts) => {
            const r = await fetch(url, opts);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            if (j.status !== 'success') throw new Error(j.message || 'API error');
            return j.data;
        };

        const getToken       = () => dlFetch(`${API}/request-download/file/${slug}/`, { headers: { Accept: 'application/json' } }).then(d => d.token);
        const getDownloadUrl = (tk, cap) => dlFetch(`${API}/new-download-file/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: location.origin, Referer: location.href },
            body: JSON.stringify({ token: tk, captcha_token: cap }),
        }).then(d => d.url || d.download_url || d.link || d);

        const btn = Object.assign(document.createElement('button'), {
            title: 'Unknown Link Bypasser — Auto Download',
            innerHTML: 'Download via Bypasser',
        });

        let nh = null;
        const setStatus = (msg, type, extra) => nh ? nh.update(msg, type, extra) : (nh = notify(msg, type, 0, extra));

        function injectBtn() {
            const orig = document.querySelector('button[title="Continue to Download"]');
            if (orig) {
                btn.className = orig.className;
                btn.style.cssText = orig.style.cssText;
                btn.style.backgroundColor = btn.style.borderColor = '#dc2626';
                orig.replaceWith(btn);
            } else {
                Object.assign(btn.style, {
                    position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom,0px))',
                    right: 'calc(24px + env(safe-area-inset-right,0px))', zIndex: 99999,
                    padding: '12px 22px', backgroundColor: '#dc2626', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontFamily: 'Segoe UI,Arial,sans-serif', fontSize: '14px', fontWeight: '600',
                    minHeight: '44px', touchAction: 'manipulation',
                });
                document.body.appendChild(btn);
            }
            notify('dl.surf detected — bypasser ready.', 'info', undefined, { site: 'dl.surf' });
        }

        if (!CONFIG.dlSurfAutoInject) {
            notify('dl.surf — auto-inject disabled in config.', 'info', undefined, { site: 'dl.surf' });
            return;
        }

        let lastHref = location.href, injectIv = null;
        function startInjecting() {
            btn.innerHTML = 'Download via Bypasser'; btn.disabled = false;
            clearInterval(injectIv);
            injectIv = setInterval(() => {
                if (btn.isConnected) return;
                if (document.querySelector('button[title="Continue to Download"]')) { clearInterval(injectIv); injectBtn(); }
            }, 200);
            setTimeout(() => { clearInterval(injectIv); if (!btn.isConnected) injectBtn(); }, 15_000);
        }

        // Watch for SPA navigation (dl.surf is a SPA).
        const hrefCheck = () => { if (location.href !== lastHref) { lastHref = location.href; startInjecting(); } };
        new MutationObserver(hrefCheck).observe(document.querySelector('title') || document.head, { childList: true, subtree: true });
        setInterval(hrefCheck, 500);
        startInjecting();

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            const t = makeTimer();
            try {
                setStatus('Requesting download token…', 'loading', { site: 'dl.surf' });
                const token = await getToken();
                setStatus('Solving captcha automatically…', 'loading', { site: 'dl.surf' });
                const cap   = await solveTurnstile(DL_KEY);
                setStatus('Fetching download URL…', 'loading', { site: 'dl.surf' });
                const url   = await getDownloadUrl(token, cap);
                if (typeof url === 'string' && url.startsWith('http')) {
                    setStatus('Download started!', 'success', { site: 'dl.surf', time: t.elapsed() + 's' });
                    const a = Object.assign(document.createElement('a'), { href: url, download: '', target: '_blank', rel: 'noopener' });
                    document.body.appendChild(a);
                    try { a.click(); } catch (_) {}
                    a.remove();
                    if (isIOS()) window.open(url, '_blank');
                } else {
                    setStatus('Unexpected response — check console.', 'warn', { site: 'dl.surf' });
                    console.warn('[ULB/dl.surf] unexpected download URL response:', url);
                }
                setTimeout(() => { nh?.remove(); nh = null; }, 4000);
            } catch (err) {
                console.error('[ULB/dl.surf]', err);
                setStatus(`Error: ${err.message}`, 'error', { site: 'dl.surf' });
                setTimeout(() => { nh?.remove(); nh = null; }, 5000);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ── airflowscript.com ──────────────────────────────────────────────────

    function runAirflowBypasser() {
        const KEY = 'rinku_step1_done';
        if (localStorage.getItem(KEY) === 'true') return;
        notify('Bypassing Discord requirement…', 'loading', 3000, { site: 'airflowscript.com' });
        localStorage.setItem(KEY, 'true');
        location.reload();
    }

    // ── bstlar.com ─────────────────────────────────────────────────────────

    function runBstlarBypasser() {
        const SITE = 'bstlar.com';
        const t    = makeTimer();
        const nh   = notify(`${SITE} detected — bypassing…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh);

        const run = async () => {
            try {
                const el             = document.getElementById('link_action_id');
                const link_action_id = el ? (el.value ?? el.textContent) : null;
                const r1 = await fetch(`/api/link?url=${encodeURIComponent(path.slice(1))}&link_action_id=${link_action_id}`);
                if (!r1.ok) throw new Error(`/api/link returned HTTP ${r1.status}`);
                const linkData = await r1.json();

                const r2 = await fetch('/api/link-completed', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ link_id: linkData.id, link_action_id }),
                });
                if (!r2.ok) throw new Error(`/api/link-completed returned HTTP ${r2.status}`);
                const result = await r2.json();
                if (!result.destination_url) throw new Error('No destination_url in response');

                safeRedirect(result.destination_url, nh, { t, siteLabel: SITE });
            } catch (err) { handleError('bypass failed', err); }
        };
        onReady(run);
    }

    // ── wareguardv2.xyz ────────────────────────────────────────────────────

    function runWareguardBypasser() {
        const SITE = 'wareguardv2.xyz';
        const t    = makeTimer();
        const nh   = notify('wareguardv2 checkpoint — bypassing…', 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh);

        const run = () => {
            try {
                const btn = document.getElementById('continueBtn');
                if (!btn?.href) { handleError('continueBtn not found', null); return; }

                const r = new URL(btn.href).searchParams.get('r');
                if (!r)   { handleError('no redirect parameter found', null); return; }

                let dest;
                try { dest = atob(decodeURIComponent(r)); }
                catch (e) { handleError('failed to decode redirect URL', e); return; }

                if (!safeUrl(dest)) { handleError('decoded URL is invalid or unsafe', null); return; }

                nh.update('Redirecting in 1s…', 'info', { site: SITE });
                showCountdown(1, () => safeRedirect(dest, nh, { t, siteLabel: SITE }), 'wareguardv2 bypass');
            } catch (err) { handleError('unexpected error', err); }
        };
        onReady(run);
    }

    // ── subnise.com ────────────────────────────────────────────────────────

    function runSubniseBypasser() {
        const SITE = 'subnise.com';
        const t    = makeTimer();
        const nh   = notify(`${SITE} detected — bypassing…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh);

        const run = async () => {
            try {
                const id = path.split('/').pop();
                if (!id) throw new Error('Could not extract link ID from URL');
                const r = await fetch(`/api/links/${id}`);
                if (!r.ok) throw new Error(`API returned HTTP ${r.status}`);
                const data = await r.json();
                if (!data.url) throw new Error('No URL in API response');

                nh.update('Redirecting in 1s…', 'info', { site: SITE });
                showCountdown(1, () => safeRedirect(data.url, nh, { t, siteLabel: SITE }), 'subnise bypass');
            } catch (err) { handleError('bypass failed', err); }
        };
        onReady(run);
    }

    // ── tpi.li ─────────────────────────────────────────────────────────────

    function runTpiLiBypasser() {
        const DELAY = 3;

        function extractUrl() {
            try {
                const tokenInput = document.querySelector('[name=token]');
                if (!tokenInput?.value) return null;
                const match = tokenInput.value.match(/aHR0cHM6Ly9[A-Za-z0-9+/=]*/);
                if (!match) return null;
                return atob(match[0]);
            } catch { return null; }
        }

        function doBypass() {
            const t    = makeTimer();
            const dest = extractUrl();
            if (!dest) { notify('tpi.li: token not found — check console.', 'error', 6000, { site: 'tpi.li' }); return; }
            notify(`tpi.li decoded. Redirecting in ${DELAY}s…`, 'info', 4000, { site: 'tpi.li' });
            showCountdown(DELAY, () => {
                notify('tpi.li — redirected!', 'success', undefined, { site: 'tpi.li', time: t.elapsed() + 's' });
                location.href = dest;
            }, 'tpi.li bypass');
        }

        function init() {
            notify('tpi.li bypasser active…', 'loading', 2500, { site: 'tpi.li' });
            if (extractUrl()) { doBypass(); return; }
            const obs = new MutationObserver(() => {
                if (extractUrl()) { obs.disconnect(); doBypass(); }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['value'] });
            let tries = 0;
            const iv = setInterval(() => {
                if (extractUrl() || ++tries > 60) { clearInterval(iv); obs.disconnect(); if (extractUrl()) doBypass(); }
            }, 500);
        }
        onReady(init);
    }

    // ── safelink (generic) ─────────────────────────────────────────────────

    function runSafelinkBypasser() {
        let scheduled = false;
        const t = makeTimer();

        // Ad-blocking setup, isolated to an IIFE so cleanAds is properly scoped.
        const _cleanAds = CONFIG.blockAds ? (() => {
            const AD_SEL = [
                'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]', 'iframe[src*="adservice"]',
                'div[id^="div-gpt-ad"]', 'ins.adsbygoogle',
                'script[src*="pagead2.googlesyndication"]', 'script[src*="securepubads"]',
                'script[src*="adsbygoogle"]', 'script[src*="googletag"]',
                'div[class*="ad-"]', 'div[id*="-ad-"]', 'div[class*="ads-"]',
                '[data-ad-slot]', '[data-ad-client]',
            ];
            const AD_PAT = [
                /pagead2\.googlesyndication\.com/, /securepubads\.g\.doubleclick\.net/, /adsbygoogle/,
                /googletag/, /googleadservices/, /adnxs\.com/, /popads\.net/, /popcash\.net/,
                /propellerads\.com/, /exoclick\.com/, /trafficjunky\.net/, /hilltopads\.net/, /adsterra\.com/,
            ];

            const _ac  = Element.prototype.appendChild;
            const _ib  = Element.prototype.insertBefore;
            const isAd = el => {
                if (!el || el.nodeType !== 1) return false;
                const src = el.src || el.getAttribute?.('src') || '';
                const tg  = el.tagName?.toLowerCase();
                return (tg === 'script' || tg === 'iframe') && src && AD_PAT.some(p => p.test(src));
            };
            Element.prototype.appendChild  = function (c) { return isAd(c) ? c : _ac.call(this, c); };
            Element.prototype.insertBefore = function (n, r) { return isAd(n) ? n : _ib.call(this, n, r); };

            // Stub out ad globals so inline ad scripts don't throw.
            window.googletag  = { cmd: { push: () => {} }, defineSlot: () => ({ addService: () => ({}) }), pubads: () => ({}), enableServices: () => {}, display: () => {} };
            window.adsbygoogle = { push: () => {} };

            return () => AD_SEL.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));
        })() : () => {};

        function extract() {
            const inp = document.querySelector('input[name="newwpsafelink"]');
            if (!inp) return null;
            try {
                const outer = JSON.parse(atob(inp.value));
                const url   = new URL(outer.linkr);
                const inner = JSON.parse(atob(url.searchParams.get('safelink_redirect')));
                return { dest: inner.safelink || inner.second_safelink_url || null, delay: Math.max(0, parseInt(outer.delay, 10) || 0) };
            } catch { return null; }
        }

        function scheduleBypass() {
            if (scheduled) return;
            const data = extract();
            if (!data?.dest) return;
            scheduled = true;
            notify(`Safelink decoded. Redirecting in ${data.delay}s.`, 'info', 5000, { site: host });
            const startCountdown = () => {
                showCountdown(data.delay, () => {
                    notify('Safelink bypassed!', 'success', undefined, { site: host, time: t.elapsed() + 's' });
                    showRedirectNotif(data.dest);
                    window.location.replace(data.dest);
                }, CONFIG.blockAds ? 'Ads blocked' : 'Redirecting');
            };
            if (document.readyState === 'complete') startCountdown();
            else window.addEventListener('load', startCountdown, { once: true });
        }

        function startObserver() {
            const obs = new MutationObserver(mutations => {
                _cleanAds();
                if (scheduled) return;
                for (const m of mutations)
                    for (const n of m.addedNodes)
                        if (n.nodeType === 1 && (n.matches?.('input[name="newwpsafelink"]') || n.querySelector?.('input[name="newwpsafelink"]'))) {
                            scheduleBypass();
                            if (scheduled) obs.disconnect();
                        }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
        }

        function init() {
            notify('Unknown Link Bypasser active — scanning…', 'loading', 3000, { site: host });
            _cleanAds();
            scheduleBypass();
            if (!scheduled) startObserver();
        }

        if (document.readyState === 'complete') init();
        else window.addEventListener('load', init, { once: true });

        let attempts = 0;
        const poll = setInterval(() => {
            _cleanAds();
            if (scheduled || ++attempts > 60) clearInterval(poll);
            else scheduleBypass();
        }, 500);
    }

    // ── form-based bypasser ────────────────────────────────────────────────

    function runFormBypasser() {
        // Stub out the anti-bot selector check the page uses.
        const _qs = Document.prototype.querySelector;
        Document.prototype.querySelector = function (sel) {
            if (typeof sel === 'string' && sel.includes('eecdbd')) return this.createElement('div');
            return _qs.call(this, sel);
        };

        const RETRY_KEY     = '__ulb_shrtslug_extra_delay';
        const extraDelaySec = parseInt(sessionStorage.getItem(RETRY_KEY) || '0', 10);
        const t = makeTimer();

        notify(
            extraDelaySec > 0 ? `Retry #${extraDelaySec} — adding ${extraDelaySec}s extra delay…` : 'Form bypasser active — waiting for page…',
            extraDelaySec > 0 ? 'warn' : 'loading',
            extraDelaySec > 0 ? 4000  : 3000,
            { site: host }
        );

        waitForEl('form[action*="api-endpoint/verify"]').then(async form => {
            const action        = form.querySelector('input[name="action"]')?.value;
            const progressMatch = [...document.querySelectorAll('script')].map(s => s.textContent.match(/progress_original\s*=\s*(\d+)/)).find(Boolean);
            const baseDelay     = action === 'countdown' ? 5000 : progressMatch ? +progressMatch[1] * 1000 : 0;
            const delay         = baseDelay + extraDelaySec * 1000;
            const seconds       = Math.ceil(delay / 1000);
            await waitBody();

            let nh = null;
            const setStatus = (msg, type, extra) => nh ? nh.update(msg, type, extra) : (nh = notify(msg, type, 0, extra));

            const [captchaToken] = await Promise.all([
                action === 'captcha'
                    ? (setStatus('Solving captcha automatically…', 'loading', { site: host }), solveTurnstile(getSiteKey()))
                    : Promise.resolve(null),
                seconds > 0 ? new Promise(res => showCountdown(seconds, res, 'Processing safelink…')) : Promise.resolve(),
            ]);

            setStatus('Fetching destination…', 'loading', { site: host });

            const data = new FormData();
            form.querySelectorAll('input[type="hidden"]').forEach(f => data.append(f.name, f.value));
            if (captchaToken) data.append('cf-turnstile-response', captchaToken);

            let result;
            try {
                const res = await fetch(form.getAttribute('action'), { method: 'POST', body: data });
                result = await res.json();
            } catch (err) {
                const nextExtra = extraDelaySec + 1;
                sessionStorage.setItem(RETRY_KEY, String(nextExtra));
                setStatus(`Request error — reloading with +${nextExtra}s delay…`, 'warn');
                setTimeout(() => location.reload(), 2500);
                return;
            }

            if (result.status !== 'success') { setStatus(`Failed: ${result.data || result.message || 'unknown'}`, 'error'); return; }

            sessionStorage.removeItem(RETRY_KEY);
            const { final, next_page, speed_token } = result.data;

            if (final) {
                setStatus('Redirecting!', 'success', { site: host, time: t.elapsed() + 's' });
                setTimeout(() => nh?.remove(), 3000);
                if (final.toLowerCase().startsWith('http')) window.location = final;
                else unsafeWindow.setup_special_link?.(final) ?? console.warn('[ULB/FormBypasser] setup_special_link missing for:', final);
            } else if (next_page && speed_token) {
                setStatus('Next step — continuing…', 'loading', { site: host });
                const next = Object.assign(document.createElement('form'), { method: 'POST', action: next_page });
                next.insertAdjacentHTML('beforeend', `<input type="hidden" name="speed_token" value="${speed_token}">`);
                document.body.appendChild(next);
                next.submit();
            } else {
                setStatus('Unexpected response — check console.', 'warn');
                console.warn('[ULB/FormBypasser] unrecognised result.data:', result.data);
            }
        });
    }

    // ── reshortfly.com ─────────────────────────────────────────────────────

    function runReshortflyBypasser() {
        const SITE = 'reshortfly.com';
        const t    = makeTimer();
        const nh   = notify(`${SITE} detected — waiting…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh);

        const doFetch = async () => {
            try {
                const form = document.querySelector('#go-link');
                if (!form) throw new Error('Form #go-link not found');
                const r  = await fetch('/links/go', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
                    body: new URLSearchParams(new FormData(form)),
                    credentials: 'include',
                });
                const tx = await r.text();
                let dest = null;
                try {
                    const j = JSON.parse(tx);
                    if (j.url) dest = j.url;
                    else if (j.data) dest = atob(j.data).match(/https?:\/\/[^\s"']+/)?.[0];
                } catch { dest = tx.match(/https?:\/\/[^\s"']+/)?.[0]; }
                if (!dest) throw new Error('No destination URL found in response');
                safeRedirect(dest, nh, { t, siteLabel: SITE });
            } catch (err) { handleError('fetch failed', err); }
        };

        onReady(() => {
            nh.update(`${SITE} — redirecting in 7s…`, 'loading', { site: SITE });
            showCountdown(7, doFetch, 'reshortfly bypass');
        });
    }

    // ── avnsgames.com interstitial ─────────────────────────────────────────

    function runAvnsGamesInterstitial() {
        const SITE = 'avnsgames.com';
        const t    = makeTimer();
        const nh   = notify('Interstitial page detected — waiting for redirect form…', 'loading', 0, { site: SITE });

        const trySubmit = () => {
            const f = document.getElementById('go_d2');
            if (f) {
                nh.update('Form found — submitting…', 'success', { site: SITE, time: t.elapsed() + 's' });
                setTimeout(() => nh.remove(), 1500);
                HTMLFormElement.prototype.submit.call(f);
                return true;
            }
            return false;
        };

        const init = () => {
            if (trySubmit()) return;
            pollUntil(trySubmit, 300, 100).catch(() => {
                nh.update('Interstitial form not found — unsupported page layout.', 'error');
                setTimeout(() => nh.remove(), 6000);
            });
        };
        onReady(init);
    }

    // ── lnbz.la ────────────────────────────────────────────────────────────

    function runLnbzLaBypasser() {
        const detect = () => {
            const adEl = document.querySelector('[name="ad_form_data"]');
            if (adEl) { _lnbzGoPage(adEl); return; }
            const form = document.querySelector('form');
            if (form) { _lnbzCaptchaPage(form); return; }
            const obs = new MutationObserver(() => {
                const adEl2 = document.querySelector('[name="ad_form_data"]');
                const form2 = document.querySelector('form');
                if (adEl2 || form2) { obs.disconnect(); adEl2 ? _lnbzGoPage(adEl2) : _lnbzCaptchaPage(form2); }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
        };
        onReady(detect);
    }

    function _lnbzGoPage(adFormDataEl) {
        const FALLBACK_SECS = 15;
        const SITE = 'lnbz.la';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — reading countdown…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const doFetch = async () => {
            nh.update(`${SITE} — fetching destination…`, 'loading', { site: SITE });
            try {
                const r = await fetch('/links/go', {
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'x-requested-with': 'XMLHttpRequest' },
                    body: '_method=POST&ad_form_data=' + encodeURIComponent(adFormDataEl.value),
                });
                if (!r.ok) throw new Error(`Server returned HTTP ${r.status}`);
                let d;
                try { d = await r.json(); } catch { throw new Error('Response was not valid JSON'); }
                if (!d.url) throw new Error('No destination URL in server response');
                safeRedirect(d.url, nh, { t, siteLabel: SITE });
            } catch (err) { handleError('fetch failed', err); }
        };

        _lnbzWaitForAppVars(vars => {
            const secs = Math.max(1, parseInt(vars?.counter_value, 10) || FALLBACK_SECS);
            nh.update(`${SITE} — redirecting in ${secs}s…`, 'loading', { site: SITE });
            showCountdown(secs, doFetch, `${SITE} bypass`);
        });
    }

    // ── bloxscript.live ────────────────────────────────────────────────────

    function runBloxscriptBypasser() {
        const SITE = 'bloxscript.live';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — waiting for key generator…`, 'loading', 0, { site: SITE });

        const tryGenerate = () => {
            const keyEl = document.getElementById('keyValue');
            const gen   = unsafeWindow.generateKey;
            if (!keyEl || typeof gen !== 'function') return false;
            try {
                const key = gen();
                keyEl.textContent = key;
                copyToClipboard(key)
                    .then(() => {
                        nh.update('Key generated and copied to clipboard!', 'success', { site: SITE, time: t.elapsed() + 's' });
                        setTimeout(() => nh.remove(), 4000);
                    })
                    .catch(() => {
                        nh.update(`Key generated: ${key} (copy failed — paste manually)`, 'warn', { site: SITE });
                        setTimeout(() => nh.remove(), 8000);
                    });
            } catch (err) {
                console.error('[ULB/bloxscript]', err);
                nh.update(`bloxscript error: ${err.message}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            }
            return true;
        };

        const init = () => {
            pollUntil(tryGenerate, 200, 100).catch(() => {
                nh.update(`${SITE}: key generator not found — unsupported layout.`, 'error');
                setTimeout(() => nh.remove(), 6000);
            });
        };
        onReady(init);
    }

    // ── jankariweb ─────────────────────────────────────────────────────────

    function runJoberBypasser() {
        if (path !== '/') clickWhenReady('btn7', 'jankariweb step 2');
        else              clickWhenReady('notarobot', 'jankariweb step 1');
    }

    // ── how2guidess.com ────────────────────────────────────────────────────

    function runHow2GuidesBypasser() {
        const SITE = 'how2guidess.com';

        const waitAndClick = (id, afterMs, afterFn) => {
            pollUntil(() => {
                const el = document.getElementById(id);
                if (!el) return false;
                el.click();
                return true;
            }, 200, 150)
                .then(() => {
                    notify(`how2guidess — clicked #${id}`, 'info', 2000, { site: SITE });
                    if (afterFn) setTimeout(afterFn, afterMs);
                })
                .catch(() => {
                    notify(`${SITE}: #${id} not found — unsupported layout.`, 'error', 6000, { site: SITE });
                });
        };

        const run = () => {
            const t  = makeTimer();
            const nh = notify(`${SITE} — bypassing…`, 'loading', 0, { site: SITE });
            waitAndClick('gi', 500, () => {
                nh.update('Step 1 done…', 'loading', { site: SITE });
                waitAndClick('ci', 0, () => {
                    nh.update('Done!', 'success', { site: SITE, time: t.elapsed() + 's' });
                    setTimeout(() => nh.remove(), 2000);
                });
            });
        };
        onReady(run);
    }

    // ── go.yorurl.com / go.caslinks.com ────────────────────────────────────

    function runYorurlBypasser()   { _runYorurlLikeBypasser('go.yorurl.com');  }
    function runCasLinksBypasser() { _runYorurlLikeBypasser('go.caslinks.com'); }

    // ── link-unlock.com ────────────────────────────────────────────────────

    function runLinkUnlockBypasser() {
        const SITE = 'link-unlock.com';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — bypassing…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const slug = new URL(location.href).pathname.split('/').filter(Boolean)[0];
        if (!slug) { handleError('could not read slug from URL', null); return; }

        (async () => {
            try {
                nh.update(`${SITE} — fetching steps…`, 'loading', { site: SITE });
                const d1    = await fetchJSON(`https://api.link-unlock.com/u/${slug}`);
                const steps = d1?.unlock?.steps?.map(s => s.id);
                if (!steps?.length) throw new Error('No steps found in API response');

                nh.update(`${SITE} — completing steps…`, 'loading', { site: SITE });
                const d2 = await fetchJSON(`https://api.link-unlock.com/u/${slug}/complete`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ steps }),
                });
                if (!d2?.destinationUrl) throw new Error('No destinationUrl in response');

                safeRedirect(d2.destinationUrl, nh, { t, siteLabel: SITE });
            } catch (err) { handleError('bypass failed', err); }
        })();
    }

    // ── link4sub.com ───────────────────────────────────────────────────────

    function runLink4SubBypasser() {
        notify('link4sub.com — following redirect to tapvietcode.com…', 'info', undefined, { site: 'link4sub.com' });
    }

    // ── tapvietcode.com ────────────────────────────────────────────────────

    function runTapVietCodeBypasser() {
        const SITE = 'tapvietcode.com';

        if (host.includes('blog.tapvietcode.com')) {
            // Blog subdomain: click the continueBtn when it appears.
            const t  = makeTimer();
            const nh = notify(`${SITE} — waiting for continue button…`, 'loading', 0, { site: SITE });

            const tryClick = () => {
                const btn = document.getElementById('continueBtn');
                if (!btn) return false;
                if (!btn.href) {
                    nh.update(`${SITE}: continueBtn has no href.`, 'error');
                    setTimeout(() => nh.remove(), 6000);
                    return true; // stop polling even on soft error
                }
                safeRedirect(btn.href, nh, { t, siteLabel: SITE });
                return true;
            };

            const init = () => {
                pollUntil(tryClick, 200, 150).catch(() => {
                    nh.update(`${SITE}: continue button not found — unsupported layout.`, 'error');
                    setTimeout(() => nh.remove(), 6000);
                });
            };
            onReady(init);

        } else {
            // Main domain: read destination from localStorage.
            const t  = makeTimer();
            const nh = notify(`${SITE} — reading destination from storage…`, 'loading', 0, { site: SITE });

            const tryStorage = () => {
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        const v = localStorage.getItem(k);
                        if (!v?.includes('"lnk1"')) continue;
                        try {
                            const j = JSON.parse(v);
                            const u = j?.data?.lnk?.lnk1?.url || j?.lnk?.lnk1?.url;
                            if (u) { safeRedirect(u, nh, { t, siteLabel: SITE }); return true; }
                        } catch (_) { /* malformed entry, skip */ }
                    }
                } catch (e) { console.error('[ULB/tapvietcode] localStorage read failed', e); }
                return false;
            };

            const init = () => {
                pollUntil(tryStorage, 300, 100).catch(() => {
                    nh.update(`${SITE}: lnk1 URL not found in storage — unsupported layout.`, 'error');
                    setTimeout(() => nh.remove(), 6000);
                });
            };
            onReady(init);
        }
    }

    // ── gplinks.co ─────────────────────────────────────────────────────────

    function runGpLinksBypasser() {
        const SITE = 'gplinks.co';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — solving captcha…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const getGpSiteKey = () => {
            const iframe = document.querySelector('iframe[src*="challenges.cloudflare.com"]');
            if (iframe) {
                const m = iframe.getAttribute('src').match(/\/([0-9a-zA-Z_\-]{20,})\//);
                if (m) return m[1];
            }
            return getSiteKey();
        };

        const init = async () => {
            let btn;
            try { btn = await waitForEl('#captchaButton', 200, 15_000); }
            catch (e) { handleError('captchaButton not found', e); return; }

            // If the button already has a real href, skip the captcha solve.
            const existingHref = btn.getAttribute('href');
            if (existingHref && existingHref !== '#' && !existingHref.startsWith('javascript')) {
                safeRedirect(existingHref, nh, { t, siteLabel: SITE });
                return;
            }

            const sitekey = getGpSiteKey();
            if (!sitekey) { handleError('could not find Turnstile sitekey', null); return; }

            let token;
            try { token = await solveTurnstile(sitekey); }
            catch (e) { handleError('Turnstile solve failed', e); return; }

            // Inject token into the hidden input and fire the page callback.
            let tsInput = document.querySelector('[name="cf-turnstile-response"]');
            if (!tsInput) {
                tsInput = Object.assign(document.createElement('input'), { type: 'hidden', name: 'cf-turnstile-response' });
                document.body.appendChild(tsInput);
            }
            tsInput.value = token;

            const cbName = document.querySelector('[data-callback]')?.dataset?.callback;
            if (cbName) {
                try { if (typeof unsafeWindow[cbName] === 'function') unsafeWindow[cbName](token); } catch (_) {}
            }

            // Wait for the button href to be populated by the page's own JS.
            nh.update(`${SITE} — waiting for link…`, 'loading', { site: SITE });
            pollUntil(() => {
                const href = btn.getAttribute('href');
                return href && href !== '#' && !href.startsWith('javascript') && href.startsWith('http') ? href : false;
            }, 200, 150)
                .then(href => safeRedirect(href, nh, { t, siteLabel: SITE }))
                .catch(() => handleError('link did not appear after captcha solve — unsupported layout', null));
        };

        onReady(init);
    }

    // ── powergam.online ────────────────────────────────────────────────────

    function runPowergamBypasser() {
        const SITE     = 'powergam.online';
        const REQUIRED = ['imps', 'lid', 'pages', 'pid', 'step_count', 'vid'];
        const t        = makeTimer();

        const getCookies = () => Object.fromEntries(
            document.cookie.split('; ').filter(Boolean)
                .map(c => c.split('=').map(decodeURIComponent))
        );

        const handleError = makeErrHandler(SITE, null, 7000); // no nh — fires new toasts

        const runSteps = async (cookies, pages, finalURL) => {
            const ref = window.location.origin;
            for (let s = 1; s <= pages; s++) {
                const nh2 = notify(
                    `${SITE} — posting step ${s}/${pages}…`,
                    'loading', 0,
                    { site: SITE, time: t.elapsed() + 's' }
                );
                const body = new URLSearchParams({
                    ad_impressions: 2,
                    form_name:      'ads-track-data',
                    next_target:    s === pages ? finalURL : ref,
                    step_id:        String(s),
                    visitor_id:     cookies.vid,
                });
                try {
                    await fetch(`${ref}/`, {
                        method:      'POST',
                        headers:     { 'Content-Type': 'application/x-www-form-urlencoded', Referer: `${ref}/` },
                        credentials: 'include',
                        body:        body.toString(),
                    });
                } catch (e) { console.warn(`[ULB/${SITE}] POST failed at step ${s}`, e); }
                nh2.remove();
                if (s < pages) await sleep(1200);
            }
            notify(`${SITE} — redirecting…`, 'success', 2000, { site: SITE, time: t.elapsed() + 's' });
            if (safeUrl(finalURL)) location.href = finalURL;
            else handleError('invalid final URL', null);
        };

        let executed = false;
        const waiter = setInterval(() => {
            if (executed) return;
            const cookies = getCookies();
            if (!REQUIRED.every(k => k in cookies)) return;
            executed = true;
            clearInterval(waiter);

            const pages = parseInt(cookies.pages, 10);
            if (!pages || pages < 1) { handleError('invalid pages cookie', null); return; }

            const finalURL  = `https://gplinks.co/${cookies.lid}?pid=${cookies.pid}&vid=${cookies.vid}`;
            const delaySecs = pages * 30;

            notify(
                `${SITE} — ${pages} step${pages > 1 ? 's' : ''} detected, waiting ${delaySecs}s…`,
                'info', 4000, { site: SITE }
            );
            showCountdown(delaySecs, () => runSteps(cookies, pages, finalURL), `powergam — ${pages} page${pages > 1 ? 's' : ''}`);
        }, 500);
    }

    // ── rojgarhindi.in ─────────────────────────────────────────────────────

    function runRojgarhindiBypasser() {
        const SITE = 'rojgarhindi.in';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — detecting page type…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh);

        const tryBypass = () => {
            const btn = document.getElementById('btn6');
            if (btn?.href && safeUrl(btn.href)) {
                safeRedirect(btn.href, nh, { t, siteLabel: SITE });
                return true;
            }
            const form = [...document.forms].find(f => /^tp\d*$/i.test(f.name || '') && f.name !== 'search-form');
            if (form) {
                nh.update(`${SITE} — submitting form…`, 'success', { site: SITE, time: t.elapsed() + 's' });
                setTimeout(() => nh.remove(), 2000);
                HTMLFormElement.prototype.submit.call(form);
                return true;
            }
            return false;
        };

        const init = () => {
            pollUntil(tryBypass, 200, 150).catch(() => {
                handleError('no btn6 or tp-form found — unsupported layout', null);
            });
        };
        onReady(init);
    }

    // ── aylink.co ──────────────────────────────────────────────────────────

    function runAylinkBypasser() {
        const SITE = 'aylink.co';
        const t    = makeTimer();
        const handleError = (label, err) => {
            console.error(`[ULB/${SITE}] ${label}`, err ?? '');
            notify(`${SITE}: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error', 7000, { site: SITE });
        };

        // ── CAPTCHA PAGE ──────────────────────────────────────────────────
        const runCaptchaPage = async () => {
            const nh = notify(`${SITE} — solving captcha…`, 'loading', 0, { site: SITE });

            const sitekey = document.querySelector('.cf-turnstile[data-sitekey]')?.dataset?.sitekey
                || '0x4AAAAAAA-1YLZYLRnN8eBX';

            let token;
            try { token = await solveTurnstile(sitekey); }
            catch (e) { nh.remove(); handleError('captcha solve failed', e); return; }

            const hiddenInput = document.querySelector('[name="cf-turnstile-response"]');
            if (hiddenInput) hiddenInput.value = token;

            const cbName = document.querySelector('.cf-turnstile')?.dataset?.callback;
            if (cbName) {
                try { if (typeof unsafeWindow[cbName] === 'function') unsafeWindow[cbName](token); } catch (_) {}
            }

            const form = document.querySelector('form');
            if (form) {
                try { HTMLFormElement.prototype.submit.call(form); } catch (_) {}
            }

            nh.update(`${SITE} — captcha done, waiting for redirect…`, 'success', { site: SITE, time: t.elapsed() + 's' });
            setTimeout(() => nh.remove(), 3000);
        };

        // ── LINK PAGE ─────────────────────────────────────────────────────
        const runLinkPage = async () => {
            const nh = notify(`${SITE} — fetching token…`, 'loading', 0, { site: SITE });

            // _a, _t, _d are comma-declared; scrape from inline script text.
            const scrapeVar = name => {
                for (const s of document.querySelectorAll('script:not([src])')) {
                    const m = s.textContent.match(new RegExp(`\\b${name}\\s*=\\s*'([^']+)'`));
                    if (m) return m[1];
                }
                return '';
            };
            const _a = unsafeWindow._a || scrapeVar('_a');
            const _t = unsafeWindow._t || scrapeVar('_t');
            const _d = unsafeWindow._d || scrapeVar('_d');

            const alias = location.pathname.split('/').filter(Boolean).pop() || '';
            const csrf  = unsafeWindow?.app?.csrf ?? document.querySelector('[name="csrf"]')?.value ?? '';

            try {
                nh.update(`${SITE} — getting tk…`, 'loading', { site: SITE });
                const tkResp = await fetchJSON('/get/tk', {
                    method:      'POST',
                    credentials: 'include',
                    headers:     { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: new URLSearchParams({ _a, _t, _d }),
                });

                if (!tkResp.status) {
                    nh.remove();
                    handleError('tk request failed', null);
                    console.log('[ULB/aylink] tk resp:', tkResp);
                    return;
                }

                nh.update(`${SITE} — fetching destination…`, 'loading', { site: SITE });
                const goResp = await fetchJSON('/links/go2', {
                    method:      'POST',
                    credentials: 'include',
                    headers:     { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: new URLSearchParams({ alias, csrf, tkn: tkResp.th }),
                });

                if (!goResp.url) {
                    nh.remove();
                    handleError('no URL in go2 response', null);
                    console.log('[ULB/aylink] go2 resp:', goResp);
                    return;
                }

                safeRedirect(goResp.url, nh, { t, siteLabel: SITE });
            } catch (err) { nh.remove(); handleError('bypass failed', err); }
        };

        const isCaptchaPage = () => !!document.querySelector('.cf-turnstile[data-sitekey]');

        const init = () => {
            if (isCaptchaPage()) runCaptchaPage();
            else setTimeout(runLinkPage, 1000); // give app vars 1s to initialise
        };
        onReady(init);
    }

    // ── ytsubme.com ────────────────────────────────────────────────────────

    function runYtSubMeBypasser() {
        // Intercept the page's own API request rather than duplicating it.
        const SITE = 'ytsubme.com';
        const t    = makeTimer();

        const isTarget = url =>
            typeof url === 'string' && (url.includes('s2u_links.php') || url.includes('s2uGetLink'));

        let _handled = false;
        const handleData = data => {
            if (_handled) return;
            const url = data?.return_url || data?.msg?.target;
            if (!url) {
                console.warn('[ULB/ytsubme] no return_url in response:', data);
                notify(`${SITE}: no return_url in API response`, 'error', 7000, { site: SITE });
                return;
            }
            _handled = true;
            const nh = notify(`${SITE} — redirecting…`, 'success', { site: SITE, time: t.elapsed() + 's' });
            setTimeout(() => nh.remove(), CONFIG.autoDismissOnRedirect ? 500 : 2000);
            location.href = url;
        };

        // Hook fetch.
        const _origFetch = unsafeWindow.fetch;
        unsafeWindow.fetch = function (input, init) {
            const url     = typeof input === 'string' ? input : input?.url;
            const promise = _origFetch.apply(this, arguments);
            if (isTarget(url)) {
                promise
                    .then(r => r.clone().json())
                    .then(handleData)
                    .catch(e => console.warn('[ULB/ytsubme] fetch intercept parse error:', e));
            }
            return promise;
        };

        // Hook XHR.
        const _OrigXHR = unsafeWindow.XMLHttpRequest;
        function PatchedXHR() {
            const xhr     = new _OrigXHR();
            const _open   = xhr.open.bind(xhr);
            let _targeted = false;
            xhr.open = function (method, url, ...rest) {
                if (isTarget(url)) _targeted = true;
                return _open(method, url, ...rest);
            };
            xhr.addEventListener('load', () => {
                if (!_targeted) return;
                try { handleData(JSON.parse(xhr.responseText)); }
                catch (e) { console.warn('[ULB/ytsubme] XHR intercept parse error:', e); }
            });
            return xhr;
        }
        PatchedXHR.prototype = _OrigXHR.prototype;
        unsafeWindow.XMLHttpRequest = PatchedXHR;
    }

    // ── sub4unlock.co ──────────────────────────────────────────────────────

    function runSub4UnlockBypasser() {
        const SITE = 'sub4unlock.co';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — reading destination…`, 'loading', 0, { site: SITE });

        const tryRedirect = () => {
            try {
                const url = JSON.parse(document.querySelector('#app')?.dataset.page || '{}')?.props?.link?.url;
                if (url) { safeRedirect(url, nh, { t, siteLabel: SITE }); return true; }
            } catch (_) { /* not ready yet */ }
            return false;
        };

        const init = () => {
            pollUntil(tryRedirect, 200, 150).catch(() => {
                nh.update(`${SITE}: destination URL not found — unsupported layout.`, 'error');
                setTimeout(() => nh.remove(), 7000);
            });
        };
        onReady(init);
    }

    // ── app.khaddavi.net ───────────────────────────────────────────────────

    function runKhaddaviBypasser() {
        const SITE = 'app.khaddavi.net';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — bypassing…`, 'loading', 0, { site: SITE });
        const handleError = makeErrHandler(SITE, nh, 7000);

        (async () => {
            try {
                const k = Math.floor(Math.random() * 1e3);
                const r = Math.random().toString(16).slice(2);

                await fetch('/api/verify', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _a: 0 }),
                });

                nh.update(`${SITE} — fetching link…`, 'loading', { site: SITE });
                const d = await fetchJSON('/api/go', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': r, 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({
                        key:  k,
                        size: `${(window.innerWidth + k) * 2}.${(window.innerHeight + k) * 2}`,
                        _dvc: r,
                    }),
                });

                if (d.url) {
                    safeRedirect(d.url, nh, { t, siteLabel: SITE });
                } else {
                    handleError('no URL in response', null);
                    console.log('[ULB/khaddavi] API response:', d);
                }
            } catch (err) { handleError('bypass failed', err); }
        })();
    }

    // ── sfl.gl ─────────────────────────────────────────────────────────────

    function runSflGlBypasser() {
        const SITE = 'sfl.gl';
        const t    = makeTimer();
        const nh   = notify(`${SITE} — reading destination…`, 'loading', 0, { site: SITE });

        const tryRedirect = () => {
            try {
                // Check inline script text for a window.location.href assignment.
                for (const s of document.querySelectorAll('script:not([src])')) {
                    const m = s.textContent.match(/window\.location\.href\s*=\s*"([^"]+)"/);
                    if (!m) continue;
                    const url = m[1].replace(/\\\//g, '/');
                    if (safeUrl(url)) { safeRedirect(url, nh, { t, siteLabel: SITE }); return true; }
                }
                // Also check the full HTML as a fallback (catches dynamically rendered strings).
                const m2 = document.documentElement.innerHTML.match(/window\.location\.href\s*=\s*"([^"]+)"/);
                if (m2) {
                    const url = m2[1].replace(/\\\//g, '/');
                    if (safeUrl(url)) { safeRedirect(url, nh, { t, siteLabel: SITE }); return true; }
                }
            } catch (_) {}
            return false;
        };

        const init = () => {
            pollUntil(tryRedirect, 200, 150).catch(() => {
                nh.update(`${SITE}: destination URL not found — unsupported layout.`, 'error');
                setTimeout(() => nh.remove(), 7000);
            });
        };
        onReady(init);
    }

    // ── Button-Finder sites ────────────────────────────────────────────────
    // Covers: biplabtewary.com, mwgamesyt.com.br, topjogosvip.online, legacyagency.com.br

    function runButtonFinderBypasser() {
        const SITE = host.replace(/^www\./, '');
        const t    = makeTimer();
        const nh   = notify(`${SITE} — detecting task…`, 'loading', 0, { site: SITE });

        // Read a "current/total" task progress indicator from <font> elements.
        const detectTask = () => {
            for (const el of document.querySelectorAll('font')) {
                const m = el.textContent.match(/\b(\d+)\s*\/\s*(\d+)\b/);
                if (m) return { current: parseInt(m[1], 10), total: parseInt(m[2], 10) };
            }
            return null;
        };

        // Find the first <a href> that wraps a <button>.
        const findHref = () =>
            [...document.querySelectorAll('a[href]')].find(a => a.querySelector('button'))?.href || null;

        const tryRedirect = () => {
            const task = detectTask();
            const href = findHref();

            if (task) {
                nh.update(`${SITE} — Task ${task.current}/${task.total}${href ? ' — redirecting…' : ' — waiting for button…'}`, href ? 'success' : 'loading', { site: SITE });
            }

            if (href) {
                safeRedirect(href, nh, { t, siteLabel: SITE });
                return true;
            }
            return false;
        };

        const init = () => {
            pollUntil(tryRedirect, 200, 200).catch(() => {
                nh.update(`${SITE}: no button-link found — unsupported layout.`, 'error');
                setTimeout(() => nh.remove(), 7000);
            });
        };
        onReady(init);
    }

    // ── hehehub-acsu123.pythonanywhere.com ────────────────────────────────

    function runHehehubSkipper() {
        const SITE = 'hehehub';
        const t    = makeTimer();
        const handleError = makeErrHandler(SITE, null, 7000);

        const trySkip = () => {
            const match = (document.body?.innerHTML || '').match(
                /window\.location\.href\s*=\s*['"`]([^'"`]+)['"`]/
            );
            const rawUrl = match?.[1];
            if (!rawUrl) return false;

            let dest;
            try {
                const x    = new URL(rawUrl);
                const hwid = x.searchParams.get('hwid');
                if (hwid) x.searchParams.set('hwid', hwid.replace('next', ''));
                dest = x.toString();
            } catch (e) {
                handleError('invalid redirect URL', e);
                return true; // stop polling even on error
            }

            if (!safeUrl(dest)) { handleError('decoded URL is unsafe', null); return true; }

            const nh = notify(`${SITE} — skipping extra steps…`, 'loading', 0, { site: SITE });
            nh.update(`${SITE} — done in ${t.elapsed()}s`, 'success', { site: SITE, time: t.elapsed() + 's' });
            setTimeout(() => nh.remove(), CONFIG.autoDismissOnRedirect ? 500 : 2000);
            location.href = dest;
            return true;
        };

        // Strip window.open(...,'_blank') from button onclick handlers.
        const stripBlankOpens = () => {
            document.querySelectorAll('button[onclick]').forEach(btn => {
                const orig    = btn.getAttribute('onclick');
                const cleaned = orig
                    .replace(/window\.open\s*\([^)]*['"]_blank['"]\s*\)\s*;?\s*/g, '')
                    .trim();
                if (cleaned !== orig) {
                    btn.setAttribute('onclick', cleaned);
                    console.log('[ULB/hehehub] stripped _blank open from button:', btn.textContent.trim());
                }
            });
        };

        // Also watch for dynamically added buttons.
        const blankObs = new MutationObserver(stripBlankOpens);

        const init = () => {
            stripBlankOpens();
            blankObs.observe(document.body, { childList: true, subtree: true });
            notify(`${SITE} — popup links removed from buttons`, 'info', undefined, { site: SITE });

            pollUntil(trySkip, 200, 150)
                .catch(() => {
                    blankObs.disconnect();
                    handleError('redirect URL not found in page source', null);
                })
                .finally(() => blankObs.disconnect());
        };
        onReady(init);
    }

    // ── getpolsec.com ──────────────────────────────────────────────────────

    function runGetPolSecBypasser() {
        // Only act on /ad/* paths; ignore everything else.
        if (!path.startsWith('/ad/')) return;

        const SITE = 'getpolsec.com';
        const t    = makeTimer();
        const handleError = makeErrHandler(SITE, null, 7000);

        const isCaptchaPresent = () => {
            if (document.querySelector('iframe[src*="hcaptcha.com"]'))          return true;
            if (document.querySelector('[name="h-captcha-response"]'))           return true;
            if (document.querySelector('[name="g-recaptcha-response"]'))         return true;
            for (const el of document.querySelectorAll('.mb-2.text-base.font-semibold, [class*="font-semibold"]')) {
                if (el.textContent.trim() === 'Verify You Are Human') return true;
            }
            return false;
        };

        const getHCaptchaToken = () => {
            const ta = document.querySelector('[name="h-captcha-response"]');
            if (ta?.value?.length > 20) return ta.value;
            try {
                if (typeof unsafeWindow.hcaptcha?.getResponse === 'function') {
                    const r = unsafeWindow.hcaptcha.getResponse();
                    if (r?.length > 20) return r;
                }
            } catch (_) {}
            return '';
        };

        const runBypass = async nh => {
            const adSlug = path.split('/').filter(Boolean).pop();
            nh.update(`${SITE} — fetching destination…`, 'loading', { site: SITE });

            try {
                const token   = getHCaptchaToken();
                const headers = {};
                if (token) headers['x-hcaptcha-response'] = token;

                const resp = await fetch(`https://api.getpolsec.com/ad/${adSlug}/linkvertise`, { headers });
                const r    = await resp.json();

                if (r?.message?.url) {
                    // Decode the destination from the API redirect URL's 'r' parameter.
                    let dest;
                    try {
                        dest = atob(new URL(r.message.url).searchParams.get('r'));
                    } catch (e) {
                        nh.update(`${SITE}: failed to decode destination URL`, 'error');
                        console.error('[ULB/getpolsec] atob decode failed:', e);
                        setTimeout(() => nh.remove(), 7000);
                        return;
                    }
                    safeRedirect(dest, nh, { t, siteLabel: SITE });
                } else {
                    console.log(`[ULB/${SITE}] API response:`, r);
                    nh.update(`${SITE}: link is not bypassable — manual action required.`, 'warn', 0, { site: SITE });
                    setTimeout(() => nh.remove(), 7000);
                }
            } catch (err) {
                handleError('bypass failed', err);
                nh.remove();
            }
        };

        // hCaptcha must be solved by the user — poll until we see a token.
        const runCaptchaWait = nh => {
            nh.update(`${SITE} — solve the hCaptcha to continue…`, 'warn', 0, { site: SITE });
            let tries = 0;
            const iv = setInterval(() => {
                const token = getHCaptchaToken();
                if (token) {
                    clearInterval(iv);
                    console.log(`[ULB/${SITE}] hCaptcha solved — proceeding with bypass`);
                    runBypass(nh);
                    return;
                }
                if (++tries > 600) { // 60 s timeout
                    clearInterval(iv);
                    handleError('timed out waiting for hCaptcha', null);
                }
            }, 100);
        };

        const init = () => {
            const nh = notify(`${SITE} — checking…`, 'loading', 0, { site: SITE });
            if (isCaptchaPresent()) runCaptchaWait(nh);
            else                    runBypass(nh);
        };
        onReady(init);
    }

})();
