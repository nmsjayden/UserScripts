// ==UserScript==
// @name         Unknown Link Bypasser
// @namespace    http://tampermonkey.net/
// @version      6.7.0
// @description  Safelink bypasser + dl.surf + form-based + tpi.li + bstlar + wareguardv2 + subnise + reshortfly + lnbz.la + bloxscript.live + go.yorurl.com + jankariweb + how2guidess.com + phantomfluxkey + link-unlock.com + link4sub.com/tapvietcode.com + rojgarhindi.in + go.caslinks.com + gplinks.co + powergam.online + 4br.me + short-jambo.com/ink + fastcars. Made by @Aro Moon | powergam bypass by @NickUpdates
// @author       @Aro Moon
// @include      /^https:\/\/mtc\d+\.[^/]+\.[a-z.]+\//
// @include      /^https?:\/\/(?:\w+\.)?fastcars\d+\.com\//
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
// @match        https://4br.me/*
// @match        https://short-jambo.com/*
// @match        https://short-jambo.ink/*
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

        // ── Auto-Solve Captcha ─────────────────────────────────────────────
        // When true,  Cloudflare Turnstile captchas are solved automatically.
        // When false, captcha pages are left for you to solve manually;
        //             the /links/go step (which has NO captcha) is still
        //             automated regardless of this setting.
        autoCaptcha: true,

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
            'gplinks.co', '4br.me',
            'short-jambo.com', 'short-jambo.ink',
        ],
    };

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║                    INTERNAL CODE — DO NOT EDIT                      ║
    // ╚══════════════════════════════════════════════════════════════════════╝

    // ── Constants ──────────────────────────────────────────────────────────
    const FORM_HOSTS = ['shrtslug.biz', 'biovetro.net', 'technons.com', 'tournguide.com', 'dailyjobposting.xyz', 'stfly.biz'];
    const TPI_HOSTS  = ['tpi.li'];

    const NOTIFY_TYPES = {
        info:    { accent: '#4f8ef7', icon: 'ℹ' },
        success: { accent: '#22c55e', icon: '✔' },
        warn:    { accent: '#f59e0b', icon: '⚠' },
        error:   { accent: '#ef4444', icon: '✖' },
        loading: { accent: '#a78bfa', icon: '◌' },
    };

    // ── Utility Helpers ────────────────────────────────────────────────────

    function generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID)
            return crypto.randomUUID().replace(/-/g, '');
        const arr = new Uint8Array(16);
        (window.crypto || window.msCrypto).getRandomValues(arr);
        return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }

    function onReady(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn, { once: true });
    }

    function waitForEl(sel, interval = 100, timeout = 20_000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(sel);
            if (el) return resolve(el);
            const iv = setInterval(() => {
                const found = document.querySelector(sel);
                if (found) { clearInterval(iv); if (tid) clearTimeout(tid); resolve(found); }
            }, interval);
            const tid = timeout > 0
                ? setTimeout(() => { clearInterval(iv); reject(new Error(`waitForEl: "${sel}" not found after ${timeout}ms`)); }, timeout)
                : null;
        });
    }

    const waitBody = () =>
        document.body
            ? Promise.resolve(document.body)
            : new Promise(r => document.addEventListener('DOMContentLoaded', () => r(document.body), { once: true }));

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

    const isIOS = () =>
        /iP(hone|ad|od)/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // ── Timer Helper ───────────────────────────────────────────────────────

    function makeTimer() {
        const start = performance.now();
        return {
            elapsed: () => ((performance.now() - start) / 1000).toFixed(2),
            label:   () => `Done in ${((performance.now() - start) / 1000).toFixed(2)}s`,
        };
    }

    // ── Notification Position ──────────────────────────────────────────────

    function _posStyles() {
        const p = CONFIG.notifPosition || 'bottom-right';
        const [v, h] = p.split('-');
        const vert  = v === 'top'  ? `top:calc(28px + env(safe-area-inset-top,0px))` : `bottom:calc(28px + env(safe-area-inset-bottom,0px))`;
        const horiz = h === 'left' ? `left:calc(28px + env(safe-area-inset-left,0px))` : `right:calc(28px + env(safe-area-inset-right,0px))`;
        const dir   = v === 'top'  ? 'column' : 'column-reverse';
        const slide = h === 'left' ? 'translateX(-20px)' : 'translateX(20px)';
        return { vert, horiz, dir, slide };
    }

    // ── Shared UI ──────────────────────────────────────────────────────────

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
     * @param {number} [duration]  Omit to use CONFIG.notifDuration; 0 = persistent
     * @param {object} [opts]
     * @param {string} [opts.site]   Site label shown in footer
     * @param {string} [opts.time]   Elapsed time string (e.g. "1.3s")
     * @returns {{ update(msg:string, type?:string, opts?:object):void, remove():void }}
     */
    function notify(message, type = 'info', duration, opts = {}) {
        const dur = duration === undefined ? CONFIG.notifDuration : duration;

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

        const pad  = CONFIG.compactMode ? '8px 12px' : '12px 16px';
        const mw   = CONFIG.compactMode ? 'min(200px,calc(100vw - 56px))' : 'min(240px,calc(100vw - 56px))';
        const maxW = CONFIG.compactMode ? 'min(280px,calc(100vw - 56px))' : 'min(320px,calc(100vw - 56px))';

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

    /** Countdown card */
    function showCountdown(seconds, onDone, subtitle = 'Redirect queued') {
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #4f8ef7;padding:14px 18px;min-width:min(240px,calc(100vw - 56px))`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:8px">Unknown Link Bypasser · @Aro Moon</div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                <div id="__ulb_cn" style="font-size:30px;font-weight:700;color:#fff;line-height:1;min-width:44px">${seconds}</div>
                <div style="color:#aaa;font-size:12px;line-height:1.5">
                    <div id="__ulb_cs">seconds remaining</div>
                    <div style="color:#555;font-size:10px;margin-top:2px">${subtitle}</div>
                </div>
            </div>
            <div style="background:rgba(255,255,255,.07);border-radius:999px;height:3px;overflow:hidden">
                <div id="__ulb_cb" style="height:100%;width:100%;background:linear-gradient(90deg,#4f8ef7,#a78bfa);border-radius:999px;transition:width 1s linear"></div>
            </div>`;
        mountCard(card);
        const numEl = card.querySelector('#__ulb_cn');
        const barEl = card.querySelector('#__ulb_cb');
        const subEl = card.querySelector('#__ulb_cs');
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

    /** Redirect notification with fallback tap link */
    function showRedirectNotif(dest) {
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #22c55e;padding:14px 18px;min-width:min(240px,calc(100vw - 56px));max-width:min(320px,calc(100vw - 56px))`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <div id="__ulb_ri" style="font-size:15px;color:#22c55e;flex-shrink:0">✔</div>
                <div id="__ulb_rm" style="font-size:13px;color:#e0e0e0">Redirecting now…</div>
            </div>
            <a href="${dest}" style="display:block;text-align:center;font-size:12px;color:#22c55e;text-decoration:none;padding:8px 12px;border:1px solid rgba(34,197,94,.35);border-radius:7px;background:rgba(34,197,94,.08);font-weight:600">
                Tap here if nothing happens
            </a>`;
        mountCard(card);
        setTimeout(() => {
            const rm = card.querySelector('#__ulb_rm');
            const ri = card.querySelector('#__ulb_ri');
            if (rm) rm.textContent = 'Redirect may have stalled.';
            if (ri) { ri.textContent = '⚠'; ri.style.color = '#f59e0b'; }
            card.style.borderLeftColor = '#f59e0b';
        }, 3000);
    }

    /** Direct bypass action button */
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

    // ── Cloudflare Turnstile Helpers ───────────────────────────────────────

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
            const m = s.textContent.match(/sitekey['":\s]+([0-9a-zA-Z_\-]{20,})/);
            if (m) return m[1];
        }
        return fallback;
    }

    function solveTurnstile(sitekey) {
        if (!sitekey) return Promise.reject(new Error('[ULB/Turnstile] sitekey is required'));
        return new Promise((resolve, reject) => {
            const cbName = '__ulb_tsCb_' + generateId();
            const wrapper = document.createElement('div');
            wrapper.style.cssText = [
                'position:fixed',
                'bottom:calc(100px + env(safe-area-inset-bottom,0px))',
                'right:calc(28px + env(safe-area-inset-right,0px))',
                'z-index:2147483646',
                'background:linear-gradient(135deg,#1a1a2e,#16213e)',
                'border:1px solid rgba(255,255,255,.12)',
                'border-radius:10px',
                'box-shadow:0 8px 32px rgba(0,0,0,.5)',
                'padding:10px 12px',
                'display:flex;flex-direction:column;gap:6px',
                'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
            ].join(';');
            const label = Object.assign(document.createElement('div'), {
                style: 'font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase',
                textContent: 'Solving captcha… (tap if stuck)',
            });
            const widgetDiv = document.createElement('div');
            widgetDiv.setAttribute('data-sitekey', sitekey);
            widgetDiv.setAttribute('data-callback', cbName);
            widgetDiv.setAttribute('data-theme', 'dark');
            wrapper.append(label, widgetDiv);
            document.body.appendChild(wrapper);

            const timeout = setTimeout(() => { cleanup(); reject(new Error('[ULB/Turnstile] timed out after 45s')); }, 45_000);
            function cleanup() {
                clearTimeout(timeout);
                try { delete unsafeWindow[cbName]; } catch (_) {}
                setTimeout(() => wrapper.remove(), 600);
            }
            const onToken = token => { cleanup(); resolve(token); };
            unsafeWindow[cbName] = onToken;

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

    if (location.hostname === 'challenges.cloudflare.com') {
        if (CONFIG.cfAllowedRefs.some(h => document.referrer.includes(h))) _runCfHook();
        return;
    }

    // ── app_vars helpers (shared by lnbz/4br/yorurl/caslinks/reshortfly style sites) ──

    function _lnbzGetAppVars() {
        try { const v = unsafeWindow.app_vars; if (v && typeof v === 'object') return v; } catch (_) {}
        for (const s of document.querySelectorAll('script:not([src])')) {
            const m = s.textContent.match(/var\s+app_vars\s*=\s*(\{[\s\S]*?\});/);
            if (m) { try { return JSON.parse(m[1]); } catch (_) {} }
        }
        return null;
    }

    function _lnbzWaitForAppVars(cb, timeoutMs = 8000) {
        const v = _lnbzGetAppVars();
        if (v) { cb(v); return; }
        const start = Date.now();
        const obs = new MutationObserver(() => {
            const v2 = _lnbzGetAppVars();
            if (v2) { obs.disconnect(); cb(v2); return; }
            if (Date.now() - start > timeoutMs) { obs.disconnect(); cb(null); }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { obs.disconnect(); cb(_lnbzGetAppVars()); }, timeoutMs);
    }

    /** Promise wrapper for _lnbzWaitForAppVars */
    function _lnbzWaitForAppVarsAsync(timeoutMs = 8000) {
        return new Promise(resolve => _lnbzWaitForAppVars(resolve, timeoutMs));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── SHARED BYPASS HELPERS ────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Generic /links/go bypasser for encurta.net-system sites.
     *
     * Handles two-page flow automatically:
     *   PAGE A (captcha)  — form without ad_form_data → solve Turnstile → submit
     *   PAGE B (go-link)  — [name="ad_form_data"] present →
     *                        read countdown from app_vars.counter_value →
     *                        wait → POST /links/go → redirect
     *
     * Sites using this helper: 4br.me, lnbz.la, go.yorurl.com, go.caslinks.com,
     *                           short-jambo.com, short-jambo.ink
     *
     * @param {string}      siteLabel      Display name shown in notifications
     * @param {string|null} captchaSiteKey Known Turnstile sitekey (null = auto-detect)
     */
    function _runLinksGoBypasser(siteLabel, captchaSiteKey) {
        const t  = makeTimer();
        const nh = notify(`${siteLabel} — detecting page…`, 'loading', 0, { site: siteLabel });

        const handleError = (label, err) => {
            console.error(`[ULB/${siteLabel}] ${label}`, err);
            nh.update(`${siteLabel}: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error');
            setTimeout(() => nh.remove(), 7000);
        };

        // ── PAGE B: POST /links/go ─────────────────────────────────────────
        const doGoFetch = async (adEl) => {
            nh.update(`${siteLabel} — fetching destination…`, 'loading', { site: siteLabel });
            try {
                // Collect all hidden inputs from the parent form (safer than just ad_form_data)
                const form = adEl.closest('form') || document.querySelector('#go-link') || document.querySelector('form');
                let body;
                if (form) {
                    const params = new URLSearchParams();
                    form.querySelectorAll('input[type="hidden"]').forEach(inp => {
                        if (inp.name) params.append(inp.name, inp.value);
                    });
                    if (!params.has('_method')) params.set('_method', 'POST');
                    body = params.toString();
                } else {
                    body = '_method=POST&ad_form_data=' + encodeURIComponent(adEl.value);
                }

                const r = await fetch('/links/go', {
                    method:      'POST',
                    headers:     {
                        'Content-Type':     'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept':           'application/json, text/javascript, */*; q=0.01',
                    },
                    credentials: 'include',
                    body,
                });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                let d;
                try { d = await r.json(); } catch { throw new Error('Response was not valid JSON'); }
                const dest = d.url || d.data;
                if (!dest) throw new Error('No destination URL in server response');
                nh.update(`${siteLabel} — redirecting…`, 'success', { site: siteLabel, time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500);
                else setTimeout(() => nh.remove(), 2000);
                location.href = dest;
            } catch (err) { handleError('go-link POST failed', err); }
        };

        const runGoPage = (adEl) => {
            nh.update(`${siteLabel} — reading countdown…`, 'loading', { site: siteLabel });
            _lnbzWaitForAppVars(vars => {
                const secs = Math.max(1, parseInt(vars?.counter_value, 10) || 15);
                nh.update(`${siteLabel} — redirecting in ${secs}s…`, 'loading', { site: siteLabel });
                showCountdown(secs, () => doGoFetch(adEl), `${siteLabel} bypass`);
            });
        };

        // ── PAGE A: Captcha form ───────────────────────────────────────────
        const runCaptchaPage = async (form) => {
            if (!CONFIG.autoCaptcha) {
                nh.update(`${siteLabel} — solve captcha manually to continue…`, 'info', 0, { site: siteLabel });
                return; // go-link page will be handled when user arrives there
            }

            nh.update(`${siteLabel} — solving captcha…`, 'loading', { site: siteLabel });

            let sitekey = captchaSiteKey;
            if (!sitekey) {
                // Try app_vars first (fastest), then fall back to DOM scan
                const vars = await _lnbzWaitForAppVarsAsync(5000);
                sitekey = vars?.turnstile_site_key || getSiteKey();
            }
            if (!sitekey) { handleError('could not find Turnstile sitekey', null); return; }

            let token;
            try { token = await solveTurnstile(sitekey); }
            catch (e) { handleError('Turnstile solve failed', e); return; }

            // Inject token into form — create hidden input if not present
            let input = form.querySelector('[name="cf-turnstile-response"]');
            if (!input) {
                input = Object.assign(document.createElement('input'), { type: 'hidden', name: 'cf-turnstile-response' });
                form.appendChild(input);
            }
            input.value = token;

            // Handle 4br/encurta-style named widget input as well
            const widgetInput = document.getElementById('cf-chl-widget-qg0yr_response')
                             || document.querySelector('.cf-turnstile [name$="_response"]');
            if (widgetInput && widgetInput !== input) widgetInput.value = token;

            // Enable submit button if it was disabled
            const submitBtn = document.getElementById('invisibleCaptchaShortlink')
                           || form.querySelector('button[type="submit"][disabled], input[type="submit"][disabled]');
            if (submitBtn) submitBtn.disabled = false;

            nh.update(`${siteLabel} — submitting…`, 'loading', { site: siteLabel });
            HTMLFormElement.prototype.submit.call(form);
        };

        // ── Detection — runs after DOM ready ──────────────────────────────
        const detect = () => {
            // go-link page: ad_form_data is the definitive indicator
            const adEl = document.querySelector('[name="ad_form_data"]');
            if (adEl) { runGoPage(adEl); return true; }
            // captcha / link-view page
            const form = document.getElementById('link-view') || document.querySelector('form');
            if (form) { runCaptchaPage(form); return true; }
            return false;
        };

        const init = () => {
            if (detect()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if (detect()) { clearInterval(iv); return; }
                if (++tries > 200) {
                    clearInterval(iv);
                    handleError('page structure not recognised after 20s', null);
                }
            }, 100);
        };

        onReady(init);
    }

    // ── Router ─────────────────────────────────────────────────────────────

    const host = location.hostname;
    const path = location.pathname;

    if      (host.includes('dl.surf'))                     runDlSurf();
    else if (host.includes('airflowscript.com'))           runAirflowBypasser();
    else if (host.includes('bstlar.com'))                  runBstlarBypasser();
    else if (host.includes('wareguardv2.xyz'))             runWareguardBypasser();
    else if (host.includes('subnise.com'))                 runSubniseBypasser();
    else if (host.includes('reshortfly.com'))              runReshortflyBypasser();
    else if (host.includes('avnsgames.com'))               runAvnsGamesInterstitial();
    else if (host.includes('lnbz.la'))                     runLnbzLaBypasser();
    else if (host.includes('bloxscript.live'))             runBloxscriptBypasser();
    else if (host.includes('jankariweb'))                  runJoberBypasser();
    else if (host.includes('how2guidess.com'))             runHow2GuidesBypasser();
    else if (host.includes('go.yorurl.com'))               runYorurlBypasser();
    else if (host.includes('go.caslinks.com'))             runCasLinksBypasser();
    else if (host.includes('gplinks.co'))                  runGpLinksBypasser();
    else if (host.includes('powergam.online'))             runPowergamBypasser();
    else if (host.includes('4br.me'))                      run4BrMeBypasser();
    else if (host.includes('rojgarhindi.in'))              runRojgarhindiBypasser();
    else if (host.includes('v0-phantomfluxkey.vercel.app')) runPhantomFluxKeyBypasser();
    else if (host.includes('link-unlock.com'))             runLinkUnlockBypasser();
    else if (host.includes('link4sub.com'))                runLink4SubBypasser();
    else if (host.includes('tapvietcode.com'))             runTapVietCodeBypasser();
    else if (host.includes('short-jambo.ink'))             runShortJamboInkBypasser();
    else if (host.includes('short-jambo.com'))             runShortJamboDotComBypasser();
    else if (/fastcars\d*\.com/.test(host))                runFastcarsBypasser();
    else if (TPI_HOSTS.some(h => host.includes(h)))       runTpiLiBypasser();
    else if (FORM_HOSTS.some(h => host.includes(h)))      runFormBypasser();
    else                                                   runSafelinkBypasser();

    // ═══════════════════════════════════════════════════════════════════════
    // ─── BYPASSERS ─────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    function runPhantomFluxKeyBypasser() {
        notify('PhantomFluxKey detected — showing direct bypass…', 'info', undefined, { site: 'phantomfluxkey' });
        showDirectBypassBtn('Direct Bypass — Get Key', CONFIG.phantomDirectUrl, 'PhantomFluxKey Direct Bypass');
    }

    // ── dl.surf ────────────────────────────────────────────────────────────

    function runDlSurf() {
        const API    = 'https://backendapi.dl.surf/api/file';
        const DL_KEY = '0x4AAAAAABbfHaaMuK4MmNeI';
        const slug   = location.pathname.split('/').filter(Boolean).pop();

        const fetchJSON = async (url, opts) => {
            const r = await fetch(url, opts);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            if (j.status !== 'success') throw new Error(j.message || 'API error');
            return j.data;
        };

        const getToken       = () => fetchJSON(`${API}/request-download/file/${slug}/`, { headers: { Accept: 'application/json' } }).then(d => d.token);
        const getDownloadUrl = (tk, cap) => fetchJSON(`${API}/new-download-file/`, {
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
                const cap = await solveTurnstile(DL_KEY);
                setStatus('Fetching download URL…', 'loading', { site: 'dl.surf' });
                const url = await getDownloadUrl(token, cap);
                if (typeof url === 'string' && url.startsWith('http')) {
                    setStatus('Download started!', 'success', { site: 'dl.surf', time: t.elapsed() + 's' });
                    const a = Object.assign(document.createElement('a'), { href: url, download: '', target: '_blank', rel: 'noopener' });
                    document.body.appendChild(a);
                    try { a.click(); } catch (_) {}
                    a.remove();
                    if (isIOS()) window.open(url, '_blank');
                } else {
                    setStatus('Unexpected response — check console.', 'warn', { site: 'dl.surf' });
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
        const t  = makeTimer();
        const nh = notify('bstlar.com detected — bypassing…', 'loading', 0, { site: 'bstlar.com' });
        const run = async () => {
            try {
                const e = document.getElementById('link_action_id');
                const link_action_id = e && ('value' in e ? e.value : e.textContent);
                const r1 = await fetch(`/api/link?url=${encodeURIComponent(path.slice(1))}&link_action_id=${link_action_id}`);
                if (!r1.ok) throw new Error(`API /api/link returned HTTP ${r1.status}`);
                const linkData = await r1.json();
                const r2 = await fetch('/api/link-completed', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ link_id: linkData.id, link_action_id }),
                });
                if (!r2.ok) throw new Error(`API /api/link-completed returned HTTP ${r2.status}`);
                const result = await r2.json();
                const dest = result.destination_url;
                if (!dest) throw new Error('No destination_url in response');
                nh.update('Redirecting…', 'success', { site: 'bstlar.com', time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500);
                else setTimeout(() => nh.remove(), 2000);
                location.href = dest;
            } catch (err) {
                console.error('[ULB/bstlar]', err);
                nh.update(`bstlar error: ${err.message}`, 'error', { site: 'bstlar.com' });
                setTimeout(() => nh.remove(), 6000);
            }
        };
        onReady(run);
    }

    // ── wareguardv2.xyz ────────────────────────────────────────────────────

    function runWareguardBypasser() {
        const t  = makeTimer();
        const nh = notify('wareguardv2 checkpoint — bypassing…', 'loading', 0, { site: 'wareguardv2.xyz' });
        const run = () => {
            try {
                const btn = document.getElementById('continueBtn');
                if (!btn?.href) { nh.update('wareguardv2: continueBtn not found.', 'error', { site: 'wareguardv2.xyz' }); setTimeout(() => nh.remove(), 6000); return; }
                const r = new URL(btn.href).searchParams.get('r');
                if (!r) { nh.update('wareguardv2: no redirect URL found.', 'error'); setTimeout(() => nh.remove(), 6000); return; }
                let dest;
                try { dest = atob(decodeURIComponent(r)); }
                catch { nh.update('wareguardv2: failed to decode redirect URL.', 'error'); setTimeout(() => nh.remove(), 6000); return; }
                if (!dest?.startsWith('http')) { nh.update('wareguardv2: decoded URL is invalid.', 'error'); setTimeout(() => nh.remove(), 6000); return; }
                nh.update('Redirecting in 1s…', 'info', { site: 'wareguardv2.xyz' });
                showCountdown(1, () => {
                    nh.update('Redirecting…', 'success', { site: 'wareguardv2.xyz', time: t.elapsed() + 's' });
                    if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                    location.href = dest;
                }, 'wareguardv2 bypass');
            } catch (err) {
                console.error('[ULB/wareguardv2]', err);
                nh.update(`wareguardv2 error: ${err.message}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            }
        };
        onReady(run);
    }

    // ── subnise.com ────────────────────────────────────────────────────────

    function runSubniseBypasser() {
        const t  = makeTimer();
        const nh = notify('subnise.com detected — bypassing…', 'loading', 0, { site: 'subnise.com' });
        const run = async () => {
            try {
                const id = path.split('/').pop();
                if (!id) throw new Error('Could not extract link ID from URL');
                const r = await fetch(`/api/links/${id}`);
                if (!r.ok) throw new Error(`API returned HTTP ${r.status}`);
                const data = await r.json();
                if (!data.url) throw new Error('No URL in API response');
                nh.update('Redirecting in 1s…', 'info', { site: 'subnise.com' });
                showCountdown(1, () => {
                    nh.update('Redirecting…', 'success', { site: 'subnise.com', time: t.elapsed() + 's' });
                    if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                    location.href = data.url;
                }, 'subnise bypass');
            } catch (err) {
                console.error('[ULB/subnise]', err);
                nh.update(`subnise error: ${err.message}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            }
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
            const t = makeTimer();
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

    // ── safelink ───────────────────────────────────────────────────────────

    function runSafelinkBypasser() {
        let scheduled = false;
        const t = makeTimer();

        if (CONFIG.blockAds) {
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

            const _ac = Element.prototype.appendChild;
            const _ib = Element.prototype.insertBefore;
            const isAd = el => {
                if (!el || el.nodeType !== 1) return false;
                const src = el.src || el.getAttribute?.('src') || '';
                const tg = el.tagName?.toLowerCase();
                return (tg === 'script' || tg === 'iframe') && src && AD_PAT.some(p => p.test(src));
            };
            Element.prototype.appendChild  = function (c) { return isAd(c) ? c : _ac.call(this, c); };
            Element.prototype.insertBefore = function (n, r) { return isAd(n) ? n : _ib.call(this, n, r); };
            window.googletag = { cmd: { push: () => {} }, defineSlot: () => ({ addService: () => ({}) }), pubads: () => ({}), enableServices: () => {}, display: () => {} };
            window.adsbygoogle = { push: () => {} };

            const cleanAds = () => AD_SEL.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));
            var _cleanAds = cleanAds;
        } else {
            var _cleanAds = () => {};
        }

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
            extraDelaySec > 0 ? 4000 : 3000,
            { site: host }
        );

        waitForEl('form[action*="api-endpoint/verify"]').then(async form => {
            const action        = form.querySelector('input[name="action"]')?.value;
            const progressMatch = [...document.querySelectorAll('script')].map(s => s.textContent.match(/progress_original\s*=\s*(\d+)/)).find(Boolean);
            const baseDelay = action === 'countdown' ? 5000 : progressMatch ? +progressMatch[1] * 1000 : 0;
            const delay     = baseDelay + extraDelaySec * 1000;
            const seconds   = Math.ceil(delay / 1000);
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
    // Uses full FormData from #go-link (different from the ad_form_data-only sites)

    function runReshortflyBypasser() {
        const t  = makeTimer();
        const nh = notify('reshortfly.com detected — waiting…', 'loading', 0, { site: 'reshortfly.com' });

        const doFetch = async () => {
            try {
                const form = document.querySelector('#go-link');
                if (!form) throw new Error('Form #go-link not found');
                const r = await fetch('/links/go', {
                    method:      'POST',
                    headers:     { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
                    body:        new URLSearchParams(new FormData(form)),
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
                nh.update('Redirecting…', 'success', { site: 'reshortfly.com', time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                location.href = dest;
            } catch (err) {
                console.error('[ULB/reshortfly]', err);
                nh.update(`reshortfly error: ${err.message}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            }
        };

        onReady(() => {
            // Read counter_value from app_vars; fall back to 7s
            _lnbzWaitForAppVars(vars => {
                const secs = Math.max(1, parseInt(vars?.counter_value, 10) || 7);
                nh.update(`reshortfly.com — redirecting in ${secs}s…`, 'loading', { site: 'reshortfly.com' });
                showCountdown(secs, doFetch, 'reshortfly bypass');
            }, 5000);
        });
    }

    // ── avnsgames.com ──────────────────────────────────────────────────────

    function runAvnsGamesInterstitial() {
        const t  = makeTimer();
        const nh = notify('Interstitial page detected — waiting for redirect form…', 'loading', 0, { site: 'avnsgames.com' });

        const trySubmit = () => {
            const f = document.getElementById('go_d2');
            if (f) {
                nh.update('Form found — submitting…', 'success', { site: 'avnsgames.com', time: t.elapsed() + 's' });
                setTimeout(() => nh.remove(), 1500);
                HTMLFormElement.prototype.submit.call(f);
                return true;
            }
            return false;
        };

        const init = () => {
            if (trySubmit()) return;
            const iv = setInterval(() => { if (trySubmit()) clearInterval(iv); }, 300);
            setTimeout(() => {
                clearInterval(iv);
                if (!document.getElementById('go_d2')) {
                    nh.update('Interstitial form not found — unsupported page layout.', 'error');
                    setTimeout(() => nh.remove(), 6000);
                }
            }, 30_000);
        };
        onReady(init);
    }

    // ── lnbz.la / lnbz-style sites ────────────────────────────────────────
    // Now powered by the shared _runLinksGoBypasser helper

    function runLnbzLaBypasser()    { _runLinksGoBypasser('lnbz.la',         null); }
    function runYorurlBypasser()    { _runLinksGoBypasser('go.yorurl.com',   null); }
    function runCasLinksBypasser()  { _runLinksGoBypasser('go.caslinks.com', null); }

    // ── 4br.me ─────────────────────────────────────────────────────────────
    // Powered by _runLinksGoBypasser — now correctly reads counter_value
    // from app_vars before performing the /links/go POST (previously immediate).

    function run4BrMeBypasser() {
        _runLinksGoBypasser('4br.me', '0x4AAAAAAA9NLL_co1eXbypf');
    }

    // ── short-jambo.com ────────────────────────────────────────────────────
    // Intermediate shortlink; same encurta.net system as 4br/lnbz.
    // Redirects through to fastcars*.com after bypass.

    function runShortJamboDotComBypasser() {
        _runLinksGoBypasser('short-jambo.com', null);
    }

    // ── short-jambo.ink ────────────────────────────────────────────────────
    // Final go-link page in the short-jambo chain (after fastcars).
    // Same /links/go POST pattern as 4br/lnbz.

    function runShortJamboInkBypasser() {
        _runLinksGoBypasser('short-jambo.ink', null);
    }

    // ── fastcars*.com ──────────────────────────────────────────────────────
    // Intermediate page in the short-jambo chain.
    // Scrolls down (via yuideascrolldown) then follows the #yuidea-btmbtn href.

    function runFastcarsBypasser() {
        const siteLabel = host;
        const t  = makeTimer();
        const nh = notify(`${siteLabel} — waiting for continue button…`, 'loading', 0, { site: siteLabel });

        const tryBypass = () => {
            const btn = document.getElementById('yuidea-btmbtn');
            if (!btn?.href) return false;

            // Trigger scroll animation if available (cosmetic, but keeps page happy)
            try {
                if (typeof unsafeWindow.yuideascrolldown === 'function')
                    unsafeWindow.yuideascrolldown();
            } catch (_) {}

            const dest = btn.href;
            nh.update(`${siteLabel} — redirecting…`, 'success', { site: siteLabel, time: t.elapsed() + 's' });
            if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500);
            else setTimeout(() => nh.remove(), 2000);
            location.href = dest;
            return true;
        };

        const init = () => {
            if (tryBypass()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if (tryBypass() || ++tries > 300) {
                    clearInterval(iv);
                    if (tries > 300) {
                        nh.update(`${siteLabel}: #yuidea-btmbtn not found — unsupported layout.`, 'error');
                        setTimeout(() => nh.remove(), 6000);
                    }
                }
            }, 100);
        };
        onReady(init);
    }

    // ── bloxscript.live ────────────────────────────────────────────────────

    function runBloxscriptBypasser() {
        const t  = makeTimer();
        const nh = notify('bloxscript.live — waiting for key generator…', 'loading', 0, { site: 'bloxscript.live' });

        const tryGenerate = () => {
            const keyEl = document.getElementById('keyValue');
            const gen   = unsafeWindow.generateKey;
            if (!keyEl || typeof gen !== 'function') return false;
            try {
                const key = gen();
                keyEl.textContent = key;
                const copy = () => {
                    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(key);
                    const ta = Object.assign(document.createElement('textarea'), { value: key });
                    ta.style.cssText = 'position:fixed;opacity:0';
                    document.body.appendChild(ta); ta.select();
                    try { document.execCommand('copy'); } catch (_) {}
                    ta.remove(); return Promise.resolve();
                };
                copy()
                    .then(() => { nh.update('Key generated and copied to clipboard!', 'success', { site: 'bloxscript.live', time: t.elapsed() + 's' }); setTimeout(() => nh.remove(), 4000); })
                    .catch(() => { nh.update(`Key generated: ${key} (copy failed — paste manually)`, 'warn', { site: 'bloxscript.live' }); setTimeout(() => nh.remove(), 8000); });
            } catch (err) {
                console.error('[ULB/bloxscript]', err);
                nh.update(`bloxscript error: ${err.message}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            }
            return true;
        };

        const init = () => {
            if (tryGenerate()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if (tryGenerate() || ++tries > 100) {
                    clearInterval(iv);
                    if (tries > 100) { nh.update('bloxscript: key generator not found — unsupported layout.', 'error'); setTimeout(() => nh.remove(), 6000); }
                }
            }, 200);
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
        const clickEl = id => { const el = document.getElementById(id); if (el) { el.click(); return true; } return false; };
        const waitAndClick = (id, afterMs, afterFn) => {
            let tries = 0;
            const iv = setInterval(() => {
                if (clickEl(id)) {
                    clearInterval(iv);
                    notify(`how2guidess — clicked #${id}`, 'info', 2000, { site: 'how2guidess.com' });
                    if (afterFn) setTimeout(afterFn, afterMs);
                } else if (++tries > 150) {
                    clearInterval(iv);
                    notify(`how2guidess: #${id} not found — unsupported layout.`, 'error', 6000, { site: 'how2guidess.com' });
                }
            }, 200);
        };
        const run = () => {
            const t  = makeTimer();
            const nh = notify('how2guidess.com — bypassing…', 'loading', 0, { site: 'how2guidess.com' });
            waitAndClick('gi', 500, () => {
                nh.update('Step 1 done…', 'loading', { site: 'how2guidess.com' });
                waitAndClick('ci', 0, () => {
                    nh.update('Done!', 'success', { site: 'how2guidess.com', time: t.elapsed() + 's' });
                    setTimeout(() => nh.remove(), 2000);
                });
            });
        };
        onReady(run);
    }

    // ── link-unlock.com ────────────────────────────────────────────────────

    function runLinkUnlockBypasser() {
        const t  = makeTimer();
        const nh = notify('link-unlock.com — bypassing…', 'loading', 0, { site: 'link-unlock.com' });
        const slug = new URL(location.href).pathname.split('/').filter(Boolean)[0];
        if (!slug) { nh.update('link-unlock.com: could not read slug from URL.', 'error'); setTimeout(() => nh.remove(), 6000); return; }

        const handleError = (label, err) => {
            console.error(`[ULB/link-unlock] ${label}`, err);
            nh.update(`link-unlock.com: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error');
            setTimeout(() => nh.remove(), 7000);
        };

        (async () => {
            try {
                nh.update('link-unlock.com — fetching steps…', 'loading', { site: 'link-unlock.com' });
                const r1 = await fetch(`https://api.link-unlock.com/u/${slug}`);
                if (!r1.ok) throw new Error(`HTTP ${r1.status} on step fetch`);
                const d1 = await r1.json();
                const steps = d1?.unlock?.steps?.map(s => s.id);
                if (!steps?.length) throw new Error('No steps found in API response');

                nh.update('link-unlock.com — completing steps…', 'loading', { site: 'link-unlock.com' });
                const r2 = await fetch(`https://api.link-unlock.com/u/${slug}/complete`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ steps }),
                });
                if (!r2.ok) throw new Error(`HTTP ${r2.status} on complete`);
                const d2 = await r2.json();
                if (!d2?.destinationUrl) throw new Error('No destinationUrl in response');

                nh.update('Redirecting…', 'success', { site: 'link-unlock.com', time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                location.href = d2.destinationUrl;
            } catch (err) { handleError('bypass failed', err); }
        })();
    }

    // ── link4sub.com ───────────────────────────────────────────────────────

    function runLink4SubBypasser() {
        notify('link4sub.com — following redirect to tapvietcode.com…', 'info', undefined, { site: 'link4sub.com' });
    }

    // ── tapvietcode.com ────────────────────────────────────────────────────

    function runTapVietCodeBypasser() {
        if (host.includes('blog.tapvietcode.com')) {
            const t  = makeTimer();
            const nh = notify('tapvietcode.com — waiting for continue button…', 'loading', 0, { site: 'tapvietcode.com' });

            const tryClick = () => {
                const btn = document.getElementById('continueBtn');
                if (!btn) return false;
                const dest = btn.href;
                if (!dest) { nh.update('tapvietcode.com: continueBtn has no href.', 'error'); setTimeout(() => nh.remove(), 6000); return true; }
                nh.update('tapvietcode.com — redirecting…', 'success', { site: 'tapvietcode.com', time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                location.href = dest;
                return true;
            };

            const init = () => {
                if (tryClick()) return;
                let tries = 0;
                const iv = setInterval(() => {
                    if (tryClick() || ++tries > 150) {
                        clearInterval(iv);
                        if (tries > 150) { nh.update('tapvietcode.com: continue button not found — unsupported layout.', 'error'); setTimeout(() => nh.remove(), 6000); }
                    }
                }, 200);
            };
            onReady(init);
        } else {
            const t  = makeTimer();
            const nh = notify('tapvietcode.com — reading destination from storage…', 'loading', 0, { site: 'tapvietcode.com' });

            const tryStorage = () => {
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        const v = localStorage.getItem(k);
                        if (v && v.includes('"lnk1"')) {
                            try {
                                const j = JSON.parse(v);
                                const u = j?.data?.lnk?.lnk1?.url || j?.lnk?.lnk1?.url;
                                if (u) {
                                    nh.update('tapvietcode.com — redirecting…', 'success', { site: 'tapvietcode.com', time: t.elapsed() + 's' });
                                    if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                                    location.href = u;
                                    return true;
                                }
                            } catch (e) { /* malformed entry, skip */ }
                        }
                    }
                } catch (e) { console.error('[ULB/tapvietcode] localStorage read failed', e); }
                return false;
            };

            const init = () => {
                if (tryStorage()) return;
                let tries = 0;
                const iv = setInterval(() => {
                    if (tryStorage() || ++tries > 100) {
                        clearInterval(iv);
                        if (tries > 100) { nh.update('tapvietcode.com: lnk1 URL not found in storage — unsupported layout.', 'error'); setTimeout(() => nh.remove(), 6000); }
                    }
                }, 300);
            };
            onReady(init);
        }
    }

    // ── gplinks.co ─────────────────────────────────────────────────────────

    function runGpLinksBypasser() {
        const t         = makeTimer();
        const siteLabel = 'gplinks.co';
        const nh        = notify(`${siteLabel} — solving captcha…`, 'loading', 0, { site: siteLabel });

        const doRedirect = url => {
            nh.update(`${siteLabel} — redirecting…`, 'success', { site: siteLabel, time: t.elapsed() + 's' });
            if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500);
            else setTimeout(() => nh.remove(), 2000);
            location.href = url;
        };

        const handleError = (label, err) => {
            console.error(`[ULB/${siteLabel}] ${label}`, err);
            nh.update(`${siteLabel}: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error');
            setTimeout(() => nh.remove(), 7000);
        };

        // Pull sitekey from the CF iframe src
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

            const existingHref = btn.getAttribute('href');
            if (existingHref && existingHref !== '#' && !existingHref.startsWith('javascript')) {
                doRedirect(existingHref);
                return;
            }

            const sitekey = getGpSiteKey();
            if (!sitekey) { handleError('could not find Turnstile sitekey', null); return; }

            let token;
            try { token = await solveTurnstile(sitekey); }
            catch (e) { handleError('Turnstile solve failed', e); return; }

            let tsInput = document.querySelector('[name="cf-turnstile-response"]');
            if (!tsInput) {
                tsInput = Object.assign(document.createElement('input'), { type: 'hidden', name: 'cf-turnstile-response' });
                document.body.appendChild(tsInput);
            }
            tsInput.value = token;

            const tsEl = document.querySelector('[data-callback]');
            const cbName = tsEl?.dataset?.callback;
            if (cbName) {
                try { if (typeof unsafeWindow[cbName] === 'function') unsafeWindow[cbName](token); } catch (_) {}
            }

            nh.update(`${siteLabel} — waiting for link…`, 'loading', { site: siteLabel });
            let tries = 0;
            const iv = setInterval(() => {
                const href = btn.getAttribute('href');
                if (href && href !== '#' && !href.startsWith('javascript') && href.startsWith('http')) {
                    clearInterval(iv);
                    doRedirect(href);
                } else if (++tries > 150) {
                    clearInterval(iv);
                    handleError('link did not appear after captcha solve — unsupported layout', null);
                }
            }, 200);
        };

        onReady(init);
    }

    // ── powergam.online ────────────────────────────────────────────────────
    // Bypass by @NickUpdates

    function runPowergamBypasser() {
        const t         = makeTimer();
        const siteLabel = 'powergam.online';
        const REQUIRED  = ['imps', 'lid', 'pages', 'pid', 'step_count', 'vid'];

        const nh = notify(`${siteLabel} — waiting for cookies…`, 'loading', 0, { site: siteLabel });

        const handleError = (label, err) => {
            console.error(`[ULB/${siteLabel}] ${label}`, err);
            nh.update(`${siteLabel}: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error');
            setTimeout(() => nh.remove(), 7000);
        };

        const getCookies = () =>
            Object.fromEntries(
                document.cookie.split('; ').filter(Boolean)
                    .map(c => c.split('=').map(decodeURIComponent))
            );

        const runSteps = async (cookies) => {
            const pages = parseInt(cookies.pages, 10);
            if (!pages || pages < 1) { handleError('invalid pages cookie value', null); return; }

            const ref   = location.origin;
            const final = `https://gplinks.co/${cookies.lid}?pid=${cookies.pid}&vid=${cookies.vid}`;
            const delay = pages * 30;

            nh.update(`${siteLabel} — waiting ${delay}s before submitting steps…`, 'loading', { site: siteLabel });
            await new Promise(resolve => {
                let rem = delay;
                const iv = setInterval(() => {
                    rem--;
                    nh.update(`${siteLabel} — submitting in ${rem}s…`, 'loading', { site: siteLabel });
                    if (rem <= 0) { clearInterval(iv); resolve(); }
                }, 1000);
            });

            nh.update(`${siteLabel} — submitting ${pages} step(s)…`, 'loading', { site: siteLabel });

            for (let s = 1; s <= pages; s++) {
                const body = new URLSearchParams({
                    ad_impressions: 2,
                    form_name:      'ads-track-data',
                    next_target:    s === pages ? final : ref,
                    step_id:        String(s),
                    visitor_id:     cookies.vid,
                });
                try {
                    await fetch(ref + '/', {
                        method:      'POST',
                        headers:     { 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': ref + '/' },
                        credentials: 'include',
                        body:        body.toString(),
                    });
                    if (s < pages) await new Promise(r => setTimeout(r, 1200));
                } catch (err) {
                    console.warn(`[ULB/${siteLabel}] POST failed at step ${s}`, err);
                }
            }

            nh.update(`${siteLabel} — redirecting…`, 'success', { site: siteLabel, time: t.elapsed() + 's' });
            if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500);
            else setTimeout(() => nh.remove(), 2000);
            location.href = final;
        };

        const init = () => {
            let done = false;
            const iv = setInterval(() => {
                if (done) return;
                const cookies = getCookies();
                if (!REQUIRED.every(k => k in cookies)) return;
                done = true;
                clearInterval(iv);
                runSteps(cookies);
            }, 500);
        };

        onReady(init);
    }

    // ── rojgarhindi.in ─────────────────────────────────────────────────────

    function runRojgarhindiBypasser() {
        const t  = makeTimer();
        const nh = notify('rojgarhindi.in — detecting page type…', 'loading', 0, { site: 'rojgarhindi.in' });

        const tryBypass = () => {
            const btn = document.getElementById('btn6');
            if (btn && btn.href) {
                nh.update('rojgarhindi.in — redirecting via button…', 'success', { site: 'rojgarhindi.in', time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                location.href = btn.href;
                return true;
            }
            const form = [...document.forms].find(f => /^tp\d*$/i.test(f.name || '') && f.name !== 'search-form');
            if (form) {
                nh.update('rojgarhindi.in — submitting form…', 'success', { site: 'rojgarhindi.in', time: t.elapsed() + 's' });
                if (CONFIG.autoDismissOnRedirect) setTimeout(() => nh.remove(), 500); else setTimeout(() => nh.remove(), 2000);
                HTMLFormElement.prototype.submit.call(form);
                return true;
            }
            return false;
        };

        const init = () => {
            if (tryBypass()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if (tryBypass() || ++tries > 150) {
                    clearInterval(iv);
                    if (tries > 150) { nh.update('rojgarhindi.in: no btn6 or tp-form found — unsupported layout.', 'error'); setTimeout(() => nh.remove(), 6000); }
                }
            }, 200);
        };
        onReady(init);
    }

})();
