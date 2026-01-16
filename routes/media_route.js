import express from "express";
import {
    uploadChatMedia,
    deleteMediaFile,
    getUploadToken,
    bulkUploadMedia,
    getMediaMetadata,
    upload,
} from "../controller/media_controller.js";
import { authorize } from "../middleware/auth_middleware.js";

const router = express.Router();

/**
 * Media Upload Endpoints
 */

// Single file upload
router.post("/upload-chat-media", authorize, upload.single("file"), uploadChatMedia);

// Bulk file upload
router.post("/bulk-upload", authorize, upload.array("files", 10), bulkUploadMedia);

// Get authentication token for client-side upload
router.get("/get-upload-token", authorize, getUploadToken);

/**
 * Media Management
 */

// Delete file
router.post("/delete", authorize, deleteMediaFile);

// Get file metadata
router.get("/:fileId/metadata", authorize, getMediaMetadata);

export default router;
