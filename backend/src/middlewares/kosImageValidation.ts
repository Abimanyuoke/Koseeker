import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Schema for uploading a single image
const uploadImageSchema = Joi.object({
    kosId: Joi.number().integer().positive().required().messages({
        'number.base': 'Kos ID must be a number',
        'number.integer': 'Kos ID must be an integer',
        'number.positive': 'Kos ID must be positive',
        'any.required': 'Kos ID is required'
    })
});

// Schema for uploading multiple images
const uploadMultipleImagesSchema = Joi.object({
    kosId: Joi.number().integer().positive().required().messages({
        'number.base': 'Kos ID must be a number',
        'number.integer': 'Kos ID must be an integer',
        'number.positive': 'Kos ID must be positive',
        'any.required': 'Kos ID is required'
    })
});

// Schema for deleting multiple images
const deleteMultipleImagesSchema = Joi.object({
    imageIds: Joi.array()
        .items(Joi.number().integer().positive())
        .min(1)
        .required()
        .messages({
            'array.empty': 'At least one image ID is required',
            'array.min': 'At least one image ID is required',
            'any.required': 'Image IDs array is required'
        })
});

// Middleware for validating single image upload
export const verifyUploadImage = (req: Request, res: Response, next: NextFunction) => {
    const { error } = uploadImageSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(detail => detail.message).join(', ')
        });
    }

    // Check if file is provided
    if (!req.file) {
        return res.status(400).json({
            status: false,
            message: 'Image file is required'
        });
    }

    next();
};

// Middleware for validating multiple images upload
export const verifyUploadMultipleImages = (req: Request, res: Response, next: NextFunction) => {
    const { error } = uploadMultipleImagesSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(detail => detail.message).join(', ')
        });
    }

    // Check if files are provided
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
            status: false,
            message: 'At least one image file is required'
        });
    }

    // Check maximum files (e.g., 10 files)
    if (req.files.length > 10) {
        return res.status(400).json({
            status: false,
            message: 'Maximum 10 images allowed at once'
        });
    }

    next();
};

// Middleware for validating multiple images deletion
export const verifyDeleteMultipleImages = (req: Request, res: Response, next: NextFunction) => {
    const { error } = deleteMultipleImagesSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(detail => detail.message).join(', ')
        });
    }

    next();
};

// Middleware for validating route parameters
export const verifyImageId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Valid image ID is required'
        });
    }

    next();
};

// Middleware for validating kos ID in route parameters
export const verifyKosId = (req: Request, res: Response, next: NextFunction) => {
    const { kosId } = req.params;

    if (!kosId || isNaN(Number(kosId)) || Number(kosId) <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Valid kos ID is required'
        });
    }

    next();
};
