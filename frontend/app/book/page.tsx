'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getAuthToken } from '@/lib/auth'

interface Booking {
    id: number
    uuid: string
    startDate: string
    endDate: string
    durationMonths: number
    status: 'pending' | 'accept' | 'reject'
    payment: 'cash' | 'transfer'
    createdAt: string
    kos: {
        id: number
        name: string
        address: string
        pricePerMonth: number
        images: { file: string }[]
    }
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            const response = await fetch('http://localhost:5000/book', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setBookings(data.books || [])
            } else {
                setError('Gagal memuat data booking')
            }
        } catch (err) {
            setError('Terjadi kesalahan saat memuat data')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accept': return 'text-green-600 bg-green-100'
            case 'reject': return 'text-red-600 bg-red-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'accept': return 'Diterima'
            case 'reject': return 'Ditolak'
            case 'pending': return 'Menunggu'
            default: return status
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Booking</h1>
                    <p className="mt-2 text-gray-600">Kelola semua booking kos Anda</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada booking</h3>
                        <p className="text-gray-500 mb-6">Mulai cari kos impian Anda dan lakukan booking</p>
                        <Link
                            href="/kos"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cari Kos
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="relative h-48">
                                    {booking.kos.images && booking.kos.images.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000/${booking.kos.images[0].file}`}
                                            alt={booking.kos.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">No Image</span>
                                        </div>
                                    )}
                                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                        {getStatusText(booking.status)}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.kos.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{booking.kos.address}</p>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Harga/bulan:</span>
                                            <span className="font-medium">Rp {booking.kos.pricePerMonth.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Durasi:</span>
                                            <span className="font-medium">{booking.durationMonths} bulan</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Check-in:</span>
                                            <span className="font-medium">{new Date(booking.startDate).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Check-out:</span>
                                            <span className="font-medium">{new Date(booking.endDate).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Pembayaran:</span>
                                            <span className="font-medium">{booking.payment === 'cash' ? 'Tunai' : 'Transfer'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-blue-600">
                                                Total: Rp {(booking.kos.pricePerMonth * booking.durationMonths).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Dibuat: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
