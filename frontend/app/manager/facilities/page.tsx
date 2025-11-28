'use client'

import { useEffect, useState } from 'react'
import { getAuthToken, getUserData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_KOS } from '@/global'
import Link from 'next/link'
import { toast } from 'sonner'

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
                        className='px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/80 to-green-800 text-white rounded-md disabled:opacity-50'>
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
                        {kosList.map(kos => {
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
            </div>
        </div>
    )
}
