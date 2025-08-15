import { Router } from "express";
import {
    getAllBooks,
    getBookByUUID,
    createBook,
    updateStatusBook,
    deleteBook
} from "../controllers/bookController";
import {
    verifyAddBook,
    verifyEditBook,
    verifyUpdateBookStatus
} from "../middlewares/bookValidation";

const router = Router();

// GET Routes
router.get("/", getAllBooks);                       // Get all books
router.get("/:uuid", getBookByUUID);               // Get single book by UUID

// POST Routes
router.post("/", verifyAddBook, createBook);       // Create a new book

// PUT Routes
router.put("/status/:id", verifyUpdateBookStatus, updateStatusBook); // Update book status
router.put("/:id", verifyEditBook, updateStatusBook);                // Update book (general)

// DELETE Routes
router.delete("/:id", deleteBook);                 // Delete a book

export default router;