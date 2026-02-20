/* workout_delete.js
 * Delete workout screen:
 * - Read workout id from query string (?id=...)
 * - Show summary of the workout
 * - Confirm deletion via API.deleteWorkout(id)
 * - Redirect back to /workouts
 */

(function () {
  "use strict";

  const infoEl = document.getElementById("delete-info");
  const btn = document.getElementById("confirm-delete");
  const msgEl = document.getElementById("delete-message");

  if (!infoEl || !btn || !msgEl) return;

  // Ensure API exists
  if (!window.API || typeof API.getWorkoutById !== "function" || typeof API.deleteWorkout !== "function") {
    msgEl.textContent = "API not found. Make sure api.js is loaded before workout_delete.js.";
    btn.disabled = true;
    return;
  }

  // Read id from query string
  const params = new URLSearchParams(window.location.search);
  const workoutId = params.get("id");

  if (!workoutId) {
    msgEl.textContent = "Missing workout id in URL. Go back to Workouts and try again.";
    btn.disabled = true;
    return;
  }

  // Escape HTML for safe rendering
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

  function renderWorkoutSummary(workout) {
    const setsCount = Array.isArray(workout.sets) ? workout.sets.length : 0;
    const vol = (window.API && typeof API.workoutVolume === "function") ? API.workoutVolume(workout) : 0;

    infoEl.innerHTML = `
      <div class="danger-title">You are about to delete:</div>
      <div class="danger-item">
        <div class="danger-main">${escapeHtml(workout.exercise || "Untitled")}</div>
        <div class="danger-sub">
          ${escapeHtml(workout.date || "")} · ${setsCount} sets · volume ${escapeHtml(formatNumber(vol))}
        </div>
        ${workout.notes ? `<div class="danger-notes">${escapeHtml(workout.notes)}</div>` : ""}
      </div>
      <div class="danger-hint">If you are not sure, click Cancel.</div>
    `;
  }

  async function loadWorkout() {
    msgEl.textContent = "Loading...";
    try {
      const workout = await API.getWorkoutById(workoutId);
      if (!workout) {
        infoEl.innerHTML = `<div class="list__empty">Workout not found. It may have been deleted.</div>`;
        msgEl.textContent = "";
        btn.disabled = true;
        return;
      }
      renderWorkoutSummary(workout);
      msgEl.textContent = "";
    } catch (err) {
      console.error(err);
      infoEl.innerHTML = `<div class="list__empty">Failed to load workout.</div>`;
      msgEl.textContent = "Failed to load workout.";
      btn.disabled = true;
    }
  }

  btn.addEventListener("click", async () => {
    const ok = window.confirm("Are you sure you want to delete this workout?");
    if (!ok) return;

    btn.disabled = true;
    msgEl.textContent = "Deleting...";

    try {
      await API.deleteWorkout(workoutId);
      window.location.href = "/workouts";
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      msgEl.textContent = "Failed to delete workout. Please try again.";
    }
  });

  loadWorkout();
})();