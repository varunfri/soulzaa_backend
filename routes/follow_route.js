import {
    followUser,
    unfollowUser,
    getFollowersCount,
    getFollowingCount,
    isFollowing
} from "../controller/follow_controller.js";

import express from "express";
import { authorize } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post('/follow', authorize, followUser); //send id's in body
router.post('/unFollow', authorize, unfollowUser);//send id's in body

router.get('/followers/:user_id', authorize, getFollowersCount); //send only user_id
router.get('/following/:user_id', authorize, getFollowingCount); //send only user_id

router.get('/isFollowing', authorize, isFollowing); //pass ?follower_id=0&following_id=1

export default router;
