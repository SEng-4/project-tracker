import { fetchUsers, fetchTasks } from "./api.js";
import { setUsers, setTasks } from "./state.js";
import { clearColumns, renderTasks, showTaskCreationModal } from "./render.js";
import { setupColumnDrop } from "./drag-drop.js";

export function loadTasks() {
  clearColumns();
  fetchTasks()
    .then((tasks) => {
      console.log("Tasks: ", tasks);
      setTasks(tasks);
      renderTasks(tasks);
    })
    .catch((error) => {
      console.error("During loadTasks(): ", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchUsers()
    .then((users) => {
      console.log("Users: ", users);
      setUsers(users);
      setupColumnDrop(document.getElementById("to_do"), "TO_DO");
      setupColumnDrop(document.getElementById("doing"), "DOING");
      setupColumnDrop(document.getElementById("done"), "DONE");
      loadTasks();
    })
    .catch((error) => {
      console.error("During initialisation: ", error);
    });
});

document
  .getElementById("floating-create-btn")
  .addEventListener("click", () => {
    console.debug("Create button clicked!");
    fetchUsers().then((users) => {
      showTaskCreationModal(users);
    });
  });