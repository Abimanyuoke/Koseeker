'use client';

import React, { useState } from 'react';
import { IReview } from '../../types';
import { BASE_IMAGE_PROFILE } from '../../../global';

// Star Rating Component
interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    readonly = true,
    onRatingChange
}) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    const getSizeClass = () => {
        switch (size) {
            case 'sm': return 'w-4 h-4';
            case 'lg': return 'w-6 h-6';
            default: return 'w-5 h-5';
        }
    };

    const handleStarClick = (starRating: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const handleStarHover = (starRating: number) => {
        if (!readonly) {
            setHoveredRating(starRating);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoveredRating(0);
        }
    };

    return (
        <div className="flex gap-1" onMouseLeave={handleMouseLeave}>
            {[...Array(maxRating)].map((_, index) => {
                const starRating = index + 1;
                const isFilled = starRating <= (hoveredRating || rating);

                return (
                    <svg
                        key={index}
                        className={`${getSizeClass()} ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            } ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => handleStarClick(starRating)}
                        onMouseEnter={() => handleStarHover(starRating)}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            })}
        </div>
    );
};

// Review Statistics Component
interface ReviewStatsProps {
    reviews: IReview[];
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ reviews }) => {
    const totalReviews = reviews.length;

    return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-6">
            {/* Review Count */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-green-600 text-2xl font-bold">💬</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalReviews}</span>
                    <span className="text-gray-600 dark:text-gray-300">
                        {totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                </div>
            </div>

            {totalReviews > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Lihat pengalaman penghuni lainnya di kos ini</p>
                </div>
            )}
        </div>
    );
};

// Individual Review Comment Component
interface ReviewCommentProps {
    review: IReview;
    showOwnerReply?: boolean;
}

const ReviewComment: React.FC<ReviewCommentProps> = ({ review, showOwnerReply = false }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 hari yang lalu';
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} bulan yang lalu`;
        return `${Math.ceil(diffDays / 365)} tahun yang lalu`;
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="border-b border-gray-100 dark:border-gray-700 py-6 last:border-b-0">
            {/* User Info */}
            <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                    {review.user?.profile_picture ? (
                        <img
                            src={`${BASE_IMAGE_PROFILE}/${review.user.profile_picture}`}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {review.user ? getInitials(review.user.name) : 'A'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.user?.name || 'Anonim'}
                        </h4>
                    </div>

                    {/* Time */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {formatDate(review.createdAt)}
                    </p>

                    {/* Comment */}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {review.comment}
                    </p>

                    {/* Owner Reply */}
                    {showOwnerReply && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Balasan dari Pemilik kos
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(review.updatedAt)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Halo, Kakak. Terima kasih atas review dan ratingnya. Kami sangat senang mendengar Anda
                                nyaman selama bersama kami :)
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Review Component
interface ReviewComponentProps {
    reviews?: IReview[];
    kosId?: number;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({
    reviews = [],
    kosId
}) => {
    return (
        <div className="w-full">
            {/* Review Statistics */}
            <ReviewStats reviews={reviews} />

            {/* Reviews List */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Reviews</h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.934-6.76A8.001 8.001 0 0121 12z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">Belum ada review</p>
                        <p className="text-gray-500 dark:text-gray-400">Jadilah yang pertama memberikan review untuk kos ini!</p>
                    </div>
                ) : (
                    <div>
                        {reviews.map((review, index) => (
                            <ReviewComment
                                key={review.id}
                                review={review}
                                showOwnerReply={index === 0} // Show owner reply for first review as example
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewComponent;
