/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { IKos } from "../../types";
import { get } from "../../../lib/bridge";
import { BASE_IMAGE_KOS } from "../../../global";
import Select from "../select";
import Image from "next/image";

// Enum untuk kalender sesuai dengan Prisma
const kalenderOptions = [
    { value: "all", label: "Semua Periode" },
    { value: "minggu", label: "Mingguan" },
    { value: "bulan", label: "Bulanan" },
    { value: "tahun", label: "Tahunan" }
];

// Options untuk filter gender
const genderOptions = [
    { value: "all", label: "Semua Gender" },
    { value: "male", label: "Putra" },
    { value: "female", label: "Putri" },
    { value: "mixed", label: "Campur" }
];

// Options untuk filter harga
const priceOptions = [
    { value: "all", label: "Semua Harga" },
    { value: "0-500000", label: "Di bawah Rp 500.000" },
    { value: "500000-1000000", label: "Rp 500.000 - Rp 1.000.000" },
    { value: "1000000-2000000", label: "Rp 1.000.000 - Rp 2.000.000" },
    { value: "2000000-3000000", label: "Rp 2.000.000 - Rp 3.000.000" },
    { value: "3000000-999999999", label: "Di atas Rp 3.000.000" }
];

interface AreaKosPageProps {
    kota: string;
    title?: string;
    description?: string;
}

const AreaKosPage = ({ kota, title, description }: AreaKosPageProps) => {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [kosList, setKosList] = useState<IKos[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedKalender, setSelectedKalender] = useState<string>("all");
    const [selectedGender, setSelectedGender] = useState<string>("all");
    const [selectedPrice, setSelectedPrice] = useState<string>("all");
    const [selectedKampus, setSelectedKampus] = useState<string>("all");
    const [kampusOptions, setKampusOptions] = useState<{ value: string; label: string }[]>([
        { value: "all", label: "Semua Kampus" }
    ]);

    // Fetch kos data berdasarkan kota dengan semua filter
    const fetchKosByArea = async (filters: {
        kalender?: string;
        gender?: string;
        price?: string;
        kampus?: string;
        search?: string;
    } = {}) => {
        setLoading(true);
        try {
            let url = `/kos?kota=${encodeURIComponent(kota)}`;

            // Tambahkan filter search jika ada
            if (filters.search && filters.search.trim() !== "") {
                url += `&search=${encodeURIComponent(filters.search)}`;
            }

            // Tambahkan filter kalender jika dipilih
            if (filters.kalender && filters.kalender !== "all") {
                url += `&kalender=${filters.kalender}`;
            }

            // Tambahkan filter gender jika dipilih
            if (filters.gender && filters.gender !== "all") {
                url += `&gender=${filters.gender}`;
            }

            // Tambahkan filter kampus jika dipilih
            if (filters.kampus && filters.kampus !== "all") {
                url += `&kampus=${encodeURIComponent(filters.kampus)}`;
            }

            const response = await get(url, "");

            if (response.status) {
                let filteredData = response.data.data || [];

                // Filter berdasarkan harga di frontend
                if (filters.price && filters.price !== "all") {
                    const [minPrice, maxPrice] = filters.price.split("-").map(Number);
                    filteredData = filteredData.filter((kos: IKos) =>
                        kos.pricePerMonth >= minPrice && kos.pricePerMonth <= maxPrice
                    );
                }

                // Filter berdasarkan search query di frontend jika backend tidak mendukung
                if (filters.search && filters.search.trim() !== "") {
                    const searchLower = filters.search.toLowerCase();
                    filteredData = filteredData.filter((kos: IKos) =>
                        kos.name.toLowerCase().includes(searchLower) ||
                        kos.address.toLowerCase().includes(searchLower) ||
                        (kos.kampus && kos.kampus.toLowerCase().includes(searchLower))
                    );
                }

                setKosList(filteredData);

                // Update kampus options based on available data
                const uniqueKampus = Array.from(new Set(filteredData.map((kos: IKos) => kos.kampus)))
                    .filter((kampus): kampus is string => typeof kampus === 'string' && kampus.trim() !== "")
                    .sort();

                setKampusOptions([
                    { value: "all", label: "Semua Kampus" },
                    ...uniqueKampus.map((kampus: string) => ({ value: kampus, label: kampus }))
                ]);
            } else {
                setError(response.message || "Gagal mengambil data kos");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat mengambil data");
            console.error("Error fetching kos:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load data pertama kali dan ketika search query berubah
    useEffect(() => {
        fetchKosByArea({
            kalender: selectedKalender,
            gender: selectedGender,
            price: selectedPrice,
            kampus: selectedKampus,
            search: searchQuery
        });
    }, [kota, searchQuery]);

    // Handle perubahan filter kalender
    const handleKalenderChange = (value: string) => {
        setSelectedKalender(value);
        fetchKosByArea({
            kalender: value,
            gender: selectedGender,
            price: selectedPrice,
            kampus: selectedKampus,
            search: searchQuery
        });
    };

    // Handle perubahan filter gender
    const handleGenderChange = (value: string) => {
        setSelectedGender(value);
        fetchKosByArea({
            kalender: selectedKalender,
            gender: value,
            price: selectedPrice,
            kampus: selectedKampus,
            search: searchQuery
        });
    };

    // Handle perubahan filter price
    const handlePriceChange = (value: string) => {
        setSelectedPrice(value);
        fetchKosByArea({
            kalender: selectedKalender,
            gender: selectedGender,
            price: value,
            kampus: selectedKampus,
            search: searchQuery
        });
    };

    // Handle perubahan filter kampus
    const handleKampusChange = (value: string) => {
        setSelectedKampus(value);
        fetchKosByArea({
            kalender: selectedKalender,
            gender: selectedGender,
            price: selectedPrice,
            kampus: value,
            search: searchQuery
        });
    };

    // Format harga dengan pemisah ribuan (tanpa Rp karena sudah ada di display)
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(price);
    };

    // Tampilkan periode berdasarkan kalender
    // const getPeriodText = (kalender: string) => {
    //     switch (kalender) {
    //         case "minggu": return "/minggu";
    //         case "bulan": return "/bulan";
    //         case "tahun": return "/tahun";
    //         default: return "/bulan";
    //     }
    // };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data kos {kota}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {title || `Kos di ${kota}`}
                        </h1>
                        <p className="text-gray-600">
                            {description || `Temukan kos terbaik di area ${kota} sesuai kebutuhan Anda`}
                        </p>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Filter Kalender */}
                            <div>
                                <Select
                                    id="kalender-filter"
                                    value={selectedKalender}
                                    onChange={handleKalenderChange}
                                    label="Periode Sewa"
                                    className="bg-white border-gray-300">
                                    {kalenderOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Filter Gender */}
                            <div>
                                <Select
                                    id="gender-filter"
                                    value={selectedGender}
                                    onChange={handleGenderChange}
                                    label="Gender"
                                    className="bg-white border-gray-300">
                                    {genderOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Filter Harga */}
                            <div>
                                <Select
                                    id="price-filter"
                                    value={selectedPrice}
                                    onChange={handlePriceChange}
                                    label="Rentang Harga"
                                    className="bg-white border-gray-300">
                                    {priceOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Filter Kampus */}
                            <div>
                                <Select
                                    id="kampus-filter"
                                    value={selectedKampus}
                                    onChange={handleKampusChange}
                                    label="Kampus"
                                    className="bg-white border-gray-300">
                                    {kampusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Kos Cards Grid */}
                    {kosList.length > 0 ? (
                        <div>
                            {/* Results Count */}
                            {/* <div className="mb-4">
                                <p className="text-gray-600">
                                    Ditemukan {kosList.length} kos
                                    {searchQuery.trim() !== "" && ` untuk pencarian "${searchQuery}"`}
                                    {(selectedKalender !== "all" || selectedGender !== "all" || selectedPrice !== "all" || selectedKampus !== "all") && " dengan filter yang dipilih"}
                                </p>
                            </div> */}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {kosList.map((kos) => {
                                    // Helper functions untuk gender
                                    const getGenderText = (gender: string) => {
                                        switch (gender) {
                                            case 'male': return 'Pria';
                                            case 'female': return 'Wanita';
                                            case 'mixed': return 'Campuran';
                                            default: return gender;
                                        }
                                    };

                                    const getGenderColor = (_gender: string) => {
                                        return 'text-[#404040]'
                                    };

                                    return (
                                        <div key={kos.id}>
                                            <div
                                                className="rounded-xl h-[450px] w-full mx-auto transition-all duration-300"
                                                onClick={() => window.location.href = `/kos/${kos.id}`}>
                                                {/* Gambar Kos */}
                                                <div className="relative h-[200px] overflow-hidden rounded-xl">
                                                    {kos.images && kos.images.length > 0 ? (
                                                        <img
                                                            src={`${BASE_IMAGE_KOS}/${kos.images[0].file}`}
                                                            alt={kos.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center rounded-xl">
                                                            <span className="text-gray-400">No Image</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Konten Kos */}
                                                <div className="py-5">
                                                    {/* Badge Gender */}
                                                    <span className={`px-2 py-1 rounded text-[14px] font-bold border border-slate-300 ${getGenderColor(kos.gender)}`}>
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

                                                    {/* Fasilitas */}
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
                                                        </div>
                                                    )}

                                                    {/* Harga */}
                                                    <div className="flex items-baseline gap-1">
                                                        {kos.discountPercent && kos.discountPercent > 0 ? (
                                                            <div>
                                                                {/* Discount Badge */}
                                                                <div className="flex items-center gap-2">
                                                                    {kos.discountPercent && Number(kos.discountPercent) > 0 && (
                                                                        <div className="text-red-500 py-1 text-sm font-bold flex items-center gap-1">
                                                                            <span>⚡</span>
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

                                                    {/* Tombol Ajukan Sewa */}
                                                    {/* <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = `/kos/${kos.id}`;
                                                        }}
                                                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm shadow-md hover:shadow-lg">
                                                        Ajukan Sewa
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        !loading && (
                            <div className="text-center py-12">
                                <Image src="/images/logo_sad.svg" className="mx-auto" alt="Tidak ada kos ditemukan" width={200} height={200} />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    Tidak ada kos ditemukan
                                </h3>
                                <p className="text-gray-500">
                                    {selectedKalender !== "all" || selectedGender !== "all" || selectedPrice !== "all" || selectedKampus !== "all" || searchQuery.trim() !== ""
                                        ? `Tidak ada kos ditemukan dengan kriteria pencarian yang dipilih`
                                        : `Belum ada kos yang tersedia di ${kota}`
                                    }
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AreaKosPage;
