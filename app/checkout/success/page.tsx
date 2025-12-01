'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="card-premium text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold gradient-text mb-4">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for your purchase. Your audit features have been unlocked.
                    </p>
                    {sessionId && (
                        <p className="text-xs text-gray-400 mb-6">
                            Session ID: {sessionId}
                        </p>
                    )}
                    <Link href="/dashboard" className="btn-gradient inline-block">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
