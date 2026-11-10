// Homepage: loads apps once, then searches, filters and sorts in the browser.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var S = { apps: [], q: "", cat: "", sort: "newest" };

  var els = {
    heroChips: $("hero-chips"), heroForm: $("hero-search"), heroQ: $("q"), heroCount: $("hero-count"),
    stage: $("hero-stage"), home: $("home-grid"),
    featuredSec: $("featured-section"), featured: $("featured"),
    catSec: $("categories-section"), cats: $("cat-grid"),
    list: $("apps"), status: $("status"),
    filterQ: $("filter-q"), filterCat: $("filter-cat"), filterSort: $("filter-sort")
  };

  function readUrl() {
    var p = new URLSearchParams(location.search);
    S.q = (p.get("q") || "").slice(0, 100);
    S.cat = p.get("category") || "";
    var s = p.get("sort");
    if (["newest", "oldest", "az", "za"].indexOf(s) >= 0) S.sort = s;
  }
  function writeUrl() {
    var p = new URLSearchParams();
    if (S.q) p.set("q", S.q);
    if (S.cat) p.set("category", S.cat);
    if (S.sort !== "newest") p.set("sort", S.sort);
    var qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }

  function categories() {
    var map = {};
    S.apps.forEach(function (a) {
      var c = a.category || "Other";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.keys(map).sort(function (a, b) { return map[b] - map[a] || a.localeCompare(b); })
      .map(function (n) { return { name: n, count: map[n] }; });
  }

  function filtered() {
    var q = S.q.trim().toLowerCase();
    var out = S.apps.filter(function (a) {
      if (S.cat && (a.category || "Other") !== S.cat) return false;
      if (!q) return true;
      return (a.name + " " + (a.description || "") + " " + (a.category || "")).toLowerCase().indexOf(q) >= 0;
    });
    out.sort(function (a, b) {
      if (S.sort === "az") return a.name.localeCompare(b.name);
      if (S.sort === "za") return b.name.localeCompare(a.name);
      var d = String(a.created_at).localeCompare(String(b.created_at)) || a.id - b.id;
      return S.sort === "oldest" ? d : -d;
    });
    return out;
  }

  function renderCategories() {
    var cats = categories();
    els.catSec.hidden = cats.length === 0;
    els.cats.innerHTML = cats.map(function (c) {
      return '<button type="button" class="cat" data-cat="' + SDM.esc(c.name) + '" aria-pressed="' + (S.cat === c.name) + '">' +
        '<span class="cat-ico">' + SDM.catIcon(c.name) + "</span>" +
        "<span><b>" + SDM.esc(c.name) + "</b><small>" + c.count + (c.count === 1 ? " app" : " apps") + "</small></span></button>";
    }).join("");
    els.heroChips.innerHTML = cats.slice(0, 5).map(function (c) {
      return '<button type="button" data-cat="' + SDM.esc(c.name) + '">' + SDM.esc(c.name) + "</button>";
    }).join("");
    els.filterCat.innerHTML = '<option value="">All categories</option>' + cats.map(function (c) {
      return '<option value="' + SDM.esc(c.name) + '"' + (S.cat === c.name ? " selected" : "") + ">" + SDM.esc(c.name) + "</option>";
    }).join("");
  }

  // The hero shows up to nine of the newest apps as tiles.
  function renderPhone() {
    var newest = S.apps.slice().sort(function (a, b) {
      return String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id;
    }).slice(0, 9);
    els.stage.hidden = newest.length === 0;
    var html = newest.map(function (a) {
      return '<li><a href="/app/?id=' + encodeURIComponent(a.id) + '">' + SDM.iconHTML(a) +
        '<span class="label">' + SDM.esc(a.name) + "</span></a></li>";
    });
    while (html.length < 6) html.push('<li aria-hidden="true"><span class="ghost"></span></li>');
    els.home.innerHTML = html.join("");
  }

  function renderFeatured() {
    var newest = S.apps.slice().sort(function (a, b) {
      return String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id;
    }).slice(0, 3);
    // With only a few apps the full list below already shows them all.
    var show = S.apps.length >= 4;
    els.featuredSec.hidden = !show;
    els.featured.innerHTML = show ? newest.map(SDM.cardHTML).join("") : "";
  }

  function renderList() {
    var list = filtered();
    var total = S.apps.length;
    if (!total) {
      els.status.textContent = "";
      els.list.innerHTML = '<div class="state"><h3>No apps yet</h3><p>Apps will show up here as soon as they are published. Check back soon.</p></div>';
      return;
    }
    if (!list.length) {
      els.status.textContent = "0 of " + total + " apps";
      els.list.innerHTML = '<div class="state"><h3>No apps match your search</h3><p>Try a different word, or clear the filters to see every app.</p><button type="button" class="btn btn-primary" id="clear-filters">Clear filters</button></div>';
      return;
    }
    els.status.textContent = "Showing " + list.length + " of " + total + (total === 1 ? " app" : " apps");
    els.list.innerHTML = list.map(SDM.cardHTML).join("");
  }

  function sync() {
    els.heroQ.value = S.q;
    els.filterQ.value = S.q;
    els.filterSort.value = S.sort;
    Array.prototype.forEach.call(els.cats.querySelectorAll(".cat"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.cat === S.cat));
    });
    if (els.filterCat.value !== S.cat) els.filterCat.value = S.cat;
  }

  function update() {
    writeUrl();
    sync();
    renderList();
  }

  function showLoading() {
    els.list.setAttribute("aria-busy", "true");
    els.status.textContent = "Loading apps…";
    els.list.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  }

  function showError(err) {
    els.list.removeAttribute("aria-busy");
    els.status.textContent = "";
    els.heroCount.textContent = "";
    var msg = err && err.status === 503
      ? "The app catalogue is not set up yet. Please check back soon."
      : "We could not load the apps. Check your connection and try again.";
    els.list.innerHTML = '<div class="state" role="alert"><h3>Apps did not load</h3><p>' + SDM.esc(msg) + '</p><button type="button" class="btn btn-primary" id="retry">Try again</button></div>';
  }

  function load() {
    showLoading();
    SDM.api("/api/apps").then(function (d) {
      S.apps = Array.isArray(d.apps) ? d.apps : [];
      els.list.removeAttribute("aria-busy");
      els.heroCount.textContent = S.apps.length ? S.apps.length + (S.apps.length === 1 ? " app is" : " apps are") + " available to download." : "";
      renderCategories();
      renderPhone();
      renderFeatured();
      if (S.cat && !S.apps.some(function (a) { return (a.category || "Other") === S.cat; })) S.cat = "";
      sync();
      renderList();
    }).catch(showError);
  }

  // Events
  els.heroForm.addEventListener("submit", function (e) {
    e.preventDefault();
    S.q = els.heroQ.value;
    update();
    $("explore").scrollIntoView();
  });
  var t;
  els.filterQ.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { S.q = els.filterQ.value; update(); }, 150);
  });
  els.filterCat.addEventListener("change", function () { S.cat = els.filterCat.value; update(); });
  els.filterSort.addEventListener("change", function () { S.sort = els.filterSort.value; update(); });
  els.cats.addEventListener("click", function (e) {
    var b = e.target.closest(".cat");
    if (!b) return;
    S.cat = S.cat === b.dataset.cat ? "" : b.dataset.cat;
    update();
    $("explore").scrollIntoView();
  });
  els.heroChips.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    S.cat = b.dataset.cat;
    S.q = "";
    update();
    $("explore").scrollIntoView();
  });
  els.list.addEventListener("click", function (e) {
    if (e.target.closest("#clear-filters")) { S.q = ""; S.cat = ""; update(); }
    if (e.target.closest("#retry")) load();
  });
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "/" && tag !== "input" && tag !== "textarea" && tag !== "select") {
      e.preventDefault();
      els.heroQ.focus();
      window.scrollTo({ top: 0 });
    }
  });

  readUrl();
  sync();
  load();
  if (location.hash === "#search") els.heroQ.focus();
})();
