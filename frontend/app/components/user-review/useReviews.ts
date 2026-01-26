'use client';

import { useState, useEffect } from 'react';
import { IReview } from '../../types';
import { BASE_API_URL } from '../../../global';

interface UseReviewsProps {
    kosId?: number;
    userId?: number;
    userRole?: string;
}

export const useReviews = ({ kosId, userId, userRole }: UseReviewsProps = {}) => {
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const [canReview, setCanReview] = useState(false);

    // Fetch reviews for a specific kos
    const fetchReviewsByKos = async (kosId: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_API_URL}/review/kos/${kosId}`);
            const data = await response.json();

            if (data.status) {
                setReviews(data.data.reviews);
            } else {
                setError(data.message || 'Failed to fetch reviews');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    // Check if user has already reviewed a kos
    const checkUserReview = async (kosId: number, userId: number) => {
        try {
            const response = await fetch(`${BASE_API_URL}/review/check/${kosId}/${userId}`);
            const data = await response.json();

            if (data.status) {
                setUserHasReviewed(data.data.hasReviewed);
                return data.data.hasReviewed;
            }
        } catch (err) {
            console.error('Error checking user review:', err);
        }
        return false;
    };

    // Check if user can review (has accepted booking)
    const checkCanReview = async (kosId: number, userId: number) => {
        try {
            const response = await fetch(`${BASE_API_URL}/review/can-review/${kosId}/${userId}`);
            const data = await response.json();

            if (data.status) {
                setCanReview(data.data.canReview);
                return data.data;
            }
        } catch (err) {
            console.error('Error checking can review:', err);
        }
        return { canReview: false, reason: 'Network error' };
    };

    // Create a new review
    const createReview = async (reviewData: {
        kosId: number;
        userId: number;
        comment: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_API_URL}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kosId: reviewData.kosId,
                    userId: reviewData.userId,
                    comment: reviewData.comment,
                }),
            });

            const data = await response.json();

            if (data.status) {
                // Add the new review to the list
                setReviews(prev => [data.data, ...prev]);
                setUserHasReviewed(true);
                setCanReview(false);
                return data.data;
            } else {
                // Handle specific error messages
                let userFriendlyMessage = data.message || 'Failed to create review';

                if (data.message?.includes('accepted booking')) {
                    userFriendlyMessage = 'Anda harus memiliki booking yang diterima untuk memberikan review';
                } else if (data.message?.includes('already reviewed')) {
                    userFriendlyMessage = 'Anda sudah memberikan review untuk kos ini';
                } else if (data.message?.includes('role')) {
                    userFriendlyMessage = 'Hanya pengguna dengan role society yang dapat memberikan review';
                }

                setError(userFriendlyMessage);
                throw new Error(userFriendlyMessage);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update an existing review
    const updateReview = async (reviewId: number, comment: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_API_URL}/review/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment }),
            });

            const data = await response.json();

            if (data.status) {
                // Update the review in the list
                setReviews(prev => prev.map(review =>
                    review.id === reviewId ? data.data : review
                ));
                return data.data;
            } else {
                setError(data.message || 'Failed to update review');
                throw new Error(data.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a review
    const deleteReview = async (reviewId: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_API_URL}/review/${reviewId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.status) {
                // Remove the review from the list
                setReviews(prev => prev.filter(review => review.id !== reviewId));
                setUserHasReviewed(false);
                return true;
            } else {
                setError(data.message || 'Failed to delete review');
                throw new Error(data.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Reply to a review (admin only)
    const replyToReview = async (reviewId: number, replyComment: string, adminId: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_API_URL}/review/${reviewId}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    replyComment,
                    adminId
                }),
            });

            const data = await response.json();

            if (data.status) {
                // Update the review in the list
                setReviews(prev => prev.map(review =>
                    review.id === reviewId ? data.data : review
                ));
                return data.data;
            } else {
                setError(data.message || 'Failed to reply to review');
                throw new Error(data.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Load reviews on component mount if kosId is provided
    useEffect(() => {
        if (kosId) {
            fetchReviewsByKos(kosId);

            if (userId) {
                checkUserReview(kosId, userId);
                checkCanReview(kosId, userId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kosId, userId]);

    return {
        reviews,
        loading,
        error,
        userHasReviewed,
        canReview,
        fetchReviewsByKos,
        checkUserReview,
        checkCanReview,
        createReview,
        updateReview,
        deleteReview,
        replyToReview,
        setError, // Allow manual error clearing
    };
};
