// routes/tasks.js
const express = require("express");
const router = express.Router();
const taskService = require("../services/taskService");

// GET /tasks
router.get("/", (req, res) => {
  const { status, page, limit } = req.query;
  const tasks = taskService.getAllTasks(status, page, limit);
  res.json(tasks);
});

// GET /tasks/stats
router.get("/stats", (req, res) => {
  res.json(taskService.getStats());
});

// POST /tasks
router.post("/", (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const newTask = taskService.createTask(req.body);
  res.status(201).json(newTask);
});

// PUT /tasks/:id
router.put("/:id", (req, res) => {
  const updatedTask = taskService.updateTask(req.params.id, req.body);
  if (!updatedTask) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(updatedTask);
});

// DELETE /tasks/:id
router.delete("/:id", (req, res) => {
  const success = taskService.deleteTask(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(204).send();
});

// PATCH /tasks/:id/complete
router.patch("/:id/complete", (req, res) => {
  const task = taskService.markComplete(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

// NEW FEATURE: PATCH /tasks/:id/assign
router.patch("/:id/assign", (req, res) => {
  const { assigneeId } = req.body;

  // Design Decision: Explicitly validate the input payload
  if (!assigneeId) {
    return res.status(400).json({ error: "assigneeId is required" });
  }

  const task = taskService.assignTask(req.params.id, assigneeId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

module.exports = router;
