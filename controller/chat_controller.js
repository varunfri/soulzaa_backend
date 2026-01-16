import mongoose from "mongoose";
import { ChatModel, MessageModel } from "../db_config/mongo_schemas/chat_schema.js";

/**
 * Get chat requests (pending chats)
 * GET /chats/requests
 */
export const getRequestedChats = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await ChatModel.find({
            participants: userId,
            status: "pending",
            requestedBy: { $ne: userId },
        })
            .populate("participants", "id name avatar email")
            .populate("requestedBy", "id name avatar email")
            .sort({ createdAt: -1 })
            .limit(50);

        if (!requests || requests.length === 0) {
            return res.status(200).json({
                status: 200,
                message: "No pending chat requests",
                data: [],
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Chat requests fetched successfully",
            data: requests,
        });
    } catch (error) {
        console.error("Chat request fetching error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get active chats (accepted conversations)
 * GET /chats/active
 */
export const getActiveChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const chats = await ChatModel.find({
            participants: userId,
            status: { $in: ["accepted", "auto_accepted"] },
        })
            .populate("participants", "id name avatar email")
            .populate("lastSenderId", "id name avatar")
            .sort({ lastMessageAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalCount = await ChatModel.countDocuments({
            participants: userId,
            status: { $in: ["accepted", "auto_accepted"] },
        });

        if (!chats || chats.length === 0) {
            return res.status(200).json({
                status: 200,
                message: "No active chats found",
                data: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                },
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Active chats found",
            data: chats,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error fetching active chats:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get chat messages by Chat ID
 * GET /chats/:chatId/messages
 * Query params: limit, page
 */
export const getChatMessagesById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Validate user has access to this chat
        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
        });

        if (!chat) {
            return res.status(403).json({
                status: 403,
                message: "Access denied to this chat",
            });
        }

        // Fetch messages
        const messages = await MessageModel.find({ chatId })
            .populate("senderId", "id name avatar email")
            .populate("receiverId", "id name avatar email")
            .populate("replyTo")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalCount = await MessageModel.countDocuments({ chatId });

        // Filter out deleted messages for this user
        const filteredMessages = messages
            .map((msg) => {
                const messageObj = msg.toObject();
                if (messageObj.deletedBy && messageObj.deletedBy.includes(userId)) {
                    messageObj.content = "[This message was deleted]";
                    messageObj.media = null;
                }
                return messageObj;
            })
            .reverse(); // Reverse to get chronological order

        return res.status(200).json({
            status: 200,
            message: `Messages loaded for chatId: ${chatId}`,
            data: filteredMessages,
            chatInfo: {
                chatId: chat._id,
                status: chat.status,
                participants: chat.participants,
            },
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error retrieving chat messages:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Create or get 1-on-1 chat with another user
 * POST /chats/or-create
 * Body: { recipientId }
 */
export const createOrGetChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({
                status: 400,
                message: "Recipient ID is required",
            });
        }

        if (userId === recipientId) {
            return res.status(400).json({
                status: 400,
                message: "Cannot create chat with yourself",
            });
        }

        // Check if chat already exists
        let chat = await ChatModel.findOne({
            participants: { $all: [userId, recipientId] },
        }).populate("participants", "id name avatar email");

        if (chat) {
            return res.status(200).json({
                status: 200,
                message: "Chat already exists",
                data: chat,
            });
        }

        // Create new chat
        chat = new ChatModel({
            participants: [userId, recipientId],
            status: "pending",
            requestedBy: userId,
            unreadCount: new Map(),
        });

        await chat.save();
        await chat.populate("participants", "id name avatar email");

        return res.status(201).json({
            status: 201,
            message: "Chat created successfully",
            data: chat,
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Accept chat request
 * POST /chats/:chatId/accept
 */
export const acceptChatRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
            status: "pending",
            requestedBy: { $ne: userId },
        });

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat request not found",
            });
        }

        chat.status = "accepted";
        chat.acceptedAt = new Date();
        await chat.save();

        await chat.populate("participants", "id name avatar email");

        return res.status(200).json({
            status: 200,
            message: "Chat request accepted",
            data: chat,
        });
    } catch (error) {
        console.error("Error accepting chat:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Reject chat request
 * POST /chats/:chatId/reject
 */
export const rejectChatRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
            status: "pending",
            requestedBy: { $ne: userId },
        });

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat request not found",
            });
        }

        chat.status = "rejected";
        await chat.save();

        return res.status(200).json({
            status: 200,
            message: "Chat request rejected",
        });
    } catch (error) {
        console.error("Error rejecting chat:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Block user (prevents future chats)
 * POST /chats/:chatId/block
 */
export const blockUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
        });

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat not found",
            });
        }

        chat.status = "blocked";
        chat.blockedBy = userId;
        await chat.save();

        return res.status(200).json({
            status: 200,
            message: "User blocked successfully",
        });
    } catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Unblock user
 * POST /chats/:chatId/unblock
 */
export const unblockUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
            blockedBy: userId,
        });

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat not found",
            });
        }

        chat.status = "pending";
        chat.blockedBy = null;
        await chat.save();

        return res.status(200).json({
            status: 200,
            message: "User unblocked successfully",
        });
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Archive/Unarchive chat
 * POST /chats/:chatId/archive
 */
export const toggleArchiveChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
        });

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat not found",
            });
        }

        chat.isArchived = !chat.isArchived;
        await chat.save();

        return res.status(200).json({
            status: 200,
            message: `Chat ${chat.isArchived ? "archived" : "unarchived"} successfully`,
            data: chat,
        });
    } catch (error) {
        console.error("Error toggling archive:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get chat history for a specific user
 * GET /chats/user/:userId/history
 */
export const getUserChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, page = 1, includeArchived = false } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {
            participants: userId,
        };

        if (includeArchived === "false") {
            query.isArchived = false;
        }

        // Get all chats for the user
        const chats = await ChatModel.find(query)
            .populate("participants", "id name avatar email")
            .populate("lastSenderId", "id name avatar")
            .sort({ lastMessageAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalCount = await ChatModel.countDocuments(query);

        // Get message statistics
        const stats = await Promise.all(
            chats.map(async (chat) => {
                const msgCount = await MessageModel.countDocuments({
                    chatId: chat._id,
                });
                return {
                    chatId: chat._id,
                    messageCount: msgCount,
                };
            })
        );

        const chatsWithStats = chats.map((chat) => {
            const stat = stats.find((s) => s.chatId.toString() === chat._id.toString());
            return {
                ...chat.toObject(),
                messageCount: stat?.messageCount || 0,
            };
        });

        return res.status(200).json({
            status: 200,
            message: "Chat history retrieved successfully",
            data: chatsWithStats,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error getting chat history:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get chat details
 * GET /chats/:chatId
 */
export const getChatDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
        })
            .populate("participants", "id name avatar email status")
            .populate("lastSenderId", "id name avatar");

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat not found",
            });
        }

        const messageCount = await MessageModel.countDocuments({ chatId });

        return res.status(200).json({
            status: 200,
            message: "Chat details retrieved",
            data: {
                ...chat.toObject(),
                messageCount,
            },
        });
    } catch (error) {
        console.error("Error getting chat details:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Delete entire chat conversation
 * DELETE /chats/:chatId
 */
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
        });

        if (!chat) {
            return res.status(404).json({
                status: 404,
                message: "Chat not found",
            });
        }

        // Delete all messages in this chat
        await MessageModel.deleteMany({ chatId });

        // Delete the chat
        await ChatModel.deleteOne({ _id: chatId });

        return res.status(200).json({
            status: 200,
            message: "Chat deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Search messages in a chat
 * GET /chats/:chatId/search
 * Query params: q (search query), limit, page
 */
export const searchChatMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;
        const { q, limit = 20, page = 1 } = req.query;

        if (!q) {
            return res.status(400).json({
                status: 400,
                message: "Search query is required",
            });
        }

        // Validate access
        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: userId,
        });

        if (!chat) {
            return res.status(403).json({
                status: 403,
                message: "Access denied",
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await MessageModel.find({
            chatId,
            $or: [{ content: { $regex: q, $options: "i" } }, { "media.fileName": { $regex: q, $options: "i" } }],
        })
            .populate("senderId", "id name avatar")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalCount = await MessageModel.countDocuments({
            chatId,
            $or: [{ content: { $regex: q, $options: "i" } }, { "media.fileName": { $regex: q, $options: "i" } }],
        });

        return res.status(200).json({
            status: 200,
            message: "Messages found",
            data: messages,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error searching messages:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};
