/* workout_new.js
 * New workout screen:
 * - Collect workout meta + sets
 * - Save via API.addWorkout()
 * - Redirect back to /workouts
 */

(function () {
  "use strict";

  const form = document.getElementById("workout-form");
  const dateEl = document.getElementById("date");
  const exerciseEl = document.getElementById("exercise");
  const notesEl = document.getElementById("notes");
  const addSetBtn = document.getElementById("add-set");
  const setsContainer = document.getElementById("sets-container");
  const msgEl = document.getElementById("form-message");

  if (!form || !dateEl || !exerciseEl || !addSetBtn || !setsContainer || !msgEl) return;

  // Ensure API exists
  if (!window.API || typeof API.addWorkout !== "function") {
    msgEl.textContent = "API not found. Make sure api.js is loaded before workout_new.js.";
    return;
  }

  // Set default date to today (YYYY-MM-DD)
  dateEl.value = new Date().toISOString().slice(0, 10);

  // Create a set row DOM element
  function createSetRow(index, repsValue = "", weightValue = "") {
    const row = document.createElement("div");
    row.className = "set-row";
    row.dataset.index = String(index);

    row.innerHTML = `
      <div class="set-row__index">Set ${index + 1}</div>

      <div class="set-row__fields">
        <label class="label label--small" for="reps-${index}">Reps</label>
        <input class="input input--small" id="reps-${index}" type="number" min="0" step="1" inputmode="numeric" value="${repsValue}">
      </div>

      <div class="set-row__fields">
        <label class="label label--small" for="weight-${index}">Weight(lbs)</label>
        <input class="input input--small" id="weight-${index}" type="number" min="0" step="0.5" inputmode="decimal" value="${weightValue}">
      </div>

      <button class="icon-btn icon-btn--danger" type="button" aria-label="Remove set">Remove</button>
    `;

    const removeBtn = row.querySelector("button");
    removeBtn.addEventListener("click", () => {
      row.remove();
      renumberSets();
    });

    return row;
  }

  // Renumber visible set rows after removing one
  function renumberSets() {
    const rows = Array.from(setsContainer.querySelectorAll(".set-row"));
    rows.forEach((row, i) => {
      row.dataset.index = String(i);
      const indexLabel = row.querySelector(".set-row__index");
      if (indexLabel) indexLabel.textContent = `Set ${i + 1}`;

      const reps = row.querySelector(`#reps-${Number(row.dataset.index)}`);
      const weight = row.querySelector(`#weight-${Number(row.dataset.index)}`);

      // Rebuild ids to keep them unique and consistent
      const repsInput = row.querySelector('input[id^="reps-"]');
      const weightInput = row.querySelector('input[id^="weight-"]');

      if (repsInput) repsInput.id = `reps-${i}`;
      if (weightInput) weightInput.id = `weight-${i}`;

      const repsLabel = row.querySelector(`label[for^="reps-"]`);
      const weightLabel = row.querySelector(`label[for^="weight-"]`);
      if (repsLabel) repsLabel.setAttribute("for", `reps-${i}`);
      if (weightLabel) weightLabel.setAttribute("for", `weight-${i}`);
    });
  }

  // Collect sets from the DOM
  function collectSets() {
    const rows = Array.from(setsContainer.querySelectorAll(".set-row"));
    const sets = [];

    rows.forEach((row, i) => {
      const repsInput = row.querySelector(`#reps-${i}`);
      const weightInput = row.querySelector(`#weight-${i}`);

      const reps = repsInput ? Number(repsInput.value) : 0;
      const weight = weightInput ? Number(weightInput.value) : 0;

      // Ignore completely empty rows
      const hasAny = (repsInput && repsInput.value !== "") || (weightInput && weightInput.value !== "");
      if (!hasAny) return;

      sets.push({
        reps: Number.isFinite(reps) ? reps : 0,
        weight: Number.isFinite(weight) ? weight : 0,
      });
    });

    return sets;
  }

  // Add initial 3 sets by default
  function addDefaultSets() {
    setsContainer.innerHTML = "";
    for (let i = 0; i < 3; i += 1) {
      setsContainer.appendChild(createSetRow(i));
    }
  }

  addDefaultSets();

  // Add a new set row
  addSetBtn.addEventListener("click", () => {
    const index = setsContainer.querySelectorAll(".set-row").length;
    setsContainer.appendChild(createSetRow(index));
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.textContent = "";

    const date = dateEl.value.trim();
    const exercise = exerciseEl.value.trim();
    const notes = notesEl.value.trim();

    if (!date) {
      msgEl.textContent = "Please choose a date.";
      return;
    }
    if (!exercise) {
      msgEl.textContent = "Please enter an exercise name.";
      return;
    }

    const sets = collectSets();
    if (sets.length === 0) {
      msgEl.textContent = "Please add at least one set (reps or weight).";
      return;
    }

    const payload = { date, exercise, notes, sets };

    try {
      // Save workout (localStorage now, MongoDB later)
      await API.addWorkout(payload);
      window.location.href = "/workouts";
    } catch (err) {
      console.error(err);
      msgEl.textContent = "Failed to save workout. Please try again.";
    }
  });
})();