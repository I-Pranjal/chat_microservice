// models/chatModel.js
const mongoose = require("mongoose");
const User = require("./User"); // import the same schema

mongoose.model("AuthUser", User.schema); // register it manually

const chatSchema = new mongoose.Schema(
  {
    // Basic conversation info
    name: { type: String, trim: true }, // For group chats
    isGroupChat: { type: Boolean, default: false },
    
    // Participants management
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuthUser" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuthUser" }], // Group chat admins
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser" },
    
    // Conversation metadata
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date },
    lastMessageBy: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser" },
    
    // Unread count per user
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    
    // Additional metadata
    description: { type: String, trim: true },
    avatar: { type: String }, // Group chat avatar
  },
  { timestamps: true }
);

// Index for faster queries
chatSchema.index({ members: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
