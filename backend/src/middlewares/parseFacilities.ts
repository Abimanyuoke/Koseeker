import { NextFunction, Request, Response } from 'express'

export const parseFacilities = (request: Request, response: Response, next: NextFunction) => {
    if (request.body.facilities && typeof request.body.facilities === "string") {
        try {
            request.body.facilities = JSON.parse(request.body.facilities);
        } catch (err) {
            return response.status(400).json({
                status: false,
                message: "Invalid facilities format"
            });
        }
    }
    next();
};
