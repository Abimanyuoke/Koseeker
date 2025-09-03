'use client'

import React, { useState, useEffect } from 'react'
import Slider from 'react-slick'
import Image from 'next/image'
import Link from 'next/link'
import { IKos } from '../../types'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface PromoSectionProps {
    city: string
}

interface CountdownProps {
    endDate: Date
}

const Countdown: React.FC<CountdownProps> = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const distance = endDate.getTime() - now

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)

                setTimeLeft({ days, hours, minutes, seconds })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [endDate])

    return (
        <div className="flex items-center justify-center space-x-2 text-sm font-bold">
            <span className="text-white">Akan berakhir dalam waktu:</span>
            <div className="flex space-x-1">
                <div className="bg-slate-700 text-white px-2 py-1 rounded">
                    {String(timeLeft.days).padStart(2, '0')}
                </div>
                <span className="text-white">:</span>
                <div className="bg-slate-700 text-white px-2 py-1 rounded">
                    {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-white">:</span>
                <div className="bg-slate-700 text-white px-2 py-1 rounded">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-white">:</span>
                <div className="bg-slate-700 text-white px-2 py-1 rounded">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </div>
            </div>
        </div>
    )
}

const PromoCard: React.FC<{ kos: IKos }> = ({ kos }) => {
    const originalPrice = kos.pricePerMonth
    const discountedPrice = kos.discountPercent ? originalPrice - (originalPrice * kos.discountPercent / 100) : originalPrice

    // Set promo end date (from 7 days from now)
    const promoEndDate = (() => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        return date
    })()

    return (
        <div className="relative mx-2">
            <Link href={`/kos/${kos.id}`}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Discount Badge */}
                    {kos.discountPercent && (
                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{kos.discountPercent}%
                        </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 w-full">
                        <Image
                            src={kos.images && kos.images.length > 0
                                ? `http://localhost:5000/kos_picture/${kos.images[0].file}`
                                : '/images/default-kos.jpg'
                            }
                            alt={kos.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                            {kos.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {kos.address}
                        </p>

                        {/* Price */}
                        <div className="space-y-1">
                            {kos.discountPercent ? (
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl font-bold text-red-500">
                                            Rp {discountedPrice.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                            Rp {originalPrice.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">per bulan</p>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-2xl font-bold text-gray-800">
                                        Rp {originalPrice.toLocaleString('id-ID')}
                                    </span>
                                    <p className="text-sm text-gray-600">per bulan</p>
                                </div>
                            )}
                        </div>

                        {/* Facilities */}
                        {kos.facilities && kos.facilities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                                {kos.facilities.slice(0, 3).map((facility, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                    >
                                        {facility.facility}
                                    </span>
                                ))}
                                {kos.facilities.length > 3 && (
                                    <span className="text-gray-500 text-xs">
                                        +{kos.facilities.length - 3} lainnya
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}

const PromoSection: React.FC<PromoSectionProps> = ({ city }) => {
    const [promoKos, setPromoKos] = useState<IKos[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPromoKos = async () => {
            try {
                setLoading(true)
                const response = await fetch(`http://localhost:5000/kos/promo?kota=${city}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.status && data.data) {
                        setPromoKos(data.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching promo kos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPromoKos()
    }, [city])

    // Set promo end date (example: 7 days from now)
    const promoEndDate = new Date()
    promoEndDate.setDate(promoEndDate.getDate() + 7)

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    }

    if (loading) {
        return (
            <div className="mx-[150px] mb-12">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-white/20 rounded mb-4"></div>
                            <div className="h-6 bg-white/20 rounded mb-8"></div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-64 bg-white/20 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (promoKos.length === 0) {
        return null
    }

    return (
        <div className="mx-[150px] mb-12">
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-2xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        🏃‍♂️ Promo Ngebut 🏃‍♀️
                    </h2>
                    <p className="text-white/90 text-lg mb-4">
                        Kos terbaik di {city} dengan diskon menarik!
                    </p>

                    {/* Countdown Timer */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 inline-block">
                        <Countdown endDate={promoEndDate} />
                    </div>
                </div>

                {/* Slider */}
                <div className="relative">
                    <Slider {...sliderSettings}>
                        {promoKos.map((kos) => (
                            <PromoCard key={kos.id} kos={kos} />
                        ))}
                    </Slider>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-white/80 text-sm">
                        *Promo berlaku selama persediaan masih ada
                    </p>
                </div>
            </div>
        </div>
    )
}

export default PromoSection
