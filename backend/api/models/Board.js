const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "My Board" },
});

module.exports = mongoose.model("Board", boardSchema);
