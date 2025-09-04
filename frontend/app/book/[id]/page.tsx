'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import BookingCalendar from '../../components/calendar/BookingCalendar'
import { BASE_IMAGE_KOS } from '@/global'
import { isAuthenticated, getAuthToken } from '@/lib/auth'

interface Kos {
    id: number
    name: string
    address: string
    pricePerMonth: number
    discountPercent?: number
    gender: string
    kampus: string
    kota: string
    images: { file: string }[]
    facilities: { facility: string }[]
}

interface BookingData {
    startDate: string
    endDate: string
    durationMonths: number
    payment: 'cash' | 'transfer'
}

export default function BookKosPage() {
    const params = useParams()
    const router = useRouter()
    const kosId = params.id as string
    const [kos, setKos] = useState<Kos | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [bookingData, setBookingData] = useState<BookingData>({
        startDate: '',
        endDate: '',
        durationMonths: 1,
        payment: 'transfer'
    })

    useEffect(() => {
        fetchKosDetail()
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
        if (bookingData.startDate && bookingData.endDate) {
            calculateDuration()
        }
    }, [bookingData.startDate, bookingData.endDate])

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

    const calculateDuration = () => {
        const start = new Date(bookingData.startDate)
        const end = new Date(bookingData.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const months = Math.ceil(diffDays / 30)

        setBookingData(prev => ({
            ...prev,
            durationMonths: months
        }))
    }

    const handleDateSelect = (date: string, type: 'start' | 'end') => {
        setBookingData(prev => ({
            ...prev,
            [type === 'start' ? 'startDate' : 'endDate']: date
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
                setSuccess('Booking berhasil dibuat! Menunggu konfirmasi dari pemilik kos.')
                setTimeout(() => {
                    router.push('/book')
                }, 2000)
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

    const getMinEndDate = () => {
        if (!bookingData.startDate) return getMinDate()
        const startDate = new Date(bookingData.startDate)
        startDate.setDate(startDate.getDate() + 1)
        return startDate.toISOString().split('T')[0]
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href={`/kos/${kosId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        ← Kembali ke detail kos
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Booking Kos</h1>
                </div>

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

                            {kos.facilities && kos.facilities.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Fasilitas:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {kos.facilities.map((facility, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                            >
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
                            {/* Calendar Component - Outside form to prevent conflicts */}
                        </form>

                        {/* Calendar Component */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Pilih Tanggal Booking</h3>
                            <BookingCalendar
                                kosId={parseInt(kosId)}
                                selectedStartDate={bookingData.startDate}
                                selectedEndDate={bookingData.endDate}
                                onDateSelect={handleDateSelect}
                            />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Selected Dates Display */}
                            {(bookingData.startDate || bookingData.endDate) && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Tanggal Dipilih</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Check-in:</span>
                                            <p className="font-medium">
                                                {bookingData.startDate
                                                    ? new Date(bookingData.startDate).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Belum dipilih'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Check-out:</span>
                                            <p className="font-medium">
                                                {bookingData.endDate
                                                    ? new Date(bookingData.endDate).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Belum dipilih'
                                                }
                                            </p>
                                        </div>
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

                            <button
                                type="submit"
                                disabled={submitting || !bookingData.startDate || !bookingData.endDate}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Memproses...' : 'Buat Booking'}
                            </button>

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
            </div>
        </div>
    )
}
