import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BASE_URL } from "../global";
import fs from "fs"
import path from "path";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllKos = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { search } = request.query

        /** process to get kos, contains means search name of kos based on sent keyword */
        const allKos = await prisma.kos.findMany({
            where: { name: { contains: search?.toString() || "" } }
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

export const createKos = async (req: Request, res: Response) => {
    try {
        const { userId, name, address, pricePerMonth, gender, images, facilities } = req.body;

        const newKos = await prisma.kos.create({
            data: { userId: Number(userId), name, address, pricePerMonth: Number(pricePerMonth), gender,
                images: {
                    create: images?.map((img: { file: any; }) => ({ file: img.file })) || []
                },
                facilities: {
                    create: facilities?.map((fac: { facility: any; }) => ({ facility: fac.facility })) || []
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
        res.status(500).json({
            status: false,
            message: (error instanceof Error) ? error.message : String(error)
        });
    }
};


export const updateKos = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { name, pricePerMonth, gender, address } = request.body;

        const findKos = await prisma.kos.findFirst({
            where: { id: Number(id) },
            include: { images: true }
        });

        if (!findKos) {
            return response.status(404).json({ status: false, message: `Kos is not found` });
        }

        // Update data utama kos
        const updatedKos = await prisma.kos.update({
            where: { id: Number(id) },
            data: {
                name: name || findKos.name,
                pricePerMonth: pricePerMonth ? Number(pricePerMonth) : findKos.pricePerMonth,
                gender: gender || findKos.gender,
                address: address || findKos.address
            }
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

        const findKos = await prisma.kos.findFirst({
            where: { id: Number(id) },
            include: { images: true }
        });

        if (!findKos) {
            return response.status(404).json({ status: false, message: `Kos is not found` });
        }

        // Hapus gambar dari folder
        for (let img of findKos.images) {
            const imgPath = path.join(BASE_URL, "../public/kos_picture", img.file);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }

        // Hapus kos (otomatis hapus relasi kalau sudah diatur onDelete cascade di schema)
        const deletedKos = await prisma.kos.delete({
            where: { id: Number(id) }
        });

        return response.status(200).json({
            status: true,
            data: deletedKos,
            message: `Kos has been deleted`
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};