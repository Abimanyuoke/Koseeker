"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IKos } from "@/app/types";
import { getCookies } from "@/lib/client-cookies";
import { BASE_API_URL, BASE_IMAGE_KOS } from "../../global";
import { get } from "@/lib/bridge";
import { AlertToko } from "../components/alert";
import { FiLoader } from "react-icons/fi";
import { FaWifi, FaBed, FaCar, FaTv, FaSnowflake, FaShower, FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { MdLocalLaundryService, MdSecurity } from "react-icons/md";
import { GiCook } from "react-icons/gi";
import { BiMale, BiFemale, BiMoney, BiSort } from "react-icons/bi";
import { MdMale, MdFemale, MdGroups } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { RiDiscountPercentFill } from "react-icons/ri";
import { ArrowKos, CustomArrows } from "../components/arrow";
import Slider from "react-slick";
import Select from "../components/select";
import Image from "next/image";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const KosPage = () => {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";
    const router = useRouter();

    // Slider untuk kos
    const sliderRef = useRef<Slider | null>(null);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        centerMode: false,
        variableWidth: false,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
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
                    slidesToScroll: 1
                }
            }
        ]
    };

    // Daftar kota berdasarkan enum Kota di Prisma
    const kotaOptions = [
        "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Makassar",
        "Palembang", "Batam", "Malang", "Bogor", "Depok", "Tangerang",
        "Solo", "Makasar", "Yogyakarta", "Bekasi"
    ];

    /** ---------- STATE ---------- */
    const [kosData, setKosData] = useState<IKos[]>([]);
    const [filteredKosData, setFilteredKosData] = useState<IKos[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKota, setSelectedKota] = useState<string>("all");
    const [imageIndexes, setImageIndexes] = useState<{ [key: number]: number }>({});

    // Filter states
    const [selectedGender, setSelectedGender] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000000 });
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>("recommended");
    const [showPromo, setShowPromo] = useState(false);
    const [showRecommended, setShowRecommended] = useState(false);

    // Dropdown states
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const [showFacilitiesDropdown, setShowFacilitiesDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const genderRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);
    const facilitiesRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    const facilityOptions = ["WiFi", "AC", "Kasur", "Lemari", "Meja", "Kursi", "Kamar Mandi Dalam", "Dapur", "Laundry", "Parkir"];

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

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
                setShowGenderDropdown(false);
            }
            if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
                setShowPriceDropdown(false);
            }
            if (facilitiesRef.current && !facilitiesRef.current.contains(e.target as Node)) {
                setShowFacilitiesDropdown(false);
            }
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setShowSortDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Apply filters whenever filter states change
    useEffect(() => {
        applyFilters();
    }, [kosData, selectedGender, priceRange, selectedFacilities, sortBy, showPromo, showRecommended]);

    /** ---------- APPLY FILTERS ---------- */
    const applyFilters = () => {
        let filtered = [...kosData];

        // Filter by gender
        if (selectedGender !== "all") {
            filtered = filtered.filter(kos => kos.gender === selectedGender);
        }

        // Filter by price range
        filtered = filtered.filter(kos => {
            const price = kos.discountPercent && kos.discountPercent > 0
                ? kos.pricePerMonth - (kos.pricePerMonth * kos.discountPercent / 100)
                : kos.pricePerMonth;
            return price >= priceRange.min && price <= priceRange.max;
        });

        // Filter by facilities
        if (selectedFacilities.length > 0) {
            filtered = filtered.filter(kos => {
                const kosFacilities = kos.facilities?.map(f => f.facility.toLowerCase()) || [];
                return selectedFacilities.every(selectedFacility =>
                    kosFacilities.some(kosFacility => kosFacility.includes(selectedFacility.toLowerCase()))
                );
            });
        }

        // Filter by promo
        if (showPromo) {
            filtered = filtered.filter(kos => kos.discountPercent && kos.discountPercent > 0);
        }

        // Sort
        if (sortBy === "price-low") {
            filtered.sort((a, b) => {
                const priceA = a.discountPercent ? a.pricePerMonth - (a.pricePerMonth * a.discountPercent / 100) : a.pricePerMonth;
                const priceB = b.discountPercent ? b.pricePerMonth - (b.pricePerMonth * b.discountPercent / 100) : b.pricePerMonth;
                return priceA - priceB;
            });
        } else if (sortBy === "price-high") {
            filtered.sort((a, b) => {
                const priceA = a.discountPercent ? a.pricePerMonth - (a.pricePerMonth * a.discountPercent / 100) : a.pricePerMonth;
                const priceB = b.discountPercent ? b.pricePerMonth - (b.pricePerMonth * b.discountPercent / 100) : b.pricePerMonth;
                return priceB - priceA;
            });
        }

        setFilteredKosData(filtered);
    };

    const resetFilters = () => {
        setSelectedGender("all");
        setPriceRange({ min: 0, max: 10000000 });
        setSelectedFacilities([]);
        setSortBy("recommended");
        setShowPromo(false);
        setShowRecommended(false);
    };

    const toggleFacility = (facility: string) => {
        setSelectedFacilities(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        );
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedGender !== "all") count++;
        if (priceRange.min > 0 || priceRange.max < 10000000) count++;
        if (selectedFacilities.length > 0) count++;
        if (showPromo) count++;
        if (showRecommended) count++;
        return count;
    };

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

    // const getFacilityIcon = (facility: string) => {
    //     const facilityLower = facility.toLowerCase();
    //     if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <FaWifi className="text-blue-500" />;
    //     if (facilityLower.includes('kasur') || facilityLower.includes('bed')) return <FaBed className="text-green-500" />;
    //     if (facilityLower.includes('parkir') || facilityLower.includes('parking')) return <FaCar className="text-gray-500" />;
    //     if (facilityLower.includes('tv') || facilityLower.includes('television')) return <FaTv className="text-purple-500" />;
    //     if (facilityLower.includes('ac') || facilityLower.includes('air conditioning')) return <FaSnowflake className="text-cyan-500" />;
    //     if (facilityLower.includes('kamar mandi') || facilityLower.includes('bathroom')) return <FaShower className="text-blue-400" />;
    //     if (facilityLower.includes('laundry') || facilityLower.includes('cuci')) return <MdLocalLaundryService className="text-indigo-500" />;
    //     if (facilityLower.includes('dapur') || facilityLower.includes('kitchen')) return <GiCook className="text-orange-500" />;
    //     if (facilityLower.includes('security') || facilityLower.includes('keamanan')) return <MdSecurity className="text-red-500" />;
    //     return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    // };

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
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-7 items-center gap-4">
                        <div className="flex items-center gap-4 col-span-5">
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

                        <div className="relative flex items-center gap-4 w-full md:w-auto col-span-2">
                            <div className="w-full md:w-64">
                                <Select
                                    id="kota-select"
                                    value={selectedKota}
                                    onChange={(value) => setSelectedKota(value)}
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
            </div>
            {/* ----------------- FILTER PILLS ----------------- */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Gender Filter */}
                    <div ref={genderRef} className="relative">
                        <button
                            onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap transition-all duration-200 shadow-sm ${selectedGender !== "all"
                                ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-md"
                                }`}>
                            {selectedGender === "all" ? (
                                <MdGroups className="text-lg" />
                            ) : selectedGender === "male" ? (
                                <MdMale className="text-lg" />
                            ) : (
                                <MdFemale className="text-lg" />
                            )}
                            <span className="font-medium">
                                {selectedGender === "all" ? "Semua Gender" : selectedGender === "male" ? "Pria" : selectedGender === "female" ? "Wanita" : "Campur"}
                            </span>
                            <FaChevronDown className={`text-xs transition-transform duration-200 ${showGenderDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showGenderDropdown && (
                            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60] min-w-[180px]">
                                <button
                                    onClick={() => { setSelectedGender("all"); setShowGenderDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors">
                                    <MdGroups className="text-gray-600 text-lg" />
                                    <span className="font-medium">Semua</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedGender("male"); setShowGenderDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors">
                                    <MdMale className="text-blue-600 text-lg" />
                                    <span className="font-medium">Pria</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedGender("female"); setShowGenderDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors">
                                    <MdFemale className="text-pink-600 text-lg" />
                                    <span className="font-medium">Wanita</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedGender("all"); setShowGenderDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors">
                                    <MdGroups className="text-green-600 text-lg" />
                                    <span className="font-medium">Campur</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Price Range Filter */}
                    <div ref={priceRef} className="relative">
                        <button
                            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap transition-all duration-200 shadow-sm ${priceRange.min > 0 || priceRange.max < 10000000
                                ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-md"
                                }`}>
                            <BiMoney className="text-xl" />
                            <span className="font-medium">Harga</span>
                            <FaChevronDown className={`text-xs transition-transform duration-200 ${showPriceDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showPriceDropdown && (
                            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60] min-w-[220px]">
                                <button
                                    onClick={() => { setPriceRange({ min: 0, max: 10000000 }); setShowPriceDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">Semua Harga</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => { setPriceRange({ min: 0, max: 1000000 }); setShowPriceDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">&lt; Rp 1 juta</span>
                                </button>
                                <button
                                    onClick={() => { setPriceRange({ min: 1000000, max: 2000000 }); setShowPriceDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">Rp 1 - 2 juta</span>
                                </button>
                                <button
                                    onClick={() => { setPriceRange({ min: 2000000, max: 3000000 }); setShowPriceDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">Rp 2 - 3 juta</span>
                                </button>
                                <button
                                    onClick={() => { setPriceRange({ min: 3000000, max: 10000000 }); setShowPriceDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">&gt; Rp 3 juta</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Facilities Filter */}
                    <div ref={facilitiesRef} className="relative">
                        <button
                            onClick={() => setShowFacilitiesDropdown(!showFacilitiesDropdown)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap transition-all duration-200 shadow-sm ${selectedFacilities.length > 0
                                ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-md"
                                }`}>
                            <FaBed className="text-lg" />
                            <span className="font-medium">
                                {selectedFacilities.length === 0 ? "Fasilitas" : `${selectedFacilities.length} Fasilitas`}
                            </span>
                            <FaChevronDown className={`text-xs transition-transform duration-200 ${showFacilitiesDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showFacilitiesDropdown && (
                            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60] min-w-[240px] max-h-[320px] overflow-y-auto">
                                {facilityOptions.map(facility => (
                                    <label key={facility} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedFacilities.includes(facility)}
                                            onChange={() => toggleFacility(facility)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="font-medium">{facility}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Filter */}
                    <div ref={sortRef} className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap transition-all duration-200 shadow-sm ${sortBy !== "recommended"
                                ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:shadow-md"
                                }`}>
                            <BiSort className="text-xl" />
                            <span className="font-medium">
                                {sortBy === "recommended" ? "Direkomendasikan" : sortBy === "price-low" ? "Termurah" : "Termahal"}
                            </span>
                            <FaChevronDown className={`text-xs transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showSortDropdown && (
                            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60] min-w-[200px]">
                                <button
                                    onClick={() => { setSortBy("recommended"); setShowSortDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">Direkomendasikan</span>
                                </button>
                                <button
                                    onClick={() => { setSortBy("price-low"); setShowSortDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">Harga Termurah</span>
                                </button>
                                <button
                                    onClick={() => { setSortBy("price-high"); setShowSortDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                                    <span className="font-medium">Harga Termahal</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Promo Filter */}
                    <button
                        onClick={() => setShowPromo(!showPromo)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap transition-all duration-200 shadow-sm ${showPromo
                            ? "bg-red-500 text-white border-red-500 shadow-red-200"
                            : "bg-white text-gray-700 border-gray-300 hover:border-red-500 hover:shadow-md"
                            }`}>
                        <RiDiscountPercentFill className="text-lg" />
                        <span className="font-medium">Promo</span>
                    </button>

                    {/* Recommended Filter */}
                    <button
                        onClick={() => setShowRecommended(!showRecommended)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 whitespace-nowrap transition-all duration-200 shadow-sm ${showRecommended
                            ? "bg-purple-600 text-white border-purple-600 shadow-purple-200"
                            : "bg-white text-gray-700 border-gray-300 hover:border-purple-500 hover:shadow-md"
                            }`}>
                        <HiOutlineSparkles className="text-lg" />
                        <span className="font-medium">Kos Andalan</span>
                    </button>

                    {/* Reset Filters */}
                    {getActiveFiltersCount() > 0 && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md border-2 border-gray-300">
                            <IoClose className="text-lg font-bold" />
                            <span className="font-medium">Reset ({getActiveFiltersCount()})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ----------------- KOS CARDS ----------------- */}
            <div className="max-w-6xl mx-auto py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[250px]">
                        <div className="flex flex-col items-center gap-4">
                            <FiLoader className="animate-spin text-green-600 text-4xl" />
                            <p className="text-gray-600 text-lg">Memuat data kos...</p>
                        </div>
                    </div>
                ) : filteredKosData.length === 0 ? (
                    <div className="text-start py-4">
                        <AlertToko title="Informasi">
                            {getActiveFiltersCount() > 0
                                ? "Tidak ada kos yang sesuai dengan filter yang dipilih. Coba ubah atau reset filter."
                                : `Tidak ada kos yang ditemukan di ${selectedKota === "all" ? "semua kota" : selectedKota}`}
                        </AlertToko>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 text-gray-600">
                            Menampilkan {filteredKosData.length} dari {kosData.length} kos
                        </div>
                        <Slider ref={sliderRef} {...settings} >
                            {filteredKosData.map((kos) => {
                                const currentImageIndex = imageIndexes[kos.id] || 0;
                                const hasMultipleImages = kos.images && kos.images.length > 1;

                                return (
                                    <div key={kos.id} className="px-3">
                                        <div
                                            className="rounded-2xl h-[400px] w-[280px] mx-auto transition-all duration-300 cursor-pointer"
                                            // className="bg-white rounded-2xl h-[400px] w-[280px] mx-auto shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group transform hover:-translate-y-1"
                                            onClick={() => router.push(`/kos/${kos.id}`)}>
                                            <div className="relative h-[200px] overflow-hidden">
                                                {kos.images && kos.images.length > 0 ? (
                                                    <div>
                                                        <Image
                                                            src={`${BASE_IMAGE_KOS}/${kos.images[currentImageIndex].file}`}
                                                            alt={kos.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            unoptimized />

                                                        {hasMultipleImages && (
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

                                                        {/* {hasMultipleImages && (
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
                                                    <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400">No Image</span>
                                                    </div>
                                                )}

                                                {/* Badge Gender */}
                                                <div className="absolute top-3 left-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getGenderColor(kos.gender)}`}>
                                                        {getGenderText(kos.gender)}
                                                    </span>
                                                </div>

                                                {/* Discount Badge - hanya tampil jika discount > 0 */}
                                                {kos.discountPercent && Number(kos.discountPercent) > 0 && (
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
                                                                    <span className="text-xs text-gray-600 truncate max-w-16">
                                                                        {facility.facility.length > 8
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
                                                            <span className="text-xl font-bold text-red-500">
                                                                Rp {formatPrice(kos.pricePerMonth - (kos.pricePerMonth * kos.discountPercent / 100))}
                                                            </span>
                                                            <div className="flex">
                                                                <span className="text-sm text-gray-500 line-through">
                                                                    Rp {formatPrice(kos.pricePerMonth)}
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    /bulan
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="text-xl font-bold text-green-600">
                                                                Rp {formatPrice(kos.pricePerMonth)}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                /bulan
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
                                    </div>
                                );
                            })}
                        </Slider>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KosPage;
