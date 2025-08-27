import express from "express"
import { getAllKos, getKosById, createKos, updateKos, deleteKos } from "../controllers/kosController"
import { verifyAddKos, verifyEditKos, } from "../middlewares/kosValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/kosUpload"
import { parseFacilities } from "../middlewares/parseFacilities"

const app = express()
app.use(express.json())

app.get(`/`, getAllKos)
app.get(`/:id`, getKosById)
app.post("/", uploadFile.array("picture", 10), parseFacilities, verifyAddKos, createKos,);
app.put(`/:id`, [verifyEditKos, uploadFile.array("images", 10)], updateKos)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteKos)

export default app