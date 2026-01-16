import multer from "multer";
import jwt from "jsonwebtoken";
import { imagekit } from "../utils/image_kit_config.js";

// ImageKit configuration


// Multer memory storage configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedMimes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/mpeg",
            "video/quicktime",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only images and videos are allowed."));
        }
    },
});

/**
 * Upload chat media (images/videos)
 * POST /media/upload-chat-media
 * Multipart form-data with "file" field
 */
export const uploadChatMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 400,
                message: "File is required",
                success: false,
            });
        }

        const { chatId } = req.body;
        if (!chatId) {
            return res.status(400).json({
                status: 400,
                message: "Chat ID is required",
                success: false,
            });
        }

        // Determine file type
        const mimeType = req.file.mimetype;
        let messageType = "file";
        if (mimeType.startsWith("image/")) {
            messageType = "image";
        } else if (mimeType.startsWith("video/")) {
            messageType = "video";
        }

        // Generate unique file name
        const timestamp = Date.now();
        const fileName = `chat_${chatId}_${timestamp}_${req.file.originalname}`;

        // Upload to ImageKit
        const result = await imagekit.files.upload({
            file: req.file.buffer.toString("base64"),
            fileName: fileName,
            folder: `/uploads/chat/${chatId}`,
            tags: ["chat", "media"],
        });

        // Return upload result
        return res.status(200).json({
            status: 200,
            message: "File uploaded successfully",
            success: true,
            data: {
                url: result.url,
                fileId: result.fileId,
                fileName: result.name,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                messageType,
                uploadedAt: new Date(),
            },
        });
    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to upload file",
            error: error.message,
        });
    }
};

/**
 * Delete media file from ImageKit
 * POST /media/delete
 * Body: { fileId }
 */
export const deleteMediaFile = async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({
                status: 400,
                message: "File ID is required",
                success: false,
            });
        }

        await imagekit.files.delete(fileId);

        return res.status(200).json({
            status: 200,
            message: "File deleted successfully",
            success: true,
        });
    } catch (error) {
        console.error("ImageKit Delete Error:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to delete file",
            error: error.message,
        });
    }
};

/**
 * Get upload token for client-side upload
 * This allows clients to upload directly to ImageKit without going through server
 * Using JWT token generation as per ImageKit documentation
 * GET /media/get-upload-token
 */
export const getUploadToken = async (req, res) => {
    try {
        // Upload payload - parameters that will be included in the upload request
        const uploadPayload = {
            useUniqueFileName: true,
            tags: ["chat", "media"],
            folder: "/uploads/chat",
        };

        // Current timestamp (issued at)
        const iat = Math.floor(Date.now() / 1000);

        // Expiration time (must not exceed iat by more than 3600 seconds - 1 hour)
        const exp = iat + 3600; // 1 hour from now

        // Create JWT payload
        const jwtPayload = {
            ...uploadPayload,
            iat,
            exp,
        };

        // Generate JWT token using private key
        const token = jwt.sign(jwtPayload, process.env.Image_Kit_Private_Key_Owner, {
            algorithm: "HS256",
            header: {
                alg: "HS256",
                typ: "JWT",
                kid: process.env.Image_Kit_Public_Key_Owner,
            },
        });

        return res.status(200).json({
            status: 200,
            message: "Upload token generated successfully",
            success: true,
            data: {
                token,
                expire: exp,
                publicKey: process.env.Image_Kit_Public_Key_Owner,
                urlEndpoint: process.env.Image_Kit_URL,
                uploadUrl: "https://upload.imagekit.io/api/v2/files/upload",
            },
        });
    } catch (error) {
        console.error("Error generating upload token:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to generate upload token",
            error: error.message,
        });
    }
};


/**
 * Bulk upload multiple files
 * POST /media/bulk-upload
 */
export const bulkUploadMedia = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "No files provided",
                success: false,
            });
        }

        const { chatId } = req.body;
        if (!chatId) {
            return res.status(400).json({
                status: 400,
                message: "Chat ID is required",
                success: false,
            });
        }

        const uploadedFiles = await Promise.all(
            req.files.map(async (file) => {
                try {
                    const mimeType = file.mimetype;
                    let messageType = "file";
                    if (mimeType.startsWith("image/")) {
                        messageType = "image";
                    } else if (mimeType.startsWith("video/")) {
                        messageType = "video";
                    }

                    const timestamp = Date.now();
                    const fileName = `chat_${chatId}_${timestamp}_${file.originalname}`;

                    const result = await imagekit.files.upload({
                        file: file.buffer.toString("base64"),
                        fileName: fileName,
                        folder: `/uploads/chat/${chatId}`,
                        tags: ["chat", "media"],
                    });

                    return {
                        success: true,
                        url: result.url,
                        fileId: result.fileId,
                        fileName: result.name,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                        messageType,
                        originalName: file.originalname,
                    };
                } catch (error) {
                    return {
                        success: false,
                        fileName: file.originalname,
                        error: error.message,
                    };
                }
            })
        );

        const successCount = uploadedFiles.filter((f) => f.success).length;
        const failureCount = uploadedFiles.filter((f) => !f.success).length;

        return res.status(200).json({
            status: 200,
            message: `${successCount} file(s) uploaded, ${failureCount} failed`,
            success: successCount > 0,
            data: uploadedFiles,
            summary: {
                totalAttempted: uploadedFiles.length,
                successful: successCount,
                failed: failureCount,
            },
        });
    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Bulk upload failed",
            error: error.message,
        });
    }
};

/**
 * Get media metadata
 * GET /media/:fileId/metadata
 */
export const getMediaMetadata = async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            return res.status(400).json({
                status: 400,
                message: "File ID is required",
                success: false,
            });
        }

        const fileMetadata = await imagekit.files.details(fileId);

        return res.status(200).json({
            status: 200,
            message: "Metadata retrieved",
            success: true,
            data: fileMetadata,
        });
    } catch (error) {
        console.error("Error getting metadata:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Failed to get metadata",
            error: error.message,
        });
    }
};

// Export upload middleware
export { upload };
