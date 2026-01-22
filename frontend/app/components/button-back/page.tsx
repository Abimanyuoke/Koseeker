import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineArrowBackIos } from "react-icons/md";

export default function ButtonBack() {
    const router = useRouter();
    return (
        <div>
            <button className="flex items-center text-slate-400 gap-2 mb-1 hover-text cursor-pointer hover:text-slate-600" onClick={() => router.push("/home")}>
                <MdOutlineArrowBackIos />
                <span>Home</span>
            </button>
        </div>
    )
}