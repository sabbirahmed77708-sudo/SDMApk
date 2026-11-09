// Shared helpers for the public SdmApk pages.
(function () {
  "use strict";
  var SDM = (window.SDM = {});

  SDM.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // Only HTTPS links are ever placed in href/src.
  SDM.safeUrl = function (u) {
    try {
      var x = new URL(u);
      return x.protocol === "https:" ? x.href : "";
    } catch (e) {
      return "";
    }
  };

  SDM.api = function (url) {
    return fetch(url, { headers: { accept: "application/json" } }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) {
          var err = new Error(d.error || "Request failed");
          err.status = r.status;
          throw err;
        }
        return d;
      });
    });
  };

  function tint(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h % 6;
  }
  function initial(name) {
    return (String(name).trim().charAt(0) || "?").toUpperCase();
  }

  SDM.iconHTML = function (app, cls) {
    var src = SDM.safeUrl(app.icon_url);
    var letter = SDM.esc(initial(app.name));
    var t = tint(app.name);
    if (!src) return '<span class="icon-tile" data-tint="' + t + '" aria-hidden="true">' + letter + "</span>";
    return (
      '<img class="app-icon" src="' + SDM.esc(src) + '" alt="" width="60" height="60" loading="lazy" decoding="async"' +
      ' referrerpolicy="no-referrer" data-letter="' + letter + '" data-tint="' + t + '">'
    );
  };

  // A broken icon link falls back to a letter tile.
  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG" && el.dataset && el.dataset.letter) {
      var span = document.createElement("span");
      span.className = "icon-tile";
      span.setAttribute("data-tint", el.dataset.tint || "0");
      span.setAttribute("aria-hidden", "true");
      span.textContent = el.dataset.letter;
      el.replaceWith(span);
    }
  }, true);

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-5-5m5 5 5-5M5 20h14"/></svg>';

  SDM.cardHTML = function (app) {
    var dl = SDM.safeUrl(app.download_url);
    var detailHref = "/app/?id=" + encodeURIComponent(app.id);
    var shots = (app.screenshots || []).map(SDM.safeUrl).filter(Boolean).slice(0, 5);
    var sub = SDM.esc(app.category || "Other") + (app.version ? " · v" + SDM.esc(String(app.version).replace(/^v/i, "")) : "");
    return (
      '<article class="card">' +
      '<div class="card-top">' + SDM.iconHTML(app) +
      '<div class="card-id"><h3><a href="' + detailHref + '">' + SDM.esc(app.name) + "</a></h3>" +
      '<p class="card-sub">' + sub + "</p></div>" +
      (dl
        ? '<a class="btn btn-primary btn-sm-dl" data-dl="' + app.id + '" href="' + SDM.esc(dl) + '" target="_blank" rel="noopener noreferrer nofollow" aria-label="Download ' + SDM.esc(app.name) + '">Download</a>'
        : "") +
      "</div>" +
      (shots.length
        ? '<div class="card-shots">' + shots.map(function (u, i) {
            return '<a href="' + detailHref + '" tabindex="-1" aria-hidden="true"><img src="' + SDM.esc(u) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></a>';
          }).join("") + "</div>"
        : "") +
      '<p class="card-desc">' + (app.description ? SDM.esc(app.description) : "No description yet.") + "</p></article>"
    );
  };

  // 950 -> "950", 1234 -> "1.2K", 2500000 -> "2.5M"
  SDM.fmtCount = function (n) {
    n = Number(n) || 0;
    if (n < 1000) return String(n);
    if (n < 1000000) return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "") + "K";
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  };

  // Count a download click once per app per day per browser.
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("[data-dl]") : null;
    if (!a) return;
    var id = Number(a.getAttribute("data-dl"));
    if (!id) return;
    try {
      var key = "sdmapk-dl-" + id;
      var day = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(key) === day) return;
      localStorage.setItem(key, day);
    } catch (err) { /* storage can be unavailable; still count */ }
    try {
      fetch("/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: id }),
        keepalive: true
      }).catch(function () {});
    } catch (err) { /* ignore */ }
  });

  SDM.fmtDate = function (iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  var CAT_ICONS = {
    tools: "M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7V21h3.3l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
    productivity: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9",
    education: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13",
    entertainment: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM10 8.5v7l6-3.5z",
    communication: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
    photography: "M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    personalization: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
    games: "M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-3.9 3.2L1.6 15a3 3 0 0 0 5.2 2.4L8 16h8l1.2 1.4a3 3 0 0 0 5.2-2.4l-1.2-6.8A4 4 0 0 0 17.3 5z",
    _: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
  };
  SDM.catIcon = function (name) {
    var d = CAT_ICONS[String(name).toLowerCase()] || CAT_ICONS._;
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  };

  // Theme toggle
  var themeBtn = document.getElementById("theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var cur = root.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("sdmapk-theme", next); } catch (e) {}
    });
  }

  // Mobile menu
  var menuBtn = document.getElementById("menu-btn");
  var links = document.getElementById("nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }
})();
