'use client'

import Link from 'next/link'

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="card-premium text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
                    <p className="text-gray-600 mb-6">
                        Your payment was cancelled. No charges were made to your account.
                    </p>
                    <div className="space-y-3">
                        <Link href="/dashboard" className="btn-gradient inline-block w-full">
                            Return to Dashboard
                        </Link>
                        <Link
                            href="/dashboard"
                            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                        >
                            Try Again
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
