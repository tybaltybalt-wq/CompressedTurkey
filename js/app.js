/* ==========================================================================
   app.js — shared by every page.
   Builds the header menu and footer so they only need editing in one place.
   Each page just needs:  <div id="site-header"></div>  and
                          <div id="site-footer"></div>
   ========================================================================== */

(function () {
  "use strict";

  // The site menu. To rename a page in the menu, change its label here.
  var NAV = [
    { href: "index.html",     label: "Home" },
    { href: "map.html",       label: "Map" },
    { href: "cities.html",    label: "Cities" },
    { href: "itinerary.html", label: "Itinerary" },
    { href: "technique.html", label: "Technique" },
    { href: "events.html",    label: "Events" },
    { href: "tips.html",      label: "Tips" }
  ];

  // Small press icon used as the logo (two platens squeezing a part).
  var LOGO_SVG =
    '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
      '<rect x="4" y="4" width="32" height="6" rx="1" fill="#C9A227"/>' +
      '<rect x="18" y="10" width="4" height="6" fill="#C9A227"/>' +
      '<rect x="8" y="16" width="24" height="5" rx="1" fill="#FFFFFF"/>' +
      '<rect x="8" y="23" width="24" height="5" rx="1" fill="#FFFFFF"/>' +
      '<rect x="4" y="30" width="32" height="6" rx="1" fill="#C9A227"/>' +
    '</svg>';

  function currentPage() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  function buildHeader() {
    var slot = document.getElementById("site-header");
    if (!slot) return;

    var here = currentPage();
    var links = NAV.map(function (item) {
      var current = item.href === here ? ' aria-current="page"' : "";
      return '<li><a href="' + item.href + '"' + current + ">" + item.label + "</a></li>";
    }).join("");

    slot.outerHTML =
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="site-header">' +
        '<div class="container site-header__inner">' +
          '<a class="brand" href="index.html">' + LOGO_SVG +
            '<span>Turkey for Compression<br>Moulding Enthusiasts</span>' +
          "</a>" +
          '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
          '<nav class="site-nav" id="site-nav" aria-label="Main">' +
            "<ul>" + links + "</ul>" +
          "</nav>" +
        "</div>" +
      "</header>";

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close the phone menu with the Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  function buildFooter() {
    var slot = document.getElementById("site-footer");
    if (!slot) return;

    var links = NAV.map(function (item) {
      return '<li><a href="' + item.href + '">' + item.label + "</a></li>";
    }).join("");

    slot.outerHTML =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            "<div>" +
              "<h2>About this guide</h2>" +
              "<p>An independent travel planner for people who love how things are made, " +
              "from SMC body panels to hand-painted tiles.</p>" +
            "</div>" +
            '<nav aria-label="Footer"><h2>Pages</h2><ul>' + links + "</ul></nav>" +
            "<div>" +
              "<h2>Please note</h2>" +
              "<p>Factory visits require prior permission from the company. " +
              "This site does not guarantee access to any site.</p>" +
            "</div>" +
          "</div>" +
          '<div class="footer-legal">' +
            "<p>Always check dates, opening hours and prices with official sources before you travel. " +
            "Map data &copy; OpenStreetMap contributors.</p>" +
            "<p>&copy; " + new Date().getFullYear() + " Turkey for Compression Moulding Enthusiasts.</p>" +
          "</div>" +
        "</div>" +
      "</footer>";
  }

  buildHeader();
  buildFooter();
})();
