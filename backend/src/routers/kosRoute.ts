import express from "express"
import { getAllKos, getKosById, createKos, updateKos, deleteKos, getPromoKos } from "../controllers/kos-controller"
import { verifyAddKos, verifyEditKos, } from "../validators/kosValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization-middleware"
import uploadFile from "../middlewares/kos-upload-middleware"
import { parseFacilities } from "../middlewares/parse-facilities-middleware"

const app = express()
app.use(express.json())

app.get(`/`, getAllKos)
app.get(`/promo`, getPromoKos)
app.get(`/:id`, getKosById)
app.post("/", uploadFile.array("picture", 10), parseFacilities, verifyAddKos, createKos,);
app.put(`/:id`, [verifyEditKos, uploadFile.array("images", 10)], updateKos)
app.delete(`/:id`, deleteKos)

export default app