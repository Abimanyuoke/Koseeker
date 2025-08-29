'use client'

import { useState, useEffect } from 'react'

interface CalendarProps {
    kosId: number
    selectedStartDate?: string
    selectedEndDate?: string
    onDateSelect: (date: string, type: 'start' | 'end') => void
}

interface BookedDate {
    date: string
    isBooked: boolean
}

export default function BookingCalendar({
    kosId,
    selectedStartDate,
    selectedEndDate,
    onDateSelect
}: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [bookedDates, setBookedDates] = useState<BookedDate[]>([])
    const [selectingType, setSelectingType] = useState<'start' | 'end'>('start')

    useEffect(() => {
        fetchBookedDates()
    }, [kosId, currentDate])

    const fetchBookedDates = async () => {
        try {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth() + 1

            const response = await fetch(
                `http://localhost:5000/booking-calendar/${kosId}?year=${year}&month=${month}`
            )

            if (response.ok) {
                const data = await response.json()
                setBookedDates(data.bookedDates || [])
            }
        } catch (err) {
            console.error('Failed to fetch booked dates:', err)
        }
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    const isDateBooked = (date: string) => {
        return bookedDates.some(bookedDate => bookedDate.date === date && bookedDate.isBooked)
    }

    const isDateSelected = (date: string) => {
        return date === selectedStartDate || date === selectedEndDate
    }

    const isDateInRange = (date: string) => {
        if (!selectedStartDate || !selectedEndDate) return false
        return date >= selectedStartDate && date <= selectedEndDate
    }

    const isDatePast = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    const handleDateClick = (date: Date) => {
        const dateString = formatDate(date)

        if (isDatePast(date) || isDateBooked(dateString)) return

        if (selectingType === 'start') {
            onDateSelect(dateString, 'start')
            setSelectingType('end')
        } else {
            if (selectedStartDate && dateString < selectedStartDate) {
                onDateSelect(dateString, 'start')
                setSelectingType('end')
            } else {
                onDateSelect(dateString, 'end')
                setSelectingType('start')
            }
        }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
    }

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const days = []

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>)
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateString = formatDate(date)
            const isPast = isDatePast(date)
            const isBooked = isDateBooked(dateString)
            const isSelected = isDateSelected(dateString)
            const isInRange = isDateInRange(dateString)

            let className = 'h-10 w-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors '

            if (isPast || isBooked) {
                className += 'text-gray-400 cursor-not-allowed bg-gray-100'
            } else if (isSelected) {
                className += 'bg-blue-600 text-white font-semibold'
            } else if (isInRange) {
                className += 'bg-blue-100 text-blue-700'
            } else {
                className += 'text-gray-700 hover:bg-blue-50'
            }

            days.push(
                <div
                    key={day}
                    className={className}
                    onClick={() => !isPast && !isBooked && handleDateClick(date)}
                >
                    {day}
                </div>
            )
        }

        return days
    }

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>

                <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>

            <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span>Tanggal dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 rounded"></div>
                        <span>Dalam rentang</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-100 rounded"></div>
                        <span>Tidak tersedia</span>
                    </div>
                </div>
                <p className="mt-2">
                    {selectingType === 'start' ? 'Pilih tanggal mulai' : 'Pilih tanggal selesai'}
                </p>
            </div>
        </div>
    )
}
