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
    var DL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-5-5m5 5 5-5M5 20h14"/></svg>';
    var stats = "";
    if (a.version) stats += '<div><b>' + SDM.esc(String(a.version).replace(/^v/i, "")) + "</b><span>Version</span></div>";
    stats += '<div><b>' + SDM.esc(a.category || "Other") + "</b><span>Category</span></div>";
    if (a.downloads > 0) stats += '<div><b>' + SDM.esc(SDM.fmtCount(a.downloads)) + "</b><span>Downloads</span></div>";
    if (a.created_at) stats += '<div><b>' + SDM.esc(SDM.fmtDate(a.created_at)) + "</b><span>Added</span></div>";

    root.innerHTML =
      '<div class="pd-top"><div class="pd-head">' + SDM.iconHTML(a) +
      "<div><h1>" + SDM.esc(a.name) + '</h1><p class="pd-sub">' + SDM.esc(a.category || "Other") + "</p></div></div>" +
      '<div class="pd-actions">' +
      (dl
        ? '<a class="btn btn-primary btn-lg pd-dl" data-dl="' + a.id + '" href="' + SDM.esc(dl) + '" target="_blank" rel="noopener noreferrer nofollow">' + DL + "<span>Download</span></a>"
        : '<p class="note">No download link is available for this app yet.</p>') +
      '<button type="button" class="btn btn-ghost btn-lg pd-share" id="share"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L8 7m4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg><span>Share</span></button>' +
      "</div></div>" +
      '<div class="pd-stats">' + stats + "</div>" +
      (shots.length
        ? '<section class="block"><h2>Screenshots</h2><div class="shots" tabindex="0" role="group" aria-label="Screenshots of ' + SDM.esc(a.name) + '">' +
          shots.map(function (u, i) {
            return '<button type="button" class="shot" data-i="' + i + '" aria-label="View screenshot ' + (i + 1) + ' of ' + shots.length + ' larger"><img src="' + SDM.esc(u) + '" alt="' + SDM.esc(a.name) + " screenshot " + (i + 1) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"></button>';
          }).join("") + "</div></section>"
        : "") +
      '<section class="block"><h2>About this app</h2><p class="prose">' + (a.description ? SDM.esc(a.description) : "No description has been added yet.") + "</p></section>" +
      '<details class="install"><summary>How to install this app<span lang="bn"> · ইনস্টল করার নিয়ম</span></summary>' +
      '<div class="install-cols">' +
      '<ol><li>Tap <b>Download</b> and wait until the file finishes downloading.</li>' +
      '<li>Open the downloaded <b>.apk</b> file from the notification or your Downloads folder.</li>' +
      '<li>If Android says installing from this source is blocked, tap <b>Settings</b>, turn on <b>Allow from this source</b>, then go back.</li>' +
      '<li>Tap <b>Install</b>, then <b>Open</b>.</li></ol>' +
      '<ol lang="bn"><li><b>Download</b> চাপুন এবং ফাইল নামা শেষ হওয়া পর্যন্ত অপেক্ষা করুন।</li>' +
      '<li>নোটিফিকেশন বা Downloads ফোল্ডার থেকে নামানো <b>.apk</b> ফাইলটা খুলুন।</li>' +
      '<li>ফোন ইনস্টল আটকে দিলে <b>Settings</b> চাপুন, <b>Allow from this source</b> চালু করে ফিরে আসুন।</li>' +
      '<li><b>Install</b> চাপুন, তারপর <b>Open</b>।</li></ol></div>' +
      '<p class="note">If Play Protect shows a warning for an app you trust, tap More details, then Install anyway.</p></details>' +
      '<p class="note">Only install apps from sources you trust.</p>';
    var shareBtn = root.querySelector("#share");
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        var data = { title: a.name + " · SdmApk", text: "Download " + a.name + " on SdmApk", url: location.href };
        if (navigator.share) { navigator.share(data).catch(function () {}); return; }
        var label = shareBtn.querySelector("span");
        function done() {
          label.textContent = "Link copied";
          setTimeout(function () { label.textContent = "Share"; }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(data.url).then(done, function () {});
      });
    }
    if (shots.length) setupViewer(shots, a.name);
  }).catch(function (err) {
    if (err.status === 404) notFound("App not found", "This app was removed or is not published. Browse the list to find something else.");
    else notFound("App did not load", "We could not load this app. Check your connection and refresh the page.");
  });
})();
