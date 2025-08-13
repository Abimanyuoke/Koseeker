import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";


const prisma = new PrismaClient({ errorFormat: "pretty" })
export const getAllBooks = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { search } = request.query

        /** process to get order, contains means search name or table number of customer's order based on sent keyword */
        const allBook = await prisma.book.findMany({
            where: {
                OR: [
                    { kosId: search ? { equals: Number(search) } : undefined },
                    { userId: search ? { equals: Number(search) } : undefined },
                ]
            },
            orderBy: { createdAt: "desc" }, /** sort by descending order date */
            include: {
                kos: true,
                user: true
            }
        })
        return response.json({
            status: true,
            data: allBook,
            message: `Book list has retrieved`
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

export const getBookByUUID = async (request: Request, response: Response) => {
    const { uuid } = request.params;

    try {
        const book = await prisma.book.findUnique({
            where: { uuid },
            include: {
                user: true,
            }
        });

        if (!book) {
            return response.status(404).json({
                status: false,
                message: `Book not found with uuid ${uuid}`
            });
        }

        return response.status(200).json({
            status: true,
            data: book,
            message: `bok has been retrieved`
        });
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Server error: ${error}`
        });
    }
};


export const createBook = async (request: Request, response: Response) => {
    try {
        const { kosId, payment, status } = request.body;

        // Ambil userId dari token JWT
        const userId = request.user?.id; // pastikan middleware auth mengisi req.user
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        // Validasi field
        if (!kosId || !payment || !status) {
            return response.status(400).json({
                status: false,
                message: "Semua field wajib diisi"
            });
        }

        // Buat book baru
        const { startDate, endDate } = request.body;
        if (!startDate || !endDate) {
            return response.status(400).json({
                status: false,
                message: "Field startDate dan endDate wajib diisi"
            });
        }
        const newBook = await prisma.book.create({
            data: {
                uuid: uuidv4(),
                kosId: Number(kosId),
                userId: Number(userId),
                payment,
                status,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        return response.status(200).json({
            status: true,
            data: newBook,
            message: `New Book has been created`,
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error. ${error}`,
        });
    }
};


export const updateStatusBook = async (request: Request, response: Response) => {
    try {
        /** get id of order's id that sent in parameter of URL */
        const { id } = request.params
        /** get requested data (data has been sent from request) */
        const { status } = request.body
        const user = request.body.user

        /** make sure that data is exists in database */
        const findOrder = await prisma.book.findFirst({ where: { id: Number(id) } })
        if (!findOrder) return response
            .status(200)
            .json({ status: false, message: `Order is not found` })

        /** process to update menu's data */
        const updatedStatus = await prisma.book.update({
            data: {
                status: status || findOrder.status,
                userId: user.id ? user.id : findOrder.userId
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedStatus,
            message: `Book has updated`
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

export const deleteBook = async (request: Request, response: Response) => {
    try {
        /** get id of order's id that sent in parameter of URL */
        const { id } = request.params

        /** make sure that data is exists in database */
        const findOrder = await prisma.book.findFirst({ where: { id: Number(id) } })
        if (!findOrder) return response
            .status(200)
            .json({ status: false, message: `Order is not found` })

        /** process to delete the book */
        let deleteBook = await prisma.book.delete({ where: { id: Number(id) } })

        return response.json({
            status: true,
            data: deleteBook,
            message: `Book has been deleted`
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
