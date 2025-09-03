'use client';

import ReviewContainer from '@/app/components/review/ReviewContainer';

const ReviewDemoPage = () => {
    // Mock data untuk demo
    const mockKosId = 1;
    const mockUserId = 1; // Set ke undefined untuk test tanpa login

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Demo Komponen Review
                        </h1>
                        <p className="text-gray-600">
                            Komponen review yang menggunakan data dari database
                        </p>
                    </div>

                    {/* Demo Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="font-semibold text-blue-800 mb-2">Informasi Demo:</h2>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Menampilkan review dari database langsung</li>
                            <li>• Form untuk menambah review baru</li>
                            <li>• Balasan dari pemilik kos</li>
                            <li>• Responsive design untuk mobile dan desktop</li>
                            <li>• Tanpa data dummy - menggunakan data real dari API</li>
                        </ul>
                    </div>

                    {/* Review Component */}
                    <ReviewContainer
                        kosId={mockKosId}
                        userId={mockUserId}
                        showForm={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReviewDemoPage;
