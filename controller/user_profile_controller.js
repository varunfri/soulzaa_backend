import { mysql_db } from "../db_config/mysql_connect.js";

export const profile = async (req, res) => {
    try {

        const userId = req.user.id;
        const [rows] = await mysql_db.query(
            'select id, email, role, created_at from users where id = ?',
            [userId]
        );

        if (!rows.length) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }
        const data = rows[0];

        res.status(200).json(
            {
                status: 200,
                message: "Profile fetched successful",
                data: data
            },
        );


    } catch (error) {
        res.status(500).json({
            status: 500,
            message: `Internal server error ${error}`
        });
    }
};