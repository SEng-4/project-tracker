const $ = (selector) => document.querySelector(selector);

const container = document.getElementById('task-list');

function createTask() {
    alert("No error handling or anything, that's Liam's job for now");
    let tName = prompt("Enter Task Name");
    let tDesc = prompt("Enter Description");
    let tStat = prompt("Enter Status : 1 for To-Do, 2 for Doing, 3 for Done")

    fetch('/create_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: tName,
            description: tDesc,
            status: tStat
        })
    })
        .then(response => {
            if (response.ok) {
                console.log("Task created successfully!");
                loadTasks();
            } else {
                console.log("Failed to create task for some reason.");
            }
        })
        .catch(error => {
            console.error("Error creating task: ", error);
        })
}

function loadTasks() {
    // clear old tasks
    document.getElementById('to_do').innerHTML = 'To Do';
    document.getElementById('doing').innerHTML = 'Doing';
    document.getElementById('done').innerHTML = 'Done';

    fetch('/list_tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                const statusText = getStatusText(task.status);
                const taskHtml = `
                    <div class="task status-${task.status}">
                        <h3>${task.name}</h3>
                        <p>Description: ${task.description}</p>
                    </div>
                    `

                if (task.status === 0) {
                    document.getElementById('to_do').innerHTML += taskHtml;
                } else if (task.status === 1) {
                    document.getElementById('doing').innerHTML += taskHtml;
                } else if (task.status === 2) {
                    document.getElementById('done').innerHTML += taskHtml;
                }
            });
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            container.innerHTML = '<p>Error loading tasks.</p>';
        });
}

function getStatusText(status) {
    switch (status) {
        case 0: return 'To-Do';
        case 1: return 'Doing';
        case 2: return 'Done';
        default: return 'Unknown';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});