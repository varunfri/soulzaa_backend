import express from "express";
import multer from "multer";
import ImageKit from "@imagekit/nodejs";

const router = express.Router();

// Multer memory storage
const upload = multer({
    storage: multer.memoryStorage(),
});

// ImageKit config
export const imagekit = new ImageKit({
    publicKey: process.env.Image_Kit_Public_Key_Owner,
    privateKey: process.env.Image_Kit_Private_Key_Owner,
    urlEndpoint: process.env.Image_Kit_URL,
});



// Upload API
router.post("/upload",
    // upload.single("file"), 
    async (req, res) => {
        try {
            // if (!req.file) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "File is required",
            //     });
            // }

            // const result = await imagekit.files.upload({
            //     file: req.file.buffer.toString("base64"), // REQUIRED
            //     fileName: req.file.originalname,
            //     folder: "/uploads",
            // });

            // return res.status(200).json({
            //     success: true,
            //     url: result.url,
            //     fileId: result.fileId,
            //     name: result.name,
            // });
                const token = await imagekit.
            res.json({

            });
        } catch (error) {
            console.error("ImageKit Upload Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message,
                details: error?.error || null,
            });
        }
    });

export default router;
