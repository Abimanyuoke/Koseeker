'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ReviewContainer from '@/app/components/review/ReviewContainer';
import { getCookies } from '@/lib/client-cookies';

// Example of how to use Review Component in Kos Detail Page
const KosDetailWithReviews = () => {
    const params = useParams();
    const kosId = parseInt(params.id as string);

    // Get user ID from cookies/auth (example)
    const getUserId = () => {
        try {
            const userCookie = getCookies('user');
            if (userCookie) {
                const userData = JSON.parse(userCookie);
                return userData.id;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        return undefined;
    };

    const userId = getUserId();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Your existing kos detail content here */}
            <div className="container mx-auto px-4 py-8">
                {/* Kos Information Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h1 className="text-2xl font-bold mb-4">Kos Detail Information</h1>
                    <p className="text-gray-600">
                        Informasi detail kos akan ditampilkan di sini...
                    </p>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-6">Reviews & Comments</h2>
                    <ReviewContainer
                        kosId={kosId}
                        userId={userId}
                    />
                </div>
            </div>
        </div>
    );
};

export default KosDetailWithReviews;
