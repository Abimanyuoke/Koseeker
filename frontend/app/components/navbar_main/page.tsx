'use client'

import React, { useRef, useState } from 'react'
import logo from "../../../public/images/logo.svg";
import Search from "./search";
import { useEffect } from "react";
import { getCookies, removeCookie } from "@/lib/client-cookies";
import { BASE_IMAGE_PROFILE } from "../../../global"
import { IoMdArrowDropdown, IoMdSearch } from "react-icons/io";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import Link from 'next/link';
import { LuCalendarDays } from 'react-icons/lu';
import { PiDeviceMobile } from 'react-icons/pi';
import { AnimatePresence, motion } from 'framer-motion';
import { IoSearch } from 'react-icons/io5';

const Navbar: React.FC = () => {

  const [popup, setPopup] = useState(false);
  const [profile, setProfile] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false);
  const [activeDown, setActiveDown] = useState<string | null>(null);

  const toggleDown = (down: string) => {
    setActiveDown((prev) => (prev === down ? null : down));
  };

  const handleLogout = () => {
    removeCookie("token");
    removeCookie("id");
    removeCookie("name");
    removeCookie("role");
    router.replace(`/auth/login`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfile(getCookies("profile_picture") || "");
    setUser(getCookies("name") || "");
    setRole(getCookies("role") || "");
  }, []);

  const handlePopup = (state?: boolean) => {
    if (typeof state === "boolean") {
      setPopup(state);
    } else {
      setPopup((prev) => !prev);
    }
  };

  return (
    <div className='bg-white sticky top-0 z-50 border-b-[1px] border-gray-200 font-lato'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center gap-4 font-semibold text-xs text-gray-500'>
          <button className='flex items-center gap-2 py-4 cursor-pointer'>
            <PiDeviceMobile className='text-lg' />
            Download App
          </button>
          <button className='flex items-center gap-2 cursor-pointer'>
            <LuCalendarDays className='text-lg' />
            Sewa Kos
          </button>
        </div>
        <div className='flex items-center justify-between py-3 relative'>
          <div className='flex items-center gap-2 cursor-pointer'>
            <Image src={logo} alt="Logo" width={40} height={40} className="w-12 h-12 object-cover" />
            <AnimatePresence mode="wait">
              {!scrolled ? (
                <motion.span
                  key="logo-text"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className='font-lato text-primary text-2xl font-extrabold'
                >
                  koseeker
                </motion.span>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-1 shadow-md border-[1px] border-[#48484819] p-2 rounded-lg">
                    {/* icon kaca pembesar */}
                    <IoSearch className="text-2xl" />
                    <Search url={"/"} search={""} />
                    <button className="text-[16px] text-white cursor-pointer bg-primary font-bold px-8 py-2 rounded-sm">Cari</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-4 font-semibold text-[14px] text-[#303030]'>
              <button onClick={() => toggleDown('cari')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Cari Apa?
                <IoMdArrowDropdown className={`text-lg transition-transform mt-1 ${activeDown === 'cari' ? 'rotate-180' : ''}`} />
              </button>
              {activeDown == "cari" && (
                <div className="absolute top-full mt-5 w-48 bg-white shadow-lg rounded-xl border border-gray-200 z-50">
                  <ul className="flex flex-col">
                    <li>
                      <Link
                        href="/kos"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => router.push('/kos')}>
                        Kos
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/kos-andalan"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => router.push('/kos-andalan')}>
                        Kos Andalan
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/kos-singgasini-apik"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => router.push('/kos-singgasini-apik')}>
                        Kos Singgasini & Apik
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
              <Link href={"/favorit"} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Favorit
              </Link>
              <Link href={'/chat'} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Chat
              </Link>
              <Link href={'/notifikasi'} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>Notifikasi</Link>
              <button onClick={() => toggleDown('lainnya')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Lainnya
                <IoMdArrowDropdown className={`text-lg transition-transform ${activeDown === 'lainnya' ? 'rotate-180' : ''}`} />
              </button>
              {activeDown === 'lainnya' && (
                <div className="absolute top-full right-0 mt-5 w-48 bg-white shadow-lg rounded-xl border border-gray-200 z-50">
                  <ul className="flex flex-col">
                    <li>
                      <Link
                        href="/kos"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => router.push('/bantuan')}>
                        Pusat Bantuan
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/kos-andalan"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => router.push('/blog')}>
                        Blog Koseeker
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/kos-singgasini-apik"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => router.push('/syarat')}>
                        Syarat dan Ketentuan
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <img
                src={`${BASE_IMAGE_PROFILE}/${profile}`}
                alt='profile'
                className='w-10 h-10 rounded-full object-cover border-[1px] border-primary' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar