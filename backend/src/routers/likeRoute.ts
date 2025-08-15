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

// GET Routes
router.get("/kos/:kosId", getLikesByKos);           // Get all likes for a specific kos
router.get("/user/:userId", getLikesByUser);        // Get all likes by a specific user
router.get("/check/:kosId/:userId", checkUserLike); // Check if user has liked a kos

// POST Routes
router.post("/", verifyAddLike, createLike);        // Create a new like
router.post("/toggle", verifyToggleLike, toggleLike); // Toggle like/unlike

// DELETE Routes
router.delete("/", verifyDeleteLike, deleteLike);   // Remove a like

export default router;