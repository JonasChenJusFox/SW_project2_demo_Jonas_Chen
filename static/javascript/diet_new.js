/* diet_new.js
 * New meal screen:
 * - Read optional date from URL (?date=YYYY-MM-DD)
 * - Save meal via API.addMeal()
 * - Redirect back to /diet?date=...
 */

(function () {
  "use strict";

  const form = document.getElementById("meal-form");
  const dateEl = document.getElementById("date");
  const nameEl = document.getElementById("name");
  const caloriesEl = document.getElementById("calories");
  const proteinEl = document.getElementById("protein");
  const carbsEl = document.getElementById("carbs");
  const fatsEl = document.getElementById("fats");
  const notesEl = document.getElementById("notes");
  const msgEl = document.getElementById("form-message");
  const cancelLink = document.getElementById("cancel-link");

  if (!form || !dateEl || !nameEl || !caloriesEl || !proteinEl || !carbsEl || !fatsEl || !notesEl || !msgEl || !cancelLink) {
    return;
  }

  if (!window.API || typeof API.addMeal !== "function") {
    msgEl.textContent = "API not found. Make sure api.js is loaded before diet_new.js.";
    return;
  }

  function isValidDateString(v) {
    return /^\d{4}-\d{2}-\d{2}$/.test(v);
  }

  function getDateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("date");
    return isValidDateString(d) ? d : "";
  }

  const urlDate = getDateFromUrl();
  const today = new Date().toISOString().slice(0, 10);
  dateEl.value = urlDate || today;

  // Keep cancel navigation consistent with current date
  cancelLink.href = `/diet?date=${encodeURIComponent(dateEl.value)}`;

  dateEl.addEventListener("change", () => {
    cancelLink.href = `/diet?date=${encodeURIComponent(dateEl.value)}`;
  });

  function numOrZero(el) {
    const v = el.value.trim();
    if (v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.textContent = "";

    const date = dateEl.value.trim();
    const name = nameEl.value.trim();
    const calories = numOrZero(caloriesEl);

    if (!date) {
      msgEl.textContent = "Please choose a date.";
      return;
    }
    if (!name) {
      msgEl.textContent = "Please enter a meal name.";
      return;
    }
    if (calories <= 0) {
      msgEl.textContent = "Please enter calories (greater than 0).";
      return;
    }

    const payload = {
      date,
      name,
      calories,
      protein: numOrZero(proteinEl),
      carbs: numOrZero(carbsEl),
      fats: numOrZero(fatsEl),
      notes: notesEl.value.trim(),
    };

    try {
      await API.addMeal(payload);
      window.location.href = `/diet?date=${encodeURIComponent(date)}`;
    } catch (err) {
      console.error(err);
      msgEl.textContent = "Failed to save meal. Please try again.";
    }
  });
})();