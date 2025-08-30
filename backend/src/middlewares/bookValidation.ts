import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addBookSchema = Joi.object({
    kosId: Joi.number().integer().required(),
    payment: Joi.string().valid("cash", "transfer").required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    durationMonths: Joi.number().integer().min(1).max(12).optional().default(1),
    status: Joi.string().valid("pending", "accept", "reject").optional().default("pending")
});

const editBookSchema = Joi.object({
    payment: Joi.string().valid("cash", "transfer").optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    durationMonths: Joi.number().integer().min(1).max(12).optional(),
    status: Joi.string().valid("pending", "accept", "reject").optional()
}).custom((value, helpers) => {
    // If both startDate and endDate are provided, validate that endDate is after startDate
    if (value.startDate && value.endDate) {
        if (new Date(value.endDate) <= new Date(value.startDate)) {
            return helpers.error('custom.endDateAfterStartDate');
        }
    }
    return value;
}, 'Date validation').messages({
    'custom.endDateAfterStartDate': 'endDate must be after startDate'
});

const updateBookStatusSchema = Joi.object({
    status: Joi.string().valid("pending", "accept", "reject").required()
});

export const verifyAddBook = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addBookSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyEditBook = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editBookSchema.validate(request.body, { abortEarly: false, allowUnknown: true })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}

export const verifyUpdateBookStatus = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateBookStatusSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};