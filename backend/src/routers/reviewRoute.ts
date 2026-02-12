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
} from "../controllers/review-controller";
import {
    verifyAddReview,
    verifyEditReview
} from "../validators/reviewValidation";

const router = Router();


router.get("/", getAllReviews);                     
router.get("/kos/:kosId", getReviewsByKos);        
router.get("/user/:userId", getReviewsByUser);     
router.get("/check/:kosId/:userId", checkUserReview); 
router.get("/can-review/:kosId/:userId", checkCanReview); 
router.get("/:id", getReviewById);                 
router.post("/", verifyAddReview, createReview);   
router.put("/:id", verifyEditReview, updateReview); 
router.put("/:id/reply", replyToReview);           
router.delete("/:id", deleteReview);              

export default router;