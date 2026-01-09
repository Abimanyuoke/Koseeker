"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const validCities = [
    "surabaya", "malang", "sidoarjo", "jember", "kediri", "pasuruan",
    "bandung", "bogor", "bekasi", "depok", "cirebon", "sukabumi",
    "semarang", "solo", "yogyakarta", "purwokerto", "tegal", "magelang"
];

export default function CityPage({ params }: { params: Promise<{ city: string }> }) {
    const router = useRouter();
    const { city } = use(params);
    const cityName = city.toLowerCase();

    useEffect(() => {
        if (!validCities.includes(cityName)) {
            router.push("/not-found");
        }
    }, [cityName, router]);

    if (!validCities.includes(cityName)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Kos di {city.charAt(0).toUpperCase() + city.slice(1)}
                </h1>
                <p className="text-gray-600">
                    Halaman untuk menampilkan daftar kos di {city}
                </p>

                <div className="h-full mt-6 w-full font-lato">
                    <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full">
                        <Image src="/images/logo_sad.svg" alt="Error Image" width={250} height={400} />
                        <div className="flex flex-col items-center text-center px-4">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! Sepertinya Masih Dalam Tahap Pengembangan</h1>
                            <p className="text-lg text-gray-600">Tahap pengembangan saat ini mencakup desain antarmuka dan pengalaman pengguna.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
