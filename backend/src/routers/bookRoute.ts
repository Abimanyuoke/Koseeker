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
import { verifyToken } from "../middlewares/authorization";

const router = Router();

// GET Routes
router.get("/", verifyToken, getAllBooks);
router.get("/:uuid", getBookByUUID);

// POST Routes
router.post("/", verifyToken, verifyAddBook, createBook);

// PUT Routes
router.put("/status/:id", verifyUpdateBookStatus, updateStatusBook);
router.put("/:id", verifyEditBook, updateStatusBook);

// DELETE Routes
router.delete("/:id", deleteBook);

export default router;