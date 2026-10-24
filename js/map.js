/* ==========================================================================
   map.js — interactive map on map.html.
   Reads data/places.json, draws a marker per place, and shows a detail card
   when a marker (or a place in the list below the map) is chosen.
   Categories are told apart by SHAPE and icon, using palette colours only.
   ========================================================================== */

(function () {
  "use strict";

  var GREEN = "#0B6B3A", DEEP = "#064D2A", WHITE = "#FFFFFF",
      GOLD = "#C9A227", BLACK = "#111111";

  // Each category: label, outline shape, colours and a small glyph (40x40 grid).
  var CATEGORIES = {
    industry: {
      label: "Industry cluster", shapeName: "Square",
      shape: '<rect x="4" y="4" width="32" height="32" rx="3"/>',
      fill: GREEN, stroke: WHITE, glyphColour: WHITE,
      glyph: '<path d="M12 11h16v3H12zM18.5 14h3v3h-3zM14 17h12v2.5H14zM14 21.5h12V24H14zM12 26h16v3H12z"/>'
    },
    fair: {
      label: "Trade fair", shapeName: "Circle",
      shape: '<circle cx="20" cy="20" r="17"/>',
      fill: GOLD, stroke: BLACK, glyphColour: BLACK,
      glyph: '<path d="M12 13h16v15H12zM14 17h12v9H14z" fill-rule="evenodd"/><path d="M15 10h2v5h-2zM23 10h2v5h-2z"/>'
    },
    museum: {
      label: "Museum / Heritage", shapeName: "Arch",
      shape: '<path d="M5 37V19Q5 6 20 2Q35 6 35 19V37Z"/>',
      fill: BLACK, stroke: GOLD, glyphColour: GOLD,
      glyph: '<path d="M11 18l9-6 9 6zM12.5 19.5h2.5v8h-2.5zM18.75 19.5h2.5v8h-2.5zM25 19.5h2.5v8H25zM11 29h18v2.5H11z"/>'
    },
    craft: {
      label: "Craft / Ceramics", shapeName: "Diamond",
      shape: '<path d="M20 1.5L38.5 20L20 38.5L1.5 20Z"/>',
      fill: WHITE, stroke: GREEN, glyphColour: GREEN,
      glyph: '<path d="M17 11h6v2.5c0 1.5 4 3.5 4 8.5 0 4-3 7-7 7s-7-3-7-7c0-5 4-7 4-8.5z"/>'
    },
    food: {
      label: "Food", shapeName: "Triangle",
      shape: '<path d="M20 2L38.5 36H1.5Z"/>',
      fill: WHITE, stroke: BLACK, glyphColour: BLACK,
      glyph: '<path d="M15 16h10c0 4-2 5-2 8s2 4 2 7H15c0-3 2-4 2-7s-2-4-2-8zM12 32h16v2H12z"/>'
    },
    transport: {
      label: "Transport hub", shapeName: "Hexagon",
      shape: '<path d="M20 2L36 11V29L20 38L4 29V11Z"/>',
      fill: DEEP, stroke: GOLD, glyphColour: GOLD,
      glyph: '<path d="M13 12h14v13H13zM15 14h10v5H15z" fill-rule="evenodd"/><path d="M14 25h3l-2 4h-2zM23 25h3l1 4h-2z"/>'
    }
  };

  // Builds the SVG for a category marker. Used on the map, in the filter
  // buttons and in the place list, so the key always matches the map.
  function markerSvg(key, size) {
    var c = CATEGORIES[key];
    return '<svg viewBox="0 0 40 40" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' +
      '<g fill="' + c.fill + '" stroke="' + c.stroke + '" stroke-width="2.5" stroke-linejoin="round">' + c.shape + "</g>" +
      '<g fill="' + c.glyphColour + '">' + c.glyph + "</g>" +
    "</svg>";
  }

  var mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  // Start with the whole of Turkey in view, whatever the screen size
  var TURKEY_BOUNDS = [[35.8, 25.7], [42.1, 44.8]];
  var map = L.map(mapEl, { scrollWheelZoom: false, zoomSnap: 0.25 }).fitBounds(TURKEY_BOUNDS);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Only zoom with the scroll wheel once the visitor has clicked the map,
  // so scrolling down the page doesn't get trapped by the map.
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

  var cardEl = document.getElementById("place-card");
  var listEl = document.getElementById("place-list");
  var filtersEl = document.getElementById("map-filters");
  var countEl = document.getElementById("place-count");

  var places = [];
  var markers = {};                 // id -> Leaflet marker
  var active = {};                  // category -> shown?
  var selectedId = null;

  Object.keys(CATEGORIES).forEach(function (k) { active[k] = true; });

  // ---------- Detail card ----------

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function addField(parent, heading, text) {
    if (!text) return;
    parent.appendChild(el("h3", null, heading));
    parent.appendChild(el("p", null, text));
  }

  function showCard(place) {
    var c = CATEGORIES[place.category];
    cardEl.innerHTML = "";

    var badge = el("p", "place-card__badge");
    badge.innerHTML = markerSvg(place.category, 28);
    badge.appendChild(el("span", null, c.label));
    cardEl.appendChild(badge);

    var title = el("h2", "place-card__title", place.name);
    title.id = "place-card-title";
    title.tabIndex = -1;
    cardEl.appendChild(title);
    cardEl.appendChild(el("p", "place-card__city", place.city));

    addField(cardEl, "About", place.description);
    addField(cardEl, "Why it matters for compression moulding", place.whyItMatters);
    addField(cardEl, "Best time to visit", place.bestTime);
    addField(cardEl, "How to get there", place.howToGetThere);

    if (place.website) {
      var p = el("p");
      var a = el("a", null, "Official website");
      a.href = place.website;
      a.target = "_blank";
      a.rel = "noopener";
      p.appendChild(a);
      cardEl.appendChild(p);
    }

    var meta = el("p", "place-card__meta");
    meta.textContent = "Last verified: " + (place.lastVerified || "Not yet verified") +
      (place.locationPrecision === "approximate" ? " · Map position is approximate" : "");
    cardEl.appendChild(meta);
  }

  function select(id, opts) {
    var place = places.filter(function (p) { return p.id === id; })[0];
    if (!place) return;

    var prev = selectedId && markers[selectedId] && markers[selectedId].getElement();
    if (prev) L.DomUtil.removeClass(prev, "is-selected");
    selectedId = id;
    var current = markers[id] && markers[id].getElement();
    if (current) L.DomUtil.addClass(current, "is-selected");

    showCard(place);
    if (opts && opts.pan) map.setView([place.lat, place.lng], Math.max(map.getZoom(), 9));
    if (opts && opts.focusCard) document.getElementById("place-card-title").focus();
    history.replaceState(null, "", "#" + id);
  }

  // ---------- Filters and list ----------

  function buildFilters() {
    Object.keys(CATEGORIES).forEach(function (key) {
      var c = CATEGORIES[key];
      var count = places.filter(function (p) { return p.category === key; }).length;
      var btn = el("button", "filter-btn");
      btn.type = "button";
      btn.setAttribute("aria-pressed", "true");
      btn.dataset.category = key;
      btn.innerHTML = markerSvg(key, 26);
      btn.appendChild(el("span", null, c.label));
      btn.appendChild(el("span", "filter-btn__count", "(" + count + ")"));
      btn.title = c.shapeName + " marker";
      btn.addEventListener("click", function () {
        active[key] = !active[key];
        btn.setAttribute("aria-pressed", String(active[key]));
        refresh();
      });
      filtersEl.appendChild(btn);
    });
  }

  function refresh() {
    var shown = 0;
    listEl.innerHTML = "";

    places.forEach(function (place) {
      var visible = active[place.category];
      var m = markers[place.id];
      if (visible) {
        shown++;
        if (!map.hasLayer(m)) m.addTo(map);

        var li = el("li");
        var btn = el("button", "place-list__btn");
        btn.type = "button";
        btn.innerHTML = markerSvg(place.category, 28);
        var text = el("span");
        text.appendChild(el("strong", null, place.name));
        text.appendChild(el("span", null, place.city + " · " + CATEGORIES[place.category].label));
        btn.appendChild(text);
        btn.addEventListener("click", function () { select(place.id, { pan: true, focusCard: true }); });
        li.appendChild(btn);
        listEl.appendChild(li);
      } else if (map.hasLayer(m)) {
        map.removeLayer(m);
      }
    });

    countEl.textContent = shown === 1 ? "1 place shown" : shown + " places shown";
  }

  // ---------- Load data ----------

  function showLoadError() {
    cardEl.innerHTML =
      "<h2>The places could not be loaded</h2>" +
      "<p>Browsers block data files on pages opened by double-clicking. " +
      "In VS Code, right-click <strong>map.html</strong> and choose " +
      "<strong>Open with Live Server</strong>. Once the site is online, this works automatically.</p>";
  }

  fetch("data/places.json")
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (data) {
      places = (data.places || []).filter(function (p) { return CATEGORIES[p.category]; });

      places.forEach(function (place) {
        var icon = L.divIcon({
          className: "map-marker",
          html: markerSvg(place.category, 36),
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        var m = L.marker([place.lat, place.lng], {
          icon: icon,
          title: place.name,
          alt: place.name + " (" + CATEGORIES[place.category].label + ")",
          keyboard: true
        });
        m.bindTooltip(place.name, { direction: "top", offset: [0, -18] });
        m.on("click", function () {
          select(place.id, { focusCard: false });
          // On phones the card sits below the map, so bring it into view
          if (window.innerWidth < 960) cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        markers[place.id] = m;
      });

      buildFilters();
      refresh();

      // Open a place directly from a link such as map.html#bursa-industry
      var fromHash = window.location.hash.slice(1);
      if (fromHash) select(fromHash, { pan: true });
    })
    .catch(showLoadError);
})();
