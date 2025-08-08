import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BASE_URL } from "../global";
import fs from "fs"

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

// export const createKos = async (request: Request, response: Response) => {
//     try {
//         /** get requested data (data has been sent from request) */
//         const { name, price, category, description } = request.body
//         const uuid = uuidv4()

//         /** variable filename use to define of uploaded file name */
//         let filename = ""
//         if (request.file) filename = request.file.filename /** get file name of uploaded file */

//         /** process to save new kos, price and stock have to convert in number type */
//         const newKos = await prisma.kos.create({
//             data: { uuid, name, price: Number(price), category, description, picture: filename }
//         })

//         return response.json({
//             status: true,
//             data: newKos,
//             message: `New Kos has created`
//         }).status(200)
//     } catch (error) {
//         return response
//             .json({
//                 status: false,
//                 message: `There is an error. ${error}`
//             })
//             .status(400)
//     }
// }

export const createKos = async (req: Request, res: Response) => {
    try {
        const { userId, name, address, pricePerMonth, gender, images, facilities } = req.body

        const newKos = await prisma.kos.create({
            data: {
                userId,
                name,
                address,
                pricePerMonth,
                gender,
                // Nested create untuk gambar
                images: images?.create ? {
                    create: images.create.map((img: { file: string }) => ({
                        file: img.file
                    }))
                } : undefined,
                // Nested create untuk fasilitas
                facilities: facilities?.create ? {
                    create: facilities.create.map((fac: { facility: string }) => ({
                        facility: fac.facility
                    }))
                } : undefined
            },
            include: {
                images: true,
                facilities: true
            }
        })

        return res.status(201).json({
            status: true,
            message: 'Kos berhasil ditambahkan',
            data: newKos
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan pada server'
        })
    }
}


export const updateKos = async (request: Request, response: Response) => {
    try {
        /** get id of kos's id that sent in parameter of URL */
        const { id } = request.params
        /** get requested data (data has been sent from request) */
        const { name, price, category, description } = request.body

        /** make sure that data is exists in database */
        const findKos = await prisma.kos.findFirst({ where: { id: Number(id) } })
        if (!findKos) return response
            .status(200)
            .json({ status: false, message: `Kos is not found` })

        /** default value filename of saved data */
        let filename = findKos.picture
        if (request.file) {
            /** update filename by new uploaded picture */
            filename = request.file.filename
            /** check the old picture in the folder */
            let path = `${BASE_URL}/../public/kos_picture/${findKos.picture}`
            let exists = fs.existsSync(path)
            /** delete the old exists picture if reupload new file */
            if (exists && findKos.picture !== ``) fs.unlinkSync(path)
        }

        /** process to update kos's data */
        const updatedKos = await prisma.kos.update({
            data: {
                name: name || findKos.name,
                price: price ? Number(price) : findKos.price,
                category: category || findKos.category,
                description: description || findKos.description,
                picture: filename
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedKos,
            message: `Kos has updated`
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

export const deleteMenu = async (request: Request, response: Response) => {
    try {
        /** get id of menu's id that sent in parameter of URL */
        const { id } = request.params

        /** make sure that data is exists in database */
        const findMenu = await prisma.menu.findFirst({ where: { id: Number(id) } })
        if (!findMenu) return response
            .status(200)
            .json({ status: false, message: `Menu is not found` })

        /** check the old picture in the folder */
        let path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`
        let exists = fs.existsSync(path)
        /** delete the old exists picture if reupload new file */
        if (exists && findMenu.picture !== ``) fs.unlinkSync(path)

        /** process to delete menu's data */
        const deletedMenu = await prisma.menu.delete({
            where: { id: Number(id) }
        })
        return response.json({
            status: true,
            data: deletedMenu,
            message: `Menu has deleted`
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