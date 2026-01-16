# Chat System Integration Guide

## Quick Start - 5 Minutes ⚡

### Step 1: Configure Environment

```bash
# Edit .env file and add:
Image_Kit_Public_Key_Owner=your_imagekit_public_key
Image_Kit_Private_Key_Owner=your_imagekit_private_key
Image_Kit_URL=https://your-imagekit-endpoint.imagekit.io
JWT_SECRET=your_jwt_secret_key
```

### Step 2: Start Server

```bash
npm run dev
# Server running on http://localhost:8000
```

### Step 3: Test Connection

```bash
# In another terminal, test an endpoint:
curl http://localhost:8000/api/chats/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

✅ **Done!** Chat system is running.

---

## Backend Integration - 15 Minutes

### Already Integrated

- ✅ Routes in `app.js`
- ✅ Socket handlers in `server.js`
- ✅ Database schemas
- ✅ Controllers
- ✅ Middleware

### Nothing More Needed on Backend

All files are already connected and working.

---

## Frontend Integration - 30 Minutes

### Option 1: Quick Start (Copy-Paste)

```javascript
// 1. Import the client class
import { ChatClient, ChatRoom, Message, MediaUploader, ChatAPI } from 'CHAT_CLIENT_EXAMPLE.js';

// 2. Initialize
const token = 'your-jwt-token';
const chatClient = new ChatClient('http://localhost:8000', token);
await chatClient.connect();

// 3. Get active chats
const api = new ChatAPI('http://localhost:8000', token);
const chats = await api.getActiveChats();

// 4. Join a chat
const room = new ChatRoom(chatClient, chats.data[0]._id);
await room.join();

// 5. Send a message
const messageHandler = new Message(chatClient, chats.data[0]._id);
await messageHandler.sendText('Hello!');

// 6. Listen to messages
room.onMessage((msg) => {
  console.log('New message:', msg);
});
```

### Option 2: Vue.js Integration

```vue
<template>
  <div class="chat">
    <div class="messages">
      <div v-for="msg in messages" :key="msg._id">
        {{ msg.content }}
      </div>
    </div>
    <input v-model="inputText" @keypress.enter="sendMessage" />
  </div>
</template>

<script>
import { ChatClient, ChatRoom, Message, ChatAPI } from 'CHAT_CLIENT_EXAMPLE.js';

export default {
  data() {
    return {
      chatClient: null,
      chatRoom: null,
      messageHandler: null,
      messages: [],
      inputText: '',
      chatId: null
    };
  },
  mounted() {
    this.initChat();
  },
  methods: {
    async initChat() {
      // Connect
      this.chatClient = new ChatClient('http://localhost:8000', this.$store.state.token);
      await this.chatClient.connect();

      // Get chats
      const api = new ChatAPI('http://localhost:8000', this.$store.state.token);
      const chats = await api.getActiveChats();
      this.chatId = chats.data[0]._id;

      // Load messages
      const messages = await api.getChatMessages(this.chatId);
      this.messages = messages.data;

      // Join room
      this.chatRoom = new ChatRoom(this.chatClient, this.chatId);
      await this.chatRoom.join();

      // Listen to messages
      this.chatRoom.onMessage((msg) => {
        this.messages.push(msg);
      });

      // Initialize message handler
      this.messageHandler = new Message(this.chatClient, this.chatId);
    },
    async sendMessage() {
      if (!this.inputText.trim()) return;
      
      await this.messageHandler.sendText(this.inputText);
      this.inputText = '';
    }
  }
};
</script>
```

### Option 3: React Integration

```jsx
import React, { useEffect, useState } from 'react';
import { ChatClient, ChatRoom, Message, ChatAPI } from 'CHAT_CLIENT_EXAMPLE.js';

export function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatClient, setChatClient] = useState(null);
  const [messageHandler, setMessageHandler] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    // Initialize client
    const client = new ChatClient('http://localhost:8000', token);
    await client.connect();
    setChatClient(client);

    // Get active chats
    const api = new ChatAPI('http://localhost:8000', token);
    const chats = await api.getActiveChats();
    const chatId = chats.data[0]._id;

    // Load messages
    const msgs = await api.getChatMessages(chatId);
    setMessages(msgs.data);

    // Join room
    const room = new ChatRoom(client, chatId);
    await room.join();

    // Listen to messages
    room.onMessage((msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Initialize message handler
    const msgHandler = new Message(client, chatId);
    setMessageHandler(msgHandler);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !messageHandler) return;
    
    await messageHandler.sendText(inputText);
    setInputText('');
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg._id} className="message">
            {msg.content}
          </div>
        ))}
      </div>
      <input
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
```

### Option 4: Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
    <div id="messages"></div>
    <input id="messageInput" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>

    <script type="module">
        import { ChatClient, ChatRoom, Message } from './CHAT_CLIENT_EXAMPLE.js';

        const token = localStorage.getItem('token');
        const chatId = 'your-chat-id';
        
        let messageHandler;

        async function initChat() {
            const client = new ChatClient('http://localhost:8000', token);
            await client.connect();

            const room = new ChatRoom(client, chatId);
            await room.join();

            messageHandler = new Message(client, chatId);

            room.onMessage(msg => {
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML += `<p>${msg.content}</p>`;
            });
        }

        async function sendMessage() {
            const input = document.getElementById('messageInput');
            await messageHandler.sendText(input.value);
            input.value = '';
        }

        initChat();
    </script>
</body>
</html>
```

---

## Testing the Integration

### 1. Start Server

```bash
npm run dev
```

### 2. Test REST API

```bash
# Get active chats
curl http://localhost:8000/api/chats/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test WebSocket

```javascript
// Open browser console and run:
const token = 'YOUR_TOKEN';
const socket = io('http://localhost:8000', { auth: { token } });

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('join_chat', { chatId: 'CHAT_ID' });
});

socket.on('message_received', (data) => {
  console.log('New message:', data);
});
```

### 4. Test Media Upload

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('chatId', 'CHAT_ID');

fetch('http://localhost:8000/api/media/upload-chat-media', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json()).then(data => console.log(data));
```

---

## Common Issues & Solutions

### Issue: "Socket connection failed"

**Solution:**

```javascript
// Check token is valid
const socket = io('http://localhost:8000', {
  auth: { token: 'YOUR_VALID_JWT_TOKEN' }
});
```

### Issue: "Cannot POST /api/chats/or-create"

**Solution:**

- Ensure server is running: `npm run dev`
- Check route is registered in `app.js`
- Verify Authorization header is set

### Issue: "File upload failed"

**Solution:**

```javascript
// Check ImageKit credentials
console.log(process.env.Image_Kit_URL);
console.log(process.env.Image_Kit_Public_Key_Owner);
```

### Issue: "Messages not received in real-time"

**Solution:**

```javascript
// Ensure you're in the right room
socket.emit('join_chat', { chatId: 'CORRECT_CHAT_ID' });
```

---

## API Reference Quick Lookup

### Create Chat

```bash
curl -X POST http://localhost:8000/api/chats/or-create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"USER_ID"}'
```

### Get Messages

```bash
curl http://localhost:8000/api/chats/CHAT_ID/messages \
  -H "Authorization: Bearer TOKEN"
```

### Upload File

```bash
curl -X POST http://localhost:8000/api/media/upload-chat-media \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.jpg" \
  -F "chatId=CHAT_ID"
```

### Send Message (WebSocket)

```javascript
socket.emit('send_message', {
  chatId: 'CHAT_ID',
  content: 'Hello!'
});
```

### Listen to Messages (WebSocket)

```javascript
socket.on('message_received', (data) => {
  console.log('New message:', data);
});
```

---

## Component Usage Examples

### Chat List Component

```javascript
async function loadChatList() {
  const api = new ChatAPI('http://localhost:8000', token);
  const chats = await api.getActiveChats();
  return chats.data;
}
```

### Single Chat Component

```javascript
async function loadChat(chatId) {
  const api = new ChatAPI('http://localhost:8000', token);
  
  // Get chat details
  const chat = await api.getChatDetails(chatId);
  
  // Get messages
  const messages = await api.getChatMessages(chatId);
  
  return { chat, messages };
}
```

### File Upload Component

```javascript
async function handleFileUpload(file, chatId) {
  const uploader = new MediaUploader('http://localhost:8000', token);
  const media = await uploader.uploadFile(file, chatId);
  
  // Send as message
  socket.emit('send_media', {
    chatId,
    messageType: media.messageType,
    media
  });
}
```

---

## Debugging Tips

### Enable Verbose Logging

```javascript
// Client side
socket.on('*', (event, ...args) => {
  console.log(`Event: ${event}`, args);
});
```

### Check Server Logs

```bash
# Terminal will show:
✅ User abc123 connected with socket xyz
📨 New message: Hello!
```

### Monitor Network

```javascript
// Open DevTools → Network tab
// Filter by "WS" to see WebSocket messages
// Filter by "api" to see REST API calls
```

---

## Deployment Checklist

- [ ] Set environment variables
- [ ] Configure ImageKit
- [ ] Set JWT_SECRET
- [ ] Run server: `npm run dev`
- [ ] Test chat creation
- [ ] Test message sending
- [ ] Test file upload
- [ ] Test WebSocket connection
- [ ] Test in production domain
- [ ] Configure CORS for production domain

---

## Next Steps

1. **Implement UI Components** - Use the example code above
2. **Add User Authentication** - Already set up in middleware
3. **Test All Endpoints** - Use CHAT_API_TESTING.sh
4. **Deploy to Production** - Follow deployment guides
5. **Monitor Usage** - Add logging and analytics

---

## Support Resources

1. **[CHAT_README.md](./CHAT_README.md)** - Overview
2. **[CHAT_SYSTEM_DOCUMENTATION.md](./CHAT_SYSTEM_DOCUMENTATION.md)** - Complete API docs
3. **[CHAT_QUICK_REFERENCE.md](./CHAT_QUICK_REFERENCE.md)** - Quick lookup
4. **[CHAT_CLIENT_EXAMPLE.js](./CHAT_CLIENT_EXAMPLE.js)** - Frontend code
5. **[CHAT_API_TESTING.sh](./CHAT_API_TESTING.sh)** - Testing guide

---

**🚀 Your chat system is ready to integrate!**
