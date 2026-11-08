// App details page: /app/?id=123
(function () {
  "use strict";
  var root = document.getElementById("detail");

  // Tap a screenshot to open it full screen. Swipe or use the arrows to move between them.
  function setupViewer(shots, appName) {
    var dlg = document.createElement("dialog");
    dlg.className = "viewer";
    dlg.setAttribute("aria-label", appName + " screenshots");
    dlg.innerHTML =
      '<div class="viewer-strip" id="viewer-strip">' +
      shots.map(function (u, i) {
        return '<div class="slide"><img src="' + SDM.esc(u) + '" alt="' + SDM.esc(appName) + " screenshot " + (i + 1) + '" decoding="async" referrerpolicy="no-referrer"></div>';
      }).join("") + "</div>" +
      '<button type="button" class="v-btn v-close" data-v="close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      (shots.length > 1
        ? '<button type="button" class="v-btn v-prev" data-v="prev" aria-label="Previous screenshot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>' +
          '<button type="button" class="v-btn v-next" data-v="next" aria-label="Next screenshot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>'
        : "") +
      '<p class="v-count" id="v-count" aria-live="polite"></p>';
    document.body.appendChild(dlg);
    var strip = dlg.querySelector("#viewer-strip");
    var count = dlg.querySelector("#v-count");

    function index() { return Math.round(strip.scrollLeft / strip.clientWidth); }
    function show() { count.textContent = (index() + 1) + " / " + shots.length; }
    function go(i) {
      i = Math.max(0, Math.min(shots.length - 1, i));
      strip.scrollTo({ left: i * strip.clientWidth, behavior: "smooth" });
    }
    strip.addEventListener("scroll", show);

    root.addEventListener("click", function (e) {
      var b = e.target.closest(".shot");
      if (!b) return;
      dlg.showModal();
      strip.scrollLeft = Number(b.dataset.i) * strip.clientWidth;
      show();
    });
    dlg.addEventListener("click", function (e) {
      var v = e.target.closest("[data-v]");
      if (v) {
        if (v.dataset.v === "close") dlg.close();
        else go(index() + (v.dataset.v === "next" ? 1 : -1));
      } else if (!e.target.closest("img") && !e.target.closest(".v-btn")) {
        dlg.close();
      }
    });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") go(index() + 1);
      if (e.key === "ArrowLeft") go(index() - 1);
    });
  }
  var id = new URLSearchParams(location.search).get("id") || "";

  function setMeta(sel, attr, value) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, value);
  }

  function notFound(title, text) {
    document.title = title + " · SdmApk";
    root.innerHTML =
      '<div class="state" role="alert"><h3>' + SDM.esc(title) + "</h3><p>" + SDM.esc(text) +
      '</p><a class="btn btn-primary" href="/#explore">Browse all apps</a></div>';
  }

  if (!/^[1-9]\d{0,12}$/.test(id)) {
    notFound("App not found", "That link does not point to an app. Browse the list to find what you need.");
    return;
  }

  SDM.api("/api/apps/" + id).then(function (d) {
    var a = d.app;
    var dl = SDM.safeUrl(a.download_url);
    var desc = a.description || "Download " + a.name + " from SdmApk.";

    document.title = a.name + " · SdmApk";
    setMeta('meta[name="description"]', "content", desc.slice(0, 155));
    setMeta('meta[property="og:title"]', "content", a.name + " · SdmApk");
    setMeta('meta[property="og:description"]', "content", desc.slice(0, 155));
    var icon = SDM.safeUrl(a.icon_url);
    if (icon) setMeta('meta[property="og:image"]', "content", icon);

    var shots = (a.screenshots || []).map(SDM.safeUrl).filter(Boolean);
    var rows = "";
    if (a.version) rows += "<dt>Version</dt><dd>" + SDM.esc(String(a.version).replace(/^v/i, "")) + "</dd>";
    rows += "<dt>Category</dt><dd>" + SDM.esc(a.category || "Other") + "</dd>";
    if (a.created_at) rows += "<dt>Added</dt><dd>" + SDM.esc(SDM.fmtDate(a.created_at)) + "</dd>";

    root.innerHTML =
      "<div>" +
      '<div class="detail-head">' + SDM.iconHTML(a) +
      "<div><h1>" + SDM.esc(a.name) + '</h1><div class="meta"><span class="chip">' + SDM.esc(a.category || "Other") + "</span>" +
      (a.version ? '<span class="chip chip-plain">v' + SDM.esc(String(a.version).replace(/^v/i, "")) + "</span>" : "") +
      "</div></div></div>" +
      '<section class="block"><h2>About this app</h2><p class="prose">' + (a.description ? SDM.esc(a.description) : "No description has been added yet.") + "</p></section>" +
      (shots.length
        ? '<section class="block"><h2>Screenshots</h2><div class="shots" tabindex="0" role="group" aria-label="Screenshots of ' + SDM.esc(a.name) + '">' +
          shots.map(function (s, i) {
            return '<button type="button" class="shot" data-i="' + i + '" aria-label="View screenshot ' + (i + 1) + ' of ' + shots.length + ' larger"><img src="' + SDM.esc(s) + '" alt="' + SDM.esc(a.name) + " screenshot " + (i + 1) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"></button>';
          }).join("") + "</div></section>"
        : "") +
      "</div>" +
      '<aside class="panel" aria-labelledby="dl-title"><h2 id="dl-title">Download</h2><dl>' + rows + "</dl>" +
      (dl
        ? '<a class="btn btn-primary btn-lg" href="' + SDM.esc(dl) + '" target="_blank" rel="noopener noreferrer nofollow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-5-5m5 5 5-5M5 20h14"/></svg>Download ' + SDM.esc(a.name) + "</a>"
        : '<p class="note">No download link is available for this app yet.</p>') +
      '<p class="note">Only install apps from sources you trust.</p></aside>';
    if (shots.length) setupViewer(shots, a.name);
  }).catch(function (err) {
    if (err.status === 404) notFound("App not found", "This app was removed or is not published. Browse the list to find something else.");
    else notFound("App did not load", "We could not load this app. Check your connection and refresh the page.");
  });
})();
