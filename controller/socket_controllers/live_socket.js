import { mysql_db } from "../../db_config/mysql_connect.js";
import { onlineUsers } from "../../server.js";

export const liveStreamHandlers = (io, socket) => {
    /**
     * Join live stream room
     * Emitted by: Client watching a live stream
     * Data: { stream_id, user_id (broadcaster) }
     */
    socket.on("join_live", async ({ stream_id, broadcaster_id }) => {
        try {
            const viewer_id = socket.user.id;

            // Verify stream exists and is live
            const [stream] = await mysql_db.query(
                `SELECT stream_id, user_id, is_audio FROM user_streams WHERE stream_id = ? AND status = 'live'`,
                [stream_id]
            );

            if (stream.length === 0) {
                socket.emit("error", { message: "Stream not found or not live" });
                return;
            }

            // Join socket room for this stream
            const roomName = `stream_${stream_id}`;
            socket.join(roomName);

            // Increment viewer count
            await mysql_db.query(
                `UPDATE user_streams SET current_viewers = COALESCE(current_viewers, 0) + 1 WHERE stream_id = ?`,
                [stream_id]
            );

            // Notify broadcaster of new viewer
            const broadcasterSockets = onlineUsers.get(broadcaster_id);
            if (broadcasterSockets) {
                broadcasterSockets.forEach(socketId => {
                    io.to(socketId).emit("viewer_joined", {
                        stream_id,
                        viewer_id,
                        timestamp: new Date()
                    });
                });
            }

            // Notify all viewers in stream
            io.to(roomName).emit("viewer_count_updated", {
                stream_id,
                viewer_count: stream.length
            });

            socket.emit("join_live_success", {
                stream_id,
                is_audio: stream[0].is_audio,
                message: "Joined live stream"
            });

        } catch (e) {
            console.log("Error joining live stream:", e);
            socket.emit("error", { message: "Failed to join live stream" });
        }
    });

    /**
     * Leave live stream room
     * Emitted by: Client leaving a live stream
     */
    socket.on("leave_live", async ({ stream_id, broadcaster_id }) => {
        try {
            const viewer_id = socket.user.id;
            const roomName = `stream_${stream_id}`;

            // Leave socket room
            socket.leave(roomName);

            // Decrement viewer count
            await mysql_db.query(
                `UPDATE user_streams SET current_viewers = GREATEST(COALESCE(current_viewers, 1) - 1, 0) WHERE stream_id = ?`,
                [stream_id]
            );

            // Notify broadcaster of viewer leaving
            const broadcasterSockets = onlineUsers.get(broadcaster_id);
            if (broadcasterSockets) {
                broadcasterSockets.forEach(socketId => {
                    io.to(socketId).emit("viewer_left", {
                        stream_id,
                        viewer_id,
                        timestamp: new Date()
                    });
                });
            }

            socket.emit("leave_live_success", { stream_id });

        } catch (e) {
            console.log("Error leaving live stream:", e);
            socket.emit("error", { message: "Failed to leave live stream" });
        }
    });

    /**
     * Send gift during live stream
     * Emitted by: Viewer sending gift to broadcaster
     */
    socket.on("send_gift", async ({ stream_id, gift_id, broadcaster_id, coin_amount }) => {
        try {
            const sender_id = socket.user.id;

            if (sender_id === broadcaster_id) {
                socket.emit("error", { message: "Cannot send gift to yourself" });
                return;
            }

            // Verify gift exists
            const [gift] = await mysql_db.query(
                `SELECT gift_id, name, icon FROM gifts WHERE gift_id = ?`,
                [gift_id]
            );

            if (gift.length === 0) {
                socket.emit("error", { message: "Gift not found" });
                return;
            }

            // Check sender has enough coins
            const [wallet] = await mysql_db.query(
                `SELECT balance FROM user_wallets WHERE user_id = ?`,
                [sender_id]
            );

            if (wallet.length === 0 || wallet[0].balance < coin_amount) {
                socket.emit("error", { message: "Insufficient coins" });
                return;
            }

            const connection = await mysql_db.getConnection();

            try {
                await connection.beginTransaction();

                // Deduct coins from sender
                await connection.query(
                    `UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?`,
                    [coin_amount, sender_id]
                );

                // Add coins to broadcaster
                await connection.query(
                    `UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?`,
                    [coin_amount, broadcaster_id]
                );

                // Record transaction
                await connection.query(
                    `INSERT INTO gift_transactions (stream_id, sender_id, receiver_id, gift_id, coin_amount, created_at)
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [stream_id, sender_id, broadcaster_id, gift_id, coin_amount]
                );

                await connection.commit();

                const roomName = `stream_${stream_id}`;

                // Notify broadcaster
                const broadcasterSockets = onlineUsers.get(broadcaster_id);
                if (broadcasterSockets) {
                    broadcasterSockets.forEach(socketId => {
                        io.to(socketId).emit("gift_received", {
                            stream_id,
                            sender_id,
                            gift_name: gift[0].name,
                            gift_icon: gift[0].icon,
                            coin_amount,
                            timestamp: new Date()
                        });
                    });
                }

                // Notify all viewers
                io.to(roomName).emit("gift_sent_notification", {
                    stream_id,
                    sender_id,
                    gift_name: gift[0].name,
                    gift_icon: gift[0].icon,
                    timestamp: new Date()
                });

                socket.emit("gift_sent_success", {
                    stream_id,
                    gift_id,
                    coin_amount,
                    message: "Gift sent successfully"
                });

            } catch (e) {
                await connection.rollback();
                throw e;
            } finally {
                connection.release();
            }

        } catch (e) {
            console.log("Error sending gift:", e);
            socket.emit("error", { message: "Failed to send gift" });
        }
    });

    /**
     * Send comment during live stream
     * Emitted by: Viewer sending comment
     */
    socket.on("send_comment", async ({ stream_id, text, broadcaster_id }) => {
        try {
            const user_id = socket.user.id;
            const roomName = `stream_${stream_id}`;

            // Save comment to database
            const [result] = await mysql_db.query(
                `INSERT INTO live_comments (stream_id, user_id, text, created_at)
                 VALUES (?, ?, ?, NOW())`,
                [stream_id, user_id, text]
            );

            // Notify all viewers in stream
            io.to(roomName).emit("new_comment", {
                stream_id,
                user_id,
                text,
                comment_id: result.insertId,
                timestamp: new Date()
            });

            socket.emit("comment_sent_success", {
                comment_id: result.insertId,
                message: "Comment sent"
            });

        } catch (e) {
            console.log("Error sending comment:", e);
            socket.emit("error", { message: "Failed to send comment" });
        }
    });

    /**
     * Update viewer status (e.g., audio/video on/off)
     * Emitted by: Broadcaster updating stream settings
     */
    socket.on("update_stream_status", async ({ stream_id, is_muted, is_video_off }) => {
        try {
            const broadcaster_id = socket.user.id;
            const roomName = `stream_${stream_id}`;

            // Verify stream belongs to broadcaster
            const [stream] = await mysql_db.query(
                `SELECT stream_id FROM user_streams WHERE stream_id = ? AND user_id = ? AND status = 'live'`,
                [stream_id, broadcaster_id]
            );

            if (stream.length === 0) {
                socket.emit("error", { message: "Stream not found or not live" });
                return;
            }

            // Notify all viewers
            io.to(roomName).emit("stream_status_changed", {
                stream_id,
                is_muted,
                is_video_off,
                timestamp: new Date()
            });

        } catch (e) {
            console.log("Error updating stream status:", e);
            socket.emit("error", { message: "Failed to update stream status" });
        }
    });

    /**
     * Disconnect handler
     */

    // socket.on("disconnect", () => {
    //     console.log(`User ${socket.user.id} disconncted from live stream,`);
    // });
};
