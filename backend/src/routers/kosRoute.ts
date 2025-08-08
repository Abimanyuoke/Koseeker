import express from "express"
import { getAllKos, createKos, updateKos, deleteMenu } from "../controllers/kosController"
import { verifyAddKos, verifyEditKos } from "../middlewares/kosValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/kosUpload"

const app = express()
app.use(express.json())

app.get(`/`, getAllKos)
app.post(`/`, [uploadFile.single("picture"), verifyAddKos], createKos)
app.put(`/:id`, [uploadFile.single("picture"), verifyEditKos], updateKos)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteMenu)

export default app