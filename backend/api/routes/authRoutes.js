const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  isAuthenticated,
} = require("../controllers/authController");

// POST /signup
router.post("/signup", signup);

// POST /login
router.post("/login", login);

// GET /is-authenticated
router.get("/is-authenticated", isAuthenticated);

module.exports = router;
