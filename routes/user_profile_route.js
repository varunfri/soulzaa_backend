import express from "express";
import multer from "multer";
import { authorize } from "../middleware/auth_middleware.js";
import { profile, update_profile } from "../controller/user_profile_controller.js";

const router = express.Router();

// Setup multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.get('/profile', authorize, profile);
router.put('/update_profile', authorize, upload.single('profile_picture'), update_profile);

export default router;