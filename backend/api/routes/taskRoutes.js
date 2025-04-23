const express = require("express");
const router = express.Router();
const {
  addTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require("../controllers/taskController");
const protect = require("../middleware/auth");

// Apply auth middleware to all task routes
router.use(protect);

// POST /task - Add new task
router.post("/", addTask);

// PUT /task/:taskId - Update task
router.put("/:taskId", updateTask);

// DELETE /task/:taskId - Delete task
router.delete("/:taskId", deleteTask);

// PUT /task/reorder - Reorder tasks
router.put("/reorder", reorderTasks);

module.exports = router;
