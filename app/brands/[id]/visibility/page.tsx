'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import clsx from 'clsx';

// Types matching our API response
interface VisibilityData {
    headline: {
        overallSov: number;
        totalAnswers: number;
        competitorsTracked: number;
    };
    engineChart: Array<{ name: string; sov: number }>;
    trend: Array<{ date: string; brandSov: number }>;
    prompts: Array<{ id: string; text: string; answerCount: number }>;
}

export default function VisibilityDashboard() {
    const params = useParams();
    const brandId = params.id as string;
    const router = useRouter();

    const [data, setData] = useState<VisibilityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [polling, setPolling] = useState(false);

    // Form states
    const [newPrompt, setNewPrompt] = useState('');
    const [newCompetitor, setNewCompetitor] = useState('');

    useEffect(() => {
        fetchData();
    }, [brandId]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/brands/${brandId}/visibility/overview`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRunPoll = async () => {
        setPolling(true);
        try {
            const res = await fetch('/api/internal/visibility/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandId })
            });
            if (res.ok) {
                await fetchData(); // Refresh data
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPolling(false);
        }
    };

    const handleAddPrompt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPrompt) return;
        try {
            await fetch(`/api/brands/${brandId}/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newPrompt })
            });
            setNewPrompt('');
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddCompetitor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompetitor) return;
        try {
            await fetch(`/api/brands/${brandId}/competitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCompetitor })
            });
            setNewCompetitor('');
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load data</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Nav */}
            <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/brands/${brandId}`} className="text-gray-500 hover:text-gray-700">← Back</Link>
                        <h1 className="text-xl font-bold text-gray-900">AI Visibility Dashboard</h1>
                    </div>
                    <button
                        onClick={handleRunPoll}
                        disabled={polling}
                        className={clsx(
                            "px-4 py-2 rounded-md text-white font-medium transition-colors",
                            polling ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                        )}
                    >
                        {polling ? 'Running Analysis...' : 'Run Analysis Now'}
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Headline Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Share of Voice (30d)"
                        value={`${data.headline.overallSov}%`}
                        trend="vs competitors"
                        color="indigo"
                    />
                    <MetricCard
                        title="AI Answers Analyzed"
                        value={data.headline.totalAnswers}
                        trend="total samples"
                        color="blue"
                    />
                    <MetricCard
                        title="Competitors Tracked"
                        value={data.headline.competitorsTracked}
                        trend="active rivals"
                        color="purple"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SOV by Engine */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Share of Voice by Engine</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.engineChart}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis unit="%" />
                                    <Tooltip />
                                    <Bar dataKey="sov" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Brand SOV" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Trend Line */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Visibility Trend (30 Days)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
                                    <YAxis unit="%" />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="brandSov" stroke="#4f46e5" strokeWidth={2} dot={false} name="Brand SOV" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Management Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Prompts List */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Tracked Prompts</h3>
                            <form onSubmit={handleAddPrompt} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add new prompt..."
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newPrompt}
                                    onChange={e => setNewPrompt(e.target.value)}
                                />
                                <button type="submit" className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800">+</button>
                            </form>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt Text</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Answers Collected</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.prompts.map((prompt) => (
                                        <tr key={prompt.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prompt.text}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{prompt.answerCount}</td>
                                        </tr>
                                    ))}
                                    {data.prompts.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No prompts tracked yet. Add one above!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Competitors List (Simplified) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Add Competitor</label>
                                <form onSubmit={handleAddCompetitor} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Competitor Name"
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newCompetitor}
                                        onChange={e => setNewCompetitor(e.target.value)}
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">Add</button>
                                </form>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Pro Tip</h4>
                                <p className="text-xs text-blue-700">
                                    Adding more specific prompts (e.g., "Best X for Y") usually yields better competitive insights than generic queries.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, trend, color }: { title: string, value: string | number, trend: string, color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{value}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-800`}>
                    {trend}
                </span>
            </div>
        </div>
    );
}
