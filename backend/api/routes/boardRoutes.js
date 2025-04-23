const express = require("express");
const router = express.Router();
const {
  getBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController");
const protect = require("../middleware/auth");

// Apply auth middleware to all board routes
router.use(protect);

// GET /board - Get user's board
router.get("/", getBoard);

// PUT /board - Update board
router.put("/", updateBoard);

// DELETE /board - Delete board
router.delete("/", deleteBoard);

module.exports = router;
