from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

class Task:
    def __init__(self, name, description, status):
        self.name = name
        self.description = description
        self.status = status

task1 = Task("Do work", "Doing my work", 1)
if __name__ == ('__main__'):
    app.run()