const Task = require("../models/Task");
const Column = require("../models/Column");

// Add a new task to a column
exports.addTask = async (req, res) => {
  try {
    const { title, description, columnId } = req.body;

    const column = await Column.findById(columnId);
    if (!column) return res.status(404).json({ message: "Column not found" });

    const task = await Task.create({
      title,
      description,
      column: column._id,
    });

    return res.status(201).json({ task });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to add task", error: err.message });
  }
};

// Update a task (e.g., title, description, move column)
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, columnId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (columnId !== undefined) {
      const column = await Column.findById(columnId);
      if (!column)
        return res.status(404).json({ message: "Target column not found" });
      task.column = column._id;
    }

    await task.save();

    return res.json({ task });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to update task", error: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    return res.json({ message: "Task deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete task", error: err.message });
  }
};
