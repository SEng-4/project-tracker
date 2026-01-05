export const state = {
    users: {},
    tasks: []
};

export function setUsers(users) {
    users.forEach((user) => {
        state.users[user.id] = `${user.username} ${user.displayName} ${user.role}`;
    });
}

export function getUser(userId) {
    return state.users[userId] || "Unassigned";
}

export function setTasks(tasks) {
    state.tasks = tasks;
}

export function getTasks() {
    return state.tasks;
}