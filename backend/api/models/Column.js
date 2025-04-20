const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("Column", columnSchema);
