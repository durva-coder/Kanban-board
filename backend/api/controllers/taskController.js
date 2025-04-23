const Task = require("../models/Task");
const Column = require("../models/Column");
const Board = require("../models/Board");

// Add new task
exports.addTask = async (req, res) => {
  try {
    const { title, description, columnId } = req.body;
    const board = await Board.findOne({ owner: req.user.id });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const column = await Column.findOne({
      _id: columnId,
      board: board._id,
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    // Get the highest order number in the column
    const lastTask = await Task.findOne({ column: columnId })
      .sort({ order: -1 })
      .limit(1);

    const task = await Task.create({
      title,
      description,
      column: columnId,
      board: board._id,
      assignedTo: req.user.id,
    });

    column.tasks.push(task._id);
    await column.save();

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding task",
      error: error.message,
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, columnId } = req.body;

    const board = await Board.findOne({ owner: req.user.id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Find the task first (before updating)
    const task = await Task.findOne({ _id: taskId, board: board._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const previousColumnId = task.column.toString();

    // Update task fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.column = columnId || task.column;

    await task.save();

    // If column changed, update both old and new columns
    if (columnId && columnId !== previousColumnId) {
      const oldColumn = await Column.findById(previousColumnId);
      const newColumn = await Column.findById(columnId);

      if (oldColumn) {
        oldColumn.tasks = oldColumn.tasks.filter(
          (id) => id.toString() !== task._id.toString()
        );
        await oldColumn.save();
      }

      if (newColumn && !newColumn.tasks.includes(task._id)) {
        newColumn.tasks.push(task._id);
        await newColumn.save();
      }
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const board = await Board.findOne({ owner: req.user.id });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      board: board._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Remove task from column
    const column = await Column.findById(task.column);
    if (column) {
      column.tasks = column.tasks.filter(
        (taskId) => taskId.toString() !== task._id.toString()
      );
      await column.save();
    }

    // Delete the task
    await task.deleteOne();

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};

// Reorder tasks
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    const board = await Board.findOne({ owner: req.user.id });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Update order for each task
    await Promise.all(
      tasks.map(async (task) => {
        await Task.findByIdAndUpdate(task._id, {
          order: task.order,
          column: task.columnId,
        });
      })
    );

    res.json({
      success: true,
      message: "Tasks reordered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reordering tasks",
      error: error.message,
    });
  }
};
