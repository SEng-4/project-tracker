const $ = (selector) => document.querySelector(selector);

const container = document.getElementById('task-list');




function createTask() {
    let tName = prompt("Enter Task Name");
    let tDesc = prompt("Enter Description");
    let tStat = prompt("Enter Status: (0 for To-Do, 1 for Doing, 2 for Done)")

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
    // Clear old tasks
    document.getElementById('to_do').innerHTML = 'To Do';
    document.getElementById('doing').innerHTML = 'Doing';
    document.getElementById('done').innerHTML = 'Done';

    fetch('/list_tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
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

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

// === Custom Prompt Modal handler
(function(){
  const $ = id => document.getElementById(id);
  const init = () => {
    const b = $('floating-create-btn'), m = $('customPrompt'),
          ok = $('prompt-ok'), c = $('prompt-cancel');
    if (!b || !m) return;
    b.addEventListener('click', () => m.style.display = 'flex');
    ok && ok.addEventListener('click', () => m.style.display = 'none');
    c && c.addEventListener('click', () => m.style.display = 'none');
    m.addEventListener('click', e => e.target === m && (m.style.display = 'none'));
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
