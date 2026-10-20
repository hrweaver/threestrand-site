// Pause Spots: places with Threestrand cards on their tables. Only places that said yes to being
// listed (Harry, 2026-10-20). Read by /spots/ and the home page. To add one, add a line here.
var PAUSE_SPOTS = [
  { name: "Selah Cafe Coffee & Market", town: "Boerne", address: "616 N Main St, Boerne, TX 78006",
    lat: 29.7988352, lng: -98.7346351, placeId: "ChIJq32JYxh3XIYRtJVRnrdK7hI", site: null },
  { name: "Brevity Coffee Co.", town: "Boerne", address: "428 W Bandera Rd, Boerne, TX 78006",
    lat: 29.7812046, lng: -98.7358004, placeId: "ChIJgRJoUdh3XIYRHk70k5NIVOE", site: "https://brevitycoffee.com/" }
];

function pauseSpotDirections(s) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.name + ", " + s.address) +
    "&query_place_id=" + s.placeId;
}

// Draws the spots on a Leaflet map in the element with this id. Hides the box if Leaflet didn't load.
function drawPauseSpotMap(id, opts) {
  var el = document.getElementById(id);
  if (!el) return;
  if (!window.L) { el.style.display = "none"; return; }
  var map = L.map(id, { scrollWheelZoom: false, zoomControl: !(opts && opts.compact) });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  var pin = L.divIcon({ className: "", iconSize: [22, 22], iconAnchor: [11, 11],
    html: '<div style="width:22px;height:22px;border-radius:50%;background:#5468D4;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>' });
  var bounds = [];
  PAUSE_SPOTS.forEach(function (s) {
    var a = document.createElement("div");
    var b = document.createElement("strong"); b.textContent = s.name; a.appendChild(b);
    a.appendChild(document.createElement("br"));
    var l = document.createElement("a"); l.href = pauseSpotDirections(s); l.target = "_blank"; l.rel = "noopener";
    l.textContent = "Directions"; a.appendChild(l);
    L.marker([s.lat, s.lng], { icon: pin, title: s.name }).addTo(map).bindPopup(a);
    bounds.push([s.lat, s.lng]);
  });
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
}
