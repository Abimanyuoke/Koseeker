import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

// Validation for creating a new comment
export const validateCreateComment = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { kosId, userId, content } = request.body;

        // Check required fields
        if (!kosId) {
            return response.status(400).json({
                status: false,
                message: "kosId is required"
            });
        }

        if (!userId) {
            return response.status(400).json({
                status: false,
                message: "userId is required"
            });
        }

        if (!content) {
            return response.status(400).json({
                status: false,
                message: "content is required"
            });
        }

        // Validate data types
        if (isNaN(Number(kosId))) {
            return response.status(400).json({
                status: false,
                message: "kosId must be a valid number"
            });
        }

        if (isNaN(Number(userId))) {
            return response.status(400).json({
                status: false,
                message: "userId must be a valid number"
            });
        }

        if (typeof content !== 'string') {
            return response.status(400).json({
                status: false,
                message: "content must be a string"
            });
        }

        // Validate content length and format
        const trimmedContent = content.trim();

        if (trimmedContent.length === 0) {
            return response.status(400).json({
                status: false,
                message: "content cannot be empty or only whitespace"
            });
        }

        if (trimmedContent.length < 3) {
            return response.status(400).json({
                status: false,
                message: "content must be at least 3 characters long"
            });
        }

        if (trimmedContent.length > 1000) {
            return response.status(400).json({
                status: false,
                message: "content cannot exceed 1000 characters"
            });
        }

        // Check for inappropriate content (basic filtering)
        const inappropriateWords = ['spam', 'scam', 'fake', 'bad word']; // Add more as needed
        const hasInappropriateContent = inappropriateWords.some(word =>
            trimmedContent.toLowerCase().includes(word.toLowerCase())
        );

        if (hasInappropriateContent) {
            return response.status(400).json({
                status: false,
                message: "content contains inappropriate language"
            });
        }

        // Validate if kos exists
        const kosExists = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kosExists) {
            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        // Validate if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!userExists) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Add the validated data to request body
        request.body = {
            kosId: Number(kosId),
            userId: Number(userId),
            content: trimmedContent
        };

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Validation error: ${error}`
        });
    }
};

// Validation for updating a comment
export const validateUpdateComment = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { id } = request.params;
        const { content } = request.body;

        // Validate comment ID
        if (!id || isNaN(Number(id))) {
            return response.status(400).json({
                status: false,
                message: "Valid comment ID is required"
            });
        }

        // Check if comment exists
        const commentExists = await prisma.comment.findUnique({
            where: { id: Number(id) }
        });

        if (!commentExists) {
            return response.status(404).json({
                status: false,
                message: "Comment not found"
            });
        }

        // Validate content if provided
        if (!content) {
            return response.status(400).json({
                status: false,
                message: "content is required"
            });
        }

        if (typeof content !== 'string') {
            return response.status(400).json({
                status: false,
                message: "content must be a string"
            });
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length === 0) {
            return response.status(400).json({
                status: false,
                message: "content cannot be empty or only whitespace"
            });
        }

        if (trimmedContent.length < 3) {
            return response.status(400).json({
                status: false,
                message: "content must be at least 3 characters long"
            });
        }

        if (trimmedContent.length > 1000) {
            return response.status(400).json({
                status: false,
                message: "content cannot exceed 1000 characters"
            });
        }

        // Check for inappropriate content
        const inappropriateWords = ['spam', 'scam', 'fake', 'bad word']; // Add more as needed
        const hasInappropriateContent = inappropriateWords.some(word =>
            trimmedContent.toLowerCase().includes(word.toLowerCase())
        );

        if (hasInappropriateContent) {
            return response.status(400).json({
                status: false,
                message: "content contains inappropriate language"
            });
        }

        // Add the validated data to request body
        request.body.content = trimmedContent;

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Validation error: ${error}`
        });
    }
};

// Validation for deleting a comment
export const validateDeleteComment = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { id } = request.params;

        // Validate comment ID
        if (!id || isNaN(Number(id))) {
            return response.status(400).json({
                status: false,
                message: "Valid comment ID is required"
            });
        }

        // Check if comment exists
        const commentExists = await prisma.comment.findUnique({
            where: { id: Number(id) }
        });

        if (!commentExists) {
            return response.status(404).json({
                status: false,
                message: "Comment not found"
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Validation error: ${error}`
        });
    }
};

// Validation for getting comments by kos
export const validateGetCommentsByKos = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { kosId } = request.params;

        if (!kosId || isNaN(Number(kosId))) {
            return response.status(400).json({
                status: false,
                message: "Valid kosId is required"
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Validation error: ${error}`
        });
    }
};

// Validation for getting comments by user
export const validateGetCommentsByUser = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { userId } = request.params;

        if (!userId || isNaN(Number(userId))) {
            return response.status(400).json({
                status: false,
                message: "Valid userId is required"
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Validation error: ${error}`
        });
    }
};

// Validation for getting single comment
export const validateGetCommentById = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { id } = request.params;

        if (!id || isNaN(Number(id))) {
            return response.status(400).json({
                status: false,
                message: "Valid comment ID is required"
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Validation error: ${error}`
        });
    }
};

// Rate limiting validation (optional - to prevent spam)
const commentCounts = new Map<string, { count: number; resetTime: number }>();

export const validateCommentRateLimit = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { userId } = request.body;
        const userKey = `user_${userId}`;
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        const maxComments = 5; // Max 5 comments per minute per user

        const userData = commentCounts.get(userKey);

        if (!userData || now > userData.resetTime) {
            // Reset or initialize counter
            commentCounts.set(userKey, {
                count: 1,
                resetTime: now + windowMs
            });
        } else {
            // Increment counter
            userData.count++;

            if (userData.count > maxComments) {
                return response.status(429).json({
                    status: false,
                    message: "Too many comments. Please wait before commenting again."
                });
            }
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Rate limit validation error: ${error}`
        });
    }
};
