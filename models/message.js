// models/messageModel.js
import mongoose from "mongoose";
import User from "./User.js"; // Import the same user model

mongoose.model("AuthUser", User.schema); // Register the schema locally

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
