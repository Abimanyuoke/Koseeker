import React, { useState } from "react";

export default function Blog() {

    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
    }

    return (
        <div className="bg-[#f5f5f5] font-lato">
            <div className="max-w-7xl mx-auto py-10 px-6 lg:px-10">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-gray-900 mb-6 text-center">
                        Koseeker - Aplikasi Anak Kos No. 1 di Indonesia
                    </h1>
                    <p className="text-gray-700 leading-relaxed text-base lg:text-base mb-5">
                        Koseeker memanfaatkan teknologi untuk berkembang dari aplikasi cari kos menjadi aplikasi yang memudahkan calon anak kos untuk booking properti kos dan juga melakukan pembayaran kos. Saat ini kami memiliki lebih dari 2 juta kamar kos yang tersebar di lebih dari 140 kota di seluruh Indonesia. Koseeker juga menyediakan layanan manajemen properti, bernama Singgahsini dan Apik, untuk menjawab kebutuhan calon penghuni yang menginginkan kos eksklusif atau kos murah. Koseeker berusaha untuk bisa terus menyajikan daftar rumah kos dengan data ketersediaan kamar yang akurat, fasilitas kos terperinci, dilengkapi dengan foto serta detail harga kos, dan kemudahan survei via fitur virtual tour agar calon penghuni mendapatkan kenyamanan dalam proses pencarian dan booking kos.
                    </p>
                    <div>
                        <button
                            onClick={() => handleToggle()}
                            className="flex items-center justify-center w-full p-4 duration-200 gap-3">
                            <span className="text-xl font-semibold text-gray-900 hover:text-gray-600 cursor-pointer">
                                Fitur yang dapat dimanfaatkan di Mamikos
                            </span>
                            {open ? (
                                <svg className="w-5 h-5 text-gray-600 transform rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {open && (
                        <div className="mt-6 p-6">
                            <ol className="space-y-6 text-base" style={{ listStyleType: 'lower-alpha' }}>
                                <li className="text-gray-700">
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Fitur Pencarian</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.
                                        </p>
                                    </div>
                                </li>

                                <li className="text-gray-700">
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Filter Pencarian</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Cari kos berdasarkan fasilitas kos yang kamu mau, lebih mudah dengan filter berdasarkan Kos AC, Kos Kamar mandi dalam, Kos Wifi. Bisa juga pilih kos dengan tipe kos, mulai dari Kos Harian, Kos Bulanan hingga Kos Tahunan. Mau cari Kos Bebas, Kos Pasutri, Kos Putra, Kos Putri, Kos Campur juga bisa.
                                        </p>
                                    </div>
                                </li>

                                <li className="text-gray-700">
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Chat dengan Penyewa</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Terhubung langsung dengan pemilik kos dan bisa bertanya lebih lanjut mengenai info kos melalui fitur chat di Mamikos.
                                        </p>
                                    </div>
                                </li>

                                <li className="text-gray-700">
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Sewa Langsung via Mamikos</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Bisa langsung mengajukan sewa kos di aplikasi atau website Mamikos. Bahkan, kamu bisa mulai sewa kos dari 3 bulan sebelum masuk kosan. Transaksi lebih aman, tanpa takut kamarnya penuh kedatangan orang lain.
                                        </p>
                                    </div>
                                </li>

                                <li className="text-gray-700">
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Virtual Tour</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Virtual Tour Mamikos adalah media foto lingkungan kos dalam 360° yang diperuntukkan untuk kamu, para pencari kos, agar dapat mengetahui kondisi lingkungan kos secara detail tanpa harus survei langsung. Fitur ini cocok jadi andalanmu yang butuh kosan tapi tidak punya waktu untuk survei langsung, karena fitur ini menampilkan keadaan kos secara lengkap dari berbagai sudut.
                                        </p>
                                    </div>
                                </li>

                                <li className="text-gray-700">
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 mb-2">Pembayaran via Mamikos</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Fitur pembayaran yang memudahkan transaksi sewa kos secara online dengan aman dan terpercaya.
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}