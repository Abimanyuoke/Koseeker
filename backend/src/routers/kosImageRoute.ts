import express from "express";
import {
    getKosImages,
    getImageById,
    uploadKosImage,
    uploadMultipleKosImages,
    deleteKosImage,
    deleteMultipleKosImages
} from "../controllers/kosImageController";
import {
    verifyUploadImage,
    verifyUploadMultipleImages,
    verifyDeleteMultipleImages,
    verifyImageId,
    verifyKosId
} from "../middlewares/kosImageValidation";
import uploadFile from "../middlewares/kosUpload";

const app = express();
app.use(express.json());

// Get all images for a specific kos
// GET /kos-images/kos/:kosId
app.get("/kos/:kosId", verifyKosId, getKosImages);

// Get specific image by ID
// GET /kos-images/:id
app.get("/:id", verifyImageId, getImageById);

// Upload a single image to a kos
// POST /kos-images/upload
// Requires: kosId in body, image file
app.post(
    "/upload",
    uploadFile.single("image"),
    verifyUploadImage,
    uploadKosImage
);

// Upload multiple images to a kos
// POST /kos-images/upload-multiple
// Requires: kosId in body, multiple image files
app.post(
    "/upload-multiple",
    uploadFile.array("images", 10),
    verifyUploadMultipleImages,
    uploadMultipleKosImages
);

// Delete a single image
// DELETE /kos-images/:id
app.delete(
    "/:id",
    verifyImageId,
    deleteKosImage
);

// Delete multiple images for a kos
// DELETE /kos-images/kos/:kosId/multiple
// Requires: imageIds array in body
app.delete(
    "/kos/:kosId/multiple",
    verifyKosId,
    verifyDeleteMultipleImages,
    deleteMultipleKosImages
);

export default app;
