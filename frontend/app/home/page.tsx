"use client"

import React from "react";
import Image from "next/image";
import Search from "./search";
import { IoSearch } from "react-icons/io5";
import bild from "../../public/images/building.svg";
import Slider from "react-slick";
import voucher from "../../public/images/voucher1.png";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SampleNextArrow, SamplePrevArrow  } from "../components/arrow";


export default function Home() {

    const settings = {
        dots: false,
        lazyLoad: "ondemand" as const,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 2
    };

    return (
        <div className="bg-white font-lato">
            {/* Section Hero */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center    mb-10">
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
                        <Image src={bild} alt="Hero Image" width={500} height={300} className="w-[700px] h-auto object-cover" />
                    </div>
                </div>
                {/* Carousel */}
                <div className="py-10">
                    <Slider {...settings}>
                        <div>
                            <Image src={voucher} alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                        <div>
                            <Image src={voucher} alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                    </Slider>
                    <div>
                        <SamplePrevArrow className="absolute left-0 z-10" style={undefined} onClick={undefined} />
                        <SampleNextArrow className="absolute right-0 z-10" style={undefined} onClick={undefined} />
                    </div>
                </div>
            </div>
        </div>
    );
}
