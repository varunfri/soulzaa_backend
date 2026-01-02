import { getIO } from "../../utils/init_socket.js";
import { chatSchema, messageSchema } from "../../db_config/mongo_schemas/chat_schema.js";
import { onlineUsers } from "../../server.js";


// const chat = chatSchema;
// const message = messageSchema;



export const chatRequestHandlers = (io, socket) => {
    socket.on("chat_request", async ({ toUserId }) => {
        const fromUserId = socket.user.id;

        let chat = await chatSchema.findOne({ //check chat exits?
            participants: { $all: [fromUserId, toUserId] }
        });

        if (chat) return; //already exists

        chat = await chatSchema.create({
            participants: [fromUserId, toUserId],
            status: "pending",
            requestedBy: fromUserId,
            createdAt: new Date()
        });

        const receiverSocket = onlineUsers.get(toUserId);
        if (receiverSocket) {
            receiverSocket.array.forEach(id => {
                io.to(id).emit("chat_request_received", chat);
            });
        }
    });

    socket.on("accept_chat", async ({ chatId }) => {
        const user_id = socket.user.id;


        const chat = await chatSchema.findById(user_id);

        if (!chat) return;

        if (!chat.participants.includes(user_id)) return;

        chat.status = "accepted";
        chat.acceptedAt = new Date();

        await chat.save();

        chat.participants.forEach(id => {
            const socket = onlineUsers.get(id);

            socket?.forEach(sid => {
                io.to(sid).emit("chat_accepted", chat);
            });
        });

    });

    socket.on("send_message", async ({ toUserId, text }) => {
        const fromUserId = socket.user.id;

        //check the chat exists
        let chat = chatSchema.findOne({
            participants: { $all: [fromUserId, toUserId] }
        });

        // if chat is first create a message
        if (!chat) {
            chat = await chatSchema.create({
                participants: [fromUserId, toUserId],
                status: "requested",
                requestedBy: fromUserId,
                requestedAt: new Date(),
                lastMessage: text,
                lastMessageAt: new Date(),
                createdAt: new Date()
            });


            //save the message 
            const message = await messageSchema.create({
                chatId: chat._id,
                senderId: fromUserId,
                receiverId: toUserId,
                text,
                createdAt: new Date()
            });

            // Notify receiver (request + message preview)
            const receiverSockets = onlineUsers.get(toUserId);
            receiverSockets?.forEach(id => {
                io.to(id).emit("chat_request_received", {
                    chat,
                    messagePreview: text
                });
            });
            socket.emit("message_sent", message);
            return;
        }

        // checking whether accpeted or not!
        if (!["accepted", "auto_accepted"].includes(chat.status)) {
            return;
        }

        // normal 
        // flow 
        const message = await messageSchema.create({
            chatId: chat._id,
            senderId: fromUserId,
            receiverId: toUserId,
            text,
            createdAt: new Date()
        });

        chat.lastMessage = text;
        chat.lastMessageAt = new Date();

        await chat.save();

        const receiverSockets = onlineUsers.get(toUserId);
        receiverSockets?.forEach(id => {
            io.to(id).emit("receive_message", message);
        });

        socket.emit("message_sent", message);
    });
};
