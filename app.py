from flask import Flask, render_template, request, jsonify

class Task:
    def __init__(self, task_id, name, description, status=0, user=None):
        self.id = task_id # a unique identifier
        self.name = name
        self.description = description
        self.status = status # 0 = to-do, 1 = doing, 2 = done
        self.user = user

    # Could make life easier in the future by returning tasks
    # in a JSON format, might be good for data storage later
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name
            } if self.user else None
        }

class User:
    def __init__(self, user_id, username, first_name, last_name):
        self.username = username
        self.id = user_id
        self.first_name = first_name
        self.last_name = last_name

app = Flask(__name__)

tasks = []
users = []
next_id = 0

# Create some dummy users for testing
def create_dummy_users():
    global users
    users.append(User(0, "alice_smith", "Alice", "Smith"))
    users.append(User(1, "bob_johnson", "Bob", "Johnson"))
    users.append(User(2, "carol_williams", "Carol", "Williams"))
    users.append(User(3, "david_brown", "David", "Brown"))
    users.append(User(4, "eve_davis", "Eve", "Davis"))

create_dummy_users()

def create_task(name, description, status, user):
    global next_id
    task = Task(next_id, name, description, status, user)
    tasks.append(task)
    next_id += 1

# Create a dummy task assigned to Alice
def create_dummy_task():
    user = users[0] 
    create_task("Users", "Make users work", 0, user)

# Initialize dummy data
create_dummy_task()

@app.route('/')
def index():
    return render_template('index.html', tasks=tasks)

@app.route('/create_task', methods=["POST"])
def create_task_endpoint():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    status = data.get('status')
    # Optionally accept a user_id from the client; if provided we'll validate
    user_id = data.get('user_id')

    # Basic validation
    if name is None or name == '':
        return jsonify({"error": "Task name is required."}), 400
    if status is None or status == '':
        return jsonify({"error": "Status is required."}), 400

    try:
        status_int = int(status)
    except (TypeError, ValueError):
        return jsonify({"error": "Status must be an integer (0,1,2)."}), 400

    assigned_user = None
    if user_id is not None and user_id != '':
        try:
            user_id_int = int(user_id)
        except (TypeError, ValueError):
            return jsonify({"error": "user_id must be an integer."}), 400

        # Find the user by id
        assigned_user = next((u for u in users if u.id == user_id_int), None)
        if assigned_user is None:
            return jsonify({"error": f"No user found with id {user_id_int}."}), 400

    create_task(name, description, status_int, assigned_user)
    return jsonify({"message": "Task created successfully."}), 201

@app.route('/update_task', methods=["POST"])
def update_task_endpoint():
    data = request.json
    task_id = int(data.get("id"))
    status = int(data.get("status"))
    for task in tasks:
        if task.id == task_id:
            task.status = status
            return jsonify({"message": "Task updated successfully.", "task": task.to_dict()}), 200
    return jsonify({"error": "Task not found."}), 404

@app.route('/list_tasks', methods=["GET"])
def list_tasks():
    return jsonify([task.to_dict() for task in tasks])


@app.route('/list_users', methods=["GET"])
def list_users():
    # Return a simple JSON list of users (id, username, first_name, last_name)
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name
        }
        for u in users
    ])

if __name__ == ('__main__'):
    app.run(debug=True)