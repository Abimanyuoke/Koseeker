import React, { useState } from "react";

export default function Blog() {

    const [open, setOpen] = useState(false);
    
    const handleToggle = () => {
        setOpen(!open);
    }

    return (
        <div className="bg-[#f5f5f5] font-lato">
            <div className="max-w-7xl mx-auto py-20 px-10">
                <div className="flex flex-col">
                    <h1>Koseeker - Aplikasi Anak Kos No. 1 di Indonesia</h1>
                    <p>Koseeker memanfaatkan teknologi untuk berkembang dari aplikasi cari kos menjadi aplikasi yang memudahkan calon anak kos untuk booking properti kos dan juga melakukan pembayaran kos. Saat ini kami memiliki lebih dari 2 juta kamar kos yang tersebar di lebih dari 140 kota di seluruh Indonesia. Koseeker juga menyediakan layanan manajemen properti, bernama Singgahsini dan Apik, untuk menjawab kebutuhan calon penghuni yang menginginkan kos eksklusif atau kos murah. Koseeker berusaha untuk bisa terus menyajikan daftar rumah kos dengan data ketersediaan kamar yang akurat, fasilitas kos terperinci, dilengkapi dengan foto serta detail harga kos, dan kemudahan survei via fitur virtual tour agar calon penghuni mendapatkan kenyamanan dalam proses pencarian dan booking kos.</p>
                    <div>
                        <button onClick={() => handleToggle()} className="">
                            Fitur yang didapatkan di Koseeker 
                            {open ? (
                                <span className="ml-2">&#9650;</span> // Panah ke atas
                            ) : (
                                <span className="ml-2">&#9660;</span> // Panah ke bawah
                            )}
                        </button>
                    </div>
                    {open && (
                        <div>
                            <ul>
                                <ol type="a">Fitur Pencarian</ol>
                                <p>Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.</p>
                                <ol type="a">Fitur Pencarian</ol>
                                <p>Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.</p>
                                <ol type="a">Fitur Pencarian</ol>
                                <p>Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.</p>
                                <ol type="a">Fitur Pencarian</ol>
                                <p>Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.</p>
                                <ol type="a">Fitur Pencarian</ol>
                                <p>Di kolom pencarian, kamu bisa cari kos di sekitarmu atau kos di seluruh daerah di Indonesia dengan memasukkan keyword, seperti kos dekat Kampus/Universitas di masing-masing kota, cari kos di Jogja, Depok, Jakarta, Surabaya, Bandung, dan kota besar lainnya atau cari kos di sekitar lokasi saya saat ini.</p>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}