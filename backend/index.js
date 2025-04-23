const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const authRoutes = require("./api/routes/authRoutes");
const boardRoutes = require("./api/routes/boardRoutes");
const columnRoutes = require("./api/routes/columnRoutes");
const taskRoutes = require("./api/routes/taskRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/column", columnRoutes);
app.use("/api/task", taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
