
'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, TrendingUp, Users, Globe } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const performanceData = [
  { month: 'Jan', score: 65, lcp: 2.8, fid: 120, cls: 0.15 },
  { month: 'Feb', score: 72, lcp: 2.4, fid: 95, cls: 0.12 },
  { month: 'Mar', score: 78, lcp: 2.1, fid: 88, cls: 0.10 },
  { month: 'Apr', score: 82, lcp: 1.9, fid: 75, cls: 0.08 },
  { month: 'May', score: 85, lcp: 1.8, fid: 65, cls: 0.06 },
  { month: 'Jun', score: 88, lcp: 1.6, fid: 58, cls: 0.05 },
]

const issuesData = [
  { category: 'Performance', count: 24, color: '#FF6B6B' },
  { category: 'SEO', count: 18, color: '#4ECDC4' },
  { category: 'Accessibility', count: 12, color: '#45B7D1' },
  { category: 'Best Practices', count: 8, color: '#96CEB4' },
]

const trafficData = [
  { source: 'Organic Search', visitors: 4200, percentage: 45 },
  { source: 'Direct', visitors: 2800, percentage: 30 },
  { source: 'Social Media', visitors: 1400, percentage: 15 },
  { source: 'Referrals', visitors: 933, percentage: 10 },
]

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#80D8C3']

export default function GraphPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Network className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Answer Graph</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Visual analytics and data insights from your website audits
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62</div>
            <p className="text-xs text-muted-foreground">-12 from last audit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Speed</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.6s</div>
            <p className="text-xs text-muted-foreground">LCP improved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94</div>
            <p className="text-xs text-muted-foreground">Excellent rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Website performance metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    label={{ 
                      value: 'Score', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { textAnchor: 'middle', fontSize: 11 } 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#60B5FF" 
                    strokeWidth={2}
                    name="Performance Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Issues Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Distribution of audit findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuesData}>
                  <XAxis 
                    dataKey="category" 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    label={{ 
                      value: 'Count', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { textAnchor: 'middle', fontSize: 11 } 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#FF9149" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
            <CardDescription>Key performance metrics trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    label={{ 
                      value: 'Value', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { textAnchor: 'middle', fontSize: 11 } 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lcp" 
                    stroke="#60B5FF" 
                    strokeWidth={2}
                    name="LCP (s)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fid" 
                    stroke="#FF9149" 
                    strokeWidth={2}
                    name="FID (ms)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cls" 
                    stroke="#80D8C3" 
                    strokeWidth={2}
                    name="CLS"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Visitor distribution by source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    dataKey="visitors"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
