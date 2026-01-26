import { Request, Response } from "express";
import { PrismaClient, BookStatus } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Get all reviews
export const getAllReviews = async (request: Request, response: Response) => {
    try {
        const reviews = await prisma.review.findMany({
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
                        address: true,
                        pricePerMonth: true,
                        gender: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return response.status(200).json({
            status: true,
            data: reviews,
            message: `Reviews retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get reviews by kos ID
export const getReviewsByKos = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;

        const reviews = await prisma.review.findMany({
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

        const reviewCount = await prisma.review.count({
            where: { kosId: Number(kosId) }
        });

        return response.status(200).json({
            status: true,
            data: {
                reviews,
                count: reviewCount
            },
            message: `Reviews for kos retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get reviews by user ID
export const getReviewsByUser = async (request: Request, response: Response) => {
    try {
        const { userId } = request.params;

        const reviews = await prisma.review.findMany({
            where: { userId: Number(userId) },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        pricePerMonth: true,
                        gender: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return response.status(200).json({
            status: true,
            data: reviews,
            message: `User reviews retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Get single review by ID
export const getReviewById = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const review = await prisma.review.findUnique({
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
                        address: true,
                        pricePerMonth: true,
                        gender: true
                    }
                }
            }
        });

        if (!review) {
            return response.status(404).json({
                status: false,
                message: `Review not found`
            });
        }

        return response.status(200).json({
            status: true,
            data: review,
            message: `Review retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Create a new review
export const createReview = async (request: Request, response: Response) => {
    try {
        const { kosId, userId, comment } = request.body;

        // Validation
        if (!kosId || !userId || !comment) {
            return response.status(400).json({
                status: false,
                message: `Missing required fields: kosId, userId, and comment are required`
            });
        }

        if (comment.trim().length === 0) {
            return response.status(400).json({
                status: false,
                message: `Review comment cannot be empty`
            });
        }

        // Check if user exists and has role society
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: `User not found`
            });
        }

        if (user.role !== 'society') {
            return response.status(403).json({
                status: false,
                message: `Only users with role 'society' can create reviews`
            });
        }

        // Check if user has an accepted booking for this kos
        const acceptedBooking = await prisma.book.findFirst({
            where: {
                kosId: Number(kosId),
                userId: Number(userId),
                status: 'accept'
            }
        });

        if (!acceptedBooking) {
            return response.status(403).json({
                status: false,
                message: `You can only review a kos after your booking has been accepted`
            });
        }

        // Check if user already reviewed this kos
        const existingReview = await prisma.review.findFirst({
            where: {
                kosId: Number(kosId),
                userId: Number(userId)
            }
        });

        if (existingReview) {
            return response.status(409).json({
                status: false,
                message: `User has already reviewed this kos`
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

        const newReview = await prisma.review.create({
            data: {
                kosId: Number(kosId),
                userId: Number(userId),
                comment: comment.trim()
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
                        address: true,
                        pricePerMonth: true
                    }
                }
            }
        });

        return response.status(201).json({
            status: true,
            data: newReview,
            message: `Review created successfully`
        });
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Update a review
export const updateReview = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { comment } = request.body;

        // Validation
        if (!comment) {
            return response.status(400).json({
                status: false,
                message: `Comment is required`
            });
        }

        if (comment.trim().length === 0) {
            return response.status(400).json({
                status: false,
                message: `Review comment cannot be empty`
            });
        }

        // Check if review exists
        const existingReview = await prisma.review.findUnique({
            where: { id: Number(id) }
        });

        if (!existingReview) {
            return response.status(404).json({
                status: false,
                message: `Review not found`
            });
        }

        const updatedReview = await prisma.review.update({
            where: { id: Number(id) },
            data: {
                comment: comment.trim()
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
                        address: true,
                        pricePerMonth: true
                    }
                }
            }
        });

        return response.status(200).json({
            status: true,
            data: updatedReview,
            message: `Review updated successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Delete a review
export const deleteReview = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        // Check if review exists
        const existingReview = await prisma.review.findUnique({
            where: { id: Number(id) }
        });

        if (!existingReview) {
            return response.status(404).json({
                status: false,
                message: `Review not found`
            });
        }

        const deletedReview = await prisma.review.delete({
            where: { id: Number(id) }
        });

        return response.status(200).json({
            status: true,
            data: deletedReview,
            message: `Review deleted successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Check if user has reviewed a specific kos
export const checkUserReview = async (request: Request, response: Response) => {
    try {
        const { kosId, userId } = request.params;

        const review = await prisma.review.findFirst({
            where: {
                kosId: Number(kosId),
                userId: Number(userId)
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
            data: {
                hasReviewed: !!review,
                review: review || null
            },
            message: `Review status retrieved successfully`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Admin reply to review
export const replyToReview = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { replyComment, adminId } = request.body;

        // Validation
        if (!replyComment) {
            return response.status(400).json({
                status: false,
                message: `Reply comment is required`
            });
        }

        if (replyComment.trim().length === 0) {
            return response.status(400).json({
                status: false,
                message: `Reply comment cannot be empty`
            });
        }

        // Check if admin exists and has role owner or superadmin
        const admin = await prisma.user.findUnique({
            where: { id: Number(adminId) }
        });

        if (!admin) {
            return response.status(404).json({
                status: false,
                message: `Admin user not found`
            });
        }

        if (admin.role !== 'owner' && admin.role !== 'superadmin') {
            return response.status(403).json({
                status: false,
                message: `Only users with role 'owner' or 'superadmin' can reply to reviews`
            });
        }

        // Check if review exists
        const review = await prisma.review.findUnique({
            where: { id: Number(id) },
            include: {
                kos: true
            }
        });

        if (!review) {
            return response.status(404).json({
                status: false,
                message: `Review not found`
            });
        }

        // If admin is owner, check if they own the kos
        if (admin.role === 'owner' && review.kos.userId !== admin.id) {
            return response.status(403).json({
                status: false,
                message: `You can only reply to reviews for your own kos`
            });
        }

        const updatedReview = await prisma.review.update({
            where: { id: Number(id) },
            data: {
                replyComment: replyComment.trim(),
                replyAt: new Date()
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
                        address: true,
                        pricePerMonth: true
                    }
                }
            }
        });

        return response.status(200).json({
            status: true,
            data: updatedReview,
            message: `Reply added successfully`
        });
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

// Check if user can review (has accepted booking)
export const checkCanReview = async (request: Request, response: Response) => {
    try {
        const { kosId, userId } = request.params;

        // Check if user exists and has role society
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: `User not found`
            });
        }

        if (user.role !== 'society') {
            return response.status(200).json({
                status: true,
                data: {
                    canReview: false,
                    reason: 'Only users with role society can review'
                },
                message: `User cannot review`
            });
        }

        // Check if user has an accepted booking
        const acceptedBooking = await prisma.book.findFirst({
            where: {
                kosId: Number(kosId),
                userId: Number(userId),
                status: 'accept'
            }
        });

        if (!acceptedBooking) {
            return response.status(200).json({
                status: true,
                data: {
                    canReview: false,
                    reason: 'You need an accepted booking to review this kos'
                },
                message: `User cannot review`
            });
        }

        // Check if user already reviewed
        const existingReview = await prisma.review.findFirst({
            where: {
                kosId: Number(kosId),
                userId: Number(userId)
            }
        });

        if (existingReview) {
            return response.status(200).json({
                status: true,
                data: {
                    canReview: false,
                    reason: 'You have already reviewed this kos'
                },
                message: `User cannot review`
            });
        }

        return response.status(200).json({
            status: true,
            data: {
                canReview: true,
                reason: null
            },
            message: `User can review`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};