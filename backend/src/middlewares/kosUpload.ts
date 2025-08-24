import { Request } from "express";
import multer from "multer";
import { BASE_URL } from "../global";
import path from "path";

/** define storage configuration of menu picture  */
const storage = multer.diskStorage({
    destination: (_request: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        /** define location of uploaded picture, make sure that you have create a "public" folder in root folder.
         * then create folder "kos_picture" inside of "public folder"
         */
        cb(null, `${BASE_URL}/public/kos_picture/`)
    },
    filename: (_request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        /** define file name of uploaded file */
        cb(null, `${new Date().getTime().toString()}-${file.originalname}`)
    }
})


const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Hanya file JPG, JPEG, dan PNG yang diperbolehkan"));
    }
};


const uploadFile = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, /** define max size of uploaded file, in this case max size is 100 MB */
    fileFilter
})

export default uploadFile


