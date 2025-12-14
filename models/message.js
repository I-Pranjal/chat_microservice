// models/messageModel.js
const mongoose = require("mongoose");
const User = require("./User"); // Import the same user model

mongoose.model("AuthUser", User.schema); // Register the schema locally

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
