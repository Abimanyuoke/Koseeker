import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BASE_URL } from "../global";
import fs from "fs"
import path from "path";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getPromoKos = async (request: Request, response: Response) => {
    try {
        const { kota } = request.query

        let whereCondition: any = {
            AND: [
                { discountPercent: { not: null } },
                { discountPercent: { gt: 0 } }
            ]
        }

        if (kota && kota !== 'all') {
            whereCondition.kota = kota.toString()
        }

        const promoKos = await prisma.kos.findMany({
            where: whereCondition,
            include: {
                images: true,
                facilities: true,
                books: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                reviews: {
                    select: {
                        id: true,
                        comment: true
                    }
                },
                likes: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                discountPercent: 'desc'
            }
        })

        return response.json({
            status: true,
            data: promoKos,
            message: `Promo kos has retrieved`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const getAllKos = async (request: Request, response: Response) => {
    try {
        const { search, kota, kalender, gender, kampus, minPrice, maxPrice, hasDiscount } = request.query

        let whereCondition: any = {}

        if (search) {
            whereCondition.name = { contains: search.toString() }
        }

        if (kota && kota !== 'all') {
            whereCondition.kota = kota.toString()
        }

        if (kalender && kalender !== 'all') {
            whereCondition.kalender = kalender.toString()
        }

        if (gender && gender !== 'all') {
            whereCondition.gender = gender.toString()
        }

        if (kampus && kampus !== 'all') {
            whereCondition.kampus = kampus.toString()
        }

        if (minPrice || maxPrice) {
            whereCondition.pricePerMonth = {}
            if (minPrice) {
                whereCondition.pricePerMonth.gte = Number(minPrice)
            }
            if (maxPrice) {
                whereCondition.pricePerMonth.lte = Number(maxPrice)
            }
        }

        // Add discount filter if provided
        if (hasDiscount === 'true') {
            whereCondition.AND = [
                { discountPercent: { not: null } },
                { discountPercent: { gt: 0 } }
            ]
        }

        /** process to get kos with images and facilities */
        const allKos = await prisma.kos.findMany({
            where: whereCondition,
            include: {
                images: true,
                facilities: true,
                books: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                reviews: {
                    select: {
                        id: true,
                        comment: true
                    }
                },
                likes: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return response.json({
            status: true,
            data: allKos,
            message: `Kos has retrieved`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const getKosById = async (request: Request, response: Response) => {
    try {
        const { id } = request.params

        /** get kos by id with all relations */
        const kos = await prisma.kos.findUnique({
            where: { id: Number(id) },
            include: {
                images: true,
                facilities: true,
                books: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profile_picture: true
                            }
                        }
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profile_picture: true,
                        createdAt: true,
                        kos: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        })

        if (!kos) {
            return response.json({
                status: false,
                message: `Kos with id ${id} not found`
            }).status(404)
        }

        return response.json({
            status: true,
            data: kos,
            message: `Kos detail has retrieved`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const createKos = async (req: Request, res: Response) => {
    try {
        const { userId, name, address, pricePerMonth, discountPercent, gender, kampus, kota, kalender, facilities, totalRooms, availableRooms } = req.body;

        console.log('totalRooms:', totalRooms, 'Type:', typeof totalRooms);
        console.log('availableRooms:', availableRooms, 'Type:', typeof availableRooms);
        console.log('Number(totalRooms):', Number(totalRooms));
        console.log('kampus:', kampus);
        console.log('kota:', kota);
        console.log('Full Body:', req.body);

        let validDiscountPercent = null;
        if (discountPercent !== undefined && discountPercent !== null && discountPercent !== '') {
            const numDiscount = Number(discountPercent);
            if (!isNaN(numDiscount) && numDiscount >= 0 && numDiscount <= 100) {
                validDiscountPercent = numDiscount;
            }
        }

        let facilitiesData: Array<{ facility: string }> = [];

        if (facilities) {
            if (Array.isArray(facilities)) {
                facilitiesData = facilities;
            }
            else if (typeof facilities === 'string') {
                try {
                    facilitiesData = JSON.parse(facilities);
                } catch (error) {
                    console.error('Error parsing facilities string:', error);
                    facilitiesData = [];
                }
            }
        }

        const uploadedFiles = req.files as Express.Multer.File[];
        const imagesData = uploadedFiles?.map(file => ({ file: file.filename })) || [];

        const facilitiesForCreate = facilitiesData.map(fac => ({
            facility: fac.facility
        }));

        const newKos = await prisma.kos.create({
            data: {
                userId: Number(userId),
                name,
                address,
                pricePerMonth: Number(pricePerMonth),
                discountPercent: validDiscountPercent,
                gender,
                kampus: kampus && kampus.trim() !== '' ? kampus : null,
                kota,
                kalender,
                totalRooms: totalRooms ? Number(totalRooms) : 1,
                availableRooms: availableRooms ? Number(availableRooms) : (totalRooms ? Number(totalRooms) : 1),
                images: {
                    create: imagesData
                },
                facilities: {
                    create: facilitiesForCreate,
                }
            },
            include: {
                images: true,
                facilities: true
            }
        });

        res.status(201).json({
            status: true,
            message: 'Kos berhasil ditambahkan',
            data: newKos
        });
    } catch (error) {
        console.error('Create Kos Error:', error);
        res.status(500).json({
            status: false,
            message: (error instanceof Error) ? error.message : String(error)
        });
    }
};

export const updateKos = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { name, pricePerMonth, discountPercent, gender, address, kampus, kota, kalender, totalRooms, availableRooms } = request.body;

        console.log('Update Kos - Request body:', request.body);

        const findKos = await prisma.kos.findFirst({
            where: { id: Number(id) },
            include: { images: true }
        });

        if (!findKos) {
            return response.status(404).json({ status: false, message: `Kos is not found` });
        }

        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (pricePerMonth !== undefined) updateData.pricePerMonth = Number(pricePerMonth);
        if (gender !== undefined) updateData.gender = gender;
        if (kampus !== undefined) updateData.kampus = kampus;
        if (kota !== undefined) updateData.kota = kota;
        if (kalender !== undefined) updateData.kalender = kalender;
        if (totalRooms !== undefined) updateData.totalRooms = Number(totalRooms);
        if (availableRooms !== undefined) updateData.availableRooms = Number(availableRooms);

        if (discountPercent !== undefined) {
            updateData.discountPercent = (discountPercent !== null && discountPercent !== '')
                ? Number(discountPercent)
                : null;
        }

        const updatedKos = await prisma.kos.update({
            where: { id: Number(id) },
            data: updateData
        });

        if (request.files && Array.isArray(request.files) && request.files.length > 0) {
            for (let img of findKos.images) {
                const oldPath = path.join(BASE_URL, "../public/kos_picture", img.file);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            await prisma.kosImage.deleteMany({ where: { kosId: updatedKos.id } });

            const newImages = (request.files as Express.Multer.File[]).map(file => ({
                kosId: updatedKos.id,
                file: file.filename
            }));
            await prisma.kosImage.createMany({ data: newImages });
        }

        return response.status(200).json({
            status: true,
            data: updatedKos,
            message: `Kos has been updated`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const deleteKos = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        // Cari kos
        const findKos = await prisma.kos.findFirst({
            where: { id: Number(id) },
            include: { images: true },
        });

        if (!findKos) {
            return response
                .status(404)
                .json({ status: false, message: `Kos is not found` });
        }

        // Hapus file gambar dari folder public/kos_picture
        for (let img of findKos.images) {
            const imgPath = path.join(BASE_URL, "../public/kos_picture", img.file);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }

        // Hapus kos -> child (images, reviews, books, likes, facilities) otomatis kehapus
        const deletedKos = await prisma.kos.delete({
            where: { id: Number(id) },
        });

        return response.status(200).json({
            status: true,
            data: deletedKos,
            message: `Kos has been deleted (cascade applied)`,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`,
        });
    }
};