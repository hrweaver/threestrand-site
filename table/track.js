// Table-card funnel for Pulse: one page view per load and one event per store-button tap, each
// with the place (from the path) and the card's last six characters (from ?t=), so a card tap can
// be followed to this page and on to the store. Same endpoint and rules as assets/site.js:
// no cookie, no id, no user agent.
(function () {
  var url = "https://us-central1-abide-27797.cloudfunctions.net/siteEvent";
  var m = location.pathname.match(/^\/table\/([a-z0-9-]+)\//);
  var page = "table-" + (m ? m[1] : "generic");
  var t = (location.search.match(/[?&]t=([A-Za-z0-9_-]{22})/) || [])[1];
  var card = t ? t.slice(-6) : null;
  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var platform = ios ? "ios" : /Android/.test(ua) ? "android" : "desktop";
  function send(o) {
    o.page = page; o.card = card;
    var body = JSON.stringify(o);
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(url, body))) {
        fetch(url, { method: "POST", body: body, keepalive: true, mode: "cors" });
      }
    } catch (e) {}
  }
  send({ kind: "view", platform: platform });
  document.querySelectorAll('a[href*="apps.apple.com"], a[href*="play.google.com"]').forEach(function (a) {
    a.addEventListener("click", function () {
      send({ store: a.href.indexOf("apps.apple.com") >= 0 ? "ios" : "android" });
    });
  });
})();
