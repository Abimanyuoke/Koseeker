import express from 'express'
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} from '../controllers/notificationController'
import { verifyToken } from '../middlewares/authorization'

const router = express.Router()

// Get all notifications for the current user
router.get('/', verifyToken, getNotifications)

// Get unread notification count
router.get('/unread-count', verifyToken, getUnreadCount)

// Mark notification as read
router.put('/:id/read', verifyToken, markAsRead)

// Mark all notifications as read
router.put('/mark-all-read', verifyToken, markAllAsRead)

export default router
