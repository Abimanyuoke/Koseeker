import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuthenticatedRequest extends Request {
    userId?: number
}

export const getBookingCalendar = async (req: Request, res: Response) => {
    try {
        const { kosId } = req.params
        const { year, month } = req.query

        if (!kosId) {
            return res.status(400).json({ message: 'Kos ID is required' })
        }

        const currentYear = year ? parseInt(year as string) : new Date().getFullYear()
        const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1

        const firstDay = new Date(currentYear, currentMonth - 1, 1)
        const lastDay = new Date(currentYear, currentMonth, 0)

        // Get all booking calendar entries for this month
        const bookingCalendar = await prisma.bookingCalendar.findMany({
            where: {
                kosId: parseInt(kosId),
                date: {
                    gte: firstDay,
                    lte: lastDay
                }
            },
            select: {
                date: true,
                isBooked: true,
                isAvailable: true
            }
        })

        // Format the response
        const bookedDates = bookingCalendar.map(entry => ({
            date: entry.date.toISOString().split('T')[0],
            isBooked: entry.isBooked || !entry.isAvailable
        }))

        res.status(200).json({
            success: true,
            bookedDates
        })

    } catch (error) {
        console.error('Get booking calendar error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const createBookingCalendarEntries = async (
    kosId: number,
    startDate: Date,
    endDate: Date,
    bookId?: number
) => {
    try {
        const entries = []
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            entries.push({
                kosId,
                bookId,
                date: new Date(currentDate),
                isAvailable: false,
                isBooked: true
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }

        for (const entry of entries) {
            await prisma.bookingCalendar.upsert({
                where: {
                    kosId_date: {
                        kosId: entry.kosId,
                        date: entry.date
                    }
                },
                update: {
                    isAvailable: entry.isAvailable,
                    isBooked: entry.isBooked,
                    bookId: entry.bookId
                },
                create: entry
            })
        }

        return true
    } catch (error) {
        console.error('Create booking calendar entries error:', error)
        throw error
    }
}

export const removeBookingCalendarEntries = async (
    kosId: number,
    startDate: Date,
    endDate: Date
) => {
    try {
        await prisma.bookingCalendar.deleteMany({
            where: {
                kosId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        })

        return true
    } catch (error) {
        console.error('Remove booking calendar entries error:', error)
        throw error
    }
}

export const initializeKosCalendar = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { kosId } = req.params

        if (!kosId) {
            return res.status(400).json({ message: 'Kos ID is required' })
        }

        const kos = await prisma.kos.findFirst({
            where: {
                id: parseInt(kosId),
                userId: req.userId
            }
        })

        if (!kos) {
            return res.status(404).json({ message: 'Kos not found or not authorized' })
        }

        const entries = []
        const today = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 12) 

        const currentDate = new Date(today)
        while (currentDate <= endDate) {
            const existing = await prisma.bookingCalendar.findUnique({
                where: {
                    kosId_date: {
                        kosId: parseInt(kosId),
                        date: new Date(currentDate)
                    }
                }
            })

            if (!existing) {
                entries.push({
                    kosId: parseInt(kosId),
                    date: new Date(currentDate),
                    isAvailable: true,
                    isBooked: false
                })
            }

            currentDate.setDate(currentDate.getDate() + 1)
        }

        if (entries.length > 0) {
            await prisma.bookingCalendar.createMany({
                data: entries,
                skipDuplicates: true
            })
        }

        res.status(200).json({
            success: true,
            message: `Calendar initialized for ${entries.length} days`,
            entriesCreated: entries.length
        })

    } catch (error) {
        console.error('Initialize kos calendar error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
