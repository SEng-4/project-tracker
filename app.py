from flask import Flask, render_template, jsonify

class Task:
    def __init__(self, task_id, name, description, status=0):
        self.id = task_id  # a unique identifier
        self.name = name
        self.description = description
        self.status = status  # 0 = to-do, 1 = doing, 2 = done

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status
        }

app = Flask(__name__)

todo_tasks = []
doing_tasks = []
done_tasks = []
next_id = 0

def create_task(name, description, status):
    global next_id
    task = Task(next_id, name, description, status)
    if status == 0:
        todo_tasks.append(task)
    elif status == 1:
        doing_tasks.append(task)
    elif status == 2:
        done_tasks.append(task)
    next_id += 1

@app.route('/')
def index():
    create_task("Test To-Do", "This is a to-do task.", 0)
    create_task("Test Doing", "This is a doing task.", 1)
    create_task("Test Done", "This is a done task.", 2)
    return render_template(
        'index.html',
        todo_tasks=todo_tasks,
        doing_tasks=doing_tasks,
        done_tasks=done_tasks
    )

@app.route('/tasks', methods=["GET"])
def list_tasks():
    # Return all tasks grouped by status
    return jsonify({
        "todo": [task.to_dict() for task in todo_tasks],
        "doing": [task.to_dict() for task in doing_tasks],
        "done": [task.to_dict() for task in done_tasks]
    })

if __name__ == '__main__':
    app.run()