import mongoose from "mongoose";
import { chatSchema, messageSchema } from "../db_config/mongo_schemas/chat_schema.js";
export const getRequestedChats = async (req, res) => {
    try {
        const user_id = req.user.id;

        const requests = await chatSchema.find({
            participants: userId,
            status: "requested",
            requestedBy: { $ne: user_id }
        }).sort({
            requestedAt: -1
        }).limit(50);

        if (!requests) {
            return res.status(201).json({});
        }

        return res.status(200).json({});


    } catch (e) {
        console.log("chat request fetching error", e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

export const getActiveChats = async (req, res) => {
    //retrieve the active chats that are accepted
    try {
        const user_id = req.user.id;

        const chats = await chatSchema.find({
            participants: user_id,
            status: { $in: ['accepted', 'auto_accepted'] }
        }).sort({
            lastMessage: -1
        }).limit(50);

        if (!chats) {
            return res.status(201).json({
                status: 201,
                message: "No active chats found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Active chats found",
            data: chats
        });
    } catch (e) {
        console.log("chat request fetching error", e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};


export const getChatMessagesById = async (req, res) => {
    try {//passing a chatId as param id in url 

        const user_id = req.user.id;
        const chat_id = req.params.chatId;

        // validate a chat access: 
        const chat = await chatSchema.findOne({
            _id: chat_id,
            participants: user_id
        });

        if (!chat) {
            return res.status(403).json({
                status: 403,
                message: "Access denied",
            });
        }


        const messages = await messageSchema.find({ chat_id })
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            status: 200,
            message: `Messages loaded for chatId: ${chat_id}`,
            data: messages
        });


    } catch (e) {
        console.log("Error retrieveing chatMessageById", e);

        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });


    }
};
