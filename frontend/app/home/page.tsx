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
import { CustomArrows } from "../components/arrow";


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
        <div className="bg-white font-lato mx-[185px]">
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
                        <div>
                            <Image src={voucher} alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                        <div>
                            <Image src={voucher} alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                        <div>
                            <Image src={voucher} alt="Abstract 1" width={600} height={300} className=" h-auto object-cover" />
                        </div>
                    </Slider>
                    <div>
                        <CustomArrows
                            next={() => sliderRef.current?.slickNext()}
                            prev={() => sliderRef.current?.slickPrev()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
