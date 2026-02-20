from flask import Flask, render_template

app = Flask(__name__)

# Home / Dashboard
@app.get("/")
def home():
    return render_template("home.html")

# Workouts screens
@app.get("/workouts")
def workouts():
    return render_template("workouts.html")

@app.get("/workouts/new")
def workout_new():
    return render_template("workout_new.html")

@app.get("/workouts/edit")
def workout_edit():
    return render_template("workout_edit.html")

@app.get("/workouts/delete")
def workout_delete():
    return render_template("workout_delete.html")

# Diet screens
@app.get("/diet")
def diet():
    return render_template("diet.html")

@app.get("/diet/new")
def diet_new():
    return render_template("diet_new.html")

@app.get("/diet/delete")
def diet_delete():
    return render_template("diet_delete.html")

# Auth screens
@app.get("/login")
def login():
    return render_template("login.html")

@app.get("/register")
def register():
    return render_template("register.html")

# Timer screen
@app.get("/timer")
def timer():
    return render_template("timer.html")

if __name__ == "__main__":
    app.run(debug=True, port=5050)