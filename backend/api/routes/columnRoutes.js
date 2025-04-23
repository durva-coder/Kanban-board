const express = require("express");
const router = express.Router();
const {
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} = require("../controllers/columnController");
const protect = require("../middleware/auth");

// Apply auth middleware to all column routes
router.use(protect);

// POST /column - Add new column
router.post("/", addColumn);

// PUT /column/:columnId - Update column
router.put("/:columnId", updateColumn);

// DELETE /column/:columnId - Delete column
router.delete("/:columnId", deleteColumn);

// PUT /column/reorder - Reorder columns
router.put("/reorder", reorderColumns);

module.exports = router;
