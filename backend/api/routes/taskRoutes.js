const express = require("express");
const router = express.Router();
const {
  addTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const protect = require("../middleware/auth");

// Apply auth middleware
router.use(protect);

// POST /task – Add task to column
router.post("/", addTask);

// PATCH /task/:id – Update task
router.patch("/:id", updateTask);

// DELETE /task/:id – Delete task
router.delete("/:id", deleteTask);

module.exports = router;
