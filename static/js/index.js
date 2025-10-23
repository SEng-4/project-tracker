const $ = (selector) => document.querySelector(selector);
const container = document.getElementById('task-list');

let modalEl, promptMsgEl, promptInputEl, okButtonEl, cancelButtonEl;
let createTaskState = { step: 0, name: '', desc: '', status: 0, active: false };

function setupCustomPromptModal() {
    modalEl = document.getElementById('createTaskPrompt');
    promptMsgEl = document.getElementById('prompt-message');
    promptInputEl = document.getElementById('prompt-input');
    okButtonEl = document.getElementById('prompt-ok');
    cancelButtonEl = document.getElementById('prompt-cancel');

    if (!modalEl || !promptMsgEl || !promptInputEl) {
        console.warn('Prompt modal elements not found; modal flow disabled.');
        return;
    }

    const closeModal = () => {
        modalEl.style.display = 'none';
        createTaskState.active = false;
    };

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
        // Focus the input on each step
        setTimeout(() => promptInputEl.focus(), 0);
    };

    const handleOk = () => {
        const val = promptInputEl.value != null ? promptInputEl.value.trim() : '';
        if (createTaskState.step === 0) {
            if (!val) {
                promptInputEl.focus();
                return;
            }
            createTaskState.name = val;
            setStep(1);
        } else if (createTaskState.step === 1) {
            createTaskState.desc = val;
            setStep(2);
        } else if (createTaskState.step === 2) {
            // Accept 0/1/2 or text variants
            let statusNum;
            if (/^(to\s*-?\s*do|todo)$/i.test(val)) statusNum = 0;
            else if (/^doing$/i.test(val)) statusNum = 1;
            else if (/^done$/i.test(val)) statusNum = 2;
            else {
                const parsed = parseInt(val, 10);
                statusNum = Number.isInteger(parsed) ? parsed : NaN;
            }
            if (![0, 1, 2].includes(statusNum)) {
                promptMsgEl.textContent = 'Please enter a valid status (0 = To-Do, 1 = Doing, 2 = Done)';
                promptInputEl.focus();
                return;
            }
            createTaskState.status = statusNum;
            // Submit
            submitCreateTask(createTaskState.name, createTaskState.desc, createTaskState.status);
            closeModal();
        }
    };

    const handleCancel = () => {
        closeModal();
    };

    if (okButtonEl) okButtonEl.addEventListener('click', handleOk);
    if (cancelButtonEl) cancelButtonEl.addEventListener('click', handleCancel);

    // Close when clicking on the backdrop (outside modal content)
    modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) {
            handleCancel();
        }
    });

    // Pressing Enter confirms current step
    promptInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleOk();
        }
    });

    // Expose a starter for the flow
    window.startCreateTaskFlow = function startCreateTaskFlow() {
        createTaskState = { step: 0, name: '', desc: '', status: 0, active: true };
        modalEl.style.display = 'flex';
        setStep(0);
    };
}

function createTask() {
    if (typeof startCreateTaskFlow === 'function') {
        startCreateTaskFlow();
    } else {
        console.warn('Create task flow is not ready yet.');
    }
}

function submitCreateTask(tName, tDesc, tStat) {
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
                console.log('Task created successfully!');
                loadTasks();
            } else {
                console.log('Failed to create task for some reason.');
            }
        })
        .catch(error => {
            console.error('Error creating task: ', error);
        });
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
    setupCustomPromptModal();
    loadTasks();
});