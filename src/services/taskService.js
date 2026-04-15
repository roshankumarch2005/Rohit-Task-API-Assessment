// services/taskService.js
let tasks = [];
let nextId = 1;

class TaskService {
  getAllTasks(status, pageStr, limitStr) {
    let filteredTasks = [...tasks];

    // Bug Fix: Case-insensitive status filtering
    if (status) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status.toLowerCase() === status.toLowerCase(),
      );
    }

    // Bug Fix: Proper Pagination Logic (parsing strings to integers)
    const page = parseInt(pageStr, 10) || 1;
    const limit = parseInt(limitStr, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return filteredTasks.slice(startIndex, endIndex);
  }

  getTaskById(id) {
    return tasks.find(
      (task) => task.id === String(id) || task.id === Number(id),
    );
  }

  createTask(data) {
    const newTask = {
      id: String(nextId++),
      title: data.title,
      priority: data.priority || "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    return newTask;
  }

  updateTask(id, data) {
    const taskIndex = tasks.findIndex(
      (task) => task.id === String(id) || task.id === Number(id),
    );
    if (taskIndex === -1) return null;

    // Bug Fix: Preserving immutable fields during a PUT request
    const existingTask = tasks[taskIndex];
    const updatedTask = {
      ...existingTask, // Keep original data first
      ...data, // Overwrite with incoming data
      id: existingTask.id, // Protect the ID from being overwritten
      createdAt: existingTask.createdAt, // Protect the creation date
      updatedAt: new Date().toISOString(), // Force a new timestamp
    };

    tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  deleteTask(id) {
    const taskIndex = tasks.findIndex(
      (task) => task.id === String(id) || task.id === Number(id),
    );
    if (taskIndex === -1) return false;
    tasks.splice(taskIndex, 1);
    return true;
  }

  markComplete(id) {
    const task = this.getTaskById(id);
    if (!task) return null;
    task.status = "completed";
    task.updatedAt = new Date().toISOString();
    return task;
  }

  // New Feature: Assign Task to a User
  assignTask(id, assigneeId) {
    const task = this.getTaskById(id);
    if (!task) return null;
    task.assigneeId = assigneeId;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  getStats() {
    let pending = 0;
    let completed = 0;
    tasks.forEach((task) => {
      if (task.status === "pending") pending++;
      if (task.status === "completed") completed++;
    });
    return { pending, completed };
  }

  // Helper for tests to ensure isolated environments
  _resetStore() {
    tasks = [];
    nextId = 1;
  }
}

module.exports = new TaskService();
