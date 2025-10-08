'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getUserData, getAuthToken, clearAuthData } from '../../lib/auth'
import NotificationBell from '../components/notification/NotificationBell'
import { getCookies, removeCookie } from '@/lib/client-cookies'
import { useRouter } from 'next/navigation'
import { BASE_IMAGE_PROFILE } from '@/global'



interface User {
    id: number
    name: string
    email: string
    phone: string
    profile_picture: string
}

interface Kos {
    id: number
    uuid: string
    name: string
    address: string
    pricePerMonth: number
    discountPercent: number | null
    images: { file: string }[]
}

interface Booking {
    id: number
    uuid: string
    status: 'pending' | 'accept' | 'reject'
    payment: 'cash' | 'transfer'
    startDate: string
    endDate: string
    durationMonths: number
    createdAt: string
    user: User
    kos: Kos
}

export default function ManagerPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [user, setUser] = useState<string>("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{ booking: Booking, status: 'accept' | 'reject' } | null>(null)
    const [processingAction, setProcessingAction] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending' | 'accept' | 'reject'>('all')
    const [userData, setUserData] = useState<any>(null)
    const [popup, setPopup] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null)


    const getProfileImageUrl = (profilePicture: string) => {
        if (!profilePicture) {
            console.log("No profile picture, returning default avatar");
            // Return default avatar if no profile picture
            return "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grad)' /%3e%3ctext x='50' y='50' font-family='Arial, sans-serif' font-size='36' fill='white' text-anchor='middle' dominant-baseline='middle'%3e👤%3c/text%3e%3c/svg%3e";
        }

        // Check if it's a Google profile picture URL (starts with https://)
        if (profilePicture.startsWith('https://')) {
            console.log("Google profile picture detected, returning:", profilePicture);
            return profilePicture;
        }

        // If it's a local file, use the BASE_IMAGE_PROFILE path
        const localPath = `${BASE_IMAGE_PROFILE}/${profilePicture}`;
        console.log("Local file detected, returning:", localPath);
        return localPath;
    };

    useEffect(() => {
        const profilePicture = getCookies("profile_picture") || "";
        const userName = getCookies("name") || "";
        const userRole = getCookies("role") || "";

        console.log("Navbar useEffect - Profile picture from cookies:", profilePicture);
        console.log("Navbar useEffect - User name:", userName);
        console.log("Navbar useEffect - User role:", userRole);

        setProfile(profilePicture);
        setUser(userName);
        setRole(userRole);
    }, []);


    useEffect(() => {
        const user = getUserData()
        setUserData(user)
        if (user?.role === 'owner') {
            fetchOwnerBookings()
        } else {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        console.log('Modal states:', {
            isConfirmModalOpen,
            confirmAction: confirmAction?.booking?.id,
            processingAction
        })
    }, [isConfirmModalOpen, confirmAction, processingAction])

    const fetchOwnerBookings = async () => {
        try {
            const token = getAuthToken()
            if (!token) return

            const response = await fetch('http://localhost:5000/books/owner', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const result = await response.json()
                setBookings(result.books || [])
            } else {
                const errorResult = await response.json()
                console.error('Error response:', errorResult)
                toast.error('Gagal memuat data booking. Silakan refresh halaman.', { duration: 2000 })
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error)
            toast.error('Gagal memuat data booking. Periksa koneksi internet Anda.', { duration: 2000 })
        } finally {
            setLoading(false)
        }
    }

    const handleStatusAction = (booking: Booking, status: 'accept' | 'reject') => {
        console.log('handleStatusAction called:', { booking: booking.id, status })
        setConfirmAction({ booking, status })
        setIsConfirmModalOpen(true)
    }

    const confirmStatusAction = async () => {
        if (!confirmAction) return

        console.log('confirmStatusAction called:', confirmAction)
        setProcessingAction(true)
        try {
            await updateBookingStatus(confirmAction.booking.id, confirmAction.status)
            setIsConfirmModalOpen(false)
            setConfirmAction(null)
            toast.success(
                `Booking ${confirmAction.status === 'accept' ? 'diterima' : 'ditolak'} berhasil. Notifikasi telah dikirim ke penyewa.`,
                { duration: 2000 }
            )
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Gagal memperbarui status booking. Silakan coba lagi.', { duration: 2000 })
        } finally {
            setProcessingAction(false)
        }
    }

    const updateBookingStatus = async (bookingId: number, newStatus: 'accept' | 'reject') => {
        try {
            const token = getAuthToken()
            if (!token) {
                toast.error('Token tidak valid. Silakan login ulang.', { duration: 2000 })
                return
            }

            const response = await fetch(`http://localhost:5000/books/status/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                // Update local state
                setBookings(prev =>
                    prev.map(booking =>
                        booking.id === bookingId
                            ? { ...booking, status: newStatus }
                            : booking
                    )
                )

                setIsModalOpen(false)
                setSelectedBooking(null)

                // Refresh data to ensure consistency
                fetchOwnerBookings()
            } else {
                const errorResult = await response.json()
                throw new Error(errorResult.message || 'Gagal memperbarui status')
            }
        } catch (error) {
            console.error('Failed to update booking status:', error)
            throw error
        }
    }

    const filteredBookings = bookings.filter(booking =>
        filter === 'all' || booking.status === filter
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'accept': return 'bg-green-100 text-green-800'
            case 'reject': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Menunggu'
            case 'accept': return 'Diterima'
            case 'reject': return 'Ditolak'
            default: return status
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price)
    }

    const handleLogout = () => {
        // Hapus cookies
        removeCookie("token");
        removeCookie("id");
        removeCookie("name");
        removeCookie("role");
        removeCookie("profile_picture");
        // Hapus localStorage menggunakan utility function
        clearAuthData();

        router.replace(`/auth/login`);
    };

    if (userData?.role !== 'owner') {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
                        <p className="text-gray-600">Anda tidak memiliki akses ke halaman manager ini.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 relative">
                {/* Sidebar is provided by manager layout (app/manager/layout.tsx) */}

                {/* Main content */}
                <main>
                    {/* Mobile drawer handled in layout */}
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
                            <p className="text-gray-600">Kelola booking kos Anda</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                            {/* Mobile hamburger is in layout */}
                            <button
                                onClick={fetchOwnerBookings}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                <svg className={`-ml-0.5 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                            <NotificationBell />
                            <div className="flex items-center gap-2 relative">
                                <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                                    {userData?.profile_picture ? (
                                        <img
                                            src={`http://localhost:5000/profile_picture/${userData.profile_picture}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {userData?.name?.[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{userData?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4h-8z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Booking</p>
                                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Menunggu</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {bookings.filter(b => b.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Diterima</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {bookings.filter(b => b.status === 'accept').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {bookings.filter(b => b.status === 'reject').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(['all', 'pending', 'accept', 'reject'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}>
                                {status === 'all' ? 'Semua' : getStatusText(status)}
                            </button>
                        ))}
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Daftar Booking</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada booking</h3>
                                <p className="mt-1 text-sm text-gray-500">Belum ada booking untuk filter yang dipilih.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Penyewa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Kos
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Periode
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pembayaran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                                                            {booking.user.profile_picture ? (
                                                                <img
                                                                    src={`http://localhost:5000/profile_picture/${booking.user.profile_picture}`}
                                                                    alt={booking.user.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                                                    <span className="text-white text-sm font-medium">
                                                                        {booking.user.name[0]?.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {booking.user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {booking.user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.kos.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatPrice(booking.kos.pricePerMonth)}/bulan
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.durationMonths} bulan
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.payment === 'cash'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {booking.payment === 'cash' ? 'Tunai' : 'Transfer'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                        {getStatusText(booking.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBooking(booking)
                                                                setIsModalOpen(true)
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 font-medium">
                                                            Detail
                                                        </button>
                                                        {booking.status === 'pending' && (
                                                            <div className="flex items-center gap-2 ml-2">
                                                                <button
                                                                    onClick={() => handleStatusAction(booking, 'accept')}
                                                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors">
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    Terima
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusAction(booking, 'reject')}
                                                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                    Tolak
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {isModalOpen && selectedBooking && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-medium text-gray-900">Detail Booking</h3>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Kos Info */}
                                        <div className="flex gap-4">
                                            {selectedBooking.kos.images.length > 0 && (
                                                <div className="w-24 h-24 bg-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={`http://localhost:5000/kos_picture/${selectedBooking.kos.images[0].file}`}
                                                        alt={selectedBooking.kos.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">{selectedBooking.kos.name}</h4>
                                                <p className="text-gray-600">{selectedBooking.kos.address}</p>
                                                <p className="text-lg font-medium text-green-600 mt-1">
                                                    {formatPrice(selectedBooking.kos.pricePerMonth)}/bulan
                                                </p>
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div className="border-t pt-4">
                                            <h5 className="font-medium text-gray-900 mb-2">Informasi Penyewa</h5>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                                                    {selectedBooking.user.profile_picture ? (
                                                        <img
                                                            src={`http://localhost:5000/profile_picture/${selectedBooking.user.profile_picture}`}
                                                            alt={selectedBooking.user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                                            <span className="text-white font-medium">
                                                                {selectedBooking.user.name[0]?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{selectedBooking.user.name}</p>
                                                    <p className="text-gray-600">{selectedBooking.user.email}</p>
                                                    <p className="text-gray-600">{selectedBooking.user.phone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="border-t pt-4">
                                            <h5 className="font-medium text-gray-900 mb-3">Detail Booking</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Tanggal Mulai</p>
                                                    <p className="font-medium">{formatDate(selectedBooking.startDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Tanggal Selesai</p>
                                                    <p className="font-medium">{formatDate(selectedBooking.endDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Durasi</p>
                                                    <p className="font-medium">{selectedBooking.durationMonths} bulan</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Metode Pembayaran</p>
                                                    <p className="font-medium">
                                                        {selectedBooking.payment === 'cash' ? 'Tunai' : 'Transfer'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Status</p>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                                                        {getStatusText(selectedBooking.status)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Tanggal Booking</p>
                                                    <p className="font-medium">{formatDate(selectedBooking.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {selectedBooking.status === 'pending' && (
                                            <div className="border-t pt-4">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleStatusAction(selectedBooking, 'accept')}
                                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                                        Terima Booking
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusAction(selectedBooking, 'reject')}
                                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
                                                        Tolak Booking
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Modal */}
                    {isConfirmModalOpen && confirmAction && (
                        <div className="fixed inset-0 z-[60] overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                                <div
                                    className="fixed inset-0 transition-opacity bg-black/60 bg-opacity-50 backdrop-blur-sm"
                                    onClick={() => {
                                        if (!processingAction) {
                                            console.log('Closing confirmation modal')
                                            setIsConfirmModalOpen(false)
                                        }
                                    }}></div>

                                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {confirmAction.status === 'accept' ? 'Terima Booking' : 'Tolak Booking'}
                                        </h3>
                                        {!processingAction && (
                                            <button
                                                onClick={() => {
                                                    console.log('Closing confirmation modal via X button')
                                                    setIsConfirmModalOpen(false)
                                                }}
                                                className="text-gray-400 hover:text-gray-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center mb-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmAction.status === 'accept'
                                                ? 'bg-green-100'
                                                : 'bg-red-100'
                                                }`}>
                                                {confirmAction.status === 'accept' ? (
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-sm font-medium text-gray-900">{confirmAction.booking.kos.name}</h4>
                                                <p className="text-sm text-gray-500">Booking oleh {confirmAction.booking.user.name}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600">
                                            {confirmAction.status === 'accept'
                                                ? 'Apakah Anda yakin ingin menerima booking ini? Penyewa akan mendapat notifikasi bahwa booking telah diterima.'
                                                : 'Apakah Anda yakin ingin menolak booking ini? Penyewa akan mendapat notifikasi bahwa booking telah ditolak.'
                                            }
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                console.log('Cancel button clicked')
                                                setIsConfirmModalOpen(false)
                                            }}
                                            disabled={processingAction}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log('Confirm button clicked')
                                                confirmStatusAction()
                                            }}
                                            disabled={processingAction}
                                            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction.status === 'accept'
                                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                                }`}>
                                            {processingAction ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Memproses...
                                                </div>
                                            ) : (
                                                confirmAction.status === 'accept' ? 'Ya, Terima' : 'Ya, Tolak'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
