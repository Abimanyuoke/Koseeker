/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from "react"
import { Toaster } from "sonner"
import { getCookies, removeCookie } from '@/lib/client-cookies'
import { clearAuthData } from '../../lib/auth'
import { FiLogOut, FiHome, FiLayers, FiCalendar, FiUsers, FiSettings } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BASE_IMAGE_PROFILE } from '@/global'

type PropsLayout = {
    children: React.ReactNode
}

const getProfileImageUrl = (profilePicture: string) => {
    if (!profilePicture) {
        return "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23grad)' /%3e%3ctext x='50' y='50' font-family='Arial, sans-serif' font-size='36' fill='white' text-anchor='middle' dominant-baseline='middle'%3e👤%3c/text%3e%3c/svg%3e";
    }

    if (profilePicture.startsWith('https://')) return profilePicture
    return `${BASE_IMAGE_PROFILE}/${profilePicture}`
}

const RootLayout = ({ children }: PropsLayout) => {
    const router = useRouter()
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [profile, setProfile] = useState<string>('')
    const [user, setUser] = useState<string>('')
    const [role, setRole] = useState<string>('')

    useEffect(() => {
        const profilePicture = getCookies('profile_picture') || ''
        const name = getCookies('name') || ''
        const r = getCookies('role') || ''
        setProfile(profilePicture)
        setUser(name)
        setRole(r)
    }, [])

    const handleLogout = () => {
        removeCookie('token')
        removeCookie('id')
        removeCookie('name')
        removeCookie('role')
        removeCookie('profile_picture')
        clearAuthData()
        router.replace('/auth/login')
    }

    return (
        <div className="min-h-screen bg-white">
            <Toaster position="top-right" richColors />

            {/* Mobile hamburger (fixed) */}
            <button
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open manager menu"
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Desktop fixed sidebar */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white text-gray-900 p-6 shadow border-r">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden border">
                        <img src={getProfileImageUrl(profile)} alt="profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold">{user || 'Manager'}</div>
                        <div className="text-xs text-gray-500">{role || 'Owner'}</div>
                    </div>
                </div>

                <nav className="mt-4">
                    <div className="space-y-2">
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 w-full cursor-pointer" onClick={() => router.replace('/manager')}><FiHome className="w-5 h-5 text-gray-600" /><span className="text-sm">Dashboard</span></button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 w-full cursor-pointer" onClick={() => router.replace('/manager/kos')}><FiLayers className="w-5 h-5 text-gray-600" /><span className="text-sm">Kelola Kos</span></button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 w-full cursor-pointer" onClick={() => router.replace('/manager/facilities')}><FiCalendar className="w-5 h-5 text-gray-600" /><span className="text-sm">Fasilitas</span></button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 w-full cursor-pointer" onClick={() => router.replace('/manager/data_keuangan')}><FiUsers className="w-5 h-5 text-gray-600" /><span className="text-sm">Data Penghasilan</span></button>
                        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 w-full cursor-pointer" onClick={() => router.replace('/manager/pengaturan')}><FiSettings className="w-5 h-5 text-gray-600" /><span className="text-sm">Pengaturan</span></button>
                    </div>
                </nav>

                <div className="mt-auto pt-4">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"><FiLogOut className="text-gray-700" /> Logout</button>
                </div>
            </aside>

            <AnimatePresence>
                {mobileSidebarOpen && (
                    <div>
                        <motion.div key="mgr-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileSidebarOpen(false)} />
                        <motion.aside key="mgr-drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-lg p-6 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border"><img src={getProfileImageUrl(profile)} alt="profile" className="w-full h-full object-cover" /></div>
                                    <div>
                                        <div className="font-semibold">{user || 'Manager'}</div>
                                        <div className="text-xs text-gray-500">{role || 'Owner'}</div>
                                    </div>
                                </div>
                                <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">✕</button>
                            </div>
                            <nav className="space-y-2">
                                <button onClick={() => setMobileSidebarOpen(false)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"><FiHome className="w-5 h-5 text-gray-600" /><span>Dashboard</span></button>
                                <button onClick={() => setMobileSidebarOpen(false)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"><FiLayers className="w-5 h-5 text-gray-600" /><span>Kelola Kos</span></button>
                                <button onClick={() => setMobileSidebarOpen(false)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"><FiCalendar className="w-5 h-5 text-gray-600" /><span>Booking</span></button>
                                <button onClick={() => setMobileSidebarOpen(false)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"><FiUsers className="w-5 h-5 text-gray-600" /><span>Data Penghasilan</span></button>
                                <button onClick={() => setMobileSidebarOpen(false)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"><FiSettings className="w-5 h-5 text-gray-600" /><span>Pengaturan</span></button>
                            </nav>

                            <div className="mt-6 border-t pt-4">
                                <button onClick={() => { setMobileSidebarOpen(false); handleLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"><FiLogOut className="text-gray-700" /> Logout</button>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            <div className="lg:ml-[260px]">
                {children}
            </div>
        </div>
    )
}

export default RootLayout