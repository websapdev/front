'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Audit {
    id: number
    url: string
    domain: string
    overall_score: number
    category_scores: Record<string, number>
    page_count: number
    created_at: string
    findings: any[]
}

export default function AuditDetailPage() {
    const router = useRouter()
    const params = useParams()
    const brandId = params.id as string
    const auditId = params.auditId as string

    const [audit, setAudit] = useState<Audit | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'indexing' | 'citations' | 'schema' | 'reports'>('indexing')
    const [downloading, setDownloading] = useState<'docx' | 'markdown' | null>(null)

    useEffect(() => {
        fetchAudit()
    }, [auditId])

    const fetchAudit = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/api/audit/${auditId}`)
            const data = await response.json()

            if (data.success) {
                setAudit(data.data)
            }
            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch audit:', err)
            setLoading(false)
        }
    }

    const handleDownloadReport = async (format: 'docx' | 'markdown') => {
        if (!audit) return

        setDownloading(format)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const endpoint = format === 'docx' ? '/api/report/docx' : '/api/report/markdown'

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: audit.url,
                    packs: ['base'],
                    scores: {
                        overall: audit.overall_score,
                        by_category: audit.category_scores,
                    },
                    findings: audit.findings,
                }),
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${audit.domain}_audit_${new Date().toISOString().split('T')[0]}.${format === 'docx' ? 'docx' : 'md'}`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                alert('Failed to download report')
            }
        } catch (err) {
            console.error('Failed to download report:', err)
            alert('Failed to download report')
        } finally {
            setDownloading(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading audit...</div>
            </div>
        )
    }

    if (!audit) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Audit not found</div>
            </div>
        )
    }

    const tabs = [
        { id: 'indexing' as const, label: '1. Indexing Analysis', icon: '🔍' },
        { id: 'citations' as const, label: '2. AI Citations', icon: '🤖' },
        { id: 'schema' as const, label: '3. Schema Optimization', icon: '⚙️' },
        { id: 'reports' as const, label: '4. Performance Reports', icon: '📊' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Audit Results</h1>
                    <p className="text-gray-600">{audit.url}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {new Date(audit.created_at).toLocaleString()}
                    </p>
                </div>

                {/* Score Card */}
                <div className="card-premium mb-8 gradient-primary text-white">
                    <div className="text-center">
                        <div className="text-6xl font-bold mb-2">{Math.round(audit.overall_score)}</div>
                        <div className="text-xl">Overall AI Visibility Score</div>
                        <div className="text-sm opacity-80 mt-2">{audit.page_count} pages analyzed</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'gradient-primary text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="card-premium">
                    {activeTab === 'indexing' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Content & Product Indexing Analysis</h2>
                            <p className="text-gray-600 mb-6">
                                Analysis of how well your content is structured for AI discovery.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg mb-2">Pages Crawled</h3>
                                    <p className="text-3xl font-bold gradient-text">{audit.page_count}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg mb-2">Category Scores</h3>
                                    <div className="space-y-2">
                                        {Object.entries(audit.category_scores).map(([category, score]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="font-medium">{category}</span>
                                                <span className="text-xl font-bold gradient-text">{Math.round(score)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'citations' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">AI Citation Tracking</h2>
                            <p className="text-gray-600 mb-6">
                                Track how often your brand is mentioned by AI assistants.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                                <p className="text-blue-800">
                                    Citation tracking requires a paid plan. Upgrade to track your brand across ChatGPT, Claude, and Perplexity.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schema' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Schema & Structured Data Optimization</h2>
                            <p className="text-gray-600 mb-6">
                                Recommendations to improve your structured data for AI visibility.
                            </p>

                            {audit.findings && audit.findings.length > 0 ? (
                                <div className="space-y-4">
                                    {audit.findings.slice(0, 5).map((finding, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-bold mb-2">{finding.rule_title || finding.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{finding.why}</p>
                                            {finding.fix && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-gray-700">Fix:</p>
                                                    <p className="text-sm text-gray-600">{finding.fix}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No specific recommendations at this time.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Performance Reports</h2>
                            <p className="text-gray-600 mb-6">
                                Download and share your audit results.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-bold text-lg mb-2">Summary</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>• Overall Score: <span className="font-bold">{Math.round(audit.overall_score)}</span></li>
                                        <li>• Pages Analyzed: <span className="font-bold">{audit.page_count}</span></li>
                                        <li>• Findings: <span className="font-bold">{audit.findings?.length || 0}</span></li>
                                    </ul>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleDownloadReport('docx')}
                                        disabled={downloading === 'docx'}
                                        className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {downloading === 'docx' ? '⏳ Downloading...' : '📥 Download DOCX Report'}
                                    </button>
                                    <button
                                        onClick={() => handleDownloadReport('markdown')}
                                        disabled={downloading === 'markdown'}
                                        className="bg-white border-2 border-[#667eea] text-[#667eea] py-3 px-6 rounded-lg font-semibold hover:bg-[#667eea] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {downloading === 'markdown' ? '⏳ Downloading...' : '📄 Download Markdown'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
