import express from "express"
import { getAllKos, createKos, updateKos, deleteKos } from "../controllers/kosController"
import { verifyAddKos, verifyEditKos, verifyKosFiles } from "../middlewares/kosValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/kosUpload"
import { parseFacilities } from "../middlewares/parseFacilities"

const app = express()
app.use(express.json())

app.get(`/`, getAllKos)
app.post( "/", uploadFile.array("images", 10), verifyKosFiles, parseFacilities, verifyAddKos, createKos, );
app.put(`/:id`, [uploadFile.single("picture"), verifyEditKos, verifyKosFiles, uploadFile.array("images", 10)], updateKos)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteKos)

export default app