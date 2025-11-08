const $ = (selector) => document.querySelector(selector);
const container = document.getElementById("task-list");

function createTask() {
  let modalEl = $("#createTaskPrompt");
  let promptMsgEl = $("#prompt-message");
  let promptInputEl = $("#prompt-input");
  let okButtonEl = $("#prompt-ok");
  let cancelButtonEl = $("#prompt-cancel");

  // Are we creating a task? What kind of task are we creating?
  let createTaskState = {
    step: 0,
    name: "",
    desc: "",
    status: 0,
    active: false,
  };

  const setStep = (step) => {
    createTaskState.step = step;
    switch (step) {
      case 0:
        promptMsgEl.textContent = "Enter Task Name";
        promptInputEl.value = "";
        promptInputEl.placeholder = "Task name";
        break;
      case 1:
        promptMsgEl.textContent = "Enter Description";
        promptInputEl.value = "";
        promptInputEl.placeholder = "Short description";
        break;
      case 2:
        promptMsgEl.textContent =
          "Enter Status (0 = To-Do, 1 = Doing, 2 = Done)";
        promptInputEl.value = "";
        promptInputEl.placeholder = "0, 1, or 2";
        break;
      default:
        break;
    }
    // Focus on each step
    setTimeout(() => promptInputEl.focus(), 0);
  };

  // Make setStep globally accessible so I can use it later in startCreateTaskFlow
  globalThis.setStep = setStep;

  okButtonEl.addEventListener("click", () => {
    let userInput =
      promptInputEl.value != null ? promptInputEl.value.trim() : "";

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
      fetch("/create_task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: createTaskState.name,
          description: createTaskState.desc,
          status: createTaskState.status,
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Task created successfully!");
            loadTasks();
          }
        })
        .catch((error) => {
          console.error("Error creating task: ", error);
        });

      modalEl.style.display = "none";
      // Reset everything
      createTaskState.active = false;
      setStep(0);
    }
  });

  cancelButtonEl.addEventListener("click", () => {
    // Close the damn thing
    modalEl.style.display = "none";
    createTaskState.active = false;
  });

  if (typeof startCreateTaskFlow === "function") {
    startCreateTaskFlow();
  } else {
    console.warn("Create task flow is not ready yet.");
  }
}

function createTaskElement(task) {
  const el = document.createElement("div");
  el.className = `task status-${task.status}`;
  el.setAttribute("draggable", "true");
  // Assumes backend returns a unique id in task.id
  el.dataset.taskId = task.id;
  el.dataset.status = String(task.status);

  const h3 = document.createElement("h3");
  h3.textContent = task.name || "Unnamed Task";
  const p = document.createElement("p");
  p.textContent = `Description: ${task.description || ""}`;

  el.appendChild(h3);
  el.appendChild(p);

  el.addEventListener("dragstart", (e) => {
    try {
      e.dataTransfer.setData("text/plain", String(task.id));
      e.dataTransfer.effectAllowed = "move";
      el.classList.add("dragging");
    } catch (err) {
      console.warn("Dragstart failed:", err);
    }
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
  });

  return el;
}

function setupColumnDrop(columnEl, targetStatus) {
  columnEl.addEventListener("dragover", (e) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
    columnEl.classList.add("drag-over");
  });

  columnEl.addEventListener("dragleave", () => {
    columnEl.classList.remove("drag-over");
  });

  columnEl.addEventListener("drop", (e) => {
    e.preventDefault();
    columnEl.classList.remove("drag-over");
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    const draggedEl = document.querySelector(
      `[data-task-id="${CSS.escape(taskId)}"]`
    );
    if (!draggedEl) return;

    const oldStatus = draggedEl.dataset.status;
    const newStatus = String(targetStatus);
    if (oldStatus === newStatus) {
      // no-op
      return;
    }

    // Optimistic UI: move immediately
    columnEl.appendChild(draggedEl);
    draggedEl.dataset.status = newStatus;

    // Persist change to backend; adjust endpoint as needed
    fetch("/update_task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: Number(newStatus) }),
    })
      .then((resp) => {
        if (!resp.ok) {
          // rollback on failure
          console.error("Failed to update status, reloading tasks.");
          loadTasks();
        } else {
          // success: optionally update classes
          draggedEl.className = `task status-${newStatus}`;
        }
      })
      .catch((err) => {
        console.error("Error updating task status:", err);
        loadTasks();
      });
  });
}

function loadTasks() {
  // Clear old tasks but keep column headers
  const toDoCol = document.getElementById("to_do");
  const doingCol = document.getElementById("doing");
  const doneCol = document.getElementById("done");

  // reset content to header text
  toDoCol.textContent = "To Do";
  doingCol.textContent = "Doing";
  doneCol.textContent = "Done";

  fetch("/list_tasks")
    .then((response) => response.json())
    .then((tasks) => {
      tasks.forEach((task) => {
        const el = createTaskElement(task);
        if (task.status === 0) {
          toDoCol.appendChild(el);
        } else if (task.status === 1) {
          doingCol.appendChild(el);
        } else if (task.status === 2) {
          doneCol.appendChild(el);
        } else {
          // unknown status -> put in To Do by default
          toDoCol.appendChild(el);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
      container.innerHTML = "<p>Error loading tasks.</p>";
    });
}

globalThis.startCreateTaskFlow = function startCreateTaskFlow() {
  createTaskState = { step: 0, name: "", desc: "", status: 0, active: true };
  $("#createTaskPrompt").style.display = "flex";
  setStep(0);
};

document.addEventListener("DOMContentLoaded", () => {
  setupColumnDrop(document.getElementById("to_do"), 0);
  setupColumnDrop(document.getElementById("doing"), 1);
  setupColumnDrop(document.getElementById("done"), 2);
  loadTasks();
});
