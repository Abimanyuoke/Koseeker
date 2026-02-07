import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const addUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).alphanum().required(),
    role: Joi.string().valid("owner", "society", "useradmin").required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    profile_picture: Joi.string().optional()
});

const editUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).alphanum().required(),
    role: Joi.string().valid("owner", "society").required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    profile_picture: Joi.string().optional()
});

const authSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).alphanum().required()
});

export const verifyAddUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addUserSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyEditUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = editUserSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};

export const verifyAuthentication = (req: Request, res: Response, next: NextFunction) => {
    const { error } = authSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};
