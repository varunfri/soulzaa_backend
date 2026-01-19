import express from "express";
import multer from "multer";
import { authorize, authority } from "../middleware/auth_middleware.js";
import { enable_gift, disable_gift, admin_get_gifts, update_gift, delete_gift, add_gift, add_bulk_gift, is_gift_animate } from "../controller/admin_gifts_controller.js";

const router = express();

// Setup multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// enable
router.put('/enable_gift/:gift_id', authorize, authority('ADMIN'), enable_gift);

//  disable gifts
router.put('/disable_gift/:gift_id', authorize, authority('ADMIN'), disable_gift);

// update is gift_animated 
router.put('/is_gift_animated/:gift_id', authorize, authority('ADMIN'), is_gift_animate);
// delete_gift
router.delete('/delete_gift/:gift_id', authorize, authority('ADMIN'), delete_gift);

//get gifts
router.get('/get_gifts', authorize, authority('ADMIN'), admin_get_gifts);

//update_gifts
router.put('/update_gift', authorize, authority('ADMIN'), upload.single('gift_banner'), update_gift);

//add gifts
router.post('/add_gift', authorize, authority('ADMIN'), upload.single('gift_banner'), add_gift);

//add bulk gifts
// router.post('/add_bulk_gifts', authorize, authority('ADMIN'), add_bulk_gift);
export default router;
