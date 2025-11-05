import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Get all likes for a specific kos
export const getLikesByKos = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;

        const likes = await prisma.like.findMany({
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

        const likeCount = await prisma.like.count({
            where: { kosId: Number(kosId) }
        });

        return response.status(200).json({
            status: true,
            data: {
                likes,
                count: likeCount
            },
            message: `Likes for kos retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get all likes by a specific user
export const getLikesByUser = async (request: Request, response: Response) => {
    try {
        const { userId } = request.params;

        const likes = await prisma.like.findMany({
            where: { userId: Number(userId) },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        pricePerMonth: true,
                        discountPercent: true,
                        gender: true,
                        kampus: true,
                        kota: true,
                        images: {
                            select: {
                                file: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return response.status(200).json({
            status: true,
            data: likes,
            message: `User likes retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Create a new like (like a kos)
export const createLike = async (request: Request, response: Response) => {
    try {
        const { kosId, userId } = request.body;

        // Check if user already liked this kos
        const existingLike = await prisma.like.findUnique({
            where: {
                kosId_userId: {
                    kosId: Number(kosId),
                    userId: Number(userId)
                }
            }
        });

        if (existingLike) {
            return response.status(409).json({
                status: false,
                message: `User has already liked this kos`
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

        const newLike = await prisma.like.create({
            data: {
                kosId: Number(kosId),
                userId: Number(userId)
            },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return response.status(201).json({
            status: true,
            data: newLike,
            message: `Kos liked successfully`
        });
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Remove a like (unlike a kos)
export const deleteLike = async (request: Request, response: Response) => {
    try {
        const { kosId, userId } = request.body;

        // Find the like
        const existingLike = await prisma.like.findUnique({
            where: {
                kosId_userId: {
                    kosId: Number(kosId),
                    userId: Number(userId)
                }
            }
        });

        if (!existingLike) {
            return response.status(404).json({
                status: false,
                message: `Like not found`
            });
        }

        const deletedLike = await prisma.like.delete({
            where: {
                kosId_userId: {
                    kosId: Number(kosId),
                    userId: Number(userId)
                }
            }
        });

        return response.status(200).json({
            status: true,
            data: deletedLike,
            message: `Like removed successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Toggle like (like if not liked, unlike if already liked)
export const toggleLike = async (request: Request, response: Response) => {
    try {
        const { kosId, userId } = request.body;

        // Check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                kosId_userId: {
                    kosId: Number(kosId),
                    userId: Number(userId)
                }
            }
        });

        if (existingLike) {
            // Unlike - delete the like
            await prisma.like.delete({
                where: {
                    kosId_userId: {
                        kosId: Number(kosId),
                        userId: Number(userId)
                    }
                }
            });

            // Get updated like count
            const likeCount = await prisma.like.count({
                where: { kosId: Number(kosId) }
            });

            return response.status(200).json({
                status: true,
                data: { liked: false, count: likeCount },
                message: `Kos unliked successfully`
            });
        } else {
            // Like - create new like
            // Check if kos and user exist
            const [kosExists, userExists] = await Promise.all([
                prisma.kos.findUnique({ where: { id: Number(kosId) } }),
                prisma.user.findUnique({ where: { id: Number(userId) } })
            ]);

            if (!kosExists) {
                return response.status(404).json({
                    status: false,
                    message: `Kos not found`
                });
            }

            if (!userExists) {
                return response.status(404).json({
                    status: false,
                    message: `User not found`
                });
            }

            const newLike = await prisma.like.create({
                data: {
                    kosId: Number(kosId),
                    userId: Number(userId)
                }
            });

            // Get updated like count
            const likeCount = await prisma.like.count({
                where: { kosId: Number(kosId) }
            });

            return response.status(201).json({
                status: true,
                data: { liked: true, count: likeCount, like: newLike },
                message: `Kos liked successfully`
            });
        }
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Check if user has liked a specific kos
export const checkUserLike = async (request: Request, response: Response) => {
    try {
        const { kosId, userId } = request.params;

        const like = await prisma.like.findUnique({
            where: {
                kosId_userId: {
                    kosId: Number(kosId),
                    userId: Number(userId)
                }
            }
        });

        return response.status(200).json({
            status: true,
            data: {
                liked: !!like,
                likeData: like || null
            },
            message: `Like status retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};