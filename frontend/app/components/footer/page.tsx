import React from "react"
import Image from "next/image"
import Link from "next/link"
import { MdEmail } from "react-icons/md"
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa"
import { BsTwitter } from "react-icons/bs"

export default function Footer() {
    return (
        <div className="bg-white font-lato mx-[185px] py-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 ">
                    <div className="flex flex-col gap-5">
                        <div className='flex items-center gap-2 cursor-pointer'>
                            <Image src="./images/logo.svg" alt="Logo" width={40} height={40} className="w-12 h-12 object-cover" />
                            <span className="className='font-lato text-primary text-2xl font-extrabold'>">koseeker</span>
                        </div>
                        <p className="font-normal text-base text-[#383746] mt-2.5">Dapatkan "info kost murah" hanya di Koseeker App.Mau "Sewa Kost Murah"?</p>
                        <div className="flex gap-3">
                            <Image src="./images/playstore.svg" alt={"playstore"} width={300} height={200} className="h-auto object-cover" />
                            <Image src="./images/appstore.svg" alt={"logo appstore"} width={300} height={200} className="h-auto object-cover" />
                        </div>
                    </div>
                    <div>
                        <h1>KOSEEKER</h1>
                        <div>
                            <Link href={"/"}>Tentang Kami</Link>
                            <Link href={"/"}>Job Koseeker</Link>
                            <Link href={"/"}>Promosikan Kos Anda</Link>
                            <Link href={"/"}>Pusat Bantuan</Link>
                            <Link href={"/"}>Blog Koseeker</Link>
                        </div>
                    </div>
                    <div>
                        <h1>KOSEEKER</h1>
                        <div>
                            <Link href={"/"}>Kebijakan Privasi</Link>
                            <Link href={"/"}>Syarat dan Ketentuan Umum</Link>
                        </div>
                    </div>
                    <div>
                        <h1>HUBUNGI KAMI</h1>
                        <div>
                            <button className="flex items-center gap-2">
                                <MdEmail />
                                <span>koseeker@gmail.com</span>
                            </button>
                            <button className="flex items-center gap-2">
                                <FaWhatsapp />
                                <span>+6282257313006</span>
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <FaFacebook />
                            <BsTwitter />
                            <FaInstagram />
                        </div>
                    </div>
                </div>
                <div>
                    <span>
                        © 2025 Koseeker.com. All rights reserved
                    </span>
                </div>
            </div>
        </div>
    )
}

