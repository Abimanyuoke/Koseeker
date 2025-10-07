import React from "react"
import Image from "next/image"
import Link from "next/link"
import { MdEmail } from "react-icons/md"
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa"
import { BsTwitter } from "react-icons/bs"

export default function Footer() {
    return (
        <div className="bg-white font-lato py-14">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 ">
                    <div className="flex flex-col gap-5 col-span-3">
                        <div className='flex items-center gap-1 cursor-pointer'>
                            <Image src="/images/logo.svg" alt="Logo" width={40} height={40} className="w-16 h-16" />
                            <span className="className='font-lato text-primary text-3xl font-extrabold">koseeker</span>
                        </div>
                        <p className="font-normal text-base text-[#383746] mt-2.5 pr-4">Dapatkan "info kost murah  murah, nyaman, dan strategis" hanya di Koseeker App. Cocok untuk mahasiswa, pekerja, atau perantau. Fitur pencarian cepat, info lengkap, sewa kost jadi praktis dan hemat.</p>
                        <div className="flex gap-3">
                            <Image src="/images/playstore.svg" alt={"playstore"} width={130} height={50} />
                            <Image src="/images/appstore.svg" alt={"logo appstore"} width={120} height={50} />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-[#383746] text-base">KOSEEKER</h1>
                        <div className="mt-10 font-normal text-sm flex flex-col gap-4">
                            <Link href={"/"} className="hover:text-[#757575]" >Tentang Kami</Link>
                            <Link href={"/"} className="hover:text-[#757575]">Job Koseeker</Link>
                            <Link href={"/"} className="hover:text-[#757575]">Promosikan Kos Anda</Link>
                            <Link href={"/"} className="hover:text-[#757575]">Pusat Bantuan</Link>
                            <Link href={"/"} className="hover:text-[#757575]">Blog Koseeker</Link>
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-[#383746] text-base">KEBIJAKAN</h1>
                        <div className="mt-10 font-normal text-sm flex flex-col gap-4">
                            <Link href={"/"} className="hover:text-[#757575]">Kebijakan Privasi</Link>
                            <Link href={"/"} className="hover:text-[#757575]">Syarat dan Ketentuan Umum</Link>
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-[#383746] text-base">HUBUNGI KAMI</h1>
                        <div className="mt-10 font-normal text-sm flex flex-col gap-4">
                            <button className="flex items-center gap-2 hover:text-[#757575]">
                                <MdEmail />
                                <span>koseeker@gmail.com</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-[#757575]">
                                <FaWhatsapp />
                                <span>+6282257313006</span>
                            </button>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <Link href={"/"} target="_blank" className="hover:text-[#757575]">
                                <FaFacebook className="text-2xl" />
                            </Link>
                            <Link href={"/"} target="_blank" className="hover:text-[#757575]">
                                <BsTwitter className="text-2xl" />
                            </Link>
                            <Link href={"/"} target="_blank" className="hover:text-[#757575]">
                                <FaInstagram className="text-2xl" />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="">
                    <div className="border-t border-[#E0E0E0] my-10">{''}</div>
                    <span className="flex justify-end text-sm">
                        © 2025 Koseeker.com. All rights reserved
                    </span>
                </div>
            </div>
        </div>
    )
}

