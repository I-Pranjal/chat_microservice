# Chat Service Microservice

A comprehensive chat microservice built with Node.js, Express, and MongoDB. This service provides real-time messaging capabilities with support for one-on-one and group conversations, participant management, conversation metadata tracking, and authorization controls.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [Testing with Thunder Client](#testing-with-thunder-client)

---

## ✨ Features

- **Conversation Creation**
  - One-on-one chats
  - Group chats with multiple participants
  
- **Participant Management**
  - Add/remove participants from group chats
  - Admin role management
  - Authorization-based access control
  
- **Conversation Metadata**
  - Last message tracking
  - Unread message count per user
  - Conversation details and timestamps
  
- **Messaging**
  - Send and receive messages
  - Fetch chat history
  - Message ordering (chronological)
  - Message persistence in MongoDB
  
- **Authorization & Security**
  - JWT-based authentication
  - Role-based access control
  - Membership verification for all operations

---

## 🔧 Prerequisites

Before running the chat service, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** (comes with Node.js)

---

## 📦 Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd c:\Users\12345\Desktop\Web_development_projects\chatt\chatservice
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - The `.env` file should already exist in the root directory
   - Verify it contains the required variables (see [Environment Variables](#environment-variables))

---

## 🌍 Environment Variables

Create or verify the `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/chatt

# JWT Secret for authentication
JWT_SECRET=qwertyuiopkjhgfdsazxcvbnm

# Server Port (optional, defaults to 5003)
PORT=5003
```

---

## 🚀 Running the Service

### Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or run manually
mongod
```

### Start the Chat Service

**Option 1: Production Mode**
```bash
npm start
```

**Option 2: Development Mode (with auto-reload)**
```bash
npm run dev
```

The service will start on **`http://localhost:5003`** (or the port specified in your `.env` file).

You should see:
```
Chat Service running on port 5003
MongoDB connected successfully
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5003/api/chats
```

### Authentication
All endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📡 Endpoint Documentation

### 1. Conversation Creation

#### **Create/Access One-on-One Chat**
Creates a new chat or returns an existing one between two users.

```http
POST /api/chats
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "6759xxxxxxxxxxxxx"
}
```

**Response (200):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "members": [
    {
      "_id": "6759xxxxxxxxxxxxx",
      "name": "John Doe",
      "contact": "john@example.com"
    },
    {
      "_id": "6759xxxxxxxxxxxxx",
      "name": "Jane Smith",
      "contact": "jane@example.com"
    }
  ],
  "isGroupChat": false,
  "lastMessage": "",
  "unreadCount": {},
  "createdAt": "2025-12-14T10:00:00.000Z",
  "updatedAt": "2025-12-14T10:00:00.000Z"
}
```

---

#### **Create Group Chat**
Creates a new group conversation with multiple participants.

```http
POST /api/chats/group
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Project Team",
  "description": "Discussion about the new project",
  "members": ["6759xxxxxxxxxxxxx", "6759xxxxxxxxxxxxx", "6759xxxxxxxxxxxxx"]
}
```

**Response (201):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "name": "Project Team",
  "description": "Discussion about the new project",
  "isGroupChat": true,
  "members": [...],
  "admins": [...],
  "createdBy": {...},
  "lastMessage": "",
  "unreadCount": {},
  "createdAt": "2025-12-14T10:00:00.000Z",
  "updatedAt": "2025-12-14T10:00:00.000Z"
}
```

---

### 2. Participant Management

#### **Add Participants to Group**
Add new members to an existing group chat (admin only).

```http
POST /api/chats/group/add-participants
```

**Body:**
```json
{
  "chatId": "6759xxxxxxxxxxxxx",
  "userIds": ["6759xxxxxxxxxxxxx", "6759xxxxxxxxxxxxx"]
}
```

**Response (200):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "name": "Project Team",
  "members": [...],
  "admins": [...]
}
```

---

#### **Remove Participant from Group**
Remove a member from a group chat (admin only, or users can remove themselves).

```http
POST /api/chats/group/remove-participant
```

**Body:**
```json
{
  "chatId": "6759xxxxxxxxxxxxx",
  "userId": "6759xxxxxxxxxxxxx"
}
```

**Response (200):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "name": "Project Team",
  "members": [...]
}
```

---

#### **Make User Admin**
Promote a group member to admin status (admin only).

```http
POST /api/chats/group/make-admin
```

**Body:**
```json
{
  "chatId": "6759xxxxxxxxxxxxx",
  "userId": "6759xxxxxxxxxxxxx"
}
```

**Response (200):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "admins": [...]
}
```

---

### 3. Conversation Metadata

#### **Get All Chats**
Retrieve all conversations for the logged-in user, sorted by most recent activity.

```http
GET /api/chats
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "6759xxxxxxxxxxxxx",
    "name": "Project Team",
    "isGroupChat": true,
    "members": [...],
    "lastMessage": "Hello everyone!",
    "lastMessageTime": "2025-12-14T10:30:00.000Z",
    "lastMessageBy": {...},
    "myUnreadCount": 5,
    "updatedAt": "2025-12-14T10:30:00.000Z"
  },
  ...
]
```

---

#### **Get Chat Details**
Get detailed information about a specific conversation.

```http
GET /api/chats/:chatId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "name": "Project Team",
  "description": "Project discussion",
  "isGroupChat": true,
  "members": [...],
  "admins": [...],
  "createdBy": {...},
  "lastMessage": "Hello!",
  "lastMessageTime": "2025-12-14T10:30:00.000Z",
  "lastMessageBy": {...},
  "myUnreadCount": 5,
  "createdAt": "2025-12-14T10:00:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

---

#### **Mark Messages as Read**
Reset the unread message count for the logged-in user in a specific chat.

```http
POST /api/chats/mark-read
```

**Body:**
```json
{
  "chatId": "6759xxxxxxxxxxxxx"
}
```

**Response (200):**
```json
{
  "message": "Messages marked as read",
  "unreadCount": 0
}
```

---

### 4. Messaging

#### **Send Message**
Send a new message to a chat conversation.

```http
POST /api/chats/message
```

**Body:**
```json
{
  "chatId": "6759xxxxxxxxxxxxx",
  "text": "Hello, this is a test message!"
}
```

**Response (201):**
```json
{
  "_id": "6759xxxxxxxxxxxxx",
  "chatId": "6759xxxxxxxxxxxxx",
  "sender": {
    "_id": "6759xxxxxxxxxxxxx",
    "name": "John Doe",
    "contact": "john@example.com"
  },
  "text": "Hello, this is a test message!",
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

---

#### **Get Messages (Chat History)**
Retrieve all messages from a specific conversation, ordered chronologically.

```http
GET /api/chats/message/:chatId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "6759xxxxxxxxxxxxx",
    "chatId": "6759xxxxxxxxxxxxx",
    "sender": {
      "_id": "6759xxxxxxxxxxxxx",
      "name": "John Doe",
      "contact": "john@example.com"
    },
    "text": "Hello!",
    "createdAt": "2025-12-14T10:00:00.000Z",
    "updatedAt": "2025-12-14T10:00:00.000Z"
  },
  {
    "_id": "6759xxxxxxxxxxxxx",
    "chatId": "6759xxxxxxxxxxxxx",
    "sender": {
      "_id": "6759xxxxxxxxxxxxx",
      "name": "Jane Smith",
      "contact": "jane@example.com"
    },
    "text": "Hi there!",
    "createdAt": "2025-12-14T10:01:00.000Z",
    "updatedAt": "2025-12-14T10:01:00.000Z"
  }
]
```

---

## 🧪 Testing with Thunder Client

### Setup Steps

1. **Install Thunder Client** extension in VS Code (if not already installed)

2. **Get a JWT Token:**
   - First, authenticate through your auth service to get a JWT token
   - Example: `POST http://localhost:<auth-port>/api/auth/login`

3. **Create a Collection** in Thunder Client for organizing your requests

4. **Set Environment Variables** (optional):
   - `baseUrl`: `http://localhost:5003/api/chats`
   - `token`: `<your-jwt-token>`

### Testing Flow

**Step 1: Create a Chat**
```
POST {{baseUrl}}/
Headers: Authorization: Bearer {{token}}
Body: { "userId": "6759xxxxxxxxxxxxx" }
```

**Step 2: Send Messages**
```
POST {{baseUrl}}/message
Headers: Authorization: Bearer {{token}}
Body: {
  "chatId": "6759xxxxxxxxxxxxx",
  "text": "Hello!"
}
```

**Step 3: Get Messages**
```
GET {{baseUrl}}/message/6759xxxxxxxxxxxxx
Headers: Authorization: Bearer {{token}}
```

**Step 4: Create Group Chat**
```
POST {{baseUrl}}/group
Headers: Authorization: Bearer {{token}}
Body: {
  "name": "Team Chat",
  "members": ["user1", "user2", "user3"]
}
```

**Step 5: Manage Participants**
```
POST {{baseUrl}}/group/add-participants
Headers: Authorization: Bearer {{token}}
Body: {
  "chatId": "6759xxxxxxxxxxxxx",
  "userIds": ["newUser1", "newUser2"]
}
```

---

## 📝 Error Responses

All endpoints return standard HTTP status codes:

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (invalid input)
- **401**: Unauthorized (invalid or missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **500**: Internal server error

**Example Error Response:**
```json
{
  "message": "Access denied: Not a member of this chat"
}
```

---

## 🗄️ Database Models

### Chat Model
```javascript
{
  name: String,
  description: String,
  isGroupChat: Boolean,
  members: [ObjectId],
  admins: [ObjectId],
  createdBy: ObjectId,
  lastMessage: String,
  lastMessageTime: Date,
  lastMessageBy: ObjectId,
  unreadCount: Map<String, Number>,
  avatar: String,
  timestamps: true
}
```

### Message Model
```javascript
{
  chatId: ObjectId,
  sender: ObjectId,
  text: String,
  timestamps: true
}
```

---

## 🔒 Authorization Rules

- **All endpoints** require valid JWT authentication
- **Group management** (add/remove participants, make admin) requires admin role
- **Sending messages** requires membership in the chat
- **Viewing messages** requires membership in the chat
- **Self-removal** from groups is allowed for all members

---

## 🛠️ Project Structure

```
chatservice/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── chatController.js  # Business logic
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── models/
│   ├── chat.js            # Chat schema
│   ├── message.js         # Message schema
│   └── User.js            # User schema reference
├── routes/
│   └── chatRoutes.js      # API routes
├── .env                   # Environment variables
├── package.json           # Dependencies
├── server.js              # Entry point
└── README.md              # This file
```

---

## 📞 Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

## 📄 License

This project is part of a larger chat application system.