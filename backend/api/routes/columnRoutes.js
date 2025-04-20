const express = require("express");
const router = express.Router();
const { addColumn } = require("../controllers/columnController");
const protect = require("../middleware/auth");

// Protect all column routes
router.use(protect);

// POST /column – Add new column to user's board
router.post("/", addColumn);

module.exports = router;
