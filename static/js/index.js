const $ = (selector) => document.querySelector(selector);
const container = document.getElementById('task-list');

function createTask() {
    // Ensure initialisation happens only once so we don't attach duplicate listeners
    if (window._createTaskInitialized) {
        if (typeof startCreateTaskFlow === 'function') startCreateTaskFlow();
        return;
    }

    let modalEl = $("#createTaskPrompt");
    let promptMsgEl = $("#prompt-message");
    let promptInputEl = $("#prompt-input");
    let promptSelectEl = $("#prompt-select");
    let okButtonEl = $("#prompt-ok");
    let cancelButtonEl = $("#prompt-cancel");

    let createTaskState = { step: 0, name: '', desc: '', status: 0, user_id: '' };

    const setStep = (step) => {
        createTaskState.step = step;
        // Reset visibility
        promptInputEl.style.display = 'inline-block';
        promptSelectEl.style.display = 'none';

        switch (step) {
            case 0:
                promptMsgEl.textContent = 'Enter Task Name';
                promptInputEl.value = '';
                promptInputEl.placeholder = 'Task name';
                break;
            case 1:
                promptMsgEl.textContent = 'Enter Description';
                promptInputEl.value = '';
                promptInputEl.placeholder = 'Short description';
                break;
            case 2:
                promptMsgEl.textContent = 'Enter Status (0 = To-Do, 1 = Doing, 2 = Done)';
                promptInputEl.value = '';
                promptInputEl.placeholder = '0, 1, or 2';
                break;
            case 3:
                promptMsgEl.textContent = 'Assign to user (optional)';
                promptInputEl.style.display = 'none';
                promptSelectEl.style.display = 'inline-block';
                promptSelectEl.innerHTML = '';
                // Add a default unassigned option
                const unassignedOpt = document.createElement('option');
                unassignedOpt.value = '';
                unassignedOpt.textContent = 'Unassigned';
                promptSelectEl.appendChild(unassignedOpt);

                // Fetch users and populate select
                fetch('/list_users')
                    .then(r => r.json())
                    .then(users => {
                        users.forEach(u => {
                            const opt = document.createElement('option');
                            opt.value = u.id;
                            opt.textContent = `${u.first_name} ${u.last_name} (${u.username})`;
                            promptSelectEl.appendChild(opt);
                        });
                    })
                    .catch(err => {
                        console.error('Failed to load users for select:', err);
                        // Keep only Unassigned option
                    });
                break;
            default:
                break;
        }
    };

    // Make setStep globally accessible so startCreateTaskFlow can use it
    window.setStep = setStep;

    okButtonEl.addEventListener("click", () => {
        let userInput = '';
        if (createTaskState.step === 3) {
            // get selected user id (may be empty string)
            userInput = promptSelectEl.value != null ? promptSelectEl.value : '';
        } else {
            userInput = promptInputEl.value != null ? promptInputEl.value.trim() : '';
        }

        // For steps 0-2, require input
        if ((createTaskState.step !== 3) && !userInput) {
            promptInputEl.focus();
            return;
        }

        // Switch between each state
        if (createTaskState.step === 0) {
            createTaskState.name = userInput;
            setStep(1);
        } else if (createTaskState.step === 1) {
            createTaskState.desc = userInput;
            setStep(2);
        } else if (createTaskState.step === 2) {
            createTaskState.status = userInput;
            setStep(3);
        } else if (createTaskState.step === 3) {
            createTaskState.user_id = userInput;

            // Finally create the task
            const payload = {
                name: createTaskState.name,
                description: createTaskState.desc,
                status: createTaskState.status
            };
            if (createTaskState.user_id !== '') payload.user_id = createTaskState.user_id;

            fetch('/create_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Task created successfully!');
                        loadTasks();
                    } else {
                        return response.json().then(j => Promise.reject(j));
                    }
                })
                .catch(error => {
                    console.error('Error creating task: ', error);
                    if (error && error.error) alert('Error: ' + error.error);
                });

            modalEl.style.display = 'none';
            createTaskState.active = false;
        }
    });

    cancelButtonEl.addEventListener("click", () => {
        modalEl.style.display = 'none';
        createTaskState.active = false;
    });

    window._createTaskInitialized = true;

    if (typeof startCreateTaskFlow === 'function') {
        startCreateTaskFlow();
    } else {
        console.warn('Create task flow is not ready yet.');
    }
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
                const assignedTo = task.user ? `${task.user.first_name} ${task.user.last_name} (${task.user.username})` : 'Unassigned';
                const taskHtml = `
                    <div class="task status-${task.status}">
                        <h3>${task.name}</h3>
                        <p>Description: ${task.description}</p>
                        <p class="assigned">Assigned to: ${assignedTo}</p>
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

window.startCreateTaskFlow = function startCreateTaskFlow() {
    createTaskState = { step: 0, name: '', desc: '', status: 0, active: true };
    $("#createTaskPrompt").style.display = 'flex';
    setStep(0);
};

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});