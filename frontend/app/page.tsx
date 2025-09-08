"use client";
import React from 'react';
import AOS from "aos";
import "aos/dist/aos.css"
import Navbar from './components/navbar_main/page';
import Home from './home/page';
import Footer from './components/footer/page';



const Main = () => {

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
        <div>
            <Navbar />
            <Home/>
            <Footer />
        </div>
    )
};

export default Main
