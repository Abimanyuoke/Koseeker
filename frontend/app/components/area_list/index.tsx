import React from "react";
import Link from "next/link";

interface Props {
    area: string;
    linkTo: string;
    text: string;

}

export default function Arealist({ area, linkTo, text }: Props) {
    return (
        <div>
            <h2>Area List</h2>
            <ul>
                <Link key={area} href={`${linkTo}/${area}`}>
                    <span>{text}</span>
                </Link>
            </ul>
        </div>
    )
}