// Platform awareness: a phone sees the store that applies to it; desktop sees both.
(function () {
  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var cls = isIOS ? "is-ios" : isAndroid ? "is-android" : "is-desktop";
  document.documentElement.classList.add(cls);
  if (cls !== "is-desktop") {
    document.querySelectorAll(".stores-both").forEach(function (el) { el.style.display = "none"; });
  }
})();

// Store-button taps, counted for matching iPhone installs to the ad that brought them
// (iPhone tells the app nothing about where an install came from). Sends only which store,
// the ad's campaign tags from this page's URL, and which button: no cookie, no id.
// Runs before the pass-through below, which rewrites the links it reads the spot from.
(function () {
  var q = new URLSearchParams(location.search);
  var url = "https://us-central1-abide-27797.cloudfunctions.net/siteEvent";
  document.querySelectorAll('a[href*="apps.apple.com"], a[href*="play.google.com"]').forEach(function (a) {
    var u = new URL(a.href, location.href);
    var ios = u.hostname === "apps.apple.com";
    var spot = ios ? (u.searchParams.get("ct") || "").replace(/^site_/, "")
                   : new URLSearchParams(u.searchParams.get("referrer") || "").get("utm_campaign") || "";
    a.addEventListener("click", function () {
      var body = JSON.stringify({
        store: ios ? "ios" : "android",
        utm_source: q.get("utm_source"), utm_medium: q.get("utm_medium"), utm_campaign: q.get("utm_campaign"),
        spot: spot || null, page: document.body.getAttribute("data-page") || "home"
      });
      try {
        if (!(navigator.sendBeacon && navigator.sendBeacon(url, body))) {
          fetch(url, { method: "POST", body: body, keepalive: true, mode: "cors" });
        }
      } catch (e) {}
    });
  });
})();

// One page view per load, same endpoint and same fields as a tap, so a landing page's
// store taps can be read against its visitors. Still no cookie, no id, no user agent.
(function () {
  var q = new URLSearchParams(location.search);
  var url = "https://us-central1-abide-27797.cloudfunctions.net/siteEvent";
  var c = document.documentElement.classList;
  var body = JSON.stringify({
    kind: "view", platform: c.contains("is-ios") ? "ios" : c.contains("is-android") ? "android" : "desktop",
    utm_source: q.get("utm_source"), utm_medium: q.get("utm_medium"), utm_campaign: q.get("utm_campaign"),
    page: document.body.getAttribute("data-page") || "home"
  });
  try {
    if (!(navigator.sendBeacon && navigator.sendBeacon(url, body))) {
      fetch(url, { method: "POST", body: body, keepalive: true, mode: "cors" });
    }
  } catch (e) {}
})();

// Campaign pass-through: a visitor who arrived from an ad (?utm_source=...) carries that
// source into the store. Play gets it in the install referrer, which the app reads on first
// launch; the App Store gets a ct= campaign tag that App Store Connect reports downloads by.
// The button's own spot on the page (hero, close) rides along as utm_content.
(function () {
  var q = new URLSearchParams(location.search);
  var src = q.get("utm_source");
  if (!src) return;
  var keep = ["utm_source", "utm_medium", "utm_campaign", "utm_term"];
  document.querySelectorAll('a[href*="play.google.com"][href*="referrer="]').forEach(function (a) {
    var u = new URL(a.href);
    var spot = new URLSearchParams(u.searchParams.get("referrer") || "").get("utm_campaign") || "";
    var r = new URLSearchParams();
    keep.forEach(function (k) { var v = q.get(k); if (v) r.set(k, v.slice(0, 100)); });
    if (spot) r.set("utm_content", spot);
    u.searchParams.set("referrer", r.toString());
    a.href = u.toString();
  });
  document.querySelectorAll('a[href*="apps.apple.com"][href*="ct=site_"]').forEach(function (a) {
    var u = new URL(a.href);
    var ct = [src, q.get("utm_campaign")].filter(Boolean).join("-").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
    u.searchParams.set("ct", ct);
    a.href = u.toString();
  });
})();
