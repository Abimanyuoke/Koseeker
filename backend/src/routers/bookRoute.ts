import { Router } from "express";
import {
    getAllBooks,
    getBookByUUID,
    createBook,
    updateBookingStatus,
    deleteBook,
    getOwnerBookings
} from "../controllers/bookController";
import {
    verifyAddBook,
    verifyEditBook,
    verifyUpdateBookStatus
} from "../middlewares/bookValidation";
import { verifyToken } from "../middlewares/authorization";

const router = Router();

router.get("/", verifyToken, getAllBooks);
router.get("/owner", verifyToken, getOwnerBookings);
router.get("/:uuid", getBookByUUID);
router.post("/", verifyToken, verifyAddBook, createBook);
router.put("/status/:id", verifyUpdateBookStatus, updateBookingStatus);
router.put("/:id", verifyEditBook, updateBookingStatus);
router.delete("/:id", deleteBook);

export default router;