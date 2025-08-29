"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IKos } from "@/app/types";
import { getCookies } from "@/lib/client-cookies";
import { BASE_API_URL, BASE_IMAGE_KOS } from "../../../global";
import { get } from "@/lib/bridge";
import { AlertToko } from "../../components/alert";
import Image from "next/image";
import Navbar_Products from "../../components/navbar_main/page";
import { FiLoader, FiArrowLeft, FiHeart, FiShare2 } from "react-icons/fi";
import { FaWifi, FaBed, FaCar, FaTv, FaSnowflake, FaShower, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { MdLocalLaundryService, MdSecurity } from "react-icons/md";
import { GiCook } from "react-icons/gi";
import { ButtonPrimary } from "../../components/button";
import LikeButton from "@/app/components/likeButton";
import Cookies from "js-cookie";

const KosDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const id = params.id as string;

    /** ---------- STATE ---------- */
    const [kosDetail, setKosDetail] = useState<IKos | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    /** ---------- FETCH KOS DETAIL ---------- */
    const getKosDetail = async () => {
        try {
            setLoading(true);
            const TOKEN = getCookies("token") || "";
            const url = `${BASE_API_URL}/kos/${id}`;

            const { data } = await get(url, TOKEN);
            if ((data as { status: boolean; data: IKos }).status) {
                setKosDetail((data as { status: boolean; data: IKos }).data);
            }
        } catch (error) {
            console.error("Error getting kos detail:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getKosDetail();
        }
    }, [id]);

    /** ---------- HELPER FUNCTIONS ---------- */
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };


    // Untuk Like
    useEffect(() => {
        const u = {
            id: Cookies.get("id"),
            name: Cookies.get("name"),
            role: Cookies.get("role"),
            profile_picture: Cookies.get("profile_picture"),
        };
        const t = Cookies.get("token");

        if (u.id && t) {
            setUser(u);
            setToken(t);
        }
    }, []);






    const getGenderText = (gender: string) => {
        switch (gender) {
            case 'male': return 'Khusus Pria';
            case 'female': return 'Khusus Wanita';
            case 'all': return 'Pria & Wanita';
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

    const handleBooking = () => {
        // Redirect to booking page or open booking modal
        router.push(`/book/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 dark:text-white duration-200 min-h-screen">
                <div className="sticky top-0 z-50 shadow-md">
                    <Navbar_Products />
                </div>
                <div className="flex items-center justify-center min-h-[400px] mt-16">
                    <div className="flex flex-col items-center gap-4">
                        <FiLoader className="animate-spin text-green-600 text-4xl" />
                        <p className="text-gray-600 dark:text-gray-300 text-lg">Memuat detail kos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!kosDetail) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 dark:text-white duration-200 min-h-screen">
                <div className="sticky top-0 z-50 shadow-md">
                    <Navbar_Products />
                </div>
                <div className="container mx-auto px-4 py-8 mt-16">
                    <AlertToko title="Error">
                        Kos tidak ditemukan
                    </AlertToko>
                </div>
            </div>
        );
    }

    /** ---------- RENDER ---------- */
    return (
        <div className="bg-gray-50 dark:bg-gray-900 duration-200 min-h-screen">
            <div className="sticky top-0 z-50 shadow-md">
                <Navbar_Products />
            </div>

            <div className="container mx-auto px-4 py-8 mt-16">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 mb-6">
                    <FiArrowLeft className="text-xl" />
                    <span>Kembali ke Daftar Kos</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="relative h-96 rounded-xl overflow-hidden">
                            {kosDetail.images && kosDetail.images.length > 0 ? (
                                <Image
                                    src={`${BASE_IMAGE_KOS}/${kosDetail.images[currentImageIndex]?.file || kosDetail.images[0].file}`}
                                    alt={kosDetail.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                        </div>



                        {/* Thumbnail Images */}
                        {kosDetail.images && kosDetail.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {kosDetail.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className={`relative h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${currentImageIndex === index ? 'border-green-600' : 'border-transparent'
                                            }`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <Image
                                            src={`${BASE_IMAGE_KOS}/${image.file}`}
                                            alt={`${kosDetail.name} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side - Details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {kosDetail.name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                                        <FaMapMarkerAlt className="text-green-600" />
                                        <span>{kosDetail.address}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {kosDetail.kota}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {user && token ? (
                                        <LikeButton
                                            kosId={kosDetail.id}
                                            userId={user.id}
                                            token={token.toString()}
                                        />
                                    ) : (
                                        <p className="text-gray-500">Login dulu untuk like ❤️</p>
                                    )}

                                    <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                                        <FiShare2 className="text-xl text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Gender Badge */}
                            <div className="mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGenderColor(kosDetail.gender)}`}>
                                    {getGenderText(kosDetail.gender)}
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-3xl font-bold text-green-600">
                                    Rp {formatPrice(kosDetail.pricePerMonth)}
                                </span>
                                <span className="text-lg text-gray-500 dark:text-gray-400">
                                    /bulan
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Harga sudah termasuk listrik dan air
                            </p>
                        </div>

                        {/* Facilities */}
                        {kosDetail.facilities && kosDetail.facilities.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Fasilitas
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {kosDetail.facilities.map((facility) => (
                                        <div
                                            key={facility.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            {getFacilityIcon(facility.facility)}
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {facility.facility}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Booking Button */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <ButtonPrimary
                                type="button"
                                onClick={handleBooking}
                                className="w-full py-4 text-lg font-semibold"
                            >
                                Pesan Sekarang
                            </ButtonPrimary>
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
                                Hubungi pemilik untuk info lebih lanjut
                            </p>
                        </div>

                        {/* Owner Info */}
                        {kosDetail.owner && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Informasi Pemilik
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FaUser className="text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {kosDetail.owner.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaPhone className="text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {kosDetail.owner.phone || 'Tidak tersedia'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaEnvelope className="text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {kosDetail.owner.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                {kosDetail.reviews && kosDetail.reviews.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Ulasan ({kosDetail.reviews.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kosDetail.reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                            <FaUser className="text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {review.user?.name || 'Anonymous'}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KosDetailPage;


