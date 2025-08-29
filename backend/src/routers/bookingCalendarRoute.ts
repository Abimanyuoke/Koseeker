import express from 'express'
import {
    getBookingCalendar,
    initializeKosCalendar
} from '../controllers/bookingCalendarController'
import { verifyToken } from '../middlewares/authorization'

const router = express.Router()

// Get booking calendar for a kos (public)
router.get('/:kosId', getBookingCalendar)

// Initialize calendar for a kos (owner only)
router.post('/:kosId/initialize', verifyToken, initializeKosCalendar)

export default router
