import express from 'express'
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    createNotificationAPI
} from '../controllers/notificationController'
import { verifyToken } from '../middlewares/authorization'

const router = express.Router()

router.get('/', verifyToken, getNotifications)
router.get('/unread-count', verifyToken, getUnreadCount)
router.post('/', verifyToken, createNotificationAPI)
router.put('/:id/read', verifyToken, markAsRead)
router.put('/mark-all-read', verifyToken, markAllAsRead)

export default router
