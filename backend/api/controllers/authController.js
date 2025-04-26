const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const mongoose = require("mongoose");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Signup
exports.signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create([{ name, email, password }], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(user[0]._id);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: "Signup failed",
      error: err.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Check if user is authenticated
exports.isAuthenticated = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.json({
        isAuthenticated: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user to ensure they still exist in database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.json({
        isAuthenticated: false,
        message: "User not found",
      });
    }

    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.json({
      isAuthenticated: false,
      message: "Invalid token",
    });
  }
};
