'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Brand {
    id: number
    name: string
    primary_url: string
    created_at: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newBrand, setNewBrand] = useState({ name: '', primary_url: '' })
    const [error, setError] = useState('')

    useEffect(() => {
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/api/v1/brands`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await response.json()
            if (data.success) {
                setBrands(data.data)
            }
            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch brands:', err)
            setLoading(false)
        }
    }

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/api/v1/brands`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBrand),
            })

            const data = await response.json()
            if (data.success) {
                setBrands([...brands, data.data])
                setShowCreateForm(false)
                setNewBrand({ name: '', primary_url: '' })
            } else {
                setError(data.error || 'Failed to create brand')
            }
        } catch (err) {
            setError('An error occurred')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="gradient-primary shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-2xl font-bold text-white">Vysalytica</h1>
                        <button
                            onClick={handleLogout}
                            className="text-white hover:text-gray-200 font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-900">Your Brands</h2>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-gradient"
                    >
                        + Create Brand
                    </button>
                </div>

                {showCreateForm && (
                    <div className="mb-8 card-premium">
                        <h3 className="text-xl font-bold mb-4">Create New Brand</h3>
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleCreateBrand} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBrand.name}
                                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="My Awesome Brand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                <input
                                    type="url"
                                    required
                                    value={newBrand.primary_url}
                                    onChange={(e) => setNewBrand({ ...newBrand, primary_url: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-gradient">
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {brands.length === 0 ? (
                    <div className="card-premium text-center py-12">
                        <p className="text-gray-500 text-lg">No brands yet. Create your first brand to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/brands/${brand.id}`}
                                className="card-premium hover:shadow-xl transition-shadow cursor-pointer"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{brand.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{brand.primary_url}</p>
                                <p className="text-xs text-gray-400">
                                    Created {new Date(brand.created_at).toLocaleDateString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
