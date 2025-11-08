from flask import Flask, render_template, request, jsonify

class Task:
    def __init__(self, task_id, name, description, status=0):
        self.id = task_id # a unique identifier
        self.name = name
        self.description = description
        self.status = status # 0 = to-do, 1 = doing, 2 = done

    # Could make life easier in the future by returning tasks
    # in a JSON format, might be good for data storage later
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status
        }

app = Flask(__name__)

tasks = []
next_id = 0

def create_task(name, description, status):
    global next_id
    task = Task(next_id, name, description, status)
    tasks.append(task)
    next_id += 1

@app.route('/')
def index():
    return render_template('index.html', tasks=tasks)

@app.route('/create_task', methods=["POST"])
def create_task_endpoint():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    status = data.get('status')
    create_task(name, description, int(status))
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

if __name__ == ('__main__'):
    app.run(debug=True)