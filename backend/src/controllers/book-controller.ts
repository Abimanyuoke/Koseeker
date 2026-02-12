import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createBookingCalendarEntries } from "./booking-calender-controller";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getOwnerBookings = async (request: Request, response: Response) => {
    try {
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        const user = await prisma.user.findFirst({
            where: { id: Number(userId) },
            select: { role: true }
        });

        if (!user || user.role !== 'owner') {
            return response.status(403).json({
                status: false,
                message: "Hanya owner yang dapat mengakses data ini"
            });
        }

        const { status } = request.query;

        let whereCondition: any = {
            kos: {
                userId: Number(userId)
            }
        };

        if (status && status !== 'all') {
            whereCondition.status = status.toString();
        }

        const ownerBookings = await prisma.book.findMany({
            where: whereCondition,
            orderBy: { createdAt: "desc" },
            include: {
                kos: {
                    include: {
                        images: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profile_picture: true
                    }
                }
            }
        });

        return response.json({
            status: true,
            books: ownerBookings,
            message: `Owner bookings have been retrieved`
        }).status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400);
    }
};

export const getAllBooks = async (request: Request, response: Response) => {
    try {
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        const { search } = request.query

        const allBook = await prisma.book.findMany({
            where: {
                userId: Number(userId),
                ...(search && {
                    OR: [
                        { kosId: search ? { equals: Number(search) } : undefined },
                    ]
                })
            },
            orderBy: { createdAt: "desc" },
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
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        const { kosId, payment, status, startDate, endDate, durationMonths } = request.body;

        if (!kosId || !payment || !startDate || !endDate) {
            return response.status(400).json({
                status: false,
                message: "All required fields must be provided: kosId, payment, startDate, endDate"
            });
        }

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) },
            select: { availableRooms: true, totalRooms: true, name: true }
        });

        if (!kos) {
            return response.status(404).json({
                status: false,
                message: "Kos tidak ditemukan"
            });
        }

        if (kos.availableRooms <= 0) {
            return response.status(400).json({
                status: false,
                message: `Maaf, kamar di ${kos.name} sudah penuh. Silakan pilih kos lain atau hubungi pemilik.`
            });
        }

        const newBook = await prisma.book.create({
            data: {
                uuid: uuidv4(),
                payment,
                status: status || "pending",
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                durationMonths: durationMonths || 1,
                kos: {
                    connect: { id: Number(kosId) }
                },
                user: {
                    connect: { id: Number(userId) }
                }
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

        try {
            await createBookingCalendarEntries(
                Number(kosId),
                new Date(startDate),
                new Date(endDate),
                newBook.id
            );
        } catch (calendarError) {
            console.error('Failed to create calendar entries:', calendarError);
        }

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


export const updateBook = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { payment, startDate, endDate, durationMonths, status } = request.body;

        const findBook = await prisma.book.findFirst({
            where: { id: Number(id) }
        });

        if (!findBook) {
            return response.status(404).json({
                status: false,
                message: 'Booking tidak ditemukan'
            });
        }

        const updateData: any = {};
        if (payment) updateData.payment = payment;
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        if (durationMonths) updateData.durationMonths = durationMonths;
        if (status) updateData.status = status;

        const updatedBook = await prisma.book.update({
            where: { id: Number(id) },
            data: updateData,
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

        return response.status(200).json({
            status: true,
            data: updatedBook,
            message: 'Book has been updated'
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
};

export const updateBookingStatus = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { status } = request.body;

        if (!['accept', 'reject', 'pending'].includes(status)) {
            return response.status(400).json({
                status: false,
                message: 'Status tidak valid. Gunakan: accept, reject, atau pending'
            });
        }

        const booking = await prisma.book.findUnique({
            where: { id: Number(id) },
            include: {
                kos: {
                    select: {
                        id: true,
                        availableRooms: true,
                        totalRooms: true,
                        name: true
                    }
                }
            }
        });

        if (!booking) {
            return response.status(404).json({
                status: false,
                message: 'Booking tidak ditemukan'
            });
        }

        const previousStatus = booking.status;

        if (previousStatus !== 'accept' && status === 'accept') {
            if (booking.kos.availableRooms <= 0) {
                return response.status(400).json({
                    status: false,
                    message: 'Kamar sudah tidak tersedia. Tidak dapat menerima booking ini.'
                });
            }

            await prisma.$transaction([
                prisma.book.update({
                    where: { id: Number(id) },
                    data: { status: 'accept' }
                }),
                prisma.kos.update({
                    where: { id: booking.kos.id },
                    data: {
                        availableRooms: {
                            decrement: 1
                        }
                    }
                })
            ]);

            // Create notification for user
            try {
                await prisma.notification.create({
                    data: {
                        uuid: uuidv4(),
                        userId: booking.userId,
                        title: 'Booking Disetujui',
                        message: `Booking Anda untuk ${booking.kos.name} telah disetujui oleh pemilik kos. Silakan lakukan pembayaran.`,
                        type: 'BOOKING_ACCEPTED',
                        relatedId: booking.id
                    }
                });
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
            }

            return response.status(200).json({
                status: true,
                message: `Booking diterima. Sisa kamar: ${booking.kos.availableRooms - 1}`,
                data: {
                    bookingId: booking.id,
                    kosName: booking.kos.name,
                    remainingRooms: booking.kos.availableRooms - 1
                }
            });
        }

        if (previousStatus === 'accept' && status !== 'accept') {
            await prisma.$transaction([
                prisma.book.update({
                    where: { id: Number(id) },
                    data: { status }
                }),
                prisma.kos.update({
                    where: { id: booking.kos.id },
                    data: {
                        availableRooms: {
                            increment: 1
                        }
                    }
                })
            ]);

            // Create notification for user if rejected
            if (status === 'reject') {
                try {
                    await prisma.notification.create({
                        data: {
                            uuid: uuidv4(),
                            userId: booking.userId,
                            title: 'Booking Ditolak',
                            message: `Booking Anda untuk ${booking.kos.name} telah ditolak oleh pemilik kos.`,
                            type: 'BOOKING_REJECTED',
                            relatedId: booking.id
                        }
                    });
                } catch (notifError) {
                    console.error('Failed to create notification:', notifError);
                }
            }

            return response.status(200).json({
                status: true,
                message: `Booking ${status === 'reject' ? 'ditolak' : 'dikembalikan ke pending'}. Kamar dikembalikan ke pool.`,
                data: {
                    bookingId: booking.id,
                    kosName: booking.kos.name,
                    remainingRooms: booking.kos.availableRooms + 1
                }
            });
        }

        const updatedBooking = await prisma.book.update({
            where: { id: Number(id) },
            data: { status }
        });

        // Create notification for reject from pending
        if (status === 'reject' && previousStatus === 'pending') {
            try {
                await prisma.notification.create({
                    data: {
                        uuid: uuidv4(),
                        userId: booking.userId,
                        title: 'Booking Ditolak',
                        message: `Booking Anda untuk ${booking.kos.name} telah ditolak oleh pemilik kos.`,
                        type: 'BOOKING_REJECTED',
                        relatedId: booking.id
                    }
                });
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
            }
        }

        return response.status(200).json({
            status: true,
            message: `Status booking berhasil diupdate menjadi ${status}`,
            data: updatedBooking
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        return response.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
};

export const cancelBooking = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const booking = await prisma.book.findUnique({
            where: { id: Number(id) },
            include: {
                kos: { select: { id: true, name: true } }
            }
        });

        if (!booking) {
            return response.status(404).json({
                status: false,
                message: 'Booking tidak ditemukan'
            });
        }

        if (booking.status === 'accept') {
            await prisma.$transaction([
                prisma.book.update({
                    where: { id: Number(id) },
                    data: { status: 'reject' }
                }),
                prisma.kos.update({
                    where: { id: booking.kos.id },
                    data: {
                        availableRooms: { increment: 1 }
                    }
                })
            ]);
        } else {
            await prisma.book.update({
                where: { id: Number(id) },
                data: { status: 'reject' }
            });
        }

        return response.status(200).json({
            status: true,
            message: 'Booking berhasil dibatalkan'
        });

    } catch (error) {
        console.error('Error canceling booking:', error);
        return response.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
};

export const deleteBook = async (request: Request, response: Response) => {
    try {
        /** get id of order's id that sent in parameter of URL */
        const { id } = request.params

        /** make sure that data is exists in database */
        const findBook = await prisma.book.findFirst({
            where: { id: Number(id) },
            include: { kos: true }
        })
        if (!findBook) return response
            .status(404)
            .json({ status: false, message: `Book is not found` })

        // If booking was accepted, return the room to available rooms
        if (findBook.status === 'accept') {
            const currentKos = await prisma.kos.findUnique({
                where: { id: findBook.kosId },
                select: { availableRooms: true, totalRooms: true }
            });

            if (currentKos) {
                const newAvailableRooms = currentKos.availableRooms + 1;

                // Make sure not to exceed totalRooms
                if (newAvailableRooms <= currentKos.totalRooms) {
                    await prisma.kos.update({
                        where: { id: findBook.kosId },
                        data: { availableRooms: newAvailableRooms }
                    });

                    console.log(`[Room Restored] Booking deleted, Kos ID: ${findBook.kosId}, Available Rooms: ${currentKos.availableRooms} -> ${newAvailableRooms}`);
                }
            }
        }

        /** process to delete the book */
        let deleteBook = await prisma.book.delete({ where: { id: Number(id) } })

        return response.json({
            status: true,
            data: deleteBook,
            message: `Book has been deleted${findBook.status === 'accept' ? ' and room has been restored to available rooms' : ''}`
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

