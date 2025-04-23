const Board = require("../models/Board");
const Column = require("../models/Column");
const Task = require("../models/Task");

// Get user's board
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ owner: req.user.id })
      .populate({
        path: "columns",
        populate: {
          path: "tasks",
          populate: {
            path: "assignedTo",
            select: "name email",
          },
        },
      })
      .sort({ "columns.order": 1, "columns.tasks.order": 1 });

    if (!board) {
      // Create a new board if none exists
      const newBoard = await Board.create({
        name: "My Board",
        owner: req.user.id,
      });

      // Create default columns
      const columns = await Column.create([
        { title: "To Do", board: newBoard._id, order: 0 },
        { title: "In Progress", board: newBoard._id, order: 1 },
        { title: "Done", board: newBoard._id, order: 2 },
      ]);

      newBoard.columns = columns.map((col) => col._id);
      await newBoard.save();

      return res.json(newBoard);
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching board",
      error: error.message,
    });
  }
};

// Update board
exports.updateBoard = async (req, res) => {
  try {
    const { name, description } = req.body;
    const board = await Board.findOneAndUpdate(
      { owner: req.user.id },
      { name, description },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.json({
      success: true,
      message: "Board updated successfully",
      board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating board",
      error: error.message,
    });
  }
};

// Delete board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ owner: req.user.id });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Delete all tasks in the board's columns
    await Task.deleteMany({ board: board._id });

    // Delete all columns
    await Column.deleteMany({ board: board._id });

    // Delete the board
    await board.remove();

    res.json({
      success: true,
      message: "Board deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting board",
      error: error.message,
    });
  }
};
