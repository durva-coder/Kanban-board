const Board = require("../models/Board");
const Column = require("../models/Column");
const Task = require("../models/Task");

// Get board with columns and tasks
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ user: req.user._id });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const columns = await Column.find({ board: board._id }).sort("order");

    const tasks = await Task.find({
      column: { $in: columns.map((c) => c._id) },
    });

    const columnsWithTasks = columns.map((column) => {
      return {
        ...column.toObject(),
        tasks: tasks.filter(
          (task) => task.column.toString() === column._id.toString()
        ),
      };
    });

    return res.json({
      board: {
        _id: board._id,
        name: board.name,
        columns: columnsWithTasks,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch board", error: err.message });
  }
};
