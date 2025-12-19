import Chat from "../models/chat.js";
import Message from "../models/message.js";

// ==============================
// 🟩 CONVERSATION CREATION
// ==============================

// Create a one-on-one chat
export const accessChat = async (req, res) => {
  console.log("Request body:", req.body);
  
  // Extract userId - handle both string and nested object formats
  let userId = req.body.userId;
  let loggedInUserId = req.body.loggedInUserId;
  
  // If userId is an object, extract the actual ID
  if (typeof userId === 'object' && userId !== null) {
    userId = userId.userId || userId._id || userId.id;
  }
  
  console.log("Extracted userId:", userId);
  console.log("Initiated by userID : ", loggedInUserId) ;
  console.log("Type:", typeof userId);
  
  try {
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        message: "Target userId is required and must be a string",
        received: req.body.userId,
        hint: "Send request body as: { \"userId\": \"string_id_here\" }"
      });
    }

    // ✅ Ensure logged-in user exists from middleware
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing logged-in user" });
    }

    // ✅ Check for existing chat between the two users
    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [loggedInUserId, userId] },
    }).populate("members", "name contact");

    // ✅ If no chat exists, create a new one
    if (!chat) {
      chat = await Chat.create({
        members: [loggedInUserId, userId],
        createdBy: loggedInUserId,
        isGroupChat: false,
        lastMessage: "",
        unreadCount: {
          [loggedInUserId]: 0,
          [userId]: 0
        }
      });
      
      chat = await Chat.findById(chat._id).populate("members", "name contact");
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error accessing chat:", error.message);
    res.status(500).json({ message: "Error accessing chat", error: error.message });
  }
};

// Create a group conversation with multiple participants
export const createGroupChat = async (req, res) => {
  const { name, members, description } = req.body;

  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    // Validate input
    if (!name || !members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ 
        message: "Group name and at least 2 members are required" 
      });
    }

    // Add creator to members if not already included
    const allMembers = [...new Set([loggedInUserId, ...members])];

    // Initialize unread count for all members
    const unreadCount = {};
    allMembers.forEach(memberId => {
      unreadCount[memberId] = 0;
    });

    // Create group chat
    const groupChat = await Chat.create({
      name,
      description: description || "",
      isGroupChat: true,
      members: allMembers,
      admins: [loggedInUserId], // Creator is admin by default
      createdBy: loggedInUserId,
      lastMessage: "",
      unreadCount
    });

    const populatedChat = await Chat.findById(groupChat._id)
      .populate("members", "name contact")
      .populate("admins", "name contact")
      .populate("createdBy", "name contact");

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ message: "Error creating group chat", error: error.message });
  }
};

// ==============================
// 🟩 PARTICIPANT MANAGEMENT
// ==============================

// Add participants to a group chat
export const addParticipants = async (req, res) => {
  const { chatId, userIds } = req.body;

  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    if (!chatId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "chatId and userIds array are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Authorization check: Only group chat admins can add participants
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: "Cannot add participants to one-on-one chat" });
    }

    if (!chat.admins.includes(loggedInUserId)) {
      return res.status(403).json({ message: "Only admins can add participants" });
    }

    // Add new members and initialize their unread count
    const newMembers = userIds.filter(id => !chat.members.includes(id));
    chat.members.push(...newMembers);

    newMembers.forEach(memberId => {
      chat.unreadCount.set(memberId, 0);
    });

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("members", "name contact")
      .populate("admins", "name contact");

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error adding participants:", error);
    res.status(500).json({ message: "Error adding participants", error: error.message });
  }
};

// Remove a participant from a group chat
export const removeParticipant = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Authorization check
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: "Cannot remove participants from one-on-one chat" });
    }

    // Check if user is admin or removing themselves
    const isAdmin = chat.admins.includes(loggedInUserId);
    const isSelfRemoval = userId === loggedInUserId;

    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ message: "Only admins can remove other participants" });
    }

    // Remove member
    chat.members = chat.members.filter(id => id.toString() !== userId);
    chat.admins = chat.admins.filter(id => id.toString() !== userId);
    chat.unreadCount.delete(userId);

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("members", "name contact")
      .populate("admins", "name contact");

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ message: "Error removing participant", error: error.message });
  }
};

// Make a user an admin of the group chat
export const makeAdmin = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Authorization check
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: "Cannot manage admins in one-on-one chat" });
    }

    if (!chat.admins.includes(loggedInUserId)) {
      return res.status(403).json({ message: "Only admins can make other users admins" });
    }

    // Check if user is a member
    if (!chat.members.includes(userId)) {
      return res.status(400).json({ message: "User is not a member of this chat" });
    }

    // Add to admins if not already
    if (!chat.admins.includes(userId)) {
      chat.admins.push(userId);
      await chat.save();
    }

    const updatedChat = await Chat.findById(chatId)
      .populate("members", "name contact")
      .populate("admins", "name contact");

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error making admin:", error);
    res.status(500).json({ message: "Error making admin", error: error.message });
  }
};

// ==============================
// 🟩 CONVERSATION METADATA
// ==============================

// Fetch all chats for the logged-in user with metadata
export const fetchChats = async (req, res) => {
  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const chats = await Chat.find({ members: loggedInUserId })
      .populate("members", "name contact")
      .populate("admins", "name contact")
      .populate("lastMessageBy", "name")
      .sort({ updatedAt: -1 });

    // Format response with unread count for the user
    const formattedChats = chats.map(chat => {
      const chatObj = chat.toObject();
      chatObj.myUnreadCount = chat.unreadCount.get(loggedInUserId) || 0;
      return chatObj;
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
};

// Get conversation details with metadata
export const getChatDetails = async (req, res) => {
  const { chatId } = req.params;

  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const chat = await Chat.findById(chatId)
      .populate("members", "name contact")
      .populate("admins", "name contact")
      .populate("createdBy", "name contact")
      .populate("lastMessageBy", "name");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Authorization check: User must be a member
    if (!chat.members.some(member => member._id.toString() === loggedInUserId)) {
      return res.status(403).json({ message: "Access denied: Not a member of this chat" });
    }

    // Add user's unread count
    const chatObj = chat.toObject();
    chatObj.myUnreadCount = chat.unreadCount.get(loggedInUserId) || 0;

    res.status(200).json(chatObj);
  } catch (error) {
    console.error("Error fetching chat details:", error);
    res.status(500).json({ message: "Error fetching chat details" });
  }
};

// Mark messages as read (reset unread count)
export const markAsRead = async (req, res) => {
  const { chatId } = req.body;

  try {
    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Authorization check
    if (!chat.members.includes(loggedInUserId)) {
      return res.status(403).json({ message: "Access denied: Not a member of this chat" });
    }

    // Reset unread count for this user
    chat.unreadCount.set(loggedInUserId, 0);
    await chat.save();

    res.status(200).json({ message: "Messages marked as read", unreadCount: 0 });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
};

// ==============================
// 🟩 MESSAGING
// ==============================

// Send message to a chat
export const sendMessage = async (req, res) => {
  const { chatId, text } = req.body;

  try {
    if (!chatId || !text) {
      return res.status(400).json({ message: "chatId and text are required" });
    }

    const senderId = req.user?.userId;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    // Authorization check: Verify user is a member
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.members.includes(senderId)) {
      return res.status(403).json({ message: "Access denied: Not a member of this chat" });
    }

    // Create message
    const message = await Message.create({
      chatId,
      sender: senderId,
      text,
    });

    // Update chat metadata and increment unread count for other members
    chat.members.forEach(memberId => {
      const memberIdStr = memberId.toString();
      if (memberIdStr !== senderId) {
        const currentCount = chat.unreadCount.get(memberIdStr) || 0;
        chat.unreadCount.set(memberIdStr, currentCount + 1);
      }
    });

    chat.lastMessage = text;
    chat.lastMessageTime = new Date();
    chat.lastMessageBy = senderId;
    chat.updatedAt = Date.now();

    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name contact");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Get all messages in a chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    const loggedInUserId = req.user?.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    // Authorization check: Verify user is a member
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" }); 
    }

    if (!chat.members.includes(loggedInUserId)) {
      return res.status(403).json({ message: "Access denied: Not a member of this chat" });
    }

    const messages = await Message.find({ chatId })  
      .populate("sender", "name contact")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};
