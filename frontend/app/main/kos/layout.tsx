"use client"

import React from "react"
import AOS from "aos";
import { Toaster } from "sonner";
import Footer from "../../src/components/common/footer/page";
import Navbar from "../../src/components/common/navbar-main/page";


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
        <section>
            <div>
                <Toaster position="top-right" richColors />
                <Navbar />
                {children}
                <Footer />
            </div>
        </section>
    )
}

export default RootLayout