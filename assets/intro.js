// Short welcome screen: logo, name, then the app names, once per visit on the home page.
// Skipped for reduced motion, repeat visits in the same tab, and anything but the home page.
(function () {
  "use strict";
  if (location.pathname !== "/" && location.pathname !== "/index.html") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try { if (sessionStorage.getItem("sdmapk-intro")) return; sessionStorage.setItem("sdmapk-intro", "1"); } catch (e) { return; }

  var el = document.createElement("div");
  el.className = "intro";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="intro-in">' +
    '<svg class="intro-logo" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#131a30"/><path d="M43 24a10 10 0 1 0-11 10" fill="none" stroke="#ffc15e" stroke-width="8"/><path d="M21 40a10 10 0 1 0 11-10" fill="none" stroke="#ff4f78" stroke-width="8"/></svg>' +
    '<div class="intro-name">Sdm<span>Apk</span></div><ul class="intro-list" id="intro-list"></ul>' +
    '<div class="intro-bar"><i></i></div></div>';
  document.body.appendChild(el);

  var done = false;
  function close() {
    if (done) return;
    done = true;
    el.classList.add("out");
    setTimeout(function () { el.remove(); }, 700);
  }
  el.addEventListener("click", close);
  setTimeout(close, 3000);

  fetch("/api/apps", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (d) {
    var apps = (d.apps || []).slice(0, 4);
    var ul = document.getElementById("intro-list");
    if (!ul) return;
    apps.forEach(function (a, i) {
      var li = document.createElement("li");
      li.textContent = a.name;
      li.style.animationDelay = (0.9 + i * 0.3) + "s";
      ul.appendChild(li);
    });
  }).catch(function () {});
  setTimeout(close, 2600);
})();
