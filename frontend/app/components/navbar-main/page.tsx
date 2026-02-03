/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useRef, useState } from 'react'
import { getCookies, removeCookie } from "@/lib/client-cookies";
import { useEffect } from "react";
import { clearAuthData } from "@/lib/auth";
import { BASE_IMAGE_PROFILE } from "../../../global"
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { useRouter } from 'next/navigation';
import { LuCalendarDays } from 'react-icons/lu';
import { PiDeviceMobile } from 'react-icons/pi';
import { AnimatePresence, motion } from 'framer-motion';
import { IoSearch } from 'react-icons/io5';
import { FiLogOut } from 'react-icons/fi';
import NotificationBell from '../notification/NotificationBell';
import Search from "./search";
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../../public/images/logo.svg";

const Navbar = () => {

  const [popup, setPopup] = useState(false);
  const [profile, setProfile] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false);
  const [activeDown, setActiveDown] = useState<string | null>(null);
  const cariDropdownRef = useRef<HTMLDivElement>(null)
  const lainnyaDropdownRef = useRef<HTMLDivElement>(null)

  const toggleDown = (down: string) => {
    setActiveDown((prev) => (prev === down ? null : down));
  };

  // Function to get correct profile image URL
  const getProfileImageUrl = (profilePicture: string) => {
    if (!profilePicture) {
      console.log("No profile picture, returning default avatar");
      // Return default avatar if no profile picture
      return "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grad)' /%3e%3ctext x='50' y='50' font-family='Arial, sans-serif' font-size='36' fill='white' text-anchor='middle' dominant-baseline='middle'%3e👤%3c/text%3e%3c/svg%3e";
    }

    // Check if it's a Google profile picture URL (starts with https://)
    if (profilePicture.startsWith('https://')) {
      console.log("Google profile picture detected, returning:", profilePicture);
      return profilePicture;
    }

    // If it's a local file, use the BASE_IMAGE_PROFILE path
    const localPath = `${BASE_IMAGE_PROFILE}/${profilePicture}`;
    console.log("Local file detected, returning:", localPath);
    return localPath;
  };

  const handleLogout = () => {
    removeCookie("token");
    removeCookie("id");
    removeCookie("name");
    removeCookie("role");
    removeCookie("profile_picture");
    clearAuthData();

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
      // Close profile popup if clicked outside
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setPopup(false);
      }

      // Close "Cari Apa?" dropdown if clicked outside
      if (cariDropdownRef.current && !cariDropdownRef.current.contains(e.target as Node)) {
        if (activeDown === 'cari') {
          setActiveDown(null);
        }
      }

      // Close "Lainnya" dropdown if clicked outside
      if (lainnyaDropdownRef.current && !lainnyaDropdownRef.current.contains(e.target as Node)) {
        if (activeDown === 'lainnya') {
          setActiveDown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDown]);

  useEffect(() => {
    const profilePicture = getCookies("profile_picture") || "";
    const userName = getCookies("name") || "";
    const userRole = getCookies("role") || "";

    console.log("Navbar useEffect - Profile picture from cookies:", profilePicture);
    console.log("Navbar useEffect - User name:", userName);
    console.log("Navbar useEffect - User role:", userRole);

    setProfile(profilePicture);
    setUser(userName);
    setRole(userRole);
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
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center gap-4 font-semibold text-xs text-gray-500'>
          <div className='flex items-center text-xs gap-2 py-4 cursor-pointer'>
            <PiDeviceMobile className='text-base' />
            Download App
          </div>
          <div className='flex items-center text-xs gap-2 cursor-pointer' onClick={() => router.push('/kos')}>
            <LuCalendarDays className='text-base' />
            Sewa Kos
          </div>
        </div>
        <div className='flex items-center justify-between py-3 relative h-[80px]'>
          <div className='flex items-center gap-2 cursor-pointer'>
            <button onClick={() => router.push('/home')} className='cursor-pointer' suppressHydrationWarning>
              <Image src={logo} alt="Logo" width={40} height={40} className="w-12 h-12 object-cover" />
            </button>
            <AnimatePresence mode="wait">
              {!scrolled ? (
                <motion.span
                  key="logo-text"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className='font-lato text-primary text-2xl font-extrabold'>
                  koseeker
                </motion.span>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1">
                  <div className="flex items-center gap-1 shadow-md border-[1px] border-[#48484819] p-2 rounded-lg">
                    <IoSearch className="text-2xl" />
                    <Search url={"/home"} search={""} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-4 font-semibold text-[14px] text-[#303030]'>
              <div ref={cariDropdownRef} className='relative'>
                <button onClick={() => toggleDown('cari')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full' suppressHydrationWarning>
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
                  </div>
                )}
              </div>
              <Link href={"/favorit"} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Favorit
              </Link>
              <Link href={'/book'} className='relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full'>
                Booking
              </Link>
              <div ref={lainnyaDropdownRef} className='relative'>
                <button onClick={() => toggleDown('lainnya')} className='flex items-center relative px-3 py-2 after:content-[""] after:absolute after:left-0 after:bottom-[-18px] after:w-0 after:h-[3px] after:rounded-t-2xl after:bg-primary after:transition-all hover:after:w-full' suppressHydrationWarning>
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

            <button className='cursor-pointer' onClick={() => handlePopup()} suppressHydrationWarning>
              <Image
                src={getProfileImageUrl(profile)}
                alt="profile image"
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  console.error("Error loading profile image:", e);
                  console.log("Failed to load image:", getProfileImageUrl(profile));
                  e.currentTarget.src = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grad)' /%3e%3ctext x='50' y='50' font-family='Arial, sans-serif' font-size='36' fill='white' text-anchor='middle' dominant-baseline='middle'%3e👤%3c/text%3e%3c/svg%3e";
                }}
                onLoad={() => {
                  console.log("Profile image loaded successfully:", getProfileImageUrl(profile));
                }} />
            </button>

            <AnimatePresence>
              {popup && (
                <motion.div
                  ref={sidebarRef}
                  key="profile-popup"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className='absolute top-full -right-24 translate-x-16 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50'>
                  <div
                    className='absolute -top-4  text-gray-700 text-2xl cursor-pointer'
                    onClick={() => setPopup(false)}>
                    <IoMdArrowDropup />
                  </div>
                  <div className='flex items-center gap-3 mb-3'>
                    <img
                      src={getProfileImageUrl(profile)}
                      alt='profile'
                      className='w-10 h-10 rounded-full object-cover border-2 border-primary'
                      onError={(e) => {
                        console.error("Error loading dropdown profile image:", e);
                        e.currentTarget.src = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grad)' /%3e%3ctext x='50' y='50' font-family='Arial, sans-serif' font-size='36' fill='white' text-anchor='middle' dominant-baseline='middle'%3e👤%3c/text%3e%3c/svg%3e";
                      }} />
                    <div>
                      <p className='text-sm font-semibold text-gray-700'>{user}</p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>{role}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 dark:text-red-400 rounded-md transition cursor-pointer" suppressHydrationWarning>
                      <FiLogOut className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar


