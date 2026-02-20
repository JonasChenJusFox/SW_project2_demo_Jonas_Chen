/* api.js
 * Front-end data layer for LiftLog.
 * MODE = "local" uses localStorage as a mock database.
 * MODE = "remote" will call Flask endpoints (you will wire these later).
 */

(function () {
  "use strict";

  // Switch between "local" (mock) and "remote" (Flask API)
  const MODE = "local";

  // Storage keys for mock database
  const KEY_WORKOUTS = "liftlog_workouts";
  const KEY_MEALS = "liftlog_meals";

  // -----------------------------
  // Utilities
  // -----------------------------

  // Create a unique id (crypto.randomUUID is supported by modern browsers)
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id_" + Date.now() + "_" + Math.random().toString(16).slice(2);
  }

  // Safe JSON parse from localStorage
  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }

  // Safe JSON write to localStorage
  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Normalize text for searching
  function norm(s) {
    return String(s || "").trim().toLowerCase();
  }

  // Sort workouts by date desc (fallback: keep insertion order)
  function sortByDateDesc(items) {
    return items.slice().sort((a, b) => {
      const da = Date.parse(a.date || "") || 0;
      const db = Date.parse(b.date || "") || 0;
      return db - da;
    });
  }

  // -----------------------------
  // Remote request placeholder
  // -----------------------------

  /* When you switch MODE to "remote", implement endpoints like:
   * GET    /api/workouts?q=
   * POST   /api/workouts
   * PUT    /api/workouts/:id
   * DELETE /api/workouts/:id
   * GET    /api/meals?date=
   * POST   /api/meals
   */
  async function request(method, path, body) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
      // If you use cookie-based sessions with flask-login, keep credentials:
      // credentials: "include",
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(path, opts);
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`API ${method} ${path} failed: ${res.status} ${msg}`);
    }
    // For empty responses (204), return null
    if (res.status === 204) return null;
    return res.json();
  }

  // -----------------------------
  // Workouts (CRUD + Search)
  // Data shape (suggested):
  // {
  //   id, date, exercise, notes,
  //   sets: [{ reps, weight }]
  // }
  // -----------------------------

  async function getWorkouts(query = "") {
    if (MODE === "remote") {
      const q = encodeURIComponent(query || "");
      return request("GET", `/api/workouts?q=${q}`);
    }

    const all = load(KEY_WORKOUTS);
    const qn = norm(query);
    if (!qn) return sortByDateDesc(all);

    const filtered = all.filter((w) => {
      return (
        norm(w.exercise).includes(qn) ||
        norm(w.date).includes(qn) ||
        norm(w.notes).includes(qn)
      );
    });
    return sortByDateDesc(filtered);
  }

  async function getWorkoutById(id) {
    if (MODE === "remote") {
      return request("GET", `/api/workouts/${encodeURIComponent(id)}`);
    }

    const all = load(KEY_WORKOUTS);
    return all.find((w) => w.id === id) || null;
  }

  async function addWorkout(workout) {
    if (MODE === "remote") {
      return request("POST", "/api/workouts", workout);
    }

    const all = load(KEY_WORKOUTS);
    const item = {
      id: uid(),
      date: workout.date || new Date().toISOString().slice(0, 10),
      exercise: workout.exercise || "",
      notes: workout.notes || "",
      sets: Array.isArray(workout.sets) ? workout.sets : [],
    };
    all.unshift(item);
    save(KEY_WORKOUTS, all);
    return item;
  }

  async function updateWorkout(id, patch) {
    if (MODE === "remote") {
      return request("PUT", `/api/workouts/${encodeURIComponent(id)}`, patch);
    }

    const all = load(KEY_WORKOUTS);
    const idx = all.findIndex((w) => w.id === id);
    if (idx === -1) return null;

    all[idx] = {
      ...all[idx],
      ...patch,
      // Ensure sets remains an array if provided
      sets: patch.sets !== undefined ? (Array.isArray(patch.sets) ? patch.sets : []) : all[idx].sets,
    };

    save(KEY_WORKOUTS, all);
    return all[idx];
  }

  async function deleteWorkout(id) {
    if (MODE === "remote") {
      await request("DELETE", `/api/workouts/${encodeURIComponent(id)}`);
      return true;
    }

    const all = load(KEY_WORKOUTS);
    const next = all.filter((w) => w.id !== id);
    save(KEY_WORKOUTS, next);
    return true;
  }

  // Compute total volume for a workout (sum of reps * weight across sets)
  function workoutVolume(workout) {
    const sets = Array.isArray(workout?.sets) ? workout.sets : [];
    return sets.reduce((sum, s) => sum + (Number(s.reps) || 0) * (Number(s.weight) || 0), 0);
  }

  // -----------------------------
  // Meals (CRUD + Search)
  // Data shape (suggested):
  // { id, date, name, calories, protein, carbs, fats, notes }
  // -----------------------------

  async function getMeals(date = "") {
    if (MODE === "remote") {
      const d = encodeURIComponent(date || "");
      return request("GET", `/api/meals?date=${d}`);
    }

    const all = load(KEY_MEALS);
    if (!date) return sortByDateDesc(all);
    return sortByDateDesc(all.filter((m) => m.date === date));
  }

  async function addMeal(meal) {
    if (MODE === "remote") {
      return request("POST", "/api/meals", meal);
    }

    const all = load(KEY_MEALS);
    const item = {
      id: uid(),
      date: meal.date || new Date().toISOString().slice(0, 10),
      name: meal.name || "",
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fats: Number(meal.fats) || 0,
      notes: meal.notes || "",
    };
    all.unshift(item);
    save(KEY_MEALS, all);
    return item;
  }

  async function deleteMeal(id) {
    if (MODE === "remote") {
      await request("DELETE", `/api/meals/${encodeURIComponent(id)}`);
      return true;
    }

    const all = load(KEY_MEALS);
    const next = all.filter((m) => m.id !== id);
    save(KEY_MEALS, next);
    return true;
  }

  // Sum daily totals for calories/macros
  function dailyTotals(meals) {
    const list = Array.isArray(meals) ? meals : [];
    return list.reduce(
      (acc, m) => {
        acc.calories += Number(m.calories) || 0;
        acc.protein += Number(m.protein) || 0;
        acc.carbs += Number(m.carbs) || 0;
        acc.fats += Number(m.fats) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }

  // -----------------------------
  // Public API (window.API)
  // -----------------------------
  window.API = {
    // Workouts
    getWorkouts,
    getWorkoutById,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    workoutVolume,

    // Meals
    getMeals,
    addMeal,
    deleteMeal,
    dailyTotals,
  };
})();