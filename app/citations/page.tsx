
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Quote, Search, BookOpen, ExternalLink, Filter } from 'lucide-react'

const sampleCitations = [
  {
    id: '1',
    title: 'The Impact of Website Performance on User Experience',
    source: 'web.dev',
    url: '#',
    type: 'Article',
    relevance: 95,
    date: '2024-01-15',
    snippet: 'Studies show that users expect pages to load in under 2 seconds, and every additional second of load time can reduce conversions by up to 7%.',
  },
  {
    id: '2',
    title: 'SEO Best Practices for 2024',
    source: 'Google Search Central',
    url: '#',
    type: 'Documentation',
    relevance: 88,
    date: '2024-02-01',
    snippet: 'Core Web Vitals have become increasingly important ranking factors, with particular emphasis on Largest Contentful Paint (LCP).',
  },
  {
    id: '3',
    title: 'Accessibility Guidelines and Standards',
    source: 'WCAG 2.1',
    url: '#',
    type: 'Standards',
    relevance: 82,
    date: '2024-01-20',
    snippet: 'Web Content Accessibility Guidelines provide comprehensive recommendations for making web content accessible to users with disabilities.',
  },
]

export default function CitationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredCitations = sampleCitations.filter(citation => {
    const matchesSearch = citation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         citation.snippet.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || citation.type.toLowerCase() === filterType
    return matchesSearch && matchesFilter
  })

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'bg-green-500'
    if (relevance >= 80) return 'bg-blue-500'
    if (relevance >= 70) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Quote className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Citation Tracker</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track and manage citations and references from your audit reports
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Citations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search citations by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All Types</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="documentation">Docs</TabsTrigger>
                <TabsTrigger value="standards">Standards</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Citations List */}
      <div className="space-y-4">
        {filteredCitations.map((citation) => (
          <Card key={citation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                      {citation.title}
                    </h3>
                    <Badge variant="outline">{citation.type}</Badge>
                    <div className={`w-2 h-2 rounded-full ${getRelevanceColor(citation.relevance)}`} title={`Relevance: ${citation.relevance}%`} />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{citation.source}</span>
                    </span>
                    <span>{citation.date}</span>
                    <span>{citation.relevance}% relevant</span>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-2">
                    {citation.snippet}
                  </p>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => console.log('Opening citation:', citation.title)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCitations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Quote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No citations found</p>
            <p className="text-sm text-muted-foreground">
              Run an audit to generate citations and references
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
