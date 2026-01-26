import { Router } from "express";
import {
    getAllReviews,
    getReviewsByKos,
    getReviewsByUser,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    checkUserReview,
    replyToReview,
    checkCanReview
} from "../controllers/reviewcontroller";
import {
    verifyAddReview,
    verifyEditReview
} from "../middlewares/reviewValidation";

const router = Router();

// GET Routes
router.get("/", getAllReviews);                     // Get all reviews
router.get("/kos/:kosId", getReviewsByKos);        // Get reviews for a specific kos
router.get("/user/:userId", getReviewsByUser);     // Get reviews by a specific user
router.get("/check/:kosId/:userId", checkUserReview); // Check if user has reviewed a kos
router.get("/can-review/:kosId/:userId", checkCanReview); // Check if user can review
router.get("/:id", getReviewById);                 // Get single review by ID

// POST Routes
router.post("/", verifyAddReview, createReview);   // Create a new review

// PUT Routes
router.put("/:id", verifyEditReview, updateReview); // Update a review
router.put("/:id/reply", replyToReview);           // Admin reply to review

// DELETE Routes
router.delete("/:id", deleteReview);               // Delete a review

export default router;