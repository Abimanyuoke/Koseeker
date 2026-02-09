import express from 'express'
import {
    getBookingCalendar,
    initializeKosCalendar
} from '../controllers/bookingCalendarController'
import { verifyToken } from '../middlewares/authorization'

const router = express.Router()

router.get('/:kosId', getBookingCalendar)
router.post('/:kosId/initialize', verifyToken, initializeKosCalendar)

export default router
