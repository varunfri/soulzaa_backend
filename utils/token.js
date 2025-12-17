import jwt from "jsonwebtoken";

export const generateJwt = (payload) => {
    return jwt.sign(
        payload, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
};

export const generateRefresh = (payload) => {
    return jwt.sign(
        payload,
        process.env.REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_EXPIRY
        }
    );
};