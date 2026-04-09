// ==UserScript==
// @name         Unknown Link Bypasser
// @namespace    http://tampermonkey.net/
// @version      6.0.1
// @description  Safelink bypasser + dl.surf auto downloader + form-based auto bypasser + tpi.li bypasser. Made by @Aro Moon
// @author       @Aro Moon
// @include      /^https:\/\/mtc1\.[^/]+\.[a-z.]+\//
// @match        https://dl.surf/f/*
// @match        https://shrtslug.biz/*
// @match        https://biovetro.net/*
// @match        https://technons.com/*
// @match        https://tournguide.com/*
// @match        https://dailyjobposting.xyz/*
// @match        https://tpi.li/*
// @match        https://rekonise.com/*
// @match        https://challenges.cloudflare.com/*
// @match        https://airflowscript.com/key
// @grant        GM_addElement
// @grant        unsafeWindow
// @connect      challenges.cloudflare.com
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ULB.js
// @updateURL    https://raw.githubusercontent.com/nmsjayden/UserScripts/main/ULB.js
// ==/UserScript==

(function () {
    'use strict';

    const FORM_HOSTS = ['shrtslug.biz', 'biovetro.net', 'technons.com', 'tournguide.com', 'dailyjobposting.xyz'];
    const TPI_HOSTS = ['tpi.li'];

    // Polyfill for crypto.randomUUID — not available on older iOS/Android
    function generateId() {
        if(typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID().replace(/-/g, '');
        }
        // Fallback: use getRandomValues (supported since iOS 6 / Android 4.4)
        const arr = new Uint8Array(16);
        (crypto || window.msCrypto).getRandomValues(arr);
        return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── SHARED UI HELPERS ───────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    // Base card CSS shared by notify + countdown widgets
    const BASE_CARD = 'background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,.08);color:#e0e0e0;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.45);pointer-events:auto;opacity:0;transform:translateX(20px);transition:opacity .25s ease,transform .25s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif';
    const LABEL_CSS = 'font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#666;margin-bottom';

    let _nc = null;
    const getContainer = () => {
        if(_nc?.isConnected) return _nc;
        _nc = Object.assign(document.createElement('div'), {
            id: '__ulb_nc'
        });
        _nc.style.cssText = 'position:fixed;bottom:calc(28px + env(safe-area-inset-bottom,0px));right:calc(28px + env(safe-area-inset-right,0px));z-index:2147483647;display:flex;flex-direction:column-reverse;gap:10px;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif';
        document.body.appendChild(_nc);
        return _nc;
    };

    // Attach card to container with slide-in animation
    const mountCard = card => {
        getContainer().appendChild(card);
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        });
        return card;
    };

    // Slide out and remove card
    const dismissCard = card => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => card.remove(), 280);
    };

    const TYPES = {
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

    function notify(message, type = 'info', duration = 4000) {
        if(!document.body) {
            const h = {
                update: () => {},
                remove: () => {}
            };
            document.addEventListener('DOMContentLoaded', () => {
                const r = notify(message, type, duration);
                h.update = r.update;
                h.remove = r.remove;
            }, {
                once: true
            });
            return h;
        }

        const {
            accent,
            icon
        } = TYPES[type] || TYPES.info;
        const card = document.createElement('div');
        card.style.cssText = `${BASE_CARD};border-left:3px solid ${accent};padding:12px 16px;min-width:min(240px,calc(100vw - 56px));max-width:min(320px,calc(100vw - 56px))`;

        const iconEl = document.createElement('div');
        iconEl.style.cssText = `font-size:15px;color:${accent};margin-top:1px;flex-shrink:0`;
        iconEl.textContent = icon;

        const bodyEl = document.createElement('div');
        bodyEl.style.cssText = 'flex:1;min-width:0';
        bodyEl.innerHTML = `<div style="${LABEL_CSS}:3px">Unknown Link Bypasser · @Aro Moon</div>`;

        const msgEl = document.createElement('div');
        msgEl.style.cssText = 'font-size:13px;line-height:1.4;color:#e0e0e0;word-break:break-word';
        msgEl.textContent = message;

        bodyEl.appendChild(msgEl);
        card.style.display = 'flex';
        card.style.alignItems = 'flex-start';
        card.style.gap = '10px';
        card.append(iconEl, bodyEl);

        if(!document.getElementById('__ulb_style')) {
            const s = Object.assign(document.createElement('style'), {
                id: '__ulb_style',
                textContent: '@keyframes __ulb_spin{to{transform:rotate(360deg)}}'
            });
            document.head.appendChild(s);
        }

        mountCard(card);

        const setSpinning = on => {
            iconEl.style.animation = on ? '__ulb_spin 1s linear infinite' : '';
        };
        if(type === 'loading') setSpinning(true);

        let timer;
        const remove = () => {
            clearTimeout(timer);
            dismissCard(card);
        };
        const update = (newMsg, newType) => {
            clearTimeout(timer);
            msgEl.textContent = newMsg;
            if(newType && TYPES[newType]) {
                const s = TYPES[newType];
                iconEl.textContent = s.icon;
                iconEl.style.color = s.accent;
                card.style.borderLeftColor = s.accent;
                setSpinning(newType === 'loading');
            }
            if(duration > 0) timer = setTimeout(remove, duration);
        };
        if(duration > 0) timer = setTimeout(remove, duration);
        return {
            update,
            remove
        };
    }

    function showCountdown(seconds, onDone, subtitle = 'Redirect queued') {
        const card = document.createElement('div');
        card.style.cssText = `${BASE_CARD};border-left:3px solid #4f8ef7;padding:14px 18px;min-width:min(240px,calc(100vw - 56px))`;
        card.innerHTML = `
            <div style="${LABEL_CSS}:8px">Unknown Link Bypasser · @Aro Moon</div>
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

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── TURNSTILE CAPTCHA (programmatic auto-solver) ────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Early exit: if we are inside a challenges.cloudflare.com frame,
    //    only run the CF hook when the parent page is one of our explicitly
    //    handled sites (checked via document.referrer). Ignore all others.
    if(location.hostname === 'challenges.cloudflare.com') {
        const ALLOWED_REFS = [
            'airflowscript.com',
            'dl.surf',
            'tpi.li',
            ...FORM_HOSTS,
            'mtc1.',
        ];
        if(ALLOWED_REFS.some(h => document.referrer.includes(h))) _runCfHook();
        return; // stop — do NOT run any bypasser logic on CF pages
    }

    /**
     * Programmatically solve a Cloudflare Turnstile challenge.
     *
     * FIX for error 600010 ("widget configured for different domain"):
     * The old approach rendered the widget inside an srcdoc iframe, which has a
     * null/opaque origin. CF validates the hostname against the registered sitekey
     * domains and rejects null origins with error 600010.
     *
     * New approach: inject the widget div directly into the real page's DOM so the
     * origin is always correct. Use turnstile.render() (JS API) when available, or
     * fall back to data-callback on unsafeWindow so CF's own script fires the cb.
     *
     * @param {string} sitekey  – The site key to solve (required).
     * @returns {Promise<string>} Resolves with the one-time token.
     */
    function solveTurnstile(sitekey) {
        if(!sitekey) return Promise.reject(new Error('[ULB/Turnstile] sitekey is required'));

        return new Promise((resolve, reject) => {
            // Unique callback name so multiple concurrent calls never collide
            const cbName = '__ulb_tsCb_' + generateId();

            // ── Visible wrapper so user can manually click the checkbox if
            //    auto-solve stalls (same UX as before, no srcdoc needed) ─────────
            const wrapper = document.createElement('div');
            wrapper.style.cssText = [
                'position:fixed;bottom:calc(100px + env(safe-area-inset-bottom,0px));right:calc(28px + env(safe-area-inset-right,0px));z-index:2147483646',
                'background:linear-gradient(135deg,#1a1a2e,#16213e)',
                'border:1px solid rgba(255,255,255,.12);border-radius:10px',
                'box-shadow:0 8px 32px rgba(0,0,0,.5);padding:10px 12px',
                'display:flex;flex-direction:column;gap:6px',
                'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
            ].join(';');

            const label = document.createElement('div');
            label.style.cssText = 'font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase';
            label.textContent = 'Solving captcha… (click if stuck)';

            // Widget div rendered directly in this page's DOM — correct origin
            const widgetDiv = document.createElement('div');
            widgetDiv.setAttribute('data-sitekey', sitekey);
            widgetDiv.setAttribute('data-callback', cbName);
            widgetDiv.setAttribute('data-theme', 'dark');

            wrapper.append(label, widgetDiv);
            document.body.appendChild(wrapper);

            // ── Timeout guard ─────────────────────────────────────────────────
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('[ULB/Turnstile] timed out after 45s'));
            }, 45_000);

            function cleanup() {
                clearTimeout(timeout);
                try {
                    delete unsafeWindow[cbName];
                } catch {}
                setTimeout(() => wrapper.remove(), 600);
            }

            const onToken = token => {
                cleanup();
                resolve(token);
            };

            // Expose callback on unsafeWindow so CF's script (page-world) can call it
            unsafeWindow[cbName] = onToken;

            // ── Render via JS API if turnstile is already initialised ─────────
            const tryRenderApi = () => {
                const ts = unsafeWindow.turnstile;
                if(!ts?.render) return false;
                try {
                    ts.render(widgetDiv, {
                        sitekey,
                        theme: 'dark',
                        callback: onToken
                    });
                    return true;
                } catch (e) {
                    console.warn('[ULB/Turnstile] turnstile.render() threw:', e);
                    return false;
                }
            };

            if(!tryRenderApi()) {
                // CF script not yet present — inject it; data-callback fires once loaded
                if(!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
                    const s = document.createElement('script');
                    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                    s.async = true;
                    // After load, try the JS API path too (in case data-callback timing is off)
                    s.onload = () => tryRenderApi();
                    document.head.appendChild(s);
                } else {
                    // Script tag exists but turnstile object not ready yet — poll briefly
                    const poll = setInterval(() => {
                        if(tryRenderApi()) clearInterval(poll);
                    }, 150);
                    setTimeout(() => clearInterval(poll), 10_000);
                }
            }
        });
    }

    // ── CF hook: injected into challenges.cloudflare.com pages via @match.
    //    Spoofs isTrusted, auto-clicks the checkbox, and notifies parent.
    //    Must be defined before the early-return above uses it.
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

        // Helper: click unchecked checkbox in a root, then notify parent
        const tryClick = (root, frameId) => {
            const cb = root.querySelector('input[type=checkbox]');
            if(cb && !cb.checked) {
                try {
                    window.parent.postMessage({
                        __ulb: true,
                        __ulb_clicked: true,
                        id: frameId || ''
                    }, '*');
                } catch {}
                cb.click();
            }
        };

        // frameId is injected into the srcdoc via the template literal in solveTurnstile
        // When running via @match on a real CF page (not srcdoc), frameId is unknown — that's fine,
        // the parent listener matches on __ulb_clicked without needing id in that path.
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
                        } catch {}
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
            // Microtask scan for content already appended synchronously
            Promise.resolve().then(() => tryClick(root, frameId));
            return root;
        };

        // Also scan any shadow roots that already exist at injection time
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
            const m = s.textContent.match(/sitekey['":\s]+([0-9a-zA-Z_\-]{20,})/);
            if(m) return m[1];
        }
        return fallback;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── AIRFLOWSCRIPT.COM — DISCORD STEP BYPASSER ───────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function runAirflowBypasser() {
        const KEY = 'rinku_step1_done';
        if(localStorage.getItem(KEY) === 'true') return;
        notify('Bypassing Discord requirement…', 'loading', 3000);
        localStorage.setItem(KEY, 'true');
        location.reload();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── REKONISE.COM BYPASSER ───────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function runRekoniseBypasser() {
        const nh = notify('Rekonise — waiting for page…', 'loading', 0);

        const run = async () => {
            await new Promise(r => setTimeout(r, 5000));
            try {
                let token;
                const d = JSON.parse(document.getElementById('ng-state').textContent);
                for(const k in d)
                    if(d[k]?.b?.unlock_token) {
                        token = d[k].b.unlock_token;
                        break;
                    }
                if(!token) throw new Error('unlock_token not found');

                nh.update('Fetching destination…', 'loading');
                const s = location.pathname.split('/').pop();
                const u = `https://api.rekonise.com/social-unlocks/${s}/unlock?token=${encodeURIComponent(token)}`;
                const j = await (await fetch(u)).json();
                const dest = j.url || j;
                if(typeof dest !== 'string' || !dest.startsWith('http')) throw new Error('No valid URL in response');

                nh.update('Redirecting!', 'success');
                setTimeout(() => {
                    nh.remove();
                    location.href = dest;
                }, 800);
            } catch (err) {
                console.error('[Rekonise]', err);
                nh.update(`Error: ${err.message}`, 'error');
            }
        };

        if(document.readyState === 'complete') run();
        else window.addEventListener('load', run, {
            once: true
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── ROUTER ──────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    const host = location.hostname;
    if(host.includes('dl.surf')) runDlSurf();
    else if(host.includes('airflowscript.com')) runAirflowBypasser();
    else if(host.includes('rekonise.com')) runRekoniseBypasser();
    else if(TPI_HOSTS.some(h => host.includes(h))) runTpiLiBypasser();
    else if(FORM_HOSTS.some(h => host.includes(h))) runFormBypasser();
    else runSafelinkBypasser();

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── TPI.LI BYPASSER ─────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function runTpiLiBypasser() {
        const DELAY = 3; // seconds (visible countdown)

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
                notify('tpi.li: token not found — check console.', 'error', 6000);
                console.warn('[TpiLi] Could not find/decode token input.');
                return;
            }
            notify(`tpi.li decoded. Redirecting in ${DELAY}s…`, 'info', 4000);
            showCountdown(DELAY, () => {
                location.href = dest;
            }, 'tpi.li bypass');
        }

        function init() {
            notify('tpi.li bypasser active…', 'loading', 2500);
            // Try immediately; if token not yet injected, watch for it
            if(extractUrl()) {
                doBypass();
            } else {
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
                // Fallback poll
                let tries = 0;
                const iv = setInterval(() => {
                    if(extractUrl() || ++tries > 60) {
                        clearInterval(iv);
                        obs.disconnect();
                        if(extractUrl()) doBypass();
                    }
                }, 500);
            }
        }

        document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── SAFELINK BYPASSER ───────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function runSafelinkBypasser() {
        let scheduled = false;

        // ── Ad blocking ──────────────────────────────────────────────────────

        const AD_SEL = [
            'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]', 'iframe[src*="adservice"]',
            'div[id^="div-gpt-ad"]', 'ins.adsbygoogle', 'script[src*="pagead2.googlesyndication"]',
            'script[src*="securepubads"]', 'script[src*="adsbygoogle"]', 'script[src*="googletag"]',
            'div[class*="ad-"]', 'div[id*="-ad-"]', 'div[class*="ads-"]', '[data-ad-slot]', '[data-ad-client]',
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
            const t = el.tagName?.toLowerCase();
            return (t === 'script' || t === 'iframe') && src && AD_PAT.some(p => p.test(src));
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
            display: () => {}
        };

        window.adsbygoogle = {
            push: () => {}
        };

        const cleanAds = () =>
            AD_SEL.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));

        // ── Extract destination + delay ───────────────────────────────────────

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

        // ── Redirect notification ─────────────────────────────────────────────

        function showRedirectNotif(dest) {
            const card = document.createElement('div');
            card.style.cssText = `${BASE_CARD};border-left:3px solid #22c55e;padding:14px 18px;min-width:min(240px,calc(100vw - 56px));max-width:min(320px,calc(100vw - 56px))`;

            card.innerHTML = `
            <div style="${LABEL_CSS}:6px">Unknown Link Bypasser · @Aro Moon</div>
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

                if(rm) rm.textContent = 'Redirect may have stalled.';
                if(ri) {
                    ri.textContent = '⚠';
                    ri.style.color = '#f59e0b';
                }
                card.style.borderLeftColor = '#f59e0b';
            }, 3000);
        }

        // ── Scheduling ────────────────────────────────────────────────────────

        function scheduleBypass() {
            if(scheduled) return;

            const data = extract();
            if(!data || !data.dest) return;

            scheduled = true;

            notify(`Safelink decoded. Redirecting in ${data.delay}s.`, 'info', 5000);

            // IMPORTANT: only start countdown AFTER full page load
            const startCountdown = () => {
                showCountdown(data.delay, () => {
                    showRedirectNotif(data.dest);
                    window.location.replace(data.dest);
                }, 'Ads blocked');
            };

            if(document.readyState === 'complete') {
                startCountdown();
            } else {
                window.addEventListener('load', startCountdown, {
                    once: true
                });
            }
        }

        // ── Observer ──────────────────────────────────────────────────────────

        function startObserver() {
            const obs = new MutationObserver(mutations => {
                cleanAds();
                if(scheduled) return;

                for(const m of mutations) {
                    for(const n of m.addedNodes) {
                        if(
                            n.nodeType === 1 &&
                            (n.matches?.('input[name="newwpsafelink"]') ||
                                n.querySelector?.('input[name="newwpsafelink"]'))
                        ) {
                            scheduleBypass();
                            if(scheduled) obs.disconnect();
                        }
                    }
                }
            });

            obs.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }

        // ── Init ──────────────────────────────────────────────────────────────

        function init() {
            notify('Unknown Link Bypasser active — scanning…', 'loading', 3000);
            cleanAds();
            scheduleBypass();
            if(!scheduled) startObserver();
        }

        if(document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init, {
                once: true
            });
        }

        // ── Poll fallback ─────────────────────────────────────────────────────

        let attempts = 0;
        const poll = setInterval(() => {
            cleanAds();
            if(scheduled || ++attempts > 60) {
                clearInterval(poll);
            } else {
                scheduleBypass();
            }
        }, 500);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── FORM-BASED BYPASSER ─────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function runFormBypasser() {
        const _qs = Document.prototype.querySelector;

        Document.prototype.querySelector = function (sel) {
            if(typeof sel === 'string' && sel.includes('eecdbd')) {
                return this.createElement('div'); // use the same document context
            }
            return _qs.call(this, sel);
        };

        const RETRY_KEY = '__ulb_shrtslug_extra_delay';
        const extraDelaySec = parseInt(sessionStorage.getItem(RETRY_KEY) || '0', 10);

        const waitFor = (sel, ms = 100) => new Promise(res => {
            const id = setInterval(() => {
                const el = document.querySelector(sel);
                if(el) {
                    clearInterval(id);
                    res(el);
                }
            }, ms);
        });
        const waitBody = () => document.body ?
            Promise.resolve(document.body) :
            new Promise(r => document.addEventListener('DOMContentLoaded', () => r(document.body)));

        notify(
            extraDelaySec > 0 ?
            `Retry #${extraDelaySec} — adding ${extraDelaySec}s extra delay…` :
            'Form bypasser active — waiting for page…',
            extraDelaySec > 0 ? 'warn' : 'loading',
            extraDelaySec > 0 ? 4000 : 3000
        );

        waitFor('form[action*="api-endpoint/verify"]').then(async form => {
            const action = form.querySelector('input[name="action"]')?.value;
            const progressMatch = [...document.querySelectorAll('script')]
                .map(s => s.textContent.match(/progress_original\s*=\s*(\d+)/))
                .find(Boolean);
            const baseDelay = action === 'countdown' ? 5000 : progressMatch ? +progressMatch[1] * 1000 : 0;
            const delay = baseDelay + extraDelaySec * 1000;
            const seconds = Math.ceil(delay / 1000);
            const body = await waitBody();

            console.log('[FormBypasser] action:', action, '| wait:', seconds, 's');

            let nh = null;
            const setStatus = (msg, type) => nh ? nh.update(msg, type) : (nh = notify(msg, type, 0));

            const [captchaToken] = await Promise.all([
                action === 'captcha' ?
                (setStatus('Solving captcha automatically…', 'loading'), solveTurnstile(getSiteKey())) :
                Promise.resolve(null),
                seconds > 0 ?
                new Promise(res => showCountdown(seconds, res, 'Processing safelink…')) :
                Promise.resolve(),
            ]);

            setStatus('Fetching destination…', 'loading');

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
                console.log('[FormBypasser] result:', result);
            } catch (err) {
                const nextExtra = extraDelaySec + 1;
                sessionStorage.setItem(RETRY_KEY, String(nextExtra));
                setStatus(`Request error — reloading with +${nextExtra}s delay…`, 'warn');
                console.warn('[FormBypasser] fetch error, retrying:', nextExtra, err);
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
                setStatus('Redirecting!', 'success');
                setTimeout(() => nh?.remove(), 3000);
                if(final.toLowerCase().startsWith('http')) window.location = final;
                else unsafeWindow.setup_special_link?.(final) ??
                    console.warn('[FormBypasser] setup_special_link missing for:', final);
            } else if(next_page && speed_token) {
                setStatus('Next step — continuing…', 'loading');
                const next = Object.assign(document.createElement('form'), {
                    method: 'POST',
                    action: next_page
                });
                next.insertAdjacentHTML('beforeend', `<input type="hidden" name="speed_token" value="${speed_token}">`);
                body.appendChild(next);
                next.submit();
            } else {
                setStatus('Unexpected response — check console.', 'warn');
                console.warn('[FormBypasser] unrecognised result.data:', result.data);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── DL.SURF AUTO DOWNLOADER ─────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function runDlSurf() {
        const API = 'https://backendapi.dl.surf/api/file';
        const slug = location.pathname.split('/').filter(Boolean).pop();
        const DL_KEY = '0x4AAAAAABbfHaaMuK4MmNeI';

        const fetchJSON = async (url, opts) => {
            const r = await fetch(url, opts);
            if(!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            if(j.status !== 'success') throw new Error(j.message || 'API error');
            return j.data;
        };

        const getToken = () => fetchJSON(`${API}/request-download/file/${slug}/`, {
            headers: {
                Accept: 'application/json'
            }
        }).then(d => d.token);
        const getDownloadUrl = (tk, cap) => fetchJSON(`${API}/new-download-file/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Origin: location.origin,
                Referer: location.href
            },
            body: JSON.stringify({
                token: tk,
                captcha_token: cap
            }),
        }).then(d => d.url || d.download_url || d.link || d);

        const btn = Object.assign(document.createElement('button'), {
            title: 'Unknown Link Bypasser — Auto Download',
            innerHTML: 'Download via Bypasser'
        });
        let nh = null;
        const setStatus = (msg, type) => nh ? nh.update(msg, type) : (nh = notify(msg, type, 0));

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
            notify('dl.surf detected — bypasser ready.', 'info', 3000);
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
            try {
                setStatus('Requesting download token…', 'loading');
                const token = await getToken();
                setStatus('Solving captcha automatically…', 'loading');
                const cap = await solveTurnstile(DL_KEY);
                setStatus('Fetching download URL…', 'loading');
                const url = await getDownloadUrl(token, cap);
                if(typeof url === 'string' && url.startsWith('http')) {
                    setStatus('Download started!', 'success');
                    // iOS Safari blocks programmatic clicks on <a download>; use window.open as fallback
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
                    // iOS fallback: open in new tab if download didn't trigger
                    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                    if(isIOS) window.open(url, '_blank');
                } else {
                    setStatus('Unexpected response — check console.', 'warn');
                }
                setTimeout(() => {
                    nh?.remove();
                    nh = null;
                }, 4000);
            } catch (err) {
                console.error('[dl.surf]', err);
                setStatus(`Error: ${err.message}`, 'error');
                setTimeout(() => {
                    nh?.remove();
                    nh = null;
                }, 5000);
            } finally {
                btn.disabled = false;
            }
        });
    }

})();
