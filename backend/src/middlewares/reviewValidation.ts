import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addReviewSchema = Joi.object({
    kosId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    comment: Joi.string().min(5).max(2000).required()
});

const editReviewSchema = Joi.object({
    comment: Joi.string().min(5).max(2000).required()
});

export const verifyAddReview = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addReviewSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyEditReview = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editReviewSchema.validate(request.body, { abortEarly: false, allowUnknown: true })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}