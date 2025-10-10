'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserData, setAuthData, clearAuthData } from '@/lib/auth'
import { BASE_API_URL, BASE_IMAGE_PROFILE } from '@/global'
import { toast } from 'sonner'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaShieldAlt, FaTrash } from 'react-icons/fa'

export default function PengaturanPage() {
    const router = useRouter()
    const user = getUserData()

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [profilePicture, setProfilePicture] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            // Set preview URL from existing profile picture
            if (user.profile_picture) {
                setPreviewUrl(`${BASE_IMAGE_PROFILE}/${user.profile_picture}`)
            }
        }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 5MB')
            return
        }

        setProfilePicture(file)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveImage = () => {
        setProfilePicture(null)
        setPreviewUrl('')

        // Reset file input
        const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    const handleUpdateProfile = async () => {
        // Validation
        if (!formData.name.trim()) {
            toast.error('Nama wajib diisi')
            return
        }

        if (!formData.email.trim()) {
            toast.error('Email wajib diisi')
            return
        }

        if (!formData.phone.trim()) {
            toast.error('Nomor telepon wajib diisi')
            return
        }

        try {
            setIsSubmitting(true)

            const submitData = new FormData()
            submitData.append('name', formData.name.trim())
            submitData.append('email', formData.email.trim())
            submitData.append('phone', formData.phone.trim())

            if (profilePicture) {
                submitData.append('profile_picture', profilePicture)
            }

            const response = await fetch(`${BASE_API_URL}/users/${user?.id}`, {
                method: 'PUT',
                body: submitData
            })

            const result = await response.json()

            if (result.status) {
                toast.success('Profil berhasil diperbarui!')

                // Update local storage
                const updatedUser = result.data
                setAuthData(
                    localStorage.getItem('authToken') || '',
                    updatedUser.id,
                    updatedUser.name,
                    updatedUser.email,
                    updatedUser.role,
                    updatedUser.phone,
                    updatedUser.profile_picture
                )

                setIsEditing(false)

                // Reload untuk update UI
                window.location.reload()
            } else {
                toast.error(result.message || 'Gagal memperbarui profil')
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChangePassword = async () => {
        // Validation
        if (!formData.currentPassword) {
            toast.error('Password lama wajib diisi')
            return
        }

        if (!formData.newPassword) {
            toast.error('Password baru wajib diisi')
            return
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password baru minimal 6 karakter')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Konfirmasi password tidak cocok')
            return
        }

        try {
            setIsSubmitting(true)

            const response = await fetch(`${BASE_API_URL}/users/${user?.id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const result = await response.json()

            if (result.status) {
                toast.success('Password berhasil diubah!')

                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }))
                setIsChangingPassword(false)
            } else {
                toast.error(result.message || 'Gagal mengubah password')
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmDelete = confirm(
            '⚠️ PERINGATAN!\n\nApakah Anda yakin ingin menghapus akun?\n\nSemua data Anda akan dihapus permanen dan tidak dapat dikembalikan!'
        )

        if (!confirmDelete) return

        try {
            setIsSubmitting(true)

            const response = await fetch(`${BASE_API_URL}/users/${user?.id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.status) {
                toast.success('Akun berhasil dihapus')
                clearAuthData()
                router.push('/auth/login')
            } else {
                toast.error(result.message || 'Gagal menghapus akun')
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                <div className='text-center bg-white rounded-2xl shadow-lg p-8 max-w-md'>
                    <div className='text-6xl mb-4'>🔒</div>
                    <h1 className='text-2xl font-bold mb-2'>Login Required</h1>
                    <p className='text-gray-600 mb-4'>Silakan login terlebih dahulu</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
                        Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='max-w-5xl mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white'>
                        <div className='flex items-center gap-3'>
                            <FaUser className='text-3xl' />
                            <div>
                                <h1 className='text-3xl font-bold'>Pengaturan Akun</h1>
                                <p className='text-blue-100'>Kelola informasi pribadi dan keamanan akun Anda</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='grid gap-6 lg:grid-cols-3'>
                    {/* Left Column - Profile Picture */}
                    <div className='lg:col-span-1'>
                        <div className='bg-white rounded-2xl shadow-lg p-6'>
                            <h2 className='text-xl font-bold text-gray-900 mb-4'>Foto Profil</h2>

                            <div className='flex flex-col items-center'>
                                {/* Profile Picture Preview */}
                                <div className='relative mb-4'>
                                    <div className='w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100'>
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt='Profile'
                                                className='w-full h-full object-cover'
                                            />
                                        ) : (
                                            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600'>
                                                <FaUser className='text-white text-5xl' />
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <label className='absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg'>
                                            <FaCamera className='text-xl' />
                                            <input
                                                id='profile-picture-input'
                                                type='file'
                                                accept='image/*'
                                                onChange={handleImageSelect}
                                                className='hidden'
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Remove Image Button */}
                                {isEditing && previewUrl && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className='mb-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium'>
                                        <FaTrash className='inline mr-2' />
                                        Hapus Foto
                                    </button>
                                )}

                                {/* User Role Badge */}
                                <div className='flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full'>
                                    <FaShieldAlt className='text-blue-600' />
                                    <span className='text-sm font-semibold text-blue-600 uppercase'>
                                        {user.role}
                                    </span>
                                </div>

                                <p className='text-xs text-gray-500 mt-4 text-center'>
                                    JPG, JPEG, PNG (Max 5MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Info & Password */}
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Profile Information */}
                        <div className='bg-white rounded-2xl shadow-lg p-6'>
                            <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200'>
                                <h2 className='text-xl font-bold text-gray-900'>Informasi Profil</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
                                        <FaEdit /> Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsEditing(false)
                                            // Reset form
                                            if (user) {
                                                setFormData({
                                                    name: user.name || '',
                                                    email: user.email || '',
                                                    phone: user.phone || '',
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                })
                                                if (user.profile_picture) {
                                                    setPreviewUrl(`${BASE_IMAGE_PROFILE}/${user.profile_picture}`)
                                                }
                                            }
                                        }}
                                        className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition'>
                                        <FaTimes /> Batal
                                    </button>
                                )}
                            </div>

                            <div className='space-y-5'>
                                {/* Name */}
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaUser className='text-gray-500' /> Nama Lengkap
                                    </label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${!isEditing ? 'bg-gray-50 text-gray-600' : ''
                                            }`}
                                        placeholder='Masukkan nama lengkap'
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaEnvelope className='text-gray-500' /> Email
                                    </label>
                                    <input
                                        type='email'
                                        name='email'
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${!isEditing ? 'bg-gray-50 text-gray-600' : ''
                                            }`}
                                        placeholder='email@example.com'
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                        <FaPhone className='text-gray-500' /> Nomor Telepon
                                    </label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${!isEditing ? 'bg-gray-50 text-gray-600' : ''
                                            }`}
                                        placeholder='08xxxxxxxxxx'
                                    />
                                </div>

                                {/* Save Button */}
                                {isEditing && (
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isSubmitting}
                                        className='w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                        {isSubmitting ? (
                                            <>
                                                <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className='bg-white rounded-2xl shadow-lg p-6'>
                            <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200'>
                                <div>
                                    <h2 className='text-xl font-bold text-gray-900'>Keamanan</h2>
                                    <p className='text-sm text-gray-600'>Ubah password untuk keamanan akun</p>
                                </div>
                                {!isChangingPassword && (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className='flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition'>
                                        <FaLock /> Ubah Password
                                    </button>
                                )}
                            </div>

                            {isChangingPassword && (
                                <div className='space-y-5'>
                                    {/* Current Password */}
                                    <div>
                                        <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                            <FaLock className='text-gray-500' /> Password Lama
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                name='currentPassword'
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                                                placeholder='Masukkan password lama'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                            <FaLock className='text-gray-500' /> Password Baru
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                name='newPassword'
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                                                placeholder='Minimal 6 karakter'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                                            <FaLock className='text-gray-500' /> Konfirmasi Password Baru
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name='confirmPassword'
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                                                placeholder='Ulangi password baru'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => {
                                                setIsChangingPassword(false)
                                                setFormData(prev => ({
                                                    ...prev,
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                }))
                                            }}
                                            disabled={isSubmitting}
                                            className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50'>
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isSubmitting}
                                            className='flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                            {isSubmitting ? (
                                                <>
                                                    <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                                    Mengubah...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave /> Ubah Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Danger Zone */}
                        <div className='bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200'>
                            <div className='mb-4'>
                                <h2 className='text-xl font-bold text-red-600 mb-2'>Zona Berbahaya</h2>
                                <p className='text-sm text-gray-600'>Tindakan di bawah ini tidak dapat dibatalkan</p>
                            </div>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={isSubmitting}
                                className='w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2'>
                                <FaTrash /> Hapus Akun Permanen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
