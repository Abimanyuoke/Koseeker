"use client";
import React from "react";
import Arealist from "../components/area_list";

export default function Area() {
    const areasData = [
        {
            province: "Jawa Timur",
            cities: ["Surabaya", "Malang", "Sidoarjo", "Jember", "Kediri", "Pasuruan"]
        },
        {
            province: "Jawa Barat",
            cities: ["Bandung", "Bogor", "Bekasi", "Depok", "Cirebon", "Sukabumi", "Sumedang"]
        },
        {
            province: "Jawa Tengah",
            cities: ["Semarang", "Solo", "Yogyakarta", "Purwokerto", "Tegal", "Magelang"]
        }
    ];

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <Arealist areas={areasData} linkTo={`/area`} />
            </div>
        </div>
    )
}