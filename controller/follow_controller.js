import { mysql_db } from "../db_config/mysql_connect.js";

// Follow a user
export const followUser = async (req, res) => {
    const connection = await mysql_db.getConnection();
    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
        return res.status(400).json({
            status: 400,
            message: "follower_id and following_id are required",
        });
    }

    if (follower_id === following_id) {
        return res.status(400).json({
            status: 400,
            message: "Cannot follow yourself",
        });
    }

    try {
        await connection.beginTransaction();

        // Insert follow relationship
        const query1 =
            "INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE following_id = following_id";
        await connection.query(query1, [follower_id, following_id]);

        // Update following_count for the follower
        const query2 =
            "UPDATE user_stats SET following_count = following_count + 1 WHERE user_id = ?";
        await connection.query(query2, [follower_id]);

        // Update followers_count for the user being followed
        const query3 =
            "UPDATE user_stats SET followers_count = followers_count + 1 WHERE user_id = ?";
        await connection.query(query3, [following_id]);

        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: "User followed successfully",
            data: {
                follower_id,
                following_id,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error("Follow user error:", error);
        return res.status(500).json({
            status: 500,
            message: "Error following user",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
    const connection = await mysql_db.getConnection();

    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
        return res.status(400).json({
            status: 400,
            message: "follower_id and following_id are required",
        });
    }

    try {
        await connection.beginTransaction();

        // Delete follow relationship
        const query1 =
            "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?";
        await connection.query(query1, [follower_id, following_id]);

        // Decrement following_count for the follower
        const query2 =
            "UPDATE user_stats SET following_count = following_count - 1 WHERE user_id = ? AND following_count > 0";
        await connection.query(query2, [follower_id]);

        // Decrement followers_count for the user being followed
        const query3 =
            "UPDATE user_stats SET followers_count = followers_count - 1 WHERE user_id = ? AND followers_count > 0";
        await connection.query(query3, [following_id]);

        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: "User unfollowed successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Unfollow user error:", error);
        return res.status(500).json({
            status: 500,
            message: "Error unfollowing user",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// Get followers list
export const getFollowersCount = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({
            status: 400,
            message: "user_id is required",
        });
    }

    try {
        const query =
            `SELECT u.* FROM users u 
            INNER JOIN user_follows uf
            ON u.user_id = uf.follower_id
            WHERE uf.following_id = ?`;
        const [followers] = await mysql_db.query(query, [user_id]);

        return res.status(200).json({
            status: 200,
            message: "Followers retrieved successfully",
            count: followers.length,
            data: followers.map(follower => ({
                user_id: follower.user_id,
                full_name: follower.full_name,
                email: follower.email,
                profile_picture: follower.profile_picture,
                bio: follower.bio
            })),
        });
    } catch (error) {
        console.error("Get followers error:", error);
        return res.status(500).json({
            status: 500,
            message: "Error retrieving followers",
            error: error.message,
        });
    }
};

// Get following list
export const getFollowingCount = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({
            status: 400,
            message: "user_id is required",
        });
    }

    try {
        const query =
            `SELECT u.* FROM users u INNER JOIN
             user_follows uf ON u.user_id = uf.following_id 
             WHERE uf.follower_id = ?`;
        const [following] = await mysql_db.query(query, [user_id]);

        return res.status(200).json({
            status: 200,
            message: "Following list retrieved successfully",
            count: following.length,
            data: following.map(follow => ({
                user_id: follow.user_id,
                full_name: follow.full_name,
                email: follow.email,
                profile_picture: follow.profile_picture,
                bio: follow.bio
            })),
        });
    } catch (error) {
        console.error("Get following error:", error);
        return res.status(500).json({
            status: 500,
            message: "Error retrieving following list",
            error: error.message,
        });
    }
};

// Check if user follows another user
export const isFollowing = async (req, res) => {
    const { follower_id, following_id } = req.query;

    if (!follower_id || !following_id) {
        return res.status(400).json({
            status: 400,
            message: "follower_id and following_id are required",
        });
    }

    try {
        const query =
            `SELECT * FROM user_follows WHERE
         follower_id = ? AND following_id = ?`;
        const [result] = await mysql_db.query(query, [follower_id, following_id]);

        return res.status(200).json({
            status: 200,
            message: "Fetched Successfully",
            isFollowing: result.length > 0,
        });
    } catch (error) {
        console.error("Is following check error:", error);
        return res.status(500).json({
            status: 500,
            message: `Error ${error.message}`,
        });
    }
};
