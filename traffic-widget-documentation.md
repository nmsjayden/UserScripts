# Traffic Widget Script — Full Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Configuration Variables](#configuration-variables)
3. [High-Level Flow](#high-level-flow)
4. [Module Breakdown](#module-breakdown)
   - [Initialization & jQuery Loading](#1-initialization--jquery-loading)
   - [Client Info Collection](#2-client-info-collection)
   - [UUID Management](#3-uuid-management)
   - [Referrer Verification](#4-referrer-verification)
   - [Button Rendering](#5-button-rendering)
   - [Two-Step Code Retrieval](#6-two-step-code-retrieval)
   - [Incognito Detection](#7-incognito-detection)
   - [Visibility & Blur Tracking](#8-visibility--blur-tracking)
   - [Clipboard Copy](#9-clipboard-copy)
   - [Tooltip Display](#10-tooltip-display)
5. [API Endpoints](#api-endpoints)
6. [localStorage Keys](#localstorage-keys)
7. [Security & Anti-Abuse Mechanisms](#security--anti-abuse-mechanisms)
8. [Error Handling](#error-handling)
9. [Complete Execution Flow Diagram](#complete-execution-flow-diagram)

---

## Overview

This is a **self-contained JavaScript widget** that embeds into any webpage and presents users with a promotional code retrieval button. The widget is designed to require meaningful user engagement (waiting, navigating, not using incognito mode) before revealing a code, which is used to drive real traffic to partner websites.

The script is wrapped in an **IIFE (Immediately Invoked Function Expression)** to avoid polluting the global namespace.

---

## Configuration Variables

| Variable | Decoded Value | Purpose |
|---|---|---|
| `traffic_key` | `5vpVLXyw` | DOM element ID where the button is injected |
| `traffic_id` | `299a993d9820dadf86eb09ac1772e2e8` | Unique campaign/code identifier sent to the server |
| `traffic_domain` | `s1.what-on.com` | Base domain for all API requests |
| `v13b9b` | `69f2dc1feb65c91ff8029d04` | Session token sent with every API request |
| `uuid_name` | `traffic_pgEZt5vpVLXyw` | localStorage key for the user's UUID |
| `traffic_wait_time` | `60` | Seconds the user must wait before Step 1 completes |
| `traffic_step_2_wait_time` | `15` | Seconds the user must wait before Step 2 completes |

> **Note:** Several variables use hex-escaped strings (e.g., `\x35\x76\x70...`) which are standard JavaScript character escapes and decode to plain ASCII text at runtime.

---

## High-Level Flow

```
Page Load
   │
   ├─ Load jQuery (if not already on page)
   │
   ├─ Collect client info (browser, OS, screen, language)
   │
   ├─ Generate or retrieve user UUID from localStorage
   │
   ├─ Check referrer and localStorage for prior quest session
   │
   ├─ Check for Google Ads click (gclid) → abort if found
   │
   └─ Inject "Get Code" button into #5vpVLXyw element
          │
          └─ User clicks button
                 │
                 ├─ Check for Incognito mode → block if private
                 │
                 ├─ Start countdown timer
                 │
                 ├─ POST to /widget/client.js (step tracking)
                 │
                 └─ Timer expires → checkButtonClick()
                        │
                        ├─ Step 1: GET /widget/get_quest_code.html
                        │    └─ Store quest ID in localStorage
                        │
                        └─ Step 2 (if returning): GET /widget/get_quest_code.html
                             └─ Display final promo code + copy button
```

---

## Module Breakdown

### 1. Initialization & jQuery Loading

```javascript
if (window.jQuery === undefined || window.jQuery.fn.jquery !== '3.6.0') {
    // Dynamically inject jQuery 3.6.0 from Google CDN
}
```

The script ensures **exactly jQuery 3.6.0** is present. If the page has a different version, it loads its own copy via `noConflict(true)` to avoid version collisions with the host page.

An `isFirstLoad()` guard prevents the script from running more than once per page load, even if the script tag is somehow included multiple times.

---

### 2. Client Info Collection

The `getClientInfo()` function populates the `jscd` object with the following data, which is sent with every API request:

| Field | Source | Example |
|---|---|---|
| `screen` | `screen.width` / `screen.height` | `1920 x 1080` |
| `browser` | User-agent string parsing | `Chrome` |
| `browserVersion` | User-agent string parsing | `124.0` |
| `browserMajorVersion` | Parsed integer | `124` |
| `mobile` | Regex on `navigator.appVersion` | `false` |
| `os` | Regex table against user-agent | `Windows 10` |
| `osVersion` | Regex extraction | `10.0` |
| `cookies` | `navigator.cookieEnabled` | `true` |
| `flashVersion` | `swfobject` (if present) | `no check` |
| `lang` | `navigator.language` | `en-US` |
| `client_id` | UUID from localStorage | `xxxxxxxx-xxxx-4xxx-...` |
| `pathname` | `window.location.pathname` | `/deals/page` |
| `href` | `window.location.href` | Full URL |
| `hostname` | `window.location.hostname` | `example.com` |

This data is serialized via `jQuery.param(jscd)` and appended to API request URLs.

---

### 3. UUID Management

Each visitor is assigned a **persistent UUID** stored in `localStorage` under the key `traffic_pgEZt5vpVLXyw`.

```javascript
var uuid = localStorage.getItem(uuid_name);
if (uuid === null) {
    uuid = generateUUID();  // RFC4122 v4 UUID
    localStorage.setItem(uuid_name, uuid);
}
```

The `generateUUID()` function uses `Date.now()` combined with `performance.now()` (if available) for high-entropy randomness, producing a standard `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` format UUID.

This UUID serves as a persistent anonymous user identifier across sessions.

---

### 4. Referrer Verification

The widget checks whether the visitor is legitimate before showing the button. The `check_ref` flag must be `true` for the button to render.

Three conditions can set `check_ref = true`:

**A. Domain Allowlist Match**
If `ref_domain_list` is populated, the referrer URL is tested against each domain using a regex. A match grants access.

**B. No Referrer / Same-Page Navigation**
If `document.referrer` is empty or equals the current URL (direct visit or page refresh), access is granted.

**C. Prior Quest Session in localStorage**
If `uuid_name + '_quest'` exists in localStorage, the user already completed Step 1 and is returning for Step 2 — access is always granted.

Additionally, the script scans **all localStorage keys** matching the pattern `traffic_*_quest`. If any such key has a `timestamp` within the last 5 minutes from another widget instance on the same domain, `check_ref` is set to `false` to prevent rapid re-use.

**URL Hash Override (`#ss-<key>`):**
If the URL hash matches `#ss-5vpVLXyw`, the referrer check is bypassed entirely — this is an admin/debug override.

---

### 5. Button Rendering

When all conditions are met (`element` exists, `check_ref` is true, `get_code` is true), the widget injects a styled button into the target element.

**Button styles:**
- Background: `#ed1c24` (red)
- Border radius: `7px`
- Minimum width: `130px`
- Includes an icon from `https://s1.what-on.com/images/icons/icon-x64.png`
- Label text: `LẤY MÃ` (Vietnamese for "Get Code")

The button has hover (`#c40b11`), active (`#9a070d`), and release states managed via JavaScript mouse event listeners. Touch devices use `touchstart` instead of `click`.

---

### 6. Two-Step Code Retrieval

The code retrieval is split into two steps to ensure the user has actually engaged (visited an intermediate page).

#### Step 1 — First Visit

**Trigger:** User clicks the button, has no `_quest` key in localStorage.

1. Countdown timer starts at 60 seconds (`traffic_wait_time`).
2. Display updates every second: `"Please wait Xs (1/2)"`.
3. A POST request fires immediately to `/widget/client.js` with all client data — this likely records the click/visit server-side.
4. Once the timer reaches 0, `checkButtonClick()` is called.
5. A GET request goes to `/widget/get_quest_code.html?code=<traffic_id>&...`.
6. On success, the server response HTML is shown and the returned `result.id` is saved to localStorage:

```javascript
localStorage.setItem(uuid_name + '_quest', JSON.stringify({
    href: window.location.href,
    traffic_session: v13b9b,
    id: result.id,
    timestamp: Date.now()
}));
```

#### Step 2 — Return Visit

**Trigger:** User clicks the button, `_quest` key exists in localStorage.

1. Countdown timer starts at 15 seconds (`traffic_step_2_wait_time`).
2. Display updates: `"Get code after Xs (2/2)"`.
3. Once the timer reaches 0, a GET request goes to `/widget/get_quest_code.html?id=<quest_id>&code=<traffic_id>&...`.
4. On success, the promo code is displayed:
   ```
   Mã KM: XXXXXX  [copy icon]
   ```
5. Clicking the element copies the code to the clipboard via `copyTextToClipboard()`.
6. A tooltip `"Đã sao chép mã"` ("Copied code") appears for 3 seconds.
7. The `_quest` key is deleted from localStorage.

**The timer pauses** whenever the page is blurred (tab switch, window minimize) thanks to the `traffic_blurred` flag, so users cannot cheat the timer by switching away.

---

### 7. Incognito Detection

Before starting the countdown, the script runs `detectIncognito()`, a Promise-based browser fingerprinting utility that tests private browsing mode across all major browsers:

| Browser | Detection Method |
|---|---|
| **Chrome / Edge / Opera / Brave** | Queries `navigator.webkitTemporaryStorage.queryUsageAndQuota()` — quota is smaller in Incognito |
| **Safari (modern)** | Attempts to store a `Blob` in `indexedDB`; private mode throws a specific error |
| **Safari (old)** | Tries `window.openDatabase()` and `localStorage.setItem()` — both throw in private mode |
| **Firefox** | Checks `navigator.serviceWorker` — undefined in private windows |
| **Internet Explorer** | Checks `window.indexedDB` — undefined in InPrivate |

If private browsing is detected, the button is replaced with the message stored in `close_private_mode_message` and no further API calls are made.

---

### 8. Visibility & Blur Tracking

The script listens for page visibility changes using the **Page Visibility API** with cross-browser fallbacks:

```
visibilitychange  →  Standard (Chrome, Firefox, Safari)
mozvisibilitychange  →  Old Firefox
webkitvisibilitychange  →  Old Safari/Chrome
msvisibilitychange  →  IE 10
onfocusin/onfocusout  →  IE 9
onpageshow/onpagehide/onfocus/onblur  →  All others
```

When the page becomes hidden (user switches tabs or minimizes), `traffic_blurred` is set to `true`, **pausing the countdown timer**. This ensures the user must genuinely wait the full duration while actively on the page.

---

### 9. Clipboard Copy

`copyTextToClipboard(text)` uses the legacy `document.execCommand('copy')` approach for maximum browser compatibility:

1. Creates a hidden `<textarea>` positioned off-screen.
2. Sets its value to the text to copy.
3. Calls `.select()` on it.
4. Executes `document.execCommand('copy')`.
5. Removes the `<textarea>` from the DOM.
6. Temporarily suppresses the `oncopy` event to avoid side effects.

Returns `true` on success, `false` on failure.

---

### 10. Tooltip Display

`createTooltip(text)` builds a pure CSS/JS tooltip with:
- A black rounded pill for the message text.
- A downward-pointing triangle arrow beneath it.
- Positioned absolutely, centered above the element via `transform: translate(-50%, -50%)`.
- Auto-removed after 3 seconds via `setTimeout`.

---

## API Endpoints

All requests go to `https://s1.what-on.com`.

### POST `/widget/client.js`

Called immediately when the user clicks the button (Step 1 only).

**Body (form-encoded):**
```
traffic_session=69f2dc1feb65c91ff8029d04
&key=5vpVLXyw
&screen=1920 x 1080
&browser=Chrome
&browserVersion=124.0
...all jscd fields...
```

**Response:** Evaluated as JavaScript (`eval(xmlhttp.responseText)`) — likely sets tracking data server-side.

---

### GET `/widget/get_quest_code.html`

Called at the end of both Step 1 and Step 2 countdowns.

**Step 1 Query Parameters:**
```
code=299a993d9820dadf86eb09ac1772e2e8
&traffic_session=69f2dc1feb65c91ff8029d04
&key=5vpVLXyw
&<all jscd fields>
```

**Step 2 Query Parameters:**
```
id=<quest_id from Step 1>
&code=299a993d9820dadf86eb09ac1772e2e8
&traffic_session=69f2dc1feb65c91ff8029d04
&key=5vpVLXyw
&<all jscd fields>
```

**Response (JSON):**
```json
// Success
{ "success": true, "html": "PROMO123", "id": "abc123" }

// Failure
{ "success": false }
```

On a failed response (non-200 or `success: false`), one retry is attempted automatically. On the second failure, the error message `get_code_error_message` is shown.

---

## localStorage Keys

| Key | Value | Lifetime |
|---|---|---|
| `traffic_pgEZt5vpVLXyw` | UUID string | Permanent |
| `traffic_pgEZt5vpVLXyw_quest` | `{ href, traffic_session, id, timestamp }` JSON | Deleted after Step 2 succeeds |

---

## Security & Anti-Abuse Mechanisms

| Mechanism | Purpose |
|---|---|
| **Incognito detection** | Prevents anonymous one-time use with no persistent storage |
| **Referrer check** | Ensures the visitor came from a legitimate source or direct visit |
| **Google Ads click detection** (`gclid` param) | Aborts the widget for paid traffic clicks to avoid inflating metrics |
| **60-second countdown (Step 1)** | Forces the user to spend time on the page |
| **Blur-pause timer** | Prevents the countdown from running in a background tab |
| **localStorage quest state** | Server can verify the two-step journey was completed in order |
| **`isFirstLoad()` guard** | Prevents double-initialization |
| **5-minute cross-widget cooldown** | Scans localStorage for recent quest sessions from any widget |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| jQuery not available | Loads jQuery 3.6.0 from Google CDN before proceeding |
| `localStorage` unavailable | Falls back to generating a new UUID per session (no persistence) |
| API returns non-200 | Retries once; shows error message on second failure |
| API returns `success: false` | Shows `get_code_error_message` |
| Incognito mode detected | Shows `close_private_mode_message`, blocks further action |
| `detectIncognito` cannot identify browser | Promise rejects; the error is silently not handled (no button action) |
| Ads click detected (`gclid`) | `checkAdsClick()` returns true, `initScript` returns early |
