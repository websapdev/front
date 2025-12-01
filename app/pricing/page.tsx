'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface Plan {
    id: string;
    name: string;
    price: number;
    max_pages: number;
    max_brands: number;
    features: string[];
    description: string;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const data = await apiClient.getPlans();
            setPlans(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (planId: string, price: number) => {
        if (!session) {
            router.push('/login?redirect=/pricing');
            return;
        }

        if (price === 0) {
            // Free plan - just show message
            alert('You are already on the free plan! Start creating brands and running audits.');
            router.push('/dashboard');
            return;
        }

        setProcessingPlan(planId);
        try {
            const checkoutData = await apiClient.createCheckoutSession(price * 100); // Convert to cents
            if (checkoutData.url) {
                window.location.href = checkoutData.url;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create checkout session');
            setProcessingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <div className="text-white text-xl">Loading plans...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-white/90">
                        Get discovered by AI. Boost your visibility in ChatGPT, Claude, and more.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white text-center">
                        {error}
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`premium-card p-8 ${plan.id === 'full' ? 'ring-4 ring-white/50 scale-105' : ''
                                }`}
                        >
                            {plan.id === 'full' && (
                                <div className="text-center mb-4">
                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-white/80 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                                    {plan.price > 0 && <span className="text-white/70 ml-2">/audit</span>}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start text-white/90">
                                        <svg
                                            className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan.id, plan.price)}
                                disabled={processingPlan === plan.id}
                                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${plan.id === 'full'
                                        ? 'bg-white text-[#667eea] hover:bg-white/90'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {processingPlan === plan.id ? (
                                    'Processing...'
                                ) : plan.price === 0 ? (
                                    'Get Started Free'
                                ) : (
                                    'Select Plan'
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="premium-card p-8 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-white mb-2">What is AI Visibility?</h3>
                            <p className="text-white/80 text-sm">
                                AI Visibility measures how often your brand appears in AI assistant responses
                                like ChatGPT, Claude, and Perplexity. Higher visibility means more potential
                                customers discover you through AI.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">How does the audit work?</h3>
                            <p className="text-white/80 text-sm">
                                We analyze your website's structure, schema markup, content quality, and
                                AI-readability. You'll get a detailed report with actionable recommendations
                                to improve your AI visibility.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">Can I upgrade later?</h3>
                            <p className="text-white/80 text-sm">
                                Yes! Start with the free QuickScan to see how it works, then upgrade to Full
                                or Agency audits when you're ready for deeper insights.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
                            <p className="text-white/80 text-sm">
                                We accept all major credit cards through Stripe's secure payment processing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-white/90 mb-4">
                        Not sure which plan is right for you?
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white underline hover:no-underline"
                    >
                        Start with a free QuickScan →
                    </button>
                </div>
            </div>
        </div>
    );
}
