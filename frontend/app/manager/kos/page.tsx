'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_KOS } from '@/global'
import { toast } from 'sonner'
import Link from 'next/link'
import { FaImage, FaList, FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaHome } from 'react-icons/fa'
import { MdFavorite } from 'react-icons/md'

interface KosItem {
    id: number
    uuid: string
    userId: number
    name: string
    address: string
    pricePerMonth: number
    discountPercent: number | null
    gender: string
    kampus: string
    kota: string
    images: { id: number; file: string }[]
    facilities: { id: number; facility: string }[]
    reviews: { id: number }[]
    books: { id: number; status: string }[]
    likes: { id: number }[]
}

export default function ManagerKosListPage() {
    const user = getUserData()

    const [loading, setLoading] = useState(true)
    const [kosList, setKosList] = useState<KosItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterGender, setFilterGender] = useState<string>('all')
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; kos: KosItem | null }>({ show: false, kos: null })
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (user?.role === 'owner') {
            fetchKosList()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchKosList = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${BASE_API_URL}/kos`)
            if (!response.ok) throw new Error('Gagal memuat data kos')
            const result = await response.json()

            // Filter kos milik owner yang login
            const userIdNumber = Number(user?.id)
            const filtered = (result.data || []).filter((k: any) => k.userId === userIdNumber)
            setKosList(filtered)
        } catch (error: any) {
            toast.error(error.message || 'Gagal memuat data kos')
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price)
    }

    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male': return 'Pria'
            case 'female': return 'Wanita'
            case 'all': return 'Campur'
            default: return gender
        }
    }

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male': return 'bg-blue-100 text-blue-800'
            case 'female': return 'bg-pink-100 text-pink-800'
            case 'all': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPendingBookings = (books: any[]) => {
        return books.filter(b => b.status === 'pending').length
    }

    const getAcceptedBookings = (books: any[]) => {
        return books.filter(b => b.status === 'accept').length
    }

    // Filter kos berdasarkan search dan gender
    const filteredKos = kosList.filter(kos => {
        const matchSearch = kos.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            kos.address.toLowerCase().includes(searchQuery.toLowerCase())
        const matchGender = filterGender === 'all' || kos.gender === filterGender
        return matchSearch && matchGender
    })

    const handleDeleteClick = (kos: KosItem) => {
        setDeleteModal({ show: true, kos })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteModal.kos) return

        try {
            setIsDeleting(true)
            const response = await fetch(`${BASE_API_URL}/kos/${deleteModal.kos.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Gagal menghapus kos')

            toast.success('Kos berhasil dihapus!')
            setDeleteModal({ show: false, kos: null })
            fetchKosList() // Refresh list
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus kos')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteModal({ show: false, kos: null })
    }

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

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Kelola Kos Anda</h1>
                            <p className='text-gray-600'>Manage semua kos, gambar, dan fasilitas</p>
                        </div>
                        <div className='flex gap-3'>
                            <button
                                onClick={fetchKosList}
                                disabled={loading}
                                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50'>
                                {loading ? 'Memuat...' : 'Refresh'}
                            </button>
                            <Link
                                href='/manager/kos/create'
                                className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg'>
                                <FaPlus /> Tambah Kos
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='p-3 bg-blue-100 rounded-lg'>
                                    <FaHome className='text-blue-600 text-xl' />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Total Kos</p>
                                    <p className='text-2xl font-bold text-gray-900'>{kosList.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='p-3 bg-green-100 rounded-lg'>
                                    <FaImage className='text-green-600 text-xl' />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Total Gambar</p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {kosList.reduce((sum, kos) => sum + kos.images.length, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='p-3 bg-purple-100 rounded-lg'>
                                    <FaList className='text-purple-600 text-xl' />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Total Fasilitas</p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {kosList.reduce((sum, kos) => sum + kos.facilities.length, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='p-3 bg-pink-100 rounded-lg'>
                                    <MdFavorite className='text-pink-600 text-xl' />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Total Likes</p>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {kosList.reduce((sum, kos) => sum + kos.likes.length, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4'>
                        <div className='flex-1'>
                            <input
                                type='text'
                                placeholder='Cari nama atau alamat kos...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                        </div>
                        <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                            <option value='all'>Semua Gender</option>
                            <option value='male'>Pria</option>
                            <option value='female'>Wanita</option>
                            <option value='all'>Campur</option>
                        </select>
                    </div>
                </div>

                {/* Kos List */}
                {loading ? (
                    <div className='flex items-center justify-center py-20'>
                        <div className='text-center'>
                            <div className='animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
                            <p className='text-gray-600'>Memuat data kos...</p>
                        </div>
                    </div>
                ) : filteredKos.length === 0 ? (
                    <div className='text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100'>
                        <div className='text-6xl mb-4'>🏠</div>
                        <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                            {kosList.length === 0 ? 'Belum ada kos' : 'Tidak ada hasil'}
                        </h2>
                        <p className='text-gray-600 mb-6'>
                            {kosList.length === 0
                                ? 'Tambahkan kos pertama Anda untuk mulai mengelola properti'
                                : 'Coba ubah filter atau kata kunci pencarian'
                            }
                        </p>
                    </div>
                ) : (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredKos.map((kos) => {
                            const firstImage = kos.images?.[0]?.file
                            const imgUrl = firstImage ? `${BASE_IMAGE_KOS}/${firstImage}` : 'https://via.placeholder.com/400x250?text=No+Image'
                            const pendingCount = getPendingBookings(kos.books)
                            const acceptedCount = getAcceptedBookings(kos.books)

                            return (
                                <div
                                    key={kos.id}
                                    className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
                                    {/* Image Section */}
                                    <div className='relative h-48 overflow-hidden'>
                                        <img
                                            src={imgUrl}
                                            alt={kos.name}
                                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' />
                                        {kos.discountPercent && kos.discountPercent > 0 && (
                                            <span className='absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg'>
                                                -{kos.discountPercent}%
                                            </span>
                                        )}
                                        <div className='absolute top-3 left-3'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGenderColor(kos.gender)}`}>
                                                {getGenderText(kos.gender)}
                                            </span>
                                        </div>
                                        {kos.images.length > 0 && (
                                            <div className='absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1'>
                                                <FaImage /> {kos.images.length}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className='p-5'>
                                        <h3 className='font-bold text-lg text-gray-900 mb-2 line-clamp-1'>
                                            {kos.name}
                                        </h3>
                                        <div className='flex items-start gap-2 text-sm text-gray-600 mb-3'>
                                            <FaMapMarkerAlt className='text-red-500 mt-1 flex-shrink-0' />
                                            <p className='line-clamp-2'>{kos.address}</p>
                                        </div>

                                        <div className='flex items-center gap-2 mb-4'>
                                            <span className='text-xl font-bold text-green-600'>
                                                Rp {formatPrice(kos.pricePerMonth)}
                                            </span>
                                            <span className='text-sm text-gray-500'>/ bulan</span>
                                        </div>

                                        {/* Stats */}
                                        <div className='grid grid-cols-3 gap-2 mb-4 text-center'>
                                            <div className='bg-gray-50 rounded-lg p-2'>
                                                <p className='text-xs text-gray-600'>Fasilitas</p>
                                                <p className='font-bold text-gray-900'>{kos.facilities.length}</p>
                                            </div>
                                            <div className='bg-blue-50 rounded-lg p-2'>
                                                <p className='text-xs text-blue-600'>Booking</p>
                                                <p className='font-bold text-blue-900'>{acceptedCount}</p>
                                            </div>
                                            <div className='bg-yellow-50 rounded-lg p-2'>
                                                <p className='text-xs text-yellow-600'>Pending</p>
                                                <p className='font-bold text-yellow-900'>{pendingCount}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='flex gap-2'>
                                            <Link
                                                href={`/manager/kos/${kos.id}`}
                                                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition text-sm font-medium'>
                                                <FaImage /> Gambar
                                            </Link>
                                            <Link
                                                href={`/manager/facilities/${kos.id}`}
                                                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition text-sm font-medium'>
                                                <FaList /> Fasilitas
                                            </Link>
                                        </div>

                                        <div className='flex gap-2 mt-2'>
                                            <Link
                                                href={`/manager/kos/edit/${kos.id}`}
                                                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium'>
                                                <FaEdit /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(kos)}
                                                className='flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium'>
                                                <FaTrash /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.show && deleteModal.kos && (
                    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
                        <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-scaleIn'>
                            {/* Header */}
                            <div className='bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-3 bg-white/20 rounded-full'>
                                        <FaTrash className='text-2xl' />
                                    </div>
                                    <div>
                                        <h2 className='text-2xl font-bold'>Konfirmasi Hapus</h2>
                                        <p className='text-red-100 text-sm'>Tindakan ini tidak dapat dibatalkan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className='p-6'>
                                <div className='mb-6'>
                                    <p className='text-gray-700 mb-4'>
                                        Apakah Anda yakin ingin menghapus kos ini?
                                    </p>
                                    <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                                        <p className='font-semibold text-gray-900 mb-1'>{deleteModal.kos.name}</p>
                                        <p className='text-sm text-gray-600 flex items-start gap-2'>
                                            <FaMapMarkerAlt className='text-red-500 mt-1 flex-shrink-0' />
                                            {deleteModal.kos.address}
                                        </p>
                                    </div>
                                </div>

                                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                                    <div className='flex gap-3'>
                                        <svg className='w-6 h-6 text-yellow-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                                        </svg>
                                        <div>
                                            <p className='font-semibold text-yellow-900 mb-1'>Peringatan!</p>
                                            <ul className='text-sm text-yellow-800 space-y-1'>
                                                <li>• Semua gambar kos akan dihapus</li>
                                                <li>• Semua fasilitas akan dihapus</li>
                                                <li>• Semua review akan dihapus</li>
                                                <li>• Semua booking akan dihapus</li>
                                                <li>• Data tidak dapat dikembalikan</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex gap-3'>
                                    <button
                                        onClick={handleDeleteCancel}
                                        disabled={isDeleting}
                                        className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed'>
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        disabled={isDeleting}
                                        className='flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg'>
                                        {isDeleting ? (
                                            <>
                                                <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                                Menghapus...
                                            </>
                                        ) : (
                                            <>
                                                <FaTrash /> Ya, Hapus
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
