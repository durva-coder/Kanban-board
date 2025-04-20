require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./api/routes/authRoutes");
const boardRoutes = require("./api/routes/boardRoutes");
const columnRoutes = require("./api/routes/columnRoutes");
const taskRoutes = require("./api/routes/taskRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Connection
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// CORS Setup
const corsOptions = {
  origin: "http://localhost:5173", // frontend URL
};
app.use(cors(corsOptions));

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/column", columnRoutes);
app.use("/api/task", taskRoutes);

// View Engine and Static Files
app.set("view engine", "ejs");
app.use(express.static("./public"));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
