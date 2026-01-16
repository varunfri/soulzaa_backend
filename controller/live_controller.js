import { mysql_db } from "../db_config/mysql_connect.js";
import { getIO } from "../utils/init_socket.js";
import crypto from "crypto";

export const start_live = async (req, res) => {
    const user_id = req.user.id;
    const { is_audio } = req.body || {};

    if (is_audio === undefined || typeof is_audio !== 'boolean') {
        return res.status(400).json({
            status: 400,
            message: "is_audio field is required and must be boolean"
        });
    }

    const connection = await mysql_db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user already has an active stream
        const [activeStream] = await connection.query(
            `SELECT stream_id FROM user_streams WHERE user_id = ? AND status IN ('created', 'live')`,
            [user_id]
        );

        if (activeStream.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "User already has an active stream"
            });
        }

        // Generate unique stream key
        const stream_key = crypto.randomBytes(16).toString('hex');
        const stream_url = `rtmp://your-streaming-server/${stream_key}`;

        // Create stream record
        const [result] = await connection.query(
            `INSERT INTO user_streams (user_id, stream_key, stream_url, status, is_audio, is_live)
             VALUES (?, ?, ?, 'created', ?, 0)`,
            [user_id, stream_key, stream_url, is_audio ? 1 : 0]
        );

        if (result.affectedRows !== 1) {
            throw new Error("Failed to create stream");
        }

        const stream_id = result.insertId;

        await connection.commit();

        const data = {
            stream_id,
            stream_key,
            stream_url,
            is_audio
        };

        res.status(201).json({
            status: 201,
            message: "Live stream created successfully",
            data: data
        });

    } catch (e) {
        await connection.rollback();
        console.log("Error starting live:", e);
        res.status(500).json({
            status: 500,
            message: "Internal server error: Unable to start live"
        });
    } finally {
        connection.release();
    }
};

export const go_live = async (req, res) => {
    const user_id = req.user.id;
    const { stream_id, stream_title, stream_description } = req.body || {};

    if (!stream_id) {
        return res.status(400).json({
            status: 400,
            message: "stream_id is required"
        });
    }

    const connection = await mysql_db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify stream belongs to user and is in created status
        const [stream] = await connection.query(
            `SELECT stream_id, is_audio FROM user_streams WHERE stream_id = ? AND user_id = ? AND status = 'created'`,
            [stream_id, user_id]
        );

        if (stream.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Stream not found or already live"
            });
        }

        // Update stream to live
        const [updateResult] = await connection.query(
            `UPDATE user_streams 
             SET status = 'live', is_live = 1, started_at = NOW() 
             WHERE stream_id = ?`,
            [stream_id]
        );

        if (updateResult.affectedRows !== 1) {
            throw new Error("Failed to go live");
        }

        await connection.commit();

        // Emit socket event
        const io = getIO();
        io.emit('stream_went_live', {
            stream_id,
            user_id,
            is_audio: stream[0].is_audio,
            timestamp: new Date()
        });

        res.status(200).json({
            status: 200,
            message: "Stream is now live",
            data: {
                stream_id,
                status: 'live'
            }
        });

    } catch (e) {
        await connection.rollback();
        console.log("Error going live:", e);
        res.status(500).json({
            status: 500,
            message: "Internal server error: Unable to go live"
        });
    } finally {
        connection.release();
    }
};

export const pause_live = async (req, res) => {
    const user_id = req.user.id;
    const { stream_id } = req.body || {};

    if (!stream_id) {
        return res.status(400).json({
            status: 400,
            message: "stream_id is required"
        });
    }

    const connection = await mysql_db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify stream belongs to user and is live
        const [stream] = await connection.query(
            `SELECT stream_id, is_audio FROM user_streams WHERE stream_id = ? AND user_id = ? AND status = 'live'`,
            [stream_id, user_id]
        );

        if (stream.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Stream not found or not live"
            });
        }

        // Update stream to paused
        const [updateResult] = await connection.query(
            `UPDATE user_streams 
             SET is_paused = 1, paused_at = NOW() 
             WHERE stream_id = ?`,
            [stream_id]
        );

        if (updateResult.affectedRows !== 1) {
            throw new Error("Failed to pause stream");
        }

        await connection.commit();

        // Emit socket event
        const io = getIO();
        io.emit('stream_paused', {
            stream_id,
            user_id,
            timestamp: new Date()
        });

        res.status(200).json({
            status: 200,
            message: "Stream paused successfully",
            data: {
                stream_id,
                is_paused: true
            }
        });

    } catch (e) {
        await connection.rollback();
        console.log("Error pausing stream:", e);
        res.status(500).json({
            status: 500,
            message: "Internal server error: Unable to pause stream"
        });
    } finally {
        connection.release();
    }
};

export const resume_live = async (req, res) => {
    const user_id = req.user.id;
    const { stream_id } = req.body || {};

    if (!stream_id) {
        return res.status(400).json({
            status: 400,
            message: "stream_id is required"
        });
    }

    const connection = await mysql_db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify stream belongs to user and is paused
        const [stream] = await connection.query(
            `SELECT stream_id, is_audio FROM user_streams WHERE stream_id = ? AND user_id = ? AND is_paused = 1`,
            [stream_id, user_id]
        );

        if (stream.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Stream not found or not paused"
            });
        }

        // Update stream to resumed
        const [updateResult] = await connection.query(
            `UPDATE user_streams 
             SET is_paused = 0, paused_at = NULL 
             WHERE stream_id = ?`,
            [stream_id]
        );

        if (updateResult.affectedRows !== 1) {
            throw new Error("Failed to resume stream");
        }

        await connection.commit();

        // Emit socket event
        const io = getIO();
        io.emit('stream_resumed', {
            stream_id,
            user_id,
            timestamp: new Date()
        });

        res.status(200).json({
            status: 200,
            message: "Stream resumed successfully",
            data: {
                stream_id,
                is_paused: false
            }
        });

    } catch (e) {
        await connection.rollback();
        console.log("Error resuming stream:", e);
        res.status(500).json({
            status: 500,
            message: "Internal server error: Unable to resume stream"
        });
    } finally {
        connection.release();
    }
};

export const end_live = async (req, res) => {
    const user_id = req.user.id;
    const { stream_id } = req.body || {};

    if (!stream_id) {
        return res.status(400).json({
            status: 400,
            message: "stream_id is required"
        });
    }

    const connection = await mysql_db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify stream belongs to user and is live
        const [stream] = await connection.query(
            `SELECT stream_id, is_audio FROM user_streams WHERE stream_id = ? AND user_id = ?`,
            [stream_id, user_id]
        );

        if (stream.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Stream not found"
            });
        }

        // Update stream to ended
        const [updateResult] = await connection.query(
            `UPDATE user_streams 
             SET status = 'end', is_live = 0, is_paused = 0, ended_at = NOW() 
             WHERE stream_id = ?`,
            [stream_id]
        );

        if (updateResult.affectedRows !== 1) {
            throw new Error("Failed to end stream");
        }

        await connection.commit();

        // Emit socket event
        const io = getIO();
        io.emit('stream_ended', {
            stream_id,
            user_id,
            timestamp: new Date()
        });

        res.status(200).json({
            status: 200,
            message: "Stream ended successfully",
            data: {
                stream_id,
                status: 'end'
            }
        });

    } catch (e) {
        await connection.rollback();
        console.log("Error ending stream:", e);
        res.status(500).json({
            status: 500,
            message: "Internal server error: Unable to end stream"
        });
    } finally {
        connection.release();
    }
};

export const get_video_lives = async (req, res) => {
    try {
        const [result] = await mysql_db.query(
            `SELECT
    u.user_id,
    u.full_name,
    COALESCE(un.username, '') AS username,
    u.profile_picture,
    ul.country,
    ul.country_code,
    COALESCE(uvl.vip_level_id, 0) AS vip_level_id,
    us.stream_id,
    us.stream_url,
    us.started_at
    FROM user_streams us
    INNER JOIN users u
        ON u.user_id = us.user_id
        AND u.is_active = 1
    LEFT JOIN usernames un
        ON un.user_id = u.user_id
        AND un.is_active = 1
    LEFT JOIN user_location ul
        ON ul.location_id = (
            SELECT MAX(location_id)
            FROM user_location
            WHERE user_id = u.user_id
        )
    LEFT JOIN user_vip_levels uvl
        ON uvl.user_id = u.user_id
        AND uvl.is_active = 1
    WHERE us.is_live = 1
    AND us.is_audio = 0
    ORDER BY
    COALESCE(uvl.vip_level_id, 0) DESC,
    us.started_at DESC;`
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No video rooms found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Live video rooms found",
            data: result,
        })
    } catch (e) {
        console.log("Error while executing get_live_users: ", e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

export const get_audio_lives = async (req, res) => {
    try {
        const [result] = await mysql_db.query(
            `SELECT
    u.user_id,
    u.full_name,
    COALESCE(un.username, '') AS username,
    u.profile_picture,
    ul.country,
    ul.country_code,
    COALESCE(uvl.vip_level_id, 0) AS vip_level_id,
    us.stream_id,
    us.stream_url,
    us.started_at
    FROM user_streams us
    INNER JOIN users u
        ON u.user_id = us.user_id
        AND u.is_active = 1
    LEFT JOIN usernames un
        ON un.user_id = u.user_id
        AND un.is_active = 1
    LEFT JOIN user_location ul
        ON ul.location_id = (
            SELECT MAX(location_id)
            FROM user_location
            WHERE user_id = u.user_id
        )
    LEFT JOIN user_vip_levels uvl
        ON uvl.user_id = u.user_id
        AND uvl.is_active = 1
    WHERE us.is_live = 1
    AND us.is_audio = 1
    ORDER BY
        COALESCE(uvl.vip_level_id, 0) DESC,
        us.started_at DESC;`
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No audio rooms found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Live Audio rooms fetched",
            data: result
        });
    } catch (e) {
        console.log("Error while executing get_live_users: ", e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

