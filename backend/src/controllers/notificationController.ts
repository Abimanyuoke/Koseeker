import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).body.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: false,
                message: 'User belum login atau token tidak valid'
            });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: Number(userId),
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            status: true,
            notifications: notifications,
            message: "Notifications retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).body.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: false,
                message: 'User belum login atau token tidak valid'
            });
        }

        const notification = await prisma.notification.update({
            where: {
                id: parseInt(id),
                userId: Number(userId),
            },
            data: {
                isRead: true,
            },
        });

        res.status(200).json({
            status: true,
            data: notification,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).body.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: false,
                message: 'User belum login atau token tidak valid'
            });
        }

        await prisma.notification.updateMany({
            where: {
                userId: Number(userId),
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        res.status(200).json({
            status: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).body.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: false,
                message: 'User belum login atau token tidak valid'
            });
        }

        const count = await prisma.notification.count({
            where: {
                userId: Number(userId),
                isRead: false,
            },
        });

        res.status(200).json({
            status: true,
            count: count,
            message: "Unread count retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
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
