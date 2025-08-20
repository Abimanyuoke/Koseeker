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

const Navbar: React.FC = () => {

  const [popup, setPopup] = useState(false);
  const [profile, setProfile] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
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
    // <div className=' max-w-7xl mx-auto '>
    //   <div className={`transition-all duration-300  bg-white ${scrolled ? "mt-4 rounded-xl w-[80%]" : "w-full"} mx-auto`}>

    //     {/* upper Navbar */}
    //     <div className={`${scrolled ? "py-3 rounded-xl" : "py-2"} transition-all`}>
    //       <div className='container flex justify-between items-center'>
    //         {/* Logo */}
    //         <a href="#" className={`font-bold text-2xl sm:text-3xl flex gap-2 items-center`}>
    //           <img src={logo.src} alt="logo" className={`transition-all duration-300 ${scrolled ? "w-12" : "w-10"}`} />
    //           <span
    //             className={`transition-all duration-500 ease-in-out transform ${scrolled ? "translate-x-80  absolute text-3xl" : "translate-x-0 opacity-100"} text-2xl`}>
    //             Shopsy
    //           </span>
    //         </a>

    //         {/* Search, Profile, DarkMode */}
    //         <div className='flex justify-between items-center gap-4'>
    //           {/* Search */}
    //           <div className='relative group hidden sm:block'>
    //             <Search url={`/main`} search={""} />
    //             <IoMdSearch className='text-gray-500 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3' />
    //           </div>

    //           {/* Profile */}
    //           <button className='cursor-pointer' onClick={() => handlePopup()}>
    //             <img
    //               src={`${BASE_IMAGE_PROFILE}/${profile}`}
    //               alt="profile image"
    //               width={40}
    //               height={40}
    //               className="rounded-full"
    //             />
    //           </button>

    //           {/* Dark Mode */}
    //         </div>
    //       </div>
    //     </div>

    //     {/* Dropdown Profile */}
    //     <AnimatePresence>
    //       {popup && (
    //         <motion.div
    //           ref={sidebarRef}
    //           key="profile-popup"
    //           initial={{ opacity: 0, y: -10 }}
    //           animate={{ opacity: 1, y: 0 }}
    //           exit={{ opacity: 0, y: -10 }}
    //           transition={{ duration: 0.3 }}
    //           className='absolute top-full right-5 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50'>
    //           <div
    //             className='absolute -top-4 right-2 text-gray-700 dark:text-white text-2xl cursor-pointer'
    //             onClick={() => setPopup(false)}>
    //             <IoMdArrowDropup />
    //           </div>
    //           <div className='flex items-center gap-3 mb-3'>
    //             <img
    //               src={`${BASE_IMAGE_PROFILE}/${profile}`}
    //               alt='profile'
    //               className='w-10 h-10 rounded-full object-cover border-2 border-primary' />
    //             <div>
    //               <p className='text-sm font-semibold text-gray-700 dark:text-white'>{user}</p>
    //               <p className='text-xs text-gray-500 dark:text-gray-400'>{role}</p>
    //             </div>
    //           </div>

    //           <div className="border-t pt-3 mt-3">
    //             <button
    //               onClick={handleLogout}
    //               className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 dark:text-red-400 rounded-md transition">
    //               <FiLogOut className="text-lg" />
    //               <span>Logout</span>
    //             </button>
    //           </div>
    //         </motion.div>
    //       )}
    //     </AnimatePresence>
    //   </div>
    // </div>


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
          <div className='flex items-center gap-2 cursor-pointer' onClick={() => router.push(`/main`)}>
            <Image src={logo} alt="Logo" width={40} height={40} className="w-12 h-12 object-cover" />
            <span className='font-lato text-primary text-2xl font-extrabold'>koseeker</span>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-4 font-semibold text-[14px] text-[#303030]'>
              <button onClick={() => toggleMenu('cari')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Cari Apa?
                <IoMdArrowDropdown className={`text-lg transition-transform mt-1 ${activeMenu === 'cari' ? 'rotate-180' : ''}`} />
              </button>
              {activeMenu == "cari" && (
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
              <button onClick={() => toggleMenu('lainnya')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Lainnya
                <IoMdArrowDropdown className={`text-lg transition-transform ${activeMenu === 'lainnya' ? 'rotate-180' : ''}`} />
              </button>
              {activeMenu === 'lainnya' && (
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