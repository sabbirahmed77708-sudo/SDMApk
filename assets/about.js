// About page: show the contact details saved in the admin panel.
(function () {
  "use strict";
  var box = document.getElementById("contact-body");
  if (!box) return;
  SDM.api("/api/settings").then(function (d) {
    var c = d.contact || {};
    var items = [];
    if (c.contact_email) items.push("<li>Email: <a href=\"mailto:" + SDM.esc(c.contact_email) + "\">" + SDM.esc(c.contact_email) + "</a></li>");
    var tg = SDM.safeUrl(c.contact_telegram);
    if (tg) items.push("<li>Telegram or social: <a href=\"" + SDM.esc(tg) + "\" target=\"_blank\" rel=\"noopener noreferrer nofollow\">" + SDM.esc(tg.replace(/^https:\/\//, "")) + "</a></li>");
    var site = SDM.safeUrl(c.contact_website);
    if (site) items.push("<li>Link: <a href=\"" + SDM.esc(site) + "\" target=\"_blank\" rel=\"noopener noreferrer nofollow\">" + SDM.esc(site.replace(/^https:\/\//, "")) + "</a></li>");
    if (!items.length && !c.contact_note) return;
    box.innerHTML = (items.length ? "<ul class=\"contact-list\">" + items.join("") + "</ul>" : "") +
      (c.contact_note ? "<p>" + SDM.esc(c.contact_note) + "</p>" : "");
  }).catch(function () {});
})();
