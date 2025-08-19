"use client";
import React from 'react';
import AOS from "aos";
import "aos/dist/aos.css"
import Footer from '../components/footer/page';
import Popup from '../components/popup/page';
import Navbar from '../components/navbar_main/page';



const Main = () => {
    const [orderPopup, setOrderPopup] = React.useState(false);

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
        <div className='bg-white dark:bg-gray-900 dark:text-white duration-200'>
            <Navbar />
            <Footer />
            <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
        </div>
    )
};

export default Main
