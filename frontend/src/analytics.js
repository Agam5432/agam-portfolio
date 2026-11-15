import axios from "axios";

// IDs live in localStorage/sessionStorage and are sent in the body, so tracking
// works even when the API is on another domain (third-party cookies are blocked).
const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`).replace(/[^A-Za-z0-9_-]/g, "");

function getId(storage, key) {
  try {
    let v = storage.getItem(key);
    if (!v) { v = uid(); storage.setItem(key, v); }
    return v;
  } catch {
    return uid();
  }
}

// Visit your own site once with ?notrack=1 to exclude this browser from analytics (?notrack=0 to undo).
function optedOut() {
  try {
    const q = new URLSearchParams(window.location.search).get("notrack");
    if (q === "1") localStorage.setItem("no_track", "1");
    if (q === "0") localStorage.removeItem("no_track");
    return localStorage.getItem("no_track") === "1" || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  } catch {
    return false;
  }
}

export const visitorId = () => getId(localStorage, "pf_vid");
export const sessionId = () => getId(sessionStorage, "pf_sid");

export function trackPageView(page) {
  if (optedOut()) return;
  axios.post("/api/analytics/track-visit", {
    visitorId: visitorId(), sessionId: sessionId(), page, referrer: document.referrer || "",
  }).catch(() => {});
}

export function trackResumeDownload() {
  if (optedOut()) return;
  axios.post("/api/analytics/resume-download", { visitorId: visitorId(), sessionId: sessionId() }).catch(() => {});
}
