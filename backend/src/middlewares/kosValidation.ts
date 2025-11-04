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
    discountPercent: Joi.alternatives().try(
        Joi.number().min(0).max(100),
        Joi.string().allow('').optional()
    ).optional(),
    gender: Joi.string().valid("male", "female", "all").required(),
    kampus: Joi.string().valid(
        "UGM", "UNDIP", "UNPAD", "STAN", "UNAIR", "UB", "UI", "ITS", "ITB",
        "UNS", "TELKOM", "UNESA", "BINUS", "UMM"
    ).optional(), // Changed from required to optional
    kota: Joi.string().valid(
        "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Makassar",
        "Palembang", "Batam", "Malang", "Bogor", "Depok", "Tangerang",
        "Solo", "Makasar", "Yogyakarta", "Bekasi"
    ).required(),
    kalender: Joi.string().valid("minggu", "bulan", "tahun").required(),
    totalRooms: Joi.alternatives().try(
        Joi.number().integer().min(1),
        Joi.string().pattern(/^\d+$/)
    ).optional(), // Add totalRooms validation
    availableRooms: Joi.alternatives().try(
        Joi.number().integer().min(0),
        Joi.string().pattern(/^\d+$/)
    ).optional(), // Add availableRooms validation
    images: Joi.array().items(
        Joi.object({
            file: Joi.string().required()
        })
    ).optional(),
    facilities: Joi.alternatives().try(
        Joi.string(), // Allow JSON string
        Joi.array().items(
            Joi.object({
                facility: Joi.string().required()
            })
        )
    ).optional()
});


const editKosSchema = Joi.object({
    userId: Joi.number().integer().optional(),
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    pricePerMonth: Joi.number().min(0).optional(),
    discountPercent: Joi.alternatives().try(
        Joi.number().min(0).max(100),
        Joi.string().allow('', null),
        Joi.valid(null)
    ).optional(),
    gender: Joi.string().valid('male', 'female', 'all').optional(),
    kampus: Joi.string().valid(
        "UGM", "UNDIP", "UNPAD", "STAN", "UNAIR", "UB", "UI", "ITS", "ITB",
        "UNS", "TELKOM", "UNESA", "BINUS", "UMM"
    ).optional(),
    kota: Joi.string().valid(
        "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Makassar",
        "Palembang", "Batam", "Malang", "Bogor", "Depok", "Tangerang",
        "Solo", "Makasar", "Yogyakarta", "Bekasi"
    ).optional(),
    kalender: Joi.string().valid("minggu", "bulan", "tahun").optional(),
    totalRooms: Joi.alternatives().try(
        Joi.number().integer().min(1),
        Joi.string().pattern(/^\d+$/)
    ).optional(), // Add totalRooms validation
    availableRooms: Joi.alternatives().try(
        Joi.number().integer().min(0),
        Joi.string().pattern(/^\d+$/)
    ).optional(), // Add availableRooms validation
    images: Joi.object({
        create: Joi.array().items(kosImageSchema).min(1).max(10)
    }).optional(),

    facilities: Joi.object({
        create: Joi.array().items(kosFacilitySchema).min(1).max(10)
    }).optional()
})

export const verifyAddKos = (req: Request, res: Response, next: NextFunction) => {
    // Ambil file dari multer
    if (req.files && Array.isArray(req.files)) {
        req.body.images = req.files.map(file => ({ file: file.filename }));
    }

    const { error } = addKosSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }
    next();
};


// export const verifyKosFiles = (req: Request, res: Response, next: NextFunction) => {
//     if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
//         return res.status(400).json({
//             status: false,
//             message: "Minimal 1 gambar diperlukan"
//         });
//     }
//     next();
// };


export const verifyEditKos = (request: Request, response: Response, next: NextFunction) => {
    const { error } = editKosSchema.validate(request.body, { abortEarly: false, allowUnknown: true })
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(', ')
        })
    }
    return next()
}
