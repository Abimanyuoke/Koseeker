import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Schema for adding a single facility
const addFacilitySchema = Joi.object({
    kosId: Joi.number().integer().positive().required(),
    facility: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Facility name is required',
        'string.min': 'Facility name must be at least 2 characters long',
        'string.max': 'Facility name must not exceed 100 characters'
    })
});

const addMultipleFacilitiesSchema = Joi.object({
    kosId: Joi.number().integer().positive().required(),
    facilities: Joi.array()
        .items(
            Joi.object({
                facility: Joi.string().min(2).max(100).required()
            })
        )
        .min(1)
        .max(20)
        .required()
        .messages({
            'array.base': 'Facilities must be an array',
            'array.empty': 'At least one facility is required',
            'array.min': 'At least one facility is required',
            'array.max': 'Maximum 20 facilities allowed at once'
        })
});


// Schema for adding multiple facilities
// const addMultipleFacilitiesSchema = Joi.object({
//     kosId: Joi.number().integer().positive().required(),
//     facilities: Joi.array()
//         .items(Joi.string().min(2).max(100))
//         .min(1)
//         .max(20)
//         .required()
//         .messages({
//             'array.empty': 'At least one facility is required',
//             'array.min': 'At least one facility is required',
//             'array.max': 'Maximum 20 facilities allowed at once'
//         })
// });

// Schema for updating a facility
const updateFacilitySchema = Joi.object({
    facility: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Facility name is required',
        'string.min': 'Facility name must be at least 2 characters long',
        'string.max': 'Facility name must not exceed 100 characters'
    })
});

// Schema for deleting multiple facilities
const deleteMultipleFacilitiesSchema = Joi.object({
    facilityIds: Joi.array()
        .items(Joi.number().integer().positive())
        .min(1)
        .required()
        .messages({
            'array.empty': 'At least one facility ID is required',
            'array.min': 'At least one facility ID is required'
        })
});

// Middleware for validating single facility addition
export const verifyAddFacility = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addFacilitySchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(detail => detail.message).join(', ')
        });
    }

    // Trim facility name
    req.body.facility = req.body.facility.trim();
    next();
};

// Middleware for validating multiple facilities addition

export const verifyAddMultipleFacilities = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addMultipleFacilitiesSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", ")
        });
    }

    // Pastikan setiap facility dipangkas spasi
    req.body.facilities = req.body.facilities.map((fac: { facility: string }) => ({
        facility: fac.facility.trim()
    }));

    next();
};

// export const verifyAddMultipleFacilities = (req: Request, res: Response, next: NextFunction) => {
//     const { error } = addMultipleFacilitiesSchema.validate(req.body, { abortEarly: false });

//     if (error) {
//         return res.status(400).json({
//             status: false,
//             message: error.details.map(detail => detail.message).join(', ')
//         });
//     }

//     // Trim facility names and filter out empty strings
//     req.body.facilities = req.body.facilities
//         .map((facility: string) => facility.trim())
//         .filter((facility: string) => facility.length > 0);

//     // Check if we still have facilities after filtering
//     if (req.body.facilities.length === 0) {
//         return res.status(400).json({
//             status: false,
//             message: 'At least one valid facility is required'
//         });
//     }

//     next();
// };

// Middleware for validating facility update
export const verifyUpdateFacility = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateFacilitySchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(detail => detail.message).join(', ')
        });
    }

    // Trim facility name
    req.body.facility = req.body.facility.trim();
    next();
};

// Middleware for validating multiple facilities deletion
export const verifyDeleteMultipleFacilities = (req: Request, res: Response, next: NextFunction) => {
    const { error } = deleteMultipleFacilitiesSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(detail => detail.message).join(', ')
        });
    }

    next();
};

// Middleware for validating route parameters
export const verifyFacilityId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Valid facility ID is required'
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
