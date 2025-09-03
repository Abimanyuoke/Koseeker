"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IKos } from "@/app/types";
import { getCookies } from "@/lib/client-cookies";
import { BASE_API_URL, BASE_IMAGE_KOS } from "../../global";
import { get } from "@/lib/bridge";
import { AlertToko } from "../components/alert";
import Image from "next/image";
import { FiLoader } from "react-icons/fi";
import Select from "../components/select";
import { FaWifi, FaBed, FaCar, FaTv, FaSnowflake, FaShower, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdLocalLaundryService, MdSecurity } from "react-icons/md";
import { GiCook } from "react-icons/gi";

const KosPage = () => {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";
    const router = useRouter();

    // Daftar kota berdasarkan enum Kota di Prisma
    const kotaOptions = [
        "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Makassar",
        "Palembang", "Batam", "Malang", "Bogor", "Depok", "Tangerang",
        "Solo", "Makasar", "Yogyakarta", "Bekasi"
    ];

    /** ---------- STATE ---------- */
    const [kosData, setKosData] = useState<IKos[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKota, setSelectedKota] = useState<string>("Jakarta"); // Default kota
    const [imageIndexes, setImageIndexes] = useState<{ [key: number]: number }>({});

    /** ---------- FETCH KOS DATA ---------- */
    const getKosData = async (kota?: string) => {
        try {
            setLoading(true);
            const TOKEN = getCookies("token") || "";
            let url = `${BASE_API_URL}/kos?search=${search}`;

            const { data } = await get(url, TOKEN);
            if ((data as { status: boolean; data: IKos[] }).status) {
                let allKos = (data as { status: boolean; data: IKos[] }).data;

                // Filter kota
                if (kota && kota !== "all") {
                    allKos = allKos.filter(kos => kos.kota.toLowerCase() === kota.toLowerCase());
                }

                setKosData(allKos);
            }
        } catch (error) {
            console.error("Error getting kos data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getKosData(selectedKota);
    }, [search, selectedKota]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male': return 'Pria';
            case 'female': return 'Wanita';
            case 'all': return 'Campur';
            default: return gender;
        }
    };

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male': return 'bg-blue-100 text-blue-800';
            case 'female': return 'bg-pink-100 text-pink-800';
            case 'all': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFacilityIcon = (facility: string) => {
        const facilityLower = facility.toLowerCase();
        if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <FaWifi className="text-blue-500" />;
        if (facilityLower.includes('kasur') || facilityLower.includes('bed')) return <FaBed className="text-green-500" />;
        if (facilityLower.includes('parkir') || facilityLower.includes('parking')) return <FaCar className="text-gray-500" />;
        if (facilityLower.includes('tv') || facilityLower.includes('television')) return <FaTv className="text-purple-500" />;
        if (facilityLower.includes('ac') || facilityLower.includes('air conditioning')) return <FaSnowflake className="text-cyan-500" />;
        if (facilityLower.includes('kamar mandi') || facilityLower.includes('bathroom')) return <FaShower className="text-blue-400" />;
        if (facilityLower.includes('laundry') || facilityLower.includes('cuci')) return <MdLocalLaundryService className="text-indigo-500" />;
        if (facilityLower.includes('dapur') || facilityLower.includes('kitchen')) return <GiCook className="text-orange-500" />;
        if (facilityLower.includes('security') || facilityLower.includes('keamanan')) return <MdSecurity className="text-red-500" />;
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    };

    const handlePrevImage = (e: React.MouseEvent, kosId: number, totalImages: number) => {
        e.stopPropagation();
        setImageIndexes(prev => ({
            ...prev,
            [kosId]: prev[kosId] > 0 ? prev[kosId] - 1 : totalImages - 1
        }));
    };

    const handleNextImage = (e: React.MouseEvent, kosId: number, totalImages: number) => {
        e.stopPropagation();
        setImageIndexes(prev => ({
            ...prev,
            [kosId]: prev[kosId] < totalImages - 1 ? prev[kosId] + 1 : 0
        }));
    };

    /** ---------- RENDER ---------- */
    return (
        <div className="bg-white white duration-200 ">
            <div className="bg-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                    Rekomendasi Kos di{" "}
                                    <span className="text-green-600">
                                        {selectedKota === "all" ? "Semua Kota" : selectedKota}
                                    </span>
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Temukan kos terbaik dengan fasilitas lengkap
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-64">
                            <Select
                                id="kota-select"
                                value={selectedKota}
                                onChange={(value) => setSelectedKota(value)}
                                label="Pilih Kota"
                                className="text-gray-900"
                            >
                                <option value="all">Semua Kota</option>
                                {kotaOptions.map((kota) => (
                                    <option key={kota} value={kota}>
                                        {kota}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            </div>            {/* ----------------- KOS CARDS ----------------- */}
            <div className="container mx-auto py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[250px]">
                        <div className="flex flex-col items-center gap-4">
                            <FiLoader className="animate-spin text-green-600 text-4xl" />
                            <p className="text-gray-600 text-lg">Memuat data kos...</p>
                        </div>
                    </div>
                ) : kosData.length === 0 ? (
                    <div className="text-start py-4">
                        <AlertToko title="Informasi">
                            Tidak ada kos yang ditemukan di {selectedKota === "all" ? "semua kota" : selectedKota}
                        </AlertToko>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {kosData.map((kos) => {
                            const currentImageIndex = imageIndexes[kos.id] || 0;
                            const hasMultipleImages = kos.images && kos.images.length > 1;

                            return (
                                <div
                                    key={kos.id}
                                    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group transform hover:-translate-y-1"
                                    onClick={() => router.push(`/kos/${kos.id}`)}
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        {kos.images && kos.images.length > 0 ? (
                                            <div>
                                                <Image
                                                    src={`${BASE_IMAGE_KOS}/${kos.images[currentImageIndex].file}`}
                                                    alt={kos.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    unoptimized />

                                                {hasMultipleImages && (
                                                    <>
                                                        <button
                                                            onClick={(e) => handlePrevImage(e, kos.id, kos.images.length)}
                                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                                        >
                                                            <FaChevronLeft className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleNextImage(e, kos.id, kos.images.length)}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                                        >
                                                            <FaChevronRight className="text-sm" />
                                                        </button>
                                                    </>
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
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}

                                        {/* Badge Gender */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getGenderColor(kos.gender)}`}>
                                                {getGenderText(kos.gender)}
                                            </span>
                                        </div>

                                        {/* Discount Badge */}
                                        {kos.discountPercent && kos.discountPercent > 0 && (
                                            <div className="absolute top-3 right-3 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                -{kos.discountPercent}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Konten Kos */}
                                    <div className="p-5">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-lg text-gray-900  mb-1 line-clamp-1">
                                                {kos.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {kos.address}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {kos.kota}
                                            </p>
                                        </div>

                                        {kos.facilities && kos.facilities.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                    Fasilitas:
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {kos.facilities.slice(0, 4).map((facility, index) => (
                                                        <div
                                                            key={facility.id}
                                                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg"
                                                            title={facility.facility}
                                                        >
                                                            {getFacilityIcon(facility.facility)}
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
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-baseline gap-1">
                                            {kos.discountPercent && kos.discountPercent > 0 ? (
                                                <>
                                                    <span className="text-xl font-bold text-red-500">
                                                        Rp {formatPrice(kos.pricePerMonth - (kos.pricePerMonth * kos.discountPercent / 100))}
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        Rp {formatPrice(kos.pricePerMonth)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        /bulan
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xl font-bold text-green-600">
                                                        Rp {formatPrice(kos.pricePerMonth)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        /bulan
                                                    </span>
                                                </>
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

export default KosPage;
