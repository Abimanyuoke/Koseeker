import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BASE_URL } from "../global";
import fs from "fs"
import path from "path";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getPromoKos = async (request: Request, response: Response) => {
    try {
        const { kota } = request.query

        /** build where condition for promo kos */
        let whereCondition: any = {
            AND: [
                { discountPercent: { not: null } },
                { discountPercent: { gt: 0 } }
            ]
        }

        // Add city filter if provided
        if (kota && kota !== 'all') {
            whereCondition.kota = kota.toString()
        }

        /** process to get promo kos with images and facilities */
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
                discountPercent: 'desc' // Sort by highest discount first
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
        /** get requested data (data has been sent from request) */
        const { search, kota, kalender, gender, kampus, minPrice, maxPrice, hasDiscount } = request.query

        /** build where condition */
        let whereCondition: any = {}

        // Add search filter for name if provided
        if (search) {
            whereCondition.name = { contains: search.toString() }
        }

        // Add city filter if provided
        if (kota && kota !== 'all') {
            whereCondition.kota = kota.toString()
        }

        // Add kalender filter if provided
        if (kalender && kalender !== 'all') {
            whereCondition.kalender = kalender.toString()
        }

        // Add gender filter if provided
        if (gender && gender !== 'all') {
            whereCondition.gender = gender.toString()
        }

        // Add kampus filter if provided
        if (kampus && kampus !== 'all') {
            whereCondition.kampus = kampus.toString()
        }

        // Add price range filter if provided
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
                        profile_picture: true
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

        // Debug log
        console.log('========== CREATE KOS DEBUG ==========');
        console.log('totalRooms:', totalRooms, 'Type:', typeof totalRooms);
        console.log('availableRooms:', availableRooms, 'Type:', typeof availableRooms);
        console.log('Number(totalRooms):', Number(totalRooms));
        console.log('kampus:', kampus);
        console.log('kota:', kota);
        console.log('Full Body:', req.body);
        console.log('======================================');

        // Robust validation for discountPercent
        let validDiscountPercent = null;
        if (discountPercent !== undefined && discountPercent !== null && discountPercent !== '') {
            const numDiscount = Number(discountPercent);
            if (!isNaN(numDiscount) && numDiscount >= 0 && numDiscount <= 100) {
                validDiscountPercent = numDiscount;
            }
        }

        // Parse facilities - it should already be parsed by parseFacilities middleware
        let facilitiesData: Array<{ facility: string }> = [];

        if (facilities) {
            // If it's already an array (parsed by middleware)
            if (Array.isArray(facilities)) {
                facilitiesData = facilities;
            }
            // If it's still a string (middleware didn't run or failed)
            else if (typeof facilities === 'string') {
                try {
                    facilitiesData = JSON.parse(facilities);
                } catch (error) {
                    console.error('Error parsing facilities string:', error);
                    facilitiesData = [];
                }
            }
        }

        // Get uploaded images from multer
        const uploadedFiles = req.files as Express.Multer.File[];
        const imagesData = uploadedFiles?.map(file => ({ file: file.filename })) || [];

        // Prepare facilities for Prisma create
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
                    create: facilitiesForCreate
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

        // Prepare update data
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

        // Handle discountPercent
        if (discountPercent !== undefined) {
            updateData.discountPercent = (discountPercent !== null && discountPercent !== '')
                ? Number(discountPercent)
                : null;
        }

        // Update data utama kos
        const updatedKos = await prisma.kos.update({
            where: { id: Number(id) },
            data: updateData
        });

        // Kalau ada file gambar baru
        if (request.files && Array.isArray(request.files) && request.files.length > 0) {
            // Hapus gambar lama dari folder
            for (let img of findKos.images) {
                const oldPath = path.join(BASE_URL, "../public/kos_picture", img.file);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // Hapus gambar lama di DB
            await prisma.kosImage.deleteMany({ where: { kosId: updatedKos.id } });

            // Simpan gambar baru di DB
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

// export const deleteKos = async (request: Request, response: Response) => {
//     try {
//         const { id } = request.params;

//         const findKos = await prisma.kos.findFirst({
//             where: { id: Number(id) },
//             include: { images: true }
//         });

//         if (!findKos) {
//             return response.status(404).json({ status: false, message: `Kos is not found` });
//         }

//         // Hapus gambar dari folder
//         for (let img of findKos.images) {
//             const imgPath = path.join(BASE_URL, "../public/kos_picture", img.file);
//             if (fs.existsSync(imgPath)) {
//                 fs.unlinkSync(imgPath);
//             }
//         }

//         // Hapus kos (otomatis hapus relasi kalau sudah diatur onDelete cascade di schema)
//         const deletedKos = await prisma.kos.delete({
//             where: { id: Number(id) }
//         });

//         return response.status(200).json({
//             status: true,
//             data: deletedKos,
//             message: `Kos has been deleted`
//         });
//     } catch (error) {
//         return response.status(400).json({
//             status: false,
//             message: `There is an error: ${error}`
//         });
//     }
// };