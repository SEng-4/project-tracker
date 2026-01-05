export function fetchUsers() {
  return fetch("/users")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Fetching users: ", error);
    });
}

export function fetchTasks() {
  return fetch("/tasks")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Fetching tasks: ", error);
    });
}

export function createTask(payload) {
  return fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateTask(payload) {
  return fetch(`/tasks/${payload.id}` , {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Updating task: ", error);
    });
}

export function deleteTask(task) {
  return fetch(`/tasks/${task}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}
