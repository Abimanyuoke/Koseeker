"use client"

import Image from "next/image";
import Search from "./search";
import { IoSearch } from "react-icons/io5";

export default function Home() {

    return (
        <div className="bg-white font-lato">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col text-[#484848]">
                        <h1 className="font-black text-[32px]">Mau cari kos?</h1>
                        <p className="text-xl font-normal">Dapatkan infonya dan langsung sewa di Koseeker.</p>
                        <div className="flex items-center mt-5 gap-2 shadow-md p-3 rounded-md">
                            {/* icon kaca pembesar */}
                            <IoSearch  className="text-4xl"/>
                            <Search url={"/"} search={""} />
                            <span className="text-[16px] text-white bg-primary font-bold px-8 py-2 rounded-sm">Cari</span>
                        </div>
                    </div>
                    <div>
                        <Image src="/images/hero.png" alt="Hero Image" width={500} height={300} className="w-[500px] h-auto object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
}
