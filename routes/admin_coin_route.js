import { get_coin_packages, add_coin_package, update_coin_package, disable_coin_packages, enable_coin_packages } from "../controller/admin_coins_controller.js";
import express from "express";
import { authority, authorize } from "../middleware/auth_middleware.js";
import multer from "multer";


const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.get('/get_coin_packages', authorize, authority('ADMIN'), get_coin_packages);
router.post('/add_coin_package', authorize, authority('ADMIN'), upload.single('package_banner'), add_coin_package);
router.put('/update_coin_package', authorize, authority('ADMIN'), upload.single('package_banner'), update_coin_package);
// router.delete('/delete_coin_packages', authorize, authority('ADMIN'), delete_coin_packages);

router.put('/enable_coin_package/:package_id', authorize, authority('ADMIN'), enable_coin_packages,)
router.put('/disable_coin_package/:package_id', authorize, authority('ADMIN'), disable_coin_packages)


export default router;