'use client';

import React, { useState } from 'react';
import ReviewComponent from './page';
import ReviewForm from './ReviewForm';
import { useReviews } from './useReviews';
import { ButtonPrimary } from '../button';

interface ReviewContainerProps {
    kosId: number;
    userId?: number;
    showForm?: boolean;
}

const ReviewContainer: React.FC<ReviewContainerProps> = ({
    kosId,
    userId,
    showForm = false
}) => {
    const [showReviewForm, setShowReviewForm] = useState(showForm);
    const {
        reviews,
        loading,
        error,
        userHasReviewed,
        createReview,
        setError
    } = useReviews({ kosId, userId });

    const handleSubmitReview = async (reviewData: { comment: string }) => {
        if (!userId) {
            alert('Anda harus login terlebih dahulu untuk memberikan review');
            return;
        }

        try {
            await createReview({
                kosId,
                userId,
                comment: reviewData.comment
            });

            setShowReviewForm(false);
            alert('Review berhasil ditambahkan!');
        } catch (error) {
            console.error('Error creating review:', error);
            alert('Gagal menambahkan review. Silakan coba lagi.');
        }
    };

    const handleCancelReview = () => {
        setShowReviewForm(false);
        setError(null);
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="w-full">
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-400"
                            >
                                <span className="sr-only">Dismiss</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Review Button */}
            {userId && !userHasReviewed && !showReviewForm && (
                <div className="mb-6">
                    <ButtonPrimary
                        type="button"
                        onClick={() => setShowReviewForm(true)}
                        className="w-full sm:w-auto"
                    >
                        Tulis Review
                    </ButtonPrimary>
                </div>
            )}

            {/* Review Form */}
            {showReviewForm && userId && (
                <ReviewForm
                    kosId={kosId}
                    userId={userId}
                    onSubmit={handleSubmitReview}
                    onCancel={handleCancelReview}
                />
            )}

            {/* Already Reviewed Notice */}
            {userId && userHasReviewed && !showReviewForm && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Anda sudah memberikan review untuk kos ini.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Notice */}
            {!userId && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Login terlebih dahulu untuk memberikan review.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Display */}
            <ReviewComponent kosId={kosId} userId={userId} />
        </div>
    );
};

export default ReviewContainer;
