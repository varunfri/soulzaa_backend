// here we'll manage the gifts related db,
// getting the gifts and modifying gift related details;
import { mysql_db } from "../db_config/mysql_connect.js";
import { imagekit } from "../utils/image_kit_config.js";

// we use gifts table here!

export const add_gift = async (req, res) => {
    const connection = await mysql_db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if request has body
        if (!req.body || Object.keys(req.body) === 0) {
            return res.status(400).json({
                status: 400,
                message: "Request body is required"
            });
        }

        const { gift_name, coin_cost } = req.body || {};

        // Validate required fields
        if (!gift_name || !coin_cost) {
            return res.status(400).json({
                status: 400,
                message: "Gift name and coin cost are required"
            });
        }

        const [check_name] = await mysql_db.query(`
            select * from gifts where gift_name = ?
            `, [gift_name]);

        if (check_name.length !== 0) {
            return res.status(409).json({
                status: 409,
                message: "Gift already exist with given name"
            });
        }

        // Check if file is provided
        if (!req.file) {
            return res.status(400).json({
                status: 400,
                message: "Gift banner/image is required"
            });
        }

        // Upload image to ImageKit
        let gift_icon_url = "";
        try {
            const uploadResult = await imagekit.files.upload({
                file: req.file.buffer.toString("base64"),
                fileName: `gift_${Date.now()}_${req.file.originalname}`,
                folder: "/gifts",
                tags: ["gift_banner"]
            });
            gift_icon_url = uploadResult.url;
        } catch (imageKitError) {
            await connection.rollback();
            console.error("ImageKit upload error:", imageKitError);
            return res.status(400).json({
                status: 400,
                message: "Failed to upload image to ImageKit",
                error: imageKitError.message
            });
        }

        // Insert gift into database with the ImageKit URL
        const [result] = await connection.query(
            `insert into
            gifts(gift_name, gift_icon_url, coin_cost)
            values (?, ?, ?);
        `, [gift_name, gift_icon_url, coin_cost]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({
                status: 500,
                message: "Internal server error: Unable to add gift"
            });
        }

        await connection.commit();

        const id = result.insertId;

        return res.status(201).json({
            status: 201,
            message: "Gift added successfully",
            data: {
                gift_id: id,
                gift_name,
                gift_icon_url,
                coin_cost
            }
        });
    } catch (e) {
        await connection.rollback();
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "internal server error",
            error: e.message
        });
    } finally {
        connection.release();
    }
};

export const enable_gift = async (req, res) => {
    try {
        const gift_id = Number(req.params.gift_id);


        if (!gift_id) {
            return res.status(400).json({
                status: 400,
                message: "Gift id is required"
            });
        }

        const [result] = await mysql_db.query(
            `update gifts 
            set is_active = 1 
            where gift_id =?;
            `,
            [gift_id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                status: 500,
                message: "Gift not found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Gift enabled successfully"
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }

};

export const disable_gift = async (req, res) => {
    try {
        const gift_id = Number(req.params.gift_id);


        if (!gift_id) {
            return res.status(400).json({
                status: 400,
                message: "Gift id is required"
            });
        }

        const [result] = await mysql_db.query(
            `update gifts 
            set is_active = 0 
            where gift_id =?;
            `,
            [gift_id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                status: 500,
                message: "Gift not found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Gift disabled successfully"
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};


export const is_gift_animate = async (req, res) => {
    try {
        const gift_id = Number(req.params.gift_id);

        if (!req.body || Object.keys(req.body).length === 0 || !gift_id) {
            return res.status(400).json({
                status: 400,
                message: "Request body and Gift Id is required"
            });
        }


        const { is_animate } = req.body;

        if (typeof is_animate !== 'boolean') {
            return res.status(500).json({
                status: 500,
                message: `Value must be boolean`
            });
        }

        const [result] = await mysql_db.query(
            `update gifts 
            set is_animated = ?
            where gift_id = ?`,
            [is_animate ? 1 : 0, gift_id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                status: 500,
                message: `No gift found with gift_id ${gift_id}`
            });
        }

        return res.status(200).json({
            status: 200,
            message: `Gift details updated for gift id: ${gift_id}`
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

export const delete_gift = async (req, res) => {
    try {
        const gift_id = Number(req.params.gift_id);

        if (!gift_id) {
            return res.status(400).json({
                status: 400,
                message: "Gift id is required",
            });
        }

        const [result] = await mysql_db.query(
            `DELETE FROM gifts WHERE gift_id = ?`,
            [gift_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: "Gift not found",
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Gift deleted successfully",
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }

};

export const admin_get_gifts = async (req, res) => {
    try {
        const [result] = await mysql_db.query(`
      SELECT gift_id, gift_name, gift_icon_url, coin_cost, is_active, is_animated
      FROM gifts
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

export const update_gift = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Request body is required"
            });
        }

        const { gift_id, gift_name, coin_cost } = req.body || {};

        if (!gift_id) {
            return res.status(400).json({
                status: 400,
                message: "gift_id is required",
            });
        }

        // Get current gift details
        const [currentGift] = await mysql_db.query(
            `SELECT * FROM gifts WHERE gift_id = ?`,
            [gift_id]
        );

        if (currentGift.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Gift not found",
            });
        }

        // Use existing URL or upload new one if file provided
        let gift_icon_url = currentGift[0].gift_icon_url;

        // If file is provided, upload to ImageKit
        if (req.file) {
            try {
                const uploadResult = await imagekit.files.upload({
                    file: req.file.buffer.toString("base64"),
                    fileName: `gift_${Date.now()}_${req.file.originalname}`,
                    folder: "/gifts",
                    tags: ["gift_banner"]
                });
                gift_icon_url = uploadResult.url;
            } catch (imageKitError) {
                console.error("ImageKit upload error:", imageKitError);
                return res.status(400).json({
                    status: 400,
                    message: "Failed to upload image to ImageKit",
                    error: imageKitError.message
                });
            }
        }

        // Update gift with new or existing URL
        const [result] = await mysql_db.query(
            `UPDATE gifts
            SET gift_name = ?, gift_icon_url = ?, coin_cost = ?
            WHERE gift_id = ?`,
            [gift_name || currentGift[0].gift_name, gift_icon_url, coin_cost || currentGift[0].coin_cost, gift_id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                status: 500,
                message: "Failed to update gift",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Gift details updated successfully",
            data: {
                gift_id,
                gift_name: gift_name || currentGift[0].gift_name,
                gift_icon_url,
                coin_cost: coin_cost || currentGift[0].coin_cost
            }
        });


    } catch (e) {
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: e.message
        });
    }

};

export const add_bulk_gift = async (req, res) => {
    const connection = await mysql_db.getConnection();
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Request body is missing"
            });
        }
        await connection.beginTransaction();
        const { gifts } = req.body;
        for (const gift of gifts) {
            if (!gift.gift_name || !gift.coin_cost || !gift.gift_icon_url) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid gift data"
                });
            }
        }

        const values = gifts.map(g => [
            g.gift_name,
            g.gift_icon_url,
            g.coin_cost
        ]);

        const [result] = await connection.query(
            `INSERT INTO gifts (gift_name, gift_icon_url, coin_cost) VALUES ?`,
            [values]
        );
        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: `Inserted ${result.affectedRows} gifts`

        });

    } catch (e) {
        await connection.rollback();
        console.log(e);
        return res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    } finally {
        connection.release();
    }
};



// we only use this for users's && we use user_gifts table here
export const user_send_gifts = async (req, res) => {
    try { } catch (e) { }
};