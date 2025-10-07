"use client"

import React from "react"
import AOS from "aos";
import "aos/dist/aos.css"
import { Toaster } from "sonner";
import Footer from "../components/footer/page";
import Navbar from "../components/navbar_main/page";


type PropsLayout = {
    children: React.ReactNode
}

const RootLayout = ({ children }: PropsLayout) => {

    React.useEffect(() => {
        AOS.init({
            offset: 100,
            duration: 800,
            easing: "ease-in-out",
            delay: 100,
        });
        AOS.refresh();
    }, []);


    return (
        <div className="h-svh">
            <Toaster position="top-right" richColors/>
            <Navbar/>
            {/* <NavbarMain/> */}
            {children}
            <Footer/> 
        </div>
    )
}

export default RootLayout