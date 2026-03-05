// ==UserScript==
// @name        edpuzzle-answers script launcher FIXED
// @namespace   edpuzzle.hs.vc
// @match       https://edpuzzle.com/*
// @description CSP fixed Edpuzzle Script
// @grant       GM_xmlhttpRequest
// @connect     cdn.jsdelivr.net
// @connect     edpuzzle.hs.vc
// @license     MIT
// @run-at      document-end
// @version     1.0.0
// @author      ading2210
// @downloadURL https://update.greasyfork.org/scripts/568515/edpuzzle-answers%20script%20launcher%20FIXED.user.js
// @updateURL https://update.greasyfork.org/scripts/568515/edpuzzle-answers%20script%20launcher%20FIXED.meta.js
// ==/UserScript==

const BASE = "https://edpuzzle.hs.vc";

function gmFetch(url, method="GET", body=null) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method, url, data: body,
      onload: r => resolve({ status: r.status, text: r.responseText }),
      onerror: () => reject(new Error("Network error for " + url))
    });
  });
}

function injectBlob(code) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const s = document.createElement("script");
    s.src = blobUrl;
    s.onload = () => { URL.revokeObjectURL(blobUrl); resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function launch_script() {
  const [scriptJs, openJs, popupHtml, mainJs, popupCss] = await Promise.all([
    gmFetch("https://cdn.jsdelivr.net/gh/ading2210/edpuzzle-answers@latest/script.js"),
    gmFetch(BASE + "/open.js"),
    gmFetch(BASE + "/popup.html"),
    gmFetch(BASE + "/main.js"),
    gmFetch(BASE + "/styles/popup.css"),
  ].map(p => p.then(r => r.text)));

  const cache = {
    [BASE + "/open.js"]: openJs,
    [BASE + "/popup.html"]: popupHtml,
    [BASE + "/main.js"]: mainJs,
    [BASE + "/styles/popup.css"]: popupCss,
  };

  const patchCode = `
    (function() {
      const __cache__ = ${JSON.stringify(cache)};
      const BASE = "${BASE}";

      // GM bridge — userscript exposes this for page context to call
      window.__gmFetch__ = function(url, method, body) {
        return new Promise((resolve, reject) => {
          const id = Math.random().toString(36).slice(2);
          window.addEventListener("__gmResponse__" + id, e => resolve(e.detail), {once: true});
          window.dispatchEvent(new CustomEvent("__gmRequest__", {
            detail: { id, url, method, body }
          }));
        });
      };

      // Patch fetch — cache known files, proxy everything else on edpuzzle.hs.vc
      const _fetch = window.fetch;
      window.fetch = async function(url, opts={}) {
        const key = typeof url === "string" ? url : url.url;
        if (__cache__[key] !== undefined) {
          return new Response(__cache__[key], { status: 200 });
        }
        if (key.startsWith(BASE)) {
          const result = await window.__gmFetch__(key, opts.method || "GET", opts.body || null);
          return new Response(result.text, { status: result.status });
        }
        return _fetch(url, opts);
      };

      // Patch XHR — same logic
      const _XHR = window.XMLHttpRequest;
      class XMLHttpRequest extends _XHR {
        open(method, url, ...args) {
          this._interceptUrl = url;
          this._interceptMethod = method;
          super.open(method, url, ...args);
        }
        send(body) {
          const cached = __cache__[this._interceptUrl];
          if (cached !== undefined) {
            const self = this;
            setTimeout(() => {
              Object.defineProperty(self, 'readyState', {configurable:true, value: 4});
              Object.defineProperty(self, 'status', {configurable:true, value: 200});
              Object.defineProperty(self, 'responseText', {configurable:true, value: cached});
              self.dispatchEvent(new Event('load'));
            }, 0);
          } else if (this._interceptUrl && this._interceptUrl.startsWith(BASE)) {
            const self = this;
            window.__gmFetch__(this._interceptUrl, this._interceptMethod, body).then(result => {
              Object.defineProperty(self, 'readyState', {configurable:true, value: 4});
              Object.defineProperty(self, 'status', {configurable:true, value: result.status});
              Object.defineProperty(self, 'responseText', {configurable:true, value: result.text});
              self.dispatchEvent(new Event('load'));
            });
          } else {
            super.send(body);
          }
        }
      }
      window.XMLHttpRequest = XMLHttpRequest;

      // Patch eval
      const _eval = window.eval;
      window.eval = function(code) {
        console.log("eval intercepted, injecting via blob");
        const blob = new Blob([code], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        const s = document.createElement("script");
        s.src = blobUrl;
        s.onload = () => URL.revokeObjectURL(blobUrl);
        document.head.appendChild(s);
        window.eval = _eval;
      };

      console.log("All patches applied");
    })();
  `;

  // Listen for GM bridge requests from page context
  window.addEventListener("__gmRequest__", async e => {
    const { id, url, method, body } = e.detail;
    const result = await gmFetch(url, method, body);
    window.dispatchEvent(new CustomEvent("__gmResponse__" + id, { detail: result }));
  });

  await injectBlob(patchCode);
  await injectBlob(scriptJs);
}

function addButton() {
  const btn = document.createElement("button");
  btn.textContent = "⚡ EDPUZZLE ANSWERS";
  btn.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    padding: 12px 24px !important;
    font-size: 16px !important;
    font-weight: bold !important;
    background: #e53935 !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
  `;
  btn.onclick = () => { btn.remove(); launch_script(); };
  document.body.appendChild(btn);
}

if (document.body) addButton();
else document.addEventListener("DOMContentLoaded", addButton);
