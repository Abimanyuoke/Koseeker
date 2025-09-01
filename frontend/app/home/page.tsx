"use client"

import React from "react";
import Image from "next/image";
import Search from "./search";
import { IoSearch } from "react-icons/io5";
import { CustomArrows } from "../components/arrow";
import Kos from "../kos/page";
import bild from "../../public/images/building.svg";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import KosPromoPage from "../kos_promo/page";


export default function Home() {

    const sliderRef = React.useRef<Slider | null>(null);

    const settings = {
        dots: false,
        lazyLoad: "ondemand" as const,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 2,
        arrow: false
    };

    return (
        <div className="bg-white font-lato mx-[150px]">
            {/* Section Hero */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col text-[#484848]">
                        <h1 className="font-black text-[32px]">Mau cari kos?</h1>
                        <p className="text-xl font-normal">Dapatkan infonya dan langsung sewa di Koseeker.</p>
                        <div className="flex items-center mt-5 gap-1 shadow-md border-[1px] border-[#48484819] p-2 rounded-lg">
                            <IoSearch className="text-4xl" />
                            <Search url={"/"} search={""} />
                            <button className="text-[16px] text-white cursor-pointer bg-primary font-bold px-8 py-2 rounded-sm">Cari</button>
                        </div>
                    </div>
                    <div>
                        <Image src={bild} alt="Hero Image" width={400} height={300} className="w-[600px] h-auto object-cover" />
                    </div>
                </div>
                {/* Carousel */}
                <div className="py-10 relative">
                    <Slider ref={sliderRef} {...settings}>
                        <div className="px-10">
                            <Image src="./images/voucher/voucher1.svg" alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                        <div className="px-10">
                            <Image src="./images/voucher/voucher2.svg" alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                        <div className="px-10">
                            <Image src="./images/voucher/voucher3.svg" alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                    </Slider>
                    <div>
                        <CustomArrows
                            next={() => sliderRef.current?.slickNext()}
                            prev={() => sliderRef.current?.slickPrev()} />
                    </div>
                </div>
                {/* blog */}
                <div className="py-24 text-[#404040] space-y-5">
                    <div className="bg-white shadow-lg rounded-lg p-7 gap-3 relative w-3/4">
                        <div className="font-lato flex flex-col space-y-1">
                            <h1 className="text-2xl font-black ">Coba cara baru bayar kos!</h1>
                            <p className="text-base font-normal">Biar bayar kos lebih gampang dan aman, coba sistem pembayaran khusus buat anak kos.</p>
                            <button className="underline text-start cursor-pointer text-[12px] mt-2 font-bold">Mau coba dong</button>
                        </div>
                        <Image src="./images/dots.svg" alt="Abstract 1" width={250} height={300} className=" h-auto object-cover absolute bottom-0 right-0" />
                    </div>
                    <div className="flex justify-between items-center bg-white shadow-lg rounded-lg p-7 gap-3">
                        <div className="flex flex-col space-y-2">
                            <h1 className="font-black text-2xl">Kos Dikelola Mamikos, Terjamin Nyaman</h1>
                            <p className="text-base font-normal">Disurvey langsung oleh Mamikos. Lokasi terverifikasi, bangunan kos lolos seleksi.</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <Image src="./images/logosinggasini.svg" alt="Mamikos" width={100} height={100} className=" h-auto object-cover"/>
                            <Image src="./images/logoapik.svg" alt="Mamikos" width={70} height={100} className=" h-auto object-cover"/>
                        </div>
                    </div>
                </div>

                {/* fitur kos */}
                <Kos/>

                <KosPromoPage/>

            </div>
        </div>
    );
}
