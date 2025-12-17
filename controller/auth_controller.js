import bcrypt from "bcrypt";
import { mysql_db } from "../db_config/mysql_connect.js";
import { generateJwt, generateRefresh } from "../utils/token.js";
import jwt from 'jsonwebtoken';
// func() for register the user 

export const sign_up = async (req, res) => {
    console.log('req.body:', req.body);
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            status: 400,
            message: "Email and password is required"
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {

        await mysql_db.query(
            'Insert into users (email, password_hash) values (?, ?)',
            [email, passwordHash]
        );

        res.status(201).json({
            status: 201,
            message: "User registered successfully",
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                status: 409,
                message: "User already exist",
            });
        }
        throw error;

    }
};

export const sign_in = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        const [rows] = await mysql_db.query(
            'select id, password_hash,role from users where email = ? and is_active =1',
            [email]
        );
        if (rows.length === 0) {
            return res.status(401).json(
                {
                    status: 401,
                    message: "Invalid Credentials",
                }
            );
        }


        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                status: 401
                , message: "Invalid Credentials"
            });
        }

        const payload = { id: user.id, role: user.role };
        const jwtToken = generateJwt(payload);
        const refreshToken = generateRefresh(payload);

        res.status(200)
            .header('Authorization', `Bearer ${jwtToken}`)
            .header('X-Refresh-Token', refreshToken).json({
                status: 200,
                message: "Login Successful",
            });
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({
                status: 500,
                message: "Internal server error",
            });
        }
        console.error("Error in sign_in:", error);
    }
};

export const refreshToken = async (req, res) => {
    const refreshToken = req.get('X-Refresh-Token') || "";

    console.log(refreshToken);

    if (!refreshToken) {
        return res.status(401).json({
            status: 401,
            message: "Refresh token is required"
        });
    }

    //verify the token 
    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const payload = { id: decode.id, role: decode.role };

        const newJwt = generateJwt(payload);

        res.status(200).header('Authorization', `Bearer ${newJwt}`).json({
            status: 200,
            message: "Token refresh success"
        });

    } catch (error) {
        return res.status(403).json({
            status: 403,
            message: "Invalid refresh token"
        });
    }
};