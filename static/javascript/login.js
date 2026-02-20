/* login.js
 * Login screen:
 * - Validate input
 * - Use AUTH.loginUser() (localStorage mock)
 * - Redirect to home on success
 */

(function () {
  "use strict";

  const form = document.getElementById("login-form");
  const emailEl = document.getElementById("email");
  const pwEl = document.getElementById("password");
  const msgEl = document.getElementById("login-message");

  if (!form || !emailEl || !pwEl || !msgEl) return;

  if (!window.AUTH || typeof AUTH.loginUser !== "function") {
    msgEl.textContent = "Auth module not found. Make sure auth.js is loaded before login.js.";
    return;
  }

  // If already logged in, go home
  if (AUTH.currentUser()) {
    window.location.href = "/";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msgEl.textContent = "";

    const email = emailEl.value.trim();
    const password = pwEl.value;

    if (!AUTH.isValidEmail(email)) {
      msgEl.textContent = "Please enter a valid email.";
      return;
    }
    if (!password || password.length < 6) {
      msgEl.textContent = "Password must be at least 6 characters.";
      return;
    }

    const res = AUTH.loginUser({ email, password });
    if (!res.ok) {
      msgEl.textContent = res.error || "Login failed.";
      return;
    }

    window.location.href = "/";
  });
})();