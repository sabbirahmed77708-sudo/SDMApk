// Decorative jellyfish drifting in the hero. Pure decoration: hidden from screen readers and ignores the pointer.
(function () {
  "use strict";
  var hero = document.querySelector(".hero");
  if (!hero) return;

  var tentacles = [
    "M34 92C24 118 44 138 30 176", "M48 94C40 122 58 142 46 188", "M62 94C56 120 70 146 60 192",
    "M76 94C84 120 66 142 78 184", "M90 92C100 116 82 140 92 172"
  ];
  var arms = ["M52 92C44 112 58 124 50 148", "M70 92C78 110 62 126 72 150"];

  function jelly(cls, gid) {
    var t = tentacles.map(function (d, i) {
      return '<path class="jt jt' + (i + 1) + '" d="' + d + '" stroke="url(#' + gid + 't)"/>';
    }).join("");
    var a = arms.map(function (d, i) {
      return '<path class="ja ja' + (i + 1) + '" d="' + d + '" stroke="url(#' + gid + 'a)"/>';
    }).join("");
    return '<svg class="jelly ' + cls + '" viewBox="0 0 120 200" aria-hidden="true" focusable="false">' +
      "<defs>" +
      '<linearGradient id="' + gid + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc15e" stop-opacity=".95"/><stop offset="1" stop-color="#ff4f78" stop-opacity=".65"/></linearGradient>' +
      '<linearGradient id="' + gid + 't" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b8a" stop-opacity=".9"/><stop offset="1" stop-color="#ff4f78" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + gid + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc15e" stop-opacity=".9"/><stop offset="1" stop-color="#ffc15e" stop-opacity="0"/></linearGradient>' +
      "</defs>" + t + a +
      '<g class="jbell"><path d="M8 88C8 36 32 8 60 8s52 28 52 80c-8 8-16 4-24 10-8-6-18-6-28 0-10-6-20-6-28 0-8-6-16-2-24-10z" fill="url(#' + gid + 'b)"/>' +
      '<ellipse cx="46" cy="34" rx="20" ry="9" fill="#fff" opacity=".28" transform="rotate(-18 46 34)"/>' +
      '<circle cx="44" cy="62" r="3" fill="#fff" opacity=".35"/><circle cx="64" cy="54" r="2.4" fill="#fff" opacity=".3"/><circle cx="82" cy="64" r="3" fill="#fff" opacity=".3"/></g></svg>';
  }

  var layer = document.createElement("div");
  layer.className = "jelly-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = jelly("j1", "ja1") + jelly("j2", "ja2") + jelly("j3", "ja3");
  hero.insertBefore(layer, hero.firstChild);
})();
