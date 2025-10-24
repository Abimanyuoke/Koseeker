"use client";
import React from "react";
import Arealist from "../components/area_list";

export default function Area() {
    return (
        <div>
            <Arealist area="malang" linkTo="/area" text="Kos Malang" />
        </div>
    )
}