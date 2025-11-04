'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData } from '@/lib/auth'
import { BASE_API_URL } from '@/global'
import { toast } from 'sonner'
import { FaArrowLeft, FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaPercent, FaUsers, FaUniversity, FaCity, FaCalendarAlt, FaImage, FaList, FaCheck, FaTimes, FaMale, FaFemale, FaUserFriends, FaCalendarWeek, FaCalendarDay, FaCalendar, FaDoorOpen } from 'react-icons/fa'

export default function CreateKosPage() {
    const router = useRouter()
    const user = getUserData()

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        pricePerMonth: '',
        discountPercent: '',
        gender: '',
        kampus: '',
        kota: '',
        kalender: '',
        totalRooms: ''
    })

    // Predefined facilities dengan checkbox
    const predefinedFacilities = [
        'WiFi', 'AC', 'Kasur', 'Kamar mandi dalam', 'TV', 'Dapur', 'Parkir', 'Laundry', 'Keamanan'
    ]
    const [checkedFacilities, setCheckedFacilities] = useState<Record<string, boolean>>({})
    const [customFacility, setCustomFacility] = useState('')

    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Enums dari schema
    const genderOptions = [
        { value: 'male', label: 'Pria', Icon: FaMale },
        { value: 'female', label: 'Wanita', Icon: FaFemale },
        { value: 'all', label: 'Campur', Icon: FaUserFriends }
    ]

    const kampusOptions = ['UGM', 'UNDIP', 'UNPAD', 'STAN', 'UNAIR', 'UB', 'UI', 'ITS', 'ITB', 'UNS', 'TELKOM', 'UNESA', 'BINUS', 'UMM']

    const kotaOptions = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Batam', 'Malang', 'Bogor', 'Depok', 'Tangerang', 'Solo', 'Makasar', 'Yogyakarta', 'Bekasi']

    const kalenderOptions = [
        { value: 'minggu', label: 'Per Minggu', Icon: FaCalendarWeek },
        { value: 'bulan', label: 'Per Bulan', Icon: FaCalendarDay },
        { value: 'tahun', label: 'Per Tahun', Icon: FaCalendar }
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const togglePredefinedFacility = (facility: string) => {
        setCheckedFacilities(prev => ({ ...prev, [facility]: !prev[facility] }))
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Validate total images (max 10)
        if (selectedImages.length + files.length > 10) {
            toast.error('Maksimal 10 gambar')
            return
        }

        const newFiles: File[] = []
        const newPreviews: string[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} bukan gambar`)
                continue
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} terlalu besar (max 5MB)`)
                continue
            }

            newFiles.push(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                newPreviews.push(reader.result as string)
                if (newPreviews.length === newFiles.length) {
                    setPreviewUrls(prev => [...prev, ...newPreviews])
                }
            }
            reader.readAsDataURL(file)
        }

        setSelectedImages(prev => [...prev, ...newFiles])
    }

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.name.trim()) {
            toast.error('Nama kos wajib diisi')
            return
        }

        if (!formData.address.trim()) {
            toast.error('Alamat kos wajib diisi')
            return
        }

        if (!formData.pricePerMonth || Number(formData.pricePerMonth) <= 0) {
            toast.error('Harga sewa harus lebih dari 0')
            return
        }

        if (!formData.totalRooms || Number(formData.totalRooms) < 1) {
            toast.error('Jumlah kamar minimal 1')
            return
        }

        if (selectedImages.length === 0) {
            toast.error('Minimal 1 gambar diperlukan')
            return
        }

        // Collect selected facilities
        const selectedPredefined = Object.keys(checkedFacilities).filter(k => checkedFacilities[k])
        const customFacilityTrimmed = customFacility.trim()
        const allFacilities = [...selectedPredefined]
        if (customFacilityTrimmed) {
            allFacilities.push(customFacilityTrimmed)
        }

        if (allFacilities.length === 0) {
            toast.error('Minimal 1 fasilitas diperlukan')
            return
        }

        try {
            setIsSubmitting(true)

            // Prepare FormData
            const submitData = new FormData()
            submitData.append('userId', user?.id?.toString() || '')
            submitData.append('name', formData.name.trim())
            submitData.append('address', formData.address.trim())
            submitData.append('pricePerMonth', formData.pricePerMonth)

            // Set discount to null if empty, otherwise use the value
            if (formData.discountPercent && formData.discountPercent.trim() !== '') {
                submitData.append('discountPercent', formData.discountPercent)
            }

            submitData.append('gender', formData.gender)

            // Only add kampus if it's not empty
            if (formData.kampus && formData.kampus.trim() !== '') {
                submitData.append('kampus', formData.kampus)
            }

            submitData.append('kota', formData.kota)
            submitData.append('kalender', formData.kalender)
            submitData.append('totalRooms', formData.totalRooms)
            submitData.append('availableRooms', formData.totalRooms) // Initially same as totalRooms

            // Add images
            selectedImages.forEach(file => {
                submitData.append('picture', file)
            })

            // Add facilities as JSON string
            const facilitiesData = allFacilities.map(f => ({ facility: f }))
            const facilitiesJSON = JSON.stringify(facilitiesData)
            submitData.append('facilities', facilitiesJSON)

            const response = await fetch(`${BASE_API_URL}/kos`, {
                method: 'POST',
                body: submitData
            })

            const result = await response.json()

            if (result.status) {
                toast.success('Kos berhasil ditambahkan!')
                router.push('/manager/kos')
            } else {
                toast.error(result.message || 'Gagal menambahkan kos')
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
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
            <div className='max-w-4xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <button
                        onClick={() => router.push('/manager/kos')}
                        className='flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition'>
                        <FaArrowLeft /> Kembali
                    </button>

                    <div className='bg-white border border-gray-200 rounded-2xl shadow-sm p-6'>
                        <h1 className='text-3xl font-bold mb-2 text-gray-800'>Tambah Kos Baru</h1>
                        <p className='text-gray-500'>Lengkapi informasi kos Anda untuk menarik lebih banyak penyewa</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Informasi Dasar */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
                        <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                            <div className='p-3 bg-gray-100 rounded-lg'>
                                <FaHome className='text-gray-500 text-xl' />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-gray-800'>Informasi Dasar</h2>
                                <p className='text-sm text-gray-500'>Data utama tentang kos Anda</p>
                            </div>
                        </div>

                        <div className='space-y-5'>
                            {/* Nama Kos */}
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                    Nama Kos <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder='Contoh: Kos Mahasiswa Sejahtera'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                                    required
                                />
                            </div>

                            {/* Alamat */}
                            <div>
                                <label className='text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                                    <FaMapMarkerAlt className='text-gray-500' /> Alamat Lengkap <span className='text-red-500'>*</span>
                                </label>
                                <textarea
                                    name='address'
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder='Jl. Contoh No. 123, RT 01/RW 02, Kelurahan...'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'
                                    required
                                />
                            </div>

                            {/* Kota & Kampus */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaCity className='text-gray-500' /> Kota <span className='text-red-500'>*</span>
                                    </label>
                                    <select
                                        name='kota'
                                        value={formData.kota}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'
                                        required>
                                        {kotaOptions.map(kota => (
                                            <option key={kota} value={kota}>{kota}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaUniversity className='text-gray-500' /> Kampus Terdekat
                                    </label>
                                    <select
                                        name='kampus'
                                        value={formData.kampus}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'>
                                        <option value=''>Pilih Kampus (Opsional)</option>
                                        {kampusOptions.map(kampus => (
                                            <option key={kampus} value={kampus}>{kampus}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Harga & Diskon */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaMoneyBillWave className='text-gray-500' /> Harga Sewa <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>Rp</span>
                                        <input
                                            type='number'
                                            name='pricePerMonth'
                                            value={formData.pricePerMonth}
                                            onChange={handleInputChange}
                                            placeholder='1500000'
                                            className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'
                                            required
                                            min='0'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaPercent className='text-gray-500' /> Diskon (%)
                                    </label>
                                    <input
                                        type='number'
                                        name='discountPercent'
                                        value={formData.discountPercent}
                                        onChange={handleInputChange}
                                        placeholder='0'
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'
                                        min='0'
                                        max='100'
                                    />
                                </div>
                            </div>

                            {/* Jumlah Kamar */}
                            <div>
                                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                    <FaDoorOpen className='text-gray-500' /> Jumlah Kamar Tersedia <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='number'
                                    name='totalRooms'
                                    value={formData.totalRooms}
                                    onChange={handleInputChange}
                                    placeholder='10'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'
                                    required
                                    min='1'
                                />
                                <p className='text-xs text-gray-500 mt-2'>
                                    Masukkan total jumlah kamar yang tersedia untuk disewakan
                                </p>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3'>
                                    <FaUsers className='text-gray-500' /> Tipe Penghuni <span className='text-red-500'>*</span>
                                </label>
                                <div className='grid grid-cols-3 gap-3'>
                                    {genderOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type='button'
                                            onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                                            className={`p-4 border-2 rounded-lg transition ${formData.gender === option.value
                                                ? 'bg-gray-700 text-white'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                            <option.Icon className={`text-2xl mb-2 mx-auto ${formData.gender === option.value ? 'text-white' : 'text-gray-500'}`} />
                                            <div className={`font-semibold text-gray-700 text-sm ${formData.gender === option.value ? 'text-white' : 'text-gray-500'}`}>{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Periode Sewa */}
                            <div>
                                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3'>
                                    <FaCalendarAlt className='text-gray-500' /> Periode Pembayaran <span className='text-red-500'>*</span>
                                </label>
                                <div className='grid grid-cols-3 gap-3'>
                                    {kalenderOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type='button'
                                            onClick={() => setFormData(prev => ({ ...prev, kalender: option.value }))}
                                            className={`p-4 border-2 rounded-lg transition ${formData.kalender === option.value
                                                ? 'bg-gray-700 text-white'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                            <option.Icon className={`text-2xl mb-2 mx-auto ${formData.kalender === option.value ? 'text-white' : 'text-gray-500'}`} />
                                            <div className={`font-semibold text-gray-700 text-sm ${formData.kalender === option.value ? 'text-white' : 'text-gray-500'}`}>{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fasilitas */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
                        <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                            <div className='p-3 bg-gray-100 rounded-lg'>
                                <FaList className='text-gray-500 text-xl' />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-gray-800'>Fasilitas</h2>
                                <p className='text-sm text-gray-500'>Pilih fasilitas yang tersedia di kos Anda</p>
                            </div>
                        </div>

                        <div className='space-y-5'>
                            {/* Predefined Facilities */}
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                                    Fasilitas Umum <span className='text-red-500'>*</span>
                                </label>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                    {predefinedFacilities.map((facility) => (
                                        <label
                                            key={facility}
                                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${checkedFacilities[facility]
                                                ? 'border-gray-500 bg-gray-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                            <input
                                                type='checkbox'
                                                checked={!!checkedFacilities[facility]}
                                                onChange={() => togglePredefinedFacility(facility)}
                                                className='w-5 h-5 text-gray-500 border-gray-300 rounded focus:ring-gray-400'
                                            />
                                            <span className='text-sm font-medium text-gray-700'>{facility}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Facility */}
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                    Fasilitas Tambahan (Opsional)
                                </label>
                                <input
                                    type='text'
                                    value={customFacility}
                                    onChange={(e) => setCustomFacility(e.target.value)}
                                    placeholder='Contoh: WiFi 100 Mbps, Mesin Cuci Pribadi, dll'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition'
                                />
                                <p className='text-xs text-gray-500 mt-2'>
                                    Tambahkan fasilitas khusus yang tidak ada di daftar di atas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gambar */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
                        <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-200'>
                            <div className='p-3 bg-gray-100 rounded-lg'>
                                <FaImage className='text-gray-500 text-xl' />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-gray-800'>Gambar Kos</h2>
                                <p className='text-sm text-gray-500'>Upload foto kos (min 1, max 10)</p>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <label className='block mb-4'>
                            <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition cursor-pointer'>
                                <FaImage className='text-5xl text-gray-400 mx-auto mb-4' />
                                <p className='text-gray-700 font-medium mb-2'>Klik untuk pilih gambar</p>
                                <p className='text-sm text-gray-500'>JPG, JPEG, PNG (max 5MB per file)</p>
                            </div>
                            <input
                                type='file'
                                accept='image/jpeg,image/jpg,image/png'
                                multiple
                                onChange={handleImageSelect}
                                className='hidden'
                            />
                        </label>

                        {/* Preview Images */}
                        {previewUrls.length > 0 && (
                            <div>
                                <h3 className='font-semibold text-gray-800 mb-3'>Preview ({previewUrls.length}/10)</h3>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className='relative aspect-square rounded-lg overflow-hidden border border-gray-200 group'>
                                            <img src={url} alt={`Preview ${index + 1}`} className='w-full h-full object-cover' />
                                            <div className='absolute top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-md font-bold'>
                                                {index + 1}
                                            </div>
                                            <button
                                                type='button'
                                                onClick={() => handleRemoveImage(index)}
                                                className='absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition'>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                        <div className='flex gap-3'>
                            <button
                                type='button'
                                onClick={() => router.push('/manager/kos')}
                                disabled={isSubmitting}
                                className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50'>
                                Batal
                            </button>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                {isSubmitting ? (
                                    <>
                                        <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck /> Simpan Kos
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
