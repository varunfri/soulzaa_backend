import express from "express";
import { getRequestedChats, getActiveChats, getChatMessagesById } from '../controller/chat_controller.js';
import { authorize } from "../middleware/auth_middleware.js";
const router = express();


router.get('/getRequestedChats', authorize, getRequestedChats);

router.get('/getActiveChats', authorize, getActiveChats);

router.get('/chats/:chatId/messages', authorize, getChatMessagesById);


export default router;