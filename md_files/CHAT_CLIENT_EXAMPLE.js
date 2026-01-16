/**
 * Chat System - Frontend Implementation Examples
 * This file contains ready-to-use code snippets for implementing the chat system on the client side
 */

// ============================================
// 1. WEBSOCKET CONNECTION SETUP
// ============================================

import io from 'socket.io-client';

class ChatClient {
    constructor(serverUrl = 'http://localhost:8000', token) {
        this.serverUrl = serverUrl;
        this.token = token;
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = io(this.serverUrl, {
                auth: {
                    token: this.token
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('✅ Connected to chat server');
                resolve();
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                console.log('❌ Disconnected from chat server');
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
                reject(error);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                reject(error);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
}

// ============================================
// 2. CHAT ROOM MANAGEMENT
// ============================================

class ChatRoom {
    constructor(client, chatId) {
        this.client = client;
        this.chatId = chatId;
        this.isJoined = false;
        this.typingUsers = new Set();
        this.messageHandlers = [];
        this.typingHandlers = [];
    }

    // Join a chat room
    join() {
        return new Promise((resolve, reject) => {
            this.client.socket.emit('join_chat', { chatId: this.chatId });

            this.client.socket.once('join_chat_success', (data) => {
                this.isJoined = true;
                console.log(`✅ Joined chat: ${this.chatId}`);
                this.setupListeners();
                resolve(data);
            });

            // Timeout after 5 seconds
            setTimeout(() => reject(new Error('Join timeout')), 5000);
        });
    }

    // Leave the chat room
    leave() {
        this.client.socket.emit('leave_chat', { chatId: this.chatId });
        this.isJoined = false;
        console.log(`👋 Left chat: ${this.chatId}`);
    }

    // Setup event listeners for this room
    setupListeners() {
        // Listen for new messages
        this.client.socket.off('message_received');
        this.client.socket.on('message_received', (data) => {
            console.log('📨 New message:', data);
            this.messageHandlers.forEach(handler => handler(data));
        });

        // Listen for media messages
        this.client.socket.off('media_received');
        this.client.socket.on('media_received', (data) => {
            console.log('📸 New media:', data);
            this.messageHandlers.forEach(handler => handler(data));
        });

        // Listen for typing indicators
        this.client.socket.off('user_typing');
        this.client.socket.on('user_typing', (data) => {
            this.typingUsers.add(data.userId);
            this.typingHandlers.forEach(handler => handler(Array.from(this.typingUsers)));
        });

        // Listen for stop typing
        this.client.socket.off('user_stop_typing');
        this.client.socket.on('user_stop_typing', (data) => {
            this.typingUsers.delete(data.userId);
            this.typingHandlers.forEach(handler => handler(Array.from(this.typingUsers)));
        });

        // Listen for read receipts
        this.client.socket.off('messages_read');
        this.client.socket.on('messages_read', (data) => {
            console.log('✓✓ Messages read by:', data.readBy);
        });

        // Listen for message edits
        this.client.socket.off('message_edited');
        this.client.socket.on('message_edited', (data) => {
            console.log('✏️ Message edited:', data);
            this.messageHandlers.forEach(handler => handler(data));
        });

        // Listen for message deletes
        this.client.socket.off('message_deleted');
        this.client.socket.on('message_deleted', (data) => {
            console.log('🗑️ Message deleted:', data.messageId);
        });

        // Listen for reactions
        this.client.socket.off('reaction_added');
        this.client.socket.on('reaction_added', (data) => {
            console.log('😀 Reaction added:', data.emoji);
        });
    }

    // Register handler for incoming messages
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }

    // Register handler for typing events
    onTyping(handler) {
        this.typingHandlers.push(handler);
    }
}

// ============================================
// 3. MESSAGE OPERATIONS
// ============================================

class Message {
    constructor(client, chatId) {
        this.client = client;
        this.chatId = chatId;
    }

    // Send text message
    sendText(content, replyToId = null) {
        return new Promise((resolve, reject) => {
            this.client.socket.emit('send_message', {
                chatId: this.chatId,
                content,
                replyToId
            });

            this.client.socket.once('send_message_success', (data) => {
                console.log('✅ Message sent:', data.messageId);
                resolve(data);
            });

            this.client.socket.once('error', reject);
            setTimeout(() => reject(new Error('Send timeout')), 5000);
        });
    }

    // Send typing indicator
    startTyping() {
        this.client.socket.emit('typing', { chatId: this.chatId });
    }

    // Stop typing indicator
    stopTyping() {
        this.client.socket.emit('stop_typing', { chatId: this.chatId });
    }

    // Mark messages as read
    markAsRead(messageIds) {
        this.client.socket.emit('mark_as_read', {
            messageIds,
            chatId: this.chatId
        });
    }

    // Edit message
    edit(messageId, newContent) {
        return new Promise((resolve, reject) => {
            this.client.socket.emit('edit_message', {
                messageId,
                chatId: this.chatId,
                newContent
            });

            this.client.socket.once('edit_success', resolve);
            this.client.socket.once('error', reject);
        });
    }

    // Delete message
    delete(messageId) {
        return new Promise((resolve, reject) => {
            this.client.socket.emit('delete_message', {
                messageId,
                chatId: this.chatId
            });

            this.client.socket.once('delete_success', resolve);
            this.client.socket.once('error', reject);
        });
    }

    // Add emoji reaction
    addReaction(messageId, emoji) {
        return new Promise((resolve, reject) => {
            this.client.socket.emit('add_reaction', {
                messageId,
                chatId: this.chatId,
                emoji
            });

            this.client.socket.once('reaction_success', resolve);
            this.client.socket.once('error', reject);
        });
    }

    // Remove emoji reaction
    removeReaction(messageId, emoji) {
        return new Promise((resolve, reject) => {
            this.client.socket.emit('remove_reaction', {
                messageId,
                chatId: this.chatId,
                emoji
            });

            this.client.socket.once('reaction_removed_success', resolve);
            this.client.socket.once('error', reject);
        });
    }
}

// ============================================
// 4. MEDIA UPLOAD HANDLER
// ============================================

class MediaUploader {
    constructor(serverUrl = 'http://localhost:8000', token) {
        this.serverUrl = serverUrl;
        this.token = token;
    }

    // Upload single file
    async uploadFile(file, chatId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);

        try {
            const response = await fetch(`${this.serverUrl}/api/media/upload-chat-media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            console.log('✅ File uploaded:', data.data);
            return data.data;
        } catch (error) {
            console.error('❌ Upload error:', error);
            throw error;
        }
    }

    // Upload multiple files
    async uploadFiles(files, chatId) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('chatId', chatId);

        try {
            const response = await fetch(`${this.serverUrl}/api/media/bulk-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Bulk upload failed');

            const data = await response.json();
            console.log('✅ Files uploaded:', data.data);
            return data.data;
        } catch (error) {
            console.error('❌ Bulk upload error:', error);
            throw error;
        }
    }

    // Get upload token for client-side upload
    async getUploadToken() {
        try {
            const response = await fetch(`${this.serverUrl}/api/media/get-upload-token`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('❌ Error getting upload token:', error);
            throw error;
        }
    }

    // Delete uploaded file
    async deleteFile(fileId) {
        try {
            const response = await fetch(`${this.serverUrl}/api/media/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileId })
            });

            if (!response.ok) throw new Error('Delete failed');

            console.log('✅ File deleted:', fileId);
            return true;
        } catch (error) {
            console.error('❌ Delete error:', error);
            throw error;
        }
    }
}

// ============================================
// 5. REST API HANDLER
// ============================================

class ChatAPI {
    constructor(serverUrl = 'http://localhost:8000', token) {
        this.serverUrl = serverUrl;
        this.token = token;
    }

    // Helper method for fetch with auth
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.serverUrl}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        return response.json();
    }

    // Get active chats
    async getActiveChats(limit = 50, page = 1) {
        return this.request(`/api/chats/active?limit=${limit}&page=${page}`);
    }

    // Get pending chat requests
    async getChatRequests() {
        return this.request('/api/chats/requests');
    }

    // Get or create chat with user
    async createOrGetChat(recipientId) {
        return this.request('/api/chats/or-create', {
            method: 'POST',
            body: JSON.stringify({ recipientId })
        });
    }

    // Get chat details
    async getChatDetails(chatId) {
        return this.request(`/api/chats/${chatId}`);
    }

    // Get chat messages
    async getChatMessages(chatId, limit = 50, page = 1) {
        return this.request(`/api/chats/${chatId}/messages?limit=${limit}&page=${page}`);
    }

    // Search messages
    async searchMessages(chatId, query, limit = 20, page = 1) {
        return this.request(`/api/chats/${chatId}/search?q=${query}&limit=${limit}&page=${page}`);
    }

    // Accept chat request
    async acceptChat(chatId) {
        return this.request(`/api/chats/${chatId}/accept`, { method: 'POST' });
    }

    // Reject chat request
    async rejectChat(chatId) {
        return this.request(`/api/chats/${chatId}/reject`, { method: 'POST' });
    }

    // Block user
    async blockUser(chatId) {
        return this.request(`/api/chats/${chatId}/block`, { method: 'POST' });
    }

    // Unblock user
    async unblockUser(chatId) {
        return this.request(`/api/chats/${chatId}/unblock`, { method: 'POST' });
    }

    // Archive chat
    async archiveChat(chatId) {
        return this.request(`/api/chats/${chatId}/archive`, { method: 'POST' });
    }

    // Delete chat
    async deleteChat(chatId) {
        return this.request(`/api/chats/${chatId}`, { method: 'DELETE' });
    }

    // Get user chat history
    async getUserChatHistory(userId, limit = 50, page = 1) {
        return this.request(`/api/chats/user/${userId}/history?limit=${limit}&page=${page}`);
    }
}

// ============================================
// 6. USAGE EXAMPLE
// ============================================

async function exampleUsage() {
    const token = 'your-jwt-token';

    // Initialize client
    const chatClient = new ChatClient('http://localhost:8000', token);
    await chatClient.connect();

    // Initialize API
    const api = new ChatAPI('http://localhost:8000', token);

    // Get active chats
    const chats = await api.getActiveChats();
    console.log('Active chats:', chats.data);

    // Create or get chat with user
    const chat = await api.createOrGetChat('recipient-user-id');
    const chatId = chat.data._id;

    // Join chat room
    const room = new ChatRoom(chatClient, chatId);
    await room.join();

    // Setup message handler
    room.onMessage((message) => {
        console.log('New message:', message);
    });

    // Setup typing handler
    room.onTyping((typingUsers) => {
        console.log('Users typing:', typingUsers);
    });

    // Initialize message handler
    const messageHandler = new Message(chatClient, chatId);

    // Start typing indicator
    messageHandler.startTyping();

    // Send message
    await messageHandler.sendText('Hello, World!');

    // Stop typing indicator
    messageHandler.stopTyping();

    // Upload media
    const uploader = new MediaUploader('http://localhost:8000', token);
    const file = document.querySelector('input[type="file"]').files[0];
    const uploadedMedia = await uploader.uploadFile(file, chatId);

    // Send media message
    await chatClient.socket.emit('send_media', {
        chatId,
        messageType: uploadedMedia.messageType,
        media: uploadedMedia
    });

    // Get chat messages
    const messages = await api.getChatMessages(chatId);
    console.log('Messages:', messages.data);

    // Leave chat
    room.leave();

    // Disconnect
    chatClient.disconnect();
}

// Export classes for use
export { ChatClient, ChatRoom, Message, MediaUploader, ChatAPI };
