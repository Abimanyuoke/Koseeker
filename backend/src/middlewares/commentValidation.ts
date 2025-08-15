import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addCommentSchema = Joi.object({
    kosId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    content: Joi.string().min(3).max(1000).required()
});

const editCommentSchema = Joi.object({
    content: Joi.string().min(3).max(1000).required()
});

export const verifyAddComment = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addCommentSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyEditComment = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editCommentSchema.validate(request.body, { abortEarly: false })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}
