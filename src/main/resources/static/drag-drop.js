import { updateTask } from "./api.js";

export function setupColumnDrop(columnEl, targetStatus) {
  console.log("Column drop setup for ", columnEl);

  columnEl.addEventListener("dragover", (evt) => {
    evt.preventDefault();
    columnEl.classList.add("drag-over");

    console.debug("Begin drag.");
  });

  columnEl.addEventListener("dragleave", () => {
    columnEl.classList.remove("drag-over");
  });

  columnEl.addEventListener("drop", (evt) => {
    evt.preventDefault();
    columnEl.classList.remove("drag-over");

    console.debug("Drop.");

    const taskId = evt.dataTransfer.getData("text/plain");
    console.debug("taskId", taskId);
    const draggedEl = document.querySelector(
      `[data-task-id="${CSS.escape(taskId)}"]`
    );
    console.log("draggedEl ", draggedEl);
    if (!draggedEl) return;

    const oldStatus = draggedEl.dataset.status;
    const newStatus = String(targetStatus);

    if (oldStatus === newStatus) return;

    // Optimistic UI update
    columnEl.appendChild(draggedEl);
    draggedEl.dataset.status = newStatus;

    // Construct payload for PUT request
    const payload = {
      id: taskId,
      status: newStatus,
    };

    updateTask(payload)
      .then(() => {
        console.log(`Task ${taskId} updated to status ${newStatus}`);
        draggedEl.className = `task status-${newStatus}`;
      })
      .catch((error) => {
        console.error("Updating task status: ", error);
      });
  });
}
