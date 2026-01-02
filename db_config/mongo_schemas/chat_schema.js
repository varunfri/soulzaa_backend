import mongoose from "mongoose";
import { Schema } from "mongoose";

const chat = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "auto_accepted"],
            default: "pending",
        },

        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        acceptedAt: {
            type: Date,
            default: null,
        },

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // creates createdAt & updatedAt automatically
    }
);



const message = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Chat",
    },
    senderId: {
        type: Number,
        required: true,
    },
    receiverId: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const chatSchema = mongoose.model("chat", chat);
export const messageSchema = mongoose.model("message", message);
