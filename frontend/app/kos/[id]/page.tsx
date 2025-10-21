"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IKos } from "@/app/types";
import { getCookies } from "@/lib/client-cookies";
import { BASE_API_URL, BASE_IMAGE_KOS } from "../../../global";
import { get } from "@/lib/bridge";
import { AlertToko } from "../../components/alert";
import { FiLoader, FiShare2, FiCheckCircle } from "react-icons/fi";
import { FaWifi, FaBed, FaCar, FaTv, FaSnowflake, FaShower, FaMapMarkerAlt, FaRulerCombined, FaToilet, FaDoorOpen, FaWhatsapp, FaRegHeart, FaMotorcycle } from "react-icons/fa";
import { MdFamilyRestroom, MdLocalLaundryService, MdOutlineCleaningServices, MdOutlinePets, MdSecurity } from "react-icons/md";
import { GiCook, GiNightSleep } from "react-icons/gi";
import { IoCalendarOutline, IoCloudyNight, IoHome, IoTimeOutline } from "react-icons/io5";
import { ButtonPrimary2 } from "../../components/button";
import LikeButton from "@/app/components/likeButton";
import ReviewContainer from "@/app/components/review/ReviewContainer";
import Cookies from "js-cookie";
import Image from "next/image";
import { IoIosArrowForward, IoIosCheckmarkCircle } from "react-icons/io";
import { LuDot, LuMapPin } from "react-icons/lu";
import { PiCigaretteSlashFill, PiDoorOpen } from "react-icons/pi";
import { AiFillThunderbolt, AiOutlineFileProtect } from "react-icons/ai";
import { BsFillLightningChargeFill, BsLightningFill, BsPersonFillCheck } from "react-icons/bs";
import { FaChildren } from "react-icons/fa6";
import { HiOutlineClipboardDocumentCheck, HiOutlineClipboardDocumentList, HiOutlineDocumentText } from "react-icons/hi2";

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
    const [showAllRules, setShowAllRules] = useState(false);

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
            case 'male': return 'border text-gray-700';
            case 'female': return 'border text-gray-700';
            case 'all': return 'border text-gray-700';
            default: return 'border text-gray-700';
        }
    };

    const getFacilityIcon = (facility: string) => {
        const facilityLower = facility.toLowerCase();
        if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <FaWifi className="text-gray-500" />;
        if (facilityLower.includes('kasur') || facilityLower.includes('bed')) return <FaBed className="text-gray-500" />;
        if (facilityLower.includes('motor') || facilityLower.includes('motorcycle')) return <FaMotorcycle className="text-gray-500" />;
        if (facilityLower.includes('mobil') || facilityLower.includes('car')) return <FaCar className="text-gray-500" />;
        if (facilityLower.includes('parkir') || facilityLower.includes('parking') || facilityLower.includes('garase')) return <FaCar className="text-gray-500" />;
        if (facilityLower.includes('tv') || facilityLower.includes('television')) return <FaTv className="text-gray-500" />;
        if (facilityLower.includes('ac') || facilityLower.includes('air conditioning')) return <FaSnowflake className="text-gray-500" />;
        if (facilityLower.includes('kamar mandi') || facilityLower.includes('bathroom')) return <FaShower className="text-gray-500" />;
        if (facilityLower.includes('shower')) return <FaShower className="text-gray-500" />;
        if (facilityLower.includes('toilet')) return <FaToilet className="text-gray-500" />;
        if (facilityLower.includes('laundry') || facilityLower.includes('cuci')) return <MdLocalLaundryService className="text-gray-500" />;
        if (facilityLower.includes('dapur') || facilityLower.includes('kitchen')) return <GiCook className="text-gray-500" />;
        if (facilityLower.includes('security') || facilityLower.includes('keamanan') || facilityLower.includes('cctv')) return <MdSecurity className="text-gray-500" />;
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    };


    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareTitle = kosDetail?.name || 'Kos Terbaik';
        const shareText = `${kosDetail?.name}\n\nLokasi: ${kosDetail?.address}, ${kosDetail?.kota}\nHarga: Rp ${formatPrice(kosDetail?.pricePerMonth || 0)}/bulan\n\nLihat detailnya di:`;

        // Check if Web Share API is supported
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                alert('Link berhasil disalin ke clipboard!');
            } catch (error) {
                console.error('Failed to copy:', error);
                alert('Gagal menyalin link. Silakan salin manual dari address bar.');
            }
        }
    };

    const handleWhatsAppChat = () => {
        const phoneNumber = kosDetail?.owner?.phone || '';

        if (!phoneNumber || phoneNumber.trim() === '' || phoneNumber === 'Tidak tersedia') {
            alert('Nomor WhatsApp pemilik tidak tersedia. Silakan hubungi melalui email atau ajukan sewa langsung.');
            return;
        }

        // Remove all non-digit characters and add country code if not present
        let cleanPhone = phoneNumber.replace(/\D/g, '');

        // Add Indonesian country code if not present
        if (!cleanPhone.startsWith('62')) {
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '62' + cleanPhone.substring(1);
            } else {
                cleanPhone = '62' + cleanPhone;
            }
        }

        const message = `Halo Kak, saya tertarik dengan kos *${kosDetail?.name}*\n\nLokasi: ${kosDetail?.address}\nHarga: Rp ${formatPrice(kosDetail?.pricePerMonth || 0)}/bulan\n\nBisakah saya mendapatkan informasi lebih lanjut?`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="bg-gray-50 text-black duration-200 min-h-screen">
                <div className="flex items-center justify-center min-h-[400px] mt-16">
                    <div className="flex flex-col items-center gap-4">
                        <FiLoader className="animate-spin text-green-600 text-4xl" />
                        <p className="text-gray-600 text-lg">Memuat detail kos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!kosDetail) {
        return (
            <div className="bg-gray-50 text-black duration-200 min-h-screen">
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
        <div className="bg-gray-50 text-black duration-200 min-h-screen font-lato">
            <div className="max-w-6xl mx-auto px-4 py-4">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-1 mb-6">
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors">
                        <span className="font-normal text-sm">Beranda</span>
                        <IoIosArrowForward className="text-sm text-gray-400" />
                    </button>
                    <button
                        onClick={() => router.push(`/area/${kosDetail?.kota?.toLowerCase().replace(/\s+/g, '-')}`)}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors">
                        <span className="font-normal text-sm">Kos {kosDetail?.kota}</span>
                        <IoIosArrowForward className="text-sm text-gray-400" />
                    </button>

                    <button
                        onClick={() => router.push(`/kampus/${kosDetail?.kampus?.toLowerCase().replace(/\s+/g, '-')}`)}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors">
                        <span className="font-normal text-sm">Kos {kosDetail?.kampus}</span>
                        <IoIosArrowForward className="text-sm text-gray-400" />
                    </button>

                    <span className="font-medium text-sm text-gray-900">
                        {kosDetail?.name}
                    </span>
                </div>

                {/* Image Gallery - Full Width */}
                <div className="w-full max-w-6xl mx-auto mb-8">
                    <div className="bg-white rounded-2xl overflow-hidden relative">
                        {kosDetail.images && kosDetail.images.length > 0 ? (
                            <div className="w-full">
                                {/* Single Image */}
                                {kosDetail.images.length === 1 && (
                                    <div className="relative w-full h-[500px] rounded-xl overflow-hidden cursor-pointer group m-2">
                                        <Image
                                            src={`${BASE_IMAGE_KOS}/${kosDetail.images[0].file}`}
                                            alt={kosDetail.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>
                                )}

                                {/* Two Images */}
                                {kosDetail.images.length === 2 && (
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        {kosDetail.images.map((image, index) => (
                                            <div
                                                key={image.id}
                                                className="relative w-full h-[500px] rounded-xl overflow-hidden cursor-pointer group"
                                                onClick={() => setCurrentImageIndex(index)}>
                                                <Image
                                                    src={`${BASE_IMAGE_KOS}/${image.file}`}
                                                    alt={`${kosDetail.name} ${index + 1}`}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Three Images */}
                                {kosDetail.images.length === 3 && (
                                    <div className="grid grid-cols-2 grid-rows-2 gap-2">
                                        {/* First large image takes full left side */}
                                        <div
                                            className="relative w-full row-span-2 h-[500px] rounded-xl overflow-hidden cursor-pointer group"
                                            onClick={() => setCurrentImageIndex(0)}>
                                            <Image
                                                src={`${BASE_IMAGE_KOS}/${kosDetail.images[0].file}`}
                                                alt={`${kosDetail.name} 1`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                unoptimized />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        </div>
                                        {/* Two smaller images on right */}
                                        {kosDetail.images.slice(1, 3).map((image, index) => (
                                            <div
                                                key={image.id}
                                                className="relative w-full h-[245px] rounded-xl overflow-hidden cursor-pointer group"
                                                onClick={() => setCurrentImageIndex(index + 1)}>
                                                <Image
                                                    src={`${BASE_IMAGE_KOS}/${image.file}`}
                                                    alt={`${kosDetail.name} ${index + 2}`}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Four or More Images */}
                                {kosDetail.images.length >= 4 && (
                                    <div className="grid grid-cols-4 grid-rows-2 gap-2">
                                        {/* First large image takes 2x2 grid */}
                                        <div
                                            className="relative w-full col-span-2 row-span-2 h-[500px] rounded-xl overflow-hidden cursor-pointer group"
                                            onClick={() => setCurrentImageIndex(0)}>
                                            <Image
                                                src={`${BASE_IMAGE_KOS}/${kosDetail.images[0].file}`}
                                                alt={`${kosDetail.name} 1`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                unoptimized />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        </div>
                                        {/* Remaining images fill the right side */}
                                        {kosDetail.images.slice(1, 5).map((image, index) => (
                                            <div
                                                key={image.id}
                                                className="relative w-full h-[245px] rounded-xl overflow-hidden cursor-pointer group"
                                                onClick={() => setCurrentImageIndex(index + 1)} >
                                                <Image
                                                    src={`${BASE_IMAGE_KOS}/${image.file}`}
                                                    alt={`${kosDetail.name} ${index + 2}`}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                                {/* Show more indicator on last visible image */}
                                                {index === 3 && kosDetail.images.length > 5 && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                        <div className="text-center">
                                                            <span className="text-white text-3xl font-bold block">
                                                                +{kosDetail.images.length - 5}
                                                            </span>
                                                            <span className="text-white text-sm">Foto Lainnya</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Middle Section - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Info */}
                        <div className="bg-white rounded-2xl">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex justify-start gap-2 mb-2">
                                        <img src="/images/logo1.svg" alt="logo" className="w-32 -my-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-[#383746] mb-3">
                                        {kosDetail.name}
                                    </h1>
                                    <div className="flex items-center gap-1 my-8">
                                        {/* Gender Badge */}
                                        <div>
                                            <span className={`px-4 py-2 rounded-md text-sm font-semibold shadow-lg backdrop-blur-sm bg-opacity-95 ${getGenderColor(kosDetail.gender)}`}>
                                                {getGenderText(kosDetail.gender)}
                                            </span>
                                        </div>
                                        <LuDot className="text-gray-800 text-base" />
                                        <div className="flex items-start gap-2">
                                            <LuMapPin className="text-gray-700 mt-1 flex-shrink-0 text-xl" />
                                            <span className="text-base text-gray-800">{kosDetail.kota}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center ">
                                        <div className="flex items-center gap-2">
                                            <PiDoorOpen className="flex-shrink-0 text-lg text-gray-700" />
                                            <span className="text-[#383746] text-base font-normal">Banyak pilihan kamar untukmu</span>
                                        </div>

                                        {/* Like and Share buttons overlay */}
                                        <div className="flex gap-4 z-10">
                                            {user && token ? (
                                                <LikeButton
                                                    kosId={kosDetail.id}
                                                    userId={user.id}
                                                    token={token.toString()} />
                                            ) : (
                                                <button className="p-3 rounded-md hover:text-gray-500 hover:border-gray-500 transition-all hover:scale-110">
                                                    <FaRegHeart />
                                                </button>
                                            )}
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center gap-2 px-6 rounded-md border border-gray-400 hover:text-gray-500 hover:border-gray-500 transition-all cursor-pointer"
                                                title="Bagikan kos ini">
                                                <FiShare2 className="text-sm text-gray-700" />
                                                <span className="hover:text-[#717171] text-sm font-bold">Bagikan</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spesifikasi Kamar */}
                        <div className="bg-white  py-6">
                            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                Spesifikasi Kamar
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex items-center gap-3 ">
                                    <FaRulerCombined className="text-gray-500 text-2xl" />
                                    <div>
                                        <p className="text-xs text-gray-600">Luas Kamar</p>
                                        <p className="font-semibold text-gray-900">3 x 4 meter</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ">
                                    <AiFillThunderbolt className="text-gray-500 text-2xl" />
                                    <div>
                                        <p className="text-xs text-gray-600">Listrik</p>
                                        <p className="font-semibold text-gray-900">Termasuk</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ">
                                    <FaBed className="text-gray-500 text-2xl" />
                                    <div>
                                        <p className="text-xs text-gray-600">Kasur</p>
                                        <p className="font-semibold text-gray-900">Single Bed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ">
                                    <FaDoorOpen className="text-gray-500 text-2xl" />
                                    <div>
                                        <p className="text-xs text-gray-600">Pintu</p>
                                        <p className="font-semibold text-gray-900">Kunci Pribadi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fasilitas Kamar */}
                        {kosDetail.facilities && kosDetail.facilities.length > 0 && (() => {
                            // Filter fasilitas kamar (exclude yang mengandung kata "kamar mandi", "bathroom", "shower", "toilet", "air")
                            const roomFacilities = kosDetail.facilities.filter(f => {
                                const facilityLower = f.facility.toLowerCase();
                                return !facilityLower.includes('kamar mandi') &&
                                    !facilityLower.includes('k.mandi') &&
                                    !facilityLower.includes('bathroom') &&
                                    !facilityLower.includes('shower') &&
                                    !facilityLower.includes('toilet') &&
                                    !facilityLower.includes('air panas') &&
                                    !facilityLower.includes('air dingin');
                            });

                            return roomFacilities.length > 0 && (
                                <div className="bg-white rounded-2xl">
                                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        Fasilitas Kamar
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {roomFacilities.map((facility) => (
                                            <div
                                                key={facility.id}
                                                className="flex items-center gap-3 py-4">
                                                {getFacilityIcon(facility.facility)}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {facility.facility}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Fasilitas Kamar Mandi */}
                        {kosDetail.facilities && kosDetail.facilities.length > 0 && (() => {
                            // Filter fasilitas kamar mandi
                            const bathroomFacilities = kosDetail.facilities.filter(f => {
                                const facilityLower = f.facility.toLowerCase();
                                return facilityLower.includes('kamar mandi') ||
                                    facilityLower.includes('k.mandi') ||
                                    facilityLower.includes('bathroom') ||
                                    facilityLower.includes('shower') ||
                                    facilityLower.includes('toilet') ||
                                    facilityLower.includes('air panas') ||
                                    facilityLower.includes('air dingin');
                            });

                            return bathroomFacilities.length > 0 && (
                                <div className="bg-white rounded-2xl">
                                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        Fasilitas Kamar Mandi
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {bathroomFacilities.map((facility) => (
                                            <div
                                                key={facility.id}
                                                className="flex items-center gap-3 py-4">
                                                {getFacilityIcon(facility.facility)}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {facility.facility}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Fasilitas Umum */}
                        {kosDetail.facilities && kosDetail.facilities.length > 0 && (() => {
                            // Filter fasilitas umum (wifi, laundry, dapur, tv, ruang bersama, dll)
                            const publicFacilities = kosDetail.facilities.filter(f => {
                                const facilityLower = f.facility.toLowerCase();
                                return (facilityLower.includes('wifi') ||
                                    facilityLower.includes('internet') ||
                                    facilityLower.includes('laundry') ||
                                    facilityLower.includes('cuci') ||
                                    facilityLower.includes('dapur') ||
                                    facilityLower.includes('kitchen') ||
                                    facilityLower.includes('tv') ||
                                    facilityLower.includes('ruang') ||
                                    facilityLower.includes('taman') ||
                                    facilityLower.includes('jemuran') ||
                                    facilityLower.includes('keamanan') ||
                                    facilityLower.includes('security') ||
                                    facilityLower.includes('cctv')) &&
                                    !facilityLower.includes('parkir') &&
                                    !facilityLower.includes('parking') &&
                                    !facilityLower.includes('motor') &&
                                    !facilityLower.includes('mobil');
                            });

                            return publicFacilities.length > 0 && (
                                <div className="bg-white py-6">
                                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        Fasilitas Umum
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {publicFacilities.map((facility) => (
                                            <div
                                                key={facility.id}
                                                className="flex items-center gap-3 py-4">
                                                {getFacilityIcon(facility.facility)}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {facility.facility}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Fasilitas Parkir */}
                        {kosDetail.facilities && kosDetail.facilities.length > 0 && (() => {
                            // Filter fasilitas parkir
                            const parkingFacilities = kosDetail.facilities.filter(f => {
                                const facilityLower = f.facility.toLowerCase();
                                return facilityLower.includes('parkir') ||
                                    facilityLower.includes('parking') ||
                                    facilityLower.includes('motor') ||
                                    facilityLower.includes('mobil') ||
                                    facilityLower.includes('garase') ||
                                    facilityLower.includes('garage');
                            });

                            return parkingFacilities.length > 0 && (
                                <div className="bg-white py-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        Fasilitas Parkir
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {parkingFacilities.map((facility) => (
                                            <div
                                                key={facility.id}
                                                className="flex items-center gap-3 py-4">
                                                {getFacilityIcon(facility.facility)}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {facility.facility}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Peraturan di Kos */}
                        <div className="bg-white rounded-2xl">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">
                                Peraturan di kos ini
                            </h2>
                            <div className="space-y-2">
                                {/* Always visible rules */}
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <IoTimeOutline className="text-gray-700 text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-900 font-medium">Akses 24 Jam</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <PiCigaretteSlashFill className="text-gray-700 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-900 font-medium">Dilarang merokok di kamar</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <BsLightningFill className="text-gray-700 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-900 font-medium">Tambahan biaya untuk barang elektonik</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <FaBed className="text-gray-700 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-900 font-medium">Maks. 2 orang/ kamar</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <FaChildren className="text-gray-700 text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-900 font-medium">Tidak boleh bawa anak</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                        <MdFamilyRestroom className="text-gray-700 text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-900 font-medium">Tidak untuk pasutri</p>
                                    </div>
                                </div>

                                {/* Additional rules - shown when expanded */}
                                {showAllRules && (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                                <IoHome className="text-gray-700 text-2xl" />
                                            </div>
                                            <div>
                                                <p className="text-base text-gray-900 font-medium">Tamu menginap dikenakan biaya</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                                <GiNightSleep className="text-gray-700 text-2xl" />
                                            </div>
                                            <div>
                                                <p className="text-base text-gray-900 font-medium">Ada jam malam</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                                <MdOutlinePets className="text-gray-700 text-2xl" />
                                            </div>
                                            <div>
                                                <p className="text-base text-gray-900 font-medium">Dilarang membawa hewan peliharaan</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                                <MdOutlineCleaningServices className="text-gray-700 text-2xl" />
                                            </div>
                                            <div>
                                                <p className="text-base text-gray-900 font-medium">Wajib menjaga kebersihan bersama</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                                <IoCloudyNight className="text-gray-700 text-2xl" />
                                            </div>
                                            <div>
                                                <p className="text-base text-gray-900 font-medium">Ada jam malam untuk tamu</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Lihat semua peraturan button */}
                            <button
                                onClick={() => setShowAllRules(!showAllRules)}
                                className="mt-6 text-sm py-3 px-4 border-2 border-slate-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors duration-200">
                                {showAllRules ? 'Sembunyikan peraturan' : 'Lihat semua peraturan'}
                            </button>
                        </div>

                        {/* Ketentuan Penyewaan */}
                        <div className="bg-white rounded-2xl py-10">
                            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                Ketentuan Penyewaan
                            </h2>
                            <div className="space-y-3">
                                <div className="text-base text-[#383746] py-4 space-y-1">
                                    <h1 className="font-bold">Bisa bayar DP (uang muka) dulu</h1>
                                    <span className="font-normal">Biaya DP adalah 30% dari biaya yang dipilih.</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <HiOutlineClipboardDocumentCheck className="mt-1 text-2xl text-gray-500" />
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-semibold text-gray-900">Deposit</p>
                                            <p className="text-sm text-gray-600">1 bulan sewa (dikembalikan saat checkout)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <HiOutlineDocumentText className="mt-1 text-2xl text-gray-500" />
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-semibold text-gray-900">Waktu mulai ngekos terdekat:</p>
                                            <p className="text-sm text-gray-600">Bisa di hari H setelah pengajuan sewa.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <HiOutlineClipboardDocumentList className="mt-1 text-2xl text-gray-500" />
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-semibold text-gray-900">Waktu mulai ngekos terjauh:</p>
                                            <p className="text-sm text-gray-600">1 bulan setelah pengajuan sewa.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <IoCalendarOutline className="text-2xl text-gray-500" />
                                        <p className="font-semibold text-gray-900">Calon penyewa wajib sertakan KTP.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Catatan Tambahan */}
                        <div className="bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-200 mb-20">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                                Keunggulan KOSEEKER
                            </h2>
                            <div className="space-y-10 text-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src="/images/logokos.svg" alt="logo koseeker" className="w-10 h-10" />
                                        <IoIosCheckmarkCircle className="text-gray-700 text-lg mt-0.5 flex-shrink-0 absolute bottom-0 right-1" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-lg font-bold text-black tracking-wide">
                                            Dikelola Koseeker: Dijamin Akurat
                                        </p>
                                        <p className="text-sm font-normal text-gray-500 tracking-wide">
                                            Fasilitas tidak sesuai dengan iklan yang kamu lihat, kami garansi refund.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AiOutlineFileProtect className="text-gray-700 text-2xl mt-2  flex-shrink-0 " />
                                    <div className="flex flex-col">
                                        <p className="text-lg font-bold text-black tracking-wide">
                                            Asuransi Khusus Penyewa
                                        </p>
                                        <p className="text-sm font-normal text-gray-500 tracking-wide">
                                            Perlindungan atas kompensasi kehilangan barang & fasilitas pada unit kamar. Disediakan oleh Penyedia Jasa Asuransi yang terdaftar OJK. S&K berlaku.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <BsPersonFillCheck className="text-gray-700 text-2xl mt-2 flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <p className="text-lg font-bold text-black tracking-wide">
                                            Penanganan Profesional
                                        </p>
                                        <p className="text-sm font-normal text-gray-500 tracking-wide">
                                            Tim Koseeker selalu siap membantumu. Mulai dari survei kos, pengajuan sewa, hingga selama kamu ngekos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Reviews & Ulasan
                            </h2>
                            <ReviewContainer
                                kosId={kosDetail.id}
                                userId={user?.id ? parseInt(user.id) : undefined}
                            />
                        </div>
                    </div>

                    {/* Right Sidebar - Price, Actions & Owner Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Price Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                                {kosDetail.discountPercent && kosDetail.discountPercent > 0 ? (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-red-500 py-1 text-sm font-bold flex items-center gap-1">
                                                <BsFillLightningChargeFill />
                                                Diskon -{kosDetail.discountPercent}%
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500 line-through">
                                                    Rp {formatPrice(kosDetail.pricePerMonth)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold text-black">
                                                    Rp {formatPrice(kosDetail.pricePerMonth - (kosDetail.pricePerMonth * kosDetail.discountPercent / 100))}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                ) : (
                                    <div className="font-lato">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-2xl font-bold text-[#303030]">
                                                Rp {formatPrice(kosDetail.pricePerMonth)}
                                            </span>
                                            <span className="text-base text-[#303030]">(Bulan Pertama)</span>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 my-4"></div>

                                {/* Action Buttons */}
                                <div className="space-y-3">

                                    <ButtonPrimary2
                                        type="button"
                                        onClick={() => router.push(`/book/${kosDetail.id}`)}
                                        className="w-full py-3 text-base font-semibold rounded-md shadow-lg">
                                        Ajukan Sewa
                                    </ButtonPrimary2>

                                    <button
                                        onClick={handleWhatsAppChat}
                                        className="w-full flex items-center text-sm justify-center gap-2 px-4 py-3 rounded-md bg-green-600 hover:bg-green-700 cursor-pointer text-white transition-all font-semibold shadow-lg hover:shadow-xl">
                                        <FaWhatsapp className="text-xl" />
                                        Tanya via WhatsApp
                                    </button>
                                </div>

                                <div className="text-center mt-4 space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                        <FiCheckCircle className="text-green-500" />
                                        Respon cepat dari pemilik
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Chat langsung via WhatsApp
                                    </p>
                                </div>
                            </div>

                            {/* Owner Info Card */}
                            {/* {kosDetail.owner && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Informasi Pemilik
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {kosDetail.owner.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{kosDetail.owner.name}</p>
                                                <p className="text-xs text-gray-500">Pemilik Kos</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaPhone className="text-green-600" />
                                                <span className="text-sm text-gray-700">
                                                    {kosDetail.owner.phone || 'Tidak tersedia'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FaEnvelope className="text-blue-600" />
                                                <span className="text-sm text-gray-700 truncate">
                                                    {kosDetail.owner.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default KosDetailPage;


