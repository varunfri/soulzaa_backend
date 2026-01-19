import { mysql_db } from "../db_config/mysql_connect.js";
import { imagekit } from "../utils/image_kit_config.js";


export const get_coin_packages = async (req, res) => {
    try {
        const [packages] = await mysql_db.query(
            `SELECT * FROM coin_packages ORDER BY package_id ASC`
        );

        const data = packages.map(value => ({
            package_id: value.package_id,
            banner: value.banner,
            coins: parseInt(value.coins),
            price: parseFloat(value.price),
            currency: value.currency,
            add_on_desc: value.add_on_desc,
            bonus_coins: value.bonus_coins,
            is_active: Boolean(value.is_active),
            created_at: value.created_at,
            updated_at: value.updated_at
        }));

        return res.status(200).json({
            status: 200,
            message: "Coin packages fetched successfully",
            data: data,
        });

    } catch (error) {
        console.error("Error fetching coin packages:", error);

        return res.status(500).json({
            status: 500,
            message: "Failed to fetch coin packages",
        });
    }
};


export const add_coin_package = async (req, res) => {
    const connection = await mysql_db.getConnection();
    if (!req.body || Object.keys(req.body) === 0 || !req.file) {
        return res.status(400).json({
            status: 400,
            message: "Request body and package banner is required"
        });
    }
    try {
        const { coins, price, currency, add_on_desc, bonus_coins } = req.body || {};
        let package_banner;
        if (req.file) {
            try {
                const uploadResult = await imagekit.files.upload({
                    file: req.file.buffer.toString("base64"),
                    fileName: `coin_package_${Date.now()}_${req.file.originalname}`,
                    folder: "/coin_packages",
                    tags: ["coin_packages"]
                });
                package_banner = uploadResult.url;
            } catch (imageKitError) {
                await connection.rollback();
                console.error("ImageKit upload error:", imageKitError);
                return res.status(400).json({
                    status: 400,
                    message: `Failed to upload picture to ImageKit ${imageKitError.message}`,
                });
            }
        }
        await connection.beginTransaction();

        const [result] = await connection.query(`
            Insert into coin_packages
            (coins, price, currency,banner, add_on_desc, bonus_coins) 
            values (?,?,?,?,?,?)`,
            [parseInt(coins), parseFloat(price), (currency).toUpperCase(), package_banner, add_on_desc, parseInt(bonus_coins)]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json(
                {
                    status: 500,
                    message: "Failed to add coin package"
                }
            );
        }

        const insertID = result.insertId;

        const [rows] = await connection.query(
            `select 
            package_id,
            banner,
            coins,
            price,
            currency,
            add_on_desc,
            bonus_coins from coin_packages
            where is_active =1 and package_id=?
            `,
            [insertID]
        );


        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: "Package added successfully",
            data: rows[0]
        });


    } catch (e) {
        await connection.rollback();
        console.log("Error", e);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error ${e.message}`,
        });
    } finally {
        connection.release();
    }
};

export const update_coin_package = async (req, res) => {
    const connection = await mysql_db.getConnection();

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Request body is required"
            });
        }

        const {
            package_id,
            coins,
            price,
            currency,
            add_on_desc,
            bonus_coins,
            is_active
        } = req.body;

        if (!package_id) {
            return res.status(400).json({
                status: 400,
                message: "package_id is required"
            });
        }

        await connection.beginTransaction();


        const [rows] = await connection.query(
            `SELECT * FROM coin_packages WHERE package_id = ?`,
            [package_id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 404,
                message: "Coin package not found"
            });
        }

        const existing = rows[0];
        let package_banner = existing.banner;


        if (req.file) {
            try {
                const uploadResult = await imagekit.files.upload({
                    file: req.file.buffer.toString("base64"),
                    fileName: `coin_package_${Date.now()}_${req.file.originalname}`,
                    folder: "/coin_packages",
                    tags: ["coin_packages"]
                });

                package_banner = uploadResult.url;
            }
            catch (imageKitError) {
                await connection.rollback();
                console.error("ImageKit upload error:", imageKitError);
                return res.status(400).json({
                    status: 400,
                    message: `Failed to upload profile picture to ImageKit ${imageKitError.message}`
                });
            }

        }

        const cur = (currency ?? existing.currency)?.toString().toUpperCase();


        const [result] = await connection.query(
            `
            UPDATE coin_packages SET
                coins = ?,
                price = ?,
                currency = ?,
                banner = ?,
                add_on_desc = ?,
                bonus_coins = ?,
                is_active = ?
            WHERE package_id = ?
            `,
            [
                coins ?? existing.coins,
                price ?? existing.price,
                cur,
                package_banner,
                add_on_desc ?? existing.add_on_desc,
                bonus_coins ?? existing.bonus_coins,
                is_active ?? existing.is_active,
                package_id
            ]
        );

        await connection.commit();

        return res.status(200).json({
            status: 200,
            message: "Coin package updated successfully",
            data: {
                package_id: Number(package_id),
                coins: Number(coins ?? existing.coins),
                price: Number(price ?? existing.price),
                currency: cur,
                banner: package_banner,
                add_on_desc: add_on_desc ?? existing.add_on_desc,
                bonus_coins: Number(bonus_coins ?? existing.bonus_coins),
                is_active: Boolean(Number(is_active) ?? Number(existing.is_active))
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error("Update coin package error:", error);

        return res.status(500).json({
            status: 500,
            message: "Internal Server Error"
        });
    } finally {
        connection.release();
    }
};


export const delete_coin_packages = async (req, res) => {
    const package_id = Number(req.params.package_id);

    if (!package_id || typeof package_id !== 'number') {
        return res.status(400).json({
            status: 400,
            message: "Package id is missing"
        });
    }

    try {

        const [rows] = await mysql_db.query(
            `select * from coin_packages where package_id = ?`,
            [package_id]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 404,
                messaging: `Package is not found with id: ${package_id}`
            });
        }

        const [result] = await mysql_db.query(
            `delete from coin_packages where package_id = ?`,
            [package_id]
        );

        if (result.affectedRows !== 1) {
            return res.status(200).json({
                status: 200,
                messaging: `Coin package of ${package_id} is deleted`
            });
        }

    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: `Internal Server Error: ${e.message}`
        });
    }
};

export const enable_coin_packages = async (req, res) => {
    const package_id = req.params.package_id;

    console.log(`id: ${package_id} ${req.params.package_id}`);
    if (!package_id) {
        return res.status(400).json({
            status: 400,
            message: "Package id is missing"
        });
    }

    try {

        const [rows] = await mysql_db.query(
            `select * from coin_packages where package_id= ? and is_active =1`,
            [package_id]
        );

        if (rows.length === 1) {
            return res.status(409).json({
                status: 409,
                message: "Package is already enabled"
            })
        }

        const [result] = await mysql_db.query(
            `update coin_packages set is_active = 1 where package_id = ?`,
            [package_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: `No package found with ${package_id}`
            });
        }
        return res.status(200).json({
            status: 200,
            message: `Package is enabled for id: ${package_id}`
        });
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: `Internal Server Error: ${e.message}`
        });
    }
};

export const disable_coin_packages = async (req, res) => {
    const package_id = req.params.package_id;
    console.log(`id: ${package_id} ${req.params.package_id}`);

    if (!package_id) {
        return res.status(400).json({
            status: 400,
            message: "Package id is missing"
        });
    }

    try {
        const [rows] = await mysql_db.query(
            `select * from coin_packages where package_id= ? and is_active=0`,
            [package_id]
        );

        if (rows.length === 1) {
            return res.status(409).json({
                status: 409,
                message: "Package is already disabled"
            })
        }

        const [result] = await mysql_db.query(
            `update coin_packages set is_active = 0 where package_id = ?`,
            [package_id]);


        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: `No package found with ${package_id}`
            });
        }

        return res.status(200).json({
            status: 200,
            message: `Package is disabled for id: ${package_id}`
        });
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: `Internal Server Error: ${e.message}`
        });
    }
};