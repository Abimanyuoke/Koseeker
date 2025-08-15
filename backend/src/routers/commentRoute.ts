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
    validateCreateComment,
    validateUpdateComment,
    validateDeleteComment,
    validateGetCommentsByKos,
    validateGetCommentsByUser,
    validateGetCommentById,
    validateCommentRateLimit
} from "../middlewares/commentValidation";

const router = Router();

// GET Routes
router.get("/", getAllComments);                                           // Get all comments
router.get("/kos/:kosId", validateGetCommentsByKos, getCommentsByKos);    // Get comments for a specific kos
router.get("/user/:userId", validateGetCommentsByUser, getCommentsByUser); // Get comments by a specific user
router.get("/:id", validateGetCommentById, getCommentById);               // Get single comment by ID

// POST Routes
router.post("/",
    validateCreateComment,
    validateCommentRateLimit,
    createComment
);                                                                        // Create a new comment

// PUT Routes
router.put("/:id", validateUpdateComment, updateComment);                 // Update a comment

// DELETE Routes
router.delete("/:id", validateDeleteComment, deleteComment);              // Delete a comment

export default router;