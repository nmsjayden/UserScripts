// ==UserScript==
// @name         Auto Luarmor V2
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      4.7.6
// @description  Auto Luarmor — early ad bypass, themes, sizes, multi-key, key management, API bypass
// @author       Aro
// @match        https://ads.luarmor.net/get_key?*
// @match        https://ads.luarmor.net/blacklisted
// @downloadURL  https://raw.githubusercontent.com/nmsjayden/UserScripts/refs/heads/main/AutoLuarmor.js
// @updateURL    https://raw.githubusercontent.com/nmsjayden/UserScripts/refs/heads/main/AutoLuarmor.js
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @supportURL   https://discord.gg/VhG4TJD5QY
// ==/UserScript==

(function () {
    "use strict";

    // ─────────────────────────────────────────────
    // STEALTH
    // ─────────────────────────────────────────────

    (() => {
        ["GM_info", "GM_getValue", "GM_setValue", "GM_xmlhttpRequest", "GM_addStyle", "GM_deleteValue", "GM_listValues", "GM_getResourceText", "GM_getResourceURL", "GM_openInTab", "GM_registerMenuCommand", "GM_setClipboard", "GM_xmlhttpRequest", "unsafeWindow"].forEach(k => {
            try {
                Object.defineProperty(window, k, {
                    get: () => undefined,
                    configurable: false,
                    enumerable: false
                });
            } catch (_) {}
        });

        try {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
                configurable: false
            });
        } catch (_) {}

        try {
            Object.defineProperty(navigator, 'plugins', {
                get: () => {
                    const fakes = ["Chrome PDF Plugin", "Chrome PDF Viewer", "Native Client"];
                    return Object.assign(fakes.map(name => ({
                        name,
                        filename: name.toLowerCase().replace(/ /g, '_') + '.so',
                        description: ''
                    })), {
                        length: fakes.length,
                        item: i => fakes[i],
                        namedItem: n => fakes.find(f => f.name === n) ?? null,
                        refresh: () => {}
                    });
                },
                configurable: false
            });
        } catch (_) {}

        try {
            const _origFetch = window.fetch.bind(window);
            window.fetch = function (input, init = {}) {
                if(init.headers) {
                    const cleaned = {};
                    for(const [k, v] of Object.entries(init.headers)) {
                        if(!k.toLowerCase().startsWith('x-tm') && !k.toLowerCase().startsWith('tamper')) {
                            cleaned[k] = v;
                        }
                    }
                    init.headers = cleaned;
                }
                return _origFetch(input, init);
            };
            Object.defineProperty(window.fetch, 'name', {
                value: 'fetch'
            });
            Object.defineProperty(window.fetch, 'length', {
                value: 1
            });
        } catch (_) {}

        try {
            const _dbg = console.debug.bind(console);
            const _log = console.log.bind(console);
            console.debug = (...a) => {
                if(!String(a[0]).startsWith('[ALv4')) _dbg(...a);
            };
            console.log = (...a) => {
                if(!String(a[0]).startsWith('[ALv4')) _log(...a);
            };
        } catch (_) {}

    })();

    // ─────────────────────────────────────────────
    // API BYPASS CONFIG
    // ─────────────────────────────────────────────

    const API_BYPASS_ENDPOINT = "https://trw.lat/api/bypass";

    // ─────────────────────────────────────────────
    // AD BYPASS METHODS
    // ─────────────────────────────────────────────

    const BYPASS_METHODS = {
        none: {
            name: "None"
        },
        dom: {
            name: "DOM Nuke"
        },
        script: {
            name: "Script Removal"
        },
        whitelist: {
            name: "Popup Whitelist"
        },
        blacklist: {
            name: "Popup Blacklist"
        },
    };

    const POPUP_WHITELIST = ["link-hub.net", "link-target.net", "work.ink", "linkvertise.com", "lootlabs.gg"];
    const POPUP_BLACKLIST = ["oundhertobeconsist.org"];

    const FakeWindow = (() => {
        let closed = false;
        let href = "about:blank";
        let name = "";
        let status = "";

        const realProto = Object.getPrototypeOf(window);

        const fake = Object.create(realProto);

        /* ======================
           Helper: clone descriptor
        ======================= */
        const mirrorProp = (target, source, key) => {
            const desc = Object.getOwnPropertyDescriptor(source, key);
            if(desc) Object.defineProperty(target, key, desc);
        };

        /* ======================
           Location (minimal but realistic)
        ======================= */
        const fakeLocation = Object.create(Location.prototype);

        Object.defineProperties(fakeLocation, {
            href: {
                get() {
                    return href;
                },
                set(v) {
                    href = String(v);
                },
                enumerable: true
            },
            assign: {
                value: function (url) {
                    href = String(url);
                },
            },
            replace: {
                value: function (url) {
                    href = String(url);
                },
            },
            reload: {
                value: function () {},
            },
            toString: {
                value: function () {
                    return href;
                }
            }
        });

        /* ======================
           Core Window Props
        ======================= */
        Object.defineProperties(fake, {

            closed: {
                get() {
                    return closed;
                }
            },

            name: {
                get() {
                    return name;
                },
                set(v) {
                    name = String(v);
                }
            },

            status: {
                get() {
                    return status;
                },
                set(v) {
                    status = String(v);
                }
            },

            location: {
                get() {
                    return fakeLocation;
                },
                set(v) {
                    href = String(v);
                }
            },

            document: {
                value: document
            },

            navigator: {
                value: navigator
            },

            screen: {
                value: screen
            },

            history: {
                value: history
            },

            innerWidth: {
                get: () => window.innerWidth
            },
            innerHeight: {
                get: () => window.innerHeight
            },
            outerWidth: {
                get: () => window.outerWidth
            },
            outerHeight: {
                get: () => window.outerHeight
            },
            devicePixelRatio: {
                get: () => window.devicePixelRatio
            },

            self: {
                get() {
                    return fake;
                }
            },

            window: {
                get() {
                    return fake;
                }
            },

            top: {
                get() {
                    return fake;
                }
            },

            parent: {
                get() {
                    return fake;
                }
            },

            opener: {
                value: null
            }

        });

        /* ======================
           Native-looking close()
        ======================= */
        Object.defineProperty(fake, "close", {
            value: function close() {
                closed = true;
            }
        });

        /* ======================
           Delegate timers properly
        ======================= */
        [
            "setTimeout",
            "clearTimeout",
            "setInterval",
            "clearInterval",
            "requestAnimationFrame",
            "cancelAnimationFrame"
        ].forEach(fn => {
            Object.defineProperty(fake, fn, {
                value: window[fn].bind(window)
            });
        });

        /* ======================
           Make it pass brand checks
        ======================= */
        Object.defineProperty(fake, Symbol.toStringTag, {
            value: "Window"
        });

        return fake;
    })();

    const SCRIPT_BLOCKED_DOMAINS = [
        "doubleclick.net", "googlesyndication.com", "adservice.google.com", "cloudfront.net",
        "popads.net", "popcash.net", "trafficjunky.net", "adnxs.com", "adsrvr.org",
        "rubiconproject.com", "openx.net", "pubmatic.com", "adf.ly",
    ];

    function getPopupHostname(url) {
        try {
            return new URL(url, location.href).hostname;
        } catch (_) {
            return "";
        }
    }

    function hostMatchesList(hostname, list) {
        return list.some(d => hostname === d || hostname.endsWith("." + d));
    }

    const _pageWindow = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    const origWindowOpen = _pageWindow.open.bind(_pageWindow);
    let popupMode = "none",
        scriptRemovalObserver = null,
        scriptRemovalInstalled = false;

    function installPopupWhitelist() {
        if(popupMode === "whitelist") return;
        popupMode = "whitelist";
        _pageWindow.open = function (url, target, features) {
            const host = getPopupHostname(url || "");
            if(hostMatchesList(host, POPUP_WHITELIST)) return origWindowOpen(url, target, features);
            return FakeWindow;
        };
    }

    function installPopupBlacklist() {
        if(popupMode === "blacklist") return;
        popupMode = "blacklist";
        _pageWindow.open = function (url, target, features) {
            const host = getPopupHostname(url || "");
            if(hostMatchesList(host, POPUP_BLACKLIST)) return FakeWindow;
            return origWindowOpen(url, target, features);
        };
    }

    function uninstallPopupOverride() {
        if(popupMode === "none") return;
        popupMode = "none";
        _pageWindow.open = origWindowOpen;
    }

    function isBlockedScriptSrc(src) {
        if(!src) return false;
        try {
            const u = new URL(src, location.href);
            return SCRIPT_BLOCKED_DOMAINS.some(d => u.hostname === d || u.hostname.endsWith("." + d));
        } catch (_) {
            return false;
        }
    }

    function sweepBlockedScripts() {
        document.querySelectorAll("script[src]").forEach(s => {
            if(isBlockedScriptSrc(s.src)) {
                s.remove();
                console.debug("[ALv4 ScriptRemoval] Swept:", s.src);
            }
        });
        document.querySelectorAll("iframe[src]").forEach(f => {
            try {
                const u = new URL(f.src, location.href);
                if(SCRIPT_BLOCKED_DOMAINS.some(d => u.hostname === d || u.hostname.endsWith("." + d))) {
                    f.remove();
                    console.debug("[ALv4 ScriptRemoval] Swept iframe:", f.src);
                }
            } catch (_) {}
        });
    }

    function installScriptRemoval() {
        if(scriptRemovalInstalled) return;
        scriptRemovalInstalled = true;

        const origCreate = document.createElement.bind(document);
        document.createElement = function (tagName, options) {
            const elem = origCreate(tagName, options);
            if(tagName.toLowerCase() === "script") {
                let _src = "";
                Object.defineProperty(elem, "src", {
                    set(value) {
                        if(isBlockedScriptSrc(value)) {
                            console.debug("[ALv4 ScriptRemoval] Blocked createElement src:", value);
                            return;
                        }
                        _src = value;
                        elem.setAttribute("src", value);
                    },
                    get() {
                        return _src;
                    },
                    configurable: true,
                });
            }
            return elem;
        };

        if(scriptRemovalObserver) scriptRemovalObserver.disconnect();
        scriptRemovalObserver = new MutationObserver(mutations => {
            for(const m of mutations) {
                // Catch src being set via setAttribute after insertion
                if(m.type === "attributes" && m.attributeName === "src") {
                    const n = m.target;
                    if((n.tagName === "SCRIPT" || n.tagName === "IFRAME") && isBlockedScriptSrc(n.src)) {
                        n.remove();
                        console.debug("[ALv4 ScriptRemoval] Blocked attr mutation:", n.src);
                        continue;
                    }
                }
                for(const n of m.addedNodes) {
                    if(n.nodeType !== 1) continue;
                    if((n.tagName === "SCRIPT" || n.tagName === "IFRAME") && isBlockedScriptSrc(n.src)) {
                        n.remove();
                        console.debug("[ALv4 ScriptRemoval] Blocked added node:", n.src);
                        continue;
                    }
                    n.querySelectorAll?.("script[src],iframe[src]").forEach(s => {
                        if(isBlockedScriptSrc(s.src)) {
                            s.remove();
                            console.debug("[ALv4 ScriptRemoval] Blocked nested node:", s.src);
                        }
                    });
                }
            }
        });

        scriptRemovalObserver.observe(document.documentElement || document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["src"],
        });

        // Sweep already-present scripts immediately
        sweepBlockedScripts();

        // Sweep again once DOM is fully parsed
        if(document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", sweepBlockedScripts, {
                once: true
            });
        }

        // Sweep once more after full page load (catches async/deferred)
        window.addEventListener("load", sweepBlockedScripts, {
            once: true
        });
    }

    function uninstallScriptRemoval() {
        if(!scriptRemovalInstalled) return;
        scriptRemovalInstalled = false;
        if(scriptRemovalObserver) {
            scriptRemovalObserver.disconnect();
            scriptRemovalObserver = null;
        }
    }

    // ─────────────────────────────────────────────
    // EARLY INSTALL
    // ─────────────────────────────────────────────

    function peekBypassMethod() {
        try {
            const v = GM_getValue("_alv3g_bypassMethod", null);
            return v ? JSON.parse(v) : "none";
        } catch (_) {
            return "none";
        }
    }
    const earlyMethod = peekBypassMethod();
    if(earlyMethod === "whitelist") installPopupWhitelist();
    if(earlyMethod === "blacklist") installPopupBlacklist();
    if(earlyMethod === "script") installScriptRemoval();

    // ─────────────────────────────────────────────
    // KEYSYSTEM ID
    // ─────────────────────────────────────────────

    function getKeysystemId() {
        try {
            const p = new URLSearchParams(location.search);
            for(const k of ["script", "hub", "game", "id", "key_id"]) {
                const v = p.get(k);
                if(v) return v.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
            }
            let h = 0;
            for(let i = 0; i < location.search.length; i++)
                h = (Math.imul(31, h) + location.search.charCodeAt(i)) | 0;
            return "ks_" + Math.abs(h).toString(36);
        } catch {
            return "default";
        }
    }
    const KS_ID = getKeysystemId();

    // ─────────────────────────────────────────────
    // STORAGE
    // ─────────────────────────────────────────────

    const _KP = btoa("alv3g").replace(/=/g, ''); // global prefix
    const _KPL = btoa("alv3_" + KS_ID).replace(/=/g, '').slice(0, 10); // per-keysystem prefix

    const store = {
        getG: (k, d = null) => {
            try {
                const v = GM_getValue(_KP + "_" + k, null);
                return v === null ? d : JSON.parse(v);
            } catch {
                return d;
            }
        },
        setG: (k, v) => {
            try {
                GM_setValue(_KP + "_" + k, JSON.stringify(v));
            } catch {}
        },
        get: (k, d = null) => {
            try {
                const v = GM_getValue(`${_KPL}_${k}`, null);
                return v === null ? d : JSON.parse(v);
            } catch {
                return d;
            }
        },
        set: (k, v) => {
            try {
                GM_setValue(`${_KPL}_${k}`, JSON.stringify(v));
            } catch {}
        },
    };

    // ─────────────────────────────────────────────
    // TIMING
    // ─────────────────────────────────────────────

    function gaussRand(mean, std) {
        let u = 0,
            v = 0;
        while(!u) u = Math.random();
        while(!v) v = Math.random();
        return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function humanDelay(base, variance = base * 0.25, min = 150, max = base * 3) {
        return Math.max(min, Math.min(max, Math.round(gaussRand(base, variance))));
    }

    function userDelay(ms) {
        if(!ms || ms <= 0) return humanDelay(200, 60, 80, 450);
        return humanDelay(ms, ms * 0.15, Math.round(ms * 0.7), Math.round(ms * 1.5));
    }
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    function sleepPauseable(ms, intervalMs = 100) {
        return new Promise(resolve => {
            if(ms <= 0) {
                resolve(true);
                return;
            }
            const end = Date.now() + ms;
            let tid;

            function check() {
                if(paused) {
                    resolve(false);
                    return;
                }
                const remaining = end - Date.now();
                if(remaining <= 0) {
                    resolve(true);
                    return;
                }
                tid = setTimeout(check, Math.min(intervalMs, remaining));
            }
            tid = setTimeout(check, Math.min(intervalMs, ms));
        });
    }

    // ─────────────────────────────────────────────
    // TIMER HELPERS
    // ─────────────────────────────────────────────

    function parseHMS(str) {
        if(!str) return null;
        const m = str.trim().match(/(\d+):(\d{2}):(\d{2})/);
        if(!m) return null;
        return +m[1] * 3600 + +m[2] * 60 + +m[3];
    }

    function fmtHMS(s) {
        if(s === null || s < 0) return "—";
        const h = Math.floor(s / 3600),
            mn = Math.floor((s % 3600) / 60),
            sc = s % 60;
        return `${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(sc).padStart(2,"0")}`;
    }

    // ─────────────────────────────────────────────
    const THEMES = {
        void: {
            name: "Void",
            bg: "#0e0e10",
            bg2: "#111114",
            bg3: "#13131a",
            bgOpt: "#0a0a0e",
            border: "#252530",
            border2: "#1c1c24",
            border3: "#1e1e28",
            text: "#c9c9d3",
            textBright: "#e0e0e8",
            textDim: "#3a3a4a",
            textMid: "#585870",
            accent: "#3ddc84",
            accentDim: "rgba(61,220,132,.1)",
            accentBorder: "rgba(61,220,132,.2)",
            warn: "#f4b942",
            err: "#ff4d6d",
            btnBg: "#16161e",
            btnBorder: "#242436",
            hdrBtn: "#1a1a22",
            hdrBtnBorder: "#2a2a36",
            pill: "#111114",
            radius: "9px"
        },
        midnight: {
            name: "Midnight",
            bg: "#0a0d14",
            bg2: "#0d1018",
            bg3: "#111520",
            bgOpt: "#070a10",
            border: "#1e2535",
            border2: "#182030",
            border3: "#1a2232",
            text: "#b8c8e8",
            textBright: "#d8e8ff",
            textDim: "#304060",
            textMid: "#506080",
            accent: "#5b9cf6",
            accentDim: "rgba(91,156,246,.1)",
            accentBorder: "rgba(91,156,246,.2)",
            warn: "#f4b942",
            err: "#ff5577",
            btnBg: "#111828",
            btnBorder: "#1e2d45",
            hdrBtn: "#141e2e",
            hdrBtnBorder: "#1e2d45",
            pill: "#0d1018",
            radius: "9px"
        },
        ember: {
            name: "Ember",
            bg: "#120b08",
            bg2: "#17100c",
            bg3: "#1c1410",
            bgOpt: "#0e0906",
            border: "#35200f",
            border2: "#2a1a0c",
            border3: "#30190c",
            text: "#e8c8a8",
            textBright: "#ffeedd",
            textDim: "#503020",
            textMid: "#906040",
            accent: "#ff8c42",
            accentDim: "rgba(255,140,66,.1)",
            accentBorder: "rgba(255,140,66,.2)",
            warn: "#ffd166",
            err: "#ff4d6d",
            btnBg: "#1a100a",
            btnBorder: "#35200f",
            hdrBtn: "#1e130c",
            hdrBtnBorder: "#35200f",
            pill: "#17100c",
            radius: "9px"
        },
        ghost: {
            name: "Ghost",
            bg: "#f0f0f5",
            bg2: "#e8e8ef",
            bg3: "#dcdce8",
            bgOpt: "#e4e4ee",
            border: "#c0c0d0",
            border2: "#c8c8da",
            border3: "#cacadc",
            text: "#303040",
            textBright: "#101020",
            textDim: "#9090a8",
            textMid: "#606080",
            accent: "#6040d0",
            accentDim: "rgba(96,64,208,.08)",
            accentBorder: "rgba(96,64,208,.25)",
            warn: "#d48010",
            err: "#cc2244",
            btnBg: "#e0e0ec",
            btnBorder: "#c0c0d4",
            hdrBtn: "#d8d8e8",
            hdrBtnBorder: "#c0c0d4",
            pill: "#e8e8ef",
            radius: "9px"
        },
        matrix: {
            name: "Matrix",
            bg: "#020c02",
            bg2: "#041004",
            bg3: "#061406",
            bgOpt: "#020a02",
            border: "#0a2a0a",
            border2: "#0c2a0c",
            border3: "#0e300e",
            text: "#80e080",
            textBright: "#b0ffb0",
            textDim: "#1a4a1a",
            textMid: "#2d6e2d",
            accent: "#00ff41",
            accentDim: "rgba(0,255,65,.08)",
            accentBorder: "rgba(0,255,65,.2)",
            warn: "#ffe000",
            err: "#ff2200",
            btnBg: "#041004",
            btnBorder: "#0a2a0a",
            hdrBtn: "#061406",
            hdrBtnBorder: "#0a2a0a",
            pill: "#041004",
            radius: "3px"
        },
        solar: {
            name: "Solar",
            bg: "#fff6e5",
            bg2: "#fff0d4",
            bg3: "#ffe9c1",
            bgOpt: "#fff8e8",
            border: "#ffd890",
            border2: "#ffcd66",
            border3: "#ffc233",
            text: "#3a2f1c",
            textBright: "#1a1205",
            textDim: "#8c7b5e",
            textMid: "#5a472c",
            accent: "#ff7f0f",
            accentDim: "rgba(255,127,15,.1)",
            accentBorder: "rgba(255,127,15,.2)",
            warn: "#e8590c",
            err: "#ff2e00",
            btnBg: "#fff0d4",
            btnBorder: "#ffd890",
            hdrBtn: "#ffe9c1",
            hdrBtnBorder: "#ffd890",
            pill: "#fff6e5",
            radius: "8px"
        },
        ocean: {
            name: "Ocean",
            bg: "#002b36",
            bg2: "#003847",
            bg3: "#004c6d",
            bgOpt: "#00252e",
            border: "#02556c",
            border2: "#016a8c",
            border3: "#0180a8",
            text: "#cce7ff",
            textBright: "#e0f7ff",
            textDim: "#607c8a",
            textMid: "#3d667c",
            accent: "#00cfff",
            accentDim: "rgba(0,207,255,.08)",
            accentBorder: "rgba(0,207,255,.2)",
            warn: "#ffd166",
            err: "#ff4d6d",
            btnBg: "#003847",
            btnBorder: "#02556c",
            hdrBtn: "#004c6d",
            hdrBtnBorder: "#02556c",
            pill: "#003847",
            radius: "10px"
        },
        neon: {
            name: "Neon",
            bg: "#0d0d0d",
            bg2: "#111111",
            bg3: "#151515",
            bgOpt: "#0a0a0a",
            border: "#222222",
            border2: "#333333",
            border3: "#444444",
            text: "#f0f0f0",
            textBright: "#ffffff",
            textDim: "#808080",
            textMid: "#b0b0b0",
            accent: "#ff00ff",
            accentDim: "rgba(255,0,255,.1)",
            accentBorder: "rgba(255,0,255,.2)",
            warn: "#ffdd00",
            err: "#ff4444",
            btnBg: "#111111",
            btnBorder: "#222222",
            hdrBtn: "#151515",
            hdrBtnBorder: "#222222",
            pill: "#111111",
            radius: "12px"
        },
        forest: {
            name: "Forest",
            bg: "#0b1f0b",
            bg2: "#0e2a0e",
            bg3: "#123412",
            bgOpt: "#081908",
            border: "#1b4d1b",
            border2: "#236623",
            border3: "#2a7f2a",
            text: "#c0e0c0",
            textBright: "#e0ffe0",
            textDim: "#406040",
            textMid: "#608060",
            accent: "#3ddc84",
            accentDim: "rgba(61,220,132,.1)",
            accentBorder: "rgba(61,220,132,.2)",
            warn: "#ffe066",
            err: "#ff4466",
            btnBg: "#0e2a0e",
            btnBorder: "#1b4d1b",
            hdrBtn: "#123412",
            hdrBtnBorder: "#1b4d1b",
            pill: "#0e2a0e",
            radius: "9px"
        },
        desert: {
            name: "Desert",
            bg: "#fff8e5",
            bg2: "#fff1d1",
            bg3: "#ffe6b8",
            bgOpt: "#fff9eb",
            border: "#e0c080",
            border2: "#d4aa55",
            border3: "#c78f33",
            text: "#4a3620",
            textBright: "#2a1c0a",
            textDim: "#907750",
            textMid: "#5a4220",
            accent: "#ff9900",
            accentDim: "rgba(255,153,0,.1)",
            accentBorder: "rgba(255,153,0,.2)",
            warn: "#ff6600",
            err: "#ff0000",
            btnBg: "#fff1d1",
            btnBorder: "#e0c080",
            hdrBtn: "#ffe6b8",
            hdrBtnBorder: "#e0c080",
            pill: "#fff8e5",
            radius: "8px"
        },
        candy: {
            name: "Candy",
            bg: "#fff0f8",
            bg2: "#ffe8f0",
            bg3: "#ffddee",
            bgOpt: "#fff4fb",
            border: "#ffb0d4",
            border2: "#ff99c8",
            border3: "#ff80bc",
            text: "#402030",
            textBright: "#201018",
            textDim: "#a08090",
            textMid: "#804060",
            accent: "#ff33cc",
            accentDim: "rgba(255,51,204,.1)",
            accentBorder: "rgba(255,51,204,.2)",
            warn: "#ff8844",
            err: "#ff2255",
            btnBg: "#ffe8f0",
            btnBorder: "#ffb0d4",
            hdrBtn: "#ffddee",
            hdrBtnBorder: "#ffb0d4",
            pill: "#fff0f8",
            radius: "11px"
        },
        aurora: {
            name: "Aurora",
            bg: "#0b0f20",
            bg2: "#0f1328",
            bg3: "#13182f",
            bgOpt: "#090c1a",
            border: "#203050",
            border2: "#304070",
            border3: "#405090",
            text: "#a0d0ff",
            textBright: "#c0f0ff",
            textDim: "#406080",
            textMid: "#6080a0",
            accent: "#66ffdd",
            accentDim: "rgba(102,255,221,.1)",
            accentBorder: "rgba(102,255,221,.2)",
            warn: "#ffe066",
            err: "#ff4466",
            btnBg: "#0f1328",
            btnBorder: "#203050",
            hdrBtn: "#13182f",
            hdrBtnBorder: "#203050",
            pill: "#0f1328",
            radius: "10px"
        }
    };

    const SIZES = {
        compact: {
            name: "Compact",
            scale: 0.82,
            width: 255
        },
        normal: {
            name: "Normal",
            scale: 1.00,
            width: 288
        },
        large: {
            name: "Large",
            scale: 1.18,
            width: 330
        },
        xl: {
            name: "XL",
            scale: 1.35,
            width: 370
        },
    };
    // ─────────────────────────────────────────────

    // ─────────────────────────────────────────────
    // DOM NUKE
    // ─────────────────────────────────────────────

    let bypassDone = false,
        bypassInProgress = false;

    async function performDomNuke(delayMs) {
        if(bypassDone || bypassInProgress) return;
        bypassInProgress = true;
        const waitMs = Math.max(0, delayMs ?? 0);
        if(waitMs > 0) {
            setAction(`Ad bypass: nuking in ${Math.round(waitMs/1000)}s…`);
            await sleep(waitMs);
        }
        setAction("Ad bypass: nuking DOM…");
        let snapshot = null;
        try {
            snapshot = document.documentElement.cloneNode(true);
        } catch (_) {}
        try {
            window.stop();
        } catch (_) {}
        document.querySelectorAll("script,iframe,object,embed,video[autoplay]").forEach(el => {
            try {
                el.remove();
            } catch (_) {}
        });
        try {
            document.open();
            document.write("<!DOCTYPE html><html><head></head><body></body></html>");
            document.close();
            if(snapshot) {
                try {
                    document.replaceChild(snapshot, document.documentElement);
                } catch (_) {
                    if(snapshot.querySelector("body")) document.body.innerHTML = snapshot.querySelector("body").innerHTML;
                }
            }
        } catch (_) {}
        await sleep(250);
        try {
            document.documentElement.appendChild(host);
        } catch (_) {}
        try {
            if(document.body && !document.getElementById("_alv3_tooltip")) document.body.appendChild(tooltipEl);
        } catch (_) {}
        rebindEvents();
        const banner = $("bypassBanner");
        if(banner) {
            banner.textContent = "⚡ DOM Nuke complete";
            banner.style.display = "";
        }
        bypassDone = true;
        bypassInProgress = false;
        setAction("Ad bypass done — resuming…");
        currentKeyText = null;
        cdSecs = null;
        cdJustExpired = false;
        keySlots = [];
        resetRun();
        let sc = 0;
        const rs = setInterval(() => {
            syncFromPage();
            renderKeyList();
            if(++sc >= 20) clearInterval(rs);
        }, 300);
        schedule(humanDelay(800, 200, 400, 1500));
    }

    // ─────────────────────────────────────────────
    // BYPASS ROUTER
    // ─────────────────────────────────────────────

    function applyBypassMethod(method, delayMs) {
        uninstallPopupOverride();
        uninstallScriptRemoval();
        const banner = $("bypassBanner");
        switch(method) {
        case "dom":
            if(banner) {
                banner.textContent = "⚡ DOM Nuke active";
                banner.style.display = "";
            }
            if(!bypassDone) performDomNuke(delayMs);
            break;
        case "script":
            installScriptRemoval();
            if(banner) {
                banner.textContent = "🛡 Script Removal active";
                banner.style.display = "";
            }
            break;
        case "whitelist":
            installPopupWhitelist();
            if(banner) {
                banner.textContent = "✅ Popup Whitelist active";
                banner.style.display = "";
            }
            break;
        case "blacklist":
            installPopupBlacklist();
            if(banner) {
                banner.textContent = "🚫 Popup Blacklist active";
                banner.style.display = "";
            }
            break;
        default:
            if(banner) banner.style.display = "none";
            setDot("ok");
            break;
        }
    }

    // ─────────────────────────────────────────────
    // API BYPASS ENGINE
    // ─────────────────────────────────────────────

    /**
     * Capture next popup URL.
     * Focuses the window BEFORE setting up the intercept so the click actually fires window.open.
     */
    function captureNextPopupUrl() {
        return new Promise(resolve => {
            const target = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            target.focus();
            const prev = target.open;
            const timeout = setTimeout(() => {
                try {
                    target.open = prev;
                } catch (_) {}
                resolve(null);
            }, 5000);
            target.open = function (url, t, features) {
                clearTimeout(timeout);
                try {
                    target.open = prev;
                } catch (_) {}
                console.debug("[ALv4 API Bypass] Captured popup URL:", url);
                resolve(typeof url === "string" && url.trim() ? url : null);
                return FakeWindow;
            };
        });
    }

    function getApiKey() {
        const key = store.getG("apiKey", "");
        return (typeof key === "string" && key.trim()) ? key.trim() : null;
    }

    async function callBypassApi(url, apiKey) {
        try {
            const apiUrl = `${API_BYPASS_ENDPOINT}?apikey=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(url)}&refresh=true`;
            log("API bypass: calling API…");
            const resp = await fetch(apiUrl);
            if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if(data && data.success === true && typeof data.result === "string") {
                log("API bypass: success → " + data.result.slice(0, 60));
                return data.result;
            }
            log("API bypass: API returned failure");
            return null;
        } catch (e) {
            log("API bypass: fetch error — " + e.message);
            return null;
        }
    }

    const MAX_API_RETRIES = 3;

    async function runApiBypassFlow(capturedUrl) {
        const apiKey = getApiKey();
        if(!apiKey) {
            log("API bypass disabled: no API key.");
            setAction("API key missing");
            return null;
        }
        log("API bypass: using URL → " + capturedUrl.slice(0, 80));
        for(let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
            setAction(`API bypass: attempt ${attempt}/${MAX_API_RETRIES}…`);
            const result = await callBypassApi(capturedUrl, apiKey);
            if(result) return result;
            if(attempt < MAX_API_RETRIES) {
                log(`API bypass: attempt ${attempt} failed — retrying in 1.5s…`);
                await sleep(1500);
            }
        }
        log(`API bypass: all ${MAX_API_RETRIES} attempts failed`);
        return null;
    }

    /**
     * Unified API bypass click handler (used in both idle and wait_unlock phases).
     * Returns: "no_key" | "redirected" | "paused" | "no_url" | "failed"
     */
    async function doApiBypassClick(btn, step) {
        const apiKey = getApiKey();
        if(!apiKey) {
            log("API bypass FAILED: no API key set.");
            setAction("No API key set");
            setDot("error");
            return "no_key";
        }

        setDot("bypass");
        setAction("API bypass: capturing ad URL…");
        log("API bypass: intercepting window.open");

        if(opts.clickDelay > 0) await sleep(userDelay(opts.clickDelay));

        // captureNextPopupUrl() calls window.focus() internally before setting intercept
        const urlPromise = captureNextPopupUrl();
        await humanClick(btn);
        const capturedUrl = await urlPromise;

        if(!capturedUrl) {
            log("API bypass: no URL captured (window.open not called?)");
            setAction("API bypass: no popup intercepted…");
            if(opts.apiFallback) {
                log("API bypass: falling back to normal click");
                tryGrabAdTab();
                _pageWindow.open = origWindowOpen;
                await humanClick(btn);
            } else {
                clickedStepsThisLoad.delete(step);
                lastClickedStep = step - 1;
            }
            setDot("ok");
            return "no_url";
        }

        log("API bypass: captured URL — " + capturedUrl.slice(0, 60));

        if(opts.apiBypassDelay > 0) {
            const secs = Math.round(opts.apiBypassDelay / 1000);
            setAction(`API bypass: waiting ${secs}s before calling API…`);
            const completed = await sleepPauseable(opts.apiBypassDelay);
            if(!completed) {
                log("API bypass: paused during delay — aborting");
                clickedStepsThisLoad.delete(step);
                lastClickedStep = step - 1;
                setDot("ok");
                return "paused";
            }
        }

        const bypassedUrl = await runApiBypassFlow(capturedUrl);

        if(bypassedUrl) {
            setAction("API bypass: opening bypass in background tab…");
            log("API bypass: opening ad URL then redirecting to bypass");

            // Open the original ad URL first (satisfies the ad impression check)
            const adTab = origWindowOpen(capturedUrl, "_blank");

            await sleep(humanDelay(1200, 300, 800, 2000));

            // Redirect that tab to the bypassed URL
            if(adTab && !adTab.closed) {
                try {
                    adTab.location.href = bypassedUrl;
                } catch (_) {
                    // cross-origin block — try replace instead
                    try {
                        adTab.location.replace(bypassedUrl);
                    } catch (_) {}
                }
            }

            setAction("API bypass: waiting for tab to process…");
            log("API bypass: redirected ad tab to bypass URL, waiting 5s…");

            // Wait 5 seconds then close the tab and reload this page
            await sleep(5000);

            if(adTab && !adTab.closed) {
                try {
                    adTab.close();
                } catch (_) {}
            }

            log("API bypass: ad tab closed — reloading page");
            setAction("API bypass: reloading…");
            await sleep(humanDelay(400, 100, 200, 700));
            location.reload();
            return "redirected";
        }

        // All retries exhausted
        if(opts.apiFallback) {
            log("API bypass: all retries failed — falling back to normal click");
            setAction("API bypass failed — falling back…");
            tryGrabAdTab();
            _pageWindow.open = origWindowOpen;
            await humanClick(btn);
        } else {
            log("API bypass: all retries failed — marking error");
            setAction("API bypass error — will retry next step…");
            setDot("error");
            await sleep(2000);
            setDot("ok");
            clickedStepsThisLoad.delete(step);
            lastClickedStep = step - 1;
        }
        setDot("ok");
        return "failed";
    }

    // ─────────────────────────────────────────────
    // SHADOW DOM HOST
    // ─────────────────────────────────────────────

    const PANEL_MARGIN = 10;
    const host = document.createElement("div");
    host.id = "ext_" + btoa(Math.random().toString()).replace(/[^a-zA-Z]/g, '').slice(0, 7).toLowerCase();
    host.dataset.component = "ui";
    host.dataset.v = Math.floor(Math.random() * 99999);
    host.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;";

    function attachHost() {
        (document.documentElement || document.body || document).appendChild(host);
    }
    if(document.documentElement) attachHost();
    else document.addEventListener("DOMContentLoaded", attachHost, {
        once: true
    });

    const shadow = host.attachShadow({
        mode: "closed"
    });

    const savedPos = store.getG("pos", null);
    if(savedPos) {
        host.style.left = savedPos.x + "px";
        host.style.top = savedPos.y + "px";
    } else {
        host.style.right = "18px";
        host.style.top = "18px";
    }

    const styleEl = document.createElement("style");
    shadow.appendChild(styleEl);

    function buildStyles(theme, size) {

        const t = THEMES[theme] || THEMES.void;

        const s = SIZES[size] || SIZES.normal;

        const W = s.width,
            F = s.scale;

        const scrollThumb = theme === "ghost" ? "#b0b0c8" : "#1e1e2e";

        const inputAccent = t.accent;

        styleEl.textContent = `

      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

      *{box-sizing:border-box;margin:0;padding:0}

      :host{all:initial}

      #panel{pointer-events:all;width:${W}px;min-width:220px;background:${t.bg};border:1px solid ${t.border};border-radius:${t.radius};box-shadow:0 12px 40px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.025) inset;font-family:'JetBrains Mono',monospace;font-size:${Math.round(10.5*F)}px;color:${t.text};overflow:hidden;user-select:none;display:flex;flex-direction:column;position:relative;}

      #resizeHandle{position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:se-resize;z-index:10;}

      #resizeHandle::after{content:'';position:absolute;bottom:3px;right:3px;width:7px;height:7px;border-right:2px solid ${t.border};border-bottom:2px solid ${t.border};opacity:.5;pointer-events:none;}

      #hdr{display:flex;align-items:center;justify-content:space-between;padding:${Math.round(7*F)}px ${Math.round(10*F)}px;background:${t.bg2};border-bottom:1px solid ${t.border2};cursor:move;gap:7px;flex-shrink:0;}

      #hdr-left{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}

      .title{font-size:${Math.round(9.5*F)}px;font-weight:600;color:${t.textBright};letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}

      #hubName{font-size:${Math.round(8*F)}px;color:${t.textDim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

      #ksTag{font-size:${Math.round(7*F)}px;color:${t.textDim};opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}

      #hdr-right{display:flex;align-items:center;gap:5px;flex-shrink:0}

      .dot{width:6px;height:6px;border-radius:50%;background:${t.accent};box-shadow:0 0 5px ${t.accent};transition:background .3s,box-shadow .3s;flex-shrink:0}

#dotWrap{
  width:${Math.round(22*F)}px;
  height:${Math.round(22*F)}px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
      .dot.paused{background:${t.warn};box-shadow:0 0 5px ${t.warn}}

      .dot.error{background:${t.err};box-shadow:0 0 5px ${t.err}}

       .dot.bypass{background:#a78bfa;box-shadow:0 0 5px #a78bfa}

      .hdr-btn{width:${Math.round(16*F)}px;height:${Math.round(16*F)}px;border-radius:3px;background:${t.hdrBtn};border:1px solid ${t.hdrBtnBorder};color:${t.textDim};font-size:${Math.round(9*F)}px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;flex-shrink:0;pointer-events:all;font-family:'JetBrains Mono',monospace;line-height:1;}

      .hdr-btn:hover{background:${t.bg3};color:${t.textMid}}

.discord-btn{
  width:${Math.round(22*F)}px;
  height:${Math.round(22*F)}px;
  border-radius:4px;
  background:${t.hdrBtn};
  border:1px solid ${t.hdrBtnBorder};
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:background .15s,border-color .15s;
  flex-shrink:0;
  pointer-events:all;
  text-decoration:none;
}
.discord-btn:hover{
  background:#5865f2;
  border-color:#7289da;
}
.discord-btn svg{
  width:${Math.round(13*F)}px;
  height:${Math.round(13*F)}px;
  fill:${t.textDim};
  transition:fill .15s;
}
.discord-btn:hover svg{
  fill:#ffffff;
}

      #bypassBanner{display:none;background:${t.accentDim};border-bottom:1px solid ${t.accentBorder};padding:3px 10px;font-size:${Math.round(8*F)}px;color:${t.accent};text-align:center;flex-shrink:0;}

      #apiBanner{display:none;background:rgba(91,156,246,.12);border-bottom:1px solid rgba(91,156,246,.25);padding:3px 10px;font-size:${Math.round(8*F)}px;color:#5b9cf6;text-align:center;flex-shrink:0;font-family:'JetBrains Mono',monospace;}

      #apiBanner.normal{background:rgba(244,185,66,.08);border-bottom-color:rgba(244,185,66,.2);color:${t.warn};}

      #pill{display:none;pointer-events:all;align-items:center;gap:6px;background:${t.pill};border:1px solid ${t.border};border-radius:20px;padding:5px 11px 5px 9px;box-shadow:0 4px 16px rgba(0,0,0,.5);cursor:pointer;user-select:none;}

      #pill .dot{width:5px;height:5px}

      #pill-label{font-family:'JetBrains Mono',monospace;font-size:${Math.round(9*F)}px;color:${t.textMid};white-space:nowrap}

      #pill-timer{font-family:'JetBrains Mono',monospace;font-size:${Math.round(9*F)}px;color:${t.accent};white-space:nowrap;min-width:50px;text-align:right}

      #body{padding:${Math.round(7*F)}px ${Math.round(9*F)}px;display:flex;flex-direction:column;gap:${Math.round(4*F)}px;flex-shrink:0}

      .row{display:flex;justify-content:space-between;align-items:center;background:${t.bg3};border:1px solid ${t.border3};border-radius:${Math.round(4*F)}px;padding:${Math.round(3.5*F)}px ${Math.round(7*F)}px;}

      .row .lbl{color:${t.textDim};font-size:${Math.round(9*F)}px;flex-shrink:0}

      .row .val{color:${t.textBright};font-weight:500;font-size:${Math.round(9*F)}px;max-width:175px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}

      .val.green{color:${t.accent}}.val.yellow{color:${t.warn}}.val.red{color:${t.err}}.val.dim{color:${t.textDim}}

      #keyListWrap{background:${t.bg};border:1px solid ${t.border2};border-radius:${Math.round(4*F)}px;overflow:hidden}

      #keyListHdr{display:flex;justify-content:space-between;align-items:center;padding:${Math.round(3*F)}px ${Math.round(7*F)}px;cursor:pointer}

      #keyListHdr:hover{background:${t.bg3}}

      .klh-title{font-size:${Math.round(8.5*F)}px;color:${t.textDim}}

      .klh-right{display:flex;align-items:center;gap:5px}

      #keyCnt{font-size:${Math.round(8*F)}px;color:${t.accent};background:${t.accentDim};border:1px solid ${t.accentBorder};border-radius:3px;padding:1px 4px}

      #keyCnt.hidden{display:none}

      #klArrow{font-size:${Math.round(8*F)}px;color:${t.textDim};opacity:.6}

      #keyList{display:flex;flex-direction:column;max-height:${Math.round(95*F)}px;overflow-y:auto}

      #keyList::-webkit-scrollbar{width:3px}

      #keyList::-webkit-scrollbar-thumb{background:${scrollThumb};border-radius:2px}

      .key-item{display:flex;align-items:center;gap:4px;padding:${Math.round(3*F)}px ${Math.round(7*F)}px;border-bottom:1px solid ${t.bg3};font-size:${Math.round(8.5*F)}px}

      .key-item:last-child{border-bottom:none}

      .ki-num{color:${t.textDim};opacity:.5;font-size:${Math.round(7.5*F)}px;flex-shrink:0;min-width:13px}

      .ki-val{color:${t.textMid};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

      .ki-timer{font-size:${Math.round(8*F)}px;flex-shrink:0;min-width:50px;text-align:right;color:${t.accent}}

      .ki-timer.dim{color:${t.textDim};opacity:.5}.ki-timer.yellow{color:${t.warn}}.ki-timer.red{color:${t.err}}

      .ki-badge{font-size:${Math.round(7*F)}px;padding:1px 3px;border-radius:3px;border:1px solid;flex-shrink:0}

      .ki-badge.done{color:${t.accent};border-color:${t.accentBorder};background:${t.accentDim}}

      .ki-badge.active{color:${t.warn};border-color:rgba(244,185,66,.25);background:rgba(244,185,66,.07)}

      .ki-badge.waiting{color:${t.textDim};border-color:${t.border2};opacity:.5}

      .ki-badge.managed{color:#a78bfa;border-color:rgba(167,139,250,.3);background:rgba(167,139,250,.08)}

      .ki-badge.expired{color:#ff5c5c;border-color:rgba(255,0,0,.35);background:rgba(255,0,0,.08);}

      .ki-copy{cursor:pointer;color:${t.textDim};font-size:${Math.round(8.5*F)}px;padding:0 2px;flex-shrink:0;transition:color .15s;opacity:.5}

      .ki-copy:hover{color:${t.accent};opacity:1}

      .kl-empty{padding:7px;text-align:center;font-size:${Math.round(8.5*F)}px;color:${t.textDim};opacity:.4}

      #btnRow{display:flex;gap:${Math.round(4*F)}px}

      button{flex:1;background:${t.btnBg};border:1px solid ${t.btnBorder};border-radius:${Math.round(4*F)}px;color:${t.textMid};font-family:'JetBrains Mono',monospace;font-size:${Math.round(9*F)}px;padding:${Math.round(4*F)}px 3px;cursor:pointer;transition:background .15s,color .15s,border-color .15s;}

      button:hover{background:${t.bg3};border-color:${t.textDim};color:${t.textBright}}

      button.danger{color:${t.err};border-color:${t.err};opacity:.7}

      button.danger:hover{opacity:1;background:rgba(255,77,109,.1)}

      button.active{color:${t.accent};border-color:${t.accentBorder};background:${t.accentDim}}

      button:disabled{opacity:.3;cursor:not-allowed}

      #logToggleRow{display:flex;justify-content:space-between;align-items:center;padding:2px ${Math.round(8*F)}px;background:${t.bg2};border-top:1px solid ${t.border2};cursor:pointer;flex-shrink:0;}

      #logToggleRow:hover{background:${t.bg3}}

      #logToggleRow span{font-size:${Math.round(8*F)}px;color:${t.textDim};opacity:.6}

      #logBox{background:${t.bg};border-top:1px solid ${t.border2};padding:4px ${Math.round(7*F)}px;max-height:70px;overflow-y:auto;font-size:${Math.round(8*F)}px;line-height:1.6;display:none;flex-shrink:0;}

      #logBox::-webkit-scrollbar{width:3px}

      #logBox::-webkit-scrollbar-thumb{background:${scrollThumb};border-radius:2px}

      .lg{color:${t.textDim};opacity:.6}.lg.hi{opacity:1;color:${t.textMid}}

      #optPanel{background:${t.bgOpt};border-top:1px solid ${t.border2};display:none;flex-direction:column;flex-shrink:0}

      #optScroll{overflow-y:auto;overflow-x:hidden;padding:${Math.round(6*F)}px ${Math.round(9*F)}px;display:flex;flex-direction:column;gap:${Math.round(4*F)}px;max-height:min(260px,calc(100vh - 300px));}

      #optScroll::-webkit-scrollbar{width:3px}

      #optScroll::-webkit-scrollbar-thumb{background:${scrollThumb};border-radius:2px}

      #optFooter{padding:${Math.round(5*F)}px ${Math.round(9*F)}px ${Math.round(8*F)}px;border-top:1px solid ${t.border2};display:flex;flex-direction:column;gap:${Math.round(4*F)}px;flex-shrink:0;}

      .opt-sec{font-size:${Math.round(7.5*F)}px;color:${t.textDim};text-transform:uppercase;letter-spacing:.1em;padding-bottom:2px;border-bottom:1px solid ${t.border2};margin-top:3px;opacity:.8;}

      .opt-row{display:flex;align-items:center;justify-content:space-between;font-size:${Math.round(9.5*F)}px;color:${t.textMid};gap:4px;min-height:18px;}

      .opt-lbl{display:flex;align-items:center;gap:3px;flex:1;min-width:0;overflow:hidden;position:relative}

      .opt-lbl label{cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:${Math.round(9.5*F)}px}

      .opt-lbl label.disabled{cursor:not-allowed;opacity:.4}

      select{background:${t.bg3};border:1px solid ${t.border2};border-radius:3px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:${Math.round(9*F)}px;padding:2px 4px;outline:none;cursor:pointer;}

      select:focus{border-color:${t.accent}}

      select option{background:${t.bg2};color:${t.text}}

      .iq{width:${Math.round(11*F)}px;height:${Math.round(11*F)}px;border-radius:50%;background:${t.bg3};border:1px solid ${t.border};color:${t.textDim};font-size:${Math.round(7*F)}px;display:inline-flex;align-items:center;justify-content:center;cursor:help;flex-shrink:0;font-style:normal;line-height:1;position:relative;}

      .iq:hover{border-color:${t.accent};color:${t.accent}}

      input[type="checkbox"]{width:11px;height:11px;accent-color:${inputAccent};cursor:pointer;flex-shrink:0}

      input[type="checkbox"]:disabled{cursor:not-allowed;opacity:.35}

      input[type="number"]{background:${t.bg3};border:1px solid ${t.border};border-radius:3px;color:${t.text};font-family:'JetBrains Mono',monospace;font-size:${Math.round(9.5*F)}px;padding:2px 5px;width:66px;outline:none;}
input[type="password"],
input[type="text"]{
  background:${t.bg3};
  border:1px solid ${t.border};
  border-radius:3px;
  color:${t.text};
  font-family:'JetBrains Mono',monospace;
  font-size:${Math.round(9.5*F)}px;
  padding:2px 6px;
  outline:none;
  width:130px;
  transition:border-color .15s, box-shadow .15s;
}

input[type="password"]:focus,
input[type="text"]:focus{
  border-color:${t.accent};
  box-shadow:0 0 0 1px ${t.accentBorder};
}

input[type="password"]::placeholder,
input[type="text"]::placeholder{
  color:${t.textDim};
  opacity:.6;
}
      input[type="number"]:focus{border-color:${t.accent}}

      .opt-warn{font-size:${Math.round(8*F)}px;color:${t.warn};opacity:.8;line-height:1.4;background:rgba(244,185,66,.06);border:1px solid rgba(244,185,66,.15);border-radius:3px;padding:3px 5px;}

      .opt-info{font-size:${Math.round(8*F)}px;color:${t.textMid};line-height:1.4;background:${t.accentDim};border:1px solid ${t.accentBorder};border-radius:3px;padding:3px 5px;opacity:.8;}

      .bypass-info{font-size:${Math.round(8*F)}px;color:${t.textMid};line-height:1.7;background:${t.bg3};border:1px solid ${t.border2};border-radius:3px;padding:5px 7px;}

      .bypass-info strong{color:${t.textBright};display:block;margin-bottom:2px;}

      .bypass-info .bl{color:${t.err}}.bypass-info .wl{color:${t.accent}}

      .api-info{font-size:${Math.round(8*F)}px;color:#5b9cf6;line-height:1.6;background:rgba(91,156,246,.08);border:1px solid rgba(91,156,246,.2);border-radius:3px;padding:5px 7px;}

      .api-info strong{color:#a0c4ff;display:block;margin-bottom:2px;}

      .save-btn{background:${t.accentDim};border:1px solid ${t.accentBorder};color:${t.accent};padding:${Math.round(4*F)}px;border-radius:${Math.round(4*F)}px;width:100%;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:${Math.round(9.5*F)}px;transition:background .15s;flex:none;}

      .save-btn:hover{background:${t.accentBorder}}

      .neutral-btn{background:${t.bg3};border:1px solid ${t.border};color:${t.textMid};padding:${Math.round(4*F)}px;border-radius:${Math.round(4*F)}px;width:100%;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:${Math.round(9.5*F)}px;transition:background .15s;flex:none;}

      .neutral-btn:hover{background:${t.bg2};border-color:${t.textDim};color:${t.textBright}}

      .destroy-btn{background:rgba(255,77,109,.06);border:1px solid rgba(255,77,109,.2);color:${t.err};padding:${Math.round(4*F)}px;border-radius:${Math.round(4*F)}px;width:100%;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:${Math.round(9.5*F)}px;transition:background .15s;flex:none;}

      .destroy-btn:hover{background:rgba(255,77,109,.15);border-color:${t.err}}

      .divider{height:1px;background:${t.border2};flex-shrink:0}

    `;

    }
    // ─────────────────────────────────────────────
    // HTML
    // ─────────────────────────────────────────────

    const panel = document.createElement("div");
    panel.id = "panel";

    const tooltipEl = document.createElement("div");
    tooltipEl.id = "_alv3_tooltip";
    tooltipEl.style.cssText = ["display:none", "position:fixed", "z-index:2147483647", "pointer-events:none", "font-family:'JetBrains Mono',monospace", "font-size:11px", "line-height:1.5", "padding:6px 9px", "border-radius:5px", "max-width:240px", "width:max-content", "white-space:normal", "word-break:break-word", "box-shadow:0 4px 20px rgba(0,0,0,.7)", "transition:opacity .1s"].join(";");

    function styleTooltip() {
        const t = THEMES[opts.theme] || THEMES.void;
        tooltipEl.style.background = t.bg2;
        tooltipEl.style.border = `1px solid ${t.border}`;
        tooltipEl.style.color = t.textMid || t.text;
    }

    function attachTooltip() {
        if(!document.body) return;
        if(!document.getElementById("_alv3_tooltip")) document.body.appendChild(tooltipEl);
    }
    if(document.body) attachTooltip();
    else document.addEventListener("DOMContentLoaded", attachTooltip, {
        once: true
    });

    const nfo = (txt) => `<span class="iq" data-tip="${txt.replace(/"/g,"&quot;")}">?</span>`;

    panel.innerHTML = `
    <div id="resizeHandle"></div>
    <div id="bypassBanner">⚡ Ad bypass active</div>
    <div id="apiBanner">⚡ API Bypass ON</div>
    <div id="hdr">
      <div id="hdr-left">
        <span class="title">Luarmor Auto</span>
        <span id="hubName">—</span>
        <span id="ksTag">${KS_ID}</span>
      </div>
<div id="hdr-right">
  <a class="discord-btn" id="discordBtn" href="https://discord.gg/VhG4TJD5QY" target="_blank" rel="noopener noreferrer" title="Support Discord">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.030zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  </a>
  <div id="dotWrap"><span class="dot" id="dot"></span></div>
  <button class="hdr-btn" id="minBtn" title="Minimize">—</button>
</div>
    </div>
    <div id="body">
      <div class="row"><span class="lbl">Status</span><span class="val dim" id="actVal">Starting…</span></div>
      <div class="row"><span class="lbl">Progress</span><span class="val dim" id="progVal">—</span></div>
      <div class="row"><span class="lbl">Cooldown</span><span class="val dim" id="cdVal">—</span></div>
      <div id="keyListWrap">
        <div id="keyListHdr">
          <span class="klh-title">Keys</span>
          <div class="klh-right">
            <span id="keyCnt" class="hidden">—</span>
            <span id="klArrow">▼</span>
          </div>
        </div>
        <div id="keyList"><div class="kl-empty">No keys yet</div></div>
      </div>
      <div id="btnRow">
        <button id="pauseBtn">Pause</button>
        <button id="optBtn">Options</button>
      </div>
    </div>
    <div id="logToggleRow"><span>Log</span><span id="logArrow">▼</span></div>
    <div id="logBox"></div>
    <div id="optPanel">
      <div id="optScroll">
        <div class="opt-sec">Appearance</div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_theme">Theme</label>${nfo("Changes the color scheme of the UI.")}</div>
          <select id="o_theme"></select>
        </div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_size">UI Size</label>${nfo("Changes the overall size of the panel.")}</div>
          <select id="o_size"></select>
        </div>
        <div class="opt-sec">General</div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_copy">Auto-copy keys</label>${nfo("Copies each new key to clipboard automatically.")}</div>
          <input type="checkbox" id="o_copy">
        </div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_reload">Reload on resume</label>${nfo("Reloads the page when you unpause.")}</div>
          <input type="checkbox" id="o_reload">
        </div>
        <div class="opt-sec">Timing</div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_delay">Click delay (ms)</label>${nfo("Extra wait before every click. Gaussian ±15% jitter applied on top.")}</div>
          <input type="number" id="o_delay" min="0" max="30000" step="100">
        </div>
        <div class="opt-sec">Behaviour</div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_audio">Audio keepalive</label>${nfo("Plays silent audio to prevent Chrome throttling timers in background tabs.")}</div>
          <input type="checkbox" id="o_audio">
        </div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_closeTab">Auto-close ad tab</label>${nfo("Tries to close the ad tab after clicking Next.")}</div>
          <input type="checkbox" id="o_closeTab">
        </div>
        <div class="opt-sec">API Bypass</div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_clickMethod">Click method</label>${nfo("API: intercepts window.open(), calls trw.lat bypass API, redirects here — no popup opens.\nNormal: standard click.")}</div>
          <select id="o_clickMethod">
            <option value="api">API (unfinished)</option>
            <option value="normal">Normal</option>
          </select>
        </div>
        <div id="apiKeyRow" class="opt-row">
          <div class="opt-lbl"><label for="o_apiKey">API Key</label>${nfo("Required for API bypass mode. Stored locally. (join discord for key)")}</div>
          <input type="password" id="o_apiKey" placeholder="TRW_...">
        </div>
        <div id="apiFallbackRow" class="opt-row">
          <div class="opt-lbl"><label for="o_apiFallback">Fallback to normal click</label>${nfo("If API fails after all retries, falls back to a real window.open() click.")}</div>
          <input type="checkbox" id="o_apiFallback">
        </div>
        <div id="apiDelayRow" class="opt-row">
          <div class="opt-lbl"><label for="o_apiBypassDelay">API bypass delay (ms)</label>${nfo("How long to wait after clicking Next before calling the bypass API. Default 13000ms.")}</div>
          <input type="number" id="o_apiBypassDelay" min="0" max="30000" step="500">
        </div>
        <div id="apiBypassInfoBox" class="api-info">
          <strong>⚡ API Bypass Mode</strong>
          Intercepts window.open() → follows redirects → calls trw.lat API → redirects here. Retries up to 3× before error (or fallback if enabled).
        </div>
        <div class="opt-sec">Ad Bypass</div>
        <div class="opt-row">
          <div class="opt-lbl"><label for="o_bypassMethod">Method</label>${nfo("None: off.\nDOM Nuke: strips scripts/iframes from DOM.\nScript Removal: blocks ad-network scripts.\nPopup Whitelist: only whitelisted domains may open popups.\nPopup Blacklist: only blacklisted domains are blocked.")}</div>
          <select id="o_bypassMethod"></select>
        </div>
        <div class="opt-row" id="bypassDelayRow" style="display:none">
          <div class="opt-lbl"><label for="o_bypassDelay">Bypass delay (ms)</label>${nfo("DOM Nuke only: how long to wait after page load before nuking.")}</div>
          <input type="number" id="o_bypassDelay" min="0" max="15000" step="500">
        </div>
        <div id="bypassInfoBox" class="bypass-info" style="display:none"></div>
        <div class="opt-sec">Multi-Key</div>
        <div id="multiKeyWarn" class="opt-warn" style="display:none">Multi-key unavailable on this keysystem (limit=1 or no "Get New Key" button).</div>
        <div class="opt-row">
          <div class="opt-lbl"><label id="lbl_multiKey" for="o_multiKey">Multiple keys</label>${nfo("After getting a key, clicks 'Get a New Key' to create additional keys up to your target count.")}</div>
          <input type="checkbox" id="o_multiKey">
        </div>
        <div class="opt-row" id="multiKeyCountRow">
          <div class="opt-lbl"><label id="lbl_keyCount" for="o_keyCount">Target count</label>${nfo("How many keys to create in total.")}</div>
          <input type="number" id="o_keyCount" min="1" max="50" step="1">
        </div>
        <div class="opt-sec">Key Management</div>
        <div id="keyMgmtRow" class="opt-row">
          <div class="opt-lbl"><label for="o_keyMgmt">Auto add-time</label>${nfo("Automatically adds time to keys after collecting them. Always active when Multi-Key is off.")}</div>
          <input type="checkbox" id="o_keyMgmt">
        </div>
        <div id="addOrderRow" class="opt-row">
          <div class="opt-lbl"><label for="o_addOrder">Add-time order</label>${nfo("Top-down: adds time in list order.\nBottom-up: reverse order.\nLowest time: adds to key with least time remaining first.")}</div>
          <select id="o_addOrder">
            <option value="topdown">Top-down</option>
            <option value="bottomup">Bottom-up</option>
            <option value="lowest">Lowest time</option>
          </select>
        </div>
        <div class="divider"></div>
        <div class="opt-info">Scope: <strong>${KS_ID}</strong></div>
      </div>
      <div id="optFooter">
        <button class="save-btn" id="o_save">Save Options</button>
        <button class="neutral-btn" id="o_resetui">Reset UI Position</button>
        <button class="destroy-btn" id="o_destroy">Stop &amp; Close UI</button>
      </div>
    </div>
  `;

    function populateSelects() {
        const thSel = $("o_theme"),
            szSel = $("o_size"),
            bmSel = $("o_bypassMethod");
        if(thSel) thSel.innerHTML = Object.entries(THEMES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join("");
        if(szSel) szSel.innerHTML = Object.entries(SIZES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join("");
        if(bmSel) bmSel.innerHTML = Object.entries(BYPASS_METHODS).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join("");
    }

    const pill = document.createElement("div");
    pill.id = "pill";
    pill.innerHTML = `<span class="dot" id="pillDot"></span><span id="pill-label">Luarmor Auto</span><span id="pill-timer">—</span>`;

    shadow.appendChild(styleEl);
    shadow.appendChild(pill);
    shadow.appendChild(panel);

    const $ = id => shadow.getElementById(id);

    // ─────────────────────────────────────────────
    // TOOLTIP ENGINE  ← PASTE FROM ORIGINAL (function initTooltipEngine(){…})
    // ─────────────────────────────────────────────
    function initTooltipEngine() {

        shadow.addEventListener("mouseover", e => {

            const iq = e.target.closest?.(".iq");

            if(!iq) return;

            styleTooltip();

            tooltipEl.textContent = iq.dataset.tip || "";

            tooltipEl.style.display = "block";

            positionTip(iq);

        }, true);

        shadow.addEventListener("mouseout", e => {
            const iq = e.target.closest?.(".iq");
            if(iq) tooltipEl.style.display = "none";
        }, true);

        host.addEventListener("mouseleave", () => {
            tooltipEl.style.display = "none";
        });

        function positionTip(iq) {

            const r = iq.getBoundingClientRect(),
                vw = window.innerWidth,
                vh = window.innerHeight;

            tooltipEl.style.left = "0px";
            tooltipEl.style.top = "0px";
            tooltipEl.style.maxWidth = "240px";

            requestAnimationFrame(() => {

                const tw = tooltipEl.offsetWidth,
                    th = tooltipEl.offsetHeight;

                let top = r.bottom + 6,
                    left = r.right - tw;

                if(left < 8) left = 8;

                if(left + tw > vw - 8) left = vw - 8 - tw;

                if(top + th > vh - 8) top = r.top - th - 6;

                if(top < 8) top = 8;

                tooltipEl.style.left = left + "px";
                tooltipEl.style.top = top + "px";

            });

        }

    }

    initTooltipEngine();

    // ─────────────────────────────────────────────
    // OPTIONS
    // ─────────────────────────────────────────────

    const opts = {
        autoCopy: store.get("autoCopy", false),
        reloadOnResume: store.get("reloadOnResume", true),
        clickDelay: store.get("clickDelay", 500),
        audioKeepalive: store.getG("audioKeepalive", true),
        closeAdTab: store.get("closeAdTab", false),
        bypassMethod: store.getG("bypassMethod", "none"),
        bypassDelay: store.get("bypassDelay", 0),
        clickMethod: store.getG("clickMethod", "normal"),
        apiFallback: store.getG("apiFallback", false),
        apiBypassDelay: store.getG("apiBypassDelay", 13000),
        multiKey: store.get("multiKey", false),
        keyTarget: store.get("keyTarget", 3),
        keyMgmt: store.get("keyMgmt", false),
        addOrder: store.get("addOrder", "lowest"),
        minimized: store.getG("minimized", false),
        theme: store.getG("theme", "void"),
        uiSize: store.getG("uiSize", "normal"),
    };

    let multiKeySupported = null,
        maxKeysAllowed = null;

    buildStyles(opts.theme, opts.uiSize);

    const customW = store.getG("panelCustomW", null);
    if(customW) panel.style.width = customW + "px";

    /** Key management is always-on when multi-key is disabled */
    function effectiveKeyMgmt() {
        return opts.keyMgmt || (!opts.multiKey || multiKeySupported === false || maxKeysAllowed === 1);
    }

    // ─────────────────────────────────────────────
    // BYPASS INFO BOX
    // ─────────────────────────────────────────────

    function updateBypassInfoBox(method) {
        const box = $("bypassInfoBox"),
            delayRow = $("bypassDelayRow");
        if(!box) return;
        if(delayRow) delayRow.style.display = (method === "dom") ? "" : "none";
        if(method === "whitelist") {
            box.style.display = "";
            box.innerHTML = `<strong>Popup Whitelist</strong>Overrides <code>window.open()</code> — all popups blocked silently <em>except</em>:<br>` + POPUP_WHITELIST.map(d => `<span class="wl">✔ ${d}</span>`).join(" &nbsp;");
        } else if(method === "blacklist") {
            box.style.display = "";
            box.innerHTML = `<strong>Popup Blacklist</strong>All popups pass through <em>except</em>:<br>` + POPUP_BLACKLIST.map(d => `<span class="bl">✘ ${d}</span>`).join(" &nbsp;");
        } else if(method === "script") {
            box.style.display = "";
            box.innerHTML = `<strong>Script Removal</strong>Intercepts known ad-network scripts via <code>createElement</code> + MutationObserver.`;
        } else {
            box.style.display = "none";
        }
    }

    function updateApiBypassUI() {
        const keyRow = $("apiKeyRow"),
            sel = $("o_clickMethod");
        const fallbackRow = $("apiFallbackRow"),
            delayRow = $("apiDelayRow");
        const infoBox = $("apiBypassInfoBox"),
            banner = $("apiBanner");
        const method = sel ? sel.value : opts.clickMethod;
        const isApi = method === "api";
        if(infoBox) infoBox.style.display = isApi ? "" : "none";
        if(fallbackRow) fallbackRow.style.display = isApi ? "" : "none";
        if(keyRow) keyRow.style.display = isApi ? "" : "none";
        if(delayRow) delayRow.style.display = isApi ? "" : "none";
        if(banner) {
            banner.style.display = "";
            if(isApi) {
                const key = store.getG("apiKey", "");
                if(!key) {
                    banner.textContent = "⚠ API Key Missing";
                    banner.className = "normal";
                } else {
                    banner.textContent = "⚡ API Bypass ON";
                    banner.className = "";
                }
            } else {
                banner.textContent = "🖱 Normal Click Mode";
                banner.className = "normal";
            }
        }
    }

    function updateMultiKeyUI() {
        const warn = $("multiKeyWarn"),
            cb = $("o_multiKey");
        const inp = $("o_keyCount"),
            lbl1 = $("lbl_multiKey"),
            lbl2 = $("lbl_keyCount");
        const keyMgmtRow = $("keyMgmtRow"),
            addOrderRow = $("addOrderRow");
        const multiKeyCountRow = $("multiKeyCountRow");
        const disabled = multiKeySupported === false || maxKeysAllowed === 1;

        if(disabled) {
            if(warn) warn.style.display = "";
            if(cb) {
                cb.disabled = true;
                cb.checked = false;
            }
            if(inp) inp.disabled = true;
            if(lbl1) lbl1.className = "disabled";
            if(lbl2) lbl2.className = "disabled";
            if(opts.multiKey) {
                opts.multiKey = false;
                store.set("multiKey", false);
            }
        } else {
            if(warn) warn.style.display = "none";
            if(cb) cb.disabled = false;
            if(inp) inp.disabled = false;
            if(lbl1) lbl1.className = "";
            if(lbl2) lbl2.className = "";
            if(maxKeysAllowed !== null) {
                if(inp) inp.max = maxKeysAllowed;
                if(opts.keyTarget > maxKeysAllowed) {
                    opts.keyTarget = maxKeysAllowed;
                    if(inp) inp.value = maxKeysAllowed;
                    store.set("keyTarget", maxKeysAllowed);
                }
            }
        }

        // When multi-key is OFF: hide auto add-time checkbox and order (always-on implicitly)
        // When multi-key is ON: show all management controls
        const isMulti = !disabled && opts.multiKey;
        if(keyMgmtRow) keyMgmtRow.style.display = isMulti ? "" : "none";
        if(addOrderRow) addOrderRow.style.display = isMulti ? "" : "none";
        if(multiKeyCountRow) multiKeyCountRow.style.display = disabled ? "none" : "";
    }

    function applyOpts() {
        populateSelects();
        $("o_theme").value = opts.theme;
        $("o_size").value = opts.uiSize;
        $("o_copy").checked = opts.autoCopy;
        $("o_reload").checked = opts.reloadOnResume;
        $("o_delay").value = opts.clickDelay;
        $("o_audio").checked = opts.audioKeepalive;
        $("o_closeTab").checked = opts.closeAdTab;
        $("o_bypassMethod").value = opts.bypassMethod;
        $("o_bypassDelay").value = opts.bypassDelay;
        $("o_apiKey").value = store.getG("apiKey", "");
        $("o_clickMethod").value = opts.clickMethod;
        $("o_apiFallback").checked = opts.apiFallback;
        $("o_apiBypassDelay").value = opts.apiBypassDelay;
        $("o_multiKey").checked = opts.multiKey;
        $("o_keyCount").value = opts.keyTarget;
        $("o_keyMgmt").checked = opts.keyMgmt;
        $("o_addOrder").value = opts.addOrder;
        updateBypassInfoBox(opts.bypassMethod);
        updateMultiKeyUI();
        updateApiBypassUI();
    }

    // ─────────────────────────────────────────────
    // EVENT BINDING
    // ─────────────────────────────────────────────

    function rebindEvents() {
        bindDragTargets();

        const oTheme = $("o_theme"),
            oSize = $("o_size");
        if(oTheme) oTheme.onchange = () => {
            opts.theme = oTheme.value;
            buildStyles(oTheme.value, oSize.value);
            styleTooltip();
            const cw = store.getG("panelCustomW", null);
            if(cw) panel.style.width = cw + "px";
        };
        if(oSize) oSize.onchange = () => {
            store.setG("panelCustomW", null);
            panel.style.width = "";
            buildStyles(oTheme.value, oSize.value);
        };

        const oMethod = $("o_bypassMethod");
        if(oMethod) oMethod.onchange = () => updateBypassInfoBox(oMethod.value);

        const oClickMethod = $("o_clickMethod");
        if(oClickMethod) oClickMethod.onchange = () => updateApiBypassUI();

        const oMultiKey = $("o_multiKey");
        if(oMultiKey) oMultiKey.onchange = () => {
            opts.multiKey = oMultiKey.checked;
            updateMultiKeyUI();
        };

        const saveBtn = $("o_save");
        if(saveBtn) saveBtn.onclick = saveOptions;

        const destroyBtn = $("o_destroy");
        if(destroyBtn) destroyBtn.onclick = destroyScript;

        const resetUIBtn = $("o_resetui");
        if(resetUIBtn) resetUIBtn.onclick = () => {
            store.setG("pos", null);
            store.setG("panelCustomW", null);
            host.style.left = "auto";
            host.style.right = "18px";
            host.style.top = "18px";
            panel.style.width = "";
            log("UI position reset");
        };

        const pauseBtn = $("pauseBtn");
        if(pauseBtn) {
            pauseBtn.textContent = paused ? "Resume" : "Pause";
            pauseBtn.className = paused ? "danger" : "";
            pauseBtn.onclick = () => {
                paused = !paused;
                store.setG("pausedState", paused);
                pauseBtn.textContent = paused ? "Resume" : "Pause";
                pauseBtn.className = paused ? "danger" : "";
                setDot(paused ? "paused" : "ok");
                if(paused) {
                    setAction("Paused");
                    if(loopHandle) clearTimeout(loopHandle);
                } else {
                    log("Resumed");
                    if(opts.reloadOnResume) setTimeout(() => location.reload(), userDelay(700));
                    else {
                        resetRun();
                        schedule(userDelay(800));
                    }
                }
            };
        }

        const optBtn = $("optBtn");
        if(optBtn) optBtn.onclick = () => {
            optOpen = !optOpen;
            $("optPanel").style.display = optOpen ? "flex" : "none";
            optBtn.className = optOpen ? "active" : "";
            if(optOpen) {
                applyOpts();
                updateMultiKeyUI();
            }
        };

        const logToggle = $("logToggleRow");
        if(logToggle) logToggle.onclick = () => {
            logOpen = !logOpen;
            $("logBox").style.display = logOpen ? "block" : "none";
            $("logArrow").textContent = logOpen ? "▲" : "▼";
        };

        const klHdr = $("keyListHdr");
        if(klHdr) klHdr.onclick = () => {
            klOpen = !klOpen;
            $("keyList").style.display = klOpen ? "" : "none";
            $("klArrow").textContent = klOpen ? "▲" : "▼";
        };

        // Delegated click handler for key selection — survives re-renders
        const keyList = $("keyList");
        if(keyList) keyList.addEventListener("click", e => {
            // Don't fire when clicking copy button
            if(e.target.classList.contains("ki-copy")) return;

            const row = e.target.closest(".key-item");
            if(!row) return;

            const isMulti = opts.multiKey && multiKeySupported !== false && maxKeysAllowed !== 1;
            if(isMulti || keySlots.length <= 1) return;

            const keyVal = row.querySelector(".ki-val")?.title;
            if(!keyVal) return;

            const idx = keySlots.findIndex(s => s.key === keyVal);
            selectedKey = (selectedKey === keyVal) ? null : keyVal;
            store.set("selectedKey", selectedKey ?? "");

            if(selectedKey) {
                currentKeyText = selectedKey;
                log(`Now managing: ${selectedKey.slice(0,8)}…`);
                setAction(`Focused on key ${idx + 1}`);
                if(phase !== "idle" && phase !== "keymgmt") {
                    phase = "keymgmt";
                    managingKeys = true;
                    schedule(500);
                }
            } else {
                log("Key selection cleared — resuming normal order");
            }
            renderKeyList();
        });

        const minBtn = $("minBtn");
        if(minBtn) minBtn.onclick = e => {
            e.stopPropagation();
            applyMinimize(true);
        };

        pill.onmousemove = () => {
            pillDragMoved = true;
        };
        pill.onmouseup = () => {
            if(!pillDragMoved) applyMinimize(false);
        };
    }

    function saveOptions() {
        const prevAudio = opts.audioKeepalive,
            prevMethod = opts.bypassMethod;

        opts.theme = $("o_theme").value;
        opts.uiSize = $("o_size").value;
        opts.autoCopy = $("o_copy").checked;
        opts.reloadOnResume = $("o_reload").checked;
        opts.clickDelay = parseInt($("o_delay").value, 10) || 0;
        opts.audioKeepalive = $("o_audio").checked;
        opts.closeAdTab = $("o_closeTab").checked;
        opts.bypassMethod = $("o_bypassMethod").value;
        opts.bypassDelay = Math.max(0, parseInt($("o_bypassDelay").value, 10) || 0);
        opts.clickMethod = $("o_clickMethod").value;
        opts.apiFallback = $("o_apiFallback").checked;
        opts.apiBypassDelay = Math.max(0, parseInt($("o_apiBypassDelay").value, 10) || 0);
        opts.multiKey = (multiKeySupported === false || maxKeysAllowed === 1) ? false : $("o_multiKey").checked;
        opts.keyTarget = Math.max(1, Math.min(maxKeysAllowed ?? 50, parseInt($("o_keyCount").value, 10) || 3));
        opts.keyMgmt = $("o_keyMgmt").checked;
        opts.addOrder = $("o_addOrder").value;

        store.set("autoCopy", opts.autoCopy);
        store.set("selectedKey", selectedKey ?? "");
        store.set("reloadOnResume", opts.reloadOnResume);
        store.set("clickDelay", opts.clickDelay);
        store.set("closeAdTab", opts.closeAdTab);
        store.set("bypassDelay", opts.bypassDelay);
        store.set("multiKey", opts.multiKey);
        store.set("keyTarget", opts.keyTarget);
        store.set("keyMgmt", opts.keyMgmt);
        store.set("addOrder", opts.addOrder);
        store.setG("audioKeepalive", opts.audioKeepalive);
        store.setG("theme", opts.theme);
        store.setG("uiSize", opts.uiSize);
        store.setG("bypassMethod", opts.bypassMethod);
        store.setG("clickMethod", opts.clickMethod);
        store.setG("apiFallback", opts.apiFallback);
        store.setG("apiBypassDelay", opts.apiBypassDelay);
        store.setG("apiKey", $("o_apiKey").value.trim());

        if(opts.audioKeepalive && !prevAudio) {
            startAudioKeepalive();
            hookAudioResume();
        }
        if(!opts.audioKeepalive && prevAudio) stopAudioKeepalive();
        if(opts.multiKey) selectedKey = null;
        store.set("selectedKey", selectedKey ?? "");
        buildStyles(opts.theme, opts.uiSize);
        styleTooltip();
        const cw = store.getG("panelCustomW", null);
        if(cw) panel.style.width = cw + "px";

        if(opts.bypassMethod !== prevMethod) {
            bypassDone = false;
            bypassInProgress = false;
        }
        if(opts.clickMethod !== "api") applyBypassMethod(opts.bypassMethod, opts.bypassDelay);
        else {
            uninstallPopupOverride();
            uninstallScriptRemoval();
        }

        updateApiBypassUI();
        updateMultiKeyUI();
        log("Options saved [" + KS_ID + "]");

        $("optPanel").style.display = "none";
        optOpen = false;
        $("optBtn").className = "";
        renderKeyList();
    }

    function destroyScript() {
        paused = true;
        if(loopHandle) clearTimeout(loopHandle);
        if(timerInterval) clearInterval(timerInterval);
        stopAudioKeepalive();
        uninstallPopupOverride();
        uninstallScriptRemoval();
        try {
            host.remove();
        } catch (_) {}
    }

    // ─────────────────────────────────────────────
    // DRAGGABLE + RESIZE  ← PASTE FROM ORIGINAL
    // (let drag, dragOx, dragOy, resizing, resizeStartX, resizeStartW;
    //  function clampPos … function bindDragTargets … window.addEventListener("resize"…))
    // ─────────────────────────────────────────────
    let drag = false,
        dragOx = 0,
        dragOy = 0,
        resizing = false,
        resizeStartX = 0,
        resizeStartW = 0;

    function clampPos(x, y) {

        const pw = host.offsetWidth || 288,
            ph = host.offsetHeight || 260;

        return {
            x: Math.max(PANEL_MARGIN, Math.min(window.innerWidth - pw - PANEL_MARGIN, x)),
            y: Math.max(PANEL_MARGIN, Math.min(window.innerHeight - ph - PANEL_MARGIN, y))
        };

    }

    function applyPos(x, y) {

        const c = clampPos(x, y);

        host.style.left = c.x + "px";
        host.style.top = c.y + "px";
        host.style.right = "auto";

        store.setG("pos", c);

    }

    function onDragDown(e) {

        if(e.target && e.target.id === "resizeHandle") return;

        if(e.target && e.target.closest && e.target.closest("button")) return;

        drag = true;

        const r = host.getBoundingClientRect();

        dragOx = e.clientX - r.left;
        dragOy = e.clientY - r.top;

    }

    function onResizeDown(e) {

        e.stopPropagation();
        e.preventDefault();

        resizing = true;
        resizeStartX = e.clientX;
        resizeStartW = panel.offsetWidth;

    }

    window.addEventListener("mousemove", e => {

        if(drag) {
            pillDragMoved = true;
            applyPos(e.clientX - dragOx, e.clientY - dragOy);
        }

        if(resizing) {
            const nw = Math.max(220, resizeStartW + (e.clientX - resizeStartX));
            panel.style.width = nw + "px";
            store.setG("panelCustomW", nw);
        }

    });

    window.addEventListener("mouseup", () => {
        drag = false;
        resizing = false;
    });

    window.addEventListener("resize", () => {
        const r = host.getBoundingClientRect();
        if(r.left) applyPos(r.left, r.top);
    });

    function bindDragTargets() {

        const hdr = $("hdr");
        if(hdr) hdr.onmousedown = onDragDown;

        pill.onmousedown = (e) => {
            pillDragMoved = false;
            onDragDown(e);
        };
        const handle = $("resizeHandle");
        if(handle) handle.onmousedown = onResizeDown;

    }
    // ─────────────────────────────────────────────
    // AUDIO KEEPALIVE  ← PASTE FROM ORIGINAL
    // (let audioCtx, audioNode, audioReady;
    //  function startAudioKeepalive … function hookAudioResume)
    // ─────────────────────────────────────────────

    let audioCtx = null,
        audioNode = null,
        audioReady = false;

    function startAudioKeepalive() {

        if(audioCtx && audioCtx.state !== "closed") return;

        try {

            audioCtx = new(window.AudioContext || window.webkitAudioContext)();

            if(audioCtx.state === "suspended") {
                audioReady = false;
                return;
            }

            _runAudioLoop();

        } catch (_) {}

    }

    function _runAudioLoop() {

        if(!audioCtx || audioCtx.state === "closed") return;

        try {

            const buf = audioCtx.createBuffer(1, Math.max(1, Math.floor(audioCtx.sampleRate * 0.1)), audioCtx.sampleRate);

            function loop() {

                if(!audioCtx || audioCtx.state === "closed") return;

                audioNode = audioCtx.createBufferSource();

                audioNode.buffer = buf;

                audioNode.connect(audioCtx.destination);

                audioNode.onended = loop;

                audioNode.start();

            }

            loop();
            audioReady = true;

        } catch (_) {}

    }

    function resumeAudio() {
        if(!audioCtx) return;
        if(audioCtx.state === "suspended") audioCtx.resume().then(() => {
            if(!audioReady) _runAudioLoop();
        }).catch(() => {});
    }

    function stopAudioKeepalive() {

        try {

            if(audioNode) {
                audioNode.onended = null;
                try {
                    audioNode.stop();
                } catch (_) {}
                audioNode = null;
            }

            if(audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }

            audioReady = false;

        } catch (_) {}

    }

    function hookAudioResume() {

        const evs = ["click", "mousedown", "keydown", "touchstart", "pointerdown"];

        const h = () => {
            resumeAudio();
            evs.forEach(e => document.removeEventListener(e, h, true));
        };

        evs.forEach(e => document.addEventListener(e, h, {
            capture: true,
            passive: true
        }));

    }

    // ─────────────────────────────────────────────
    // TRUSTED CLICK ENGINE  ← PASTE FROM ORIGINAL
    // (async function humanClick(el) { … })
    // ─────────────────────────────────────────────

    async function humanClick(el) {
        if(!el) return false;
        const rect = el.getBoundingClientRect();
        if(!rect.width || !rect.height) return false;
        const padX = rect.width * 0.2,
            padY = rect.height * 0.2;
        const bx = rect.left + padX + Math.random() * (rect.width - padX * 2);
        const by = rect.top + padY + Math.random() * (rect.height - padY * 2);
        const jx = () => bx + (Math.random() - 0.5) * 2,
            jy = () => by + (Math.random() - 0.5) * 2;
        const safeView = (() => {
            try {
                new UIEvent("test", {
                    view: window
                });
                return window;
            } catch (_) {
                return null;
            }
        })();
        const mk = (cx, cy, x = {}) => ({
            bubbles: true,
            cancelable: true,
            view: safeView,
            clientX: cx,
            clientY: cy,
            screenX: cx + window.screenX,
            screenY: cy + window.screenY + (window.outerHeight - window.innerHeight),
            movementX: Math.round((Math.random() - 0.5) * 4),
            movementY: Math.round((Math.random() - 0.5) * 4),
            buttons: x.buttons ?? 0,
            button: x.button ?? 0,
            ...x
        });
        el.dispatchEvent(new PointerEvent("pointerover", mk(jx(), jy(), {
            buttons: 0
        })));
        el.dispatchEvent(new MouseEvent("mouseover", mk(jx(), jy(), {
            buttons: 0
        })));
        await sleep(humanDelay(40, 20, 15, 120));
        el.dispatchEvent(new PointerEvent("pointermove", mk(jx(), jy(), {
            buttons: 0
        })));
        el.dispatchEvent(new MouseEvent("mousemove", mk(jx(), jy(), {
            buttons: 0
        })));
        await sleep(humanDelay(30, 15, 10, 80));
        el.dispatchEvent(new PointerEvent("pointerenter", mk(jx(), jy(), {
            buttons: 0
        })));
        el.dispatchEvent(new MouseEvent("mouseenter", mk(jx(), jy(), {
            buttons: 0
        })));
        await sleep(humanDelay(60, 30, 20, 200));
        try {
            el.focus({
                preventScroll: true
            });
        } catch (_) {}
        await sleep(humanDelay(50, 25, 10, 150));
        el.dispatchEvent(new PointerEvent("pointerdown", mk(jx(), jy(), {
            buttons: 1,
            button: 0
        })));
        el.dispatchEvent(new MouseEvent("mousedown", mk(jx(), jy(), {
            buttons: 1,
            button: 0
        })));
        await sleep(humanDelay(80, 35, 30, 250));
        el.dispatchEvent(new PointerEvent("pointerup", mk(jx(), jy(), {
            buttons: 0,
            button: 0
        })));
        el.dispatchEvent(new MouseEvent("mouseup", mk(jx(), jy(), {
            buttons: 0,
            button: 0
        })));
        await sleep(humanDelay(20, 10, 5, 60));
        el.dispatchEvent(new MouseEvent("click", mk(jx(), jy(), {
            buttons: 0,
            button: 0
        })));
        await sleep(humanDelay(100, 50, 40, 300));
        el.dispatchEvent(new MouseEvent("mousemove", mk(jx() + (Math.random() - 0.5) * 20, jy() + (Math.random() - 0.5) * 20, {
            buttons: 0
        })));
        return true;
    }
    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────

    let paused = store.getG("pausedState", false);
    let selectedKey = (store.get("selectedKey", null) || "").trim() || null;
    let logLines = [],
        logOpen = false,
        optOpen = false,
        klOpen = true,
        loopHandle = null;
    const seenLogs = new Map();
    let phase = "idle",
        lastClickedStep = -1,
        clicking = false;
    const clickedStepsThisLoad = new Set();
    let keySlots = [],
        currentKeyText = null;
    let cdSecs = null,
        cdJustExpired = false,
        timerInterval = null;
    let pillDragMoved = false,
        managingKeys = false;

    function applyMinimize(min) {
        opts.minimized = min;
        store.setG("minimized", min);
        panel.style.display = min ? "none" : "";
        pill.style.display = min ? "flex" : "none";
    }

    function setDot(s) {
        const c = "dot" + (s === "paused" ? " paused" : s === "error" ? " error" : s === "bypass" ? " bypass" : "");
        const d = $("dot"),
            pd = $("pillDot");
        if(d) d.className = c;
        if(pd) pd.className = c;
    }

    function setAction(msg) {
        const el = $("actVal");
        if(!el) return;
        el.textContent = msg;
        el.title = msg;
        log(msg);
    }

    function setProgress(txt, color = "dim") {
        const el = $("progVal");
        if(!el) return;
        el.textContent = txt;
        el.className = "val " + color;
    }

    function log(msg) {
        const now = Date.now();
        if(seenLogs.has(msg) && now - seenLogs.get(msg) < 5000) return;
        seenLogs.set(msg, now);
        const ts = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        logLines.unshift(`<span class="lg hi">[${ts}] ${msg}</span>`);
        if(logLines.length > 80) logLines.pop();
        const lb = $("logBox");
        if(lb) lb.innerHTML = logLines.join("<br>");
        setTimeout(() => {
            const el = $("logBox")?.querySelector(".hi");
            if(el) el.classList.remove("hi");
        }, 2000);
        console.debug("[ALv4]", msg);
    }

    function updateCdDisplay() {
        const el = $("cdVal"),
            pt = $("pill-timer");
        if(cdSecs === null) {
            if(el) {
                el.textContent = "—";
                el.className = "val dim";
            }
            if(pt) pt.textContent = "—";
            return;
        }
        if(cdSecs <= 0) {
            if(el) {
                el.textContent = "Ready";
                el.className = "val green";
            }
            if(pt) pt.textContent = "Ready";
        } else {
            const t = fmtHMS(cdSecs);
            if(el) {
                el.textContent = t;
                el.className = "val yellow";
            }
            if(pt) pt.textContent = t;
        }
    }

    // ─────────────────────────────────────────────
    // KEY SLOTS
    // ─────────────────────────────────────────────

    function ensureKeySlot(k) {
        if(!k || k.length < 4) return false;
        k = k.trim();
        if(keySlots.find(s => s.key === k)) return false;
        keySlots.push({
            key: k,
            status: "active",
            timerSecs: null
        });
        if(!currentKeyText) currentKeyText = k;
        if(opts.autoCopy && navigator.clipboard?.writeText) navigator.clipboard.writeText(k).catch(() => {});
        log("Key: " + k.slice(0, 8) + "…");
        return true;
    }

    function setKeyStatus(k, status) {
        const s = keySlots.find(s => s.key === k);
        if(s && s.status !== status) {
            s.status = status;
            return true;
        }
        return false;
    }

    function setKeyTimer(k, secs) {
        const s = keySlots.find(s => s.key === k);
        if(!s) return;
        if(s.timerSecs === null || Math.abs(s.timerSecs - secs) > 5) s.timerSecs = secs;
    }

    function countPageKeys() {
        const spans = document.querySelectorAll("span[id^='_timeleft_']");
        if(spans.length > 0) return spans.length;
        const addTimeBtns = document.querySelectorAll("[id^='addtimebtn_']").length;
        if(addTimeBtns > 0) return addTimeBtns;
        return 0;
    }

    /**
     * Call window.renewKey(key) — the Luarmor page global that adds time / renews a key.
     * Falls back to clicking addtimebtn_ / renewbtn_ if the global isn't available.
     */
    async function callRenewKey(key) {
        try {
            if(typeof window.renewKey === "function") {
                window.renewKey(key);
                log("renewKey(" + key.slice(0, 8) + "…) called");
                return true;
            }
            const btn = qid(`addtimebtn_${key}`) || qid(`renewbtn_${key}`);
            if(canClick(btn)) {
                await humanClick(btn);
                return true;
            }
            return false;
        } catch (e) {
            log("callRenewKey error: " + e.message);
            return false;
        }
    }

    function getNextKeyForAddTime() {
        // If user has manually selected a key (single-key mode, multiple keys), lock to it
        if(selectedKey) {
            const slot = keySlots.find(s => s.key === selectedKey);
            if(slot && slot.status !== "waiting") return selectedKey;
        }

        let candidates = keySlots.filter(s => s.status !== "waiting");
        if(candidates.length === 0) return null;

        if(opts.addOrder === "bottomup") candidates = [...candidates].reverse();
        else if(opts.addOrder === "lowest") candidates = [...candidates].sort((a, b) => (a.timerSecs ?? Infinity) - (b.timerSecs ?? Infinity));

        if(typeof window.renewKey === "function") return candidates[0]?.key ?? null;

        for(const slot of candidates) {
            const btn = qid(`addtimebtn_${slot.key}`) || (slot.status === "expired" ? qid(`renewbtn_${slot.key}`) : null);
            if(btn && !btn.disabled) return slot.key;
        }
        return null;
    }

    function getNextKeyForRenew() {
        for(const slot of keySlots) {
            if(slot.status !== "expired") continue;
            if(typeof window.renewKey === "function") return slot.key;
            const btn = qid(`renewbtn_${slot.key}`);
            if(btn && !btn.disabled) return slot.key;
        }
        return null;
    }

    function renderKeyList() {
        const list = $("keyList"),
            cntEl = $("keyCnt"),
            klHdr = $("keyListHdr");
        if(!list || !cntEl) return;
        const total = keySlots.length,
            pageKeyCount = countPageKeys();
        const effectiveCount = Math.max(total, pageKeyCount);
        const isMulti = opts.multiKey && multiKeySupported !== false && maxKeysAllowed !== 1;
        const showSelectHint = !isMulti && total >= 1;

        // Inject/update the hint line in the header
        let hint = shadow.getElementById("klHint");
        if(showSelectHint) {
            if(!hint) {
                hint = document.createElement("div");
                hint.id = "klHint";
                hint.style.cssText = "font-size:0.75em;opacity:0.5;padding:2px 7px 3px;text-align:center;pointer-events:none;";
                // Insert after keyListHdr
                const wrap = $("keyListWrap");
                if(wrap && klHdr) wrap.insertBefore(hint, klHdr.nextSibling);
            }
            hint.textContent = selectedKey ? `Managing: ${selectedKey.slice(0,8)}…` : (total > 1 ? "Click a key to manage" : "");
        } else {
            if(hint) hint.remove();
            if(selectedKey && isMulti) selectedKey = null;
        }

        if(total === 0) {
            list.innerHTML = `<div class="kl-empty">No keys yet</div>`;
            cntEl.classList.add("hidden");
            return;
        }

        cntEl.textContent = isMulti ? `${effectiveCount}/${opts.keyTarget}` : `${total}/${total}`;
        cntEl.classList.remove("hidden");
        list.innerHTML = "";

        const t = THEMES[opts.theme] || THEMES.void;

        keySlots.forEach((slot, i) => {
            const row = document.createElement("div");
            row.className = "key-item";

            const isSelected = showSelectHint && selectedKey === slot.key;
            if(isSelected) {
                row.style.cssText = `background:${t.accentDim};border-left:2px solid ${t.accent};cursor:pointer;`;
            } else if(showSelectHint) {
                row.style.cssText = `cursor:pointer;transition:background .15s;`;
                row.onmouseenter = () => row.style.background = t.bg3;
                row.onmouseleave = () => row.style.background = "";
            }

            const bc = slot.status === "expired" ? "expired" :
                slot.status === "done" ? "done" :
                slot.status === "managed" ? "managed" :
                slot.status === "active" ? "active" :
                "waiting";
            const bt = slot.status === "expired" ? "expired" :
                slot.status === "done" ? "done" :
                slot.status === "managed" ? "mgmt" :
                slot.status === "active" ? "active" :
                "queue";

            let tTxt = "—",
                tCls = "ki-timer dim";
            if(slot.timerSecs !== null) {
                tTxt = fmtHMS(slot.timerSecs);
                tCls = "ki-timer" + (slot.timerSecs > 3600 ? "" : slot.timerSecs > 600 ? " yellow" : " red");
            }

            const selIndicator = isSelected ? `<span style="color:${t.accent};font-size:0.8em;flex-shrink:0" title="Selected">●</span>` : `<span style="width:0.8em;flex-shrink:0"></span>`;

            row.innerHTML = `${selIndicator}<span class="ki-num">${i+1}.</span><span class="ki-val" title="${slot.key}">${slot.key}</span><span class="${tCls}" id="kitimer_${i}">${tTxt}</span><span class="ki-badge ${bc}">${bt}</span><span class="ki-copy" data-key="${slot.key}" title="Copy">⎘</span>`;


            row.querySelector(".ki-copy").addEventListener("click", e => {
                const k = e.target.dataset.key;
                if(k && navigator.clipboard?.writeText) navigator.clipboard.writeText(k).catch(() => {});
            });

            list.appendChild(row);
        });
    }

    function startTimerTick() {
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(cdSecs !== null && cdSecs > 0) {
                cdSecs = Math.max(0, cdSecs - 1);
                if(cdSecs === 0) {
                    cdJustExpired = true;
                    log("Cooldown expired — waiting 1s");
                }
                updateCdDisplay();
            }
            keySlots.forEach((slot, i) => {
                if(slot.timerSecs !== null && slot.timerSecs > 0) {
                    slot.timerSecs = Math.max(0, slot.timerSecs - 1);
                    const el = shadow.getElementById(`kitimer_${i}`);
                    if(el) {
                        el.textContent = fmtHMS(slot.timerSecs);
                        el.className = "ki-timer" + (slot.timerSecs <= 0 ? " dim" : slot.timerSecs > 3600 ? "" : slot.timerSecs > 600 ? " yellow" : " red");
                    }
                }
            });
        }, 1000);
    }

    // ─────────────────────────────────────────────
    // SYNC FROM PAGE
    // ─────────────────────────────────────────────

    function syncFromPage() {
        let changed = false;

        const hubEl = document.getElementById("hubnamearea");
        if(hubEl) {
            const t = hubEl.textContent.trim();
            const e = $("hubName");
            if(e && e.textContent !== t && t) e.textContent = t;
        }

        const krt = document.getElementById("keysrowtitle");
        if(krt) {
            const m = krt.textContent.match(/\((\d+)\/(\d+)\)/);
            if(m) {
                const p = parseInt(m[2], 10);
                if(!isNaN(p) && p !== maxKeysAllowed) {
                    maxKeysAllowed = p;
                    log(`Key limit: ${p}`);
                    updateMultiKeyUI();
                }
            }
        }

        const nb2 = document.getElementById("nextbtn");
        if(nb2) {
            const match = (nb2.textContent || "").match(/(\d+:\d{2}:\d{2})/);
            if(match) {
                const p = parseHMS(match[1]);
                if(p !== null && p > 0) {
                    if(cdSecs === null || Math.abs(cdSecs - p) > 5) {
                        cdSecs = p;
                        cdJustExpired = false;
                        updateCdDisplay();
                    }
                } else {
                    if(cdSecs === null) {
                        cdSecs = 0;
                        updateCdDisplay();
                    }
                }
            } else {
                if(cdSecs === null) {
                    cdSecs = 0;
                    updateCdDisplay();
                }
            }
        }

        document.querySelectorAll("tr").forEach(tr => {
            const keyEl = tr.querySelector("h6.mb-0.text-sm");
            if(!keyEl) return;
            const key = keyEl.textContent.trim();
            if(!key || key.length < 4) return;
            if(ensureKeySlot(key)) changed = true;
            const timeCell = tr.querySelector("[id^='_timeleftarea_']") ||
                document.getElementById(`_timeleftarea_${key}`);
            if(timeCell) {
                const span = timeCell.querySelector("span");
                if(span) {
                    const parsed = parseHMS(span.textContent.trim());
                    if(parsed !== null) setKeyTimer(key, parsed);
                }
            }
            const statusBadge = tr.querySelector(".badge");
            if(statusBadge) {
                const txt = statusBadge.textContent.trim().toLowerCase();
                if(txt.includes("expired")) {
                    if(setKeyStatus(key, "expired")) changed = true;
                }
            }
            const renewBtn = document.getElementById(`renewbtn_${key}`);
            const slot = keySlots.find(s => s.key === key);
            if(slot) slot.hasRenew = !!renewBtn;
        });

        document.querySelectorAll("[id^='addtimebtn_']").forEach(el => {
            const k = el.id.replace("addtimebtn_", "");
            if(k && k.length >= 4 && ensureKeySlot(k)) changed = true;
        });

        document.querySelectorAll("[id^='renewbtn_']").forEach(el => {
            const k = el.id.replace("renewbtn_", "");
            if(k && k.length >= 4) {
                if(ensureKeySlot(k)) changed = true;
                const slot = keySlots.find(s => s.key === k);
                if(slot) {
                    slot.hasRenew = true;
                    if(slot.status !== "expired" && slot.status !== "managed") {
                        if(slot.timerSecs === 0 || slot.timerSecs === null) {
                            slot.status = "expired";
                            changed = true;
                        }
                    }
                }
            }
        });

        const newBtnEl = document.getElementById("newkeybtn");
        if(newBtnEl !== null && multiKeySupported !== true) {
            multiKeySupported = true;
            updateMultiKeyUI();
        } else if(newBtnEl === null && keySlots.length > 0 && phase === "done" && multiKeySupported !== false) {
            multiKeySupported = false;
            updateMultiKeyUI();
            log("Multi-key: not supported");
        }

        if(changed) renderKeyList();
    }

    // ─────────────────────────────────────────────
    // PAGE HELPERS
    // ─────────────────────────────────────────────

    const q = (s, r = document) => r.querySelector(s);
    const qid = id => document.getElementById(id);
    const visible = el => !!(el && el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden");
    const canClick = el => !!(el && visible(el) && !el.disabled && el.style.cursor !== "not-allowed");

    function isBlocked() {
        if(location.pathname.toLowerCase().includes("/blacklisted")) {
            setAction("Blacklisted");
            setDot("error");
            return true;
        }
        if(visible(q(".swal2-x-mark"))) {
            setAction("Blocked by site");
            setDot("error");
            return true;
        }
        if(visible(q(".loader"))) {
            setAction("Loader visible — waiting…");
            return true;
        }
        if(visible(q("#captchafield"))) {
            setAction("Captcha — please solve");
            return true;
        }
        const disc = q("h2.swal2-title#swal2-title");
        if(disc?.textContent.includes("Log In with Discord")) {
            setAction("Waiting for Discord login…");
            return true;
        }
        return false;
    }

    function getProgress() {
        const el = q("#adprogressp");
        if(!el) return null;
        const m = el.textContent.match(/(\d+)\/(\d+)/);
        if(!m) return null;
        return {
            current: parseInt(m[1], 10),
            total: parseInt(m[2], 10)
        };
    }

    // ─────────────────────────────────────────────
    // AD TAB AUTO-CLOSE
    // ─────────────────────────────────────────────

    let adTabRef = null;

    function setupAdTabClose() {
        if(!opts.closeAdTab) return;
        window.addEventListener("focus", () => {
            if(adTabRef && !adTabRef.closed) {
                try {
                    adTabRef.close();
                    log("Ad tab closed");
                } catch (_) {}
                adTabRef = null;
            }
        });
    }

    function tryGrabAdTab() {
        if(!opts.closeAdTab) return;
        if(popupMode !== "none") return;
        const orig = _pageWindow.open;
        _pageWindow.open = function (...args) {
            const tab = orig.apply(_pageWindow, args);
            if(tab) adTabRef = tab;
            _pageWindow.open = orig;
            return tab;
        };
        setTimeout(() => {
            _pageWindow.open = orig;
        }, 2000);
    }

    // ─────────────────────────────────────────────
    // KEY MANAGEMENT
    // ─────────────────────────────────────────────

    async function handleKeyManagement() {
        // Mark all non-expired, non-managed slots as managed
        keySlots.forEach(s => {
            if(s.status !== "expired" && s.status !== "managed") s.status = "managed";
        });
        renderKeyList();

        // Priority 1: renew expired keys (multi-key on: handles expired among the set)
        const expiredKey = getNextKeyForRenew();
        if(expiredKey) {
            setAction(`Key mgmt: renewing ${expiredKey.slice(0,8)}…`);
            log(`Key mgmt: renewing expired key ${expiredKey.slice(0,8)}`);
            if(opts.clickDelay > 0) await sleep(userDelay(opts.clickDelay));
            const ok = await callRenewKey(expiredKey);
            if(ok) {
                currentKeyText = expiredKey;
                cdSecs = null;
                cdJustExpired = false;
                const slot = keySlots.find(s => s.key === expiredKey);
                if(slot) slot.status = "managed";
                renderKeyList();
                resetRun();
                schedule(humanDelay(2000, 500, 1200, 4000));
            } else {
                setAction("Key mgmt: renew unavailable, waiting…");
                schedule(humanDelay(1500, 300));
            }
            return;
        }

        // Priority 2: add time to active/managed keys via renewKey()
        const targetKey = getNextKeyForAddTime();
        if(!targetKey) {
            setAction("Key mgmt: all keys busy, waiting…");
            schedule(humanDelay(2000, 400));
            return;
        }

        setAction(`Key mgmt: adding time to ${targetKey.slice(0,8)}…`);
        log(`Key mgmt: adding time to ${targetKey.slice(0,8)}`);
        if(opts.clickDelay > 0) await sleep(userDelay(opts.clickDelay));
        const ok = await callRenewKey(targetKey);
        if(ok) {
            currentKeyText = targetKey;
            cdSecs = null;
            cdJustExpired = false;
            resetRun();
            schedule(humanDelay(2000, 500, 1200, 4000));
        } else {
            setAction("Key mgmt: renewKey failed, waiting…");
            schedule(humanDelay(1500, 300));
        }
    }

    async function handleDone() {
        const newBtn = qid("newkeybtn");
        const keyEl = q("h6.mb-0.text-sm");
        const keyTxt = keyEl?.textContent.trim() ?? currentKeyText ?? null;

        if(newBtn !== null && multiKeySupported !== true) {
            multiKeySupported = true;
            updateMultiKeyUI();
        }
        if(newBtn === null && multiKeySupported !== false) {
            multiKeySupported = false;
            updateMultiKeyUI();
        }

        const pageKeyCount = countPageKeys();
        const doneCount = Math.max(keySlots.filter(s => s.status === "done" || s.status === "managed").length, pageKeyCount > 0 ? pageKeyCount - 1 : 0);

        if(keyTxt) setKeyStatus(keyTxt, "done");
        renderKeyList();

        // Multi-key OFF → always auto-add time to top key via renewKey (always-on management)
        if(!opts.multiKey || multiKeySupported === false || maxKeysAllowed === 1) {
            const topKey = keySlots[0]?.key;
            if(topKey) {
                setAction("Adding time to key…");
                log("Auto-adding time to top key: " + topKey.slice(0, 8) + "…");
                await sleep(humanDelay(1000, 300));
                const ok = await callRenewKey(topKey);
                if(ok) {
                    currentKeyText = topKey;
                    cdSecs = null;
                    cdJustExpired = false;
                    const slot = keySlots.find(s => s.key === topKey);
                    if(slot) slot.status = "managed";
                    renderKeyList();
                    resetRun();
                    schedule(humanDelay(2500, 500, 1500, 4000));
                    return;
                }
            }
            setAction("Done! ✓");
            phase = "finished";
            return;
        }

        await maybeStartNextKey(doneCount + 1);
    }

    async function maybeStartNextKey(completedCount) {
        if(!opts.multiKey || multiKeySupported === false || maxKeysAllowed === 1) {
            setAction("Done! ✓");
            phase = "finished";
            return;
        }
        const pageKeyCount = countPageKeys();
        const effectiveCount = Math.max(completedCount, pageKeyCount);
        const target = Math.min(opts.keyTarget, maxKeysAllowed ?? opts.keyTarget);
        log(`Keys on page: ${effectiveCount}, target: ${target}`);

        if(effectiveCount >= target) {
            if(effectiveKeyMgmt()) {
                log("Target reached — switching to key management mode");
                setAction("Target reached — managing keys…");
                managingKeys = true;
                phase = "keymgmt";
                await sleep(humanDelay(1500, 400));
                await handleKeyManagement();
            } else {
                setAction(`All ${target} keys done! ✓`);
                phase = "finished";
                log(`Multi-key complete: ${effectiveCount}/${target}`);
            }
            return;
        }

        // Handle expired keys mid-run before starting next key
        const hasExpired = keySlots.some(s => s.status === "expired");
        if(hasExpired) {
            log("Expired keys detected mid-run — renewing before continuing");
            setAction("Renewing expired keys before continuing…");
            managingKeys = true;
            phase = "keymgmt";
            await sleep(humanDelay(800, 200));
            await handleKeyManagement();
            return;
        }

        log(`Key ${effectiveCount}/${target} — starting next…`);
        setAction(`Starting key ${effectiveCount+1}/${target}…`);
        phase = "multikey_next";

        await sleep(userDelay(Math.max(opts.clickDelay, 1500)));

        const nb = qid("newkeybtn");
        if(canClick(nb)) {
            log("Clicking 'Get a New Key'");
            await humanClick(nb);
        } else {
            log("Waiting for 'Get a New Key'…");
            phase = "done";
            schedule(1500);
            return;
        }

        await sleep(humanDelay(2000, 500, 1000, 4000));
        currentKeyText = null;
        cdSecs = null;
        cdJustExpired = false;
        resetRun();
        schedule(humanDelay(1200, 400, 600, 2500));
    }

    function resetRun() {
        phase = "idle";
        lastClickedStep = -1;
        managingKeys = false;
        clicking = false;
    }

    // ─────────────────────────────────────────────
    // MAIN TICK
    // ─────────────────────────────────────────────

    async function tick() {
        if(paused) return;

        if(phase === "finished") {
            schedule(2000);
            return;
        }
        if(phase === "multikey_next") {
            schedule(2000);
            return;
        }
        if(phase === "keymgmt") {
            if(!paused) await handleKeyManagement();
            return;
        }
        if(isBlocked()) {
            schedule(700);
            return;
        }

        syncFromPage();
        // If no keys exist at all, click "Get a new key" automatically
        if(keySlots.length === 0 && phase === "idle") {
            const newBtn = qid("newkeybtn");
            if(canClick(newBtn)) {
                log("No keys found — clicking 'Get a new key'");
                setAction("No keys — creating first key…");
                await humanClick(newBtn);
                schedule(humanDelay(2000, 500, 1200, 4000));
            } else {
                setAction("Waiting for 'Get a new key' button…");
                schedule(800);
            }
            return;
        }

        const prog = getProgress(),
            btn = qid("nextbtn"),
            ready = canClick(btn);

        // Auto-enter management for expired keys (both single-key and multi-key modes)
        if(effectiveKeyMgmt() && phase === "idle" && !btn) {
            const hasExpired = keySlots.some(s => s.status === "expired");
            const renewAvail = hasExpired && (typeof window.renewKey === "function" || keySlots.some(s => s.status === "expired" && !!qid(`renewbtn_${s.key}`)));
            if(hasExpired && renewAvail) {
                log("Expired keys detected — entering key management to renew");
                setAction("Expired keys found — renewing…");
                phase = "keymgmt";
                managingKeys = true;
                await sleep(humanDelay(800, 200));
                await handleKeyManagement();
                return;
            }
        }

        if(prog) {
            const left = prog.total - prog.current;
            setProgress(`${prog.current} / ${prog.total}`, left > 0 ? "yellow" : "green");
            if(left <= 0 && phase !== "done") {
                phase = "done";
                setAction("All steps complete!");
                await sleep(humanDelay(700, 200));
                await handleDone();
                return;
            }
        } else {
            setProgress("—");
        }

        if(phase === "done") {
            schedule(2000);
            return;
        }

        if(phase === "idle") {
            if(!btn) {
                setAction("Waiting for page…");
                schedule(600);
                return;
            }
            if(ready) {
                const step = prog ? prog.current : 0;
                if(clickedStepsThisLoad.has(step)) {
                    setAction("Step already clicked this load — waiting…");
                    schedule(600);
                    return;
                }
                if(step <= lastClickedStep) {
                    setAction("Step already processed…");
                    schedule(600);
                    return;
                }
                if(cdJustExpired) {
                    cdJustExpired = false;
                    setAction("Cooldown done — waiting 1s…");
                    await sleep(humanDelay(1200, 200, 1000, 2000));
                }

                if(clicking) {
                    schedule(300);
                    return;
                }
                clicking = true;
                setAction("Opening ad…");
                log(`Clicking Next (step ${step})`);
                lastClickedStep = step;
                clickedStepsThisLoad.add(step);

                if(opts.clickMethod === "api") {
                    const result = await doApiBypassClick(btn, step);
                    clicking = false;
                    if(result === "no_key" || result === "redirected") return;
                } else {
                    tryGrabAdTab();
                    await humanClick(btn);
                    clicking = false;
                    if(opts.closeAdTab) {
                        try {
                            window.close();
                        } catch (_) {}
                    }
                }

                phase = "ad_open";
                schedule(humanDelay(350, 80, 200, 600));
            } else {
                setAction("Waiting for Next button…");
                schedule(600);
            }
            return;
        }

        if(phase === "ad_open") {
            if(!ready) {
                setAction("Ad running…");
                phase = "wait_unlock";
                schedule(humanDelay(900, 200, 500, 1500));
            } else schedule(humanDelay(300, 80, 150, 500));
            return;
        }

        if(phase === "wait_unlock") {
            if(!btn) {
                setAction("Button gone — waiting…");
                schedule(500);
                return;
            }
            if(ready) {
                const step = prog ? prog.current : lastClickedStep + 1;
                if(clickedStepsThisLoad.has(step)) {
                    setAction("Step already clicked — waiting for progress…");
                    schedule(humanDelay(600, 150, 300, 1000));
                    return;
                }
                if(step <= lastClickedStep) {
                    setAction("Waiting for progress update…");
                    schedule(humanDelay(350, 100, 200, 600));
                    return;
                }

                if(clicking) {
                    schedule(300);
                    return;
                }
                clicking = true;
                await sleep(humanDelay(1100, 250, 1000, 2000));
                if(opts.clickDelay > 0) await sleep(userDelay(opts.clickDelay));

                log(`Clicking Next (step ${step})`);
                setAction("Ad done — opening next…");
                lastClickedStep = step;
                clickedStepsThisLoad.add(step);

                if(opts.clickMethod === "api") {
                    const result = await doApiBypassClick(btn, step);
                    clicking = false;
                    if(result === "no_key" || result === "redirected") return;
                } else {
                    tryGrabAdTab();
                    await humanClick(btn);
                    clicking = false;
                }

                phase = "ad_open";
                schedule(humanDelay(350, 80, 200, 600));
            } else {
                setAction("Ad in progress…");
                schedule(humanDelay(800, 200, 500, 1400));
            }
            return;
        }
    }

    function schedule(delay) {
        if(loopHandle) clearTimeout(loopHandle);
        loopHandle = setTimeout(tick, delay);
    }

    // ─────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────

    function init() {
        populateSelects();
        applyOpts();
        rebindEvents();
        buildStyles(opts.theme, opts.uiSize);
        styleTooltip();

        const customW = store.getG("panelCustomW", null);
        if(customW) panel.style.width = customW + "px";

        applyMinimize(opts.minimized);

        if(opts.audioKeepalive) {
            startAudioKeepalive();
            hookAudioResume();
        }

        applyBypassMethod(opts.bypassMethod, opts.bypassDelay);

        updateApiBypassUI();

        setupAdTabClose();
        startTimerTick();
        syncFromPage();
        renderKeyList();
        if(selectedKey) {
            let attempts = 0;
            const validateInterval = setInterval(() => {
                if(keySlots.find(s => s.key === selectedKey)) {
                    renderKeyList();
                    clearInterval(validateInterval);
                } else if(++attempts >= 20) {
                    selectedKey = null;
                    store.set("selectedKey", "");
                    renderKeyList();
                    clearInterval(validateInterval);
                }
            }, 500);
        }
        setDot(paused ? "paused" : "ok");

        if(paused) {
            setAction("Paused");
        } else {
            schedule(humanDelay(1200, 300, 600, 2500));
        }
    }

    if(document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }

})();
