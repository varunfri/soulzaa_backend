import express from "express";
import { sign_up, sign_in, refreshToken } from "../controller/auth_controller.js";

// create a router 

const router = express.Router();


router.post('/sign_up', sign_up);
router.post('/sign_in', sign_in);
router.get('/refresh_token', refreshToken)
export default router;