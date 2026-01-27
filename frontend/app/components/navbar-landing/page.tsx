'use client'

import React, { useRef, useState } from 'react'
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import NotificationBell from '../notification/NotificationBell';
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../../public/images/logo.svg";
import { IoMdArrowDropdown } from 'react-icons/io';
import { motion } from 'framer-motion';

export default function NavbarLandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [activeDown, setActiveDown] = useState<string | null>(null);
    const cariDropdownRef = useRef<HTMLDivElement>(null)
    const lainnyaDropdownRef = useRef<HTMLDivElement>(null)

    const toggleDown = (down: string) => {
        setActiveDown((prev) => (prev === down ? null : down));
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 200);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.div
            initial={false}
            animate={{
                boxShadow: scrolled ? "0px 10px 30px rgba(0,0,0,0.08)" : "0px 0px 0px rgba(0,0,0,0)",
                paddingTop: scrolled ? "10px" : "20px",
                paddingBottom: scrolled ? "10px" : "20px",
            }}
            transition={{ duration: 0.3 }}
            className={`bg-white sticky top-0 z-50 p-5 font-lato w-full`}>
            <motion.div
                initial={false}
                animate={{
                    maxWidth: scrolled ? "100%" : "1200px",
                    paddingLeft: scrolled ? "40px" : "0px",
                    paddingRight: scrolled ? "40px" : "0px",
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`mx-auto`}>
                <div className='flex items-center justify-between py-3 relative h-[80px]'>
                    <div className='flex items-center gap-2 cursor-pointer'>
                        <button onClick={() => router.push('/home')} className='cursor-pointer'>
                            <Image src={logo} alt="Logo" width={40} height={40} className="w-12 h-12 object-cover" />
                        </button>
                        <div className='font-lato text-primary text-2xl font-extrabold'>koseeker</div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-4 font-semibold text-[14px] text-[#303030]'>
                            <div ref={cariDropdownRef} className='relative'>
                                <button onClick={() => toggleDown('cari')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                                    Cari Apa?
                                    <IoMdArrowDropdown className={`text-lg transition-transform mt-1 ${activeDown === 'cari' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeDown == "cari" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-full mt-5 w-48 bg-white shadow-lg rounded-xl border border-gray-200 z-50">
                                        <ul className="flex flex-col">
                                            <li>
                                                <Link
                                                    href="/kos"
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setActiveDown(null)}>
                                                    Kos
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/kos-andalan"
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setActiveDown(null)}>
                                                    Kos Andalan
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/kos-singgasini-apik"
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setActiveDown(null)}>
                                                    Kos Singgasini & Apik
                                                </Link>
                                            </li>
                                        </ul>
                                    </motion.div>
                                )}
                            </div>
                            <Link href={"/favorit"} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                                Favorit
                            </Link>
                            <Link href={'/book'} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                                Booking
                            </Link>
                            <div ref={lainnyaDropdownRef} className='relative'>
                                <button onClick={() => toggleDown('lainnya')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                                    Lainnya
                                    <IoMdArrowDropdown className={`text-lg transition-transform ${activeDown === 'lainnya' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeDown === 'lainnya' && (
                                    <div className="absolute top-full mt-5 w-48 bg-white shadow-lg rounded-xl border border-gray-200 z-50">
                                        <ul className="flex flex-col">
                                            <li>
                                                <Link
                                                    href="/bantuan"
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setActiveDown(null)}>
                                                    Pusat Bantuan
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/blog"
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setActiveDown(null)}>
                                                    Blog Koseeker
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/syarat"
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setActiveDown(null)}>
                                                    Syarat dan Ketentuan
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <NotificationBell className='mr-3' />
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}



