'use client'

import { useState, useEffect } from 'react'
import NotificationCenter from './NotificationCenter'
import { BASE_API_URL } from '@/global'

interface NotificationBellProps {
    className?: string
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchUnreadCount()

        const interval = setInterval(fetchUnreadCount, 5000)

        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token found, skipping notification fetch')
                return
            }

            const response = await fetch(`${BASE_API_URL}/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                if (data.status === true && typeof data.count === 'number') {
                    setUnreadCount(data.count)
                } else {
                    console.warn('Unexpected response structure:', data)
                    setUnreadCount(0)
                }
            } else {
                // Handle error responses from the server
                console.error('Server error fetching unread count:', {
                    status: response.status,
                    message: data.message || 'Unknown error'
                })
                if (response.status === 401 || response.status === 403) {
                    // Token might be invalid, clear it
                    localStorage.removeItem('token')
                }
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err)
            // Network error or parsing error - don't update count
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
        <div>
            <button
                onClick={handleClick}
                className={`relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg ${className}`}
                title="Notifikasi" suppressHydrationWarning>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                {/* Notification badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            <NotificationCenter isOpen={isOpen} onClose={handleClose} />
        </div>
    )
}
