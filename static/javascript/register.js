/* register.js
 * Register screen:
 * - Validate form inputs
 * - Use AUTH.registerUser() (localStorage mock)
 * - Redirect to home on success
 */

(function () {
  "use strict";

  const form = document.getElementById("register-form");
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const pwEl = document.getElementById("password");
  const confirmEl = document.getElementById("confirm");
  const msgEl = document.getElementById("register-message");

  if (!form || !nameEl || !emailEl || !pwEl || !confirmEl || !msgEl) return;

  if (!window.AUTH || typeof AUTH.registerUser !== "function" || typeof AUTH.isValidEmail !== "function") {
    msgEl.textContent = "Auth module not found. Make sure auth.js is loaded before register.js.";
    return;
  }

  // If already logged in, go home
  if (AUTH.currentUser()) {
    window.location.href = "/";
    return;
  }

  function setMessage(text) {
    msgEl.textContent = text || "";
  }

  function validate() {
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = pwEl.value;
    const confirm = confirmEl.value;

    if (!name) return { ok: false, error: "Please enter your name." };
    if (!AUTH.isValidEmail(email)) return { ok: false, error: "Please enter a valid email." };
    if (!password || password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (password !== confirm) return { ok: false, error: "Passwords do not match." };

    return { ok: true, data: { name, email, password } };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setMessage("");

    const v = validate();
    if (!v.ok) {
      setMessage(v.error);
      return;
    }

    const res = AUTH.registerUser(v.data);
    if (!res.ok) {
      setMessage(res.error || "Registration failed.");
      return;
    }

    window.location.href = "/";
  });

  // Clear error message while user edits
  [nameEl, emailEl, pwEl, confirmEl].forEach((el) => {
    el.addEventListener("input", () => setMessage(""));
  });
})();