'use client';

interface PriceDisplayProps {
    originalPrice: number;
    discountPercent?: number;
    discountEndDate?: string;
    className?: string;
}

export default function PriceDisplay({
    originalPrice,
    discountPercent = 0,
    discountEndDate,
    className = ""
}: PriceDisplayProps) {
    // Check if discount is still valid
    const isDiscountValid = discountEndDate ? new Date(discountEndDate) > new Date() : true;
    const hasDiscount = discountPercent > 0 && isDiscountValid;

    // Calculate discounted price
    const discountedPrice = hasDiscount
        ? originalPrice - (originalPrice * discountPercent / 100)
        : originalPrice;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDateUntil = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {hasDiscount ? (
                <div className="space-y-1">
                    {/* Discounted Price */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                            {formatPrice(discountedPrice)}
                        </span>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            -{discountPercent}%
                        </span>
                    </div>

                    {/* Original Price (crossed out) */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                            Hemat {formatPrice(originalPrice - discountedPrice)}
                        </span>
                    </div>

                    {/* Discount end date */}
                    {discountEndDate && (
                        <div className="text-xs text-orange-600">
                            Berlaku hingga {formatDateUntil(discountEndDate)}
                        </div>
                    )}
                </div>
            ) : (
                /* Regular Price */
                <span className="text-lg font-bold text-gray-800">
                    {formatPrice(originalPrice)}
                </span>
            )}
            <span className="text-sm text-gray-600">/bulan</span>
        </div>
    );
}
