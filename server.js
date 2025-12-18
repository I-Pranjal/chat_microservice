// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import auth from "./middleware/authMiddleware.js";

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
