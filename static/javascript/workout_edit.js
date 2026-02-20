/* workout_edit.js
 * Edit workout screen:
 * - Read workout id from query string (?id=...)
 * - Load workout via API.getWorkoutById(id)
 * - Allow editing workout fields + sets
 * - Save changes via API.updateWorkout(id, patch)
 */

(function () {
  "use strict";

  const form = document.getElementById("workout-form");
  const idEl = document.getElementById("workout-id");
  const dateEl = document.getElementById("date");
  const exerciseEl = document.getElementById("exercise");
  const notesEl = document.getElementById("notes");
  const addSetBtn = document.getElementById("add-set");
  const setsContainer = document.getElementById("sets-container");
  const msgEl = document.getElementById("form-message");

  if (!form || !idEl || !dateEl || !exerciseEl || !addSetBtn || !setsContainer || !msgEl) return;

  // Ensure API exists
  if (!window.API || typeof API.getWorkoutById !== "function" || typeof API.updateWorkout !== "function") {
    msgEl.textContent = "API not found. Make sure api.js is loaded before workout_edit.js.";
    return;
  }

  // Read id from query string
  const params = new URLSearchParams(window.location.search);
  const workoutId = params.get("id");

  if (!workoutId) {
    msgEl.textContent = "Missing workout id in URL. Go back to Workouts and try again.";
    return;
  }

  idEl.value = workoutId;

  // Create a set row DOM element
  function createSetRow(index, repsValue = "", weightValue = "") {
    const row = document.createElement("div");
    row.className = "set-row";
    row.dataset.index = String(index);

    row.innerHTML = `
      <div class="set-row__index">Set ${index + 1}</div>

      <div class="set-row__fields">
        <label class="label label--small" for="reps-${index}">Reps</label>
        <input class="input input--small" id="reps-${index}" type="number" min="0" step="1" inputmode="numeric" value="${String(repsValue)}">
      </div>

      <div class="set-row__fields">
        <label class="label label--small" for="weight-${index}">Weight</label>
        <input class="input input--small" id="weight-${index}" type="number" min="0" step="0.5" inputmode="decimal" value="${String(weightValue)}">
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

      // Rebuild ids to keep them unique and consistent
      const repsInput = row.querySelector('input[id^="reps-"]');
      const weightInput = row.querySelector('input[id^="weight-"]');
      if (repsInput) repsInput.id = `reps-${i}`;
      if (weightInput) weightInput.id = `weight-${i}`;

      const repsLabel = row.querySelector('label[for^="reps-"]');
      const weightLabel = row.querySelector('label[for^="weight-"]');
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

  // Render workout into the form
  function fillForm(workout) {
    dateEl.value = workout.date || new Date().toISOString().slice(0, 10);
    exerciseEl.value = workout.exercise || "";
    notesEl.value = workout.notes || "";

    setsContainer.innerHTML = "";
    const sets = Array.isArray(workout.sets) ? workout.sets : [];

    if (sets.length === 0) {
      // Ensure there is at least one editable row
      setsContainer.appendChild(createSetRow(0));
      return;
    }

    sets.forEach((s, i) => {
      setsContainer.appendChild(createSetRow(i, s.reps ?? "", s.weight ?? ""));
    });
  }

  // Load workout on page load
  async function loadWorkout() {
    msgEl.textContent = "Loading...";
    try {
      const workout = await API.getWorkoutById(workoutId);
      if (!workout) {
        msgEl.textContent = "Workout not found. It may have been deleted.";
        return;
      }
      fillForm(workout);
      msgEl.textContent = "";
    } catch (err) {
      console.error(err);
      msgEl.textContent = "Failed to load workout.";
    }
  }

  // Add new set row
  addSetBtn.addEventListener("click", () => {
    const index = setsContainer.querySelectorAll(".set-row").length;
    setsContainer.appendChild(createSetRow(index));
  });

  // Save changes
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.textContent = "";

    const date = dateEl.value.trim();
    const exercise = exerciseEl.value.trim();
    const notes = notesEl.value.trim();
    const sets = collectSets();

    if (!date) {
      msgEl.textContent = "Please choose a date.";
      return;
    }
    if (!exercise) {
      msgEl.textContent = "Please enter an exercise name.";
      return;
    }
    if (sets.length === 0) {
      msgEl.textContent = "Please add at least one set (reps or weight).";
      return;
    }

    try {
      await API.updateWorkout(workoutId, { date, exercise, notes, sets });
      window.location.href = "/workouts";
    } catch (err) {
      console.error(err);
      msgEl.textContent = "Failed to save changes. Please try again.";
    }
  });

  loadWorkout();
})();