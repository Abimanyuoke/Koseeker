import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            message: "Notifications retrieved successfully",
            data: notifications,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const notification = await prisma.notification.update({
            where: {
                id: parseInt(id),
                userId: userId,
            },
            data: {
                isRead: true,
            },
        });

        res.status(200).json({
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        res.status(200).json({
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const count = await prisma.notification.count({
            where: {
                userId: userId,
                isRead: false,
            },
        });

        res.status(200).json({
            message: "Unread count retrieved successfully",
            count: count,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Create notification (utility function for internal use)
export const createNotification = async (
    userId: number,
    title: string,
    message: string,
    type: string,
    relatedId?: number
) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type as any,
                relatedId,
            },
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};
