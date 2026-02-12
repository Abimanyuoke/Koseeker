import { Router } from "express";
import {
    getAllBooks,
    getBookByUUID,
    createBook,
    updateBook,
    updateBookingStatus,
    deleteBook,
    getOwnerBookings
} from "../controllers/book-controller";
import {
    verifyAddBook,
    verifyEditBook,
    verifyUpdateBookStatus
} from "../validators/bookValidation";
import { verifyToken } from "../middlewares/authorization-middleware";

const router = Router();

router.get("/", verifyToken, getAllBooks);
router.get("/owner", verifyToken, getOwnerBookings);
router.get("/:uuid", getBookByUUID);
router.post("/", verifyToken, verifyAddBook, createBook);
router.put("/status/:id", verifyUpdateBookStatus, updateBookingStatus);
router.put("/:id", verifyEditBook, updateBook);
router.delete("/:id", deleteBook);

export default router;