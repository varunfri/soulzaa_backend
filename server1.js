import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Socket server
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Store online users
const onlineUsers = new Map();
// userId -> socketId

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When user sends their userId
    socket.on("register", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // When User A sends message to User B
    socket.on("send_message", (data) => {
        const { from, to, message } = data;

        console.log(`Message from ${from} to ${to}: ${message}`);

        const receiverSocketId = onlineUsers.get(to);

        if (receiverSocketId) {
            // Send message to User B instantly
            io.to(receiverSocketId).emit("receive_message", {
                from,
                message,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Remove user from online list
        for (let [userId, sockId] of onlineUsers) {
            if (sockId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });
});


server.listen(3050, () => {
    console.log("Socket server running on port 3050");
});
