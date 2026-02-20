/* auth.js
 * Client-side authentication (mock):
 * - Stores users and sessions in localStorage
 * - Provides helpers for login/register/logout
 * - Later you can switch to Flask-Login endpoints without changing UI much
 */

(function () {
  "use strict";

  const KEY_USERS = "liftlog_users";
  const KEY_SESSION = "liftlog_session";

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(sessionObj) {
    localStorage.setItem(KEY_SESSION, JSON.stringify(sessionObj));
  }

  function clearSession() {
    localStorage.removeItem(KEY_SESSION);
  }

  function norm(s) {
    return String(s || "").trim().toLowerCase();
  }

  // Very basic email check (good enough for class demo)
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  // Not cryptographically secure — only for demo/local mock
  function hashPassword(pw) {
    const s = String(pw || "");
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return String(h);
  }

  function getUsers() {
    return load(KEY_USERS);
  }

  function registerUser({ email, password, name }) {
    const users = getUsers();
    const e = norm(email);

    if (!isValidEmail(e)) {
      return { ok: false, error: "Please enter a valid email." };
    }
    if (String(password || "").length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    if (users.some((u) => norm(u.email) === e)) {
      return { ok: false, error: "This email is already registered." };
    }

    const user = {
      id: "u_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      email: e,
      name: String(name || "").trim() || "User",
      pwHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    save(KEY_USERS, users);

    // Auto-login after registration
    setSession({ userId: user.id, email: user.email, name: user.name, createdAt: new Date().toISOString() });

    return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
  }

  function loginUser({ email, password }) {
    const users = getUsers();
    const e = norm(email);

    const user = users.find((u) => norm(u.email) === e);
    if (!user) return { ok: false, error: "No account found for this email." };

    if (user.pwHash !== hashPassword(password)) {
      return { ok: false, error: "Incorrect password." };
    }

    setSession({ userId: user.id, email: user.email, name: user.name, createdAt: new Date().toISOString() });
    return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
  }

  function logoutUser() {
    clearSession();
    return { ok: true };
  }

  function currentUser() {
    const session = getSession();
    if (!session) return null;
    return { userId: session.userId, email: session.email, name: session.name };
  }

  window.AUTH = {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    isValidEmail,
  };
})();