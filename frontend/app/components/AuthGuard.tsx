'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    redirectTo?: string
}

const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    fallback = null,
    redirectTo = '/auth/login'
}) => {
    const [isChecking, setIsChecking] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = () => {
            const isAuth = isAuthenticated()
            setAuthenticated(isAuth)
            setIsChecking(false)

            if (!isAuth) {
                router.push(redirectTo)
            }
        }

        checkAuth()
    }, [router, redirectTo])

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!authenticated) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Akses Ditolak
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Anda harus login terlebih dahulu untuk mengakses halaman ini.
                    </p>
                    <button
                        onClick={() => router.push(redirectTo)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default AuthGuard
