const container = document.getElementById('task-list');

function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            if (tasks.length === 0) {
                container.innerHTML = '<p>No tasks found.</p>';
                return;
            }

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