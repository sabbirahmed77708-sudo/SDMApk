// Small, calm motion: cards fade up as they scroll into view, the header gains a shadow.
// Does nothing when the visitor prefers reduced motion.
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.remove("pre");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  function watch(card) {
    if (card.dataset.mo) return;
    card.dataset.mo = "1";
    if (card.getBoundingClientRect().top < window.innerHeight) return; // already visible
    card.classList.add("pre");
    io.observe(card);
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.classList.contains("card")) watch(root);
    root.querySelectorAll && root.querySelectorAll(".card").forEach(watch);
  }

  scan(document.body);
  new MutationObserver(function (list) {
    list.forEach(function (r) { r.addedNodes.forEach(scan); });
  }).observe(document.body, { childList: true, subtree: true });
})();
