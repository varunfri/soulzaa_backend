
import { mysql_db } from "../db_config/mysql_connect.js";
import { getIO } from "../utils/init_socket.js";


export const send_gift = async (req, res) => {
    const sender_id = req.user.id;
    if (!req.body || Object.keys(req.body) === 0) {
        return res.status(400).json({
            status: 400,
            message: "Request body is required"
        });
    }

    const { receiver_id, gift_id, quantity, context_type, context_id } = req.body;


    if (!receiver_id || !gift_id || !quantity || !context_type) {
        return res.status(400).json({
            status: 400,
            message: "request body is missing"
        });
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({
            status: 400,
            message: "quantity must be a positive integer"
        });
    }

    if (sender_id === receiver_id) {
        return res.status(400).json({
            status: 400,
            message: "Cannot send gift to yourself"
        });
    }

    const connection = await mysql_db.getConnection();

    try {
        await connection.beginTransaction();

        // Get gift cost
        const [giftData] = await connection.query(
            `SELECT gift_id, coin_cost FROM gifts WHERE gift_id = ?`,
            [gift_id]
        );

        if (giftData.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 404,
                message: "Gift not found"
            });
        }

        const coin_cost = giftData[0].coin_cost;
        const total_coins = coin_cost * quantity;

        // Check sender's coin balance
        const [senderBalance] = await connection.query(
            `SELECT balance FROM user_wallets WHERE user_id = ?`,
            [sender_id]
        );

        if (senderBalance.length === 0 || senderBalance[0].balance < total_coins) {
            await connection.rollback();
            return res.status(400).json({
                status: 400,
                message: "Insufficient coins"
            });
        }

        // Deduct coins from sender
        await connection.query(
            `UPDATE user_wallets SET balance = (@new_balance := balance - ?)  WHERE user_id = ?`,
            [total_coins, sender_id]
        );

        const [sender_bal] = await connection.query(`select @new_balance as balance`);
        const sender_bal_after = sender_bal[0].balance;
        // Add coins to receiver
        const [receiverBalance] = await connection.query(
            `SELECT balance FROM user_wallets WHERE user_id = ?`,
            [receiver_id]
        );

        if (receiverBalance.length === 0) {
            // Create if doesn't exist
            await connection.query(
                `INSERT INTO user_wallets (user_id, balance) VALUES (?, @receiver_bal := ?)`,
                [receiver_id, total_coins]
            );
        } else {
            await connection.query(
                `UPDATE user_wallets SET balance = (@receiver_bal := balance + ?) WHERE user_id = ?`,
                [total_coins, receiver_id]
            );
        }

        const [receive_bal] = await connection.query(`select @receiver_bal as balance`);
        const receive_bal_after = receive_bal[0].balance;

        // Record gift transaction
        const [result] = await connection.query(
            `INSERT INTO user_gifts (sender_id, receiver_id, gift_id, quantity, total_coins, context_type, context_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sender_id, receiver_id, gift_id, quantity, total_coins, context_type, context_id || null]
        );

        //record a coins transaction history
        const [transact_send] = await connection.query(
            `Insert into coin_transactions (user_id, coins, transaction_type, balance_after, status) values 
            (?, ?, "GIFT_SENT",?, "SUCCESS" )
            `,
            [sender_id, total_coins, sender_bal_after]
        );
        const [transact_receive] = await connection.query(
            `Insert into coin_transactions (user_id, coins, transaction_type, balance_after, status)
             values (?, ?, "GIFT_RECEIVED", ?,  "SUCCESS")`,
            [receiver_id, total_coins, receive_bal_after]
        );
        const user_gift_id = result.insertId;

        await connection.commit();

        // Get gift details for response
        const [giftDetails] = await mysql_db.query(
            `SELECT g.gift_name, g.gift_icon_url FROM gifts g WHERE g.gift_id = ?`,
            [gift_id]
        );

        const gift = giftDetails[0];

        // Get sender details
        const [senderDetails] = await mysql_db.query(
            `SELECT u.user_id, u.full_name, u.profile_picture FROM users u WHERE u.user_id = ?`,
            [sender_id]
        );

        const sender = senderDetails[0];

        // Emit socket event to receiver
        const io = getIO();
        io.emit(`gift_received_${receiver_id}`, {
            user_gift_id,
            // sender_id: sender.user_id,
            sender_name: sender.full_name,
            sender_profile_picture: sender.profile_picture,
            gift_name: gift.gift_name,
            gift_icon_url: gift.gift_icon_url,
            quantity,
            total_coins,
            context_type,
            context_id,
            timestamp: new Date()
        });

        // Emit to live stream room if context is LIVE
        if (context_type === 'LIVE' && context_id) {
            io.to(`live_${context_id}`).emit('gift_sent_live', {
                user_gift_id,
                // sender_id: sender.user_id,
                sender_name: sender.full_name,
                sender_profile_picture: sender.profile_picture,
                receiver_id,
                gift_name: gift.gift_name,
                gift_icon_url: gift.gift_icon_url,
                quantity,
                total_coins,
                timestamp: new Date()
            });
        }

        return res.status(201).json({
            status: 201,
            message: "Gift sent successfully",
            data: {
                user_gift_id,
                sender_id,
                receiver_id,
                gift_name: gift.gift_name,
                gift_icon_url: gift.gift_icon_url,
                quantity,
                total_coins,
                context_type,
                context_id
            }
        });

    } catch (e) {
        await connection.rollback();
        console.error("Error sending gift:", e);
        return res.status(500).json({
            status: 500,
            message: `Internal server error: Unable to send gift ${e.message}`,

        });
    } finally {
        connection.release();
    }
};


export const user_get_gifts = async (req, res) => {
    try {
        const [result] = await mysql_db.query(`
      SELECT gift_id, gift_name, gift_icon_url, coin_cost, is_active, is_animated
      FROM gifts WHERE is_active=1
    `);

        if (!result.length) {
            return res.status(404).json({
                status: 404,
                message: "No gifts found"
            });
        }

        const data = result.map(gift => ({
            giftId: gift.gift_id,
            giftName: gift.gift_name,
            giftIcon: gift.gift_icon_url,
            coinCost: gift.coin_cost,
            isActive: Boolean(gift.is_active),
            isAnimated: Boolean(gift.is_animated)
        }));

        return res.status(200).json({
            status: 200,
            message: "Gifts fetched successfully",
            data
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};