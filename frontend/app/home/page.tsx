"use client"

import React from "react";
import Image from "next/image";
import Search from "./search";
import { IoSearch } from "react-icons/io5";
import bild from "../../public/images/building.svg";

export default function Home() {

    return (
        <div className="bg-white font-lato h-[1000px]">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center    mb-10">
                    <div className="flex flex-col text-[#484848]">
                        <h1 className="font-black text-[32px]">Mau cari kos?</h1>
                        <p className="text-xl font-normal">Dapatkan infonya dan langsung sewa di Koseeker.</p>
                        <div className="flex items-center mt-5 gap-1 shadow-md border-[1px] border-[#48484819] p-2 rounded-lg">
                            {/* icon kaca pembesar */}
                            <IoSearch  className="text-4xl"/>
                            <Search url={"/"} search={""} />
                            <button className="text-[16px] text-white cursor-pointer bg-primary font-bold px-8 py-2 rounded-sm">Cari</button>
                        </div>
                    </div>
                    <div>
                        <Image src={bild} alt="Hero Image" width={500} height={300} className="w-[700px] h-auto object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
}
