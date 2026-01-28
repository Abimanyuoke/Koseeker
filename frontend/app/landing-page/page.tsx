/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link";
import NavbarLanding from "../components/navbar-landing/page";
import { FaArrowRightLong } from "react-icons/fa6";
import { BsCheckCircleFill, BsPersonFillCheck } from "react-icons/bs";
import { AiFillInsurance } from "react-icons/ai";

export default function LandingPage() {
    return (
        <main className="font-lato">
            <NavbarLanding />
            <section className="flex items-center justify-center min-h-screen flex-col relative overflow-hidden mx-auto max-w-6xl">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-lg animate-float"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500/20 rounded-lg animate-float-alt" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-60 left-1/4 w-24 h-24 bg-green-500/20 rounded-lg animate-float-slow" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-teal-500/20 rounded-lg animate-float" style={{ animationDelay: '3s' }}></div>
                    <div className="absolute bottom-20 left-20 w-16 h-16 bg-primary/20 rounded-lg animate-float-alt" style={{ animationDelay: '4s' }}></div>
                    <div className="absolute top-[60%] right-10 w-28 h-28 bg-blue-500/20 rounded-lg animate-float-slow" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-green-500/20 rounded-lg animate-float" style={{ animationDelay: '2.5s' }}></div>
                    <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-teal-500/20 rounded-lg animate-float-alt" style={{ animationDelay: '3.5s' }}></div>
                </div>
                <div className="flex flex-col items-center md:gap-4">
                    <div className="flex items-center justify-evenly gap-2 border-[1px] border-gray-300 rounded-full px-4 py-2 mb-4">
                        <h3 className="bg-gray-200/50 px-2 py-1 rounded-full font-semibold text-base text-gray-700 backdrop-blur-sm ">Kenapa Koseeker?</h3>
                        <div className="flex items-center justify-center space-x-2 font-semibold text-base text-gray-700 cursor-pointer">
                            <span>Lihat penawaran ekslusif kami</span>
                            <FaArrowRightLong />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center leading-tight md:gap-2">
                        <h1 className="inline-block bg-gradient-to-r from-blue-500 via-green-500 to-[#008080] bg-clip-text text-center text-3xl font-bold    text-transparent md:py-2 md:text-6xl">Cari Hunian Nyamanmu</h1>
                        <h1 className="text-center text-3xl font-bold text-gray-700 md:text-6xl">Sewa Kamar Kos Paling Nyaman</h1>
                        <p className="mx-auto mt-4 text-center text-xl font-[400] text-gray-800  md:w-2/3">Layanan sewa kamar kos terbaik dengan fasilitas lengkap terpercaya serta harga terjangkau</p>
                        <Link className="mx-auto w-fit rounded-xl border bg-primary px-4 py-3 text-center font-semibold text-white md:mt-3" href={""}>Booking Sekarang</Link>
                    </div>
                </div>
            </section>
            <section className="flex items-center justify-center min-h-screen flex-col relative overflow-hidden mx-auto px-4">
                <div className="container rounded-3xl bg-secondary bg-cover bg-center p-8 text-white lg:p-16">
                    <div>
                        <h1 className="mb-4 text-center text-2xl font-extrabold lg:text-4xl">Kenapa Harus Booking Di Koseeker?</h1>
                        <p className="mx-auto w-full text-center text-white/65 lg:w-2/3 lg:text-lg">Temukan pengalaman booking terbaik dengan admin berpengalaman dan website yang dirancang khusus untukmu sesuai standar Internasional.</p>
                    </div>
                    <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row">
                        <div className="flex w-full flex-col lg:w-1/2 gap-8 ">
                            <div className="flex items-center gap-6 border-b border-white/30 pb-8">
                                <div className="w-fit rounded-full border-2 border-white p-4">
                                    {/* Icon 1 */}
                                    <BsCheckCircleFill className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold lg:text-2xl">Dikelola Koseeker: Dijamin Akurat</h1>
                                    <p className="text-sm text-white/65 lg:text-base">Fasilitas tidak sesuai dengan iklan yang kamu lihat, kami garansi refund.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 border-b border-white/30 pb-8">
                                <div className="w-fit rounded-full border-2 border-white p-3">
                                    {/* Icon 1 */}
                                    <AiFillInsurance className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold lg:text-2xl">Asuransi Khusus Penyewa</h1>
                                    <p className="text-sm text-white/65 lg:text-base">Perlindungan atas kompensasi kehilangan barang & fasilitas pada unit kamar. Disediakan oleh Penyedia Jasa Asuransi yang terdaftar OJK. S&K berlaku.</p>
                                </div></div>
                            <div className="flex items-center gap-6">
                                <div className="w-fit rounded-full border-2 border-white p-3">
                                    {/* Icon 1 */}
                                    <BsPersonFillCheck className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold lg:text-2xl">Penanganan Profesional</h1>
                                    <p className="text-sm text-white/65 lg:text-base">Tim Koseeker selalu siap membantumu. Mulai dari survei kos, pengajuan sewa, hingga selama kamu ngekos.</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <img src="/images/landing-page.jpg" alt="Kos" className="w-full object-cover rounded-lg" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}