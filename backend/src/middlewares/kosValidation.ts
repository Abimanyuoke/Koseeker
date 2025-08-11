import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const kosImageSchema = Joi.object({
    file: Joi.string().min(3).max(255).required()
});

const kosFacilitySchema = Joi.object({
    facility: Joi.string().min(3).max(100).required()
});


const addKosSchema = Joi.object({
    userId: Joi.number().integer().required(),
    name: Joi.string().min(3).required(),
    address: Joi.string().min(5).required(),
    pricePerMonth: Joi.number().positive().required(),
    gender: Joi.string().valid("male", "female", "all").required(),
    images: Joi.array().items(
        Joi.object({
            file: Joi.string().required()
        })
    ).optional(),
    facilities: Joi.array().items(
        Joi.object({
            facility: Joi.string().required()
        })
    ).optional()
});


const editKosSchema = Joi.object({
    userId: Joi.number().integer().optional(),
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    pricePerMonth: Joi.number().min(0).optional(),
    gender: Joi.string().valid('male', 'female', 'all').optional(),
    images: Joi.object({
        create: Joi.array().items(kosImageSchema).min(1).max(10)
    }).optional(),

    facilities: Joi.object({
        create: Joi.array().items(kosFacilitySchema).min(1).max(10)
    }).optional()
})

// export const verifyAddKos = (request: Request, response: Response, next: NextFunction) => {
//     const { error } = addKosSchema.validate(request.body, { abortEarly: false })
//     if (error) {
//         return response.status(400).json({
//             status: false,
//             message: error.details.map(it => it.message).join(', ')
//         })
//     }
//     return next()
// }

export const verifyAddKos = (req: Request, res: Response, next: NextFunction) => {
    // Ambil file dari multer
    if (req.files && Array.isArray(req.files)) {
        req.body.images = req.files.map(file => ({ file: file.filename }));
    }

    const { error } = addKosSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};


export const verifyKosFiles = (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
            status: false,
            message: "Minimal 1 gambar diperlukan"
        });
    }
    next();
};


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
