'use client'

import { useState, useEffect } from 'react'
import NotificationCenter from '../notification/NotificationCenter'

interface NotificationBellProps {
    className?: string
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchUnreadCount()

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)

        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch('http://localhost:5000/notifications/unread-count', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUnreadCount(data.count || 0)
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err)
        }
    }

    const handleClick = () => {
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false)
        fetchUnreadCount() // Refresh count when closing
    }

    return (
        <>
            <button
                onClick={handleClick}
                className={`relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg ${className}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5-5-5h5v-13z M12.595 6.595l.707.707L15 5.5V12h-2V7.414l-1.414 1.414-.707-.707z M3 12h9v2H3z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 8a6 6 0 01-12 0 6 6 0 0112 0zM20.485 8.485l-1.414 1.414A8 8 0 1011.515 19.9l1.414-1.414A6 6 0 1020.485 8.485z"
                    />
                </svg>

                {/* Notification badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationCenter isOpen={isOpen} onClose={handleClose} />
        </>
    )
}
