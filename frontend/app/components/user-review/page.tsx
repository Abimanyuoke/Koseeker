/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { IReview } from '../../types';
import { BASE_IMAGE_PROFILE } from '../../../global';
import { ButtonSuccess } from '../button-type';
import { useReviews } from './useReviews';


interface ReviewStatsProps {
    reviews: IReview[];
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ reviews }) => {
    const totalReviews = reviews.length;

    return (
        <div className="bg-white mb-6">
            {/* Review Count */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    (
                    <span className="text-xl font-bold text-gray-900 ">{totalReviews}</span>
                    <span className="text-gray-900">
                        {totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                    )

                    {totalReviews > 0 && (
                        <div className="text-sm text-gray-600">
                            <p>Lihat pengalaman penghuni lainnya di kos ini</p>
                        </div>
                    )}
                </div>
            </div>
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
        <div className=" py-6 last:">
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
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                                {review.user ? getInitials(review.user.name) : 'A'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 ">
                            {review.user?.name || 'Anonim'}
                        </h4>
                    </div>

                    {/* Time */}
                    <p className="text-sm text-gray-500 mb-3">
                        {formatDate(review.createdAt)}
                    </p>

                    {/* Comment */}
                    <p className="text-gray-700 leading-relaxed mb-4">
                        {review.comment}
                    </p>

                    {/* Owner Reply */}
                    {showOwnerReply && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-green-600">
                                    Balasan dari Pemilik kos
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(review.updatedAt)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">
                                Halo, Kakak. Terima kasih atas review dan ratingnya. Kami sangat senang mendengar Anda
                                nyaman selama bersama kami.
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
    kosId: number;
    userId?: number;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ kosId, userId }) => {
    const { reviews, loading, error, userHasReviewed, createReview } = useReviews({ kosId, userId });

    const handleAddReview = async (comment: string) => {
        if (!userId) {
            throw new Error('User not authenticated');
        }
        await createReview({ kosId, userId, comment });
    };

    if (loading) {
        return (
            <div className="space-y-4 w-full animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
                <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50  dark: rounded-lg p-4">
                <div className="text-red-700 dark:text-red-300 text-center">
                    <p className="font-medium">Gagal memuat review</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            {/* Review Stats */}
            <ReviewStats reviews={reviews} />

            {/* Quick Comment Form */}
            <QuickCommentForm
                kosId={kosId}
                userId={userId}
                onSubmit={handleAddReview}
                userHasReviewed={userHasReviewed} />

            {/* Review List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Belum ada review
                        </h3>
                        <p className="text-gray-500">
                            Jadilah yang pertama memberikan review untuk kos ini!
                        </p>
                    </div>
                ) : (
                    reviews.map((review: IReview) => (
                        <ReviewComment key={review.id} review={review} />
                    ))
                )}
            </div>
        </div>
    );
};

// Quick Comment Form Component
interface QuickCommentFormProps {
    kosId: number;
    userId?: number;
    onSubmit: (comment: string) => Promise<void>;
    userHasReviewed: boolean;
}

const QuickCommentForm: React.FC<QuickCommentFormProps> = ({
    userId,
    onSubmit,
    userHasReviewed
}) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            alert('Silakan login terlebih dahulu untuk memberikan review');
            return;
        }

        if (userHasReviewed) {
            alert('Anda sudah memberikan review untuk kos ini');
            return;
        }

        if (comment.trim().length < 10) {
            alert('Komentar minimal 10 karakter');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(comment.trim());
            setComment('');
            alert('Review berhasil ditambahkan!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Gagal menambahkan review. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!userId) {
        return (
            <div className="bg-yellow-50  rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Login terlebih dahulu untuk memberikan review.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (userHasReviewed) {
        return (
            <div className="bg-blue-50  rounded-lg p-4 mb-6">
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
        );
    }

    return (
        <div className="bg-white mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 ">
                Tulis Review Anda
            </h3>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Bagaimana pengalaman Anda di kos ini? Ceritakan untuk membantu orang lain..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3  rounded-lg focus:outline-none border border-slate-300 bg-white text-gray-900  placeholder-gray-500"
                        disabled={isSubmitting} />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">
                            {comment.length}/500 karakter (minimal 10 karakter)
                        </p>
                        <ButtonSuccess
                            type="submit"
                            className={`px-6 py-2 ${isSubmitting || comment.trim().length < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting || comment.trim().length < 10}>
                            {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
                        </ButtonSuccess>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReviewComponent;
