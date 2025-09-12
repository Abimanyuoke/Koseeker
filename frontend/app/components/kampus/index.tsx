import React from "react";
import { BsArrowRight } from "react-icons/bs";

export default function KampusArea() {
    return (
        <div className="max-w-6xl mx-auto font-lato">
            <h1 className="text-2xl font-bold mb-10 text-[##323232]">Area Kos Terpopuler</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 justify-items-center">
                <button className="relative w-[350px] h-[100px] p-4 bg-slate-500" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/4.svg" alt="Surabaya" className="w-[60px] h-full object-cover rounded-lg" />
                        <div className="flex flex-col items-center text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-2">
                                UI
                            </h1>
                            <p className="text-base font-medium">
                                DEPOK
                            </p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[230px] shadow-xl flex justify-center items-center rounded-lg" onClick={() => window.location.href = `#`}>
                    <span className=" flex gap-2 items-center text-black text-2xl font-bold hover:underline cursor-pointer">
                        Lihat semua <BsArrowRight />
                    </span>
                </button>
            </div>
        </div>
    )
}