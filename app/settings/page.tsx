'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiKey {
  id: number;
  key: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/keys/list`);
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/keys/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await response.json();
      if (data.success) {
        setShowNewKey(data.data.key);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        alert(data.error || 'Failed to create API key');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="text-white text-xl">Loading settings...</div>
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
              <Link href="/settings" className="text-white font-semibold underline">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your API keys and account settings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* API Keys Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Keys</h2>

          {/* Create New Key */}
          <div className="premium-card mb-6">
            <h3 className="font-bold text-lg mb-4">Create New API Key</h3>
            <p className="text-gray-600 text-sm mb-4">
              API keys allow you to programmatically access Vysalytica's audit engine.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., 'Production Server')"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"
              />
              <button
                onClick={handleCreateKey}
                disabled={creating}
                className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>

          {/* New Key Display */}
          {showNewKey && (
            <div className="premium-card mb-6 bg-green-50 border-2 border-green-500">
              <h3 className="font-bold text-lg text-green-800 mb-2">✅ API Key Created!</h3>
              <p className="text-green-700 text-sm mb-3">
                Copy this key now - you won't be able to see it again!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={showNewKey}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(showNewKey)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📋 Copy
                </button>
              </div>
              <button
                onClick={() => setShowNewKey(null)}
                className="mt-3 text-green-700 text-sm underline hover:no-underline"
              >
                I've saved my key
              </button>
            </div>
          )}

          {/* Existing Keys */}
          {apiKeys.length === 0 ? (
            <div className="premium-card text-center py-8">
              <p className="text-gray-500">No API keys yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="premium-card flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{key.name}</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      {key.key.substring(0, 20)}...{key.key.substring(key.key.length - 4)}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${key.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {key.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="text-gray-600 hover:text-[#667eea] transition-colors"
                      title="Copy full key"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Documentation */}
        <div className="premium-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h2>
          <p className="text-gray-600 mb-4">
            Use your API key to access Vysalytica's audit engine programmatically.
          </p>

          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="mb-4">
              <div className="text-green-400 mb-2"># Run an audit</div>
              <div>curl -X POST https://api.vysalytica.com/api/audit \</div>
              <div className="ml-4">-H "Authorization: Bearer YOUR_API_KEY" \</div>
              <div className="ml-4">-H "Content-Type: application/json" \</div>
              <div className="ml-4">-d '{"{"}"url": "https://example.com"{"}"}'</div>
            </div>

            <div>
              <div className="text-green-400 mb-2"># Get audit status</div>
              <div>curl https://api.vysalytica.com/api/audit/status/123 \</div>
              <div className="ml-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </p>
            <p>
              <strong>Rate Limits:</strong> 100 requests per hour (free tier), 1000 requests per hour (premium)
            </p>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-8 premium-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Notifications
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-gray-600">Send me audit completion notifications</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Reports
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-600">Send weekly AI visibility summary</span>
              </label>
            </div>
            <div className="pt-4 border-t">
              <button className="text-red-600 hover:text-red-700 font-semibold">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
