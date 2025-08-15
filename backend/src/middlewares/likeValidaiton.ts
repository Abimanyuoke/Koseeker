import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addLikeSchema = Joi.object({
    kosId: Joi.number().integer().required(),
    userId: Joi.number().integer().required()
});

const toggleLikeSchema = Joi.object({
    kosId: Joi.number().integer().required(),
    userId: Joi.number().integer().required()
});

const deleteLikeSchema = Joi.object({
    kosId: Joi.number().integer().required(),
    userId: Joi.number().integer().required()
});

export const verifyAddLike = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addLikeSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyToggleLike = (req: Request, res: Response, next: NextFunction) => {
    const { error } = toggleLikeSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyDeleteLike = (request: Request, response: Response, next: NextFunction) => {
    const { error } = deleteLikeSchema.validate(request.body, { abortEarly: false })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}