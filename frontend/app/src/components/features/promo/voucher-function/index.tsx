/* eslint-disable @next/next/no-img-element */
import React from "react";

    export default function Voucher({ img, alt }: { img: string; alt: string }) {
    return (
        <div className="px-10">
            <img src={img} alt={alt} width={800} height={300} className=" h-auto object-cover" />
        </div>
    )
}