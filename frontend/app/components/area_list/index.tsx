import React from "react";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";

interface AreaData {
    province: string;
    cities: string[];
}

interface Props {
    areas: AreaData[];
    linkTo: string;
}

export default function Arealist({ areas, linkTo }: Props) {
    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-10">Pilih Area Kos di Pulau Jawa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 w-[700px] gap-6">
                {areas.map((area) => (
                    <div
                        key={area.province}
                        className="bg-white rounded-xl py-6">
                        {/* Province Header */}
                        <div className="flex items-center gap-2 mb-4 pb-3">
                            <FaMapMarkerAlt className="text-gray-500 text-xl" />
                            <h3 className="text-xl font-bold text-gray-800">{area.province}</h3>
                        </div>

                        {/* Cities List */}
                        <div className="space-y-2">
                            {area.cities.map((city) => (
                                <Link
                                    key={city}
                                    href={`${linkTo}/${city.toLowerCase()}`}
                                    className="block">
                                    <div className="flex items-center justify-between p-3 rounded-lg cursor-pointer group">
                                        <span className="text-gray-700 font-medium group-hover:text-gray-900">
                                            Kos {city}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}