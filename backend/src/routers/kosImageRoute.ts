import express from "express";
import {
    getKosImages,
    getImageById,
    uploadKosImage,
    uploadMultipleKosImages,
    deleteKosImage,
    deleteMultipleKosImages
} from "../controllers/kos-image-controller";
import {
    verifyUploadImage,
    verifyUploadMultipleImages,
    verifyDeleteMultipleImages,
    verifyImageId,
    verifyKosId
} from "../validators/kosImageValidation";
import uploadFile from "../middlewares/kos-upload-middleware";

const app = express();
app.use(express.json());
app.get("/kos/:kosId", verifyKosId, getKosImages);
app.get("/:id", verifyImageId, getImageById);
app.post(
    "/upload",
    uploadFile.single("image"),
    verifyUploadImage,
    uploadKosImage
);
app.post(
    "/upload-multiple",
    uploadFile.array("images", 10),
    verifyUploadMultipleImages,
    uploadMultipleKosImages
);
app.delete(
    "/:id",
    verifyImageId,
    deleteKosImage
);
app.delete(
    "/kos/:kosId/multiple",
    verifyKosId,
    verifyDeleteMultipleImages,
    deleteMultipleKosImages
);

export default app;
