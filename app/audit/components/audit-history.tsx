
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient, AuditJob } from '@/lib/api'
import { Download, History, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export function AuditHistory() {
  const [audits, setAudits] = useState<AuditJob[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const history = await apiClient.getAuditHistory()
      setAudits(Array.isArray(history) ? history : [])
    } catch (error) {
      console.error('Failed to load audit history:', error)
      setAudits([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (audit: AuditJob) => {
    try {
      const blob = await apiClient.downloadReport(audit.id)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${audit.domain}-audit-report.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Download Started',
        description: 'Your audit report is being downloaded.',
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Download Failed',
        description: 'Unable to download the audit report.',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'running': return 'default'
      case 'completed': return 'default'
      case 'failed': return 'destructive'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Recent Audits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Recent Audits</span>
        </CardTitle>
        <CardDescription>
          View and download your previous audit reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        {audits.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audits yet</p>
            <p className="text-sm text-muted-foreground">Start your first audit to see results here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{audit.domain}</span>
                    <Badge variant={getStatusColor(audit.status)}>
                      {audit.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {audit.completed_at && (
                      <span>
                        Completed {formatDistanceToNow(new Date(audit.completed_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                
                {audit.status === 'completed' && (
                  <Button 
                    onClick={() => handleDownload(audit)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
