import express from "express"
import { getAllOrders, createOrder, updateStatusOrder, deleteOrder } from "./orderController"
import { verifyAddOrder, verifyEditStatus } from "../backend/src/middlewares/orderValidation"
import { verifyRole, verifyToken } from "../backend/src/middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["USER", "MANAGER"])], getAllOrders)
app.post(`/`, [verifyToken, verifyRole(['MANAGER', 'USER']), verifyAddOrder], createOrder)
app.put(`/:id`, [verifyToken, verifyRole(["MANAGER"]), verifyEditStatus], updateStatusOrder)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteOrder)

export default app