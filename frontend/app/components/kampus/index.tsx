import React from "react";
import { BsArrowRight } from "react-icons/bs";

export default function KampusArea() {
    return (
        <div className="max-w-6xl mx-auto font-lato">
            <h1 className="text-2xl font-bold mb-10 text-[##323232]">Kos Sekitar Kampus</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 justify-items-center">
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/10.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-1 uppercase">ugm</h1>
                            <p className="text-base font-medium capitalize">jogja</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/4.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb- uppercase1">undip</h1>
                            <p className="text-base font-medium capitalize">semarang</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/7.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-1 uppercase">ui</h1>
                            <p className="text-base font-medium capitalize">jakarta</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/6.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-1 uppercase">unpad</h1>
                            <p className="text-base font-medium capitalize">jatinangor</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/5.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-1 uppercase">stan</h1>
                            <p className="text-base font-medium capitalize">jakarta</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/8.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-1 uppercase">ub</h1>
                            <p className="text-base font-medium capitalize">malang</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] p-4 bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area/surabaya`}>
                    <div className="flex items-center gap-4">
                        <img src="./images/logo-kampus/9.svg" alt="Logo Kampus Unpad" className="w-[50px] h-full object-cover rounded-lg" />
                        <div className=" flex flex-col items-start text-[#2e2d39]">
                            <h1 className="text-base font-bold mb-1 uppercase">unair</h1>
                            <p className="text-base font-medium capitalize">surabaya</p>
                        </div>
                    </div>
                </button>
                <button className="relative w-[280px] h-[100px] flex justify-center items-center bg-white border-gray-400/25 border-2 hover:shadow-lg rounded-lg cursor-pointer" onClick={() => window.location.href = `/area`}>
                    <span className=" flex gap-2 items-center text-black text-lg font-bold hover:underline cursor-pointer">
                        Lihat semua <BsArrowRight />
                    </span>
                </button>
            </div>
        </div>
    )
}