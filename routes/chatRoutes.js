import express from "express";
import auth from "../middleware/authMiddleware.js";
import { 
  // Conversation creation
  accessChat, 
  createGroupChat,
  
  // Participant management
  addParticipants,
  removeParticipant,
  makeAdmin,
  
  // Conversation metadata
  fetchChats, 
  getChatDetails,
  markAsRead,
  
  // Messaging
  sendMessage, 
  getMessages
} from "../controllers/chatController.js";

const router = express.Router();

// ==============================
// CONVERSATION CREATION ROUTES
// ==============================
// Create or access one-on-one chat
router.post("/", auth, accessChat);

// Create group chat with multiple participants
router.post("/group", createGroupChat);

// ==============================
// PARTICIPANT MANAGEMENT ROUTES
// ==============================
// Add participants to group chat
router.post("/group/add-participants", addParticipants);

// Remove participant from group chat
router.post("/group/remove-participant", removeParticipant);

// Make a user admin of group chat
router.post("/group/make-admin", makeAdmin);

// ==============================
// CONVERSATION METADATA ROUTES
// ==============================
// Get all chats for logged-in user with metadata
router.get("/", fetchChats);

// Get specific chat details with metadata
router.get("/:chatId", getChatDetails);

// Mark chat messages as read (reset unread count)
router.post("/mark-read", markAsRead);

// ==============================
// MESSAGING ROUTES
// ==============================
// Send message to a chat
router.post("/message", sendMessage);

// Get all messages in a chat
router.get("/message/:chatId", getMessages);

export default router;
