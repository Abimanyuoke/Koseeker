/* eslint-disable @next/next/no-img-element */
import React from "react";
import { BsArrowRight } from "react-icons/bs";

export default function KosArea() {
    return(
        <div className="max-w-6xl mx-auto font-lato">
                    <h1 className="text-2xl font-bold mb-10 text-[##323232]">Area Kos Terpopuler</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 justify-items-center">
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/surabaya`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <img src="/images/area/3.svg" alt="Surabaya" className="w-full h-full object-cover rounded-lg" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Surabaya
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/medan`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <img src="./images/area/4.svg" alt="Medan" className="w-full h-full object-cover rounded-lg" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Medan
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/semarang`}>
                            <img src="./images/area/5.svg" alt="Semarang" className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Semarang
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/malang`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <img src="./images/area/6.svg" alt="Malang" className="w-full h-full object-cover rounded-lg" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Malang
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/jakarta`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <img src="./images/area/7.svg" alt="Yogyakarta" className="w-full h-full object-cover rounded-lg" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Jakarta
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/yogyakarta`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <img src="./images/area/8.svg" alt="Yogyakarta" className="w-full h-full object-cover rounded-lg" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Yogyakarta
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px]" onClick={() => window.location.href = `/area/bandung`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                            <img src="./images/area/9.svg" alt="Yogyakarta" className="w-full h-full object-cover rounded-lg" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl w-full font-bold hover:underline cursor-pointer">
                                Kos Bandung
                            </span>
                        </button>
                        <button className="relative w-[280px] h-[230px] shadow-xl flex justify-center items-center rounded-lg" onClick={() => window.location.href = `/area`}>
                                <span className=" flex gap-2 items-center text-black text-2xl font-bold hover:underline cursor-pointer">
                                    Lihat semua <BsArrowRight />
                                </span>
                        </button>
                    </div>
                </div>
    )
}