
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Search, Play, Clock, CheckCircle, Plus, Eye } from 'lucide-react'

const samplePlaybooks = [
  {
    id: '1',
    title: 'Website Performance Optimization',
    description: 'Complete guide to improving Core Web Vitals and page load speeds',
    category: 'Performance',
    steps: 12,
    estimatedTime: '2-3 hours',
    difficulty: 'Intermediate',
    status: 'active',
    tags: ['LCP', 'FID', 'CLS', 'Performance'],
    lastUsed: '2024-03-15',
  },
  {
    id: '2',
    title: 'SEO Audit Checklist',
    description: 'Comprehensive SEO audit process for better search rankings',
    category: 'SEO',
    steps: 18,
    estimatedTime: '3-4 hours',
    difficulty: 'Advanced',
    status: 'completed',
    tags: ['Meta Tags', 'Schema', 'Keywords', 'Technical SEO'],
    lastUsed: '2024-03-10',
  },
  {
    id: '3',
    title: 'Accessibility Compliance',
    description: 'WCAG 2.1 compliance guidelines and testing procedures',
    category: 'Accessibility',
    steps: 15,
    estimatedTime: '2-3 hours',
    difficulty: 'Intermediate',
    status: 'draft',
    tags: ['WCAG', 'A11y', 'Screen Readers', 'Keyboard Navigation'],
    lastUsed: '2024-03-12',
  },
]

const playbookDetails = {
  '1': {
    steps: [
      { title: 'Analyze Current Performance', description: 'Run Lighthouse audit and gather baseline metrics', completed: true },
      { title: 'Optimize Images', description: 'Compress and convert images to modern formats', completed: true },
      { title: 'Enable Compression', description: 'Configure GZIP/Brotli compression', completed: false },
      { title: 'Minify Resources', description: 'Minify CSS, JS, and HTML files', completed: false },
      { title: 'Implement Caching', description: 'Set up browser and server-side caching', completed: false },
    ]
  }
}

export default function PlaybooksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null)

  const filteredPlaybooks = samplePlaybooks.filter(playbook => {
    const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || playbook.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500'
      case 'Intermediate': return 'bg-yellow-500'
      case 'Advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'completed': return 'secondary'
      case 'draft': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Playbooks</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Step-by-step guides for common optimization and audit tasks
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Playbooks</span>
            </CardTitle>
            <Button onClick={() => console.log('Creating new playbook')}>
              <Plus className="mr-2 h-4 w-4" />
              New Playbook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search playbooks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('performance')}
              >
                Performance
              </Button>
              <Button
                variant={selectedCategory === 'seo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('seo')}
              >
                SEO
              </Button>
              <Button
                variant={selectedCategory === 'accessibility' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('accessibility')}
              >
                Accessibility
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaybooks.map((playbook) => (
          <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Badge variant={getStatusColor(playbook.status)}>
                    {playbook.status}
                  </Badge>
                </div>
                <div className={`w-3 h-3 rounded-full ${getDifficultyColor(playbook.difficulty)}`} title={playbook.difficulty} />
              </div>
              <CardTitle className="text-lg">{playbook.title}</CardTitle>
              <CardDescription>{playbook.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {playbook.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{playbook.steps} steps</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{playbook.estimatedTime}</span>
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{playbook.title}</DialogTitle>
                      <DialogDescription>{playbook.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {playbookDetails['1']?.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            step.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {step.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          {step.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" className="flex-1" onClick={() => console.log('Running playbook:', playbook.title)}>
                  <Play className="mr-2 h-4 w-4" />
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlaybooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No playbooks found</p>
            <p className="text-sm text-muted-foreground">
              Create your first playbook to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
