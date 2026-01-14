// upload.js or upload-route.js

import { Router } from "express";
import multer, { memoryStorage } from "multer";
import ImageKit from "@imagekit/nodejs";

const router = Router();

// Use memory storage so file stays in RAM briefly
const upload = multer({ storage: memoryStorage() });

// Initialize ImageKit client
const imagekit = new ImageKit({
    publicKey: process.env.Image_Kit_Public_Key_Owner,
    privateKey: process.env.Image_Kit_Private_Key_Owner,
    urlEndpoint: process.env.Image_Kit_URL
});

// Upload endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        // Upload to ImageKit
        const result = await imagekit.files.upload({
            file: req.file.buffer,              // the raw file contents
            fileName: req.file.originalname,    // image name
            folder: "/uploads",                 // optional folder in your ImageKit lib
        });

        return res.status(200).json({
            message: "Upload successful",
            url: result.url,      // final hosted file URL
            fileId: result.fileId // ImageKit file id
        });
    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

export default router;
