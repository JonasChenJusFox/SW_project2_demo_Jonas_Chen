# SW_project2_demo_Jonas_Chen (Sprint 1 Frontend Demo)

This repository is a Sprint 1 front-end demo for our Flask-based web app. It includes the UI screens (HTML/CSS/JS) and a minimal Flask server to render templates locally.

## What’s included
- Flask app serving templates from `templates/`
- Static assets in `static/` (CSS + JavaScript)
- Front-end interactions using localStorage as a temporary “mock database”
- Pages implemented:
  - Home: `/`
  - Workouts: `/workouts`, `/workouts/new`, `/workouts/edit`, `/workouts/delete`
  - Diet: `/diet`, `/diet/new`, `/diet/delete`
  - Timer: `/timer`
  - Auth (mock): `/login`, `/register`

Notes:
- This Sprint 1 build does not connect to MongoDB yet.
- No `.env` is required for Sprint 1.

---

## Quick start (Mac / Linux)

### 1) Clone the repo
```bash
git clone https://github.com/JonasChenJusFox/SW_project2_demo_Jonas_Chen.git
cd SW_project2_demo_Jonas_Chen
```
### 2) Create and activate a virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies
```bash
pip install -r requirements.txt
```

### 4) Run the Flask app
```bash
python3 app.py
```

### 5) Open in browser

Go to:

http://127.0.0.1:5000/







