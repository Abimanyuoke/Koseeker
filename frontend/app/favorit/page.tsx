'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BASE_API_URL, BASE_IMAGE_KOS } from '@/global'
import { getAuthToken } from '@/lib/auth'
import { FiLoader } from 'react-icons/fi'
import { FaHeart, FaMapMarkerAlt, FaUserAlt, FaSchool, FaCity } from 'react-icons/fa'

interface KosImage {
    file: string
}

interface Kos {
    id: number
    name: string
    address: string
    pricePerMonth: number
    discountPercent?: number
    gender: string
    kampus: string
    kota: string
    images: KosImage[]
}

interface FavoriteItem {
    id: number
    kosId: number
    userId: number
    createdAt: string
    kos: Kos
}

export default function FavoritPage() {
    const router = useRouter()
    const [favorites, setFavorites] = useState<FavoriteItem[]>([])
    const [loading, setLoading] = useState(true)
    const [removingId, setRemovingId] = useState<number | null>(null)

    useEffect(() => {
        fetchFavorites()
    }, [])

    const fetchFavorites = async () => {
        try {
            setLoading(true)
            const token = getAuthToken()
            const userId = localStorage.getItem('id')

            if (!token || !userId) {
                console.log('No token or userId, redirecting to login')
                router.push('/auth/login')
                return
            }

            console.log('Fetching favorites for userId:', userId)
            console.log('BASE_IMAGE_KOS:', BASE_IMAGE_KOS)

            const response = await fetch(`${BASE_API_URL}/like/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            console.log('Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('Response data:', data)
                console.log('Number of favorites:', data.data?.length)

                if (data.status) {
                    setFavorites(data.data)

                    // Debug: Log images for each kos
                    data.data.forEach((fav: FavoriteItem) => {
                        console.log('Kos:', fav.kos.name)
                        console.log('Images:', fav.kos.images)
                        if (fav.kos.images && fav.kos.images.length > 0) {
                            console.log('First image file:', fav.kos.images[0].file)
                            console.log('Full image URL:', `${BASE_IMAGE_KOS}/${fav.kos.images[0].file}`)
                        }
                    })
                } else {
                    console.error('API returned status false:', data.message)
                }
            } else {
                const errorData = await response.json().catch(() => null)
                console.error('Failed to fetch favorites. Status:', response.status, 'Error:', errorData)
            }
        } catch (error) {
            console.error('Error fetching favorites:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFavorite = async (kosId: number) => {
        try {
            setRemovingId(kosId)
            const token = getAuthToken()
            const userId = localStorage.getItem('id')

            if (!token || !userId) {
                router.push('/auth/login')
                return
            }

            const response = await fetch(`${BASE_API_URL}/like/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    kosId: kosId,
                    userId: parseInt(userId)
                })
            })

            if (response.ok) {
                // Remove from local state
                setFavorites(prev => prev.filter(item => item.kosId !== kosId))
            }
        } catch (error) {
            console.error('Error removing favorite:', error)
        } finally {
            setRemovingId(null)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price)
    }

    const getDiscountedPrice = (price: number, discount?: number) => {
        if (!discount) return price
        return price - (price * discount / 100)
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
            case 'male': return 'text-[404040]';
            case 'female': return 'text-[404040]';
            case 'all': return 'text-[404040]';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleKosClick = (kosId: number) => {
        router.push(`/kos/${kosId}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FiLoader className="animate-spin text-5xl text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Memuat favorit...</p>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ❤️ Kos Favorit Saya
                    </h1>
                    <p className="text-gray-600">
                        Daftar kos yang telah Anda tandai sebagai favorit
                    </p>
                </div>

                {/* Empty State */}
                {favorites.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <Image src="/images/logo_terpukau.svg" alt="Belum Ada Favorit" width={200} height={200} className="mx-auto" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Belum Ada Favorit
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Anda belum menandai kos apapun sebagai favorit. Mulai jelajahi dan tandai kos yang Anda sukai!
                            </p>
                            <button
                                onClick={() => router.push('/kos')}
                                className="px-6 py-3 bg-gradient-to-r from-primary/80 hover:cursor-pointer to-green-800 text-white rounded-lg hover:scale-105 transition font-semibold">
                                Jelajahi Kos
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Count Badge */}
                        <div className="mb-6">
                            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                {favorites.length} Kos Favorit
                            </span>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((favorite) => {
                                const kos = favorite.kos
                                const mainImage = kos.images && kos.images.length > 0
                                    ? `${BASE_IMAGE_KOS}/${kos.images[0].file}`
                                    : '/images/default-kos.jpg'
                                const discountedPrice = getDiscountedPrice(kos.pricePerMonth, kos.discountPercent)

                                console.log('Kos:', kos.name, 'Images:', kos.images, 'Main Image URL:', mainImage)

                                return (
                                    <div
                                        key={favorite.id}
                                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                                        {/* Image Container */}
                                        <div
                                            className="relative h-56 overflow-hidden bg-gray-200"
                                            onClick={() => handleKosClick(kos.id)}>
                                            {kos.images && kos.images.length > 0 ? (
                                                <Image
                                                    src={mainImage}
                                                    alt={kos.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    unoptimized
                                                    onError={(e) => {
                                                        console.error('Image load error for:', mainImage)
                                                        e.currentTarget.style.display = 'none'
                                                    }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                    <span className="text-gray-400 text-sm">No Image</span>
                                                </div>
                                            )}

                                            {/* Discount Badge */}
                                            {kos.discountPercent && kos.discountPercent > 0 && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                    {kos.discountPercent}% OFF
                                                </div>
                                            )}

                                            {/* Favorite Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemoveFavorite(kos.id)
                                                }}
                                                disabled={removingId === kos.id}
                                                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-all duration-200 shadow-lg">
                                                {removingId === kos.id ? (
                                                    <FiLoader className="animate-spin text-red-500 w-5 h-5" />
                                                ) : (
                                                    <FaHeart className="text-red-500 w-5 h-5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5" onClick={() => handleKosClick(kos.id)}>
                                            {/* Gender Badge */}
                                            <div className="w-[60px]">
                                                <span className={`px-2 py-1 rounded text-[12px] font-bold border border-slate-300  ${getGenderColor(kos.gender)}`}>
                                                    {getGenderText(kos.gender)}
                                                </span>
                                            </div>
                                            {/* Name */}
                                            <div className="mt-4">
                                                <h3 className="text-sm text-gray-900 line-clamp-1">
                                                    {kos.name}
                                                </h3>
                                                <p className="text-sm font-semibold text-gray-600 line-clamp-2">
                                                    {kos.address}
                                                </p>
                                                <div className='flex items-center gap-3'>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {kos.kota}
                                                    </p>
                                                    <span className="w-1 h-1 mt-1.5 rounded-full bg-gray-400"></span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        <span>{kos.kampus}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="border-t border-gray-100 pt-4">
                                                {kos.discountPercent && kos.discountPercent > 0 ? (
                                                    <div>
                                                        <p className="text-sm text-gray-400 line-through mb-1">
                                                            Rp {formatPrice(kos.pricePerMonth)}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div className='flex items-center gap-2'>
                                                                <p className="text-xl font-bold text-black">
                                                                    Rp {formatPrice(discountedPrice)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">( per bulan )</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-green-600 font-semibold">
                                                                    Hemat Rp {formatPrice(kos.pricePerMonth - discountedPrice)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className='flex items-center gap-2'>
                                                        <p className="text-xl font-bold text-black">
                                                            Rp {formatPrice(kos.pricePerMonth)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">( per bulan )</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
