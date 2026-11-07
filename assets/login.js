// Admin sign-in page.
(function () {
  "use strict";
  var form = document.getElementById("login-form");
  var msg = document.getElementById("msg");
  var btn = document.getElementById("login-btn");

  // Already signed in? Go straight to the dashboard.
  fetch("/api/me", { credentials: "same-origin" }).then(function (r) {
    if (r.ok) location.replace("/admin/");
  }).catch(function () {});

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value;
    if (!username || !password) {
      msg.textContent = "Enter your username and password.";
      return;
    }
    msg.textContent = "";
    btn.disabled = true;
    btn.textContent = "Signing in…";
    fetch("/api/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.error || "Sign in failed. Try again.");
        location.href = "/admin/";
      });
    }).catch(function (err) {
      msg.textContent = err.message;
      btn.disabled = false;
      btn.textContent = "Sign in";
    });
  });
})();
