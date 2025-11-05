'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BASE_IMAGE_KOS } from '@/global'
import { isAuthenticated, getAuthToken } from '@/lib/auth'
import { generateReceiptHTML } from '../../components/ReceiptTemplate'

interface Kos {
    id: number
    name: string
    address: string
    pricePerMonth: number
    discountPercent?: number
    gender: string
    kampus: string
    kota: string
    totalRooms: number
    availableRooms: number
    images: { file: string }[]
    facilities: { facility: string }[]
}

interface BookingData {
    startDate: string
    endDate: string
    durationMonths: number
    payment: 'cash' | 'transfer'
}

// Duration options
const DURATION_OPTIONS = [
    { label: 'Per Bulan (1 Bulan)', value: 1 },
    { label: 'Per 3 Bulan', value: 3 },
    { label: 'Per 6 Bulan', value: 6 },
    { label: 'Per Tahun (12 Bulan)', value: 12 },
]

export default function BookKosPage() {
    const params = useParams()
    const router = useRouter()
    const kosId = params.id as string
    const [kos, setKos] = useState<Kos | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [bookedDates, setBookedDates] = useState<string[]>([])
    const [showCalendar, setShowCalendar] = useState(false)
    const [showReceipt, setShowReceipt] = useState(false)
    const [bookingResult, setBookingResult] = useState<any>(null)
    const [calendarDate, setCalendarDate] = useState(new Date())

    const [bookingData, setBookingData] = useState<BookingData>({
        startDate: '',
        endDate: '',
        durationMonths: 1,
        payment: 'transfer'
    })

    useEffect(() => {
        fetchKosDetail()
        fetchBookedDates()
    }, [kosId])

    // Real-time polling untuk update availableRooms setiap 10 detik
    useEffect(() => {
        if (!kosId) return;

        const intervalId = setInterval(() => {
            const fetchLatestData = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/kos/${kosId}`)
                    if (response.ok) {
                        const result = await response.json()
                        const latestKos = result.data

                        // Update hanya jika availableRooms berubah
                        setKos(prevKos => {
                            if (prevKos && prevKos.availableRooms !== latestKos.availableRooms) {
                                console.log(`[Real-time Update] Available Rooms: ${prevKos.availableRooms} → ${latestKos.availableRooms}`)

                                // Jika kamar habis, tampilkan pesan
                                if (latestKos.availableRooms === 0 && prevKos.availableRooms > 0) {
                                    setError('Kamar sudah penuh! Semua kamar telah dibooking.')
                                }

                                return latestKos
                            }
                            return prevKos
                        })
                    }
                } catch (err) {
                    console.error('Error polling kos data:', err)
                }
            }

            fetchLatestData()
        }, 10000) // Polling setiap 10 detik

        return () => clearInterval(intervalId)
    }, [kosId])

    useEffect(() => {
        // Cek autentikasi saat komponen dimuat
        const checkAuth = () => {
            if (!isAuthenticated()) {
                setError('Silakan login terlebih dahulu untuk melakukan booking.')
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
            }
        }
        checkAuth()
    }, [router])

    useEffect(() => {
        // Hitung endDate otomatis ketika startDate atau durationMonths berubah
        if (bookingData.startDate && bookingData.durationMonths) {
            calculateEndDate()
        }
    }, [bookingData.startDate, bookingData.durationMonths])

    useEffect(() => {
        // Reset calendar to current month when opened
        if (showCalendar) {
            setCalendarDate(new Date())
        }
    }, [showCalendar])

    useEffect(() => {
        // Close calendar when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (showCalendar && !target.closest('.calendar-container') && !target.closest('#startDate')) {
                setShowCalendar(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showCalendar])

    const fetchKosDetail = async () => {
        try {
            const response = await fetch(`http://localhost:5000/kos/${kosId}`)
            if (response.ok) {
                const data = await response.json()
                console.log('API Response:', data) // Debug log
                if (data.status && data.data) {
                    setKos(data.data)
                } else {
                    setError('Kos tidak ditemukan')
                }
            } else {
                setError('Kos tidak ditemukan')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Gagal memuat data kos')
        } finally {
            setLoading(false)
        }
    }

    const fetchBookedDates = async () => {
        try {
            const response = await fetch(`http://localhost:5000/booking-calendar/kos/${kosId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.status && data.data) {
                    // Ambil semua tanggal yang sudah dibooking
                    const dates: string[] = []
                    data.data.forEach((booking: any) => {
                        const start = new Date(booking.startDate)
                        const end = new Date(booking.endDate)
                        // Loop semua tanggal dari start ke end
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            dates.push(new Date(d).toISOString().split('T')[0])
                        }
                    })
                    setBookedDates(dates)
                }
            }
        } catch (err) {
            console.error('Error fetching booked dates:', err)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price)
    }

    const getDiscountedPrice = () => {
        if (!kos) return 0
        if (kos.discountPercent && kos.discountPercent > 0) {
            return kos.pricePerMonth - (kos.pricePerMonth * kos.discountPercent / 100)
        }
        return kos.pricePerMonth
    }

    const getSavings = () => {
        if (!kos || !kos.discountPercent || kos.discountPercent <= 0) return 0
        return (kos.pricePerMonth * kos.discountPercent / 100) * bookingData.durationMonths
    }

    const calculateEndDate = () => {
        if (!bookingData.startDate) return

        // Parse date string parts to avoid timezone issues
        const [year, month, day] = bookingData.startDate.split('-').map(Number)
        const start = new Date(year, month - 1, day)

        // Tambahkan bulan sesuai durasi
        const end = new Date(start)
        end.setMonth(end.getMonth() + bookingData.durationMonths)

        // Format tanggal ke YYYY-MM-DD manually to avoid timezone issues
        const endYear = end.getFullYear()
        const endMonth = String(end.getMonth() + 1).padStart(2, '0')
        const endDay = String(end.getDate()).padStart(2, '0')
        const endDateString = `${endYear}-${endMonth}-${endDay}`

        setBookingData(prev => ({
            ...prev,
            endDate: endDateString
        }))
    }

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBookingData(prev => ({
            ...prev,
            startDate: e.target.value
        }))
    }

    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBookingData(prev => ({
            ...prev,
            durationMonths: parseInt(e.target.value)
        }))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            // Cek token dari cookies terlebih dahulu, kemudian localStorage
            const token = getAuthToken()

            if (!token) {
                setError('Anda harus login terlebih dahulu untuk melakukan booking.')
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
                return
            }

            const response = await fetch('http://localhost:5000/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    kosId: parseInt(kosId),
                    ...bookingData
                })
            })

            if (response.ok) {
                const result = await response.json()
                setSuccess('Booking berhasil dibuat! Menunggu konfirmasi dari pemilik kos.')

                // Simpan data booking untuk struk
                setBookingResult({
                    ...result.data,
                    kos: kos,
                    totalPrice: getTotalPrice()
                })

                // Tampilkan modal struk
                setShowReceipt(true)
            } else {
                const data = await response.json()
                setError(data.message || 'Gagal membuat booking')
            }
        } catch (err) {
            setError('Terjadi kesalahan saat membuat booking')
        } finally {
            setSubmitting(false)
        }
    }

    const getTotalPrice = () => {
        if (!kos) return 0
        return getDiscountedPrice() * bookingData.durationMonths
    }

    const getMinDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    const handlePrintReceipt = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const userName = localStorage.getItem('name') || 'Pengguna'

        const receiptHTML = generateReceiptHTML({
            uuid: bookingResult?.uuid || '-',
            status: 'pending',
            userName: userName,
            kosName: kos?.name || '-',
            kosAddress: kos?.address || '-',
            kampus: kos?.kampus,
            kota: kos?.kota,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            durationMonths: bookingData.durationMonths,
            pricePerMonth: getDiscountedPrice(),
            discountPercent: kos?.discountPercent,
            savings: getSavings(),
            totalPrice: getTotalPrice(),
            payment: bookingData.payment,
            createdAt: new Date().toISOString()
        })

        printWindow.document.write(receiptHTML)
        printWindow.document.close()

        setTimeout(() => {
            printWindow.print()
        }, 250)
    }

    const handleCloseReceipt = () => {
        setShowReceipt(false)
        router.push('/book')
    }

    const isDateBooked = (dateString: string) => {
        return bookedDates.includes(dateString)
    }

    const navigateCalendar = (direction: 'prev' | 'next') => {
        setCalendarDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
    }

    const canNavigatePrev = () => {
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        const calendarMonth = calendarDate.getMonth()
        const calendarYear = calendarDate.getFullYear()

        // Cannot go to previous months before current month
        return calendarYear > currentYear || (calendarYear === currentYear && calendarMonth > currentMonth)
    }

    const generateCalendar = () => {
        const today = new Date()
        const currentMonth = calendarDate.getMonth()
        const currentYear = calendarDate.getFullYear()

        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)

        const days = []
        const startDay = firstDay.getDay()

        // Add empty cells for days before month starts
        for (let i = 0; i < startDay; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            // Create date string directly without timezone conversion
            const year = currentYear
            const month = String(currentMonth + 1).padStart(2, '0')
            const dayStr = String(day).padStart(2, '0')
            const dateString = `${year}-${month}-${dayStr}`

            // Mark as past if date is before today
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            const date = new Date(currentYear, currentMonth, day)
            const isPastDate = date < todayStart

            days.push({
                day,
                dateString,
                isToday: dateString === getMinDate(),
                isBooked: isDateBooked(dateString),
                isPast: isPastDate,
                isSelected: dateString === bookingData.startDate
            })
        }

        return days
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!kos) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Kos tidak ditemukan</h2>
                    <Link href="/kos" className="text-blue-600 hover:text-blue-800">
                        Kembali ke daftar kos
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Kos Detail */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-64">
                            {kos.images && kos.images.length > 0 ? (
                                <img
                                    src={`${BASE_IMAGE_KOS}/${kos.images[0].file}`}
                                    alt={kos.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="text-xl font-semibold text-gray-900">{kos.name}</h2>
                                {kos.discountPercent && kos.discountPercent > 0 && (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        -{kos.discountPercent}% OFF
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 mb-4">{kos.address}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <span className="text-gray-500">Gender:</span>
                                    <p className="font-medium">{kos.gender}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Kampus:</span>
                                    <p className="font-medium">{kos.kampus}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Kota:</span>
                                    <p className="font-medium">{kos.kota}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Harga/bulan:</span>
                                    {kos.discountPercent && kos.discountPercent > 0 ? (
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500 line-through">Rp {formatPrice(kos.pricePerMonth)}</p>
                                            <p className="font-bold text-red-600">Rp {formatPrice(getDiscountedPrice())}</p>
                                        </div>
                                    ) : (
                                        <p className="font-medium text-blue-600">Rp {formatPrice(kos.pricePerMonth)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Ketersediaan Kamar */}
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Ketersediaan Kamar
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Kamar Tersedia</p>
                                        <p className="text-2xl font-bold text-blue-600">{kos.availableRooms} / {kos.totalRooms}</p>
                                    </div>
                                    <div>
                                        {kos.availableRooms === 0 ? (
                                            <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Kamar Penuh
                                            </span>
                                        ) : kos.availableRooms <= 3 ? (
                                            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Hampir Penuh
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Tersedia
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {kos.facilities && kos.facilities.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Fasilitas:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {kos.facilities.map((facility, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {facility.facility}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Booking</h2>

                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tanggal Mulai & Durasi Sewa - Flex Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tanggal Mulai */}
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Mulai Sewa <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="startDate"
                                            name="startDate"
                                            required
                                            readOnly
                                            value={bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString('id-ID') : ''}
                                            onClick={() => setShowCalendar(!showCalendar)}
                                            placeholder="Pilih tanggal"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                                        />
                                        <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Klik untuk membuka kalender</p>

                                    {/* Custom Calendar */}
                                    {showCalendar && (
                                        <div className="calendar-container absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigateCalendar('prev')}
                                                        disabled={!canNavigatePrev()}
                                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                        aria-label="Previous month"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>

                                                    <h3 className="font-semibold text-gray-900 min-w-[140px] text-center">
                                                        {calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                    </h3>

                                                    <button
                                                        type="button"
                                                        onClick={() => navigateCalendar('next')}
                                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                                        aria-label="Next month"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowCalendar(false)}
                                                    className="text-gray-500 hover:text-gray-700">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Days of week */}
                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                                    <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar days */}
                                            <div className="grid grid-cols-7 gap-1">
                                                {generateCalendar().map((day, index) => {
                                                    if (!day) {
                                                        return <div key={`empty-${index}`} className="aspect-square" />
                                                    }

                                                    const isDisabled = day.isPast || day.isBooked

                                                    return (
                                                        <button
                                                            key={day.dateString}
                                                            type="button"
                                                            disabled={isDisabled}
                                                            onClick={() => {
                                                                if (!isDisabled) {
                                                                    setBookingData(prev => ({ ...prev, startDate: day.dateString }))
                                                                    setShowCalendar(false)
                                                                }
                                                            }}
                                                            className={`
                                                                aspect-square rounded-lg text-sm font-medium transition-all
                                                                ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                                                                ${day.isToday && !day.isSelected ? 'bg-blue-100 text-blue-600' : ''}
                                                                ${day.isBooked ? 'bg-red-100 text-red-400 cursor-not-allowed line-through' : ''}
                                                                ${day.isPast && !day.isBooked ? 'text-gray-300 cursor-not-allowed' : ''}
                                                                ${!day.isSelected && !day.isToday && !day.isBooked && !day.isPast ? 'hover:bg-gray-100 text-gray-700' : ''}
                                                            `}>
                                                            {day.day}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Legend */}
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                                    <span>Dipilih</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                                                    <span>Sudah dibooking</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                                                    <span>Hari ini</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Durasi Sewa */}
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                        Durasi Sewa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="duration"
                                        name="duration"
                                        required
                                        value={bookingData.durationMonths}
                                        onChange={handleDurationChange}
                                        disabled={!bookingData.startDate}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed">
                                        {DURATION_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {!bookingData.startDate
                                            ? 'Pilih tanggal mulai terlebih dahulu'
                                            : 'Pilih berapa lama Anda ingin menyewa kos'}
                                    </p>
                                </div>
                            </div>

                            {/* Display Calculated Dates */}
                            {bookingData.startDate && bookingData.endDate && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Periode Sewa
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-3">
                                            <span className="text-xs text-gray-600 block mb-1">Tanggal Mulai</span>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(bookingData.startDate).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <span className="text-xs text-gray-600 block mb-1">Tanggal Selesai</span>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(bookingData.endDate).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                            Total: {bookingData.durationMonths} Bulan
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-2">
                                    Metode Pembayaran
                                </label>
                                <select
                                    id="payment"
                                    name="payment"
                                    required
                                    value={bookingData.payment}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="transfer">Transfer Bank</option>
                                    <option value="cash">Tunai</option>
                                </select>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-3">Ringkasan Booking</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Durasi:</span>
                                        <span className="font-medium">{bookingData.durationMonths} bulan</span>
                                    </div>

                                    {kos.discountPercent && kos.discountPercent > 0 ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Harga normal per bulan:</span>
                                                <span className="line-through text-gray-500">Rp {formatPrice(kos.pricePerMonth)}</span>
                                            </div>
                                            <div className="flex justify-between text-red-600">
                                                <span>Harga diskon per bulan ({kos.discountPercent}% off):</span>
                                                <span className="font-medium">Rp {formatPrice(getDiscountedPrice())}</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Hemat total:</span>
                                                <span className="font-medium">Rp {formatPrice(getSavings())}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between">
                                            <span>Harga per bulan:</span>
                                            <span className="font-medium">Rp {formatPrice(kos.pricePerMonth)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between border-t pt-2">
                                        <span className="font-medium">Total Pembayaran:</span>
                                        <span className="font-bold text-blue-600">Rp {formatPrice(getTotalPrice())}</span>
                                    </div>
                                </div>
                            </div>

                            {kos && kos.availableRooms === 0 ? (
                                <div className="w-full bg-red-100 border-2 border-red-300 text-red-800 py-3 px-4 rounded-md text-center font-semibold">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        Kamar Sudah Penuh - Tidak Bisa Booking
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting || !bookingData.startDate || !bookingData.endDate || (kos && kos.availableRooms === 0)}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {submitting ? 'Memproses...' : 'Buat Booking'}
                                </button>
                            )}

                            {/* Login reminder if not authenticated */}
                            <div className="text-center text-sm text-gray-500">
                                Pastikan Anda sudah login untuk melakukan booking.{' '}
                                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                                    Login di sini
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Modal Struk Pemesanan */}
                {showReceipt && bookingResult && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            {/* Header */}
                            <div className="text-black p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">Booking Berhasil!</h2>
                                        <p className="text-blue-400 text-sm">Struk pemesanan Anda</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="backdrop-blur-sm px-4 py-2 rounded-lg">
                                            <p className="text-xs text-black/25">Booking ID</p>
                                            <p className="font-bold text-lg">{bookingResult.uuid}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center justify-center">
                                    <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-6 py-3 rounded-full">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-semibold">Menunggu Konfirmasi Owner</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Kos */}
                                <div className="bg-gray-50 rounded-xl p-5">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Detail Kos
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Nama Kos</p>
                                            <p className="font-semibold text-gray-900 text-lg">{kos?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Alamat</p>
                                            <p className="text-gray-900">{kos?.address}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Kampus</p>
                                                <p className="font-medium text-gray-900">{kos?.kampus}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Kota</p>
                                                <p className="font-medium text-gray-900">{kos?.kota}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Periode Sewa */}
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Periode Sewa
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Check-in</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(bookingData.startDate).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Check-out</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(bookingData.endDate).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                                            Durasi: {bookingData.durationMonths} Bulan
                                        </span>
                                    </div>
                                </div>

                                {/* Rincian Pembayaran */}
                                <div className="bg-gray-50 rounded-xl p-5">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Rincian Pembayaran
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Harga per Bulan</span>
                                            <span className="font-semibold text-gray-900">Rp {formatPrice(getDiscountedPrice())}</span>
                                        </div>
                                        {kos?.discountPercent && kos.discountPercent > 0 && (
                                            <div className="flex justify-between items-center text-green-600">
                                                <span>Hemat ({kos.discountPercent}% Diskon)</span>
                                                <span className="font-semibold">- Rp {formatPrice(getSavings())}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Durasi</span>
                                            <span className="font-semibold text-gray-900">x {bookingData.durationMonths}</span>
                                        </div>
                                        <div className="border-t-2 border-gray-300 pt-3 mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-900">Total Pembayaran</span>
                                                <span className="text-xl font-bold text-blue-600">Rp {formatPrice(getTotalPrice())}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Metode Pembayaran</span>
                                            <span className="font-medium text-gray-900">
                                                {bookingData.payment === 'cash' ? '💵 Tunai' : '🏦 Transfer Bank'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Tambahan */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-semibold text-amber-900 mb-1">Informasi Penting</p>
                                            <ul className="text-sm text-amber-800 space-y-1">
                                                <li>• Booking Anda menunggu konfirmasi dari owner</li>
                                                <li>• Simpan struk ini sebagai bukti booking</li>
                                                <li>• Anda akan mendapat notifikasi saat booking dikonfirmasi</li>
                                                <li>• Cek riwayat booking untuk status terkini</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrintReceipt}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Cetak Struk
                                    </button>
                                    <button
                                        onClick={handleCloseReceipt}
                                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                                    >
                                        Lihat Riwayat Booking
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
