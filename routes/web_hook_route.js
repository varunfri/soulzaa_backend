import express from "express";
import { exec } from "child_process";


const router = express.Router();

router.post('/github-webhook', (req, res) => {
    exec('git pull && pm2 restart soluzaa_backend');
    res.send('OK');
});

export default router;
