const Board = require("../models/Board");
const Column = require("../models/Column");

exports.addColumn = async (req, res) => {
  try {
    const { name, order } = req.body;

    // Get user's board
    const board = await Board.findOne({ user: req.user._id });

    if (!board) return res.status(404).json({ message: "Board not found" });

    // Create new column
    const column = await Column.create({
      name,
      board: board._id,
      order: order ?? Date.now(), // optional ordering
    });

    return res.status(201).json({ column });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to create column", error: err.message });
  }
};
