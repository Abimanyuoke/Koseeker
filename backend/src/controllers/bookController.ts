import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { createBookingCalendarEntries } from "./bookingCalendarController";

// const prisma = new PrismaClient();
const prisma = new PrismaClient({ errorFormat: "pretty" })
export const getOwnerBookings = async (request: Request, response: Response) => {
    try {
        /** get userId from token */
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        /** get user role to make sure it's an owner */
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

        /** get requested data (data has been sent from request) */
        const { status } = request.query;

        /** build where condition */
        let whereCondition: any = {
            kos: {
                userId: Number(userId)
            }
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            whereCondition.status = status.toString();
        }

        /** process to get bookings for owner's kos */
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
        // Get userId from token (set by authorization middleware)
        const userId = request.body.user?.id;
        if (!userId) {
            return response.status(401).json({
                status: false,
                message: "User belum login atau token tidak valid"
            });
        }

        const { kosId, payment, status, startDate, endDate, durationMonths } = request.body;

        // Validasi field
        if (!kosId || !payment || !startDate || !endDate) {
            return response.status(400).json({
                status: false,
                message: "All required fields must be provided: kosId, payment, startDate, endDate"
            });
        }

        // Check if kos has available rooms
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

        // Buat book baru
        // const newBook = await prisma.book.create({
        //     data: {
        //         uuid: uuidv4(),
        //         kosId: Number(kosId),
        //         userId: Number(userId),
        //         payment,
        //         status: status || "pending",
        //         startDate: new Date(startDate),
        //         endDate: new Date(endDate),
        //         durationMonths: durationMonths || 1,
        //     },
        //     include: {
        //         kos: {
        //             select: {
        //                 id: true,
        //                 name: true,
        //                 address: true,
        //                 pricePerMonth: true
        //             }
        //         },
        //         user: {
        //             select: {
        //                 id: true,
        //                 name: true,
        //                 email: true
        //             }
        //         }
        //     }
        // });

        const newBook = await prisma.book.create({
            data: {
                uuid: uuidv4(),
                payment,
                status: status || "pending",
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                durationMonths: durationMonths || 1,
                // Relasi Kos
                kos: {
                    connect: { id: Number(kosId) }
                },
                // Relasi User
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
        const findBook = await prisma.book.findFirst({
            where: { id: Number(id) },
            include: {
                user: true,
                kos: true
            }
        })
        if (!findBook) return response
            .status(404)
            .json({ status: false, message: `Book is not found` })

        // Handle room availability changes based on status change
        const oldStatus = findBook.status;
        const newStatus = status || findBook.status;

        // Update availableRooms if status changes
        if (newStatus !== oldStatus) {
            const currentKos = await prisma.kos.findUnique({
                where: { id: findBook.kosId },
                select: { availableRooms: true, totalRooms: true }
            });

            if (currentKos) {
                let roomChange = 0;

                // Status berubah dari pending/reject ke accept -> kurangi kamar
                if (newStatus === 'accept' && oldStatus !== 'accept') {
                    roomChange = -1;
                }
                // Status berubah dari accept ke reject/pending -> tambah kamar kembali
                else if (oldStatus === 'accept' && newStatus !== 'accept') {
                    roomChange = 1;
                }

                if (roomChange !== 0) {
                    const newAvailableRooms = currentKos.availableRooms + roomChange;

                    // Validasi tidak boleh kurang dari 0 atau lebih dari totalRooms
                    if (newAvailableRooms < 0) {
                        return response.status(400).json({
                            status: false,
                            message: 'Tidak ada kamar tersedia. Silakan tolak booking ini.'
                        });
                    }

                    if (newAvailableRooms > currentKos.totalRooms) {
                        return response.status(400).json({
                            status: false,
                            message: 'Jumlah kamar tersedia tidak boleh melebihi total kamar.'
                        });
                    }

                    // Update availableRooms di kos
                    await prisma.kos.update({
                        where: { id: findBook.kosId },
                        data: { availableRooms: newAvailableRooms }
                    });

                    console.log(`[Room Update] Kos ID: ${findBook.kosId}, Status: ${oldStatus} -> ${newStatus}, Available Rooms: ${currentKos.availableRooms} -> ${newAvailableRooms}`);
                }
            }
        }

        /** process to update book's data */
        const updatedBook = await prisma.book.update({
            data: {
                status: newStatus,
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
                        pricePerMonth: true,
                        availableRooms: true,
                        totalRooms: true
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

        // Create notification if status changed
        if (status && status !== oldStatus) {
            try {
                let notificationTitle = '';
                let notificationMessage = '';
                let notificationType = '';

                if (status === 'accept') {
                    notificationTitle = 'Booking Diterima';
                    notificationMessage = `Booking Anda untuk ${findBook.kos.name} telah diterima. Silakan hubungi pemilik untuk tahap selanjutnya.`;
                    notificationType = 'BOOKING_ACCEPTED';
                } else if (status === 'reject') {
                    notificationTitle = 'Booking Ditolak';
                    notificationMessage = `Booking Anda untuk ${findBook.kos.name} telah ditolak. Silakan cari kos alternatif lainnya.`;
                    notificationType = 'BOOKING_REJECTED';
                }

                if (notificationTitle) {
                    await prisma.notification.create({
                        data: {
                            uuid: uuidv4(),
                            userId: findBook.userId,
                            title: notificationTitle,
                            message: notificationMessage,
                            type: notificationType as any,
                            relatedId: updatedBook.id
                        }
                    });
                }
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
                // Don't fail the booking update if notification creation fails
            }
        }

        return response.status(200).json({
            status: true,
            data: updatedBook,
            message: `Book has been updated. ${newStatus === 'accept' ? 'Kamar tersedia berkurang 1.' : newStatus === 'reject' && oldStatus === 'accept' ? 'Kamar tersedia bertambah 1.' : ''}`
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
