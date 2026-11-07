// Admin dashboard: stats, app management and categories.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = SDM.esc;
  var PRESETS = ["Tools", "Productivity", "Education", "Entertainment", "Communication", "Photography", "Personalization", "Games"];
  var apps = [];
  var renaming = "";

  function api(url, opts) {
    opts = opts || {};
    var init = { method: opts.method || "GET", credentials: "same-origin", headers: { accept: "application/json" } };
    if (opts.body !== undefined) {
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401) {
          location.href = "/admin/login.html";
          throw new Error("Please sign in again");
        }
        if (!r.ok) {
          var e = new Error(d.error || "Something went wrong. Try again.");
          e.status = r.status;
          throw e;
        }
        return d;
      });
    });
  }

  function say(text, kind) {
    var m = $("msg");
    m.textContent = text;
    m.className = "msg" + (kind ? " " + kind : "");
  }

  function byNewest(a, b) {
    return String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id;
  }

  function categories() {
    var map = {};
    apps.forEach(function (a) {
      var c = a.category || "Other";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.keys(map).sort(function (a, b) { return map[b] - map[a] || a.localeCompare(b); })
      .map(function (n) { return { name: n, count: map[n] }; });
  }

  function host(u) {
    try { return new URL(u).hostname; } catch (e) { return ""; }
  }

  function rowHTML(a, withActions) {
    var hidden = a.published === false;
    return '<div class="list-row">' + SDM.iconHTML(a) +
      '<div class="info"><b>' + esc(a.name) + (hidden ? ' <span class="badge">Hidden</span>' : "") + "</b>" +
      "<small>" + esc(a.category || "Other") + (a.version ? " · v" + esc(String(a.version).replace(/^v/i, "")) : "") +
      (a.created_at ? " · added " + esc(SDM.fmtDate(a.created_at)) : "") + "</small>" +
      (withActions ? "<small>" + esc(host(a.download_url)) + "</small>" : "") + "</div>" +
      '<div class="row-actions">' +
      '<button class="btn btn-ghost btn-sm" type="button" data-act="edit" data-id="' + a.id + '">Edit</button>' +
      (withActions
        ? '<button class="btn btn-ghost btn-sm" type="button" data-act="toggle" data-id="' + a.id + '">' + (hidden ? "Publish" : "Hide") + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="delete" data-id="' + a.id + '">Delete</button>'
        : "") +
      "</div></div>";
  }

  function render() {
    var published = apps.filter(function (a) { return a.published !== false; }).length;
    var cats = categories();
    $("s-total").textContent = apps.length;
    $("s-pub").textContent = published;
    $("s-hidden").textContent = apps.length - published;
    $("s-cats").textContent = cats.length;

    var recent = apps.slice().sort(byNewest).slice(0, 5);
    $("recent").innerHTML = recent.length ? recent.map(function (a) { return rowHTML(a, false); }).join("") : '<p class="hint">No apps yet. Add your first app below.</p>';

    renderApps();

    $("cats").innerHTML = cats.length ? cats.map(function (c) {
      var n = esc(c.name);
      var count = c.count + (c.count === 1 ? " app" : " apps");
      if (renaming === c.name) {
        return '<div class="cat-row"><div class="info"><label class="sr-only" for="rename-input">New name for ' + n + '</label>' +
          '<input id="rename-input" value="' + n + '" maxlength="40"></div>' +
          '<div class="row-actions"><button class="btn btn-primary btn-sm" type="button" data-cact="save" data-name="' + n + '">Save</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-cact="cancel">Cancel</button></div></div>';
      }
      return '<div class="cat-row"><div class="info"><b>' + n + "</b><br><small class=\"hint\">" + count + "</small></div>" +
        '<div class="row-actions"><button class="btn btn-ghost btn-sm" type="button" data-cact="rename" data-name="' + n + '">Rename</button>' +
        (c.name === "Other" ? "" : '<button class="btn btn-danger btn-sm" type="button" data-cact="remove" data-name="' + n + '">Remove</button>') +
        "</div></div>";
    }).join("") : '<p class="hint">Categories will appear here after you add apps.</p>';

    var names = PRESETS.slice();
    cats.forEach(function (c) { if (names.indexOf(c.name) < 0) names.push(c.name); });
    $("cat-list").innerHTML = names.map(function (n) { return '<option value="' + esc(n) + '"></option>'; }).join("");

    var input = $("rename-input");
    if (input) { input.focus(); input.select(); }
  }

  function renderApps() {
    var q = $("a-search").value.trim().toLowerCase();
    var list = apps.slice().sort(byNewest).filter(function (a) {
      return !q || (a.name + " " + (a.category || "") + " " + (a.description || "")).toLowerCase().indexOf(q) >= 0;
    });
    if (!apps.length) $("apps").innerHTML = '<p class="hint">No apps yet. Add your first app above.</p>';
    else if (!list.length) $("apps").innerHTML = '<p class="hint">No apps match your search.</p>';
    else $("apps").innerHTML = list.map(function (a) { return rowHTML(a, true); }).join("");
  }

  function load() {
    return api("/api/apps?all=1").then(function (d) {
      apps = Array.isArray(d.apps) ? d.apps : [];
      render();
    }).catch(function (err) {
      $("apps").innerHTML = '<p class="msg err" role="alert">' + esc(err.message) + "</p>";
      $("recent").innerHTML = "";
    });
  }

  function find(id) {
    return apps.filter(function (a) { return String(a.id) === String(id); })[0];
  }

  function resetForm() {
    $("app-form").reset();
    $("app-id").value = "";
    $("f-published").checked = true;
    $("form-title").textContent = "Add an app";
    $("save").textContent = "Add app";
    $("cancel").hidden = true;
  }

  function formData() {
    return {
      name: $("f-name").value.trim(),
      category: $("f-category").value.trim(),
      version: $("f-version").value.trim(),
      icon_url: $("f-icon").value.trim(),
      download_url: $("f-download").value.trim(),
      description: $("f-desc").value.trim(),
      screenshots: $("f-shots").value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean),
      published: $("f-published").checked
    };
  }

  function bodyFor(a, published) {
    return {
      name: a.name, category: a.category, version: a.version, icon_url: a.icon_url,
      download_url: a.download_url, description: a.description,
      screenshots: a.screenshots || [], published: published
    };
  }

  $("app-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var d = formData();
    if (!d.name) { say("Enter the app name.", "err"); $("f-name").focus(); return; }
    if (!d.download_url) { say("Enter the download URL.", "err"); $("f-download").focus(); return; }
    var id = $("app-id").value;
    var editing = !!id;
    $("save").disabled = true;
    say("Saving…");
    api(editing ? "/api/apps/" + encodeURIComponent(id) : "/api/apps", { method: editing ? "PUT" : "POST", body: d })
      .then(function () {
        resetForm();
        say(editing ? "Changes saved." : "App added.", "ok");
        return load();
      })
      .catch(function (err) { say(err.message, "err"); })
      .then(function () { $("save").disabled = false; });
  });

  $("cancel").addEventListener("click", function () { resetForm(); say(""); });
  $("a-search").addEventListener("input", renderApps);

  function onAppAction(e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var a = find(b.dataset.id);
    if (!a) return;
    if (b.dataset.act === "edit") {
      $("app-id").value = a.id;
      $("f-name").value = a.name || "";
      $("f-category").value = a.category || "";
      $("f-version").value = a.version || "";
      $("f-icon").value = a.icon_url || "";
      $("f-download").value = a.download_url || "";
      $("f-desc").value = a.description || "";
      $("f-shots").value = (a.screenshots || []).join("\n");
      $("f-published").checked = a.published !== false;
      $("form-title").textContent = "Edit app";
      $("save").textContent = "Save changes";
      $("cancel").hidden = false;
      say("");
      $("form-panel").scrollIntoView();
      $("f-name").focus();
    } else if (b.dataset.act === "toggle") {
      var next = a.published === false;
      api("/api/apps/" + a.id, { method: "PUT", body: bodyFor(a, next) })
        .then(function () { say(next ? "App published." : "App hidden from visitors.", "ok"); return load(); })
        .catch(function (err) { say(err.message, "err"); });
    } else if (b.dataset.act === "delete") {
      if (!window.confirm('Delete "' + a.name + '"? This cannot be undone.')) return;
      api("/api/apps/" + a.id, { method: "DELETE" })
        .then(function () { if ($("app-id").value === String(a.id)) resetForm(); say("App deleted.", "ok"); return load(); })
        .catch(function (err) { say(err.message, "err"); });
    }
  }
  $("apps").addEventListener("click", onAppAction);
  $("recent").addEventListener("click", onAppAction);

  $("cats").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cact]");
    if (!b) return;
    var name = b.dataset.name;
    var act = b.dataset.cact;
    if (act === "rename") { renaming = name; render(); }
    else if (act === "cancel") { renaming = ""; render(); }
    else if (act === "save") {
      var to = $("rename-input").value.trim();
      if (!to || to === name) { renaming = ""; render(); return; }
      api("/api/categories", { method: "PUT", body: { from: name, to: to } })
        .then(function () { renaming = ""; say('Category renamed to "' + to + '".', "ok"); return load(); })
        .catch(function (err) { say(err.message, "err"); });
    } else if (act === "remove") {
      if (!window.confirm('Remove "' + name + '"? Its apps will move to Other.')) return;
      api("/api/categories", { method: "DELETE", body: { name: name } })
        .then(function () { say('Category "' + name + '" removed.', "ok"); return load(); })
        .catch(function (err) { say(err.message, "err"); });
    }
  });
  $("cats").addEventListener("keydown", function (e) {
    if (e.target.id === "rename-input") {
      if (e.key === "Enter") { e.preventDefault(); var s = $("cats").querySelector('[data-cact="save"]'); if (s) s.click(); }
      if (e.key === "Escape") { renaming = ""; render(); }
    }
  });

  $("logout").addEventListener("click", function () {
    api("/api/logout", { method: "POST" }).catch(function () {}).then(function () { location.href = "/admin/login.html"; });
  });

  api("/api/me").then(load).catch(function () {});
})();
