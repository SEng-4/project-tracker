const $ = (selector) => document.querySelector(selector);
const container = document.getElementById('task-list');

function createTask() {
    let modalEl = $("#createTaskPrompt");
    let promptMsgEl = $("#prompt-message");
    let promptInputEl = $("#prompt-input");
    let okButtonEl = $("#prompt-ok");
    let cancelButtonEl = $("#prompt-cancel");

    // Are we creating a task? What kind of task are we creating?
    let createTaskState = { step: 0, name: '', desc: '', status: 0, active: false };

    const setStep = (step) => {
        createTaskState.step = step;
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
            default:
                break;
        }
        // Focus on each step
        setTimeout(() => promptInputEl.focus(), 0);
    };

    // Make setStep globally accessible so I can use it later in startCreateTaskFlow
    window.setStep = setStep;

    okButtonEl.addEventListener("click", () => {
        let userInput = promptInputEl.value != null ? promptInputEl.value.trim() : '';

        // User has entered nothing
        if (!userInput) {
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

            // Finally create the task
            fetch('/create_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: createTaskState.name,
                    description: createTaskState.desc,
                    status: createTaskState.status
                })
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Task created successfully!');
                        loadTasks();
                    }
                })
                .catch(error => {
                    console.error('Error creating task: ', error);
                });

            modalEl.style.display = 'none';
            // Reset everything
            createTaskState.active = false;
            setStep(0);
        }
    });

    cancelButtonEl.addEventListener("click", () => {
        // Close the damn thing
        modalEl.style.display = 'none';
        createTaskState.active = false;
    });

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

window.startCreateTaskFlow = function startCreateTaskFlow() {
    createTaskState = { step: 0, name: '', desc: '', status: 0, active: true };
    $("#createTaskPrompt").style.display = 'flex';
    setStep(0);
};

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});