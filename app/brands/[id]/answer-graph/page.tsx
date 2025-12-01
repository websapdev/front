'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnswerGraphNode {
    id: string;
    label: string;
    type: 'brand' | 'competitor' | 'topic' | 'question';
    score?: number;
}

interface AnswerGraphLink {
    source: string;
    target: string;
    value: number;
}

interface AnswerGraphData {
    nodes: AnswerGraphNode[];
    links: AnswerGraphLink[];
    last_updated: string;
}

export default function AnswerGraphPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const [graphData, setGraphData] = useState<AnswerGraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [building, setBuilding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGraphData();
    }, [brandId]);

    const fetchGraphData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/answer_graph/?brand_id=${brandId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 404) {
                setGraphData(null); // No graph exists yet
            } else {
                const data = await response.json();
                if (data.success) {
                    setGraphData(data.data);
                }
            }
        } catch (err: any) {
            console.error('Failed to load answer graph:', err);
            // Don't show error for 404/missing graph, just show empty state
        } finally {
            setLoading(false);
        }
    };

    const handleBuildGraph = async () => {
        setBuilding(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const response = await fetch(`${apiUrl}/api/answer_graph/build`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ brand_id: brandId }),
            });

            const data = await response.json();
            if (data.success) {
                // Poll for completion or just reload after a delay
                // For now, we'll simulate a reload after a short delay as the build might be async
                setTimeout(() => {
                    fetchGraphData();
                    setBuilding(false);
                }, 3000);
            } else {
                setError(data.error || 'Failed to start graph build');
                setBuilding(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to build graph');
            setBuilding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <div className="text-white text-xl">Loading Answer Graph...</div>
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
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Answer Graph</h1>
                        <p className="text-gray-600">Visualize how AI connects your brand to key topics</p>
                    </div>
                    <button
                        onClick={handleBuildGraph}
                        disabled={building}
                        className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {building ? 'Building Graph...' : (graphData ? 'Rebuild Graph' : 'Build Graph')}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {!graphData ? (
                    <div className="premium-card text-center py-16">
                        <div className="text-6xl mb-4">🕸️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            No Answer Graph Found
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Generate an Answer Graph to visualize the semantic connections between your brand,
                            competitors, and the questions AI models are answering.
                        </p>
                        <button
                            onClick={handleBuildGraph}
                            disabled={building}
                            className="btn-gradient text-lg px-8 py-3"
                        >
                            {building ? 'Building Analysis...' : 'Generate Answer Graph'}
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Graph Visualization Area */}
                        <div className="lg:col-span-2 premium-card min-h-[500px] flex items-center justify-center bg-gray-900 relative overflow-hidden">
                            {/* Placeholder for actual graph viz - using CSS to make a mock graph */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Central Brand Node */}
                                <div className="z-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50 animate-pulse">
                                    Brand
                                </div>

                                {/* Orbiting Nodes (Mock Visualization) */}
                                <div className="absolute w-64 h-64 border border-gray-700 rounded-full animate-spin-slow">
                                    <div className="absolute -top-3 left-1/2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold transform -translate-x-1/2">Topic</div>
                                    <div className="absolute -bottom-3 left-1/2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold transform -translate-x-1/2">Comp</div>
                                </div>

                                <div className="absolute w-96 h-96 border border-gray-800 rounded-full animate-spin-reverse-slow">
                                    <div className="absolute top-1/4 left-0 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-[10px] text-white">Q1</div>
                                    <div className="absolute bottom-1/4 right-0 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-[10px] text-white">Q2</div>
                                </div>
                            </div>

                            <div className="absolute bottom-4 right-4 text-gray-500 text-xs">
                                Interactive visualization coming soon
                            </div>
                        </div>

                        {/* Stats & Details Panel */}
                        <div className="space-y-6">
                            <div className="premium-card">
                                <h3 className="font-bold text-lg mb-4">Graph Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Total Nodes</span>
                                        <span className="font-bold text-xl">{graphData.nodes.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Connections</span>
                                        <span className="font-bold text-xl">{graphData.links.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Last Updated</span>
                                        <span className="font-bold text-sm">{new Date(graphData.last_updated).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card">
                                <h3 className="font-bold text-lg mb-4">Key Topics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {graphData.nodes
                                        .filter(n => n.type === 'topic')
                                        .slice(0, 10)
                                        .map(node => (
                                            <span key={node.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                {node.label}
                                            </span>
                                        ))}
                                </div>
                            </div>

                            <div className="premium-card">
                                <h3 className="font-bold text-lg mb-4">Competitors Detected</h3>
                                <div className="flex flex-wrap gap-2">
                                    {graphData.nodes
                                        .filter(n => n.type === 'competitor')
                                        .slice(0, 5)
                                        .map(node => (
                                            <span key={node.id} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                {node.label}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 25s linear infinite;
        }
      `}</style>
        </div>
    );
}
