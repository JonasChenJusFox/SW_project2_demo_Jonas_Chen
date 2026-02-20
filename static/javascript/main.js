/* main.js
 * Global UI behavior:
 * - Toggle bottom nav between Login and Logout based on session
 */

(function () {
  "use strict";

  const authNav = document.getElementById("auth-nav");
  const authNavLabel = document.getElementById("auth-nav-label");
  const authNavIcon = document.getElementById("auth-nav-icon");

  if (!authNav || !authNavLabel || !authNavIcon) return;

  function setLoggedOutUI() {
    authNav.href = "/login";
    authNavLabel.textContent = "Login";
    authNavIcon.textContent = "👤";
    authNav.setAttribute("aria-label", "Login");
  }

  function setLoggedInUI() {
    authNav.href = "#";
    authNavLabel.textContent = "Logout";
    authNavIcon.textContent = "🚪";
    authNav.setAttribute("aria-label", "Logout");
  }

  function refresh() {
    if (!window.AUTH || typeof AUTH.currentUser !== "function") {
      setLoggedOutUI();
      return;
    }
    const user = AUTH.currentUser();
    if (!user) setLoggedOutUI();
    else setLoggedInUI();
  }

  authNav.addEventListener("click", (e) => {
    if (authNavLabel.textContent !== "Logout") return;
    e.preventDefault();
    if (window.AUTH && typeof AUTH.logoutUser === "function") {
      AUTH.logoutUser();
    }
    window.location.href = "/login";
  });

  refresh();
})();