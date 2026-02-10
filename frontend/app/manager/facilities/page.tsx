/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getUserData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_KOS } from '@/global'
import Link from 'next/link'
import { toast } from 'sonner'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface KosItem {
    id: number
    name: string
    address: string
    pricePerMonth: number
    discountPercent: number | null
    images: { file: string }[]
    facilities: { id: number }[]
}

export default function FacilitiesKosListPage() {
    const [loading, setLoading] = useState(true)
    const [kosList, setKosList] = useState<KosItem[]>([])
    const user = getUserData()

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (user?.role === 'owner') {
            fetchKos()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchKos = async () => {
        try {
            console.log('Fetching kos for user:', user?.id)
            const response = await fetch(`${BASE_API_URL}/kos`)
            if (!response.ok) throw new Error('Gagal memuat data kos')
            const result = await response.json()

            console.log('All kos data:', result.data)
            console.log('User ID for filtering:', user?.id, 'Type:', typeof user?.id)

            // Filtering kos berdasarkan userId (owner) - konversi ke number untuk perbandingan
            const userIdNumber = Number(user?.id)
            const filtered = (result.data || []).filter((k: any) => {
                console.log(`Kos ${k.name} - userId: ${k.userId} (${typeof k.userId}), userIdNumber: ${userIdNumber} (${typeof userIdNumber}), match: ${k.userId === userIdNumber}`)
                return k.userId === userIdNumber
            })

            console.log('Filtered kos:', filtered)
            setKosList(filtered)

            if (filtered.length === 0) {
                toast.info('Anda belum memiliki kos. Silakan tambahkan kos terlebih dahulu.')
            }
        } catch (error: any) {
            console.error('Error fetching kos:', error)
            toast.error(error.message || 'Gagal memuat data kos')
        } finally {
            setLoading(false)
        }
    }

    if (user?.role !== 'owner') {
        return (
            <div className='max-w-5xl mx-auto p-8'>
                <h1 className='text-2xl font-bold mb-2'>Akses Ditolak</h1>
                <p className='text-gray-600'>Halaman ini hanya untuk pemilik (owner).</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-white'>
            <div className='max-w-6xl mx-auto px-4 py-8'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>Kelola Fasilitas</h1>
                        <p className='text-gray-600'>Pilih kos untuk mengatur fasilitas</p>
                    </div>
                    <button
                        onClick={fetchKos}
                        disabled={loading}
                        className='px-4 py-2 text-sm font-medium bg-primary text-white rounded-md disabled:opacity-50'>
                        {loading ? 'Memuat...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className='flex items-center justify-center py-20'>
                        <div className='animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full'></div>
                    </div>
                ) : kosList.length === 0 ? (
                    <div className='text-center py-20 border border-dashed rounded-lg'>
                        <h2 className='text-lg font-semibold text-gray-800 mb-2'>Belum ada kos</h2>
                        <p className='text-gray-600 text-sm'>Tambahkan kos terlebih dahulu sebelum mengatur fasilitas.</p>
                    </div>
                ) : (
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {kosList
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map(kos => {
                                const firstImage = kos.images?.[0]?.file
                                const imgUrl = firstImage ? `${BASE_IMAGE_KOS}/${firstImage}` : 'https://via.placeholder.com/400x250?text=No+Image'
                                return (
                                    <Link key={kos.id} href={`/manager/facilities/${kos.id}`} className='group block rounded-xl overflow-hidden drop-shadow-lg hover:shadow-md transition bg-white'>
                                        <div className='relative h-44 w-full overflow-hidden'>
                                            <img src={imgUrl} alt={kos.name} className='h-full w-full object-cover group-hover:scale-105 transition duration-300' />
                                            {kos.discountPercent && kos.discountPercent > 0 && (
                                                <span className='absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded-md font-medium'>
                                                    Diskon {kos.discountPercent}%
                                                </span>
                                            )}
                                        </div>
                                        <div className='p-4'>
                                            <h3 className='font-semibold text-gray-900 line-clamp-1'>{kos.name}</h3>
                                            <p className='text-xs text-gray-500 line-clamp-2 mb-2'>{kos.address}</p>
                                            <div className='flex items-center justify-between text-xs text-gray-600'>
                                                <span>Fasilitas: {kos.facilities?.length || 0}</span>
                                                <span className='font-medium text-blue-600'>Kelola →</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                    </div>
                )}
                {kosList.length > itemsPerPage && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-primary hover:text-white'
                                }`}>
                            <FaChevronLeft className="text-sm" />
                            <span>Sebelumnya</span>
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(kosList.length / itemsPerPage) }, (_, i) => i + 1)
                                .filter(page => {
                                    const totalPages = Math.ceil(kosList.length / itemsPerPage);
                                    if (totalPages <= 7) return true;
                                    if (page === 1 || page === totalPages) return true;
                                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                                    if (page === currentPage - 2 || page === currentPage + 2) return page;
                                    return false;
                                })
                                .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-2 text-gray-400">...</span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${currentPage === page
                                                ? 'bg-primary text-white shadow-lg shadow-blue-200'
                                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-secondary hover:text-white'
                                                }`}>
                                            {page}
                                        </button>
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(kosList.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(kosList.length / itemsPerPage)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === Math.ceil(kosList.length / itemsPerPage)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-primary hover:text-white '
                                }`}>
                            <span>Selanjutnya</span>
                            <FaChevronRight className="text-sm" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
