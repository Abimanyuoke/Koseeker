import { Router } from "express";
import {
    getAllComments,
    getCommentsByKos,
    getCommentsByUser,
    getCommentById,
    createComment,
    updateComment,
    deleteComment
} from "../controllers/commentController";
import {
    verifyAddComment,
    verifyEditComment
} from "../middlewares/commentValidation";

const router = Router();

// GET Routes
router.get("/", getAllComments);                     // Get all comments
router.get("/kos/:kosId", getCommentsByKos);        // Get comments for a specific kos
router.get("/user/:userId", getCommentsByUser);     // Get comments by a specific user
router.get("/:id", getCommentById);                 // Get single comment by ID

// POST Routes
router.post("/", verifyAddComment, createComment);  // Create a new comment

// PUT Routes
router.put("/:id", verifyEditComment, updateComment); // Update a comment

// DELETE Routes
router.delete("/:id", deleteComment);               // Delete a comment

export default router;