import { Router } from "express";
import {
    getLikesByKos,
    getLikesByUser,
    createLike,
    deleteLike,
    toggleLike,
    checkUserLike
} from "../controllers/likeController";
import {
    verifyAddLike,
    verifyToggleLike,
    verifyDeleteLike
} from "../middlewares/likeValidaiton";

const router = Router();
router.get("/kos/:kosId", getLikesByKos);           
router.get("/user/:userId", getLikesByUser);
router.get("/check/:kosId/:userId", checkUserLike);  
router.post("/", verifyAddLike, createLike);
router.post("/toggle", verifyToggleLike, toggleLike); 
router.delete("/", verifyDeleteLike, deleteLike);

export default router;