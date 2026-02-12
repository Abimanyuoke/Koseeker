import express from 'express'
import {
    getBookingCalendar,
    initializeKosCalendar
} from '../controllers/booking-calender-controller'
import { verifyToken } from '../middlewares/authorization-middleware'

const router = express.Router()

router.get('/:kosId', getBookingCalendar)
router.post('/:kosId/initialize', verifyToken, initializeKosCalendar)

export default router
