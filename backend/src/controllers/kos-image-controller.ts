import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { BASE_URL } from "../types/global";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getKosImages = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const images = await prisma.kosImage.findMany({
            where: { kosId: Number(kosId) },
            orderBy: { createdAt: 'asc' }
        });

        return response.status(200).json({
            status: true,
            data: images,
            message: "Kos images retrieved successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const getImageById = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const image = await prisma.kosImage.findUnique({
            where: { id: Number(id) },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true
                    }
                }
            }
        });

        if (!image) {
            return response.status(404).json({
                status: false,
                message: "Image not found"
            });
        }

        return response.status(200).json({
            status: true,
            data: image,
            message: "Image retrieved successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const uploadKosImage = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.body;
        const file = request.file;

        if (!file) {
            return response.status(400).json({
                status: false,
                message: "No image file provided"
            });
        }

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            const filePath = path.join(BASE_URL, "../public/kos_picture", file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const newImage = await prisma.kosImage.create({
            data: {
                kosId: Number(kosId),
                file: file.filename
            },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true
                    }
                }
            }
        });

        return response.status(201).json({
            status: true,
            data: newImage,
            message: "Image uploaded successfully"
        });

    } catch (error) {
        if (request.file) {
            const filePath = path.join(BASE_URL, "../public/kos_picture", request.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const uploadMultipleKosImages = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.body;
        const files = request.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return response.status(400).json({
                status: false,
                message: "No image files provided"
            });
        }

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            files.forEach(file => {
                const filePath = path.join(BASE_URL, "../public/kos_picture", file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });

            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const imageData = files.map(file => ({
            kosId: Number(kosId),
            file: file.filename
        }));

        await prisma.kosImage.createMany({
            data: imageData
        });

        const createdImages = await prisma.kosImage.findMany({
            where: {
                kosId: Number(kosId),
                file: { in: files.map(f => f.filename) }
            },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return response.status(201).json({
            status: true,
            data: createdImages,
            message: `${files.length} images uploaded successfully`
        });

    } catch (error) {
        if (request.files) {
            const files = request.files as Express.Multer.File[];
            files.forEach(file => {
                const filePath = path.join(BASE_URL, "../public/kos_picture", file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const deleteKosImage = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const image = await prisma.kosImage.findUnique({
            where: { id: Number(id) }
        });

        if (!image) {
            return response.status(404).json({
                status: false,
                message: "Image not found"
            });
        }

        const filePath = path.join(BASE_URL, "../public/kos_picture", image.file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const deletedImage = await prisma.kosImage.delete({
            where: { id: Number(id) }
        });

        return response.status(200).json({
            status: true,
            data: deletedImage,
            message: "Image deleted successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const deleteMultipleKosImages = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;
        const { imageIds } = request.body;

        if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
            return response.status(400).json({
                status: false,
                message: "Image IDs array is required"
            });
        }

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const images = await prisma.kosImage.findMany({
            where: {
                id: { in: imageIds.map(id => Number(id)) },
                kosId: Number(kosId)
            }
        });

        if (images.length !== imageIds.length) {
            return response.status(400).json({
                status: false,
                message: "Some images not found or don't belong to this kos"
            });
        }

        images.forEach(image => {
            const filePath = path.join(BASE_URL, "../public/kos_picture", image.file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        const deletedImages = await prisma.kosImage.deleteMany({
            where: {
                id: { in: imageIds.map(id => Number(id)) },
                kosId: Number(kosId)
            }
        });

        return response.status(200).json({
            status: true,
            data: { deletedCount: deletedImages.count },
            message: `${deletedImages.count} images deleted successfully`
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};
