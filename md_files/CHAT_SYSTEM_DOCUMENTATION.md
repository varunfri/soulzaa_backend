# Production-Ready Chat System Documentation

## Overview

A complete, production-ready chat system with real-time messaging via WebSockets, image/video uploads through ImageKit, and comprehensive chat management features.

---

## Database Schema

### Chat Model (MongoDB)

```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // Array of user IDs
  status: String, // "pending", "accepted", "rejected", "auto_accepted", "blocked"
  requestedBy: ObjectId, // User who initiated the chat
  acceptedAt: Date,
  lastMessage: String,
  lastMessageAt: Date,
  lastMessageType: String, // "text", "image", "video", "file"
  lastSenderId: ObjectId,
  unreadCount: Map<userId, count>, // Track unread messages per user
  isArchived: Boolean,
  blockedBy: ObjectId,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Message Model (MongoDB)

```javascript
{
  _id: ObjectId,
  chatId: ObjectId, // Reference to Chat
  senderId: ObjectId, // Reference to User
  receiverId: ObjectId, // Reference to User
  content: String,
  messageType: String, // "text", "image", "video", "file"
  media: {
    url: String, // ImageKit URL
    fileId: String, // ImageKit file ID
    fileName: String,
    fileSize: Number,
    mimeType: String,
    duration: Number // for videos
  },
  isEdited: Boolean,
  editedAt: Date,
  readBy: [{
    userId: ObjectId,
    readAt: Date
  }],
  deletedBy: [ObjectId], // Users who deleted this message
  replyTo: ObjectId, // Reference to another message (for threading)
  reactions: [{
    userId: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## REST API Endpoints

### Chat Management

#### 1. Get Chat Requests (Pending)

```
GET /api/chats/requests
Headers: Authorization: Bearer <token>
Response: { status: 200, message: "Chat requests fetched successfully", data: [...] }
```

#### 2. Get Active Chats

```
GET /api/chats/active?limit=50&page=1
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Active chats found",
  data: [...],
  pagination: { total: N, page: 1, limit: 50 }
}
```

#### 3. Get Chat Details

```
GET /api/chats/:chatId
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Chat details retrieved",
  data: { ...chat, messageCount: N }
}
```

#### 4. Create or Get Chat with User

```
POST /api/chats/or-create
Headers: Authorization: Bearer <token>
Body: { recipientId: "userId" }
Response: {
  status: 201,
  message: "Chat created/retrieved successfully",
  data: {...}
}
```

#### 5. Accept Chat Request

```
POST /api/chats/:chatId/accept
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Chat request accepted",
  data: {...}
}
```

#### 6. Reject Chat Request

```
POST /api/chats/:chatId/reject
Headers: Authorization: Bearer <token>
Response: { status: 200, message: "Chat request rejected" }
```

#### 7. Block User

```
POST /api/chats/:chatId/block
Headers: Authorization: Bearer <token>
Response: { status: 200, message: "User blocked successfully" }
```

#### 8. Unblock User

```
POST /api/chats/:chatId/unblock
Headers: Authorization: Bearer <token>
Response: { status: 200, message: "User unblocked successfully" }
```

#### 9. Archive/Unarchive Chat

```
POST /api/chats/:chatId/archive
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Chat archived successfully",
  data: {...}
}
```

#### 10. Delete Chat

```
DELETE /api/chats/:chatId
Headers: Authorization: Bearer <token>
Response: { status: 200, message: "Chat deleted successfully" }
```

### Messages

#### 11. Get Chat Messages

```
GET /api/chats/:chatId/messages?limit=50&page=1
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Messages loaded for chatId: ...",
  data: [...],
  chatInfo: { chatId, status, participants },
  pagination: { total: N, page: 1, limit: 50 }
}
```

#### 12. Search Chat Messages

```
GET /api/chats/:chatId/search?q=searchText&limit=20&page=1
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Messages found",
  data: [...],
  pagination: { total: N, page: 1, limit: 20 }
}
```

### Chat History

#### 13. Get User Chat History

```
GET /api/chats/user/:userId/history?limit=50&page=1&includeArchived=false
Response: {
  status: 200,
  message: "Chat history retrieved successfully",
  data: [{ ...chat, messageCount: N }, ...],
  pagination: { total: N, page: 1, limit: 50 }
}
```

### Media Upload

#### 14. Upload Single Media File

```
POST /api/media/upload-chat-media
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: multipart/form-data
Body: 
  - file: <file>
  - chatId: <chatId>
Response: {
  status: 200,
  message: "File uploaded successfully",
  success: true,
  data: {
    url: "imagekit_url",
    fileId: "imagekit_fileId",
    fileName: "filename",
    fileSize: bytes,
    mimeType: "mime/type",
    messageType: "image|video|file",
    uploadedAt: Date
  }
}
```

#### 15. Bulk Upload Multiple Files

```
POST /api/media/bulk-upload
Headers:
  - Authorization: Bearer <token>
  - Content-Type: multipart/form-data
Body:
  - files: <files[]>
  - chatId: <chatId>
Response: {
  status: 200,
  message: "X file(s) uploaded, Y failed",
  success: true,
  data: [...],
  summary: { totalAttempted: N, successful: N, failed: N }
}
```

#### 16. Get Upload Token

```
GET /api/media/get-upload-token
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Upload token generated",
  success: true,
  data: { token, expire, signature, publicKey, urlEndpoint }
}
```

#### 17. Get Media Metadata

```
GET /api/media/:fileId/metadata
Headers: Authorization: Bearer <token>
Response: {
  status: 200,
  message: "Metadata retrieved",
  success: true,
  data: { ...imagekit_metadata }
}
```

#### 18. Delete Media File

```
POST /api/media/delete
Headers: Authorization: Bearer <token>
Body: { fileId: "imagekit_fileId" }
Response: {
  status: 200,
  message: "File deleted successfully",
  success: true
}
```

---

## WebSocket Events (Real-Time)

### Client → Server Events

#### 1. Join Chat Room

```javascript
socket.emit("join_chat", { chatId: "chatId" });
// Response: socket.on("join_chat_success", { chatId, message })
```

#### 2. Leave Chat Room

```javascript
socket.emit("leave_chat", { chatId: "chatId" });
// Response: socket.on("leave_chat_success", { chatId })
```

#### 3. Send Text Message

```javascript
socket.emit("send_message", {
  chatId: "chatId",
  content: "message text",
  replyToId: "messageId" // optional
});
// Response: socket.on("send_message_success", { messageId, timestamp })
```

#### 4. Send Media Message

```javascript
socket.emit("send_media", {
  chatId: "chatId",
  messageType: "image|video|file",
  media: {
    url: "imagekit_url",
    fileId: "fileId",
    fileName: "filename",
    fileSize: bytes,
    mimeType: "mime/type",
    duration: seconds // for videos
  },
  replyToId: "messageId" // optional
});
// Response: socket.on("send_media_success", { messageId, timestamp })
```

#### 5. Mark Messages as Read

```javascript
socket.emit("mark_as_read", {
  messageIds: ["id1", "id2", ...],
  chatId: "chatId"
});
// Response: socket.on("read_success", { messageIds })
```

#### 6. Typing Indicator

```javascript
socket.emit("typing", { chatId: "chatId" });
// No response (broadcast only)
```

#### 7. Stop Typing

```javascript
socket.emit("stop_typing", { chatId: "chatId" });
// No response (broadcast only)
```

#### 8. Edit Message

```javascript
socket.emit("edit_message", {
  messageId: "messageId",
  chatId: "chatId",
  newContent: "updated text"
});
// Response: socket.on("edit_success", { messageId })
```

#### 9. Delete Message

```javascript
socket.emit("delete_message", {
  messageId: "messageId",
  chatId: "chatId"
});
// Response: socket.on("delete_success", { messageId })
```

#### 10. Add Reaction

```javascript
socket.emit("add_reaction", {
  messageId: "messageId",
  chatId: "chatId",
  emoji: "👍"
});
// Response: socket.on("reaction_success", { messageId, emoji })
```

#### 11. Remove Reaction

```javascript
socket.emit("remove_reaction", {
  messageId: "messageId",
  chatId: "chatId",
  emoji: "👍"
});
// Response: socket.on("reaction_removed_success", { messageId, emoji })
```

### Server → Client Events (Broadcast)

#### 1. Message Received

```javascript
socket.on("message_received", {
  messageId, chatId, senderId, receiverId, content,
  messageType, createdAt, replyTo
});
```

#### 2. Media Received

```javascript
socket.on("media_received", {
  messageId, chatId, senderId, receiverId,
  messageType, media, createdAt, replyTo
});
```

#### 3. Messages Read

```javascript
socket.on("messages_read", {
  messageIds, readBy, chatId, timestamp
});
```

#### 4. User Typing

```javascript
socket.on("user_typing", { userId, chatId, timestamp });
```

#### 5. User Stop Typing

```javascript
socket.on("user_stop_typing", { userId, chatId, timestamp });
```

#### 6. Message Edited

```javascript
socket.on("message_edited", {
  messageId, chatId, newContent, editedAt, editedBy
});
```

#### 7. Message Deleted

```javascript
socket.on("message_deleted", {
  messageId, chatId, deletedBy
});
```

#### 8. Reaction Added

```javascript
socket.on("reaction_added", {
  messageId, chatId, userId, emoji, timestamp
});
```

#### 9. Reaction Removed

```javascript
socket.on("reaction_removed", {
  messageId, chatId, userId, emoji, timestamp
});
```

#### 10. User Online

```javascript
socket.on("user_online", { userId, chatId, timestamp });
```

#### 11. User Offline

```javascript
socket.on("user_offline", { userId, chatId, timestamp });
```

#### 12. Unread Message Notification

```javascript
socket.on("unread_message", {
  chatId, unreadCount, lastMessage, senderId
});
```

#### 13. Error Event

```javascript
socket.on("error", { message: "error_message" });
```

---

## Client-Side Implementation Example

### WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://your-server:port', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to server');
});

// Join chat room
socket.emit('join_chat', { chatId: 'chatId123' });

// Send message
socket.emit('send_message', {
  chatId: 'chatId123',
  content: 'Hello!'
});

// Listen for incoming messages
socket.on('message_received', (data) => {
  console.log('New message:', data);
});

// Listen for typing indicator
socket.on('user_typing', (data) => {
  console.log(`${data.userId} is typing...`);
});

// Mark message as read
socket.emit('mark_as_read', {
  messageIds: ['msg1', 'msg2'],
  chatId: 'chatId123'
});
```

### File Upload

```javascript
async function uploadMedia(chatId, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chatId', chatId);

  const response = await fetch('/api/media/upload-chat-media', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  
  if (data.success) {
    // Send media message via socket
    socket.emit('send_media', {
      chatId,
      messageType: data.data.messageType,
      media: data.data
    });
  }
}
```

---

## Features

### ✅ Production-Ready Features

- **Real-time Messaging**: WebSocket-based instant message delivery
- **Media Support**: Image, video, and file uploads via ImageKit
- **Message Status**: Read receipts and delivery confirmations
- **Typing Indicators**: Real-time typing notifications
- **Message Reactions**: Emoji reactions to messages
- **Message Threading**: Reply to specific messages
- **Message Editing**: Edit sent messages
- **Message Deletion**: Soft delete with visibility control
- **Unread Counts**: Track unread messages per user
- **Chat Requests**: Accept/reject chat initiations
- **Block/Unblock**: Block users from sending messages
- **Archive Chats**: Archive conversations
- **Search**: Full-text search on messages
- **Pagination**: Efficient data fetching with pagination
- **Access Control**: Verified access to chat data
- **Error Handling**: Comprehensive error responses
- **Bulk Upload**: Upload multiple files at once
- **File Metadata**: ImageKit integration with file details

### 🔒 Security Features

- JWT token verification
- User access validation
- Soft delete for privacy
- Message deletion tracking
- Blocked user enforcement

### 📊 Performance Optimizations

- Database indexing on key fields
- Memory-efficient socket room management
- Pagination support
- Bulk operations support
- ImageKit CDN integration

---

## Environment Variables Required

```
Image_Kit_Public_Key_Owner=your_public_key
Image_Kit_Private_Key_Owner=your_private_key
Image_Kit_URL=your_imagekit_endpoint
JWT_SECRET=your_jwt_secret
```

---

## Error Handling

All endpoints return consistent error responses:

```javascript
{
  status: 400|403|404|500,
  message: "Error description",
  error: "Error details" // Optional
}
```

---

## Testing Recommendations

1. **Unit Tests**: Test individual socket events
2. **Integration Tests**: Test REST endpoints with auth
3. **Load Tests**: Test with multiple concurrent users
4. **WebSocket Tests**: Use socket.io-client for testing
5. **File Upload Tests**: Test with various file types and sizes

---

## Deployment Notes

1. Ensure MongoDB is running and accessible
2. Configure ImageKit credentials
3. Set JWT_SECRET in environment variables
4. Enable CORS for cross-origin requests
5. Use Redis adapter for Socket.IO in multi-server setups:

   ```javascript
   import { createAdapter } from "@socket.io/redis-adapter";
   io.adapter(createAdapter(pubClient, subClient));
   ```

---

## Future Enhancements

- [ ] End-to-end encryption
- [ ] Voice/video calls
- [ ] Message pinning
- [ ] Chat groups
- [ ] Message forwarding
- [ ] User mention/tagging
- [ ] Rich text formatting
- [ ] Message search with filters
- [ ] Backup and archive download
- [ ] Message reactions statistics

---

This chat system is production-ready with all necessary features for a modern messaging platform.
