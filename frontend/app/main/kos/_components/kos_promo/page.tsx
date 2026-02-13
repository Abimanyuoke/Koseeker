/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, SetStateAction, useRef } from "react";
import { useRouter } from "next/navigation";
import { IKos } from "@/app/types";
import { getCookies } from "@/lib/client-cookies";
import { BASE_API_URL, BASE_IMAGE_KOS } from "../../../../../global";
import { get } from "@/lib/bridge";
import { AlertToko } from "../../../../src/components/ui/alert";
import Image from "next/image";
import { FiLoader } from "react-icons/fi";
import Select from "../../../../src/components/ui/select";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { ArrowKos } from "../../../../src/components/features/promo/arrow-promo";
import Slider from "react-slick";

interface CountdownProps {
    endDate: Date;
}

const Countdown: React.FC<CountdownProps> = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endDate.getTime() - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="text-base font-bold text-gray-900">{String(timeLeft.days).padStart(2, '0')}</div>
                        <div className="font-semibold">Hari</div>
                    </div>
                </div>
                <span className="text-gray-400 text-base font-bold">:</span>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                    <div className="text-center">
                        <div className="text-base font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</div>
                    </div>
                </div>
                <span className="text-gray-400 text-base font-bold">:</span>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                    <div className="text-center">
                        <div className="text-base font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    </div>
                </div>
                <span className="text-gray-400 text-base font-bold">:</span>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                    <div className="text-center">
                        <div className="text-base font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KosPromoPage = () => {
    const router = useRouter();
    const sliderRef = useRef<Slider | null>(null);

    // Daftar kota berdasarkan enum Kota di Prisma
    const kotaOptions = [
        "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Makassar",
        "Palembang", "Batam", "Malang", "Bogor", "Depok", "Tangerang",
        "Solo", "Makasar", "Yogyakarta", "Bekasi"
    ];

    /** ---------- STATE ---------- */
    const [kosData, setKosData] = useState<IKos[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKota, setSelectedKota] = useState<string>("all"); // Default semua kota
    const [imageIndexes, setImageIndexes] = useState<{ [key: number]: number }>({});

    /** ---------- FETCH KOS DATA ---------- */
    const getKosPromoData = async (kota?: string) => {
        try {
            setLoading(true);
            const TOKEN = getCookies("token") || "";
            const url = `${BASE_API_URL}/kos`;

            const { data } = await get(url, TOKEN);
            if ((data as { status: boolean; data: IKos[] }).status) {
                let promoKos = (data as { status: boolean; data: IKos[] }).data;

                // Filter hanya kos yang memiliki diskon
                promoKos = promoKos.filter(kos => kos.discountPercent && kos.discountPercent > 0);

                // Filter kota jika bukan "all"
                if (kota && kota !== "all") {
                    promoKos = promoKos.filter(kosItem => kosItem.kota.toLowerCase() === kota.toLowerCase());
                }

                setKosData(promoKos);
            }
        } catch (error) {
            console.error("Error getting promo kos data:", error);
        } finally {
            setLoading(false);
        }
    }; useEffect(() => {
        getKosPromoData(selectedKota);
    }, [selectedKota]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male': return 'Pria';
            case 'female': return 'Wanita';
            case 'all': return 'Campuran';
            default: return gender;
        }
    };

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male': return 'text-[404040]';
            case 'female': return 'text-[404040]';
            case 'all': return 'text-[404040]';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // const getFacilityIcon = (facility: string) => {
    //     const facilityLower = facility.toLowerCase();
    //     if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <FaWifi className="text-gray-500" />;
    //     if (facilityLower.includes('kasur') || facilityLower.includes('bed')) return <FaBed className="text-gray-500" />;
    //     if (facilityLower.includes('parkir') || facilityLower.includes('parking')) return <FaCar className="text-gray-500" />;
    //     if (facilityLower.includes('tv') || facilityLower.includes('television')) return <FaTv className="text-gray-500" />;
    //     if (facilityLower.includes('ac') || facilityLower.includes('air conditioning')) return <FaSnowflake className="text-gray-500" />;
    //     if (facilityLower.includes('kamar mandi') || facilityLower.includes('bathroom')) return <FaShower className="text-gray-500" />;
    //     if (facilityLower.includes('laundry') || facilityLower.includes('cuci')) return <MdLocalLaundryService className="text-gray-500" />;
    //     if (facilityLower.includes('dapur') || facilityLower.includes('kitchen')) return <GiCook className="text-gray-500" />;
    //     if (facilityLower.includes('security') || facilityLower.includes('keamanan')) return <MdSecurity className="text-gray-500" />;
    //     return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    // };

    // const handlePrevImage = (e: React.MouseEvent, kosId: number, totalImages: number) => {
    //     e.stopPropagation();
    //     setImageIndexes(prev => ({
    //         ...prev,
    //         [kosId]: prev[kosId] > 0 ? prev[kosId] - 1 : totalImages - 1
    //     }));
    // };

    // const handleNextImage = (e: React.MouseEvent, kosId: number, totalImages: number) => {
    //     e.stopPropagation();
    //     setImageIndexes(prev => ({
    //         ...prev,
    //         [kosId]: prev[kosId] < totalImages - 1 ? prev[kosId] + 1 : 0
    //     }));
    // };

    // Set promo end date (example: 7 days from now)
    const promoEndDate = new Date();
    promoEndDate.setDate(promoEndDate.getDate() + 7);

    /** ---------- RENDER ---------- */
    return (
        <div className="bg-white duration-200 ">
            <div className="max-w-6xl mx-auto py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                Promo Ngebut di{" "}
                                <span className="text-red-600">
                                    {selectedKota === "all" ? "Semua Kota" : selectedKota}
                                </span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Temukan kos terbaik dengan diskon menarik
                            </p>
                        </div>
                    </div>

                    {/* Countdown Timer Section */}
                    <div className="py-8">
                        <div className="px-4 flex items-center gap-4">
                            <div className="text-base font-medium flex flex-col text-right">
                                <span>Akan Berakhir</span>
                                <span>dalam waktu:</span>
                            </div>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200">
                                <Countdown endDate={promoEndDate} />
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center gap-4 w-full md:w-auto col-span-2">
                        <div className="w-full md:w-40">
                            <Select
                                id="kota-select"
                                value={selectedKota}
                                onChange={(value: SetStateAction<string>) => setSelectedKota(value)}
                                label="Pilih Kota"
                                className="text-gray-900">
                                <option value="all">Semua Kota</option>
                                {kotaOptions.map((kota) => (
                                    <option key={kota} value={kota}>
                                        {kota}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="border-l-2 border-slate-300 h-8 mt-4"></div>
                        <div>
                            <ArrowKos
                                next={() => sliderRef.current?.slickNext()}
                                prev={() => sliderRef.current?.slickPrev()} />
                        </div>
                    </div>
                </div>
            </div>



            {/* ----------------- KOS CARDS ----------------- */}
            <div className="max-w-6xl mx-auto py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[250px]">
                        <div className="flex flex-col items-center gap-4">
                            <FiLoader className="animate-spin text-green-500 text-4xl" />
                            <p className="text-gray-600 text-lg">Memuat data kos promo...</p>
                        </div>
                    </div>
                ) : kosData.length === 0 ? (
                    <div className="text-start py-4">
                        <AlertToko title="Informasi">
                            Tidak ada kos promo yang tersedia di {selectedKota === "all" ? "semua kota" : selectedKota} saat ini.
                        </AlertToko>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {kosData.map((kos) => {
                            const currentImageIndex = imageIndexes[kos.id] || 0;
                            // const hasMultipleImages = kos.images && kos.images.length > 1;
                            // const originalPrice = kos.pricePerMonth;
                            // const discountedPrice = kos.discountPercent ? originalPrice - (originalPrice * kos.discountPercent / 100) : originalPrice;

                            return (
                                <div
                                    key={kos.id}
                                    className="bg-white rounded-xl transition-all duration-300 overflow-hidden cursor-pointer group transform"
                                    onClick={() => router.push(`/kos/${kos.id}`)}>
                                    <div className="relative h-48 overflow-hidden">

                                        {kos.images && kos.images.length > 0 ? (
                                            <div>
                                                <Image
                                                    src={`${BASE_IMAGE_KOS}/${kos.images[currentImageIndex].file}`}
                                                    alt={kos.name}
                                                    fill
                                                    // className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    unoptimized />

                                                {/* {hasMultipleImages && (
                                                    <div>
                                                        <button
                                                            onClick={(e) => handlePrevImage(e, kos.id, kos.images.length)}
                                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                            <FaChevronLeft className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleNextImage(e, kos.id, kos.images.length)}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                            <FaChevronRight className="text-sm" />
                                                        </button>
                                                    </div>
                                                )}

                                                {hasMultipleImages && (
                                                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                        {kos.images.map((_, index) => (
                                                            <div
                                                                key={index}
                                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                                                                    ? 'bg-white'
                                                                    : 'bg-white/50'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                )} */}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Konten Kos */}
                                    <div className="py-5">
                                        {/* Badge Gender */}
                                        <span className={`px-2 py-1 rounded text-[14px] font-bold border border-slate-300  ${getGenderColor(kos.gender)}`}>
                                            {getGenderText(kos.gender)}
                                        </span>
                                        <div className="mt-4">
                                            <h3 className="text-sm text-gray-900 line-clamp-1">
                                                {kos.name}
                                            </h3>
                                            <p className="text-sm font-semibold text-gray-600 line-clamp-2">
                                                {kos.address}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {kos.kota}
                                            </p>
                                        </div>

                                        {kos.facilities && kos.facilities.length > 0 && (
                                            <div className="mb-4 mt-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {kos.facilities.slice(0, 4).map((facility, index) => (
                                                        <div
                                                            key={facility.id}
                                                            className="flex items-center gap-1 rounded-lg"
                                                            title={facility.facility}>
                                                            {/* Icon lingkaran kecil muncul kalau bukan index pertama */}
                                                            {index > 0 && (
                                                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                                            )}
                                                            <span className="text-xs text-gray-600 truncate max-w-24">
                                                                {facility.facility.length > 30
                                                                    ? facility.facility.substring(0, 8) + "..."
                                                                    : facility.facility}
                                                            </span>
                                                        </div>
                                                    ))}

                                                    {kos.facilities.length > 4 && (
                                                        <div className="flex items-center justify-center bg-gray-100 px-2 py-1 rounded-lg">
                                                            <span className="text-xs text-gray-600">
                                                                +{kos.facilities.length - 4}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* <div className="flex flex-wrap gap-2">
                                                            {kos.facilities.slice(0, 4).map((facility, index) => (
                                                                <div
                                                                    key={facility.id}
                                                                    className="gap-1 rounded-lg "
                                                                    title={facility.facility}>
                                                                    <span className="text-xs text-gray-600 truncate max-w-16">
                                                                        {facility.facility.length > 8
                                                                            ? facility.facility.substring(0, 8) + "..."
                                                                            : facility.facility
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {kos.facilities.length > 4 && (
                                                                <div className="flex items-center justify-center bg-gray-100  px-2 py-1 rounded-lg">
                                                                    <span className="text-xs text-gray-600">
                                                                        +{kos.facilities.length - 4}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div> */}
                                            </div>
                                        )}

                                        <div className="flex items-baseline gap-1">
                                            {kos.discountPercent && kos.discountPercent > 0 ? (
                                                <div>
                                                    {/* Discount Badge - hanya tampil jika discount > 0 */}
                                                    <div className="flex items-center gap-2">
                                                        {kos.discountPercent && Number(kos.discountPercent) > 0 && (
                                                            <div className="text-red-500 py-1 text-sm font-bold flex items-center gap-1">
                                                                <BsFillLightningChargeFill />
                                                                Diskon -{kos.discountPercent}%
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-gray-500 line-through">
                                                            Rp {formatPrice(kos.pricePerMonth)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-bold text-red-500">
                                                            Rp {formatPrice(kos.pricePerMonth - (kos.pricePerMonth * kos.discountPercent / 100))}
                                                        </span>
                                                        <span className="text-sm text-black">
                                                            (Bulan pertama)
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-x-1 flex items-center">
                                                    <span className="text-base font-bold text-green-600">
                                                        Rp {formatPrice(kos.pricePerMonth)}
                                                    </span>
                                                    <span className="text-sm text-black">
                                                        (Bulan pertama)
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {kos.books && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Sisa kamar tersedia
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KosPromoPage;