import express from "express";
import { protect } from "../middleware/auth_middleware.js";
import { profile } from "../controller/user_profile_controller.js";

const router = express.Router();

router.get('/profile', protect, profile);

export default router;