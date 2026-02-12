"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { storeCookie } from "@/lib/client-cookies"
import { toast } from "sonner"

export default function AuthCallback() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        if (status === "unauthenticated") {
            router.replace("/auth/login")
            return
        }

        if (session?.accessToken) {
            console.log("Session data:", session)
            console.log("Profile picture from session:", session.user?.image)

            localStorage.setItem("token", session.accessToken)
            localStorage.setItem("id", session.userId || "")
            localStorage.setItem("name", session.user?.name || "")
            localStorage.setItem("role", session.userRole || "")
            localStorage.setItem("profile_picture", session.user?.image || "")

            storeCookie("token", session.accessToken)
            storeCookie("id", session.userId || "")
            storeCookie("name", session.user?.name || "")
            storeCookie("role", session.userRole || "")
            storeCookie("profile_picture", session.user?.image || "")

            toast.success("Google login success!", { duration: 2000 })

            setTimeout(() => {
                router.replace("/home")
            }, 1000)
        } else {
            toast.error("Login failed. Please try again.", { duration: 2000 })
            router.replace("/auth/login")
        }
    }, [session, status, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyan-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your login...</p>
            </div>
        </div>
    )
}