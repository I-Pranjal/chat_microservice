// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const chatRoutes = require("./routes/chatRoutes.js");
const auth =  require("./middleware/authMiddleware.js");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get("/", (req, res) => {
  res.send("Chat Service is running");
});

// API Routes
app.use("/api/chats", auth, chatRoutes);

// Start Server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Chat Service running on port ${PORT}`));
