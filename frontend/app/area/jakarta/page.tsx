"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { IKos } from "../../types";
import { get } from "../../../lib/bridge";
import { BASE_IMAGE_KOS } from "../../../global";
import Select from "../../components/select";
import Navbar from "../../components/navbar_area/page";
import PriceDisplay from "../../components/price/PriceDisplay";
import PromoSection from "../../components/promo/PromoSection";

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

const JakartaKosPage = () => {
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

    // Fetch kos data untuk Jakarta
    const fetchJakartaKos = async (filters: {
        kalender?: string;
        gender?: string;
        price?: string;
        kampus?: string;
        search?: string;
    } = {}) => {
        setLoading(true);
        try {
            let url = "/kos?kota=Jakarta";

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
        fetchJakartaKos({
            kalender: selectedKalender,
            gender: selectedGender,
            price: selectedPrice,
            kampus: selectedKampus,
            search: searchQuery
        });
    }, [searchQuery]);

    // Handle perubahan filter kalender
    const handleKalenderChange = (value: string) => {
        setSelectedKalender(value);
        fetchJakartaKos({
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
        fetchJakartaKos({
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
        fetchJakartaKos({
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
        fetchJakartaKos({
            kalender: selectedKalender,
            gender: selectedGender,
            price: selectedPrice,
            kampus: value,
            search: searchQuery
        });
    };

    // Format harga dengan pemisah ribuan
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Tampilkan periode berdasarkan kalender
    const getPeriodText = (kalender: string) => {
        switch (kalender) {
            case "minggu": return "/minggu";
            case "bulan": return "/bulan";
            case "tahun": return "/tahun";
            default: return "/bulan";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data kos Jakarta...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            {/* Promo Section - Outside container for full width */}
            <PromoSection city="Jakarta" />

            <div className="min-h-screen bg-gray-50 py-8 mx-[150px]">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Kos di Jakarta
                        </h1>
                        <p className="text-gray-600">
                            Temukan kos terbaik di area Jakarta sesuai kebutuhan Anda
                        </p>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Filter Kalender */}
                            <div>
                                <Select
                                    id="kalender-filter"
                                    value={selectedKalender}
                                    onChange={handleKalenderChange}
                                    label="Periode Sewa"
                                    className="bg-white border-gray-300"
                                >
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
                                    className="bg-white border-gray-300"
                                >
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
                                    className="bg-white border-gray-300"
                                >
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
                                    className="bg-white border-gray-300"
                                >
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
                        <>
                            {/* Results Count */}
                            <div className="mb-4">
                                <p className="text-gray-600">
                                    Ditemukan {kosList.length} kos
                                    {searchQuery.trim() !== "" && ` untuk pencarian "${searchQuery}"`}
                                    {(selectedKalender !== "all" || selectedGender !== "all" || selectedPrice !== "all" || selectedKampus !== "all") && " dengan filter yang dipilih"}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {kosList.map((kos) => (
                                    <div key={kos.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                        {/* Gambar Kos */}
                                        <div className="relative h-48 rounded-t-lg overflow-hidden">
                                            {kos.images && kos.images.length > 0 ? (
                                                <img
                                                    src={`${BASE_IMAGE_KOS}/${kos.images[0].file}`}
                                                    alt={kos.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}

                                            {/* Badge Kalender */}
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                                    {kos.kalender}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Konten Card */}
                                        <div className="p-4">
                                            {/* Nama Kos */}
                                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                                {kos.name}
                                            </h3>

                                            {/* Alamat */}
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                📍 {kos.address}
                                            </p>

                                            {/* Harga */}
                                            <div className="mb-3">
                                                <PriceDisplay
                                                    originalPrice={kos.pricePerMonth}
                                                    discountPercent={kos.discountPercent}
                                                    discountEndDate={kos.discountEndDate}
                                                    className=""
                                                />
                                            </div>

                                            {/* Info Tambahan */}
                                            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                                                <span className="bg-gray-100 px-2 py-1 rounded">
                                                    {kos.gender === 'male' ? '👨 Putra' :
                                                        kos.gender === 'female' ? '👩 Putri' : '👥 Campur'}
                                                </span>
                                                <span className="bg-gray-100 px-2 py-1 rounded">
                                                    🏫 {kos.kampus}
                                                </span>
                                            </div>

                                            {/* Fasilitas */}
                                            {kos.facilities && kos.facilities.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {kos.facilities.slice(0, 3).map((facility, index) => (
                                                            <span
                                                                key={facility.id}
                                                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                                                            >
                                                                {facility.facility}
                                                            </span>
                                                        ))}
                                                        {kos.facilities.length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{kos.facilities.length - 3} lainnya
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Button Lihat Detail */}
                                            <button
                                                onClick={() => window.location.href = `/kos/${kos.id}`}
                                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                                            >
                                                Lihat Detail
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        !loading && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    Tidak ada kos ditemukan
                                </h3>
                                <p className="text-gray-500">
                                    {selectedKalender !== "all" || selectedGender !== "all" || selectedPrice !== "all" || selectedKampus !== "all" || searchQuery.trim() !== ""
                                        ? `Tidak ada kos ditemukan dengan kriteria pencarian yang dipilih`
                                        : "Belum ada kos yang tersedia di Jakarta"
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

export default JakartaKosPage;
