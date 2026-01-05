import { getUser } from "./state.js";
import { loadTasks } from "./script.js";
import { createTask } from "./api.js";

export function clearColumns() {
  document.getElementById("to_do").innerHTML = "To-Do";
  document.getElementById("doing").innerHTML = "Doing";
  document.getElementById("done").innerHTML = "Done";
}

export function createTaskElement(task) {
  const el = document.createElement("div");
  el.className = `task status-${task.status}`;
  el.setAttribute("draggable", "true");
  el.dataset.taskId = task.id;
  el.dataset.status = String(task.status);

  const h3 = document.createElement("h3");
  h3.textContent = task.name || "Unnamed Task";
  const p = document.createElement("p");
  p.textContent = `Description: ${task.description || ""}`;
  const user = document.createElement("p");
  user.classList.add("assigned");

  const assignedTo = getUser(task.assignedUserId).split(" ")[1];
  // Hide text if nobody is assigned to the task.
  user.textContent = assignedTo ? `Assigned to: ${assignedTo}` : "";

  el.addEventListener("dragstart", (evt) => {
    try {
      evt.dataTransfer.setData("text/plain", String(task.id));
      evt.dataTransfer.effectAllowed = "move";
      el.classList.add("dragging");
    } catch (error) {
      console.warn("During dragstart:", error);
    }
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
  });

  el.appendChild(h3);
  el.appendChild(p);
  el.appendChild(user);

  return el;
}

export function renderTasks(tasks) {
  const toDoCol = document.getElementById("to_do");
  const doingCol = document.getElementById("doing");
  const doneCol = document.getElementById("done");

  tasks.forEach((task) => {
    const el = createTaskElement(task);
    if (task.status === "TO_DO") {
      toDoCol.appendChild(el);
    } else if (task.status === "DOING") {
      doingCol.appendChild(el);
    } else if (task.status === "DONE") {
      doneCol.appendChild(el);
    } else {
      toDoCol.appendChild(el);
    }
  });
}

export function showTaskCreationModal(users) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Create Task</h2>
      <form id="task-form">
        <label for="task-name">Task Name:</label>
        <input type="text" id="task-name" name="task-name" required />

        <label for="task-desc">Description:</label>
        <textarea id="task-desc" name="task-desc"></textarea>

        <label for="task-status">Status:</label>
        <select id="task-status" name="task-status">
          <option value="TO_DO">To-Do</option>
          <option value="DOING">Doing</option>
          <option value="DONE">Done</option>
        </select>

        <label for="task-user">Assign to:</label>
        <select id="task-user" name="task-user">
          <option value="">Unassigned</option>
          ${users.map(user => `<option value="${user.id}">${user.displayName}</option>`).join("")}
        </select>

        <button type="submit">Create</button>
        <button type="button" id="cancel-btn">Cancel</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById("cancel-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  document.getElementById("task-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const taskName = document.getElementById("task-name").value;
    const taskDesc = document.getElementById("task-desc").value;
    const taskStatus = document.getElementById("task-status").value;
    const taskUser = document.getElementById("task-user").value;

    const payload = {
      name: taskName,
      description: taskDesc,
      status: taskStatus,
      assignedUserId: taskUser ? parseInt(taskUser, 10) : null
    };

    createTask(payload).then(() => {
      document.body.removeChild(modal);
      loadTasks();
    });
  });
}