/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { getUserData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_PROFILE } from '@/global'
import { toast } from 'sonner'
import { FaUsers, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaFilter, FaCalendar, FaPhone, FaEnvelope, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Booking {
    id: number
    uuid: string
    startDate: string
    endDate: string
    durationMonths: number
    status: string
    payment: string
    createdAt: string
    user: {
        id: number
        name: string
        email: string
        phone: string
        profile_picture: string
    }
    kos: {
        id: number
        name: string
        address: string
        pricePerMonth: number
    }
}

interface MonthlyData {
    month: string
    penyewa: number
    accepted: number
    rejected: number
    pending: number
}

interface Stats {
    total: number
    accepted: number
    rejected: number
    pending: number
}

export default function PenyewaPage() {
    const user = getUserData()

    const [bookings, setBookings] = useState<Booking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, accepted: 0, rejected: 0, pending: 0 })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedMonth, setSelectedMonth] = useState<string>('all')

    useEffect(() => {
        if (user?.role === 'owner') {
            fetchBookings()
        } else {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        filterBookings()
    }, [searchTerm, statusFilter, selectedMonth, bookings])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            if (!token) {
                toast.error('Token tidak ditemukan, silakan login kembali')
                setLoading(false)
                return
            }

            const response = await fetch(`${BASE_API_URL}/books/owner`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const result = await response.json()

            if (result.status) {
                // Backend mengirim dengan key 'books' bukan 'data'
                const ownerBookings = (result.books || []).filter((booking: Booking) =>
                    booking.kos && booking.user
                )
                setBookings(ownerBookings)
                calculateStats(ownerBookings)
                generateMonthlyData(ownerBookings)
            } else {
                toast.error(result.message || 'Gagal memuat data penyewa')
            }
        } catch (error: any) {
            console.error('Error fetching bookings:', error)
            toast.error('Terjadi kesalahan saat memuat data')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (bookingsData: Booking[]) => {
        const stats = {
            total: bookingsData.length,
            accepted: bookingsData.filter(b => b.status === 'accept').length,
            rejected: bookingsData.filter(b => b.status === 'reject').length,
            pending: bookingsData.filter(b => b.status === 'pending').length
        }
        setStats(stats)
    }

    const generateMonthlyData = (bookingsData: Booking[]) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
        const currentYear = new Date().getFullYear()

        // Initialize data for last 6 months
        const last6Months: MonthlyData[] = []
        for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthIndex = date.getMonth()
            const year = date.getFullYear()

            const monthBookings = bookingsData.filter(booking => {
                const bookingDate = new Date(booking.createdAt)
                return bookingDate.getMonth() === monthIndex && bookingDate.getFullYear() === year
            })

            last6Months.push({
                month: `${monthNames[monthIndex]} ${year === currentYear ? '' : year}`,
                penyewa: monthBookings.length,
                accepted: monthBookings.filter(b => b.status === 'accept').length,
                rejected: monthBookings.filter(b => b.status === 'reject').length,
                pending: monthBookings.filter(b => b.status === 'pending').length
            })
        }

        setMonthlyData(last6Months)
    }

    const filterBookings = () => {
        let filtered = [...bookings]

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.kos.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter)
        }

        // Filter by month
        if (selectedMonth !== 'all') {
            filtered = filtered.filter(booking => {
                const bookingMonth = new Date(booking.createdAt).toLocaleString('id-ID', { month: 'short', year: 'numeric' })
                return bookingMonth === selectedMonth
            })
        }

        setFilteredBookings(filtered)
    }

    const getTrendPercentage = () => {
        if (monthlyData.length < 2) return { value: 0, isUp: true }

        const current = monthlyData[monthlyData.length - 1].penyewa
        const previous = monthlyData[monthlyData.length - 2].penyewa

        if (previous === 0) return { value: 100, isUp: current > 0 }

        const percentage = ((current - previous) / previous) * 100
        return {
            value: Math.abs(Math.round(percentage)),
            isUp: percentage >= 0
        }
    }

    const trend = getTrendPercentage()

    // const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1']

    const pieData = [
        { name: 'Diterima', value: stats.accepted, color: '#10b981' },
        { name: 'Pending', value: stats.pending, color: '#f59e0b' },
        { name: 'Ditolak', value: stats.rejected, color: '#ef4444' }
    ]

    if (user?.role !== 'owner') {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                <div className='text-center bg-white rounded-2xl shadow-lg p-8 max-w-md'>
                    <div className='text-6xl mb-4'>🔒</div>
                    <h1 className='text-2xl font-bold mb-2'>Akses Ditolak</h1>
                    <p className='text-gray-600'>Halaman ini hanya untuk pemilik kos (owner).</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
                    <p className='text-gray-600'>Memuat data penyewa...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='bg-primary rounded-2xl shadow-lg p-6 text-white'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <FaUsers className='text-3xl' />
                                <div>
                                    <h1 className='text-3xl font-bold'>Data Penyewa</h1>
                                    <p className='text-purple-100'>Monitoring dan analisis penyewa kos Anda</p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <div className='text-4xl font-bold'>{stats.total}</div>
                                <div className='text-purple-100 text-sm'>Total Penyewa</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    {/* Total Penyewa */}
                    <div className='bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm font-medium'>Total Penyewa</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{stats.total}</p>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                    {trend.isUp ? <FaArrowUp /> : <FaArrowDown />}
                                    <span>{trend.value}% dari bulan lalu</span>
                                </div>
                            </div>
                            <div className='p-4 bg-purple-100 rounded-full'>
                                <FaUsers className='text-3xl text-purple-600' />
                            </div>
                        </div>
                    </div>

                    {/* Diterima */}
                    <div className='bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm font-medium'>Diterima</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{stats.accepted}</p>
                                <p className='text-green-600 text-sm font-medium mt-2'>
                                    {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}% dari total
                                </p>
                            </div>
                            <div className='p-4 bg-green-100 rounded-full'>
                                <FaCheckCircle className='text-3xl text-green-600' />
                            </div>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className='bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm font-medium'>Menunggu</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{stats.pending}</p>
                                <p className='text-yellow-600 text-sm font-medium mt-2'>
                                    {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% dari total
                                </p>
                            </div>
                            <div className='p-4 bg-yellow-100 rounded-full'>
                                <FaClock className='text-3xl text-yellow-600' />
                            </div>
                        </div>
                    </div>

                    {/* Ditolak */}
                    <div className='bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm font-medium'>Ditolak</p>
                                <p className='text-3xl font-bold text-gray-900 mt-2'>{stats.rejected}</p>
                                <p className='text-red-600 text-sm font-medium mt-2'>
                                    {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% dari total
                                </p>
                            </div>
                            <div className='p-4 bg-red-100 rounded-full'>
                                <FaTimesCircle className='text-3xl text-red-600' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
                    {/* Line Chart - Trend 6 Bulan */}
                    <div className='lg:col-span-2 bg-white rounded-2xl shadow-lg p-6'>
                        <div className='mb-4'>
                            <h2 className='text-xl font-bold text-gray-900 mb-2'>Trend Penyewa (6 Bulan Terakhir)</h2>
                            <p className='text-sm text-gray-600'>Grafik perkembangan jumlah penyewa per bulan</p>
                        </div>
                        <ResponsiveContainer width='100%' height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                                <XAxis dataKey='month' stroke='#6b7280' style={{ fontSize: '12px' }} />
                                <YAxis stroke='#6b7280' style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }} />
                                <Legend />
                                <Line type='monotone' dataKey='penyewa' stroke='#8b5cf6' strokeWidth={3} name='Total' dot={{ fill: '#8b5cf6', r: 5 }} />
                                <Line type='monotone' dataKey='accepted' stroke='#10b981' strokeWidth={2} name='Diterima' dot={{ fill: '#10b981', r: 4 }} />
                                <Line type='monotone' dataKey='pending' stroke='#f59e0b' strokeWidth={2} name='Pending' dot={{ fill: '#f59e0b', r: 4 }} />
                                <Line type='monotone' dataKey='rejected' stroke='#ef4444' strokeWidth={2} name='Ditolak' dot={{ fill: '#ef4444', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart - Status Distribution */}
                    <div className='bg-white rounded-2xl shadow-lg p-6'>
                        <div className='mb-4'>
                            <h2 className='text-xl font-bold text-gray-900 mb-2'>Distribusi Status</h2>
                            <p className='text-sm text-gray-600'>Persentase status booking</p>
                        </div>
                        <ResponsiveContainer width='100%' height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx='50%'
                                    cy='50%'
                                    labelLine={true}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={90}
                                    fill='#8884d8'
                                    dataKey='value'
                                    style={{ fontSize: '13px', fontWeight: '600' }}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart - Monthly Comparison */}
                <div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
                    <div className='mb-4'>
                        <h2 className='text-xl font-bold text-gray-900 mb-2'>Perbandingan Status Per Bulan</h2>
                        <p className='text-sm text-gray-600'>Grafik batang status booking per bulan</p>
                    </div>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                            <XAxis dataKey='month' stroke='#6b7280' style={{ fontSize: '12px' }} />
                            <YAxis stroke='#6b7280' style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey='accepted' fill='#10b981' name='Diterima' radius={[8, 8, 0, 0]} />
                            <Bar dataKey='pending' fill='#f59e0b' name='Pending' radius={[8, 8, 0, 0]} />
                            <Bar dataKey='rejected' fill='#ef4444' name='Ditolak' radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Filters */}
                <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {/* Search */}
                        <div className='relative'>
                            <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Cari nama, email, atau kos...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition'
                            />
                        </div>

                        {/* Status Filter */}
                        <div className='relative'>
                            <FaFilter className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none bg-white'>
                                <option value='all'>Semua Status</option>
                                <option value='accept'>Diterima</option>
                                <option value='pending'>Pending</option>
                                <option value='reject'>Ditolak</option>
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div className='relative'>
                            <FaCalendar className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none bg-white'>
                                <option value='all'>Semua Bulan</option>
                                {monthlyData.map(month => (
                                    <option key={month.month} value={month.month}>{month.month}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
                    <div className='p-6 border-b border-gray-200'>
                        <h2 className='text-xl font-bold text-gray-900'>Daftar Penyewa</h2>
                        <p className='text-sm text-gray-600'>Menampilkan {filteredBookings.length} dari {bookings.length} penyewa</p>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className='p-12 text-center'>
                            <FaUsers className='text-6xl text-gray-300 mx-auto mb-4' />
                            <h3 className='text-xl font-semibold text-gray-700 mb-2'>Tidak ada data penyewa</h3>
                            <p className='text-gray-500'>
                                {searchTerm || statusFilter !== 'all' || selectedMonth !== 'all'
                                    ? 'Coba ubah filter atau kata kunci pencarian'
                                    : 'Belum ada booking yang masuk'}
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b border-gray-200'>
                                    <tr>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Penyewa</th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Kos</th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Periode</th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Durasi</th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Status</th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Tanggal Booking</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className='hover:bg-gray-50 transition'>
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center'>
                                                        {booking.user.profile_picture ? (
                                                            <img
                                                                src={`${BASE_IMAGE_PROFILE}/${booking.user.profile_picture}`}
                                                                alt={booking.user.name}
                                                                className='w-full h-full object-cover'/>
                                                        ) : (
                                                            <FaUsers className='text-white text-lg' />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className='font-semibold text-gray-900'>{booking.user.name}</div>
                                                        <div className='flex items-center gap-3 text-xs text-gray-500 mt-1'>
                                                            <span className='flex items-center gap-1'>
                                                                <FaEnvelope /> {booking.user.email}
                                                            </span>
                                                            <span className='flex items-center gap-1'>
                                                                <FaPhone /> {booking.user.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='font-medium text-gray-900'>{booking.kos.name}</div>
                                                <div className='text-sm text-gray-500 line-clamp-1'>{booking.kos.address}</div>
                                                <div className='text-xs text-purple-600 font-semibold mt-1'>
                                                    Rp {booking.kos.pricePerMonth.toLocaleString('id-ID')}/bulan
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 w-[150px]'>
                                                <div className='text-sm text-gray-900'>
                                                    {new Date(booking.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className='text-sm text-gray-500'>s/d</div>
                                                <div className='text-sm text-gray-900'>
                                                    {new Date(booking.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className='px-2 py-4'>
                                                <span className='px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full'>
                                                    {booking.durationMonths} Bulan
                                                </span>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${booking.status === 'accept' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'reject' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {booking.status === 'accept' ? 'Diterima' :
                                                        booking.status === 'reject' ? 'Ditolak' :
                                                            'Pending'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='text-sm text-gray-900'>
                                                    {new Date(booking.createdAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className='text-xs text-gray-500'>
                                                    {new Date(booking.createdAt).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
