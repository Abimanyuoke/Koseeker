'use client';

import React, { useState } from 'react';
import { ButtonSuccess } from '../../../ui/button-type';

interface ReviewFormProps {
    kosId: number;
    userId: number;
    onSubmit: (reviewData: { comment: string }) => void;
    onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    onSubmit,
    onCancel
}) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (comment.trim().length === 0) {
            alert('Silakan tulis komentar Anda');
            return;
        }

        if (comment.trim().length < 10) {
            alert('Komentar minimal 10 karakter');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ comment: comment.trim() });
            setComment('');
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Tulis Review</h3>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tulis Komentar *
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ceritakan pengalaman Anda di kos ini..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500"
                        disabled={isSubmitting} />
                    <p className="text-xs text-gray-400 mt-1">
                        {comment.length}/500 karakter (minimal 10 karakter)
                    </p>
                </div>

                <div className="flex gap-3">
                    <ButtonSuccess
                        type="submit"
                        className={`${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
                    </ButtonSuccess>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md transition-colors"
                            disabled={isSubmitting}>
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
