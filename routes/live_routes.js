// in this we will be having all the routes like, 
// creating a live, stoping and others

import express from "express";
import {
    get_audio_lives,
    get_video_lives,
    get_video_stream_history,
    get_audio_stream_history,
    get_live_earnings,

    // start_live,
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
router.get('/video_history', authorize, get_video_stream_history);
router.get('/audio_history', authorize, get_audio_stream_history);
router.get('/earnings/:stream_id', authorize, get_live_earnings);

// Live control routes
// router.post('/start', authorize, start_live);
router.post('/go_live', authorize, go_live);
router.put('/pause/:stream_id', authorize, pause_live);
router.put('/resume/:stream_id', authorize, resume_live);
router.put('/end/:stream_id', authorize, end_live);



export default router;