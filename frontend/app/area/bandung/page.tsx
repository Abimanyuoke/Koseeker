"use client";

import { useState, useEffect } from "react";
import { IKos } from "../../types";
import { get } from "../../../lib/bridge";
import { BASE_IMAGE_KOS } from "../../../global";
import Select from "../../components/select";

// Enum untuk kalender sesuai dengan Prisma
const kalenderOptions = [
    { value: "all", label: "Semua Periode" },
    { value: "minggu", label: "Mingguan" },
    { value: "bulan", label: "Bulanan" },
    { value: "tahun", label: "Tahunan" }
];

const BandungKosPage = () => {
    const [kosList, setKosList] = useState<IKos[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedKalender, setSelectedKalender] = useState<string>("all");

    // Fetch kos data untuk Bandung
    const fetchBandungKos = async (kalender: string = "all") => {
        setLoading(true);
        try {
            let url = "/kos?kota=Bandung";

            // Tambahkan filter kalender jika dipilih
            if (kalender !== "all") {
                url += `&kalender=${kalender}`;
            }

            const response = await get(url, "");

            if (response.status) {
                setKosList(response.data.data || []);
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

    // Load data pertama kali
    useEffect(() => {
        fetchBandungKos();
    }, []);

    // Handle perubahan filter kalender
    const handleKalenderChange = (value: string) => {
        setSelectedKalender(value);
        fetchBandungKos(value);
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
                    <p className="text-gray-600">Memuat data kos Bandung...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Kos di Bandung
                    </h1>
                    <p className="text-gray-600">
                        Temukan kos terbaik di area Bandung sesuai kebutuhan Anda
                    </p>
                </div>

                {/* Filter Kalender */}
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <div className="max-w-md">
                        <Select
                            id="kalender-filter"
                            value={selectedKalender}
                            onChange={handleKalenderChange}
                            label="Filter Periode Sewa"
                            className="bg-white border-gray-300"
                        >
                            {kalenderOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
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
                                        <span className="text-xl font-bold text-blue-600">
                                            {formatPrice(kos.pricePerMonth)}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            {getPeriodText(kos.kalender)}
                                        </span>
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
                ) : (
                    !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🏠</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Tidak ada kos ditemukan
                            </h3>
                            <p className="text-gray-500">
                                {selectedKalender !== "all"
                                    ? `Tidak ada kos dengan periode ${selectedKalender} di Jakarta`
                                    : "Belum ada kos yang tersedia di Jakarta"
                                }
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default BandungKosPage;
