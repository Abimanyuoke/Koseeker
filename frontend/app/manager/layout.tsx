"use client"

import React from "react"
import { Toaster } from "sonner";


type PropsLayout = {
    children: React.ReactNode
}

const RootLayout = ({ children }: PropsLayout) => {

    return (
        <div>
            <Toaster position="top-right" richColors/>
            {children}
        </div>
    )
}

export default RootLayout