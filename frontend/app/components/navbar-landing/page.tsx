'use client'

import React, { useRef, useState } from 'react'
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../../public/images/logo.svg";
import { IoMdArrowDropdown } from 'react-icons/io';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function NavbarLandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [activeDown, setActiveDown] = useState<string | null>(null);
    const cariDropdownRef = useRef<HTMLDivElement>(null)
    const lainnyaDropdownRef = useRef<HTMLDivElement>(null)
    const [loadingButton, setLoadingButton] = useState<string | null>(null);

    const toggleDown = (down: string) => {
        setActiveDown((prev) => (prev === down ? null : down));
    };

    const handleNavigation = async (path: string, buttonId: string) => {
        setLoadingButton(buttonId);
        await new Promise(resolve => setTimeout(resolve, 2000));

        router.push(path);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`bg-white fixed top-0 z-50 p-2 font-lato w-full ${scrolled ? ('shadow-md') : ('shadow-none')}`}>
            <div className={`mx-auto ${scrolled ? ('max-w-7xl') : ('max-w-6xl')} transition-all`}>
                <div className='flex items-center justify-between py-3 relative h-[80px]'>
                    <div className='flex items-center gap-2 cursor-pointer'>
                        <button onClick={() => router.push('/home')} className='cursor-pointer'>
                            <Image src={logo} alt="Logo" width={40} height={40} className="w-12 h-12 object-cover" />
                        </button>
                        <div className='font-lato text-primary text-2xl font-extrabold'>koseeker</div>
                    </div>
                    {/* Menu Navbar */}
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
                        </div>
                    </div>

                    <div className='flex items-center justify-center gap-2'>
                        <button onClick={() => handleNavigation('/auth/signup', 'signup')} disabled={loadingButton !== null} className={`px-4 py-2 text-primary bg-white rounded-md border-[1px] border-primary hover:text-primary/85 font-semibold hover:cursor-pointer`}>{loadingButton === 'signup' ? <Loader2 className='animate-spin' /> : 'Daftar'}</button>
                        <button onClick={() => handleNavigation('/auth/login', 'login')} disabled={loadingButton !== null} className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/85 font-semibold hover:cursor-pointer`}>{loadingButton === 'login' ? <Loader2 className='animate-spin' /> : 'Masuk'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}



