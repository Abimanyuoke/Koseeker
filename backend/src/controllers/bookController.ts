import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { createBookingCalendarEntries } from "./bookingCalendarController";


const prisma = new PrismaClient({ errorFormat: "pretty" })
export const getAllBooks = async (request: Request, response: Response) => {
    try {
        /** get userId from token */
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        /** get requested data (data has been sent from request) */
        const { search } = request.query

        /** process to get books for the current user */
        const allBook = await prisma.book.findMany({
            where: {
                userId: Number(userId),
                ...(search && {
                    OR: [
                        { kosId: search ? { equals: Number(search) } : undefined },
                    ]
                })
            },
            orderBy: { createdAt: "desc" }, /** sort by descending order date */
            include: {
                kos: {
                    include: {
                        images: true
                    }
                },
                user: true
            }
        })
        return response.json({
            status: true,
            books: allBook,
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
        const { kosId, payment, status, startDate, endDate, durationMonths } = request.body;

        // Ambil userId dari token JWT
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        // Validasi field
        if (!kosId || !payment || !startDate || !endDate) {
            return response.status(400).json({
                status: false,
                message: "All required fields must be provided: kosId, payment, startDate, endDate"
            });
        }

        // Buat book baru
        const newBook = await prisma.book.create({
            data: {
                uuid: uuidv4(),
                kosId: Number(kosId),
                userId: Number(userId),
                payment,
                status: status || "pending",
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                durationMonths: durationMonths || 1,
            },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        pricePerMonth: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Create booking calendar entries
        try {
            await createBookingCalendarEntries(
                Number(kosId),
                new Date(startDate),
                new Date(endDate),
                newBook.id
            );
        } catch (calendarError) {
            console.error('Failed to create calendar entries:', calendarError);
            // Don't fail the booking if calendar creation fails
        }

        // Create notification for user
        try {
            await prisma.notification.create({
                data: {
                    uuid: uuidv4(),
                    userId: Number(userId),
                    title: 'Booking Berhasil Dibuat',
                    message: `Booking Anda untuk ${newBook.kos.name} telah dibuat dan menunggu konfirmasi dari pemilik kos.`,
                    type: 'BOOKING_CREATED',
                    relatedId: newBook.id
                }
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        return response.status(201).json({
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
        const { status, payment, startDate, endDate, durationMonths } = request.body

        /** make sure that data is exists in database */
        const findBook = await prisma.book.findFirst({ where: { id: Number(id) } })
        if (!findBook) return response
            .status(404)
            .json({ status: false, message: `Book is not found` })

        /** process to update book's data */
        const updatedBook = await prisma.book.update({
            data: {
                status: status || findBook.status,
                payment: payment || findBook.payment,
                startDate: startDate ? new Date(startDate) : findBook.startDate,
                endDate: endDate ? new Date(endDate) : findBook.endDate,
                durationMonths: durationMonths || findBook.durationMonths
            },
            where: { id: Number(id) },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        pricePerMonth: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return response.status(200).json({
            status: true,
            data: updatedBook,
            message: `Book has been updated`
        })
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
