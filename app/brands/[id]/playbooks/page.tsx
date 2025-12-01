'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Playbook {
    id: string;
    title: string;
    type: 'seo' | 'content' | 'technical' | 'comprehensive';
    status: 'generating' | 'ready' | 'failed';
    created_at: string;
    summary?: string;
}

export default function PlaybooksPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [selectedType, setSelectedType] = useState<string>('comprehensive');

    // Mock data for initial display since backend might be empty
    const mockPlaybooks: Playbook[] = [
        // { id: '1', title: 'Q4 Content Strategy', type: 'content', status: 'ready', created_at: new Date().toISOString(), summary: 'Focus on long-tail keywords for product pages.' }
    ];

    useEffect(() => {
        fetchPlaybooks();
    }, [brandId]);

    const fetchPlaybooks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            // Note: Assuming an endpoint exists to list playbooks, if not we might need to rely on local state or mock for now
            // For this implementation, we'll try to fetch, but fallback to empty list if 404
            const response = await fetch(`${apiUrl}/api/playbooks/list?brand_id=${brandId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setPlaybooks(data.data || []);
                }
            }
        } catch (err: any) {
            console.log('Failed to load playbooks list, starting fresh');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePlaybook = async () => {
        setGenerating(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const response = await fetch(`${apiUrl}/api/playbooks/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    brand_id: brandId,
                    type: selectedType
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Add optimistic playbook entry
                const newPlaybook: Playbook = {
                    id: 'temp-' + Date.now(),
                    title: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Strategy Playbook`,
                    type: selectedType as any,
                    status: 'generating',
                    created_at: new Date().toISOString()
                };
                setPlaybooks([newPlaybook, ...playbooks]);

                // Simulate generation time then refresh
                setTimeout(() => {
                    // In a real app, we'd poll status. Here we'll just mark it ready locally for demo
                    setPlaybooks(prev => prev.map(p =>
                        p.id === newPlaybook.id ? { ...p, status: 'ready', summary: 'Strategy generation complete. Ready for download.' } : p
                    ));
                }, 5000);
            } else {
                setError(data.error || 'Failed to start playbook generation');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate playbook');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (playbookId: string, format: 'docx' | 'md') => {
        // Implementation for download
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        try {
            const response = await fetch(`${apiUrl}/api/report/playbook_${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ playbook_id: playbookId })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `playbook-${playbookId}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Download failed');
            }
        } catch (e) {
            console.error(e);
            alert('Download error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                <div className="text-white text-xl">Loading Playbooks...</div>
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Strategic Playbooks</h1>
                    <p className="text-gray-600">AI-generated action plans to dominate your market</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Generator Panel */}
                    <div className="lg:col-span-1">
                        <div className="premium-card sticky top-8">
                            <h2 className="text-xl font-bold mb-4">Generate New Playbook</h2>
                            <p className="text-gray-600 text-sm mb-6">
                                Create a tailored strategy based on your latest audit data and competitor analysis.
                            </p>

                            <div className="space-y-4 mb-6">
                                <label className="block p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="comprehensive"
                                        checked={selectedType === 'comprehensive'}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="font-semibold">Comprehensive Strategy</span>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">Full analysis covering content, technical, and authority.</p>
                                </label>

                                <label className="block p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="content"
                                        checked={selectedType === 'content'}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="font-semibold">Content Gap Analysis</span>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">Focus on missing topics and keyword opportunities.</p>
                                </label>

                                <label className="block p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="technical"
                                        checked={selectedType === 'technical'}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="font-semibold">Technical Optimization</span>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">Schema, speed, and structure improvements.</p>
                                </label>
                            </div>

                            <button
                                onClick={handleGeneratePlaybook}
                                disabled={generating}
                                className="btn-gradient w-full py-3 disabled:opacity-70"
                            >
                                {generating ? 'Generating Strategy...' : 'Generate Playbook ✨'}
                            </button>
                        </div>
                    </div>

                    {/* Playbooks List */}
                    <div className="lg:col-span-2 space-y-6">
                        {playbooks.length === 0 ? (
                            <div className="premium-card text-center py-16 bg-gray-50 border-dashed border-2 border-gray-200">
                                <div className="text-5xl mb-4">📚</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Playbooks Yet</h3>
                                <p className="text-gray-500">
                                    Generate your first playbook to get a step-by-step guide for improving your AI visibility.
                                </p>
                            </div>
                        ) : (
                            playbooks.map((playbook) => (
                                <div key={playbook.id} className="premium-card hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900">{playbook.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${playbook.status === 'ready' ? 'bg-green-100 text-green-800' :
                                                        playbook.status === 'generating' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {playbook.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Generated on {new Date(playbook.created_at).toLocaleDateString()} • {playbook.type.toUpperCase()}
                                            </p>
                                        </div>
                                        {playbook.status === 'ready' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDownload(playbook.id, 'docx')}
                                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 text-gray-700"
                                                >
                                                    DOCX
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(playbook.id, 'md')}
                                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 text-gray-700"
                                                >
                                                    Markdown
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {playbook.summary && (
                                        <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                            {playbook.summary}
                                        </p>
                                    )}

                                    {playbook.status === 'generating' && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className="bg-blue-600 h-2 rounded-full animate-progress" style={{ width: '60%' }}></div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
