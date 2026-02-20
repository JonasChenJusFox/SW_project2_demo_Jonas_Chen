/* diet_delete.js
 * Delete meal screen:
 * - Read meal id from query string (?id=...)
 * - Read optional date param to navigate back
 * - Confirm deletion via API.deleteMeal(id)
 * - Redirect back to /diet (with date)
 */

(function () {
  "use strict";

  const infoEl = document.getElementById("delete-info");
  const btn = document.getElementById("confirm-delete");
  const msgEl = document.getElementById("delete-message");
  const cancelLink = document.getElementById("cancel-link");

  if (!infoEl || !btn || !msgEl || !cancelLink) return;

  if (!window.API || typeof API.deleteMeal !== "function") {
    msgEl.textContent = "API not found. Make sure api.js is loaded before diet_delete.js.";
    btn.disabled = true;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const mealId = params.get("id");
  const backDate = params.get("date");

  if (!mealId) {
    msgEl.textContent = "Missing meal id in URL. Go back to Diet and try again.";
    btn.disabled = true;
    return;
  }

  // Keep cancel/back navigation consistent
  if (backDate) {
    cancelLink.href = `/diet?date=${encodeURIComponent(backDate)}`;
  }

  function escapeHtml(str) {
    const s = String(str ?? "");
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadMeal() {
    msgEl.textContent = "Loading...";

    // api.js does not have getMealById in the current version, so we load all meals for the date if provided.
    // This keeps the front-end working without adding new API surface area.
    try {
      let meal = null;

      if (backDate && typeof API.getMeals === "function") {
        const meals = await API.getMeals(backDate);
        meal = meals.find((m) => m.id === mealId) || null;
      }

      if (!meal) {
        infoEl.innerHTML = `
          <div class="danger-title">You are about to delete this meal.</div>
          <div class="danger-hint">Meal details unavailable (id: ${escapeHtml(mealId)}).</div>
        `;
        msgEl.textContent = "";
        return;
      }

      infoEl.innerHTML = `
        <div class="danger-title">You are about to delete:</div>
        <div class="danger-item">
          <div class="danger-main">${escapeHtml(meal.name || "Untitled meal")}</div>
          <div class="danger-sub">
            ${escapeHtml(meal.date || "")} · ${Number(meal.calories) || 0} cal
          </div>
          <div class="danger-sub">
            P ${Number(meal.protein) || 0} / C ${Number(meal.carbs) || 0} / F ${Number(meal.fats) || 0}
          </div>
          ${meal.notes ? `<div class="danger-notes">${escapeHtml(meal.notes)}</div>` : ""}
        </div>
        <div class="danger-hint">If you are not sure, click Cancel.</div>
      `;

      msgEl.textContent = "";
    } catch (err) {
      console.error(err);
      msgEl.textContent = "Failed to load meal.";
    }
  }

  btn.addEventListener("click", async () => {
    const ok = window.confirm("Are you sure you want to delete this meal?");
    if (!ok) return;

    btn.disabled = true;
    msgEl.textContent = "Deleting...";

    try {
      await API.deleteMeal(mealId);
      if (backDate) {
        window.location.href = `/diet?date=${encodeURIComponent(backDate)}`;
      } else {
        window.location.href = "/diet";
      }
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      msgEl.textContent = "Failed to delete meal. Please try again.";
    }
  });

  loadMeal();
})();