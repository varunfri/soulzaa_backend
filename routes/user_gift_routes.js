import express from "express";
import { send_gift, user_get_gifts } from "../controller/user_gift_controller.js";
 import { authorize } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post('/send_gift', authorize, send_gift);
router.get('/get_gifts', authorize, user_get_gifts);

export default router;