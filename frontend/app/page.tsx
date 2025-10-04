"use client";
import React from 'react';
import AOS from "aos";
import "aos/dist/aos.css"
import Home from './home/page';



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
            <Home />
        </div>
    )
};

export default Main
