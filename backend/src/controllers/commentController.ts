import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Get all comments
export const getAllComments = async (request: Request, response: Response) => {
    try {
        const comments = await prisma.comment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true
                    }
                },
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return response.status(200).json({
            status: true,
            data: comments,
            message: `Comments retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get comments by kos ID
export const getCommentsByKos = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;

        const comments = await prisma.comment.findMany({
            where: { kosId: Number(kosId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const commentCount = await prisma.comment.count({
            where: { kosId: Number(kosId) }
        });

        return response.status(200).json({
            status: true,
            data: {
                comments,
                count: commentCount
            },
            message: `Comments for kos retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get comments by user ID
export const getCommentsByUser = async (request: Request, response: Response) => {
    try {
        const { userId } = request.params;

        const comments = await prisma.comment.findMany({
            where: { userId: Number(userId) },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        pricePerMonth: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return response.status(200).json({
            status: true,
            data: comments,
            message: `User comments retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get single comment by ID
export const getCommentById = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true
                    }
                },
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            }
        });

        if (!comment) {
            return response.status(404).json({
                status: false,
                message: `Comment not found`
            });
        }

        return response.status(200).json({
            status: true,
            data: comment,
            message: `Comment retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Create a new comment
export const createComment = async (request: Request, response: Response) => {
    try {
        const { kosId, userId, content } = request.body;

        // Validation
        if (!kosId || !userId || !content) {
            return response.status(400).json({
                status: false,
                message: `Missing required fields: kosId, userId, and content are required`
            });
        }

        if (content.trim().length === 0) {
            return response.status(400).json({
                status: false,
                message: `Comment content cannot be empty`
            });
        }

        // Check if kos exists
        const kosExists = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kosExists) {
            return response.status(404).json({
                status: false,
                message: `Kos not found`
            });
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!userExists) {
            return response.status(404).json({
                status: false,
                message: `User not found`
            });
        }

        const newComment = await prisma.comment.create({
            data: {
                kosId: Number(kosId),
                userId: Number(userId),
                content: content.trim()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true
                    }
                },
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            }
        });

        return response.status(201).json({
            status: true,
            data: newComment,
            message: `Comment created successfully`
        });
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Update a comment
export const updateComment = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { content } = request.body;

        // Validation
        if (!content) {
            return response.status(400).json({
                status: false,
                message: `Content is required`
            });
        }

        if (content.trim().length === 0) {
            return response.status(400).json({
                status: false,
                message: `Comment content cannot be empty`
            });
        }

        // Check if comment exists
        const existingComment = await prisma.comment.findUnique({
            where: { id: Number(id) }
        });

        if (!existingComment) {
            return response.status(404).json({
                status: false,
                message: `Comment not found`
            });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: Number(id) },
            data: {
                content: content.trim()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true
                    }
                },
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            }
        });

        return response.status(200).json({
            status: true,
            data: updatedComment,
            message: `Comment updated successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Delete a comment
export const deleteComment = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        // Check if comment exists
        const existingComment = await prisma.comment.findUnique({
            where: { id: Number(id) }
        });

        if (!existingComment) {
            return response.status(404).json({
                status: false,
                message: `Comment not found`
            });
        }

        const deletedComment = await prisma.comment.delete({
            where: { id: Number(id) }
        });

        return response.status(200).json({
            status: true,
            data: deletedComment,
            message: `Comment deleted successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};
