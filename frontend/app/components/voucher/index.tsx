import React from "react";

interface VoucherProps {
    img: string;
    alt: string;
}

export default function Voucher({ img, alt }: VoucherProps) {
    return (
        <div className="px-10">
            <img src={img} alt={alt} width={800} height={300} className=" h-auto object-cover" />
        </div>
    )
}