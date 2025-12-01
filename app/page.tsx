'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="gradient-primary">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Vysalytica</h1>
            <div className="space-x-4">
              <Link href="/login" className="text-white hover:text-gray-200 font-medium">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <h2 className="text-6xl font-bold mb-6">
            Building the Backbone of Agentic Commerce
          </h2>
          <p className="text-2xl mb-8 opacity-90">
            AI-Native E-commerce Infrastructure
          </p>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-80">
            Make your business discoverable, trustworthy, and transactable by AI agents.
            Start with AI visibility audits, scale to agentic commerce.
          </p>
          <Link href="/signup" className="bg-white text-purple-600 px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 inline-block">
            Get Your Free Audit
          </Link>
        </div>
      </div>

      {/* Problem Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">The Problem</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Brands are invisible to AI agents. When users ask ChatGPT or Claude for recommendations,
            most businesses don't get mentioned.
          </p>
        </div>
      </div>

      {/* Solution Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Solution</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A 4-step process to maximize your AI visibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: '🔍',
                title: 'Content Indexing',
                description: 'Analyze how AI systems discover your business',
              },
              {
                step: '2',
                icon: '🤖',
                title: 'Citation Tracking',
                description: 'Track mentions across ChatGPT, Claude, Perplexity',
              },
              {
                step: '3',
                icon: '⚙️',
                title: 'Schema Optimization',
                description: 'Get copy-paste JSON-LD and structured data',
              },
              {
                step: '4',
                icon: '📊',
                title: 'Performance Reports',
                description: 'Client-ready dashboards and before/after metrics',
              },
            ].map((item) => (
              <div key={item.step} className="card-premium text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-sm font-bold text-purple-600 mb-2">STEP {item.step}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Sign up now and get your first AI visibility audit for free.
          </p>
          <Link
            href="/signup"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 inline-block"
          >
            Start Your Free Audit
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Vysalytica. Building the future of agentic commerce.</p>
        </div>
      </footer>
    </div>
  )
}
