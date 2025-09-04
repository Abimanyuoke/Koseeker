import React, { useState } from "react";

export default function Blog() {

    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
    }

    return (
        <div className="bg-[#f5f5f5] font-lato">
            <div className="max-w-7xl mx-auto py-20 px-6 lg:px-10">
                <div className="flex flex-col">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                        Koseeker - Aplikasi Anak Kos No. 1 di Indonesia
                    </h1>
                    <p className="text-gray-700 leading-relaxed text-base lg:text-lg mb-8">
                        Koseeker memanfaatkan teknologi untuk berkembang dari aplikasi cari kos menjadi aplikasi yang memudahkan calon anak kos untuk booking properti kos dan juga melakukan pembayaran kos. Saat ini kami memiliki lebih dari 2 juta kamar kos yang tersebar di lebih dari 140 kota di seluruh Indonesia. Koseeker juga menyediakan layanan manajemen properti, bernama Singgahsini dan Apik, untuk menjawab kebutuhan calon penghuni yang menginginkan kos eksklusif atau kos murah. Koseeker berusaha untuk bisa terus menyajikan daftar rumah kos dengan data ketersediaan kamar yang akurat, fasilitas kos terperinci, dilengkapi dengan foto serta detail harga kos, dan kemudahan survei via fitur virtual tour agar calon penghuni mendapatkan kenyamanan dalam proses pencarian dan booking kos.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={() => handleToggle()}
                            className="flex items-center justify-between w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
                        >
                            <span className="text-lg font-semibold text-gray-800">
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
                        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                            <ol className="space-y-4 list-none">
                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">a. Fitur Pencarian</span>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.
                                    </p>
                                </li>

                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">b. Filter Pencarian</span>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        Cari kos berdasarkan fasilitas kos yang kamu mau, lebih mudah dengan filter berdasarkan Kos AC, Kos Kamar mandi dalam, Kos Wifi. Bisa juga pilih kos dengan tipe kos, mulai dari Kos Harian, Kos Bulanan hingga Kos Tahunan. Mau cari Kos Bebas, Kos Pasutri, Kos Putra, Kos Putri, Kos Campur juga bisa.
                                    </p>
                                </li>

                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">c. Chat dengan Penyewa</span>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        Terhubung langsung dengan pemilik kos dan bisa bertanya lebih lanjut mengenai info kos melalui fitur chat di Mamikos.
                                    </p>
                                </li>

                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">d. Sewa Langsung via Mamikos</span>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        Bisa langsung mengajukan sewa kos di aplikasi atau website Mamikos. Bahkan, kamu bisa mulai sewa kos dari 3 bulan sebelum masuk kosan. Transaksi lebih aman, tanpa takut kamarnya penuh kedatangan orang lain.
                                    </p>
                                </li>

                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">e. Virtual Tour</span>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        Virtual Tour Mamikos adalah media foto lingkungan kos dalam 360° yang diperuntukkan untuk kamu, para pencari kos, agar dapat mengetahui kondisi lingkungan kos secara detail tanpa harus survei langsung. Fitur ini cocok jadi andalanmu yang butuh kosan tapi tidak punya waktu untuk survei langsung, karena fitur ini menampilkan keadaan kos secara lengkap dari berbagai sudut.
                                    </p>
                                </li>

                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">f. Pembayaran via Mamikos</span>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}