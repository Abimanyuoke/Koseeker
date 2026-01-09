/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getUserData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_KOS } from '@/global'
import { toast } from 'sonner'
import Image from 'next/image'
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaWifi, FaBed, FaCar, FaTv, FaSnowflake, FaShower, FaCheck, FaTimes } from 'react-icons/fa'
import { MdLocalLaundryService, MdSecurity } from 'react-icons/md'
import { GiCook } from 'react-icons/gi'

interface Facility {
    id: number
    uuid: string
    kosId: number
    facility: string
    createdAt: string
    updatedAt: string
}

interface KosDetail {
    id: number
    name: string
    address: string
    pricePerMonth: number
    discountPercent: number | null
    images: { id: number; file: string }[]
    facilities: Facility[]
}

export default function FacilitiesDetailPage() {
    const params = useParams()
    const router = useRouter()
    const kosId = params.id as string

    const [loading, setLoading] = useState(true)
    const [kos, setKos] = useState<KosDetail | null>(null)
    const [facilities, setFacilities] = useState<Facility[]>([])

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Form states
    const [newFacility, setNewFacility] = useState('')
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
    const [editFacilityName, setEditFacilityName] = useState('')
    const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null)
    // Predefined common facilities for quick-add
    const predefinedFacilities = [
        'WiFi', 'AC', 'Kasur', 'Kamar mandi dalam', 'TV', 'Dapur', 'Parkir', 'Laundry', 'Keamanan'
    ]
    const [checkedFacilities, setCheckedFacilities] = useState<Record<string, boolean>>({})

    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (kosId) {
            fetchKosDetail()
        }
    }, [kosId])

    const fetchKosDetail = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${BASE_API_URL}/kos/${kosId}`)
            if (!response.ok) throw new Error('Gagal memuat detail kos')
            const result = await response.json()

            if (result.status) {
                setKos(result.data)
                setFacilities(result.data.facilities || [])
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal memuat detail kos')
            router.push('/manager/facilities')
        } finally {
            setLoading(false)
        }
    }

    const handleAddFacility = async () => {
        // collect checked facilities and custom input
        const selected = Object.keys(checkedFacilities).filter(k => checkedFacilities[k])
        const custom = newFacility.trim()
        const toAdd = [...selected]
        if (custom) toAdd.push(custom)

        if (toAdd.length === 0) {
            toast.error('Pilih setidaknya satu fasilitas atau ketik fasilitas baru')
            return
        }

        try {
            setIsSubmitting(true)
            let anyFailed = false
            for (const facilityName of toAdd) {
                try {
                    const response = await fetch(`${BASE_API_URL}/facilities`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            kosId: Number(kosId),
                            facility: facilityName
                        })
                    })
                    const result = await response.json()
                    if (!result.status) {
                        anyFailed = true
                        console.error('Failed to add facility:', facilityName, result)
                    }
                } catch (err) {
                    anyFailed = true
                    console.error('Error adding facility', facilityName, err)
                }
            }

            if (!anyFailed) {
                toast.success('Fasilitas berhasil ditambahkan')
            } else {
                toast.success('Sebagian fasilitas ditambahkan. Periksa konsol untuk detail.')
            }

            // reset form
            setNewFacility('')
            setCheckedFacilities({})
            setIsAddModalOpen(false)
            fetchKosDetail()
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditFacility = async () => {
        if (!editingFacility || !editFacilityName.trim()) {
            toast.error('Nama fasilitas tidak boleh kosong')
            return
        }

        try {
            setIsSubmitting(true)
            const response = await fetch(`${BASE_API_URL}/facilities/${editingFacility.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    facility: editFacilityName.trim()
                })
            })

            const result = await response.json()

            if (result.status) {
                toast.success('Fasilitas berhasil diperbarui')
                setEditingFacility(null)
                setEditFacilityName('')
                setIsEditModalOpen(false)
                fetchKosDetail()
            } else {
                toast.error(result.message || 'Gagal memperbarui fasilitas')
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteFacility = async () => {
        if (!deletingFacility) return

        try {
            setIsSubmitting(true)
            const response = await fetch(`${BASE_API_URL}/facilities/${deletingFacility.id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.status) {
                toast.success('Fasilitas berhasil dihapus')
                setDeletingFacility(null)
                setIsDeleteModalOpen(false)
                fetchKosDetail()
            } else {
                toast.error(result.message || 'Gagal menghapus fasilitas')
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getFacilityIcon = (facility: string) => {
        const facilityLower = facility.toLowerCase()
        if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <FaWifi className="text-gray-500" />
        if (facilityLower.includes('kasur') || facilityLower.includes('bed')) return <FaBed className="text-gray-500" />
        if (facilityLower.includes('parkir') || facilityLower.includes('parking')) return <FaCar className="text-gray-500" />
        if (facilityLower.includes('tv') || facilityLower.includes('television')) return <FaTv className="text-gray-500" />
        if (facilityLower.includes('ac') || facilityLower.includes('air conditioning')) return <FaSnowflake className="text-gray-500" />
        if (facilityLower.includes('kamar mandi') || facilityLower.includes('bathroom')) return <FaShower className="text-gray-500" />
        if (facilityLower.includes('k.mandi dalam') || facilityLower.includes('bathroom')) return <FaShower className="text-gray-500" />
        if (facilityLower.includes('laundry') || facilityLower.includes('cuci')) return <MdLocalLaundryService className="text-gray-500" />
        if (facilityLower.includes('dapur') || facilityLower.includes('kitchen')) return <GiCook className="text-gray-500" />
        if (facilityLower.includes('security') || facilityLower.includes('keamanan')) return <MdSecurity className="text-gray-500" />
        return <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-purple-500 rounded-full"></div>
    }

    const openEditModal = (facility: Facility) => {
        setEditingFacility(facility)
        setEditFacilityName(facility.facility)
        setIsEditModalOpen(true)
    }

    const openDeleteModal = (facility: Facility) => {
        setDeletingFacility(facility)
        setIsDeleteModalOpen(true)
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4'></div>
                    <p className='text-gray-600'>Memuat data...</p>
                </div>
            </div>
        )
    }

    if (!kos) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Kos tidak ditemukan</h2>
                    <button
                        onClick={() => router.push('/manager/facilities')}
                        className='mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'>
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='max-w-6xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <button
                        onClick={() => router.push('/manager/facilities')}
                        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition'>
                        <FaArrowLeft /> Kembali
                    </button>

                    <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
                        <div className='flex flex-col md:flex-row'>
                            {/* Kos Image */}
                            <div className='md:w-1/3 h-64 md:h-auto relative'>
                                {kos.images && kos.images.length > 0 ? (
                                    <img
                                        src={`${BASE_IMAGE_KOS}/${kos.images[0].file}`}
                                        alt={kos.name}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                                        <span className='text-gray-400 text-lg'>No Image</span>
                                    </div>
                                )}
                                {kos.discountPercent && kos.discountPercent > 0 && (
                                    <span className='absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg'>
                                        -{kos.discountPercent}%
                                    </span>
                                )}
                            </div>

                            {/* Kos Info */}
                            <div className='md:w-2/3 p-6'>
                                <h1 className='text-3xl font-bold text-gray-900 mb-2'>{kos.name}</h1>
                                <p className='text-gray-600 mb-4'>{kos.address}</p>
                                <div className='flex items-baseline gap-2 mb-4'>
                                    <span className='text-3xl font-bold text-green-600'>
                                        Rp {new Intl.NumberFormat('id-ID').format(kos.pricePerMonth)}
                                    </span>
                                    <span className='text-gray-500'>/bulan</span>
                                </div>
                                <div className='bg-green-50 border-l-4 border-green-500 p-4 rounded'>
                                    <p className='text-sm text-gray-700'>
                                        <span className='font-semibold text-green-700'>Total Fasilitas:</span> {facilities.length} fasilitas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Facilities Section */}
                <div className='bg-white rounded-2xl shadow-lg p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-2xl font-bold text-gray-900'>Daftar Fasilitas</h2>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-lg hover:shadow-xl'>
                            <FaPlus /> Tambah Fasilitas
                        </button>
                    </div>

                    {facilities.length === 0 ? (
                        <div className='text-center py-16 border-2 border-dashed border-gray-300 rounded-xl'>
                            <Image src="/images/logo_sad.svg" width={120} height={100} alt="Belum ada fasilitas" className="mx-auto" />
                            <h3 className='text-xl font-semibold text-gray-800 mb-2'>Belum ada fasilitas</h3>
                            <p className='text-gray-600 mb-6'>Mulai tambahkan fasilitas untuk kos Anda</p>
                            {/* <button
                                onClick={() => setIsAddModalOpen(true)}
                                className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition'>
                                Tambah Fasilitas Pertama
                            </button> */}
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                            {facilities.map((facility) => (
                                <div
                                    key={facility.id}
                                    className='group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3 flex-1'>
                                            <div className='p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition'>
                                                {getFacilityIcon(facility.facility)}
                                            </div>
                                            <div className='flex-1'>
                                                <h3 className='font-semibold text-gray-900 text-base'>{facility.facility}</h3>
                                                <p className='text-xs text-gray-500 mt-1'>
                                                    {new Date(facility.createdAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex gap-2 ml-2'>
                                            <button
                                                onClick={() => openEditModal(facility)}
                                                className='p-2 bg-blue-200 text-blue-600 hover:bg-green-50 rounded-lg transition'
                                                title='Edit'>
                                                <FaEdit className='text-base' />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(facility)}
                                                className='p-2 bg-red-200 text-red-600 hover:bg-red-50 rounded-lg transition'
                                                title='Hapus'>
                                                <FaTrash className='text-base' />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all'>
                        <div className='p-6 border-b border-gray-200'>
                            <h3 className='text-2xl font-bold text-gray-900'>Tambah Fasilitas Baru</h3>
                            <p className='text-gray-600 text-sm mt-1'>Pilih fasilitas umum lalu tambahkan fasilitas custom jika diperlukan</p>
                        </div>
                        <div className='p-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-3'>Fasilitas Umum</label>
                            <div className='grid grid-cols-2 gap-2 mb-4'>
                                {predefinedFacilities.map((f) => (
                                    <label key={f} className='flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={!!checkedFacilities[f]}
                                            onChange={() => setCheckedFacilities(prev => ({ ...prev, [f]: !prev[f] }))}
                                            className='form-checkbox h-4 w-4 text-green-600'
                                        />
                                        <span className='text-sm'>{f}</span>
                                    </label>
                                ))}
                            </div>

                            <label className='block text-sm font-medium text-gray-700 mb-2'>Tambah Fasilitas (Kustom)</label>
                            <input
                                type='text'
                                value={newFacility}
                                onChange={(e) => setNewFacility(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddFacility()}
                                placeholder='Contoh: WiFi 24 jam, Mesin Cuci, dll'
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition'
                                autoFocus
                            />
                        </div>
                        <div className='p-6 bg-gray-50 rounded-b-2xl flex gap-3'>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false)
                                    setNewFacility('')
                                    setCheckedFacilities({})
                                }}
                                disabled={isSubmitting}
                                className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50'>
                                Batal
                            </button>
                            <button
                                onClick={handleAddFacility}
                                disabled={isSubmitting}
                                className='flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                {isSubmitting ? (
                                    <div>
                                        <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                                        Menyimpan...
                                    </div>
                                ) : (
                                    <>
                                        <FaCheck /> Tambah
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingFacility && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all'>
                        <div className='p-6 border-b border-gray-200'>
                            <h3 className='text-2xl font-bold text-gray-900'>Edit Fasilitas</h3>
                            <p className='text-gray-600 text-sm mt-1'>Perbarui nama fasilitas</p>
                        </div>
                        <div className='p-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Nama Fasilitas
                            </label>
                            <input
                                type='text'
                                value={editFacilityName}
                                onChange={(e) => setEditFacilityName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleEditFacility()}
                                placeholder='Contoh: WiFi, AC, Kasur, dll'
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition'
                                autoFocus
                            />
                        </div>
                        <div className='p-6 bg-gray-50 rounded-b-2xl flex gap-3'>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false)
                                    setEditingFacility(null)
                                    setEditFacilityName('')
                                }}
                                disabled={isSubmitting}
                                className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50'>
                                Batal
                            </button>
                            <button
                                onClick={handleEditFacility}
                                disabled={isSubmitting || !editFacilityName.trim()}
                                className='flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                {isSubmitting ? (
                                    <>
                                        <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck /> Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && deletingFacility && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all'>
                        <div className='p-6 border-b border-gray-200'>
                            <h3 className='text-2xl font-bold text-red-600'>Hapus Fasilitas</h3>
                            <p className='text-gray-600 text-sm mt-1'>Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                        <div className='p-6'>
                            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
                                <p className='text-gray-700'>
                                    Apakah Anda yakin ingin menghapus fasilitas{' '}
                                    <span className='font-bold text-red-600'>{deletingFacility.facility}</span>?
                                </p>
                            </div>
                        </div>
                        <div className='p-6 bg-gray-50 rounded-b-2xl flex gap-3'>
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false)
                                    setDeletingFacility(null)
                                }}
                                disabled={isSubmitting}
                                className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50'>
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteFacility}
                                disabled={isSubmitting}
                                className='flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                {isSubmitting ? (
                                    <div>
                                        <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                                        Menghapus...
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-2 hover:cursor-pointer'>
                                        <FaTrash /> Hapus
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
