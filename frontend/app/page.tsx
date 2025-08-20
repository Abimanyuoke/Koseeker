"use client";
import React from 'react';
import AOS from "aos";
import "aos/dist/aos.css"
// import Footer from '../components/footer/page';
import Navbar from './components/navbar_main/page';



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
        <div className='bg-white'>
            <Navbar />
            {/* <Footer /> */}
        </div>
    )
};

export default Main
