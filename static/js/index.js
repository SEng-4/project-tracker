function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const container = document.getElementById('task-list');

            if (tasks.length === 0) {
                container.innerHTML = '<p>No tasks found.</p>';
                return;
            }

            let html = '<h2>Tasks:</h2>';
            tasks.forEach(task => {
                const statusText = getStatusText(task.status);
                html += `
                            <div class="task status-${task.status}">
                                <h3>${task.name}</h3>
                                <p><strong>Description:</strong> ${task.description}</p>
                                <p><strong>Status:</strong> ${statusText}</p>
                                <p><strong>ID:</strong> ${task.id}</p>
                            </div>
                        `;
            });

            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
            document.getElementById('tasks-container').innerHTML = '<p>Error loading tasks.</p>';
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