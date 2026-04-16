// ==UserScript==
// @name         Unknown Link Bypasser
// @version      6.7.1
// @description  Safelink bypasser + dl.surf + form-based + tpi.li + bstlar + wareguardv2 + subnise + reshortfly + lnbz.la + bloxscript.live(SCAM WARNING) + go.yorurl.com + jankariweb + newsuchnaonline + bigcarinsurance + how2guidess.com + phantomfluxkey + link-unlock.com + link4sub.com/tapvietcode.com + rojgarhindi.in + go.caslinks.com + highlocus.shop + gplinks.co + powergam.online + getpolsec.com + hehehub + sub4unlock.co + app.khaddavi.net + sfl.gl + ytsubme.com + aylink.co + biplabtewary.com + mwgamesyt.com.br + topjogosvip.online + legacyagency.com.br + 4br.me + short-jambo.com/ink + fastcars + fluorine.s3ren1ty.xyz + rekonise.com + go.linkify.ru + arolinks.com + spdmteam.com + linkunlocker.com + mboost.me + sub2unlock.netlify.app + krnl-ios.com + ouo.io. Made by @Aro Moon
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
// @match        https://www.airflowscript.com/key
// @match        https://stfly.biz/*
// @match        https://bstlar.com/*
// @match        https://wareguardv2.xyz/checkpoint*
// @match        https://subnise.com/link/*
// @match        https://reshortfly.com/*
// @match        https://lnbz.la/*
// @match        https://avnsgames.com/*
// @match        https://bloxscript.live/*
// @match        https://*.jankariweb.online/*
// @match        https://newsuchnaonline.com/*
// @match        https://*.bigcarinsurance.com/*
// @match        https://highlocus.shop/*
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
// @match        https://fluorine.s3ren1ty.xyz/getkey*
// @match        https://rekonise.com/*
// @match        https://go.linkify.ru/*
// @match        https://arolinks.com/*
// @match        https://apnahirework.com/*
// @match        https://crimejasoos.in/*
// @match        https://jober.factwiz.online/*
// @match        https://spdmteam.com/social/*
// @match        https://linkunlocker.com/*
// @match        https://bnty.nexusdevs.fun/getkey*
// @match        https://*.nexusdevs.fun/getkey*
// @match        https://lua-key-vault.vercel.app/*
// @match        https://mboost.me/*
// @match        https://sub2unlock.netlify.app/*
// @match        https://krnl-ios.com/ads.html*
// @match        https://ouo.io/*
// @match        https://ouo.press/*
// @grant        GM_addElement
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @match        https://www.scoplidrop.com/entry*
// @connect      challenges.cloudflare.com
// @connect      www.scoplidrop.com
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ULB.js
// @updateURL    https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ULB.js
// ==/UserScript==

(function () {
    'use strict';

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║                     ★  USER CONFIGURATION  ★                        ║
    // ║                                                                      ║
    // ║  All settings are in this block — no coding knowledge required!      ║
    // ║  • true  = feature ON                                                ║
    // ║  • false = feature OFF                                               ║
    // ║  • Text values must stay inside the single quotes: 'like this'       ║
    // ╚══════════════════════════════════════════════════════════════════════╝

    const CONFIG = {

        // ┌─────────────────────────────────────────────────────────────────┐
        // │  BYPASS CONFIRMATION                                            │
        // └─────────────────────────────────────────────────────────────────┘

        // Show a confirmation prompt before attempting to bypass a page.
        // When true (default): a card asks "Bypass this page?" — clicking
        //   "Yes" reloads the tab so the bypass can run; "Cancel" does nothing.
        // When false: bypass runs instantly without asking.
        askBeforeBypass: true,

        // ┌─────────────────────────────────────────────────────────────────┐
        // │  AUTO-BYPASS HOSTS                                              │
        // │  Add site hostnames here to skip the "Bypass this page?" prompt │
        // │  entirely for those sites — bypass runs immediately with no ask.│
        // │  Use the bare hostname or a substring of it, e.g:               │
        // │    'tpi.li', 'gplinks.co', 'go.caslinks.com'                    │
        // └─────────────────────────────────────────────────────────────────┘
        autoBypassHosts: [
            'bloxscript.live', // (to instantly show the scam warning)
            'avnsgames.com',
            'rojgarhindi.in',
            'newsuchnaonline.com',
            'biovetro.net',
            'technons.com',
            'tournguide.com',
            'dailyjobposting.xyz',
            'tapvietcode.com',
            'go.caslinks.com',
            'apnahirework.com',
            'gplinks.co',
            'fastcars1.com',
            'bigcarinsurance.com',
            'short-jambo.ink',
            'crimejasoos.in',
            'mwgamesyt.com',
            'biplabtewary.com',
            'khaddavi.net',
            'aylink.co',
            'go.linkify.ru/get',
            'ouo.io/go/',
            'sfl.gl/ready/go',
            'topjogosvip.online',
            'legacyagency.com.br',
            '4br.me',
            'jober.factwiz.online',
            'v0-phantomfluxkey.vercel.app',
            'go.yorurl.com',
            'scoplidrop.com',
        ],

        // ┌─────────────────────────────────────────────────────────────────┐
        // │  CAPTCHA                                                        │
        // └─────────────────────────────────────────────────────────────────┘

        // Automatically solve Cloudflare Turnstile captchas.
        // Set to false to solve them yourself; the /links/go step is still
        // automated regardless of this setting.
        autoCaptcha: true,

        // ┌─────────────────────────────────────────────────────────────────┐
        // │  NOTIFICATIONS                                                  │
        // └─────────────────────────────────────────────────────────────────┘

        // Where toast notifications appear on screen.
        // Options: 'bottom-right'  'bottom-left'  'top-right'  'top-left'
        notifPosition: 'bottom-right',

        // How long (in milliseconds) a notification stays visible.
        // 4000 = 4 seconds.  Set to 0 to keep on screen until clicked.
        notifDuration: 4000,

        // Show how long the bypass took, e.g. "Done in 1.3s".
        showBypassTime: true,

        // Show which bypasser handled the page in the notification footer.
        showSiteLabel: true,

        // Smaller, less detailed notification cards.
        compactMode: false,

        // Remove the notification the moment navigation starts.
        autoDismissOnRedirect: true,

        // Show the "Unknown Link Bypasser · @Aro Moon" branding line in cards.
        // Set to false for a cleaner, minimal look.
        notifShowBranding: true,

        // Show the script version (e.g. "v6.8.8") in the branding line.
        // Only visible when notifShowBranding is also true.
        notifShowVersion: true,

        // Show notifications while a bypass is in progress (loading state).
        notifShowOnLoading: true,

        // Show notifications on a successful bypass.
        notifShowOnSuccess: true,

        // Show notifications when an error occurs.
        notifShowOnError: true,

        // Click anywhere on a notification card to dismiss it early.
        notifClickToDismiss: false,

        // Animate the loading icon with a spin effect while bypassing.
        // Disable if the animation causes visual issues on your machine.
        notifAnimateIcon: true,

        // Pause the auto-dismiss countdown while hovering over the card.
        notifPauseOnHover: false,

        // ┌─────────────────────────────────────────────────────────────────┐
        // │  SITE-SPECIFIC                                                  │
        // └─────────────────────────────────────────────────────────────────┘

        // dl.surf — automatically inject the download bypass button.
        // Set to false to disable the button entirely.
        dlSurfAutoInject: true,

        // Safelink — remove ads on safelink pages.
        // Set to false to leave ads in place.
        blockAds: true,

        // PhantomFluxKey — the URL opened when "Get Key" is clicked.
        phantomDirectUrl: 'https://pastefy.app/8PxwQFt8',

        // ┌─────────────────────────────────────────────────────────────────┐
        // │  ADVANCED — Cloudflare allowed referrers                        │
        // │  Add new safelink domains here if the CF auto-click stops       │
        // │  working on a site.  Keep each entry in single quotes, comma-   │
        // │  separated.                                                     │
        // └─────────────────────────────────────────────────────────────────┘
        cfAllowedRefs: [
            'airflowscript.com', 'dl.surf', 'tpi.li', 'lnbz.la',
            'go.yorurl.com', 'go.caslinks.com', 'highlocus.shop', 'mtc1.',
            'shrtslug.biz', 'biovetro.net', 'technons.com',
            'tournguide.com', 'dailyjobposting.xyz', 'stfly.biz',
            'gplinks.co', '4br.me',
            'short-jambo.com', 'short-jambo.ink',
            'arolinks.com', 'ouo.io', 'ouo.press',
        ],
    };

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║                    INTERNAL CODE — DO NOT EDIT                       ║
    // ╚══════════════════════════════════════════════════════════════════════╝

    // ═══════════════════════════════════════════════════════════════════════
    // §1  CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    const VERSION = '6.7.1';

    // ── Diagnostics log ───────────────────────────────────────────────────
    // Captures errors/warnings for the Diagnostics menu command.
    const _diagEntries = [];
    const _origConsoleError = console.error.bind(console);
    const _origConsoleWarn = console.warn.bind(console);
    console.error = (...args) => {
        _diagEntries.push({
            level: 'ERROR',
            ts: Date.now(),
            msg: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        });
        _origConsoleError(...args);
    };
    console.warn = (...args) => {
        _diagEntries.push({
            level: 'WARN',
            ts: Date.now(),
            msg: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        });
        _origConsoleWarn(...args);
    };

    const FORM_HOSTS = ['shrtslug.biz', 'biovetro.net', 'technons.com', 'tournguide.com', 'dailyjobposting.xyz', 'stfly.biz'];
    const TPI_HOSTS = ['tpi.li'];

    const NOTIFY_TYPES = {
        info: {
            accent: '#4f8ef7',
            icon: 'ℹ'
        },
        success: {
            accent: '#22c55e',
            icon: '✔'
        },
        warn: {
            accent: '#f59e0b',
            icon: '⚠'
        },
        error: {
            accent: '#ef4444',
            icon: '✖'
        },
        loading: {
            accent: '#a78bfa',
            icon: '◌'
        },
    };

    // ═══════════════════════════════════════════════════════════════════════
    // §2  CORE UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    /** Generate a random hex ID using the Web Crypto API. */
    function generateId() {
        const cr = window.crypto || window.msCrypto;
        if(cr?.randomUUID) return cr.randomUUID().replace(/-/g, '');
        const arr = new Uint8Array(16);
        cr.getRandomValues(arr);
        return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }

    /** Promise-based delay. */
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    /**
     * Wraps fn so it executes at most once; subsequent calls return the
     * same result.
     */
    function once(fn) {
        let called = false,
            result;
        return (...args) => {
            if(!called) {
                called = true;
                result = fn(...args);
            }
            return result;
        };
    }

    /**
     * Parse str as a safe http/https URL.
     * @returns {URL|null}
     */
    function safeUrl(str) {
        if(typeof str !== 'string' || !str) return null;
        try {
            const u = new URL(str);
            return ['http:', 'https:'].includes(u.protocol) ? u : null;
        } catch {
            return null;
        }
    }

    /** Run fn immediately if DOM is ready, otherwise wait for DOMContentLoaded. */
    function onReady(fn) {
        if(document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn, {
            once: true
        });
    }

    /** Resolve with document.body once the DOM is ready. */
    const waitBody = () =>
        document.body ?
        Promise.resolve(document.body) :
        new Promise(r => document.addEventListener('DOMContentLoaded', () => r(document.body), {
            once: true
        }));

    /**
     * Resolve with the first matching element, or reject after timeout.
     * @param {string} sel     CSS selector
     * @param {number} [interval=100]
     * @param {number} [timeout=20000]  0 = no timeout
     */
    function waitForEl(sel, interval = 100, timeout = 20_000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(sel);
            if(el) return resolve(el);
            const iv = setInterval(() => {
                const found = document.querySelector(sel);
                if(found) {
                    clearInterval(iv);
                    clearTimeout(tid);
                    resolve(found);
                }
            }, interval);
            const tid = timeout > 0 ?
                setTimeout(() => {
                    clearInterval(iv);
                    reject(new Error(`waitForEl: "${sel}" not found after ${timeout}ms`));
                }, timeout) :
                null;
        });
    }

    /**
     * Poll fn every intervalMs until it returns truthy.
     * @param {Function} fn
     * @param {number}   [intervalMs=200]
     * @param {number}   [maxTries=150]
     */
    function pollUntil(fn, intervalMs = 200, maxTries = 150) {
        return new Promise((resolve, reject) => {
            let tries = 0,
                settled = false;
            const settle = (ok, val) => {
                if(!settled) {
                    settled = true;
                    ok ? resolve(val) : reject(val);
                }
            };
            const check = () => {
                try {
                    const r = fn();
                    if(r) {
                        settle(true, r);
                        return true;
                    }
                } catch (e) {
                    settle(false, e);
                    return true;
                }
                return false;
            };
            if(check()) return;
            const iv = setInterval(() => {
                if(check() || ++tries >= maxTries) {
                    clearInterval(iv);
                    if(!settled) settle(false, new Error('pollUntil: condition not met after max tries'));
                }
            }, intervalMs);
        });
    }

    /**
     * Click element by ID once it appears in the DOM.
     */
    function clickWhenReady(id, label, maxTries = 100) {
        const attempt = () => {
            const el = document.getElementById(id);
            if(el) {
                el.click();
                return true;
            }
            return false;
        };
        const init = () => {
            if(attempt()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if(attempt() || ++tries >= maxTries) {
                    clearInterval(iv);
                    if(tries >= maxTries) console.warn(`[ULB] ${label}: #${id} not found after ${maxTries} tries`);
                }
            }, 200);
        };
        onReady(init);
    }

    /** Returns true when running on an iOS device. */
    const isIOS = () =>
        /iP(hone|ad|od)/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    /** High-resolution timer with elapsed() helper. */
    function makeTimer() {
        const start = performance.now();
        return {
            elapsed: () => ((performance.now() - start) / 1000).toFixed(2),
            label: () => `Done in ${((performance.now() - start) / 1000).toFixed(2)}s`,
        };
    }

    /**
     * Fetch URL and parse response as JSON.
     * Throws on non-2xx status or malformed JSON.
     */
    async function fetchJSON(url, opts = {}) {
        const r = await fetch(url, opts);
        if(!r.ok) throw new Error(`HTTP ${r.status}${r.statusText ? ' ' + r.statusText : ''}`);
        return r.json();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §3  NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    function _posStyles() {
        const p = CONFIG.notifPosition || 'bottom-right';
        const [v, h] = p.split('-');

        const vert = v === 'top' ?
            `top:calc(28px + env(safe-area-inset-top,0px))` :
            `bottom:calc(28px + env(safe-area-inset-bottom,0px))`;

        const horiz = h === 'left' ?
            `left:calc(28px + env(safe-area-inset-left,0px))` :
            `right:calc(28px + env(safe-area-inset-right,0px))`;

        const dir = v === 'top' ? 'column' : 'column-reverse';
        const slide = h === 'left' ? 'translateX(-20px)' : 'translateX(20px)';

        return {
            vert,
            horiz,
            dir,
            slide
        };
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
        'transform:translate3d(0,0,0)',
    ].join(';');

    const CSS_LABEL =
        'font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#555;margin-bottom';

    let _host = null;
    let _root = null;
    let _container = null;

    /* =========================
       CORE CONTAINER (SHADOW DOM)
    ========================= */

    function getContainer() {
        if(_container?.isConnected) return _container;

        const {
            vert,
            horiz,
            dir
        } = _posStyles();

        // Host
        if(!_host || !_host.isConnected) {
            _host = document.createElement('div');
            _host.id = '__ulb_host';

            _host.style.cssText = [
                'all:initial',
                'position:fixed',
                'top:0',
                'left:0',
                'width:100vw',
                'height:100vh',
                'z-index:2147483646',
                'pointer-events:none',
                'contain:layout style paint',
            ].join(';');

            (document.documentElement || document.body).appendChild(_host);

            _root = _host.attachShadow({
                mode: 'open'
            });

            const style = document.createElement('style');
            style.textContent = `
            * { margin:0; padding:0; box-sizing:border-box; }
            :host { all: initial; }
            @keyframes __ulb_spin { to { transform: rotate(360deg); } }
        `;
            _root.appendChild(style);
        }

        // Container (ONLY ONE EVER)
        if(!_container || !_container.isConnected) {
            _container = document.createElement('div');
            _container.id = '__ulb_nc';

            _container.style.cssText = [
                'position:fixed',
                vert, horiz,
                'display:flex',
                `flex-direction:${dir}`,
                'gap:10px',
                'z-index:2147483646',
                'pointer-events:none',
                'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
                'transform:translate3d(0,0,0)',
                'will-change:transform',
                'backface-visibility:hidden',
                'perspective:1000px',
                'isolation:isolate',
            ].join(';');

            _root.appendChild(_container);
        }

        return _container;
    }

    /* =========================
       SAFETY (DOM RESTORE)
    ========================= */

    const __ulbObserver = new MutationObserver(() => {
        if(_host && !document.documentElement.contains(_host)) {
            document.documentElement.appendChild(_host);
        }
    });

    __ulbObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    /* =========================
       HELPERS
    ========================= */

    function ensureSpinStyle() {
        getContainer();
    }

    function mountCard(card) {
        const {
            slide
        } = _posStyles();

        card.style.transform = slide;
        card.style.pointerEvents = 'auto';

        getContainer().appendChild(card);

        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        });

        return card;
    }

    function dismissCard(card) {
        const {
            slide
        } = _posStyles();

        card.style.opacity = '0';
        card.style.transform = slide;

        setTimeout(() => card.remove(), 280);
    }

    /* =========================
       MAIN NOTIFY SYSTEM
    ========================= */

    function notify(message, type = 'info', duration, opts = {}) {
        const dur = duration ?? CONFIG.notifDuration;

        if(!document.body) {
            const h = {
                update: () => {},
                remove: () => {}
            };
            document.addEventListener('DOMContentLoaded', () => {
                const r = notify(message, type, dur, opts);
                h.update = r.update;
                h.remove = r.remove;
            }, {
                once: true
            });
            return h;
        }

        ensureSpinStyle();

        const {
            accent,
            icon
        } = NOTIFY_TYPES[type] || NOTIFY_TYPES.info;

        const pad = CONFIG.compactMode ? '8px 12px' : '12px 16px';
        const mw = CONFIG.compactMode ? 'min(200px,calc(100vw - 56px))' : 'min(240px,calc(100vw - 56px))';
        const maxW = CONFIG.compactMode ? 'min(280px,calc(100vw - 56px))' : 'min(320px,calc(100vw - 56px))';

        const card = document.createElement('div');
        card.style.cssText =
            `${CSS_CARD_BASE};border-left:3px solid ${accent};padding:${pad};min-width:${mw};max-width:${maxW};display:flex;align-items:flex-start;gap:10px`;

        const iconEl = document.createElement('div');
        iconEl.style.cssText =
            `font-size:${CONFIG.compactMode ? '13' : '15'}px;color:${accent};margin-top:1px;flex-shrink:0;display:flex;align-items:center;justify-content:center;width:1.1em;height:1.1em`;
        iconEl.textContent = icon;

        const body = document.createElement('div');
        body.style.cssText = 'flex:1;min-width:0';

        if(!CONFIG.compactMode && CONFIG.notifShowBranding !== false) {
            const vtag = CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : '';
            body.innerHTML = `<div style="${CSS_LABEL}:3px">Unknown Link Bypasser · @Aro Moon${vtag}</div>`;
        }

        const msg = document.createElement('div');
        msg.style.cssText =
            `font-size:${CONFIG.compactMode ? '12' : '13'}px;line-height:1.4;color:#e0e0e0;word-break:break-word`;
        msg.textContent = message;

        body.appendChild(msg);
        card.append(iconEl, body);

        mountCard(card);

        const setSpin = on => {
            iconEl.style.animation =
                on ? '1s linear infinite __ulb_spin' : '';
        };

        if(type === 'loading') setSpin(true);

        let timer;

        const remove = () => {
            clearTimeout(timer);
            dismissCard(card);
        };

        const update = (newMsg, newType, newDurOrOpts) => {
            clearTimeout(timer);
            msg.textContent = newMsg;

            if(newType && NOTIFY_TYPES[newType]) {
                const s = NOTIFY_TYPES[newType];
                iconEl.textContent = s.icon;
                iconEl.style.color = s.accent;
                card.style.borderLeftColor = s.accent;
                setSpin(newType === 'loading');
            }

            if(typeof newDurOrOpts === 'number' && newDurOrOpts > 0) {
                timer = setTimeout(remove, newDurOrOpts);
            }
        };

        if(dur > 0) timer = setTimeout(remove, dur);

        return {
            update,
            remove
        };
    }

    /* =========================
       EXPORT CORE API
    ========================= */

    function ensureUI() {
        getContainer();
    }

    /** Show a self-advancing countdown card, then call onDone. */
    function showCountdown(seconds, onDone, subtitle = 'Redirect queued') {
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #4f8ef7;padding:14px 18px;min-width:min(240px,calc(100vw - 56px))`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:8px">Unknown Link Bypasser · @Aro Moon${CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : ''}</div>
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

        const numEl = card.querySelector('.__ulb_cn');
        const barEl = card.querySelector('.__ulb_cb');
        const subEl = card.querySelector('.__ulb_cs');

        let rem = seconds;
        requestAnimationFrame(() => {
            barEl.style.width = `${((seconds - 1) / seconds) * 100}%`;
        });
        const iv = setInterval(() => {
            if(--rem <= 0) {
                clearInterval(iv);
                numEl.textContent = '0';
                barEl.style.width = '0%';
                subEl.textContent = 'done…';
                card.style.borderLeftColor = '#22c55e';
                setTimeout(() => {
                    dismissCard(card);
                    setTimeout(onDone, 280);
                }, 400);
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
            <div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon${CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : ''}</div>
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
            if(rm) rm.textContent = 'Redirect may have stalled.';
            if(ri) {
                ri.textContent = '⚠';
                ri.style.color = '#f59e0b';
            }
            card.style.borderLeftColor = '#f59e0b';
        }, 3000);
    }

    /** Show a persistent action button that opens url in a new tab. */
    function showDirectBypassBtn(label, url, subtitle = 'Direct Bypass Available') {
        if(!document.body) {
            document.addEventListener('DOMContentLoaded', () => showDirectBypassBtn(label, url, subtitle), {
                once: true
            });
            return;
        }
        ensureSpinStyle();
        const card = document.createElement('div');
        card.style.cssText = `${CSS_CARD_BASE};border-left:3px solid #f59e0b;padding:14px 18px;min-width:min(260px,calc(100vw - 56px));max-width:min(340px,calc(100vw - 56px));position:relative`;
        card.innerHTML = `
            <div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon${CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : ''}</div>
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
        const dismiss = () => dismissCard(card);
        closeBtn.addEventListener('click', () => dismiss());
        card.appendChild(closeBtn);
        mountCard(card);
    }

    // ── §3.5  KEY CARD ────────────────────────────────────────────────────

    /**
     * Display a persistent, copyable key card for bypassers that generate
     * access keys (e.g. nexusdevs.fun, lua-key-vault).
     * Fires a ULB toast notification on successful clipboard copy.
     *
     * @param {string} key       The key string to display.
     * @param {string} site      Site label shown in the card header.
     * @param {object} [timer]   makeTimer() instance — used for the elapsed label.
     * @param {number} [autoDismissMs=30000]  Auto-dismiss delay in ms.
     */
    function showKeyCard(key, site, timer, autoDismissMs = 30_000) {
        const vTag = CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : '';
        const brand = (!CONFIG.compactMode && CONFIG.notifShowBranding !== false) ?
            `<div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon${vTag}</div>` :
            '';
        const timeLabel = timer ? timer.label() : '';

        const card = document.createElement('div');
        card.style.cssText = [
            CSS_CARD_BASE,
            'border-left:3px solid #22c55e',
            'padding:14px 18px',
            'min-width:min(280px,calc(100vw - 56px))',
            'max-width:min(360px,calc(100vw - 56px))',
        ].join(';');

        card.innerHTML = `
            ${brand}
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <div style="font-size:16px;color:#22c55e;flex-shrink:0">✔</div>
                <div>
                    <div style="font-size:13px;font-weight:600;color:#e0e0e0">Key retrieved — ${site}</div>
                    ${timeLabel ? `<div style="font-size:10px;color:#888;margin-top:1px">${timeLabel}</div>` : ''}
                </div>
            </div>
            <div class="__ulb_kc_key" style="
                font-family:monospace;font-size:11px;color:#a5f3a0;
                background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);
                border-radius:6px;padding:8px 10px;word-break:break-all;
                cursor:pointer;user-select:all;margin-bottom:8px;line-height:1.5"
                title="Click to copy"></div>
            <div class="__ulb_kc_hint" style="font-size:10px;color:#555;text-align:center">
                tap to copy · auto-closes in ${Math.round(autoDismissMs / 1000)}s
            </div>`;

        const keyEl = card.querySelector('.__ulb_kc_key');
        const hintEl = card.querySelector('.__ulb_kc_hint');
        keyEl.textContent = key;

        mountCard(card);

        keyEl.addEventListener('click', () => {
            _gmCopy(key).then(() => {
                hintEl.textContent = '✔ Copied!';
                hintEl.style.color = '#22c55e';
                setTimeout(() => {
                    hintEl.textContent = `tap to copy · auto-closes in ${Math.round(autoDismissMs / 1000)}s`;
                    hintEl.style.color = '#555';
                }, 2000);
            }).catch(() => {
                // Fallback: select all text in the element
                const sel = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(keyEl);
                sel.removeAllRanges();
                sel.addRange(range);
                notify('Text selected — press Ctrl+C / ⌘C to copy', 'info', 3000);
            });
        });

        setTimeout(() => dismissCard(card), autoDismissMs);
        console.log(`%c[ULB/${site}] Key:`, 'color:#22c55e;font-weight:bold', key);
    }

    // ── §3.6  BYPASS CONFIRMATION PROMPT ──────────────────────────────────

    /**
     * Show a stylised confirmation card asking the user whether to bypass.
     * onConfirm is called when "Yes" is clicked; onCancel when "Cancel" is clicked.
     * @param {string}   siteLabel
     * @param {Function} onConfirm
     * @param {Function} [onCancel]
     */
    function showBypassPrompt(siteLabel, onConfirm, onCancel) {
        if(!document.body) {
            document.addEventListener('DOMContentLoaded', () => showBypassPrompt(siteLabel, onConfirm, onCancel), {
                once: true
            });
            return;
        }
        ensureSpinStyle();

        const card = document.createElement('div');
        card.style.cssText = [
            CSS_CARD_BASE,
            'border-left:3px solid #4f8ef7',
            'padding:14px 16px',
            'min-width:min(260px,calc(100vw - 56px))',
            'max-width:min(340px,calc(100vw - 56px))',
        ].join(';');

        const versionTag = CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : '';
        const brandLine = (!CONFIG.compactMode && CONFIG.notifShowBranding !== false) ?
            `<div style="${CSS_LABEL}:6px">Unknown Link Bypasser · @Aro Moon${versionTag}</div>` :
            '';

        card.innerHTML = `
            ${brandLine}
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
                <div style="font-size:18px;color:#4f8ef7;flex-shrink:0;margin-top:1px">🔗</div>
                <div>
                    <div style="font-size:13px;font-weight:600;color:#e0e0e0;margin-bottom:3px">Bypass this page?</div>
                    <div style="font-size:11px;color:#888;line-height:1.4">${siteLabel || location.hostname}</div>
                </div>
            </div>
            <div style="display:flex;gap:8px">
                <button id="__ulb_ask_yes" style="
                    flex:1;padding:9px 0;border:none;border-radius:7px;cursor:pointer;
                    background:linear-gradient(135deg,#4f8ef7,#3b6fd4);color:#fff;
                    font-size:12px;font-weight:700;letter-spacing:.3px;
                    touch-action:manipulation;min-height:40px;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
                    ✔ Yes, Bypass
                </button>
                <button id="__ulb_ask_no" style="
                    flex:1;padding:9px 0;border:1px solid rgba(255,255,255,.1);border-radius:7px;cursor:pointer;
                    background:rgba(255,255,255,.06);color:#aaa;
                    font-size:12px;font-weight:600;letter-spacing:.3px;
                    touch-action:manipulation;min-height:40px;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
                    ✖ Cancel
                </button>
            </div>`;

        mountCard(card);

        const dismiss = () => dismissCard(card);

        card.querySelector('#__ulb_ask_yes').addEventListener('click', () => {
            dismiss();
            onConfirm();
        }, {
            once: true
        });

        card.querySelector('#__ulb_ask_no').addEventListener('click', () => {
            dismiss();
            if(typeof onCancel === 'function') onCancel();
        }, {
            once: true
        });
    }


    /**
     * Gate function: shows a bypass confirmation prompt if CONFIG.askBeforeBypass
     * is true, using sessionStorage to survive the reload.  If already confirmed
     * (post-reload), askBeforeBypass is false, or the host is in autoBypassHosts,
     * runs fn() immediately.
     * @param {string}   siteLabel  Human-readable site name shown in the prompt.
     * @param {Function} fn         The bypasser function to call.
     */
    function _gateBypass(siteLabel, fn) {
        // Always run immediately when asking is disabled.
        if(!CONFIG.askBeforeBypass) {
            fn();
            return;
        }

        // Auto-bypass for user-configured hosts — no session tracking needed.
        if(CONFIG.autoBypassHosts?.some(h => host.includes(h) || (host + path).includes(h))) {
            fn();
            return;
        }

        // Unique key per URL so different pages don't share confirmation state.
        const key = '__ulb_ask_' + location.href.replace(/[^a-zA-Z0-9]/g, '').slice(0, 60);
        try {
            if(sessionStorage.getItem(key) === '1') {
                sessionStorage.removeItem(key);
                fn();
                return;
            }
        } catch (_) {
            fn();
            return;
        }
        // Not yet confirmed — show the prompt.
        const show = () => showBypassPrompt(siteLabel, () => {
            try {
                sessionStorage.setItem(key, '1');
            } catch (_) {}
            location.reload();
        });
        if(document.body) show();
        else document.addEventListener('DOMContentLoaded', show, {
            once: true
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §4  CAPTCHA & CLOUDFLARE
    // ═══════════════════════════════════════════════════════════════════════

    /** Try every known strategy to extract a Cloudflare Turnstile sitekey. */
    function getSiteKey(fallback = null) {
        for(const sel of ['[data-sitekey]', '.cf-turnstile', 'iframe[src*="challenges.cloudflare.com"]']) {
            const el = document.querySelector(sel);
            if(!el) continue;
            const k = el.dataset?.sitekey || el.getAttribute('data-sitekey');
            if(k) return k;
            const m = (el.getAttribute('src') || '').match(/[?&]sitekey=([^&]+)/);
            if(m) return m[1];
        }
        for(const s of document.querySelectorAll('script:not([src])')) {
            const m = s.textContent.match(/sitekey['"::\s]+([0-9a-zA-Z_\-]{20,})/);
            if(m) return m[1];
        }
        return fallback;
    }

    /**
     * Solve a Cloudflare Turnstile challenge via a full-screen overlay.
     * Resolves with the token string, or rejects after 60 s.
     */
    function solveTurnstile(sitekey) {
        if(!sitekey) return Promise.reject(new Error('[ULB/Turnstile] sitekey is required'));
        return new Promise((resolve, reject) => {
            const cbName = '__ulb_tsCb_' + generateId();

            // Inject @keyframes into the main document so the overlay spinner works
            // (the Shadow DOM keyframes are not accessible outside the shadow root).
            if(!document.querySelector('style[data-ulb-spin]')) {
                const ks = document.createElement('style');
                ks.setAttribute('data-ulb-spin', '1');
                ks.textContent = '@keyframes __ulb_spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                (document.head || document.documentElement).appendChild(ks);
            }

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

            const widgetDiv = document.createElement('div');
            widgetDiv.setAttribute('data-sitekey', sitekey);
            widgetDiv.setAttribute('data-callback', cbName);
            widgetDiv.setAttribute('data-theme', 'dark');
            widgetDiv.style.cssText = 'border-radius:8px;overflow:hidden';

            const footer = document.createElement('div');
            footer.style.cssText = 'font-size:10px;color:#334155;letter-spacing:1.2px;text-transform:uppercase;margin-top:4px';
            footer.textContent = `Unknown Link Bypasser · @Aro Moon${CONFIG.notifShowVersion !== false ? ` · v${VERSION}` : ''}`;

            card.append(spinWrap, textWrap, widgetDiv, footer);
            overlay.appendChild(card);

            const mountOverlay = () => {
                overlay.style.opacity = '0';
                (document.body || document.documentElement).appendChild(overlay);
                requestAnimationFrame(() => {
                    overlay.style.opacity = '1';
                });
            };
            if(document.body) mountOverlay();
            else document.addEventListener('DOMContentLoaded', mountOverlay, {
                once: true
            });

            const autoClickObs = new MutationObserver(() => {
                overlay.querySelectorAll('iframe').forEach(fr => {
                    try {
                        const cb = fr.contentDocument?.querySelector('input[type=checkbox]');
                        if(cb && !cb.checked) cb.click();
                    } catch (_) {}
                });
            });
            autoClickObs.observe(overlay, {
                childList: true,
                subtree: true
            });

            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('[ULB/Turnstile] timed out after 60s'));
            }, 60_000);

            function cleanup() {
                clearTimeout(timeout);
                autoClickObs.disconnect();
                try {
                    delete unsafeWindow[cbName];
                } catch (_) {}
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 350);
            }

            const onToken = token => {
                const sub2 = overlay.querySelector('#__ulb_ts_sub');
                if(sub2) sub2.textContent = 'Solved ✓ — redirecting…';
                const ring = overlay.querySelector('#__ulb_ts_ring');
                if(ring) {
                    ring.style.borderTopColor = '#22c55e';
                    ring.style.animationDuration = '0.3s';
                }
                setTimeout(() => {
                    cleanup();
                    resolve(token);
                }, 400);
            };
            unsafeWindow[cbName] = onToken;

            const tryRenderApi = () => {
                const ts = unsafeWindow.turnstile;
                if(!ts?.render) return false;
                try {
                    ts.render(widgetDiv, {
                        sitekey,
                        theme: 'dark',
                        size: 'normal',
                        callback: onToken
                    });
                    return true;
                } catch (e) {
                    console.warn('[ULB/Turnstile] turnstile.render() threw:', e);
                    return false;
                }
            };

            if(!tryRenderApi()) {
                if(!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
                    const s = Object.assign(document.createElement('script'), {
                        src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
                        async: true,
                    });
                    s.onload = () => tryRenderApi();
                    document.head.appendChild(s);
                } else {
                    const poll = setInterval(() => {
                        if(tryRenderApi()) clearInterval(poll);
                    }, 150);
                    setTimeout(() => clearInterval(poll), 10_000);
                }
            }
        });
    }

    // ── Cloudflare Challenge Frame Hook ────────────────────────────────────

    function _runCfHook() {
        const spoofEvt = (e, props) => new Proxy(e, {
            get: (t, p) => p in props ? props[p] : t[p]
        });
        const _origAdd = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            return _origAdd.call(this, type, function (e) {
                const props = {
                    isTrusted: true
                };
                if(location.hash.includes('origin='))
                    props.origin = decodeURIComponent(location.hash.split('origin=')[1]);
                return listener.call(this, spoofEvt(e, props));
            }, options);
        };

        const tryClick = (root, frameId) => {
            const cb = root.querySelector('input[type=checkbox]');
            if(cb && !cb.checked) {
                try {
                    window.parent.postMessage({
                        __ulb: true,
                        __ulb_clicked: true,
                        id: frameId || ''
                    }, '*');
                } catch (_) {}
                cb.click();
            }
        };

        const frameId = (location.hash.match(/[#&]ulbid=([^&]+)/) || [])[1] || '';
        const shadowObs = new MutationObserver(muts => {
            for(const m of muts)
                m.addedNodes.forEach(n => {
                    if(n.nodeType !== 1) return;
                    const cb = n.matches?.('input[type=checkbox]') ? n : n.querySelector('input[type=checkbox]');
                    if(cb && !cb.checked) {
                        try {
                            window.parent.postMessage({
                                __ulb: true,
                                __ulb_clicked: true,
                                id: frameId
                            }, '*');
                        } catch (_) {}
                        cb.click();
                    }
                });
        });

        const _origShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (opt) {
            const root = _origShadow.call(this, opt);
            shadowObs.observe(root, {
                childList: true,
                subtree: true
            });
            Promise.resolve().then(() => tryClick(root, frameId));
            return root;
        };

        document.querySelectorAll('*').forEach(el => {
            if(el.shadowRoot) {
                shadowObs.observe(el.shadowRoot, {
                    childList: true,
                    subtree: true
                });
                tryClick(el.shadowRoot, frameId);
            }
        });
    }

    // Early return: only the CF hook runs inside challenge iframes.
    if(location.hostname === 'challenges.cloudflare.com') {
        if(CONFIG.cfAllowedRefs.some(h => document.referrer.includes(h))) _runCfHook();
        return;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §5  SHARED BYPASSER HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create a standard error handler bound to a notification handle.
     */
    function makeErrHandler(siteLabel, nh, msClose = 6000) {
        return (label, err) => {
            console.error(`[ULB/${siteLabel}] ${label}`, err ?? '');
            const msg = `${siteLabel}: ${label}${err?.message ? ` — ${err.message}` : ''}`;
            if(nh) {
                nh.update(msg, 'error');
                setTimeout(() => nh.remove(), msClose);
            } else {
                notify(msg, 'error', msClose, {
                    site: siteLabel
                });
            }
        };
    }

    /**
     * Validate url and redirect, showing a manual-redirect fallback card.
     */
    function safeRedirect(url, nh, opts = {}) {
        const {
            t,
            siteLabel,
            autoDismiss = CONFIG.autoDismissOnRedirect
        } = opts;
        if(!safeUrl(url)) {
            const msg = `Invalid or unsafe redirect URL`;
            console.error(`[ULB/${siteLabel ?? 'ULB'}] ${msg}:`, url);
            if(nh) {
                nh.update(`${siteLabel ? siteLabel + ': ' : ''}${msg}`, 'error');
                setTimeout(() => nh.remove(), 6000);
            } else {
                notify(msg, 'error', 6000, siteLabel ? {
                    site: siteLabel
                } : {});
            }
            return false;
        }
        if(nh) {
            const extra = {};
            if(siteLabel) extra.site = siteLabel;
            if(t) extra.time = t.elapsed() + 's';
            nh.update('Redirecting…', 'success', extra);
            setTimeout(() => nh.remove(), autoDismiss ? 500 : 2000);
        }
        showRedirectNotif(url);
        location.href = url;
        return true;
    }

    // ── lnbz / app_vars helpers ────────────────────────────────────────────

    function _lnbzGetAppVars() {
        try {
            const v = unsafeWindow.app_vars;
            if(v && typeof v === 'object') return v;
        } catch (_) {}
        for(const s of document.querySelectorAll('script:not([src])')) {
            const m = s.textContent.match(/var\s+app_vars\s*=\s*(\{[\s\S]*?\});/);
            if(m) {
                try {
                    return JSON.parse(m[1]);
                } catch (_) {}
            }
        }
        return null;
    }

    function _lnbzWaitForAppVars(cb, timeoutMs = 8000) {
        const v = _lnbzGetAppVars();
        if(v) {
            cb(v);
            return;
        }

        let done = false;
        const safeCb = val => {
            if(!done) {
                done = true;
                cb(val);
            }
        };

        const start = Date.now();
        const obs = new MutationObserver(() => {
            const v2 = _lnbzGetAppVars();
            if(v2) {
                obs.disconnect();
                safeCb(v2);
                return;
            }
            if(Date.now() - start > timeoutMs) {
                obs.disconnect();
                safeCb(null);
            }
        });
        obs.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
        setTimeout(() => {
            obs.disconnect();
            safeCb(_lnbzGetAppVars());
        }, timeoutMs);
    }

    function _lnbzWaitForAppVarsAsync(timeoutMs = 8000) {
        return new Promise(resolve => _lnbzWaitForAppVars(resolve, timeoutMs));
    }

    /**
     * Generic /links/go bypasser for encurta.net-system sites.
     *
     * PAGE A (captcha)  — form without ad_form_data → solve Turnstile → submit
     * PAGE B (go-link)  — [name="ad_form_data"] present →
     *                      read countdown from app_vars.counter_value →
     *                      wait → POST /links/go → redirect
     *
     * Sites: lnbz.la, 4br.me, go.yorurl.com, go.caslinks.com,
     *        short-jambo.com, short-jambo.ink
     */
    function _runLinksGoBypasser(siteLabel, captchaSiteKey) {
        const t = makeTimer();
        const nh = notify(`${siteLabel} — detecting page…`, 'loading', 0, {
            site: siteLabel
        });

        const handleError = (label, err) => {
            console.error(`[ULB/${siteLabel}] ${label}`, err);
            nh.update(`${siteLabel}: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error');
            setTimeout(() => nh.remove(), 7000);
        };

        const doGoFetch = async (adEl) => {
            nh.update(`${siteLabel} — fetching destination…`, 'loading', {
                site: siteLabel
            });
            try {
                const form = adEl.closest('form') || document.querySelector('#go-link') || document.querySelector('form');
                let body;
                if(form) {
                    const params = new URLSearchParams();
                    form.querySelectorAll('input[type="hidden"]').forEach(inp => {
                        if(inp.name) params.append(inp.name, inp.value);
                    });
                    if(!params.has('_method')) params.set('_method', 'POST');
                    body = params.toString();
                } else {
                    body = '_method=POST&ad_form_data=' + encodeURIComponent(adEl.value);
                }

                const r = await fetch('/links/go', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                    },
                    credentials: 'include',
                    body,
                });
                if(!r.ok) throw new Error(`HTTP ${r.status}`);
                let d;
                try {
                    d = await r.json();
                } catch {
                    throw new Error('Response was not valid JSON');
                }
                const dest = d.url || d.data;
                if(!dest) throw new Error('No destination URL in server response');
                safeRedirect(dest, nh, {
                    t,
                    siteLabel
                });
            } catch (err) {
                handleError('go-link POST failed', err);
            }
        };

        const runGoPage = (adEl) => {
            nh.update(`${siteLabel} — reading countdown…`, 'loading', {
                site: siteLabel
            });
            _lnbzWaitForAppVars(vars => {
                const secs = Math.max(1, parseInt(vars?.counter_value, 10) || 15);
                nh.update(`${siteLabel} — redirecting in ${secs}s…`, 'loading', {
                    site: siteLabel
                });
                showCountdown(secs, () => doGoFetch(adEl), `${siteLabel} bypass`);
            });
        };

        const runCaptchaPage = async (form) => {
            if(!CONFIG.autoCaptcha) {
                nh.update(`${siteLabel} — solve captcha manually to continue…`, 'info', 0, {
                    site: siteLabel
                });
                return;
            }

            nh.update(`${siteLabel} — solving captcha…`, 'loading', {
                site: siteLabel
            });

            let sitekey = captchaSiteKey;
            if(!sitekey) {
                const vars = await _lnbzWaitForAppVarsAsync(5000);
                sitekey = vars?.turnstile_site_key || getSiteKey();
            }
            if(!sitekey) {
                handleError('could not find Turnstile sitekey', null);
                return;
            }

            let token;
            try {
                token = await solveTurnstile(sitekey);
            } catch (e) {
                handleError('Turnstile solve failed', e);
                return;
            }

            let input = form.querySelector('[name="cf-turnstile-response"]');
            if(!input) {
                input = Object.assign(document.createElement('input'), {
                    type: 'hidden',
                    name: 'cf-turnstile-response'
                });
                form.appendChild(input);
            }
            input.value = token;

            const widgetInput = document.getElementById('cf-chl-widget-qg0yr_response') ||
                document.querySelector('.cf-turnstile [name$="_response"]');
            if(widgetInput && widgetInput !== input) widgetInput.value = token;

            const submitBtn = document.getElementById('invisibleCaptchaShortlink') ||
                form.querySelector('button[type="submit"][disabled], input[type="submit"][disabled]');
            if(submitBtn) submitBtn.disabled = false;

            nh.update(`${siteLabel} — submitting…`, 'loading', {
                site: siteLabel
            });

            try {
                if(typeof form.requestSubmit === 'function') form.requestSubmit();
                else HTMLFormElement.prototype.submit.call(form);
            } catch (e) {
                console.warn('[ULB/lnbz] form submit failed, trying click fallback:', e);
                const btn2 = form.querySelector('button[type="submit"], input[type="submit"]');
                if(btn2) btn2.click();
            }
        };

        const detect = () => {
            const adEl = document.querySelector('[name="ad_form_data"]');
            if(adEl) {
                runGoPage(adEl);
                return true;
            }
            const form = document.getElementById('link-view') || document.querySelector('form');
            if(form) {
                runCaptchaPage(form);
                return true;
            }
            return false;
        };

        const init = () => {
            if(detect()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if(detect()) {
                    clearInterval(iv);
                    return;
                }
                if(++tries > 200) {
                    clearInterval(iv);
                    handleError('page structure not recognised after 20s', null);
                }
            }, 100);
        };

        onReady(init);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §6  ROUTER
    // ═══════════════════════════════════════════════════════════════════════

    const host = location.hostname;
    const path = location.pathname;

    // ── Global: make invisible Turnstile widgets visible ──────────────────
    // Runs at document-start so widgets are patched before the Turnstile
    // script initialises them. Also watches for dynamically added widgets.
    // This ensures any page using our captcha handler shows the widget.
    (function _patchInvisibleTurnstiles() {
        const patch = el => {
            if(el.nodeType !== 1) return;
            if(el.classList?.contains('cf-turnstile') && el.getAttribute('data-size') === 'invisible') {
                el.setAttribute('data-size', 'normal');
            }
            el.querySelectorAll?.('.cf-turnstile[data-size="invisible"]').forEach(w => w.setAttribute('data-size', 'normal'));
        };
        patch(document.documentElement);
        new MutationObserver(muts => {
            for(const m of muts) m.addedNodes.forEach(patch);
        }).observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    })();

    // ── GM Clipboard helper (uses GM_setClipboard with navigator.clipboard fallback) ──
    function _gmCopy(text) {
        try {
            GM_setClipboard(text, 'text');
            return Promise.resolve();
        } catch (_) {
            return navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('No clipboard API'));
        }
    }

    // ── Diagnostics menu command ───────────────────────────────────────────
    try {
        GM_registerMenuCommand('ULB Diagnostics', () => {
            const now = new Date();
            const gmAvail = fn => {
                try {
                    return typeof eval(fn) === 'function' ? '✔' : '✘';
                } catch (_) {
                    return '✘';
                }
            };
            const cfgLines = Object.entries(CONFIG)
                .filter(([k]) => !['cfAllowedRefs', 'autoBypassHosts'].includes(k))
                .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
                .join('\n');
            const hostLines = (CONFIG.autoBypassHosts || []).map(h => `  - ${h}`).join('\n');
            const diagLines = _diagEntries.length ?
                _diagEntries.slice(-30).map(e => `  [${e.level}] ${new Date(e.ts).toISOString().slice(11,19)} ${e.msg}`).join('\n') :
                '  (none)';

            const report = [
                `╔══════════════════════════════════════════════╗`,
                `║   Unknown Link Bypasser — Diagnostics        ║`,
                `╚══════════════════════════════════════════════╝`,
                `Generated : ${now.toISOString()}`,
                `Version   : v${VERSION}`,
                ``,
                `── PAGE ─────────────────────────────────────`,
                `URL       : ${location.href}`,
                `Host      : ${host}`,
                `Path      : ${path}`,
                `Referrer  : ${document.referrer || '(none)'}`,
                ``,
                `── ENVIRONMENT ──────────────────────────────`,
                `UserAgent : ${navigator.userAgent}`,
                `GM_setClipboard      : ${gmAvail('GM_setClipboard')}`,
                `GM_registerMenuCommand : ${gmAvail('GM_registerMenuCommand')}`,
                `unsafeWindow         : ${typeof unsafeWindow !== 'undefined' ? '✔' : '✘'}`,
                ``,
                `── CONFIG ────────────────────────────────────`,
                cfgLines,
                ``,
                `  autoBypassHosts:`,
                hostLines || '  (empty)',
                ``,
                `── LOG (last 30 entries) ─────────────────────`,
                diagLines,
                ``,
                `══════════════════════════════════════════════`,
            ].join('\n');

            _gmCopy(report).then(() => {
                notify('Diagnostics copied to clipboard ✔', 'success', 3000);
            }).catch(() => {
                notify('Copy failed — check the browser console', 'error', 4000);
                console.log('[ULB] Diagnostics report:\n', report);
            });
        });
    } catch (_) {
        /* GM_registerMenuCommand not available (e.g. non-TM runner) */ }

    try {
        if(host.includes('dl.surf')) _gateBypass('dl.surf', runDlSurf);
        else if(host.includes('airflowscript.com')) _gateBypass('airflowscript.com', runAirflowBypasser);
        else if(host.includes('bstlar.com')) _gateBypass('bstlar.com', runBstlarBypasser);
        else if(host.includes('wareguardv2.xyz')) _gateBypass('wareguardv2.xyz', runWareguardBypasser);
        else if(host.includes('subnise.com')) _gateBypass('subnise.com', runSubniseBypasser);
        else if(host.includes('reshortfly.com')) _gateBypass('reshortfly.com', runReshortflyBypasser);
        else if(host.includes('avnsgames.com')) _gateBypass('avnsgames.com', runAvnsGamesInterstitial);
        else if(host.includes('lnbz.la')) _gateBypass('lnbz.la', runLnbzLaBypasser);
        else if(host.includes('bloxscript.live')) _gateBypass('bloxscript.live', runBloxscriptScamWarning);
        else if(host.includes('jankariweb')) _gateBypass(host, runJoberBypasser);
        else if(host.includes('apnahirework.com')) _gateBypass('apnahirework.com', runApnahireworkBypasser);
        else if(host.includes('crimejasoos.in')) _gateBypass('crimejasoos.in', runCrimejasoosBypasser);
        else if(host.includes('newsuchnaonline.com')) _gateBypass('newsuchnaonline.com', runNewsuchnaonlineBypasser);
        else if(host.includes('jober.factwiz.online')) _gateBypass('jober.factwiz.online', runJoberFacwizBypasser);
        else if(host.includes('how2guidess.com')) _gateBypass('how2guidess.com', runHow2GuidesBypasser);
        else if(host.includes('go.yorurl.com')) _gateBypass('go.yorurl.com', runYorurlBypasser);
        else if(
            host.includes('go.caslinks.com') ||
            host.includes('highlocus.shop')
        ) _gateBypass(host, runCasLinksBypasser);
        else if(host.includes('gplinks.co')) _gateBypass('gplinks.co', runGpLinksBypasser);
        else if(host.includes('powergam.online')) _gateBypass('powergam.online', runPowergamBypasser);
        else if(host.includes('4br.me')) _gateBypass('4br.me', run4BrMeBypasser);
        else if(host.includes('rojgarhindi.in')) _gateBypass('rojgarhindi.in', runRojgarhindiBypasser);
        else if(host.includes('v0-phantomfluxkey.vercel.app')) _gateBypass('phantomfluxkey', runPhantomFluxKeyBypasser);
        else if(host.includes('link-unlock.com')) _gateBypass('link-unlock.com', runLinkUnlockBypasser);
        else if(host.includes('link4sub.com')) _gateBypass('link4sub.com', runLink4SubBypasser);
        else if(host.includes('tapvietcode.com')) _gateBypass('tapvietcode.com', runTapVietCodeBypasser);
        else if(host.includes('short-jambo.ink')) _gateBypass('short-jambo.ink', runShortJamboInkBypasser);
        else if(host.includes('short-jambo.com')) _gateBypass('short-jambo.com', runShortJamboDotComBypasser);
        else if(
            /fastcars\d*\.com/.test(host) ||
            host.includes('bigcarinsurance.com')
        ) _gateBypass(host, runFastcarsBypasser);
        else if(host.includes('sub4unlock.co')) _gateBypass('sub4unlock.co', runSub4UnlockBypasser);
        else if(host.includes('app.khaddavi.net')) _gateBypass('app.khaddavi.net', runKhaddaviBypasser);
        else if(host.includes('sfl.gl')) _gateBypass('sfl.gl', runSflGlBypasser);
        else if(host.includes('ytsubme.com')) _gateBypass('ytsubme.com', runYtSubMeBypasser);
        else if(host.includes('aylink.co')) _gateBypass('aylink.co', runAylinkBypasser);
        else if(
            host.includes('hehehub-acsu123.pythonanywhere.com') &&
            /[?&]hwid=[\w.]+/.test(location.search)
        ) _gateBypass('hehehub', runHehehubSkipper);
        else if(host.includes('fluorine.s3ren1ty.xyz')) _gateBypass('fluorine.s3ren1ty.xyz', runFluorineBypasser);
        else if(host.includes('getpolsec.com')) _gateBypass('getpolsec.com', runGetPolSecBypasser);
        else if(
            host.includes('biplabtewary.com') ||
            host.includes('mwgamesyt.com.br') ||
            host.includes('topjogosvip.online') ||
            host.includes('legacyagency.com.br')
        ) _gateBypass(host, runButtonFinderBypasser);
        else if(host.includes('rekonise.com')) _gateBypass('rekonise.com', runRekoniseBypasser);
        else if(host.includes('go.linkify.ru')) _gateBypass('go.linkify.ru', runLinkifyRuBypasser);
        else if(host.includes('arolinks.com')) _gateBypass('arolinks.com', runArolinksBypasser);
        else if(host.includes('spdmteam.com')) _gateBypass('spdmteam.com', runSpdmTeamBypasser);
        else if(host.includes('linkunlocker.com')) _gateBypass('linkunlocker.com', runLinkUnlockerBypasser);
        else if(host.includes('mboost.me')) _gateBypass('mboost.me', runMboostBypasser);
        else if(host.includes('sub2unlock.netlify.app')) _gateBypass('sub2unlock', runSub2UnlockBypasser);
        else if(host.includes('krnl-ios.com')) _gateBypass('krnl-ios.com', runKrnlIosBypasser);
        else if(host.includes('scoplidrop.com')) _gateBypass('scoplidrop.com', runScoplidropBypasser);
        else if(host.includes('ouo.io') ||
            host.includes('ouo.press')
        ) _gateBypass(host, runOuoBypasser);
        else if(host.includes('nexusdevs.fun') && path.startsWith('/getkey')) _gateBypass('nexusdevs.fun', runNexusBypasser);
        else if(host.includes('lua-key-vault.vercel.app')) _gateBypass('lua-key-vault', runLuaKeyVaultBypasser);
        else if(TPI_HOSTS.some(h => host.includes(h))) _gateBypass(host, runTpiLiBypasser);
        else if(FORM_HOSTS.some(h => host.includes(h))) _gateBypass(host, runFormBypasser);
        else _gateBypass(host, runSafelinkBypasser);
    } catch (routerErr) {
        console.error('[ULB] Uncaught router error:', routerErr);
        notify(`ULB: unexpected error — ${routerErr.message}`, 'error', 8000);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // §7  BYPASSERS
    // ═══════════════════════════════════════════════════════════════════════

    // ── PhantomFluxKey ─────────────────────────────────────────────────────

    function runPhantomFluxKeyBypasser() {
        notify('PhantomFluxKey detected — showing direct bypass…', 'info', undefined, {
            site: 'phantomfluxkey'
        });
        showDirectBypassBtn('Direct Bypass — Get Key', CONFIG.phantomDirectUrl, 'PhantomFluxKey Direct Bypass');
    }


    // ── dl.surf ────────────────────────────────────────────────────────────

    function runDlSurf() {
        const API = 'https://backendapi.dl.surf/api/file';
        const DL_KEY = '0x4AAAAAABbfHaaMuK4MmNeI';
        const slug = location.pathname.split('/').filter(Boolean).pop();

        const dlFetch = async (url, opts) => {
            const r = await fetch(url, opts);
            if(!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            if(j.status !== 'success') throw new Error(j.message || 'API error');
            return j.data;
        };

        const getToken = () => dlFetch(`${API}/request-download/file/${slug}/`, {
            headers: {
                Accept: 'application/json'
            }
        }).then(d => d.token);

        const getDownloadUrl = (tk, cap) => dlFetch(`${API}/new-download-file/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Origin: location.origin,
                Referer: location.href,
            },
            body: JSON.stringify({
                token: tk,
                captcha_token: cap
            }),
        }).then(d => d.url || d.download_url || d.link || d);

        const btn = Object.assign(document.createElement('button'), {
            title: 'Unknown Link Bypasser — Auto Download',
            innerHTML: 'Download via Bypasser',
        });

        let nh = null;
        const setStatus = (msg, type, extra) => nh ? nh.update(msg, type, extra) : (nh = notify(msg, type, 0, extra));

        function injectBtn() {
            const orig = document.querySelector('button[title="Continue to Download"]');
            if(orig) {
                btn.className = orig.className;
                btn.style.cssText = orig.style.cssText;
                btn.style.backgroundColor = btn.style.borderColor = '#dc2626';
                orig.replaceWith(btn);
            } else {
                Object.assign(btn.style, {
                    position: 'fixed',
                    bottom: 'calc(24px + env(safe-area-inset-bottom,0px))',
                    right: 'calc(24px + env(safe-area-inset-right,0px))',
                    zIndex: 99999,
                    padding: '12px 22px',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Segoe UI,Arial,sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    minHeight: '44px',
                    touchAction: 'manipulation',
                });
                document.body.appendChild(btn);
            }
            notify('dl.surf detected — bypasser ready.', 'info', undefined, {
                site: 'dl.surf'
            });
        }

        if(!CONFIG.dlSurfAutoInject) {
            notify('dl.surf — auto-inject disabled in config.', 'info', undefined, {
                site: 'dl.surf'
            });
            return;
        }

        let lastHref = location.href,
            injectIv = null;

        function startInjecting() {
            btn.innerHTML = 'Download via Bypasser';
            btn.disabled = false;
            clearInterval(injectIv);
            injectIv = setInterval(() => {
                if(btn.isConnected) return;
                if(document.querySelector('button[title="Continue to Download"]')) {
                    clearInterval(injectIv);
                    injectBtn();
                }
            }, 200);
            setTimeout(() => {
                clearInterval(injectIv);
                if(!btn.isConnected) injectBtn();
            }, 15_000);
        }

        const hrefCheck = () => {
            if(location.href !== lastHref) {
                lastHref = location.href;
                startInjecting();
            }
        };
        new MutationObserver(hrefCheck).observe(document.querySelector('title') || document.head, {
            childList: true,
            subtree: true
        });
        setInterval(hrefCheck, 500);
        startInjecting();

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            const t = makeTimer();
            try {
                setStatus('Requesting download token…', 'loading', {
                    site: 'dl.surf'
                });
                const token = await getToken();
                setStatus('Solving captcha automatically…', 'loading', {
                    site: 'dl.surf'
                });
                const cap = await solveTurnstile(DL_KEY);
                setStatus('Fetching download URL…', 'loading', {
                    site: 'dl.surf'
                });
                const url = await getDownloadUrl(token, cap);
                if(typeof url === 'string' && url.startsWith('http')) {
                    setStatus('Download started!', 'success', {
                        site: 'dl.surf',
                        time: t.elapsed() + 's'
                    });
                    const a = Object.assign(document.createElement('a'), {
                        href: url,
                        download: '',
                        target: '_blank',
                        rel: 'noopener'
                    });
                    document.body.appendChild(a);
                    try {
                        a.click();
                    } catch (_) {}
                    a.remove();
                    if(isIOS()) window.open(url, '_blank');
                } else {
                    setStatus('Unexpected response — check console.', 'warn', {
                        site: 'dl.surf'
                    });
                    console.warn('[ULB/dl.surf] unexpected download URL response:', url);
                }
                setTimeout(() => {
                    nh?.remove();
                    nh = null;
                }, 4000);
            } catch (err) {
                console.error('[ULB/dl.surf]', err);
                setStatus(`Error: ${err.message}`, 'error', {
                    site: 'dl.surf'
                });
                setTimeout(() => {
                    nh?.remove();
                    nh = null;
                }, 5000);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // ── airflowscript.com ──────────────────────────────────────────────────

    function runAirflowBypasser() {
        const KEY = 'rinku_step1_done';
        if(localStorage.getItem(KEY) === 'true') return;
        notify('Bypassing Discord requirement…', 'loading', 3000, {
            site: 'airflowscript.com'
        });
        localStorage.setItem(KEY, 'true');
        location.reload();
    }

    // ── bstlar.com ─────────────────────────────────────────────────────────

    function runBstlarBypasser() {
        const SITE = 'bstlar.com';
        const t = makeTimer();
        const nh = notify(`${SITE} detected — bypassing…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh);

        const run = async () => {
            try {
                const el = document.getElementById('link_action_id');
                const link_action_id = el ? (el.value ?? el.textContent) : null;
                const r1 = await fetch(`/api/link?url=${encodeURIComponent(path.slice(1))}&link_action_id=${link_action_id}`);
                if(!r1.ok) throw new Error(`/api/link returned HTTP ${r1.status}`);
                const linkData = await r1.json();

                const r2 = await fetch('/api/link-completed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        link_id: linkData.id,
                        link_action_id
                    }),
                });
                if(!r2.ok) throw new Error(`/api/link-completed returned HTTP ${r2.status}`);
                const result = await r2.json();
                if(!result.destination_url) throw new Error('No destination_url in response');

                safeRedirect(result.destination_url, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('bypass failed', err);
            }
        };
        onReady(run);
    }

    // ── wareguardv2.xyz ────────────────────────────────────────────────────

    function runWareguardBypasser() {
        const SITE = 'wareguardv2.xyz';
        const t = makeTimer();
        const nh = notify('wareguardv2 checkpoint — bypassing…', 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh);

        const run = () => {
            try {
                const btn = document.getElementById('continueBtn');
                if(!btn?.href) {
                    handleError('continueBtn not found', null);
                    return;
                }

                const r = new URL(btn.href).searchParams.get('r');
                if(!r) {
                    handleError('no redirect parameter found', null);
                    return;
                }

                let dest;
                try {
                    dest = atob(decodeURIComponent(r));
                } catch (e) {
                    handleError('failed to decode redirect URL', e);
                    return;
                }

                if(!safeUrl(dest)) {
                    handleError('decoded URL is invalid or unsafe', null);
                    return;
                }

                nh.update('Redirecting in 1s…', 'info', {
                    site: SITE
                });
                showCountdown(1, () => safeRedirect(dest, nh, {
                    t,
                    siteLabel: SITE
                }), 'wareguardv2 bypass');
            } catch (err) {
                handleError('unexpected error', err);
            }
        };
        onReady(run);
    }

    // ── subnise.com ────────────────────────────────────────────────────────

    function runSubniseBypasser() {
        const SITE = 'subnise.com';
        const t = makeTimer();
        const nh = notify(`${SITE} detected — bypassing…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh);

        const run = async () => {
            try {
                const id = path.split('/').pop();
                if(!id) throw new Error('Could not extract link ID from URL');
                const r = await fetch(`/api/links/${id}`);
                if(!r.ok) throw new Error(`API returned HTTP ${r.status}`);
                const data = await r.json();
                if(!data.url) throw new Error('No URL in API response');

                nh.update('Redirecting in 1s…', 'info', {
                    site: SITE
                });
                showCountdown(1, () => safeRedirect(data.url, nh, {
                    t,
                    siteLabel: SITE
                }), 'subnise bypass');
            } catch (err) {
                handleError('bypass failed', err);
            }
        };
        onReady(run);
    }

    // ── tpi.li ─────────────────────────────────────────────────────────────

    function runTpiLiBypasser() {
        const SITE = 'tpi.li';
        const DELAY = 3;
        const t = makeTimer();
        let nh = null;

        function extractUrl() {
            try {
                const tokenInput = document.querySelector('[name=token]');
                if(!tokenInput?.value) return null;
                const match = tokenInput.value.match(/aHR0cHM6Ly9[A-Za-z0-9+/=]*/);
                if(!match) return null;
                return atob(match[0]);
            } catch {
                return null;
            }
        }

        function doBypass() {
            const dest = extractUrl();
            if(!dest) {
                if(nh) {
                    nh.update(`${SITE}: token not found — check console.`, 'error');
                    setTimeout(() => nh.remove(), 6000);
                } else {
                    notify(`${SITE}: token not found — check console.`, 'error', 6000, {
                        site: SITE
                    });
                }
                return;
            }
            if(!safeUrl(dest)) {
                if(nh) {
                    nh.update(`${SITE}: decoded URL is invalid or unsafe.`, 'error');
                    setTimeout(() => nh.remove(), 6000);
                } else {
                    notify(`${SITE}: decoded URL is invalid or unsafe.`, 'error', 6000, {
                        site: SITE
                    });
                }
                return;
            }
            if(nh) nh.update(`${SITE} — decoded. Redirecting in ${DELAY}s…`, 'loading', {
                site: SITE
            });
            showCountdown(DELAY, () => safeRedirect(dest, nh, {
                t,
                siteLabel: SITE
            }), `${SITE} bypass`);
        }

        function init() {
            nh = notify(`${SITE} — bypassing…`, 'loading', 0, {
                site: SITE
            });
            if(extractUrl()) {
                doBypass();
                return;
            }
            const obs = new MutationObserver(() => {
                if(extractUrl()) {
                    obs.disconnect();
                    doBypass();
                }
            });
            obs.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['value']
            });
            let tries = 0;
            const iv = setInterval(() => {
                if(extractUrl() || ++tries > 60) {
                    clearInterval(iv);
                    obs.disconnect();
                    if(extractUrl()) doBypass();
                    else {
                        nh.update(`${SITE}: token not found after 30s.`, 'error');
                        setTimeout(() => nh.remove(), 6000);
                    }
                }
            }, 500);
        }
        onReady(init);
    }

    // ── safelink (generic) ─────────────────────────────────────────────────

    function runSafelinkBypasser() {
        let scheduled = false;
        const t = makeTimer();

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

            const _ac = Element.prototype.appendChild;
            const _ib = Element.prototype.insertBefore;
            const isAd = el => {
                if(!el || el.nodeType !== 1) return false;
                const src = el.src || el.getAttribute?.('src') || '';
                const tg = el.tagName?.toLowerCase();
                return (tg === 'script' || tg === 'iframe') && src && AD_PAT.some(p => p.test(src));
            };
            Element.prototype.appendChild = function (c) {
                return isAd(c) ? c : _ac.call(this, c);
            };
            Element.prototype.insertBefore = function (n, r) {
                return isAd(n) ? n : _ib.call(this, n, r);
            };

            window.googletag = {
                cmd: {
                    push: () => {}
                },
                defineSlot: () => ({
                    addService: () => ({})
                }),
                pubads: () => ({}),
                enableServices: () => {},
                display: () => {},
            };
            window.adsbygoogle = {
                push: () => {}
            };

            return () => AD_SEL.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));
        })() : () => {};

        function extract() {
            const inp = document.querySelector('input[name="newwpsafelink"]');
            if(!inp) return null;
            try {
                const outer = JSON.parse(atob(inp.value));
                const url = new URL(outer.linkr);
                const inner = JSON.parse(atob(url.searchParams.get('safelink_redirect')));
                return {
                    dest: inner.safelink || inner.second_safelink_url || null,
                    delay: Math.max(0, parseInt(outer.delay, 10) || 0)
                };
            } catch {
                return null;
            }
        }

        function scheduleBypass() {
            if(scheduled) return;
            const data = extract();
            if(!data?.dest) return;
            scheduled = true;
            notify(`Safelink decoded. Redirecting in ${data.delay}s.`, 'info', 5000, {
                site: host
            });
            const startCountdown = () => {
                showCountdown(data.delay, () => {
                    notify('Safelink bypassed!', 'success', undefined, {
                        site: host,
                        time: t.elapsed() + 's'
                    });
                    showRedirectNotif(data.dest);
                    window.location.replace(data.dest);
                }, CONFIG.blockAds ? 'Ads blocked' : 'Redirecting');
            };
            if(document.readyState === 'complete') startCountdown();
            else window.addEventListener('load', startCountdown, {
                once: true
            });
        }

        function startObserver() {
            const obs = new MutationObserver(mutations => {
                _cleanAds();
                if(scheduled) return;
                for(const m of mutations)
                    for(const n of m.addedNodes)
                        if(n.nodeType === 1 && (n.matches?.('input[name="newwpsafelink"]') || n.querySelector?.('input[name="newwpsafelink"]'))) {
                            scheduleBypass();
                            if(scheduled) obs.disconnect();
                        }
            });
            obs.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }

        function init() {
            notify('Unknown Link Bypasser active — scanning…', 'loading', 3000, {
                site: host
            });
            _cleanAds();
            scheduleBypass();
            if(!scheduled) startObserver();
        }

        if(document.readyState === 'complete') init();
        else window.addEventListener('load', init, {
            once: true
        });

        let attempts = 0;
        const poll = setInterval(() => {
            _cleanAds();
            if(scheduled || ++attempts > 60) clearInterval(poll);
            else scheduleBypass();
        }, 500);
    }

    // ── form-based bypasser ────────────────────────────────────────────────

    function runFormBypasser() {
        const _qs = Document.prototype.querySelector;
        Document.prototype.querySelector = function (sel) {
            if(typeof sel === 'string' && sel.includes('eecdbd')) return this.createElement('div');
            return _qs.call(this, sel);
        };

        const RETRY_KEY = '__ulb_shrtslug_extra_delay';
        const extraDelaySec = parseInt(sessionStorage.getItem(RETRY_KEY) || '0', 10);
        const t = makeTimer();

        notify(
            extraDelaySec > 0 ? `Retry #${extraDelaySec} — adding ${extraDelaySec}s extra delay…` : 'Form bypasser active — waiting for page…',
            extraDelaySec > 0 ? 'warn' : 'loading',
            extraDelaySec > 0 ? 4000 : 3000, {
                site: host
            }
        );

        waitForEl('form[action*="api-endpoint/verify"]').then(async form => {
            const action = form.querySelector('input[name="action"]')?.value;
            const progressMatch = [...document.querySelectorAll('script')].map(s => s.textContent.match(/progress_original\s*=\s*(\d+)/)).find(Boolean);
            const baseDelay = action === 'countdown' ? 5000 : progressMatch ? +progressMatch[1] * 1000 : 0;
            const delay = baseDelay + extraDelaySec * 1000;
            const seconds = Math.ceil(delay / 1000);
            await waitBody();

            let nh = null;
            const setStatus = (msg, type, extra) => nh ? nh.update(msg, type, extra) : (nh = notify(msg, type, 0, extra));

            const [captchaToken] = await Promise.all([
                action === 'captcha' ?
                (setStatus('Solving captcha automatically…', 'loading', {
                    site: host
                }), solveTurnstile(getSiteKey())) :
                Promise.resolve(null),
                seconds > 0 ? new Promise(res => showCountdown(seconds, res, 'Processing safelink…')) : Promise.resolve(),
            ]);

            setStatus('Fetching destination…', 'loading', {
                site: host
            });

            const data = new FormData();
            form.querySelectorAll('input[type="hidden"]').forEach(f => data.append(f.name, f.value));
            if(captchaToken) data.append('cf-turnstile-response', captchaToken);

            let result;
            try {
                const res = await fetch(form.getAttribute('action'), {
                    method: 'POST',
                    body: data
                });
                result = await res.json();
            } catch (err) {
                const nextExtra = extraDelaySec + 1;
                sessionStorage.setItem(RETRY_KEY, String(nextExtra));
                setStatus(`Request error — reloading with +${nextExtra}s delay…`, 'warn');
                setTimeout(() => location.reload(), 2500);
                return;
            }

            if(result.status !== 'success') {
                setStatus(`Failed: ${result.data || result.message || 'unknown'}`, 'error');
                return;
            }

            sessionStorage.removeItem(RETRY_KEY);
            const {
                final,
                next_page,
                speed_token
            } = result.data;

            if(final) {
                setStatus('Redirecting!', 'success', {
                    site: host,
                    time: t.elapsed() + 's'
                });
                setTimeout(() => nh?.remove(), 3000);
                if(final.toLowerCase().startsWith('http')) window.location = final;
                else unsafeWindow.setup_special_link?.(final) ?? console.warn('[ULB/FormBypasser] setup_special_link missing for:', final);
            } else if(next_page && speed_token) {
                setStatus('Next step — continuing…', 'loading', {
                    site: host
                });
                const next = Object.assign(document.createElement('form'), {
                    method: 'POST',
                    action: next_page
                });
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
        const t = makeTimer();
        const nh = notify(`${SITE} detected — waiting…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh);

        const doFetch = async () => {
            try {
                const form = document.querySelector('#go-link');
                if(!form) throw new Error('Form #go-link not found');
                const r = await fetch('/links/go', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams(new FormData(form)),
                    credentials: 'include',
                });
                const tx = await r.text();
                let dest = null;
                try {
                    const j = JSON.parse(tx);
                    if(j.url) dest = j.url;
                    else if(j.data) dest = atob(j.data).match(/https?:\/\/[^\s"']+/)?.[0];
                } catch {
                    dest = tx.match(/https?:\/\/[^\s"']+/)?.[0];
                }
                if(!dest) throw new Error('No destination URL found in response');
                safeRedirect(dest, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('fetch failed', err);
            }
        };

        onReady(() => {
            _lnbzWaitForAppVars(vars => {
                const secs = Math.max(1, parseInt(vars?.counter_value, 10) || 7);
                nh.update(`${SITE} — redirecting in ${secs}s…`, 'loading', {
                    site: SITE
                });
                showCountdown(secs, doFetch, 'reshortfly bypass');
            }, 5000);
        });
    }

    // ── avnsgames.com interstitial ─────────────────────────────────────────

    function runAvnsGamesInterstitial() {
        const SITE = 'avnsgames.com';
        const t = makeTimer();
        const nh = notify('Interstitial page detected — waiting for redirect form…', 'loading', 0, {
            site: SITE
        });

        const trySubmit = () => {
            const f = document.getElementById('go_d2');
            if(f) {
                nh.update('Form found — submitting…', 'success', {
                    site: SITE,
                    time: t.elapsed() + 's'
                });
                setTimeout(() => nh.remove(), 1500);
                HTMLFormElement.prototype.submit.call(f);
                return true;
            }
            return false;
        };

        const init = () => {
            if(trySubmit()) return;
            pollUntil(trySubmit, 300, 100).catch(() => {
                nh.update('Interstitial form not found — unsupported page layout.', 'error');
                setTimeout(() => nh.remove(), 6000);
            });
        };
        onReady(init);
    }

    // ── lnbz.la / go.yorurl.com / go.caslinks.com / highlocus.shop ─────────

    function runLnbzLaBypasser() {
        _runLinksGoBypasser('lnbz.la', null);
    }

    function runYorurlBypasser() {
        _runLinksGoBypasser('go.yorurl.com', null);
    }

    function runCasLinksBypasser() {
        _runLinksGoBypasser(host, null);
    }

    // ── 4br.me ─────────────────────────────────────────────────────────────

    function run4BrMeBypasser() {
        _runLinksGoBypasser('4br.me', '0x4AAAAAAA9NLL_co1eXbypf');
    }

    // ── short-jambo.com / short-jambo.ink ──────────────────────────────────

    function runShortJamboDotComBypasser() {
        _runLinksGoBypasser('short-jambo.com', null);
    }

    function runShortJamboInkBypasser() {
        _runLinksGoBypasser('short-jambo.ink', null);
    }

    // ── fastcars*.com ──────────────────────────────────────────────────────

    function runFastcarsBypasser() {
        const siteLabel = host;
        const t = makeTimer();
        const nh = notify(`${siteLabel} — waiting for continue button…`, 'loading', 0, {
            site: siteLabel
        });

        const tryBypass = () => {
            const btn = document.getElementById('yuidea-btmbtn');
            if(!btn?.href) return false;
            try {
                if(typeof unsafeWindow.yuideascrolldown === 'function') unsafeWindow.yuideascrolldown();
            } catch (_) {}
            safeRedirect(btn.href, nh, {
                t,
                siteLabel
            });
            return true;
        };

        const init = () => {
            if(tryBypass()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if(tryBypass() || ++tries > 300) {
                    clearInterval(iv);
                    if(tries > 300) {
                        nh.update(`${siteLabel}: #yuidea-btmbtn not found — unsupported layout.`, 'error');
                        setTimeout(() => nh.remove(), 6000);
                    }
                }
            }, 100);
        };
        onReady(init);
    }

    // ── Scam Warning Utility ───────────────────────────────────────────────

    function showScamWarning(opts) {
        const {
            site = location.hostname,
                reason = 'This site has been flagged as malicious.',
                details = '',
                actionUrl = '',
                actionLabel = '🔒 Take Action',
                logTag = site,
        } = opts;

        try {
            unsafeWindow.fetch = () => Promise.reject(new Error('[ULB] blocked'));
        } catch (_) {}
        try {
            unsafeWindow.XMLHttpRequest.prototype.open = function () {
                console.warn(`[ULB/${logTag}] XHR blocked`);
            };
        } catch (_) {}

        const mount = () => {
            document.querySelectorAll('script, style, link, img, video, audio, iframe, canvas, svg:not(#__ulb_svg)').forEach(el => el.remove());
            if(document.body) {
                document.body.innerHTML = '';
                document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;background:#060006;';
            }

            const st = Object.assign(document.createElement('style'), {
                id: '__ulb_scam_style',
                textContent: `
                *, *::before, *::after { box-sizing: border-box; }
                @keyframes __ulb_bg_fade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes __ulb_card_in { 0% { opacity: 0; transform: scale(.92) translateY(24px); } 60% { opacity: 1; transform: scale(1.01) translateY(-3px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes __ulb_stripe_flicker { 0% { opacity: 1; } 8% { opacity: 0.4; } 12% { opacity: 1; } 20% { opacity: 0.65; } 24% { opacity: 1; } 100% { opacity: 1; } }
                @keyframes __ulb_headline_pulse { 0%,100% { color: #ff3333; } 50% { color: #ff7070; } }
                @keyframes __ulb_domain_blink { 0%,100% { border-color: #440044; } 50% { border-color: #990099; } }
                @keyframes __ulb_scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
                #__ulb_overlay { position: fixed; inset: 0; z-index: 2147483647; background: #060006; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; overflow-y: auto; animation: __ulb_bg_fade .15s ease-out forwards; }
                #__ulb_scanline { position: fixed; inset: 0; z-index: 2147483646; pointer-events: none; overflow: hidden; }
                #__ulb_scanline::after { content: ''; display: block; width: 100%; height: 80px; background: linear-gradient(to bottom, transparent, rgba(255,30,30,.07), transparent); animation: __ulb_scanline .6s ease-in .05s 1; }
                #__ulb_card { max-width: 480px; width: 100%; background: #0d000d; border: 2px solid #cc0000; border-top: 4px solid #ff2222; color: #fff; overflow: hidden; opacity: 0; animation: __ulb_card_in .4s cubic-bezier(.22,.68,0,1.1) .1s forwards; }
                #__ulb_stripe { animation: __ulb_stripe_flicker 1s ease-out .15s 1; }
                #__ulb_headline { animation: __ulb_headline_pulse 2.5s ease-in-out .5s infinite; }
                #__ulb_domain { animation: __ulb_domain_blink 2s ease-in-out 1s infinite; }
                #__ulb_back_btn, #__ulb_action_btn { transition: all .15s; }
                #__ulb_back_btn:hover { background: rgba(255,255,255,.06) !important; color: #aaa !important; border-color: #550055 !important; }
                #__ulb_action_btn:hover { background: #4752c4 !important; }
                `,
            });
            (document.head || document.documentElement).appendChild(st);

            const scanline = Object.assign(document.createElement('div'), {
                id: '__ulb_scanline'
            });
            document.documentElement.appendChild(scanline);

            const overlay = Object.assign(document.createElement('div'), {
                id: '__ulb_overlay'
            });
            const card = Object.assign(document.createElement('div'), {
                id: '__ulb_card'
            });

            const stripe = Object.assign(document.createElement('div'), {
                id: '__ulb_stripe'
            });
            Object.assign(stripe.style, {
                background: '#ff2222',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            });
            const stripeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            stripeIcon.setAttribute('width', '16');
            stripeIcon.setAttribute('height', '16');
            stripeIcon.setAttribute('viewBox', '0 0 16 16');
            stripeIcon.setAttribute('fill', 'none');
            stripeIcon.innerHTML = '<path d="M8 1L1 14h14L8 1z" fill="#fff"/><path d="M8 6v4M8 11v1.5" stroke="#cc0000" stroke-width="1.5" stroke-linecap="round"/>';
            const stripeText = Object.assign(document.createElement('span'), {
                textContent: 'Security Warning — Unknown Link Bypasser'
            });
            Object.assign(stripeText.style, {
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#fff'
            });
            stripe.append(stripeIcon, stripeText);

            const body = document.createElement('div');
            Object.assign(body.style, {
                padding: '24px 22px 20px'
            });

            const headline = Object.assign(document.createElement('div'), {
                id: '__ulb_headline',
                textContent: 'SCAM DETECTED'
            });
            Object.assign(headline.style, {
                fontSize: '22px',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#ff3333',
                marginBottom: '4px',
                lineHeight: '1.1'
            });

            const subline = Object.assign(document.createElement('div'), {
                textContent: 'Do not proceed — this site is dangerous'
            });
            Object.assign(subline.style, {
                fontSize: '12px',
                color: '#666',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '18px',
                borderBottom: '1px solid #1e001e',
                paddingBottom: '14px'
            });

            const domainBox = Object.assign(document.createElement('div'), {
                id: '__ulb_domain'
            });
            Object.assign(domainBox.style, {
                background: '#180018',
                border: '1px solid #440044',
                padding: '10px 14px',
                marginBottom: '14px'
            });
            const domainText = Object.assign(document.createElement('span'), {
                textContent: site
            });
            Object.assign(domainText.style, {
                fontSize: '13px',
                color: '#ff9999',
                fontFamily: 'monospace',
                fontWeight: '600',
                letterSpacing: '0.5px'
            });
            domainBox.appendChild(domainText);

            const reasonBox = document.createElement('div');
            Object.assign(reasonBox.style, {
                background: '#1a0000',
                borderLeft: '3px solid #ff2222',
                padding: '12px 14px',
                marginBottom: '10px',
                fontSize: '13px',
                color: '#ffaaaa',
                fontWeight: '700',
                lineHeight: '1.5'
            });
            reasonBox.textContent = reason;

            let detailsEl = null;
            if(details) {
                detailsEl = Object.assign(document.createElement('div'), {
                    textContent: details
                });
                Object.assign(detailsEl.style, {
                    fontSize: '12px',
                    color: '#556',
                    lineHeight: '1.75',
                    marginBottom: '20px',
                    padding: '10px 12px',
                    background: '#0a000a',
                    border: '1px solid #1a001a'
                });
            }

            const divider = document.createElement('div');
            Object.assign(divider.style, {
                borderTop: '1px solid #1e001e',
                margin: '0 0 16px'
            });

            let actionBtn = null;
            if(actionUrl) {
                actionBtn = Object.assign(document.createElement('a'), {
                    id: '__ulb_action_btn',
                    href: actionUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    textContent: actionLabel
                });
                Object.assign(actionBtn.style, {
                    display: 'block',
                    background: '#5865f2',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textDecoration: 'none',
                    padding: '11px 20px',
                    marginBottom: '8px',
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                    border: '1px solid #4752c4',
                    cursor: 'pointer'
                });
            }

            const backBtn = Object.assign(document.createElement('button'), {
                id: '__ulb_back_btn',
                textContent: '← Go Back to Safety'
            });
            Object.assign(backBtn.style, {
                background: 'transparent',
                border: '1px solid #2a002a',
                color: '#666',
                fontSize: '12px',
                fontWeight: '600',
                padding: '9px 22px',
                cursor: 'pointer',
                width: '100%',
                letterSpacing: '1px',
                textTransform: 'uppercase'
            });
            backBtn.addEventListener('click', () => {
                window.location.href = 'https://www.google.com';
            });

            body.append(headline, subline, domainBox, reasonBox);
            if(detailsEl) body.appendChild(detailsEl);
            body.append(divider);
            if(actionBtn) body.appendChild(actionBtn);
            body.appendChild(backBtn);

            const footer = Object.assign(document.createElement('div'), {
                textContent: 'Unknown Link Bypasser · @Aro Moon — Scam Protection'
            });
            Object.assign(footer.style, {
                background: '#080008',
                borderTop: '1px solid #1a001a',
                padding: '8px 22px',
                fontSize: '10px',
                color: '#2a002a',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
            });

            card.append(stripe, body, footer);
            overlay.appendChild(card);
            document.documentElement.appendChild(overlay);
            try {
                document.body.style.overflow = 'hidden';
            } catch (_) {}
            console.warn(`[ULB/ScamWarning] Blocked: ${site} — ${reason}`);
        };

        if(document.body) mount();
        else document.addEventListener('DOMContentLoaded', mount, {
            once: true
        });
    }

    // ── bloxscript.live ────────────────────────────────────────────────────

    function runBloxscriptScamWarning() {
        showScamWarning({
            site: 'bloxscript.live',
            reason: 'This site steals your Discord token.',
            details: 'A Discord token is a permanent credential that bypasses 2FA, giving ' +
                'attackers full access to your account, DMs, servers, and Nitro. ' +
                'If you have already interacted with this site, change your Discord ' +
                'password immediately to invalidate your token.',
            actionUrl: 'https://discord.com/login',
            actionLabel: '🔒 Change My Discord Password',
        });
    }

    // ── jankariweb / newsuchnaonline / bigcarinsurance ─────────────────────

    function runJoberBypasser() {
        document.cookie = "adcadg=1; path=/; max-age=600";
        document.cookie = "_uocat=value; path=/; max-age=86400";

        const SITE = host.replace(/^www\./, '');
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        // ── Helper: detect which step we're on (e.g. "1/3", "3/3") ──────────
        const getStepInfo = () => {
            const danger = document.querySelector('strong .text-danger, strong span.text-danger');
            if(!danger) return null;
            const m = danger.textContent.trim().match(/^(\d+)\/(\d+)$/);
            if(!m) return null;
            return {
                current: parseInt(m[1], 10),
                total: parseInt(m[2], 10)
            };
        };

        // ── Helper: check for the "aro link" Get Link anchor ─────────────────
        const getAroLink = () => {
            const a = document.getElementById('link1s');
            return (a && a.href) ? a.href : null;
        };

        // ── Helper: check for the ad/countdown page (googletag + startCountdownBtn) ─
        const isAdCountdownPage = () =>
            !!document.getElementById('startCountdownBtn') &&
            !!document.getElementById('link1s-wait1');

        // ── Main logic ────────────────────────────────────────────────────────
        const run = () => {

            // Priority 0: if there's a direct "Get Link" aro anchor, just redirect
            const aroHref = getAroLink();
            if(aroHref) {
                console.log('[ULB/jober] Detected aro Get Link — redirecting:', aroHref);
                nh.update(`${SITE} — link found, redirecting…`, 'loading', {
                    site: SITE
                });
                safeRedirect(aroHref, nh, {
                    t,
                    siteLabel: SITE
                });
                return;
            }

            // Priority 1: ad/countdown page (googletag + startCountdownBtn)
            if(isAdCountdownPage()) {
                console.log('[ULB/jober] Detected ad countdown page — running timer bypass');
                nh.update(`${SITE} — bypassing ad countdown…`, 'loading', {
                    site: SITE
                });
                count = -1;
                timer();
                // After the timer, wait for either #cross-snp2 or #btn7 to become visible
                const check = setInterval(() => {
                    const btn = document.getElementById('cross-snp2');
                    if(btn && btn.offsetParent !== null) {
                        clearInterval(check);
                        nh.update(`${SITE} — clicking continue…`, 'loading', {
                            site: SITE
                        });
                        btn.click();
                        return;
                    }
                    const btn7 = document.getElementById('btn7');
                    if(btn7 && btn7.offsetParent !== null) {
                        clearInterval(check);
                        nh.update(`${SITE} — clicking continue…`, 'loading', {
                            site: SITE
                        });
                        btn7.click();
                        return;
                    }
                }, 500);
                setTimeout(() => clearInterval(check), 60000);
                return;
            }

            // Priority 2: step page detection
            const step = getStepInfo();
            if(step) {
                // After timer runs, click whichever continue button appears
                const waitAndClickContinue = () => {
                    const check = setInterval(() => {
                        const btn = document.getElementById('cross-snp2');
                        if(btn && btn.offsetParent !== null) {
                            clearInterval(check);
                            nh.update(`${SITE} — step ${step.current}/${step.total} — clicking continue…`, 'loading', {
                                site: SITE
                            });
                            btn.click();
                            return;
                        }
                        const btn7 = document.getElementById('btn7');
                        if(btn7 && btn7.offsetParent !== null) {
                            clearInterval(check);
                            nh.update(`${SITE} — step ${step.current}/${step.total} — clicking continue…`, 'loading', {
                                site: SITE
                            });
                            btn7.click();
                            return;
                        }
                    }, 500);
                    setTimeout(() => clearInterval(check), 60000);
                };
                if(step.current === step.total) {
                    // Last step — wait 33s then run timer bypass
                    console.log(`[ULB/jober] Step ${step.current}/${step.total} (last) — waiting 33s then bypassing`);
                    nh.update(`${SITE} — step ${step.current}/${step.total} (last) — waiting 33s…`, 'loading', {
                        site: SITE
                    });
                    setTimeout(() => {
                        nh.update(`${SITE} — step ${step.current}/${step.total} — bypassing…`, 'loading', {
                            site: SITE
                        });
                        count = -1;
                        timer();
                        waitAndClickContinue();
                    }, 33000);
                } else {
                    // Any earlier step (e.g. 1/3, 2/3) — run timer bypass immediately
                    console.log(`[ULB/jober] Step ${step.current}/${step.total} — running timer bypass immediately`);
                    nh.update(`${SITE} — step ${step.current}/${step.total} — bypassing…`, 'loading', {
                        site: SITE
                    });
                    count = -1;
                    timer();
                    waitAndClickContinue();
                }
                return;
            }

            // Fallback: original click-based advance
            const hasNextBtn = typeof nextbtn === 'function';
            const tryAdvance = () => {
                if(hasNextBtn) {
                    nextbtn();
                    return true;
                }
                const btn = document.getElementById('cross-snp2');
                if(btn && btn.offsetParent !== null) {
                    btn.click();
                    return true;
                }
                window.location.href = '/readmore';
                return true;
            };

            const hasCountdown = !!document.getElementById('link1s-time');
            const isStepPage = path !== '/';

            if(isStepPage) {
                nh.update(`${SITE} — step 2 — waiting for button…`, 'loading', {
                    site: SITE
                });
                clickWhenReady('btn7', `${SITE} step 2`);
            } else {
                nh.update(`${SITE} — step 1 — clicking not-a-robot…`, 'loading', {
                    site: SITE
                });
                clickWhenReady('notarobot', `${SITE} step 1`);
            }

            if(hasCountdown) {
                const check = setInterval(() => {
                    const btn = document.getElementById('cross-snp2');
                    if(btn && btn.offsetParent !== null) {
                        clearInterval(check);
                        nh.update(`${SITE} — advancing…`, 'loading', {
                            site: SITE
                        });
                        tryAdvance();
                    }
                }, 500);
                setTimeout(() => clearInterval(check), 30000);
            } else {
                setTimeout(() => {
                    nh.update(`${SITE} — advancing…`, 'loading', {
                        site: SITE
                    });
                    tryAdvance();
                }, 500);
            }
        };

        onReady(run);
    }

    // ── apnahirework.com ────────────────────────────────────────────────────
    // Three variants can appear on this domain:
    //   A) #tp-snp2 Continue button          → click directly
    //   B) startCountdownBtn ad countdown    → bypass timer → #cross-snp2 or #btn7
    //   C) step counter div#stick (1/N etc.) → bypass timer → wait for #btn7

    function runApnahireworkBypasser() {
        const SITE = 'apnahirework.com';
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const waitForContinue = (label) => {
            const check = setInterval(() => {
                const cross = document.getElementById('cross-snp2');
                if(cross && cross.offsetParent !== null) {
                    clearInterval(check);
                    nh.update(`${SITE} — ${label} — clicking Continue…`, 'loading', {
                        site: SITE
                    });
                    cross.click();
                    return;
                }
                const b7 = document.getElementById('btn7');
                if(b7 && b7.offsetParent !== null) {
                    clearInterval(check);
                    nh.update(`${SITE} — ${label} — clicking Continue…`, 'loading', {
                        site: SITE
                    });
                    b7.click();
                }
            }, 500);
            setTimeout(() => clearInterval(check), 60000);
        };

        const run = () => {
            // Variant A: #tp-snp2 "Continue" link button — direct click
            const tpBtn = document.getElementById('tp-snp2');
            if(tpBtn) {
                nh.update(`${SITE} — clicking Continue…`, 'loading', {
                    site: SITE
                });
                safeRedirect(tpBtn.href || tpBtn.getAttribute('href'), nh, {
                    t,
                    siteLabel: SITE
                });
                if(!tpBtn.href) tpBtn.click();
                return;
            }

            // Variant B: startCountdownBtn ad-countdown page
            if(document.getElementById('startCountdownBtn')) {
                nh.update(`${SITE} — bypassing ad countdown…`, 'loading', {
                    site: SITE
                });
                count = -1;
                timer();
                waitForContinue('countdown');
                return;
            }

            // Variant C: step counter (div#stick / span.text-danger)
            const stepDanger = document.querySelector('strong .text-danger, strong span.text-danger');
            if(stepDanger) {
                const m = stepDanger.textContent.trim().match(/^(\d+)\/(\d+)$/);
                if(m) {
                    const step = {
                        current: parseInt(m[1], 10),
                        total: parseInt(m[2], 10)
                    };
                    nh.update(`${SITE} — step ${step.current}/${step.total} — bypassing…`, 'loading', {
                        site: SITE
                    });
                    count = -1;
                    timer();
                    waitForContinue(`step ${step.current}/${step.total}`);
                    return;
                }
            }

            handleError('unrecognised page layout', null);
        };

        onReady(run);
    }

    // ── crimejasoos.in ──────────────────────────────────────────────────────
    // Same three variants as apnahirework (it is the same platform), but
    // btn7 may carry a full URL (chart 1) or relative /readmore (chart 2).
    // Clicking the element works either way.

    function runCrimejasoosBypasser() {
        const SITE = 'crimejasoos.in';
        const STEP_WAIT_SEC = 35;
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const waitForContinue = (label) => {
            const check = setInterval(() => {
                const cross = document.getElementById('cross-snp2');
                if(cross && cross.offsetParent !== null) {
                    clearInterval(check);
                    nh.update(`${SITE} — ${label} — clicking Continue…`, 'loading', {
                        site: SITE
                    });
                    cross.click();
                    return;
                }
                const b7 = document.getElementById('btn7');
                if(b7 && b7.offsetParent !== null) {
                    clearInterval(check);
                    nh.update(`${SITE} — ${label} — clicking Continue…`, 'loading', {
                        site: SITE
                    });
                    b7.click();
                }
            }, 500);
            setTimeout(() => clearInterval(check), 60000);
        };

        const run = () => {
            // Variant A: #tp-snp2 "Continue" link button — direct
            const tpBtn = document.getElementById('tp-snp2');
            if(tpBtn) {
                nh.update(`${SITE} — clicking Continue…`, 'loading', {
                    site: SITE
                });
                if(tpBtn.href) safeRedirect(tpBtn.href, nh, {
                    t,
                    siteLabel: SITE
                });
                else tpBtn.click();
                return;
            }

            // Variant B: startCountdownBtn ad-countdown page
            if(document.getElementById('startCountdownBtn')) {
                nh.update(`${SITE} — bypassing ad countdown…`, 'loading', {
                    site: SITE
                });
                count = -1;
                timer();
                waitForContinue('countdown');
                return;
            }

            // Variant C: step counter (div#stick / span.text-danger)
            // Every step now waits 15 s with a visible countdown before bypassing.
            const stepDanger = document.querySelector('strong .text-danger, strong span.text-danger');
            if(stepDanger) {
                const m = stepDanger.textContent.trim().match(/^(\d+)\/(\d+)$/);
                if(m) {
                    const step = {
                        current: parseInt(m[1], 10),
                        total: parseInt(m[2], 10)
                    };
                    const label = `step ${step.current}/${step.total}`;
                    const isLast = step.current === step.total;
                    const subtitle = isLast ?
                        `crimejasoos.in — ${label} (last)` :
                        `crimejasoos.in — ${label}`;
                    nh.update(`${SITE} — ${label}${isLast ? ' (last)' : ''} — waiting ${STEP_WAIT_SEC}s…`, 'loading', {
                        site: SITE
                    });
                    // Spoof document.visibilityState as hidden before countdown so
                    // the page's ad timer thinks the tab is backgrounded.
                    const _cjVisDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
                    Object.defineProperty(document, 'visibilityState', {
                        get: () => 'hidden',
                        configurable: true
                    });
                    document.dispatchEvent(new Event('visibilitychange'));
                    showCountdown(STEP_WAIT_SEC, () => {
                        // Restore real visibilityState once countdown is over.
                        delete document.visibilityState;
                        if(_cjVisDesc) Object.defineProperty(Document.prototype, 'visibilityState', _cjVisDesc);
                        document.dispatchEvent(new Event('visibilitychange'));
                        nh.update(`${SITE} — ${label} — bypassing…`, 'loading', {
                            site: SITE
                        });
                        count = -1;
                        timer();
                        waitForContinue(label);
                    }, subtitle);
                    return;
                }
            }

            handleError('unrecognised page layout', null);
        };

        onReady(run);
    }

    // ── newsuchnaonline.com ─────────────────────────────────────────────────
    // Two variants:
    //   A) #notarobot button (enableBtn flow) — click it, then wait for #btn7
    //   B) #getlink button  (getlink() flow)  — click it, then wait for #btn7
    //      #btn7 carries href to jober.factwiz.online — click to navigate there

    function runNewsuchnaonlineBypasser() {
        const SITE = 'newsuchnaonline.com';
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const waitForBtn7 = (label) => {
            const check = setInterval(() => {
                const b7 = document.getElementById('btn7');
                // btn7 starts hidden (display:none) — wait until it becomes visible
                if(b7 && getComputedStyle(b7).display !== 'none' && b7.offsetParent !== null) {
                    clearInterval(check);
                    nh.update(`${SITE} — ${label} — navigating to next step…`, 'loading', {
                        site: SITE
                    });
                    b7.click();
                }
            }, 300);
            setTimeout(() => clearInterval(check), 30000);
        };

        const run = () => {
            // Variant B: #getlink button (dual-tap style)
            // Use count = -1; timer() so the get-link button appears instantly
            const getlinkBtn = document.getElementById('getlink');
            if(getlinkBtn) {
                nh.update(`${SITE} — clicking Get Link…`, 'loading', {
                    site: SITE
                });
                count = -1;
                timer();
                getlinkBtn.click();
                waitForBtn7('get-link');
                return;
            }

            // Variant A: #notarobot verify button
            const notarobot = document.getElementById('notarobot');
            if(notarobot) {
                nh.update(`${SITE} — clicking verify…`, 'loading', {
                    site: SITE
                });
                notarobot.click();
                waitForBtn7('notarobot');
                return;
            }

            handleError('unrecognised layout', null);
        };

        onReady(run);
    }

    // ── jober.factwiz.online ────────────────────────────────────────────────
    // Intermediate landing page in the phantomfluxkey chain.
    // The #ca anchor wraps a continue image and its href points to
    // go.yorurl.com — extract and redirect immediately.

    function runJoberFacwizBypasser() {
        const SITE = 'jober.factwiz.online';
        const t = makeTimer();
        const nh = notify(`${SITE} — reading page delay…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const init = () => {
            // Mirror the snippet: scan all inline scripts for the page's own
            // setTimeout delay so we wait for the tp= cookie to be written.
            const allScriptText = [...document.scripts]
                .map(s => s.textContent)
                .join('');
            const delayMatch = allScriptText.match(/setTimeout\([^,]+,\s*(\d+)\)/);
            const delay = delayMatch ? +delayMatch[1] : 0;

            nh.update(`${SITE} — waiting ${delay}ms for cookie…`, 'loading', {
                site: SITE
            });

            // Spoof document.visibilityState as hidden while waiting for the tp= cookie
            // so the page's ad/timer logic thinks the tab is backgrounded.
            const _jbVisDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
            Object.defineProperty(document, 'visibilityState', {
                get: () => 'hidden',
                configurable: true
            });
            document.dispatchEvent(new Event('visibilitychange'));

            setTimeout(() => {
                // Restore real visibilityState before reading the cookie.
                delete document.visibilityState;
                if(_jbVisDesc) Object.defineProperty(Document.prototype, 'visibilityState', _jbVisDesc);
                document.dispatchEvent(new Event('visibilitychange'));
                try {
                    const cookie = document.cookie
                        .split(';')
                        .map(c => c.trim())
                        .find(c => c.startsWith('tp='));

                    const value = cookie ? cookie.split('=')[1] : '';

                    if(!value) {
                        handleError('#tp cookie not found after delay', null);
                        return;
                    }

                    const finalUrl = 'https://go.yorurl.com/' + value;
                    safeRedirect(finalUrl, nh, {
                        t,
                        siteLabel: SITE
                    });
                } catch (err) {
                    handleError('bypass failed', err);
                }
            }, delay);
        };

        // Wait for full page load so all inline scripts are present before scanning.
        if(document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init, {
                once: true
            });
        }
    }

    // ── how2guidess.com ────────────────────────────────────────────────────

    function runHow2GuidesBypasser() {
        const SITE = 'how2guidess.com';

        const waitAndClick = (id, afterMs, afterFn) => {
            pollUntil(() => {
                    const el = document.getElementById(id);
                    if(!el) return false;
                    el.click();
                    return true;
                }, 200, 150)
                .then(() => {
                    notify(`how2guidess — clicked #${id}`, 'info', 2000, {
                        site: SITE
                    });
                    if(afterFn) setTimeout(afterFn, afterMs);
                })
                .catch(() => {
                    notify(`${SITE}: #${id} not found — unsupported layout.`, 'error', 6000, {
                        site: SITE
                    });
                });
        };

        const run = () => {
            const t = makeTimer();
            const nh = notify(`${SITE} — bypassing…`, 'loading', 0, {
                site: SITE
            });
            waitAndClick('gi', 500, () => {
                nh.update('Step 1 done…', 'loading', {
                    site: SITE
                });
                waitAndClick('ci', 0, () => {
                    nh.update('Done!', 'success', {
                        site: SITE,
                        time: t.elapsed() + 's'
                    });
                    setTimeout(() => nh.remove(), 2000);
                });
            });
        };
        onReady(run);
    }

    // ── link-unlock.com ────────────────────────────────────────────────────

    function runLinkUnlockBypasser() {
        const SITE = 'link-unlock.com';
        const t = makeTimer();
        const nh = notify(`${SITE} — bypassing…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const slug = new URL(location.href).pathname.split('/').filter(Boolean)[0];
        if(!slug) {
            handleError('could not read slug from URL', null);
            return;
        }

        (async () => {
            try {
                nh.update(`${SITE} — fetching steps…`, 'loading', {
                    site: SITE
                });
                const d1 = await fetchJSON(`https://api.link-unlock.com/u/${slug}`);
                const steps = d1?.unlock?.steps?.map(s => s.id);
                if(!steps?.length) throw new Error('No steps found in API response');

                nh.update(`${SITE} — completing steps…`, 'loading', {
                    site: SITE
                });
                const d2 = await fetchJSON(`https://api.link-unlock.com/u/${slug}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        steps
                    }),
                });
                if(!d2?.destinationUrl) throw new Error('No destinationUrl in response');

                safeRedirect(d2.destinationUrl, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('bypass failed', err);
            }
        })();
    }

    // ── link4sub.com ───────────────────────────────────────────────────────

    function runLink4SubBypasser() {
        notify('link4sub.com — following redirect to tapvietcode.com…', 'info', undefined, {
            site: 'link4sub.com'
        });
    }

    // ── tapvietcode.com ────────────────────────────────────────────────────

    function runTapVietCodeBypasser() {
        const SITE = 'tapvietcode.com';

        if(host.includes('blog.tapvietcode.com')) {
            const t = makeTimer();
            const nh = notify(`${SITE} — waiting for continue button…`, 'loading', 0, {
                site: SITE
            });

            const tryClick = () => {
                const btn = document.getElementById('continueBtn');
                if(!btn) return false;
                if(!btn.href) {
                    nh.update(`${SITE}: continueBtn has no href.`, 'error');
                    setTimeout(() => nh.remove(), 6000);
                    return true;
                }
                safeRedirect(btn.href, nh, {
                    t,
                    siteLabel: SITE
                });
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
            const t = makeTimer();
            const nh = notify(`${SITE} — reading destination from storage…`, 'loading', 0, {
                site: SITE
            });

            const tryStorage = () => {
                try {
                    for(let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        const v = localStorage.getItem(k);
                        if(!v?.includes('"lnk1"')) continue;
                        try {
                            const j = JSON.parse(v);
                            const u = j?.data?.lnk?.lnk1?.url || j?.lnk?.lnk1?.url;
                            if(u) {
                                safeRedirect(u, nh, {
                                    t,
                                    siteLabel: SITE
                                });
                                return true;
                            }
                        } catch (_) {}
                    }
                } catch (e) {
                    console.error('[ULB/tapvietcode] localStorage read failed', e);
                }
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
        const t = makeTimer();
        const nh = notify(`${SITE} — solving captcha…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const getGpSiteKey = () => {
            const iframe = document.querySelector('iframe[src*="challenges.cloudflare.com"]');
            if(iframe) {
                const m = iframe.getAttribute('src').match(/\/([0-9a-zA-Z_\-]{20,})\//);
                if(m) return m[1];
            }
            return getSiteKey();
        };

        const init = async () => {
            let btn;
            try {
                btn = await waitForEl('#captchaButton', 200, 15_000);
            } catch (e) {
                handleError('captchaButton not found', e);
                return;
            }

            const existingHref = btn.getAttribute('href');
            if(existingHref && existingHref !== '#' && !existingHref.startsWith('javascript')) {
                safeRedirect(existingHref, nh, {
                    t,
                    siteLabel: SITE
                });
                return;
            }

            const sitekey = getGpSiteKey();
            if(!sitekey) {
                handleError('could not find Turnstile sitekey', null);
                return;
            }

            let token;
            try {
                token = await solveTurnstile(sitekey);
            } catch (e) {
                handleError('Turnstile solve failed', e);
                return;
            }

            let tsInput = document.querySelector('[name="cf-turnstile-response"]');
            if(!tsInput) {
                tsInput = Object.assign(document.createElement('input'), {
                    type: 'hidden',
                    name: 'cf-turnstile-response'
                });
                document.body.appendChild(tsInput);
            }
            tsInput.value = token;

            const cbName = document.querySelector('[data-callback]')?.dataset?.callback;
            if(cbName) {
                try {
                    if(typeof unsafeWindow[cbName] === 'function') unsafeWindow[cbName](token);
                } catch (_) {}
            }

            nh.update(`${SITE} — waiting for link…`, 'loading', {
                site: SITE
            });
            pollUntil(() => {
                    const href = btn.getAttribute('href');
                    return href && href !== '#' && !href.startsWith('javascript') && href.startsWith('http') ? href : false;
                }, 200, 150)
                .then(href => safeRedirect(href, nh, {
                    t,
                    siteLabel: SITE
                }))
                .catch(() => handleError('link did not appear after captcha solve — unsupported layout', null));
        };

        onReady(init);
    }

    // ── powergam.online ────────────────────────────────────────────────────

    function runPowergamBypasser() {
        const SITE = 'powergam.online';
        const REQUIRED = ['imps', 'lid', 'pages', 'pid', 'step_count', 'vid'];
        const t = makeTimer();

        const getCookies = () => Object.fromEntries(
            document.cookie.split('; ').filter(Boolean).map(c => c.split('=').map(decodeURIComponent))
        );

        const handleError = makeErrHandler(SITE, null, 7000);

        const runSteps = async (cookies, pages, finalURL) => {
            const ref = window.location.origin;
            for(let s = 1; s <= pages; s++) {
                const nh2 = notify(`${SITE} — posting step ${s}/${pages}…`, 'loading', 0, {
                    site: SITE,
                    time: t.elapsed() + 's'
                });
                const body = new URLSearchParams({
                    ad_impressions: 2,
                    form_name: 'ads-track-data',
                    next_target: s === pages ? finalURL : ref,
                    step_id: String(s),
                    visitor_id: cookies.vid,
                });
                try {
                    await fetch(`${ref}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Referer: `${ref}/`
                        },
                        credentials: 'include',
                        body: body.toString(),
                    });
                } catch (e) {
                    console.warn(`[ULB/${SITE}] POST failed at step ${s}`, e);
                }
                nh2.remove();
                if(s < pages) await sleep(1200);
            }
            notify(`${SITE} — redirecting…`, 'success', 2000, {
                site: SITE,
                time: t.elapsed() + 's'
            });
            if(safeUrl(finalURL)) location.href = finalURL;
            else handleError('invalid final URL', null);
        };

        let executed = false;
        const waiter = setInterval(() => {
            if(executed) return;
            const cookies = getCookies();
            if(!REQUIRED.every(k => k in cookies)) return;
            executed = true;
            clearInterval(waiter);

            const pages = parseInt(cookies.pages, 10);
            if(!pages || pages < 1) {
                handleError('invalid pages cookie', null);
                return;
            }

            const finalURL = `https://gplinks.co/${cookies.lid}?pid=${cookies.pid}&vid=${cookies.vid}`;
            const delaySecs = pages * 30;

            notify(`${SITE} — ${pages} step${pages > 1 ? 's' : ''} detected, waiting ${delaySecs}s…`, 'info', 4000, {
                site: SITE
            });
            showCountdown(delaySecs, () => runSteps(cookies, pages, finalURL), `powergam — ${pages} page${pages > 1 ? 's' : ''}`);
        }, 500);
    }

    // ── rojgarhindi.in ─────────────────────────────────────────────────────

    function runRojgarhindiBypasser() {
        const SITE = 'rojgarhindi.in';
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page type…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh);

        const tryBypass = () => {
            const btn = document.getElementById('btn6');
            if(btn?.href && safeUrl(btn.href)) {
                safeRedirect(btn.href, nh, {
                    t,
                    siteLabel: SITE
                });
                return true;
            }
            const form = [...document.forms].find(f => /^tp\d*$/i.test(f.name || '') && f.name !== 'search-form');
            if(form) {
                nh.update(`${SITE} — submitting form…`, 'success', {
                    site: SITE,
                    time: t.elapsed() + 's'
                });
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
        const t = makeTimer();
        const handleError = (label, err) => {
            console.error(`[ULB/${SITE}] ${label}`, err ?? '');
            notify(`${SITE}: ${label}${err?.message ? ` — ${err.message}` : ''}`, 'error', 7000, {
                site: SITE
            });
        };

        const runCaptchaPage = async () => {
            const nh = notify(`${SITE} — solving captcha…`, 'loading', 0, {
                site: SITE
            });
            const sitekey = document.querySelector('.cf-turnstile[data-sitekey]')?.dataset?.sitekey || '0x4AAAAAAA-1YLZYLRnN8eBX';

            let token;
            try {
                token = await solveTurnstile(sitekey);
            } catch (e) {
                nh.remove();
                handleError('captcha solve failed', e);
                return;
            }

            const hiddenInput = document.querySelector('[name="cf-turnstile-response"]');
            if(hiddenInput) hiddenInput.value = token;

            const cbName = document.querySelector('.cf-turnstile')?.dataset?.callback;
            if(cbName) {
                try {
                    if(typeof unsafeWindow[cbName] === 'function') unsafeWindow[cbName](token);
                } catch (_) {}
            }

            const form = document.querySelector('form');
            if(form) {
                try {
                    HTMLFormElement.prototype.submit.call(form);
                } catch (_) {}
            }

            nh.update(`${SITE} — captcha done, waiting for redirect…`, 'success', {
                site: SITE,
                time: t.elapsed() + 's'
            });
            setTimeout(() => nh.remove(), 3000);
        };

        const runLinkPage = async () => {
            const nh = notify(`${SITE} — fetching token…`, 'loading', 0, {
                site: SITE
            });

            const scrapeVar = name => {
                for(const s of document.querySelectorAll('script:not([src])')) {
                    const m = s.textContent.match(new RegExp(`\\b${name}\\s*=\\s*'([^']+)'`));
                    if(m) return m[1];
                }
                return '';
            };
            const _a = unsafeWindow._a || scrapeVar('_a');
            const _t = unsafeWindow._t || scrapeVar('_t');
            const _d = unsafeWindow._d || scrapeVar('_d');
            const alias = location.pathname.split('/').filter(Boolean).pop() || '';
            const csrf = unsafeWindow?.app?.csrf ?? document.querySelector('[name="csrf"]')?.value ?? '';

            try {
                nh.update(`${SITE} — getting tk…`, 'loading', {
                    site: SITE
                });
                const tkResp = await fetchJSON('/get/tk', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    body: new URLSearchParams({
                        _a,
                        _t,
                        _d
                    }),
                });

                if(!tkResp.status) {
                    nh.remove();
                    handleError('tk request failed', null);
                    console.log('[ULB/aylink] tk resp:', tkResp);
                    return;
                }

                nh.update(`${SITE} — fetching destination…`, 'loading', {
                    site: SITE
                });
                const goResp = await fetchJSON('/links/go2', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    body: new URLSearchParams({
                        alias,
                        csrf,
                        tkn: tkResp.th
                    }),
                });

                if(!goResp.url) {
                    nh.remove();
                    handleError('no URL in go2 response', null);
                    console.log('[ULB/aylink] go2 resp:', goResp);
                    return;
                }
                safeRedirect(goResp.url, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                nh.remove();
                handleError('bypass failed', err);
            }
        };

        const isCaptchaPage = () => !!document.querySelector('.cf-turnstile[data-sitekey]');
        const init = () => {
            if(isCaptchaPage()) runCaptchaPage();
            else setTimeout(runLinkPage, 1000);
        };
        onReady(init);
    }

    // ── ytsubme.com ────────────────────────────────────────────────────────

    function runYtSubMeBypasser() {
        const SITE = 'ytsubme.com';
        const t = makeTimer();

        const isTarget = url => typeof url === 'string' && (url.includes('s2u_links.php') || url.includes('s2uGetLink'));

        let _handled = false;
        const handleData = data => {
            if(_handled) return;
            const url = data?.return_url || data?.msg?.target;
            if(!url) {
                console.warn('[ULB/ytsubme] no return_url in response:', data);
                notify(`${SITE}: no return_url in API response`, 'error', 7000, {
                    site: SITE
                });
                return;
            }
            _handled = true;
            const nh = notify(`${SITE} — redirecting…`, 'success', {
                site: SITE,
                time: t.elapsed() + 's'
            });
            setTimeout(() => nh.remove(), CONFIG.autoDismissOnRedirect ? 500 : 2000);
            location.href = url;
        };

        const _origFetch = unsafeWindow.fetch;
        unsafeWindow.fetch = function (input, init) {
            const url = typeof input === 'string' ? input : input?.url;
            const promise = _origFetch.apply(this, arguments);
            if(isTarget(url)) {
                promise.then(r => r.clone().json()).then(handleData).catch(e => console.warn('[ULB/ytsubme] fetch intercept parse error:', e));
            }
            return promise;
        };

        const _OrigXHR = unsafeWindow.XMLHttpRequest;

        function PatchedXHR() {
            const xhr = new _OrigXHR();
            const _open = xhr.open.bind(xhr);
            let _targeted = false;
            xhr.open = function (method, url, ...rest) {
                if(isTarget(url)) _targeted = true;
                return _open(method, url, ...rest);
            };
            xhr.addEventListener('load', () => {
                if(!_targeted) return;
                try {
                    handleData(JSON.parse(xhr.responseText));
                } catch (e) {
                    console.warn('[ULB/ytsubme] XHR intercept parse error:', e);
                }
            });
            return xhr;
        }
        PatchedXHR.prototype = _OrigXHR.prototype;
        unsafeWindow.XMLHttpRequest = PatchedXHR;
    }

    // ── sub4unlock.co ──────────────────────────────────────────────────────

    function runSub4UnlockBypasser() {
        const SITE = 'sub4unlock.co';
        const t = makeTimer();
        const nh = notify(`${SITE} — reading destination…`, 'loading', 0, {
            site: SITE
        });

        const tryRedirect = () => {
            try {
                const url = JSON.parse(document.querySelector('#app')?.dataset.page || '{}')?.props?.link?.url;
                if(url) {
                    safeRedirect(url, nh, {
                        t,
                        siteLabel: SITE
                    });
                    return true;
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

    // ── app.khaddavi.net ───────────────────────────────────────────────────

    function runKhaddaviBypasser() {
        const SITE = 'app.khaddavi.net';
        const t = makeTimer();
        const nh = notify(`${SITE} — bypassing…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        (async () => {
            try {
                const k = Math.floor(Math.random() * 1e3);
                const r = Math.random().toString(16).slice(2);

                await fetch('/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _a: 0
                    })
                });

                nh.update(`${SITE} — fetching link…`, 'loading', {
                    site: SITE
                });
                const d = await fetchJSON('/api/go', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Idempotency-Key': r,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        key: k,
                        size: `${(window.innerWidth + k) * 2}.${(window.innerHeight + k) * 2}`,
                        _dvc: r
                    }),
                });

                if(d.url) safeRedirect(d.url, nh, {
                    t,
                    siteLabel: SITE
                });
                else {
                    handleError('no URL in response', null);
                    console.log('[ULB/khaddavi] API response:', d);
                }
            } catch (err) {
                handleError('bypass failed', err);
            }
        })();
    }

    // ── sfl.gl ─────────────────────────────────────────────────────────────

    function runSflGlBypasser() {
        const SITE = 'sfl.gl';
        const t = makeTimer();
        const nh = notify(`${SITE} — reading destination…`, 'loading', 0, {
            site: SITE
        });

        const tryRedirect = () => {
            try {
                for(const s of document.querySelectorAll('script:not([src])')) {
                    const m = s.textContent.match(/window\.location\.href\s*=\s*"([^"]+)"/);
                    if(!m) continue;
                    const url = m[1].replace(/\\\//g, '/');
                    if(safeUrl(url)) {
                        safeRedirect(url, nh, {
                            t,
                            siteLabel: SITE
                        });
                        return true;
                    }
                }
                const m2 = document.documentElement.innerHTML.match(/window\.location\.href\s*=\s*"([^"]+)"/);
                if(m2) {
                    const url = m2[1].replace(/\\\//g, '/');
                    if(safeUrl(url)) {
                        safeRedirect(url, nh, {
                            t,
                            siteLabel: SITE
                        });
                        return true;
                    }
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
    // biplabtewary.com, mwgamesyt.com.br, topjogosvip.online, legacyagency.com.br

    function runButtonFinderBypasser() {
        const SITE = host.replace(/^www\./, '');
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting task…`, 'loading', 0, {
            site: SITE
        });

        const detectTask = () => {
            for(const el of document.querySelectorAll('font')) {
                const m = el.textContent.match(/\b(\d+)\s*\/\s*(\d+)\b/);
                if(m) return {
                    current: parseInt(m[1], 10),
                    total: parseInt(m[2], 10)
                };
            }
            return null;
        };

        const findHref = () => [...document.querySelectorAll('a[href]')].find(a => a.querySelector('button'))?.href || null;

        const tryRedirect = () => {
            const task = detectTask();
            const href = findHref();
            if(task) {
                nh.update(`${SITE} — Task ${task.current}/${task.total}${href ? ' — redirecting…' : ' — waiting for button…'}`, href ? 'success' : 'loading', {
                    site: SITE
                });
            }
            if(href) {
                safeRedirect(href, nh, {
                    t,
                    siteLabel: SITE
                });
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

    // ── fluorine.s3ren1ty.xyz ──────────────────────────────────────────────

    function runFluorineBypasser() {
        if(!path.startsWith('/getkey')) return;

        const SITE = 'fluorine.s3ren1ty.xyz';
        const timer = makeTimer();
        const nh = notify(`${SITE} — running key checkpoints…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const run = async () => {
            try {
                let token = localStorage.getItem('provider_session');
                if(!token) {
                    token = `loot_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
                    localStorage.setItem('provider_session', token);
                }

                for(let i = 1; i <= 2; i++) {
                    nh.update(`${SITE} — checkpoint ${i}/2…`, 'loading', {
                        site: SITE
                    });
                    await fetch('/api/loot/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            token,
                            checkpoint: i
                        }),
                    });
                }

                nh.update(`${SITE} — finalising…`, 'loading', {
                    site: SITE
                });
                await fetch('/api/loot/create', {
                    method: 'POST'
                });

                const rParam = new URLSearchParams(location.search).get('r');
                const dest = rParam ? atob(rParam) : '/generate?suc=x1';

                nh.update(`${SITE} — done in ${timer.elapsed()}s`, 'success', {
                    site: SITE,
                    time: timer.elapsed() + 's'
                });
                setTimeout(() => nh.remove(), CONFIG.autoDismissOnRedirect ? 500 : 2000);
                location.href = dest;
            } catch (err) {
                handleError('bypass failed', err);
            }
        };

        onReady(run);
    }

    // ── hehehub-acsu123.pythonanywhere.com ────────────────────────────────

    function runHehehubSkipper() {
        const SITE = 'hehehub';
        const t = makeTimer();
        const handleError = makeErrHandler(SITE, null, 7000);

        const trySkip = () => {
            const body = document.body?.innerHTML || '';

            const match = body.match(
                /window\.location\.href\s*=\s*['"`]([^'"`]+)['"`]/
            );

            let rawUrl = match?.[1];
            if(!rawUrl) return false;

            // 1. Clean junk characters that break URL()
            rawUrl = rawUrl.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

            let dest;

            try {
                // 2. Try normal URL first
                dest = new URL(rawUrl, location.origin);
            } catch (e1) {
                try {
                    // 3. Fallback: encode bad characters instead of failing
                    dest = new URL(encodeURI(rawUrl), location.origin);
                } catch (e2) {
                    // 4. Last fallback: give up gracefully instead of crashing
                    handleError('invalid redirect URL', e2);
                    return true;
                }
            }

            // 5. Prevent redirect loops (IMPORTANT for your case)
            if(location.href === dest.href) return false;

            const hwid = dest.searchParams.get('hwid');
            if(hwid) {
                dest.searchParams.set('hwid', hwid.replace('next', ''));
            }

            const finalUrl = dest.toString();

            if(!safeUrl(finalUrl)) {
                handleError('decoded URL is unsafe', null);
                return true;
            }

            const nh = notify(`${SITE} — skipping extra steps…`, 'loading', 0, {
                site: SITE
            });

            nh.update(`${SITE} — done in ${t.elapsed()}s`, 'success', {
                site: SITE,
                time: t.elapsed() + 's'
            });

            setTimeout(() => nh.remove(), CONFIG.autoDismissOnRedirect ? 500 : 2000);

            location.href = finalUrl;
            return true;
        };

        const stripBlankOpens = () => {
            document.querySelectorAll('button[onclick]').forEach(btn => {
                const orig = btn.getAttribute('onclick');
                const cleaned = orig.replace(/window\.open\s*\([^)]*['"]_blank['"]\s*\)\s*;?\s*/g, '').trim();
                if(cleaned !== orig) {
                    btn.setAttribute('onclick', cleaned);
                    console.log('[ULB/hehehub] stripped _blank open from button:', btn.textContent.trim());
                }
            });
        };

        const blankObs = new MutationObserver(stripBlankOpens);

        const init = () => {
            stripBlankOpens();
            blankObs.observe(document.body, {
                childList: true,
                subtree: true
            });
            notify(`${SITE} — popup links removed from buttons`, 'info', undefined, {
                site: SITE
            });
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
        if(!path.startsWith('/ad/')) return;

        const SITE = 'getpolsec.com';
        const t = makeTimer();
        const handleError = makeErrHandler(SITE, null, 7000);

        const isCaptchaPresent = () => {
            if(document.querySelector('iframe[src*="hcaptcha.com"]')) return true;
            if(document.querySelector('[name="h-captcha-response"]')) return true;
            if(document.querySelector('[name="g-recaptcha-response"]')) return true;
            for(const el of document.querySelectorAll('.mb-2.text-base.font-semibold, [class*="font-semibold"]')) {
                if(el.textContent.trim() === 'Verify You Are Human') return true;
            }
            return false;
        };

        const getHCaptchaToken = () => {
            const ta = document.querySelector('[name="h-captcha-response"]');
            if(ta?.value?.length > 20) return ta.value;
            try {
                if(typeof unsafeWindow.hcaptcha?.getResponse === 'function') {
                    const r = unsafeWindow.hcaptcha.getResponse();
                    if(r?.length > 20) return r;
                }
            } catch (_) {}
            return '';
        };

        const runBypass = async nh => {
            const adSlug = path.split('/').filter(Boolean).pop();
            nh.update(`${SITE} — fetching destination…`, 'loading', {
                site: SITE
            });
            try {
                const token = getHCaptchaToken();
                const headers = {};
                if(token) headers['x-hcaptcha-response'] = token;

                const resp = await fetch(`https://api.getpolsec.com/ad/${adSlug}/linkvertise`, {
                    headers
                });
                const r = await resp.json();

                if(r?.message?.url) {
                    let dest;
                    try {
                        dest = atob(new URL(r.message.url).searchParams.get('r'));
                    } catch (e) {
                        nh.update(`${SITE}: failed to decode destination URL`, 'error');
                        console.error('[ULB/getpolsec] atob decode failed:', e);
                        setTimeout(() => nh.remove(), 7000);
                        return;
                    }
                    safeRedirect(dest, nh, {
                        t,
                        siteLabel: SITE
                    });
                } else {
                    console.log(`[ULB/${SITE}] API response:`, r);
                    nh.update(`${SITE}: link is not bypassable — manual action required.`, 'warn', 0, {
                        site: SITE
                    });
                    setTimeout(() => nh.remove(), 7000);
                }
            } catch (err) {
                handleError('bypass failed', err);
                nh.remove();
            }
        };

        const runCaptchaWait = nh => {
            nh.update(`${SITE} — solve the hCaptcha to continue…`, 'warn', 0, {
                site: SITE
            });
            let tries = 0;
            const iv = setInterval(() => {
                const token = getHCaptchaToken();
                if(token) {
                    clearInterval(iv);
                    console.log(`[ULB/${SITE}] hCaptcha solved — proceeding with bypass`);
                    runBypass(nh);
                    return;
                }
                if(++tries > 600) {
                    clearInterval(iv);
                    handleError('timed out waiting for hCaptcha', null);
                }
            }, 100);
        };

        const init = () => {
            const nh = notify(`${SITE} — checking…`, 'loading', 0, {
                site: SITE
            });
            if(isCaptchaPresent()) runCaptchaWait(nh);
            else runBypass(nh);
        };
        onReady(init);
    }

    // ── arolinks.com ───────────────────────────────────────────────────────
    // Layout A: #link1s anchor is present → extract href and redirect to it
    // Layout B: form/captcha page → /links/go POST (encurta.net platform)

    function runArolinksBypasser() {
        const SITE = 'arolinks.com';
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const detect = () => {
            // ── Jober-style step counter (btn6 + btn7) ─────────────────────
            const stepDanger = document.querySelector('strong .text-danger, strong span.text-danger');
            if(stepDanger) {
                const m = stepDanger.textContent.trim().match(/^(\d+)\/(\d+)$/);
                if(m) {
                    const step = {
                        current: parseInt(m[1], 10),
                        total: parseInt(m[2], 10)
                    };
                    nh.update(`${SITE} — step ${step.current}/${step.total} — bypassing…`, 'loading', {
                        site: SITE
                    });
                    count = -1;
                    timer();
                    const check = setInterval(() => {
                        const b7 = document.getElementById('btn7');
                        if(b7 && b7.offsetParent !== null) {
                            clearInterval(check);
                            nh.update(`${SITE} — clicking Continue…`, 'loading', {
                                site: SITE
                            });
                            b7.click();
                            return;
                        }
                        const cross = document.getElementById('cross-snp2');
                        if(cross && cross.offsetParent !== null) {
                            clearInterval(check);
                            nh.update(`${SITE} — clicking Continue…`, 'loading', {
                                site: SITE
                            });
                            cross.click();
                        }
                    }, 500);
                    setTimeout(() => clearInterval(check), 60000);
                    return true;
                }
            }

            // ── Jober-style startCountdownBtn ────────────────────────────────
            if(document.getElementById('startCountdownBtn')) {
                nh.update(`${SITE} — bypassing ad countdown…`, 'loading', {
                    site: SITE
                });
                count = -1;
                timer();
                const check = setInterval(() => {
                    const cross = document.getElementById('cross-snp2');
                    if(cross && cross.offsetParent !== null) {
                        clearInterval(check);
                        nh.update(`${SITE} — clicking Continue…`, 'loading', {
                            site: SITE
                        });
                        cross.click();
                        return;
                    }
                    const b7 = document.getElementById('btn7');
                    if(b7 && b7.offsetParent !== null) {
                        clearInterval(check);
                        nh.update(`${SITE} — clicking Continue…`, 'loading', {
                            site: SITE
                        });
                        b7.click();
                    }
                }, 500);
                setTimeout(() => clearInterval(check), 60000);
                return true;
            }

            // Layout A: "Get Link" button wrapped in #link1s anchor — just redirect
            const a = document.getElementById('link1s');
            if(a && a.href) {
                console.log('[ULB/arolinks] Found #link1s — redirecting:', a.href);
                safeRedirect(a.href, nh, {
                    t,
                    siteLabel: SITE
                });
                return true;
            }

            // Layout B: ad_form_data hidden input → POST to /links/go
            const adEl = document.querySelector('[name="ad_form_data"]');
            if(adEl) {
                nh.update(`${SITE} — reading countdown…`, 'loading', {
                    site: SITE
                });
                _lnbzWaitForAppVars(vars => {
                    const secs = Math.max(1, parseInt(vars?.counter_value, 10) || 15);
                    showCountdown(secs, async () => {
                        try {
                            const form = adEl.closest('form') || document.querySelector('form');
                            let body;
                            if(form) {
                                const params = new URLSearchParams();
                                form.querySelectorAll('input[type="hidden"]').forEach(inp => {
                                    if(inp.name) params.append(inp.name, inp.value);
                                });
                                if(!params.has('_method')) params.set('_method', 'POST');
                                body = params.toString();
                            } else {
                                body = '_method=POST&ad_form_data=' + encodeURIComponent(adEl.value);
                            }
                            const r = await fetch('/links/go', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                                },
                                credentials: 'include',
                                body,
                            });
                            if(!r.ok) throw new Error(`HTTP ${r.status}`);
                            const d = await r.json();
                            const dest = d.url || d.data;
                            if(!dest) throw new Error('No destination URL in response');
                            safeRedirect(dest, nh, {
                                t,
                                siteLabel: SITE
                            });
                        } catch (err) {
                            handleError('go-link POST failed', err);
                        }
                    }, `${SITE} bypass`);
                });
                return true;
            }

            // Layout B (captcha step): form present but no ad_form_data yet — solve captcha
            const form = document.getElementById('link-view') || document.querySelector('form');
            if(form) {
                nh.update(`${SITE} — solving captcha…`, 'loading', {
                    site: SITE
                });
                (async () => {
                    try {
                        const vars = await _lnbzWaitForAppVarsAsync(5000);
                        const sitekey = vars?.turnstile_site_key || getSiteKey();
                        if(!sitekey) {
                            handleError('could not find Turnstile sitekey', null);
                            return;
                        }
                        const token = await solveTurnstile(sitekey);
                        let input = form.querySelector('[name="cf-turnstile-response"]');
                        if(!input) {
                            input = Object.assign(document.createElement('input'), {
                                type: 'hidden',
                                name: 'cf-turnstile-response'
                            });
                            form.appendChild(input);
                        }
                        input.value = token;
                        const submitBtn = document.getElementById('invisibleCaptchaShortlink') ||
                            form.querySelector('button[type="submit"][disabled], input[type="submit"][disabled]');
                        if(submitBtn) submitBtn.disabled = false;
                        nh.update(`${SITE} — submitting…`, 'loading', {
                            site: SITE
                        });
                        try {
                            if(typeof form.requestSubmit === 'function') form.requestSubmit();
                            else HTMLFormElement.prototype.submit.call(form);
                        } catch {
                            const b = form.querySelector('button[type="submit"],input[type="submit"]');
                            if(b) b.click();
                        }
                    } catch (err) {
                        handleError('captcha solve failed', err);
                    }
                })();
                return true;
            }

            return false;
        };

        const init = () => {
            if(detect()) return;
            let tries = 0;
            const iv = setInterval(() => {
                if(detect()) {
                    clearInterval(iv);
                    return;
                }
                if(++tries > 200) {
                    clearInterval(iv);
                    handleError('page structure not recognised after 20s', null);
                }
            }, 100);
        };

        onReady(init);
    }

    // ── spdmteam.com ───────────────────────────────────────────────────────

    function runSpdmTeamBypasser() {
        const SITE = 'spdmteam.com';
        const t = makeTimer();
        const nh = notify(`${SITE} — fetching destination…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh);

        const run = async () => {
            try {
                const apiUrl = location.href.replace('/social/', '/api/social/');
                nh.update(`${SITE} — calling API…`, 'loading', {
                    site: SITE
                });
                const r = await fetch(apiUrl);
                if(!r.ok) throw new Error(`HTTP ${r.status}${r.statusText ? ' ' + r.statusText : ''}`);
                let d;
                try {
                    d = await r.json();
                } catch {
                    throw new Error('Response was not valid JSON');
                }
                const dest = d.script;
                if(!safeUrl(dest)) throw new Error('No valid URL in API response (d.script)');
                safeRedirect(dest, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('bypass failed', err);
            }
        };

        onReady(run);
    }

    // ── rekonise.com ───────────────────────────────────────────────────────

    function runRekoniseBypasser() {
        const SITE = 'rekonise.com';
        const t = makeTimer();
        const nh = notify(`${SITE} — waiting for page… (10s)`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const run = () => {
            const WAIT = 10;
            let rem = WAIT;
            const iv = setInterval(() => {
                rem--;
                if(rem > 0) nh.update(`${SITE} — waiting for page… (${rem}s)`, 'loading', {
                    site: SITE
                });
                else {
                    clearInterval(iv);
                    bypass();
                }
            }, 1000);
        };

        const bypass = async () => {
            try {
                const ngStateEl = document.getElementById('ng-state');
                if(!ngStateEl) throw new Error('ng-state element not found');

                let token;
                const d = JSON.parse(ngStateEl.textContent);
                for(const k in d) {
                    if(d[k]?.b?.unlock_token) {
                        token = d[k].b.unlock_token;
                        break;
                    }
                }
                if(!token) throw new Error('unlock_token not found in ng-state');

                nh.update(`${SITE} — fetching destination…`, 'loading', {
                    site: SITE
                });

                const slug = location.pathname.split('/').filter(Boolean).pop();
                const url = `https://api.rekonise.com/social-unlocks/${encodeURIComponent(slug)}/unlock?token=${encodeURIComponent(token)}`;
                const j = await fetchJSON(url);

                const dest = j.url ?? j;
                if(!safeUrl(dest)) throw new Error('No valid URL in API response');

                safeRedirect(dest, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('bypass failed', err);
            }
        };

        onReady(run);
    }

    // ── go.linkify.ru ──────────────────────────────────────────────────────

    function runLinkifyRuBypasser() {
        const SITE = 'go.linkify.ru';
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        // Page B: /get/* — extract final URL from window.location.replace(...)
        if(path.startsWith('/get/')) {
            const tryGetPage = () => {
                try {
                    const m = document.documentElement.innerHTML.match(
                        /window\.location\.replace\(['"](.*?)['"]\)/
                    );
                    if(!m) return false;
                    const dest = m[1];
                    console.log('[ULB/linkify.ru] Detected Link:', dest);
                    safeRedirect(dest, nh, {
                        t,
                        siteLabel: SITE
                    });
                    return true;
                } catch (_) {
                    return false;
                }
            };

            const init = () => {
                pollUntil(tryGetPage, 200, 150).catch(() => {
                    handleError('destination URL not found in /get/ page — unsupported layout', null);
                });
            };
            onReady(init);
            return;
        }

        // Page A: short link (e.g. /2DAN) — extract /get/ URL from href in page HTML
        const tryShortPage = () => {
            try {
                const m = document.documentElement.innerHTML.match(
                    /href="(https:\/\/go\.linkify\.ru\/get\/.*?)"/
                );
                if(!m) return false;
                const url = m[1];
                console.log('[ULB/linkify.ru] Final Link:', url);
                safeRedirect(url, nh, {
                    t,
                    siteLabel: SITE
                });
                return true;
            } catch (_) {
                return false;
            }
        };

        const init = () => {
            pollUntil(tryShortPage, 200, 150).catch(() => {
                handleError('intermediate /get/ URL not found — unsupported layout', null);
            });
        };
        onReady(init);
    }

    // ── nexusdevs.fun ──────────────────────────────────────────────────────
    // Handles bnty.nexusdevs.fun/getkey?h=<hwid> (and any *.nexusdevs.fun/getkey*)
    // Runs the full init -> step loop -> key generation flow silently, then
    // surfaces the key via the shared showKeyCard() utility.

    function runNexusBypasser() {
        const SITE = 'nexusdevs.fun';
        const BASE = 'https://keyserver.nexusdevs.fun';
        const JSON_HEADERS = {
            'Content-Type': 'application/json'
        };

        // ── Block report-adblock & hidaddy on unsafeWindow so the page's own
        //    JS cannot fire these requests regardless of how they're made. ────
        const _uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        const _nxBlocked = (u) => {
            const s = u ? String(typeof u === 'object' ? (u.url ?? u) : u) : '';
            return s.includes('report-adblock') || s.includes('hidaddy');
        };

        // fetch
        const _origFetch = _uw.fetch;
        _uw.fetch = function (input, init) {
            if(_nxBlocked(input)) return Promise.resolve(new Response(null, {
                status: 204
            }));
            return _origFetch.apply(this, arguments);
        };

        // XHR — patch the prototype on unsafeWindow's copy
        const _XHR = _uw.XMLHttpRequest;
        const _xOpen = _XHR.prototype.open;
        const _xSend = _XHR.prototype.send;
        _XHR.prototype.open = function (method, url) {
            this.__nxBlock = _nxBlocked(url);
            return _xOpen.apply(this, arguments);
        };
        _XHR.prototype.send = function () {
            if(this.__nxBlock) return;
            return _xSend.apply(this, arguments);
        };

        // sendBeacon
        const _origBeacon = _uw.navigator.sendBeacon.bind(_uw.navigator);
        _uw.navigator.sendBeacon = (url, data) =>
            _nxBlocked(url) ? true : _origBeacon(url, data);

        // DOM — kill matching nodes as they appear and on load
        new MutationObserver(ms => {
            ms.forEach(m => m.addedNodes.forEach(n => {
                if(n.nodeType === 1 && _nxBlocked(n.src || n.href)) {
                    n.pause?.();
                    n.remove();
                }
            }));
        }).observe(document.documentElement, {
            childList: true,
            subtree: true
        });
        document.querySelectorAll('audio,source,script,img').forEach(e => {
            if(_nxBlocked(e.src || e.href)) e.remove();
        });
        // ─────────────────────────────────────────────────────────────────────

        const t = makeTimer();
        const nh = notify(`${SITE} — starting key flow…`, 'loading', 0);
        const handleError = makeErrHandler(SITE, nh, 9000);

        const params = new URLSearchParams(window.location.search);
        const HWID = params.get('h') || params.get('hwid');

        if(!HWID) {
            handleError('no HWID found in URL (?h= or ?hwid=)', null);
            return;
        }

        /**
         * POST to a keyserver endpoint with automatic blocked/rate-limited handling.
         * • status:"blocked"      → wait remaining_ms then retry once
         * • status:"rate_limited" → surface a persistent error, do not retry
         */
        const nxPost = async (endpoint, body, label) => {
            const go = async () => {
                const r = await fetch(`${BASE}${endpoint}`, {
                    method: 'POST',
                    headers: JSON_HEADERS,
                    body: JSON.stringify(body),
                });
                return r.json().catch(() => ({}));
            };

            let data = await go();

            if(data.status === 'rate_limited') {
                handleError('rate limited — please wait a while and try again', null);
                throw new Error('rate_limited');
            }

            if(data.status === 'blocked') {
                const waitMs = (data.remaining_ms ?? 5000) + 500;
                const waitSec = Math.ceil(waitMs / 1000);
                console.warn(`[ULB/nexus] ${label} — IP blocked (${data.reason ?? '?'}), waiting ${waitSec}s…`);
                nh.update(`${SITE} — blocked (${data.reason ?? 'ad blocker detected'}), waiting ${waitSec}s…`, 'warn');
                await sleep(waitMs);
                nh.update(`${SITE} — retrying ${label}…`, 'loading');
                data = await go();
                if(data.status === 'rate_limited') {
                    handleError('rate limited — please wait a while and try again', null);
                    throw new Error('rate_limited');
                }
            }

            return data;
        };

        (async () => {
            try {
                // 1. Init session
                nh.update(`${SITE} — initialising session…`, 'loading');

                const initData = await nxPost('/api/getkey/init', {
                        hwid_hash: HWID,
                        timestamp: Date.now()
                    },
                    'init'
                );

                if(!initData?.token) {
                    handleError('init failed — no token returned', null);
                    return;
                }

                const token = initData.token;
                const steps = Array.isArray(initData.steps) ? initData.steps : [];
                const total = steps.length;

                // 2. Walk each step
                for(let i = 0; i < steps.length; i++) {
                    const s = steps[i];
                    const stepNum = s.step || (i + 1);

                    // Discord step — skip start-step and complete-step entirely
                    if(s.type === 'discord') {
                        nh.update(`${SITE} — step ${stepNum}/${total} (discord)…`, 'loading');
                        await sleep(1500);
                        await nxPost('/api/getkey/complete-discord', {
                            token
                        }, 'complete-discord').catch(() => {});
                        await sleep(1200);
                        continue;
                    }

                    nh.update(`${SITE} — step ${stepNum}/${total}…`, 'loading');

                    const startData = await nxPost('/api/getkey/start-step', {
                            token,
                            step: stepNum
                        },
                        `start-step ${stepNum}`
                    );

                    if(startData.wait) {
                        nh.update(`${SITE} — step ${stepNum}/${total} (waiting ${startData.wait}s)…`, 'loading');
                        await sleep((startData.wait * 1000) + 800);
                    }

                    // complete-step — retry on too_fast, also handles blocked via nxPost
                    let completeData;
                    do {
                        completeData = await nxPost('/api/getkey/complete-step', {
                                token,
                                step: stepNum
                            },
                            `complete-step ${stepNum}`
                        );
                        if(completeData.status === 'too_fast' && completeData.remaining) {
                            const waitSec = Math.ceil(completeData.remaining / 1000) + 2;
                            nh.update(`${SITE} — step ${stepNum}/${total} too fast, retrying in ${waitSec}s…`, 'loading');
                            await sleep(waitSec * 1000);
                        }
                    } while(completeData.status === 'too_fast' && completeData.remaining);

                    await sleep(1200);
                }

                // 3. Generate key
                nh.update(`${SITE} — generating key…`, 'loading');
                await sleep(2000);

                const genData = await nxPost('/api/getkey/generate', {
                    token
                }, 'generate');

                if(!genData?.code) {
                    handleError('key generation failed — no code in response', null);
                    return;
                }

                nh.remove();
                showKeyCard(genData.code, SITE, t);

            } catch (err) {
                handleError('unexpected error during key flow', err);
            }
        })();
    }

    // ── linkunlocker.com ───────────────────────────────────────────────────

    function runLinkUnlockerBypasser() {
        const SITE = 'linkunlocker.com';
        const ACTION_FETCH = '40aefacb2f77a22354545aacbb194a03ebfedad72b';
        const ACTION_UNLOCK = '403f66e55109b46b722c408c17a17267d20e0393c2';

        const t = makeTimer();
        const nh = notify(`${SITE} — extracting link data…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const run = async () => {
            try {
                // Build the Next.js router-state header using the current slug.
                const slug = location.pathname.split('/').pop();
                const nextState = JSON.stringify([
                    '',
                    {
                        children: [
                            ['slug', slug, 'd'],
                            {
                                children: ['__PAGE__', {}, null, null]
                            },
                            null, null
                        ]
                    },
                    null, null, true
                ]);
                const headers = {
                    'accept': 'text/x-component',
                    'content-type': 'text/plain;charset=UTF-8',
                    'next-router-state-tree': nextState,
                };

                // Step 1 — scrape _id and _secureTarget5 from inline Next.js scripts.
                nh.update(`${SITE} — scanning page scripts…`, 'loading', {
                    site: SITE
                });
                let raw = '';
                document.querySelectorAll('script').forEach(s => {
                    if(s.textContent.includes('next_f.push')) {
                        const m = s.textContent.match(/push\(\[\d+,\s*"(.+)"\]\)/);
                        if(m) raw += m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                    }
                });

                const dataMatch = raw.match(/"_id":"([a-f0-9]{24})".*?"_secureTarget5":"([^"]+)"/);
                if(!dataMatch) throw new Error('Could not find _id / _secureTarget5 in page scripts');
                const [, id, secureTarget] = dataMatch;

                // Step 2 — fetch request token.
                nh.update(`${SITE} — fetching request token…`, 'loading', {
                    site: SITE
                });
                const r1 = await fetch(location.href, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'next-action': ACTION_FETCH
                    },
                    body: JSON.stringify([id]),
                });
                if(!r1.ok) throw new Error(`Token request returned HTTP ${r1.status}`);
                const t1 = await r1.text();
                const tkM = t1.match(/"token":"([^"]+)"/);
                if(!tkM) throw new Error('No token found in token-fetch response');
                const token = tkM[1];

                // Step 3 — unlock and get destination URL.
                nh.update(`${SITE} — unlocking destination…`, 'loading', {
                    site: SITE
                });
                const r2 = await fetch(location.href, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'next-action': ACTION_UNLOCK
                    },
                    body: JSON.stringify([{
                        encryptedUrl: secureTarget,
                        requestToken: token,
                        unlockerId: id,
                        useAdDestination: false,
                        adDestination: null,
                    }]),
                });
                if(!r2.ok) throw new Error(`Unlock request returned HTTP ${r2.status}`);
                const t2 = await r2.text();
                const urlM = t2.match(/"url":"([^"]+)"/);
                if(!urlM) throw new Error('No URL found in unlock response');
                const dest = urlM[1].replace(/\\/g, '');

                safeRedirect(dest, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('bypass failed', err);
            }
        };

        onReady(run);
    }

    // ── lua-key-vault.vercel.app ───────────────────────────────────────────
    // Flow: POST /api/generate-key → get requestId
    //       GET  /api/validate-key?requestId=<id> → get remainingTime
    //       sleep(remainingTime + 200ms)
    //       GET  /api/validate-key?requestId=<id> → get key
    // Key is surfaced via the shared showKeyCard() utility.

    function runLuaKeyVaultBypasser() {
        const SITE = 'lua-key-vault';
        const BASE = location.origin;

        const t = makeTimer();
        const nh = notify(`${SITE} — starting key generation…`, 'loading', 0);
        const handleError = makeErrHandler(SITE, nh, 9000);

        (async () => {
            try {
                // Step 1 — request key generation
                nh.update(`${SITE} — requesting key…`, 'loading');
                const genResp = await fetch(`${BASE}/api/generate-key`, {
                    method: 'POST'
                });
                if(!genResp.ok) throw new Error(`generate-key returned HTTP ${genResp.status}`);
                const genData = await genResp.json();
                const requestId = genData.requestId;
                if(!requestId) throw new Error('No requestId in generate-key response');

                const validateUrl = `${BASE}/api/validate-key?requestId=${encodeURIComponent(requestId)}`;

                // Step 2 — poll once to learn remainingTime
                nh.update(`${SITE} — checking wait time…`, 'loading');
                const pollResp = await fetch(validateUrl);
                if(!pollResp.ok) throw new Error(`validate-key poll returned HTTP ${pollResp.status}`);
                const pollData = await pollResp.json();

                const waitMs = (typeof pollData.remainingTime === 'number' ? pollData.remainingTime : 180_000) + 200;
                const waitSec = Math.ceil(waitMs / 1000);

                // Step 3 — dismiss loading notif now that wait time is known, then show countdown
                nh.remove();
                showCountdown(waitSec, async () => {
                    try {
                        nh.update(`${SITE} — fetching key…`, 'loading');
                        const keyResp = await fetch(validateUrl);
                        if(!keyResp.ok) throw new Error(`validate-key final returned HTTP ${keyResp.status}`);
                        const keyData = await keyResp.json();

                        const key = keyData.key;
                        if(!key) throw new Error('No key field in validate-key response');

                        nh.remove();
                        showKeyCard(key, SITE, t);
                    } catch (err) {
                        handleError('failed to fetch final key', err);
                    }
                }, `${SITE} key generation`);

            } catch (err) {
                handleError('key flow failed', err);
            }
        })();
    }

    // ── mboost.me ──────────────────────────────────────────────────────────
    // The page embeds a JS object `data = { targeturl: "..." }`.
    // We read it from unsafeWindow or parse inline scripts, then redirect.

    function runMboostBypasser() {
        const SITE = 'mboost.me';
        const t = makeTimer();
        const nh = notify(`${SITE} — extracting target URL…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 7000);

        const tryExtract = () => {
            // Strategy 1: read from unsafeWindow.data.targeturl
            try {
                const d = unsafeWindow.data;
                if(d && d.targeturl) {
                    safeRedirect(d.targeturl, nh, {
                        t,
                        siteLabel: SITE
                    });
                    return true;
                }
            } catch (_) {}

            // Strategy 2: scan inline <script> tags
            for(const s of document.querySelectorAll('script:not([src])')) {
                const m = s.textContent.match(/['"]{0,1}targeturl['"]{0,1}\s*:\s*['"]([^'"]+)['"]/);
                if(m && m[1]) {
                    safeRedirect(m[1], nh, {
                        t,
                        siteLabel: SITE
                    });
                    return true;
                }
            }
            return false;
        };

        const init = () => {
            if(tryExtract()) return;
            // Scripts may still be executing — poll until data is available
            pollUntil(tryExtract, 200, 150).catch(() => {
                handleError('target URL not found in page', null);
            });
        };
        onReady(init);
    }

    // ── sub2unlock.netlify.app ─────────────────────────────────────────────
    // Hooks WebSocket at document-start so no messages are missed.
    // Looks for the download URL at data.d.b.d.download in WS payloads.

    function runSub2UnlockBypasser() {
        const SITE = 'sub2unlock';
        const t = makeTimer();
        const nh = notify(`${SITE} — waiting for unlock signal…`, 'loading', 0, {
            site: SITE
        });

        let redirected = false;

        const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        const OrigWS = W.WebSocket;

        W.WebSocket = function (u, p) {
            const s = new OrigWS(u, p);
            s.addEventListener('message', e => {
                if(redirected) return;
                try {
                    const d = JSON.parse(e.data)?.d?.b?.d?.download;
                    if(d) {
                        redirected = true;
                        safeRedirect(d, nh, {
                            t,
                            siteLabel: SITE
                        });
                    }
                } catch (_) {}
            });
            return s;
        };
        W.WebSocket.prototype = OrigWS.prototype;
    }

    // ── www.scoplidrop.com ─────────────────────────────────────────────────
    // Entry URL: https://www.scoplidrop.com/entry?code=<code>
    // Flow:
    //   1. Read ?code= from URL (or prompt user)
    //   2. POST /api/tokens?code=<code>          → { token }
    //   3. GET  /api/entry/giveaway?token=<tok>  → giveaway + entry data
    //   4. Find all incomplete custom-task entries
    //   5. Start all incomplete tasks simultaneously
    //   6. Show 15 s countdown, then verify all tasks
    //   7. Reload page

    function runScoplidropBypasser() {
        const SITE = 'scoplidrop.com';
        const WAIT_SEC = 15;
        const t = makeTimer();
        const nh = notify(`${SITE} — reading code…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 10000);

        const run = async () => {
            try {
                // Step 1 — resolve code
                const code = new URLSearchParams(location.search).get('code') ||
                    prompt('scoplidrop — Enter your entry code:');
                if(!code) throw new Error('No code provided');

                // Step 2 — exchange code for token
                nh.update(`${SITE} — fetching token…`, 'loading', {
                    site: SITE
                });
                const tokRes = await fetch(
                    `https://www.scoplidrop.com/api/tokens?code=${encodeURIComponent(code)}`
                );
                if(!tokRes.ok) throw new Error(`Token fetch HTTP ${tokRes.status}`);
                const tokData = await tokRes.json();
                const token = tokData.token;
                if(!token) throw new Error('Token missing in response');

                // Step 3 — fetch giveaway + entry data
                nh.update(`${SITE} — fetching giveaway data…`, 'loading', {
                    site: SITE
                });
                const entRes = await fetch(
                    `https://www.scoplidrop.com/api/entry/giveaway?token=${encodeURIComponent(token)}`
                );
                if(!entRes.ok) throw new Error(`Giveaway fetch HTTP ${entRes.status}`);
                const data = await entRes.json();
                if(!data || !data.giveaway) throw new Error('Invalid giveaway response');

                const giveawayId = data.giveaway.id;
                const userId = data.user?.id || data.entry?.user_id;
                if(!userId) throw new Error('User ID not found in response');

                const tasks = data.giveaway.tasks || [];
                const completions = data.entry?.task_completions || {};

                // Step 4 — collect incomplete custom-task indices
                const incomplete = [];
                for(let i = 0; i < tasks.length; i++) {
                    if(tasks[i].id === 'custom-task' && !completions[`custom-task_${i}`]?.completed) {
                        incomplete.push(i);
                    }
                }

                if(!incomplete.length) {
                    nh.update(`${SITE} — all tasks already completed!`, 'success', 5000, {
                        site: SITE
                    });
                    return;
                }

                nh.update(
                    `${SITE} — starting ${incomplete.length} task(s)…`,
                    'loading', {
                        site: SITE
                    }
                );

                // Step 5 — start all incomplete tasks
                const startTask = (taskIndex) =>
                    fetch('https://www.scoplidrop.com/api/task/start', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            taskId: 'custom-task',
                            taskIndex,
                            giveawayId,
                            userId,
                            token,
                            forceRestart: false,
                            userCode: code
                        })
                    });

                const verifyTask = (taskIndex) =>
                    fetch('https://www.scoplidrop.com/api/task/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            taskId: 'custom-task',
                            taskIndex,
                            giveawayId,
                            userId,
                            token
                        })
                    });

                await Promise.all(incomplete.map(startTask));

                // Step 6 — 15 s countdown, then verify
                nh.update(`${SITE} — waiting ${WAIT_SEC}s before verifying…`, 'loading', {
                    site: SITE
                });
                await new Promise(resolve =>
                    showCountdown(WAIT_SEC, resolve, `${SITE} — verifying tasks`)
                );

                nh.update(`${SITE} — verifying ${incomplete.length} task(s)…`, 'loading', {
                    site: SITE
                });
                await Promise.all(incomplete.map(verifyTask));

                // Step 7 — done
                safeRedirect(location.href, nh, {
                    t,
                    siteLabel: SITE
                });

            } catch (err) {
                handleError('bypass failed', err);
            }
        };

        onReady(run);
    }

    // ── krnl-ios.com ──────────────────────────────────────────────────────
    // Destination URL is base64-encoded in the ?URL= query parameter.
    // Decode and redirect immediately.

    function runKrnlIosBypasser() {
        const SITE = 'krnl-ios';
        const t = makeTimer();
        const nh = notify(`${SITE} — decoding URL…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 5000);

        const init = () => {
            try {
                const encoded = new URLSearchParams(location.search).get('URL');
                if(!encoded) throw new Error('No ?URL= parameter found');
                let dest;
                try {
                    dest = atob(encoded);
                } catch (e) {
                    throw new Error('base64 decode failed — ' + e.message);
                }
                if(!dest) throw new Error('Decoded URL is empty');
                safeRedirect(dest, nh, {
                    t,
                    siteLabel: SITE
                });
            } catch (err) {
                handleError('decode failed', err);
            }
        };
        onReady(init);
    }

    // ── ouo.io ─────────────────────────────────────────────────────────────
    // Two-step flow:
    //   Page A  ouo.io/<id>      — Turnstile (forced visible) → submit #form-captcha
    //                              → server redirects to Page B
    //   Page B  ouo.io/go/<id>  — wait for x-token to be populated → submit #form-go
    //                              → server redirects to final destination
    //
    //  All .cf-turnstile[data-size="invisible"] widgets on the page are patched to
    //  "normal" size globally (via _patchInvisibleTurnstiles at startup), so the
    //  widget is always visible when autoCaptcha is false.

    function runOuoBypasser() {
        const SITE = 'ouo.io';
        const TURNSTILE_SITEKEY = '0x4AAAAAAA77ZC8BklcfDJke';
        const t = makeTimer();
        const nh = notify(`${SITE} — detecting page…`, 'loading', 0, {
            site: SITE
        });
        const handleError = makeErrHandler(SITE, nh, 10000);

        const submitForm = (form) => {
            try {
                if(typeof form.requestSubmit === 'function') form.requestSubmit();
                else HTMLFormElement.prototype.submit.call(form);
            } catch (_) {
                const btn = form.querySelector('button[type="submit"], input[type="submit"]');
                if(btn) btn.click();
            }
        };

        /**
         * Wait up to maxMs for an input[name] on the form to have a non-empty value.
         * Resolves immediately if already filled, or resolves after timeout (proceed anyway).
         */
        const waitForInput = (form, inputName, maxMs = 3000) => new Promise(resolve => {
            const inp = form.querySelector(`[name="${inputName}"]`);
            if(!inp || inp.value) return resolve();
            const start = Date.now();
            const iv = setInterval(() => {
                if(inp.value || Date.now() - start >= maxMs) {
                    clearInterval(iv);
                    resolve();
                }
            }, 80);
        });

        const init = async () => {
            try {
                // ── Page B: /go/<id> — wait for hidden inputs then submit #form-go ──
                if(path.startsWith('/go/')) {
                    nh.update(`${SITE} — waiting for form tokens…`, 'loading', {
                        site: SITE
                    });

                    const form = await (async () => {
                        // Try to find form-go immediately, or wait up to 3s for it
                        const found = document.getElementById('form-go') || document.querySelector('form#form-go') || document.querySelector('form');
                        if(found) return found;
                        return new Promise(resolve => {
                            const obs = new MutationObserver(() => {
                                const f = document.getElementById('form-go') || document.querySelector('form');
                                if(f) {
                                    obs.disconnect();
                                    resolve(f);
                                }
                            });
                            obs.observe(document.body || document.documentElement, {
                                childList: true,
                                subtree: true
                            });
                            setTimeout(() => {
                                obs.disconnect();
                                resolve(null);
                            }, 3000);
                        });
                    })();

                    if(!form) throw new Error('#form-go not found on /go/ page');

                    // Wait for x-token to be filled in by the page's own JS (or timeout and proceed)
                    await waitForInput(form, 'x-token', 2500);

                    nh.update(`${SITE} — submitting go-form…`, 'loading', {
                        site: SITE
                    });
                    submitForm(form);
                    nh.update(`${SITE} — submitted, awaiting final redirect…`, 'loading', {
                        site: SITE
                    });
                    setTimeout(() => nh.remove(), 8000);
                    return;
                }

                // ── Page A: /<id> — solve Turnstile (visible) → submit #form-captcha ──
                if(!CONFIG.autoCaptcha) {
                    // Make the page's own widget visible so the user can interact with it
                    document.querySelectorAll('.cf-turnstile').forEach(el => {
                        el.setAttribute('data-size', 'normal');
                        el.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important';
                    });
                    nh.update(`${SITE} — solve the Turnstile to continue…`, 'warn', 0, {
                        site: SITE
                    });
                    return;
                }

                nh.update(`${SITE} — solving Turnstile captcha…`, 'loading', {
                    site: SITE
                });

                let token;
                try {
                    token = await solveTurnstile(TURNSTILE_SITEKEY);
                } catch (e) {
                    handleError('Turnstile solve failed', e);
                    return;
                }

                const form = document.getElementById('form-captcha') || document.querySelector('form');
                if(!form) throw new Error('#form-captcha not found');

                // Inject resolved token into the form's cf-turnstile-response field
                let cfInput = form.querySelector('[name="cf-turnstile-response"]');
                if(!cfInput) {
                    cfInput = Object.assign(document.createElement('input'), {
                        type: 'hidden',
                        name: 'cf-turnstile-response'
                    });
                    form.appendChild(cfInput);
                }
                cfInput.value = token;

                // Also attempt to fill the shadow-DOM widget's own response field
                try {
                    const widgetInput = document.querySelector('[id$="_response"]');
                    if(widgetInput && widgetInput !== cfInput) widgetInput.value = token;
                } catch (_) {}

                // Enable any disabled submit button
                const btn = document.getElementById('btn-main') ||
                    form.querySelector('button[type="submit"][disabled], input[type="submit"][disabled]');
                if(btn) btn.disabled = false;

                nh.update(`${SITE} — submitting captcha form…`, 'loading', {
                    site: SITE
                });
                submitForm(form);

                nh.update(`${SITE} — captcha submitted, loading go-page…`, 'loading', {
                    site: SITE
                });
                setTimeout(() => nh.remove(), 8000);

            } catch (err) {
                handleError('bypass failed', err);
            }
        };

        onReady(init);
    }

})();
