import React from "react"
export const metadata = {
    title: 'Landing Page',
    description: 'Praktikum SMK Telkom Malang',
}

type PropsLayout = {
    children: React.ReactNode
}

const RootLayout = ({ children }: PropsLayout) => {
    return (
        <div className="overflow-x-hidden">
            {children}
        </div>
    )
}

export default RootLayout
