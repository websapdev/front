
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { apiClient, AuditJob } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Download, AlertCircle, CheckCircle, Globe } from 'lucide-react'

export function AuditForm() {
  const [domain, setDomain] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentJob, setCurrentJob] = useState<AuditJob | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setIsSubmitting(true)
    
    try {
      const { job_id } = await apiClient.submitAudit(domain)
      
      // Start polling for job status
      pollJobStatus(job_id)
      
      toast({
        title: 'Audit Started',
        description: 'Your website audit has been submitted successfully.',
      })
    } catch (error) {
      console.error('Audit submission error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start audit',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const job = await apiClient.getJobStatus(jobId)
        setCurrentJob(job)
        
        if (job.status === 'completed') {
          setIsSubmitting(false)
          toast({
            title: 'Audit Completed',
            description: 'Your audit is ready for download!',
          })
        } else if (job.status === 'failed') {
          setIsSubmitting(false)
          toast({
            title: 'Audit Failed',
            description: job.message || 'The audit could not be completed.',
            variant: 'destructive',
          })
        } else {
          // Continue polling if still running
          setTimeout(poll, 2000)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setIsSubmitting(false)
        toast({
          title: 'Error',
          description: 'Failed to check audit status',
          variant: 'destructive',
        })
      }
    }
    
    poll()
  }

  const handleDownload = async () => {
    if (!currentJob) return
    
    try {
      const blob = await apiClient.downloadReport(currentJob.id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${currentJob.domain}-audit-report.docx`
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
      case 'pending': return 'bg-yellow-500'
      case 'running': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Start New Audit</span>
        </CardTitle>
        <CardDescription>
          Enter your website domain to begin a comprehensive audit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Website Domain</Label>
            <Input
              id="domain"
              type="url"
              placeholder="https://example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={isSubmitting}
              className="pl-10"
            />
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" style={{ marginTop: '8px' }} />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !domain.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Audit'
            )}
          </Button>
        </form>

        {currentJob && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`${getStatusColor(currentJob.status)} text-white`}>
                  {getStatusIcon(currentJob.status)}
                  <span className="ml-1 capitalize">{currentJob.status}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentJob.domain}
                </span>
              </div>
              {currentJob.status === 'completed' && (
                <Button onClick={handleDownload} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>

            {currentJob.status === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentJob.progress}%</span>
                </div>
                <Progress value={currentJob.progress} className="w-full" />
              </div>
            )}

            {currentJob.message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{currentJob.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
