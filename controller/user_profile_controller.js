import { mysql_db } from "../db_config/mysql_connect.js";
import { buildAuthPayload } from "../utils/token.js";
import { imagekit } from "../utils/image_kit_config.js";

// Helper function to validate age (must be 18+)
const isAge18Plus = (dob) => {
    if (!dob) return true; // Skip validation if dob not provided
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 18;
};

export const profile = async (req, res) => {
    try {
        //req.user is assigned in middleware using the reference of jwt token
        const userId = req.user.id;
        const [rows] = await mysql_db.query(
            `SELECT
            u.user_id,
            un.username,
            u.email,
            u.full_name,
            u.dob,
            u.gender,
            u.profile_picture,
            r.role_name,
            a.authority_name
            FROM users u
            JOIN usernames un
                ON u.user_id = un.user_id
            JOIN user_roles ur
                ON u.user_id = ur.user_id
            JOIN roles r
                ON ur.role_id = r.role_id
            JOIN role_authorities ra
                ON r.role_id = ra.role_id
            JOIN authorities a
                ON ra.authority_id = a.authority_id
            WHERE u.user_id = ?;
`,
            [userId]
        );

        const { roles, authorities } = buildAuthPayload(rows);

        if (!rows.length) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }
        const user = rows[0];

        const user_data = {
            "id": user.user_id,
            "full_name": user.full_name,
            "profile_picture": user.profile_picture,
            "dob": user.dob,
            "email": user.email,
            "gender": user.gender,
            "username": user.username
        };

        res.status(200).json(
            {
                status: 200,
                message: "Profile fetched successful",
                data: { user_data, roles, authorities }
            },
        );


    } catch (error) {
        res.status(500).json({
            status: 500,
            message: `Internal server error ${error}`
        });
    }


};

export const update_profile = async (req, res) => {
    const connection = await mysql_db.getConnection();

    if (!req.body || Object.keys(req.body) === 0) {
        return res.status(400).json({
            status: 400,
            message: "Request body is required"
        });
    }

    try {
        const userId = req.user.id;

        // Get current user profile
        const [currentUser] = await connection.query(
            `SELECT profile_picture, full_name, dob, gender FROM users WHERE user_id = ?`,
            [userId]
        );

        if (currentUser.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        const { full_name, dob, gender } = req.body || {};
        let profile_picture = currentUser[0].profile_picture;

        // Validate age if dob is provided
        if (dob && !isAge18Plus(dob)) {
            return res.status(400).json({
                status: 400,
                message: "User must be at least 18 years old"
            });
        }

        // If file is provided, upload to ImageKit
        if (req.file) {
            try {
                const uploadResult = await imagekit.files.upload({
                    file: req.file.buffer.toString("base64"),
                    fileName: `profile_${userId}_${Date.now()}_${req.file.originalname}`,
                    folder: "/profile_pictures",
                    tags: ["profile_picture"]
                });
                profile_picture = uploadResult.url;
            } catch (imageKitError) {
                await connection.rollback();
                console.error("ImageKit upload error:", imageKitError);
                return res.status(400).json({
                    status: 400,
                    message: `Failed to upload profile picture to ImageKit ${imageKitError.message}`
                });
            }
        }

        await connection.beginTransaction();

        // Update user profile
        const [result] = await connection.query(
            `UPDATE users 
             SET full_name = ?, dob = ?, gender = ?, profile_picture = ?
             WHERE user_id = ?`,
            [
                full_name || currentUser[0].full_name,
                dob || currentUser[0].dob,
                gender || currentUser[0].gender,
                profile_picture,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({
                status: 500,
                message: "Failed to update profile"
            });
        }

        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: "Profile updated successfully",
            data: {
                user_id: userId,
                full_name: full_name || currentUser[0].full_name,
                dob: dob || currentUser[0].dob,
                gender: gender || currentUser[0].gender,
                profile_picture
            }
        });

    } catch (error) {
        await connection.rollback();
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    } finally {
        connection.release();
    }
};