/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUserData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_KOS } from '@/global'
import { toast } from 'sonner'
import Link from 'next/link'
import { FaArrowLeft, FaUpload, FaTrash, FaImage, FaPlus, FaExchangeAlt, FaTimes } from 'react-icons/fa'

interface KosImage {
    id: number
    file: string
    kosId: number
    createdAt: string
}

interface KosData {
    id: number
    name: string
    address: string
}

export default function ManageKosImagesPage() {
    const router = useRouter()
    const params = useParams()
    const user = getUserData()
    const kosId = params.id as string

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<KosImage[]>([])
    const [kosData, setKosData] = useState<KosData | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [deletingIds, setDeletingIds] = useState<number[]>([])

    // State untuk replace image
    const [replacingImage, setReplacingImage] = useState<KosImage | null>(null)
    const [replaceFile, setReplaceFile] = useState<File | null>(null)
    const [replacePreviewUrl, setReplacePreviewUrl] = useState<string>('')
    const [replacing, setReplacing] = useState(false)

    useEffect(() => {
        if (user?.role === 'owner') {
            fetchKosData()
            fetchImages()
        } else {
            setLoading(false)
        }
    }, [kosId])

    const fetchKosData = async () => {
        try {
            const response = await fetch(`${BASE_API_URL}/kos/${kosId}`)
            if (!response.ok) throw new Error('Gagal memuat data kos')
            const result = await response.json()

            // Verifikasi ownership
            if (result.data.userId !== Number(user?.id)) {
                toast.error('Anda tidak memiliki akses ke kos ini')
                router.push('/manager/kos')
                return
            }

            setKosData(result.data)
        } catch (error: any) {
            toast.error(error.message || 'Gagal memuat data kos')
            router.push('/manager/kos')
        }
    }

    const fetchImages = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${BASE_API_URL}/kos-images/kos/${kosId}`)
            if (!response.ok) throw new Error('Gagal memuat gambar')
            const result = await response.json()
            setImages(result.data || [])
        } catch (error: any) {
            toast.error(error.message || 'Gagal memuat gambar')
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        // Validasi tipe file
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} bukan file gambar`)
                return false
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} terlalu besar (max 5MB)`)
                return false
            }
            return true
        })

        if (validFiles.length === 0) return

        setSelectedFiles(validFiles)

        // Buat preview URLs
        const urls = validFiles.map(file => URL.createObjectURL(file))
        setPreviewUrls(urls)
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Pilih gambar terlebih dahulu')
            return
        }

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('kosId', kosId)

            selectedFiles.forEach(file => {
                formData.append('images', file)
            })

            const response = await fetch(`${BASE_API_URL}/kos-images/upload-multiple`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Gagal upload gambar')
            }

            const result = await response.json()
            toast.success(result.message || 'Gambar berhasil diupload')

            // Reset form
            setSelectedFiles([])
            setPreviewUrls([])

            // Refresh images
            await fetchImages()
        } catch (error: any) {
            toast.error(error.message || 'Gagal upload gambar')
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteImage = async (imageId: number, filename: string) => {
        if (!confirm(`Hapus gambar ${filename}?`)) return

        try {
            setDeletingIds(prev => [...prev, imageId])
            const response = await fetch(`${BASE_API_URL}/kos-images/${imageId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Gagal menghapus gambar')
            }

            toast.success('Gambar berhasil dihapus')
            await fetchImages()
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus gambar')
        } finally {
            setDeletingIds(prev => prev.filter(id => id !== imageId))
        }
    }

    const cancelPreview = () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url))
        setPreviewUrls([])
        setSelectedFiles([])
    }

    // Handle replace image - open modal
    const handleReplaceClick = (image: KosImage) => {
        setReplacingImage(image)
    }

    // Handle file select for replace
    const handleReplaceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validasi
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB')
            return
        }

        setReplaceFile(file)
        setReplacePreviewUrl(URL.createObjectURL(file))
    }

    // Confirm replace image
    const handleConfirmReplace = async () => {
        if (!replacingImage || !replaceFile) return

        try {
            setReplacing(true)

            // 1. Upload gambar baru
            const formData = new FormData()
            formData.append('kosId', kosId)
            formData.append('images', replaceFile)

            const uploadResponse = await fetch(`${BASE_API_URL}/kos-images/upload-multiple`, {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json()
                throw new Error(error.message || 'Gagal upload gambar baru')
            }

            // 2. Hapus gambar lama
            const deleteResponse = await fetch(`${BASE_API_URL}/kos-images/${replacingImage.id}`, {
                method: 'DELETE'
            })

            if (!deleteResponse.ok) {
                const error = await deleteResponse.json()
                throw new Error(error.message || 'Gagal menghapus gambar lama')
            }

            toast.success('Gambar berhasil diganti!')

            // Reset state
            handleCancelReplace()

            // Refresh images
            await fetchImages()
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengganti gambar')
        } finally {
            setReplacing(false)
        }
    }

    // Cancel replace
    const handleCancelReplace = () => {
        if (replacePreviewUrl) {
            URL.revokeObjectURL(replacePreviewUrl)
        }
        setReplacingImage(null)
        setReplaceFile(null)
        setReplacePreviewUrl('')
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
            <div className='max-w-6xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <Link
                        href='/manager/kos'
                        className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition'>
                        <FaArrowLeft /> Kembali ke Daftar Kos
                    </Link>

                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                        <div className='flex items-start justify-between'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                                    Kelola Gambar Kos
                                </h1>
                                {kosData && (
                                    <div>
                                        <p className='text-xl text-gray-700 font-semibold'>{kosData.name}</p>
                                        <p className='text-sm text-gray-600'>{kosData.address}</p>
                                    </div>
                                )}
                            </div>
                            <div className='text-right'>
                                <p className='text-sm text-gray-600'>Total Gambar</p>
                                <p className='text-3xl font-bold text-blue-600'>{images.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
                    <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                        <FaPlus className='text-blue-600' /> Upload Gambar Baru
                    </h2>

                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Pilih Gambar (Max 5MB per gambar, bisa pilih banyak)
                            </label>
                            <input
                                type='file'
                                accept='image/*'
                                multiple
                                onChange={handleFileSelect}
                                className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition'
                                disabled={uploading}
                            />
                        </div>

                        {/* Preview */}
                        {previewUrls.length > 0 && (
                            <div className='border-2 border-dashed border-gray-300 rounded-xl p-4'>
                                <div className='flex items-center justify-between mb-4'>
                                    <p className='text-sm font-semibold text-gray-700'>
                                        Preview ({previewUrls.length} gambar dipilih)
                                    </p>
                                    <button
                                        onClick={cancelPreview}
                                        className='text-sm text-red-600 hover:text-red-800 transition'>
                                        Batal
                                    </button>
                                </div>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className='relative aspect-square rounded-lg overflow-hidden border border-gray-200'>
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className='w-full h-full object-cover'
                                            />
                                            <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate'>
                                                {selectedFiles[index]?.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className='mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold'>
                                    {uploading ? (
                                        <>
                                            <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload /> Upload {previewUrls.length} Gambar
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Images Grid */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                    <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                        <FaImage className='text-purple-600' /> Gambar Kos Saat Ini
                    </h2>

                    {loading ? (
                        <div className='flex items-center justify-center py-20'>
                            <div className='text-center'>
                                <div className='animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
                                <p className='text-gray-600'>Memuat gambar...</p>
                            </div>
                        </div>
                    ) : images.length === 0 ? (
                        <div className='text-center py-20'>
                            <div className='text-6xl mb-4'>📷</div>
                            <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                                Belum ada gambar
                            </h3>
                            <p className='text-gray-600'>
                                Upload gambar pertama untuk kos ini
                            </p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {images.map((image, index) => {
                                const isDeleting = deletingIds.includes(image.id)
                                return (
                                    <div
                                        key={image.id}
                                        className='group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-300'>
                                        {/* Image */}
                                        <div className='relative aspect-video overflow-hidden'>
                                            <img
                                                src={`${BASE_IMAGE_KOS}/${image.file}`}
                                                alt={`Kos image ${index + 1}`}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                            />
                                            {isDeleting && (
                                                <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                                                    <div className='animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full'></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className='p-4'>
                                            <p className='text-xs text-gray-600 mb-2 truncate'>
                                                {image.file}
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                {new Date(image.createdAt).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <button
                                                onClick={() => handleReplaceClick(image)}
                                                title='Ganti gambar ini'
                                                className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg'>
                                                <FaExchangeAlt />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteImage(image.id, image.file)}
                                                disabled={isDeleting}
                                                title='Hapus gambar ini'
                                                className='p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'>
                                                <FaTrash />
                                            </button>
                                        </div>

                                        {/* Index Badge */}
                                        <div className='absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold'>
                                            #{index + 1}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Replace Image Modal */}
                {replacingImage && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                        <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
                            {/* Modal Header */}
                            <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
                                <div>
                                    <h3 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                                        <FaExchangeAlt className='text-blue-600' /> Ganti Gambar
                                    </h3>
                                    <p className='text-sm text-gray-600 mt-1'>
                                        Pilih gambar baru untuk mengganti gambar yang ada
                                    </p>
                                </div>
                                <button
                                    onClick={handleCancelReplace}
                                    disabled={replacing}
                                    className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50'>
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className='p-6'>
                                <div className='grid md:grid-cols-2 gap-6'>
                                    {/* Current Image */}
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-3'>
                                            Gambar Saat Ini
                                        </label>
                                        <div className='relative aspect-video rounded-xl overflow-hidden border-2 border-gray-300 bg-gray-50'>
                                            <img
                                                src={`${BASE_IMAGE_KOS}/${replacingImage.file}`}
                                                alt='Current'
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                                            <p className='text-xs text-gray-600 mb-1'>Nama File:</p>
                                            <p className='text-sm font-medium text-gray-900 truncate'>
                                                {replacingImage.file}
                                            </p>
                                            <p className='text-xs text-gray-500 mt-2'>
                                                Upload: {new Date(replacingImage.createdAt).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* New Image */}
                                    <div>
                                        <label className='block text-sm font-semibold text-gray-700 mb-3'>
                                            Gambar Baru
                                        </label>
                                        {!replaceFile ? (
                                            <div className='relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center'>
                                                <div className='text-center p-6'>
                                                    <FaImage className='mx-auto text-4xl text-gray-400 mb-3' />
                                                    <p className='text-sm text-gray-600 mb-4'>
                                                        Pilih gambar pengganti
                                                    </p>
                                                    <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
                                                        <FaUpload />
                                                        Pilih File
                                                        <input
                                                            type='file'
                                                            accept='image/*'
                                                            onChange={handleReplaceFileSelect}
                                                            className='hidden'
                                                            disabled={replacing}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className='relative aspect-video rounded-xl overflow-hidden border-2 border-blue-500 bg-gray-50'>
                                                    <img
                                                        src={replacePreviewUrl}
                                                        alt='Preview'
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                                <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                                                    <p className='text-xs text-blue-600 mb-1'>File Baru:</p>
                                                    <p className='text-sm font-medium text-blue-900 truncate'>
                                                        {replaceFile.name}
                                                    </p>
                                                    <p className='text-xs text-blue-700 mt-2'>
                                                        Ukuran: {(replaceFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        URL.revokeObjectURL(replacePreviewUrl)
                                                        setReplaceFile(null)
                                                        setReplacePreviewUrl('')
                                                    }}
                                                    disabled={replacing}
                                                    className='mt-3 w-full text-sm text-red-600 hover:text-red-800 transition disabled:opacity-50'>
                                                    Pilih gambar lain
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Warning */}
                                {replaceFile && (
                                    <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl'>
                                        <div className='flex items-start gap-3'>
                                            <div className='text-yellow-600 text-xl'>⚠️</div>
                                            <div>
                                                <p className='text-sm font-semibold text-yellow-900 mb-1'>
                                                    Perhatian!
                                                </p>
                                                <p className='text-sm text-yellow-800'>
                                                    Gambar lama akan dihapus dan diganti dengan gambar baru.
                                                    Proses ini tidak dapat dibatalkan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className='flex gap-3 mt-6'>
                                    <button
                                        onClick={handleCancelReplace}
                                        disabled={replacing}
                                        className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium'>
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleConfirmReplace}
                                        disabled={!replaceFile || replacing}
                                        className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium'>
                                        {replacing ? (
                                            <div>
                                                <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                                Mengganti...
                                            </div>
                                        ) : (
                                            <div>
                                                <FaExchangeAlt /> Ganti Gambar
                                            </div>
                                        )}
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
