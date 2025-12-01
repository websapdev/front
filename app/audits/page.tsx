'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Audit {
    id: number;
    url: string;
    domain: string;
    overall_score: number;
    page_count: number;
    created_at: string;
    brand_id?: number;
    brand_name?: string;
}

export default function AuditHistoryPage() {
    const router = useRouter();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    useEffect(() => {
        fetchAuditHistory();
    }, []);

    const fetchAuditHistory = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/audit/history`);
            const data = await response.json();

            if (data.success || Array.isArray(data)) {
                const auditList = Array.isArray(data) ? data : data.data || [];
                setAudits(auditList);
            } else {
                setError('Failed to load audit history');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load audit history');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 75) return 'Excellent';
        if (score >= 50) return 'Good';
        return 'Needs Work';
    };

    const filteredAudits = audits.filter(audit => {
        if (filter === 'all') return true;
        if (filter === 'high') return audit.overall_score >= 75;
        if (filter === 'medium') return audit.overall_score >= 50 && audit.overall_score < 75;
        if (filter === 'low') return audit.overall_score < 50;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <div className="text-white text-xl">Loading audit history...</div>
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
                        <div className="flex gap-4">
                            <Link href="/dashboard" className="text-white hover:text-gray-200">
                                Dashboard
                            </Link>
                            <Link href="/audits" className="text-white font-semibold underline">
                                Audit History
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Audit History</h1>
                    <p className="text-gray-600">View all your past AI visibility audits</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === 'all'
                                ? 'gradient-primary text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All Audits ({audits.length})
                    </button>
                    <button
                        onClick={() => setFilter('high')}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === 'high'
                                ? 'gradient-primary text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Excellent (≥75)
                    </button>
                    <button
                        onClick={() => setFilter('medium')}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === 'medium'
                                ? 'gradient-primary text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Good (50-74)
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === 'low'
                                ? 'gradient-primary text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Needs Work (&lt;50)
                    </button>
                </div>

                {/* Audit List */}
                {filteredAudits.length === 0 ? (
                    <div className="premium-card text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">
                            {filter === 'all' ? 'No audits yet.' : `No audits in the "${filter}" category.`}
                        </p>
                        <Link href="/dashboard" className="btn-gradient inline-block">
                            Run Your First Audit
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAudits.map((audit) => (
                            <Link
                                key={audit.id}
                                href={`/brands/${audit.brand_id || 1}/audits/${audit.id}`}
                                className="premium-card hover:shadow-xl transition-shadow cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{audit.domain}</h3>
                                        <span className={`text-sm font-semibold ${getScoreColor(audit.overall_score)}`}>
                                            {getScoreLabel(audit.overall_score)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{audit.url}</p>
                                    <div className="flex gap-4 text-xs text-gray-400">
                                        <span>📅 {new Date(audit.created_at).toLocaleDateString()}</span>
                                        <span>📄 {audit.page_count} pages</span>
                                        {audit.brand_name && <span>🏷️ {audit.brand_name}</span>}
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <div className={`text-4xl font-bold ${getScoreColor(audit.overall_score)}`}>
                                        {Math.round(audit.overall_score)}
                                    </div>
                                    <div className="text-sm text-gray-500">Score</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                {audits.length > 0 && (
                    <div className="mt-8 grid md:grid-cols-3 gap-4">
                        <div className="premium-card text-center">
                            <div className="text-3xl font-bold gradient-text mb-2">{audits.length}</div>
                            <div className="text-gray-600">Total Audits</div>
                        </div>
                        <div className="premium-card text-center">
                            <div className="text-3xl font-bold gradient-text mb-2">
                                {Math.round(audits.reduce((sum, a) => sum + a.overall_score, 0) / audits.length)}
                            </div>
                            <div className="text-gray-600">Average Score</div>
                        </div>
                        <div className="premium-card text-center">
                            <div className="text-3xl font-bold gradient-text mb-2">
                                {audits.reduce((sum, a) => sum + a.page_count, 0)}
                            </div>
                            <div className="text-gray-600">Pages Analyzed</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
