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

            const response = await fetch(`${BASE_API_URL}/like/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            console.log('Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('Response data:', data)
                
                if (data.status) {
                    setFavorites(data.data)
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
            case 'male': return 'bg-blue-100 text-blue-800'
            case 'female': return 'bg-pink-100 text-pink-800'
            case 'all': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleKosClick = (kosId: number) => {
        router.push(`/kos/${kosId}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FiLoader className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
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
                            <div className="text-6xl mb-4">💔</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Belum Ada Favorit
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Anda belum menandai kos apapun sebagai favorit. Mulai jelajahi dan tandai kos yang Anda sukai!
                            </p>
                            <button
                                onClick={() => router.push('/home')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                Jelajahi Kos
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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

                                return (
                                    <div
                                        key={favorite.id}
                                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                                    >
                                        {/* Image Container */}
                                        <div
                                            className="relative h-56 overflow-hidden"
                                            onClick={() => handleKosClick(kos.id)}
                                        >
                                            <Image
                                                src={mainImage}
                                                alt={kos.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />

                                            {/* Discount Badge */}
                                            {kos.discountPercent && kos.discountPercent > 0 && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                    🔥 {kos.discountPercent}% OFF
                                                </div>
                                            )}

                                            {/* Favorite Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemoveFavorite(kos.id)
                                                }}
                                                disabled={removingId === kos.id}
                                                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                                            >
                                                {removingId === kos.id ? (
                                                    <FiLoader className="animate-spin text-red-500 w-5 h-5" />
                                                ) : (
                                                    <FaHeart className="text-red-500 w-5 h-5" />
                                                )}
                                            </button>

                                            {/* Gender Badge */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className={`${getGenderColor(kos.gender)} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg`}>
                                                    <FaUserAlt className="w-3 h-3" />
                                                    {getGenderText(kos.gender)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div
                                            className="p-5"
                                            onClick={() => handleKosClick(kos.id)}
                                        >
                                            {/* Name */}
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                                                {kos.name}
                                            </h3>

                                            {/* Address */}
                                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                                                <FaMapMarkerAlt className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                                <p className="line-clamp-2">{kos.address}</p>
                                            </div>

                                            {/* Location Info */}
                                            <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FaSchool className="w-3 h-3" />
                                                    <span>{kos.kampus}</span>
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <div className="flex items-center gap-1">
                                                    <FaCity className="w-3 h-3" />
                                                    <span>{kos.kota}</span>
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
                                                            <div>
                                                                <p className="text-2xl font-bold text-blue-600">
                                                                    Rp {formatPrice(discountedPrice)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">per bulan</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-green-600 font-semibold">
                                                                    Hemat Rp {formatPrice(kos.pricePerMonth - discountedPrice)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-2xl font-bold text-blue-600">
                                                            Rp {formatPrice(kos.pricePerMonth)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">per bulan</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
