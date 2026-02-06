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
    else {
        const facilitiesArray: Array<{ facility: string }> = [];
        const keys = Object.keys(request.body);

        keys.forEach(key => {
            const match = key.match(/^facilities\[(\d+)\]\.facility$/);
            if (match) {
                const index = parseInt(match[1]);
                facilitiesArray[index] = { facility: request.body[key] };
                delete request.body[key];
            }
        });

        if (facilitiesArray.length > 0) {
            request.body.facilities = facilitiesArray.filter(Boolean);
        }
    }

    if (request.files && Array.isArray(request.files)) {
        request.body.images = request.files.map((file: Express.Multer.File) => ({
            file: file.filename
        }));
    }

    next();
};
