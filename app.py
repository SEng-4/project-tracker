from flask import Flask, render_template

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

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == ('__main__'):
    app.run()