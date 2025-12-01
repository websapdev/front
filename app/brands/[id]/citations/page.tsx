'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CitationStats {
    brand: string;
    total_queries: number;
    overall_rate: number;
    chatgpt_rate: number;
    claude_rate: number;
    perplexity_rate?: number;
}

interface Brand {
    id: number;
    name: string;
    primary_url: string;
}

export default function CitationStatsPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [stats, setStats] = useState<CitationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBrandAndStats();
    }, [brandId]);

    const fetchBrandAndStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            // Fetch brand details
            const brandResponse = await fetch(`${apiUrl}/api/v1/brands/${brandId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const brandData = await brandResponse.json();
            if (brandData.success) {
                setBrand(brandData.data);

                // Fetch citation stats
                const statsResponse = await fetch(
                    `${apiUrl}/api/citations/stats?brand=${encodeURIComponent(brandData.data.name)}`
                );
                const statsData = await statsResponse.json();
                if (statsData.success) {
                    setStats(statsData.data);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load citation stats');
        } finally {
            setLoading(false);
        }
    };

    const getRateColor = (rate: number) => {
        if (rate >= 40) return 'text-green-600';
        if (rate >= 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRateLabel = (rate: number) => {
        if (rate >= 40) return 'Excellent';
        if (rate >= 20) return 'Good';
        return 'Needs Improvement';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <div className="text-white text-xl">Loading citation stats...</div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Brand not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="gradient-primary shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/dashboard" className="text-2xl font-bold text-white">
                            Vysalytica
                        </Link>
                        <Link href={`/brands/${brandId}`} className="text-white hover:text-gray-200">
                            ← Back to Brand
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Citation Tracking</h1>
                    <p className="text-gray-600">{brand.name}</p>
                    <p className="text-sm text-gray-500">{brand.primary_url}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {!stats ? (
                    <div className="premium-card text-center py-12">
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Citation Tracking Not Available
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Citation tracking is a premium feature that tracks how often your brand is mentioned
                            by AI assistants like ChatGPT, Claude, and Perplexity.
                        </p>
                        <Link href="/pricing" className="btn-gradient inline-block">
                            Upgrade to Premium
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Overall Stats */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="premium-card gradient-primary text-white text-center">
                                <div className="text-6xl font-bold mb-2">{Math.round(stats.overall_rate)}%</div>
                                <div className="text-xl mb-1">Overall Citation Rate</div>
                                <div className="text-sm opacity-80">
                                    {getRateLabel(stats.overall_rate)} visibility
                                </div>
                            </div>

                            <div className="premium-card text-center">
                                <div className="text-6xl font-bold gradient-text mb-2">{stats.total_queries}</div>
                                <div className="text-xl text-gray-700 mb-1">Total Queries Tested</div>
                                <div className="text-sm text-gray-500">Across all AI platforms</div>
                            </div>
                        </div>

                        {/* Platform Breakdown */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Breakdown</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="premium-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">ChatGPT</h3>
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <div className={`text-4xl font-bold mb-2 ${getRateColor(stats.chatgpt_rate)}`}>
                                        {Math.round(stats.chatgpt_rate)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Citation Rate</div>
                                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full transition-all"
                                            style={{ width: `${stats.chatgpt_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="premium-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">Claude</h3>
                                        <span className="text-2xl">🧠</span>
                                    </div>
                                    <div className={`text-4xl font-bold mb-2 ${getRateColor(stats.claude_rate)}`}>
                                        {Math.round(stats.claude_rate)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Citation Rate</div>
                                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full transition-all"
                                            style={{ width: `${stats.claude_rate}%` }}
                                        />
                                    </div>
                                </div>

                                {stats.perplexity_rate !== undefined && (
                                    <div className="premium-card">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-lg">Perplexity</h3>
                                            <span className="text-2xl">🔍</span>
                                        </div>
                                        <div className={`text-4xl font-bold mb-2 ${getRateColor(stats.perplexity_rate)}`}>
                                            {Math.round(stats.perplexity_rate)}%
                                        </div>
                                        <div className="text-sm text-gray-600">Citation Rate</div>
                                        <div className="mt-3 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-2 rounded-full transition-all"
                                                style={{ width: `${stats.perplexity_rate}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="premium-card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Insights & Recommendations</h2>
                            <div className="space-y-4">
                                {stats.overall_rate < 20 && (
                                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                        <h3 className="font-bold text-red-800 mb-2">⚠️ Low Visibility</h3>
                                        <p className="text-red-700 text-sm">
                                            Your brand is rarely mentioned by AI assistants. Consider improving your
                                            structured data, adding FAQ schema, and creating more authoritative content.
                                        </p>
                                    </div>
                                )}

                                {stats.overall_rate >= 20 && stats.overall_rate < 40 && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                        <h3 className="font-bold text-yellow-800 mb-2">📈 Good Progress</h3>
                                        <p className="text-yellow-700 text-sm">
                                            Your brand is getting some AI visibility. Focus on adding more structured
                                            data and improving E-E-A-T signals to increase citation rates.
                                        </p>
                                    </div>
                                )}

                                {stats.overall_rate >= 40 && (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                        <h3 className="font-bold text-green-800 mb-2">✅ Excellent Visibility</h3>
                                        <p className="text-green-700 text-sm">
                                            Your brand has strong AI visibility! Maintain your structured data and
                                            continue creating high-quality, authoritative content.
                                        </p>
                                    </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <h3 className="font-bold text-blue-800 mb-2">💡 Next Steps</h3>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>• Run regular audits to track improvements</li>
                                        <li>• Implement schema markup recommendations</li>
                                        <li>• Create FAQ content to boost citation rates</li>
                                        <li>• Monitor competitor citation rates</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
