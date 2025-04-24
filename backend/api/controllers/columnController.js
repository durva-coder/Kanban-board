const Column = require("../models/Column");
const Board = require("../models/Board");
const Task = require("../models/Task");

// Add new column
exports.addColumn = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findOne({ owner: req.user.id });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Get the highest order number
    const lastColumn = await Column.findOne({ board: board._id })
      .sort({ order: -1 })
      .limit(1);

    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = await Column.create({
      title,
      board: board._id,
      order,
    });

    board.columns.push(column._id);
    await board.save();

    res.status(201).json({
      success: true,
      message: "Column added successfully",
      column,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding column",
      error: error.message,
    });
  }
};

// Update column
exports.updateColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, order } = req.body;

    const column = await Column.findOneAndUpdate(
      {
        _id: columnId,
        board: { $in: await Board.find({ owner: req.user.id }).select("_id") },
      },
      { title, order },
      { new: true }
    );

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    res.json({
      success: true,
      message: "Column updated successfully",
      column,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating column",
      error: error.message,
    });
  }
};

// Delete column
exports.deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
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

    // Delete all tasks in the column
    await Task.deleteMany({ column: column._id });

    // Remove column from board
    board.columns = board.columns.filter(
      (colId) => colId.toString() !== columnId
    );
    await board.save();

    // Delete the column
    await Column.deleteOne({ _id: column._id });

    res.json({
      success: true,
      message: "Column deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting column",
      error: error.message,
    });
  }
};

// Reorder columns
exports.reorderColumns = async (req, res) => {
  try {
    const { columns } = req.body;
    const board = await Board.findOne({ owner: req.user.id });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Update order for each column
    await Promise.all(
      columns.map(async (col) => {
        await Column.findByIdAndUpdate(col._id, { order: col.order });
      })
    );

    res.json({
      success: true,
      message: "Columns reordered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reordering columns",
      error: error.message,
    });
  }
};
