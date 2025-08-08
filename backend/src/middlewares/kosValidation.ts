import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const kosImageSchema = Joi.object({
    file: Joi.string().required()
})

const kosFacilitySchema = Joi.object({
    facility: Joi.string().required()
})

const addKosSchema = Joi.object({
    userId: Joi.number().integer().required(),
    name: Joi.string().required(),
    address: Joi.string().required(),
    pricePerMonth: Joi.number().min(0).required(),
    gender: Joi.string().valid('male', 'female', 'all').required(),
    images: Joi.object({
        create: Joi.array().items(kosImageSchema).min(1)
    }).optional(),

    facilities: Joi.object({
        create: Joi.array().items(kosFacilitySchema).min(1)
    }).optional()
})

const editKosSchema = Joi.object({
    userId: Joi.number().integer().optional(),
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    pricePerMonth: Joi.number().min(0).optional(),
    gender: Joi.string().valid('male', 'female', 'all').optional(),
    images: Joi.object({
        create: Joi.array().items(kosImageSchema).min(1)
    }).optional(),

    facilities: Joi.object({
        create: Joi.array().items(kosFacilitySchema).min(1)
    }).optional()
})

export const verifyAddKos = (request: Request, response: Response, next: NextFunction) => {
    const { error } = addKosSchema.validate(request.body, { abortEarly: false })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}

export const verifyEditKos = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editKosSchema.validate(request.body, { abortEarly: false })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}
