/* workouts.js
 * Workouts list page logic:
 * - Render workouts from API (localStorage now, MongoDB later)
 * - Search/filter
 * - Navigate to view/edit/delete pages
 */

(function () {
  "use strict";

  // DOM references
  const listEl = document.getElementById("workout-list");
  const searchEl = document.getElementById("workout-search");
  const clearBtn = document.getElementById("workout-clear");

  // Defensive check in case this script is loaded on a different page
  if (!listEl || !searchEl || !clearBtn) return;

  // Render helpers
  function escapeHtml(str) {
    const s = String(str ?? "");
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatNumber(n) {
    const x = Number(n);
    if (Number.isNaN(x)) return "0";
    return x.toLocaleString();
  }

  function workoutSummary(w) {
    // Compute volume using API helper if available
    const vol = (window.API && typeof API.workoutVolume === "function")
      ? API.workoutVolume(w)
      : 0;

    const setsCount = Array.isArray(w.sets) ? w.sets.length : 0;

    return `${setsCount} sets · volume ${formatNumber(vol)}`;
  }

  function renderEmpty(message) {
    listEl.innerHTML = `<div class="list__empty">${escapeHtml(message)}</div>`;
  }

  function renderRow(workout) {
    const id = workout.id;
    const date = workout.date || "";
    const exercise = workout.exercise || "Untitled";
    const notes = workout.notes || "";

    // Routes here are placeholders; your Flask routes can map to these later.
    // If your team prefers query params, keep them consistent across pages.
    const editHref = `/workouts/edit?id=${encodeURIComponent(id)}`;
    const delHref = `/workouts/delete?id=${encodeURIComponent(id)}`;

    const row = document.createElement("div");
    row.className = "list__row list__row--actions";

    row.innerHTML = `
      <div class="list__left" role="button" tabindex="0" aria-label="Open workout">
        <div class="list__title">${escapeHtml(exercise)}</div>
        <div class="list__meta">
          ${escapeHtml(date)} · ${escapeHtml(workoutSummary(workout))}
          ${notes ? ` · ${escapeHtml(notes)}` : ""}
        </div>
      </div>

      <div class="row-actions">
        <a class="icon-btn" href="${editHref}" aria-label="Edit workout">Edit</a>
        <a class="icon-btn icon-btn--danger" href="${delHref}" aria-label="Delete workout">Del</a>
      </div>
    `;

    // Allow clicking the row to open the edit screen
    const left = row.querySelector(".list__left");
    left.addEventListener("click", () => {
        window.location.href = editHref;
    });

    left.addEventListener("keydown", (e) => {
        if (e.key === "Enter") window.location.href = editHref;
    });
    return row;
  }

  async function refresh() {
    const q = searchEl.value.trim();

    // Ensure API exists
    if (!window.API || typeof API.getWorkouts !== "function") {
      renderEmpty("API not found. Make sure api.js is loaded before workouts.js.");
      return;
    }

    try {
      const workouts = await API.getWorkouts(q);

      if (!workouts || workouts.length === 0) {
        renderEmpty(q ? "No matches. Try a different search." : "No workouts yet. Tap + Add to log your first workout.");
        return;
      }

      listEl.innerHTML = "";
      workouts.forEach((w) => listEl.appendChild(renderRow(w)));
    } catch (err) {
      renderEmpty("Failed to load workouts.");
      // Keep errors visible in DevTools for debugging
      console.error(err);
    }
  }

  // Search events
  let searchTimer = null;

  searchEl.addEventListener("input", () => {
    // Debounce to avoid re-rendering on every keystroke
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => refresh(), 180);
  });

  clearBtn.addEventListener("click", () => {
    searchEl.value = "";
    searchEl.focus();
    refresh();
  });

  // Initial render
  refresh();
})();