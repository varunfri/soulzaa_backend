// in this we will be having all the routes like, 
// creating a live, stoping and others

import express from "express";
import {
    get_audio_lives,
    get_video_lives,
    start_live,
    go_live,
    pause_live,
    resume_live,
    end_live
} from "../controller/live_controller.js";
import { authorize } from "../middleware/auth_middleware.js";

const router = express.Router();

// Get routes
router.get('/get_audio_lives', authorize, get_audio_lives);
router.get('/get_video_lives', authorize, get_video_lives);

// Live control routes
router.post('/start', authorize, start_live);
router.post('/go_live', authorize, go_live);
router.post('/pause', authorize, pause_live);
router.post('/resume', authorize, resume_live);
router.post('/end', authorize, end_live);

export default router;