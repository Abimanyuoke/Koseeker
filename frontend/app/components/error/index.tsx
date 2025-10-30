import React from "react";
import Image from "next/image";

export default function ErrorComponent() {
    return (
        <div className="h-screen w-full font-lato">
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full">
                <Image src="/images/logo_sad.svg" alt="Error Image" width={250} height={400} />
                <div className="flex flex-col items-center text-center px-4">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! Sepertinya Masih Dalam Tahap Pengembangan</h1>
                    <p className="text-lg text-gray-600">"Tahap pengembangan saat ini mencakup desain antarmuka dan pengalaman pengguna."</p>
                </div>
            </div>
        </div>
    );
}