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

// Bouncing DVD-style prompt behavior
(function () {
    const selector = '#createTaskPrompt';
    const boxSelector = '.prompt-box';
    let bounce = {
        running: false,
        vx: 0,
        vy: 0,
        x: 0,
        y: 0,
        raf: null,
        overlay: null,
        box: null,
        speed: 3
    };

    function randSign() { return Math.random() < 0.5 ? -1 : 1; }

    function startBouncing() {
        const overlay = document.querySelector(selector);
        const box = overlay ? overlay.querySelector(boxSelector) : null;
        if (!overlay || !box) return;

        // stop existing
        stopBouncing();

        overlay.classList.add('bouncing');
        overlay.style.pointerEvents = 'auto';

        // initial bounds and position
        const boundsW = overlay.clientWidth;
        const boundsH = overlay.clientHeight;
        const boxW = box.offsetWidth;
        const boxH = box.offsetHeight;

        // start at a random position inside bounds
        bounce.x = Math.floor(Math.random() * Math.max(1, boundsW - boxW));
        bounce.y = Math.floor(Math.random() * Math.max(1, boundsH - boxH));

        // random velocity with chosen speed
        const s = bounce.speed;
        bounce.vx = (1 + Math.random()) * s * randSign();
        bounce.vy = (0.6 + Math.random()) * s * randSign();

        bounce.overlay = overlay;
        bounce.box = box;
        bounce.running = true;

        // set initial coordinates
        box.style.left = bounce.x + 'px';
        box.style.top = bounce.y + 'px';

        function step() {
            if (!bounce.running) return;
            const ow = bounce.overlay.clientWidth;
            const oh = bounce.overlay.clientHeight;
            const bw = bounce.box.offsetWidth;
            const bh = bounce.box.offsetHeight;

            bounce.x += bounce.vx;
            bounce.y += bounce.vy;

            // collide with left/right
            if (bounce.x <= 0) {
                bounce.x = 0;
                bounce.vx = Math.abs(bounce.vx);
            } else if (bounce.x + bw >= ow) {
                bounce.x = Math.max(0, ow - bw);
                bounce.vx = -Math.abs(bounce.vx);
            }

            // collide with top/bottom
            if (bounce.y <= 0) {
                bounce.y = 0;
                bounce.vy = Math.abs(bounce.vy);
            } else if (bounce.y + bh >= oh) {
                bounce.y = Math.max(0, oh - bh);
                bounce.vy = -Math.abs(bounce.vy);
            }

            // apply position
            bounce.box.style.left = Math.round(bounce.x) + 'px';
            bounce.box.style.top = Math.round(bounce.y) + 'px';

            bounce.raf = requestAnimationFrame(step);
        }

        bounce.raf = requestAnimationFrame(step);
    }

    function stopBouncing() {
        if (!bounce.running) return;
        bounce.running = false;
        if (bounce.raf) cancelAnimationFrame(bounce.raf);
        if (bounce.overlay) {
            bounce.overlay.classList.remove('bouncing');
            // clear inline positioning so original centering returns
            if (bounce.box) {
                bounce.box.style.left = '';
                bounce.box.style.top = '';
            }
            bounce.overlay = null;
            bounce.box = null;
        }
    }

    // expose to window so createTask flow can use them
    window._startPromptBounce = startBouncing;
    window._stopPromptBounce = stopBouncing;

    // hook into existing start/stop points
    const origStart = window.startCreateTaskFlow;
    window.startCreateTaskFlow = function () {
        if (typeof origStart === 'function') origStart();
        // small timeout to allow overlay to render and size to stabilize
        setTimeout(startBouncing, 50);
    };

    // intercept modal hide points used in createTask: listen for display changes on the overlay
    const observer = new MutationObserver(muts => {
        muts.forEach(m => {
            if (m.attributeName === 'style' && m.target && m.target.id === 'createTaskPrompt') {
                const el = m.target;
                const disp = window.getComputedStyle(el).display;
                if (disp === 'none') stopBouncing();
            }
        });
    });
    const overlayEl = document.querySelector(selector);
    if (overlayEl) observer.observe(overlayEl, { attributes: true, attributeFilter: ['style'] });

    // cleanup on page hide
    window.addEventListener('beforeunload', stopBouncing);
})();