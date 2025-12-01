'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Audit {
    id: number
    url: string
    domain: string
    overall_score: number
    created_at: string
}

interface Brand {
    id: number
    name: string
    primary_url: string
}

export default function BrandDetailPage() {
    const router = useRouter()
    const params = useParams()
    const brandId = params.id as string

    const [brand, setBrand] = useState<Brand | null>(null)
    const [audits, setAudits] = useState<Audit[]>([])
    const [loading, setLoading] = useState(true)
    const [runningAudit, setRunningAudit] = useState(false)

    useEffect(() => {
        fetchBrandAndAudits()
    }, [brandId])

    const fetchBrandAndAudits = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            // Fetch brand details
            const brandResponse = await fetch(`${apiUrl}/api/v1/brands/${brandId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const brandData = await brandResponse.json()
            if (brandData.success) {
                setBrand(brandData.data)
            }

            // Fetch audits
            const auditsResponse = await fetch(`${apiUrl}/api/v1/brands/${brandId}/audits`, {
                headers: { 'Authorization': `Bearer ${token}` },
            })
            const auditsData = await auditsResponse.json()
            if (auditsData.success) {
                setAudits(auditsData.data)
            }

            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch data:', err)
            setLoading(false)
        }
    }

    const handleRunAudit = async () => {
        if (!brand) return

        setRunningAudit(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/api/audit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: brand.primary_url,
                    packs: ['base'],
                    plan: 'quickscan',
                }),
            })

            const data = await response.json()
            if (data.success) {
                // Refresh audits list
                fetchBrandAndAudits()
            }
        } catch (err) {
            console.error('Failed to run audit:', err)
        } finally {
            setRunningAudit(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    if (!brand) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Brand not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/dashboard" className="text-2xl font-bold text-white">
                            Vysalytica
                        </Link>
                        <Link href="/dashboard" className="text-white hover:text-gray-200">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                    <p className="text-gray-600">{brand.primary_url}</p>
                </div>

                {/* Feature Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                    <Link
                        href={`/brands/${brandId}/answer-hub`}
                        className="premium-card hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">💡</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-[#667eea] transition-colors">Answer Hub</h3>
                        </div>
                        <p className="text-sm text-gray-600">AI-optimized FAQ generator</p>
                    </Link>

                    <Link
                        href={`/brands/${brandId}/citations`}
                        className="premium-card hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🤖</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-[#667eea] transition-colors">Citation Stats</h3>
                        </div>
                        <p className="text-sm text-gray-600">Track AI mentions across platforms</p>
                    </Link>

                    <Link
                        href={`/brands/${brandId}/answer-graph`}
                        className="premium-card hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🕸️</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-[#667eea] transition-colors">Answer Graph</h3>
                        </div>
                        <p className="text-sm text-gray-600">Visualize semantic connections</p>
                    </Link>

                    <Link
                        href={`/brands/${brandId}/playbooks`}
                        className="premium-card hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📚</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-[#667eea] transition-colors">Playbooks</h3>
                        </div>
                        <p className="text-sm text-gray-600">Generate strategic action plans</p>
                    </Link>
                </div>

                <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Audits</h2>
                    <button
                        onClick={handleRunAudit}
                        disabled={runningAudit}
                        className="btn-gradient disabled:opacity-50"
                    >
                        {runningAudit ? 'Running...' : '+ Run New Audit'}
                    </button>
                </div>

                {audits.length === 0 ? (
                    <div className="card-premium text-center py-12">
                        <p className="text-gray-500 text-lg">No audits yet. Run your first audit!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {audits.map((audit) => (
                            <Link
                                key={audit.id}
                                href={`/brands/${brandId}/audits/${audit.id}`}
                                className="card-premium hover:shadow-xl transition-shadow cursor-pointer flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{audit.domain}</h3>
                                    <p className="text-sm text-gray-600">{audit.url}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(audit.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold gradient-text">
                                        {Math.round(audit.overall_score)}
                                    </div>
                                    <div className="text-sm text-gray-500">Score</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
