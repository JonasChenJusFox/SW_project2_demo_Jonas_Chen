/* diet.js
 * Diet list page logic:
 * - Read optional date from URL (?date=YYYY-MM-DD)
 * - Pick a date to view meals
 * - Search/filter meals in the selected day
 * - Show daily totals (calories/macros)
 * - Keep URL date in sync for shareable navigation
 */

(function () {
  "use strict";

  const dateEl = document.getElementById("diet-date");
  const listEl = document.getElementById("meal-list");
  const searchEl = document.getElementById("meal-search");
  const clearBtn = document.getElementById("meal-clear");

  const sumCal = document.getElementById("sum-cal");
  const sumPro = document.getElementById("sum-pro");
  const sumCarb = document.getElementById("sum-carb");
  const sumFat = document.getElementById("sum-fat");
  const addBtn = document.getElementById("diet-add");
  
  if (addBtn) addBtn.href = `/diet/new?date=${encodeURIComponent(dateEl.value)}`;
dateEl.addEventListener("change", () => {
  if (addBtn) addBtn.href = `/diet/new?date=${encodeURIComponent(dateEl.value)}`;
});
 
  if (!dateEl || !listEl || !searchEl || !clearBtn || !sumCal || !sumPro || !sumCarb || !sumFat) return;

  if (!window.API || typeof API.getMeals !== "function" || typeof API.dailyTotals !== "function") {
    listEl.innerHTML = `<div class="list__empty">API not found. Make sure api.js is loaded before diet.js.</div>`;
    return;
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

  function norm(s) {
    return String(s || "").trim().toLowerCase();
  }

  function renderEmpty(message) {
    listEl.innerHTML = `<div class="list__empty">${escapeHtml(message)}</div>`;
  }

  function updateTotals(meals) {
    const t = API.dailyTotals(meals);
    sumCal.textContent = String(t.calories);
    sumPro.textContent = String(t.protein);
    sumCarb.textContent = String(t.carbs);
    sumFat.textContent = String(t.fats);
  }

  function isValidDateString(v) {
    // Basic YYYY-MM-DD validation for input[type="date"]
    return /^\d{4}-\d{2}-\d{2}$/.test(v);
  }

  function getDateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("date");
    return isValidDateString(d) ? d : "";
  }

  function setUrlDate(date) {
    const url = new URL(window.location.href);
    if (date && isValidDateString(date)) {
      url.searchParams.set("date", date);
    } else {
      url.searchParams.delete("date");
    }
    // Keep the user on the same page without reloading
    window.history.replaceState({}, "", url.toString());
  }

  // Initialize date input:
  // Prefer URL date; otherwise default to today.
  const urlDate = getDateFromUrl();
  dateEl.value = urlDate || new Date().toISOString().slice(0, 10);
  setUrlDate(dateEl.value);

  function renderRow(meal) {
    const id = meal.id;
    const name = meal.name || "Untitled meal";
    const calories = Number(meal.calories) || 0;
    const p = Number(meal.protein) || 0;
    const c = Number(meal.carbs) || 0;
    const f = Number(meal.fats) || 0;
    const notes = meal.notes || "";

    const delHref = `/diet/delete?id=${encodeURIComponent(id)}&date=${encodeURIComponent(dateEl.value)}`;

    const row = document.createElement("div");
    row.className = "list__row list__row--actions";

    row.innerHTML = `
      <div class="list__left">
        <div class="list__title">${escapeHtml(name)}</div>
        <div class="list__meta">
          ${calories} cal · P ${p} / C ${c} / F ${f}
          ${notes ? ` · ${escapeHtml(notes)}` : ""}
        </div>
      </div>

      <div class="row-actions">
        <a class="icon-btn icon-btn--danger" href="${delHref}" aria-label="Delete meal">Del</a>
      </div>
    `;

    return row;
  }

  async function refresh() {
    const date = dateEl.value;
    const q = norm(searchEl.value);

    try {
      const meals = await API.getMeals(date);
      const filtered = q
        ? meals.filter((m) => norm(m.name).includes(q) || norm(m.notes).includes(q))
        : meals;

      updateTotals(filtered);

      if (!filtered || filtered.length === 0) {
        renderEmpty(q ? "No matches for this date." : "No meals logged for this date.");
        return;
      }

      listEl.innerHTML = "";
      filtered.forEach((m) => listEl.appendChild(renderRow(m)));
    } catch (err) {
      console.error(err);
      renderEmpty("Failed to load meals.");
    }
  }

  let timer = null;
  searchEl.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => refresh(), 180);
  });

  clearBtn.addEventListener("click", () => {
    searchEl.value = "";
    searchEl.focus();
    refresh();
  });

  dateEl.addEventListener("change", () => {
    setUrlDate(dateEl.value);
    refresh();
  });

  refresh();
})();