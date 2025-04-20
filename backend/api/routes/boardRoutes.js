const express = require("express");
const router = express.Router();
const { getBoard } = require("../controllers/boardController");
const protect = require("../middleware/auth");

// Apply middleware to all board routes
router.use(protect);

// GET /board - Get the user's board with columns and tasks
router.get("/", getBoard);

module.exports = router;
