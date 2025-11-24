'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { QuickScanResult, runQuickScan } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, CheckCircle2, Loader2, Radar, ShieldCheck } from 'lucide-react'

export function QuickScan() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<QuickScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const normalizedUrl = useMemo(() => formatUrl(url), [url])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!normalizedUrl) return

    setError(null)
    setResult(null)
    setIsLoading(true)

    try {
      const scanResult = await runQuickScan(normalizedUrl)
      setResult(scanResult)
      toast({
        title: 'Scan complete',
        description: 'Your AI visibility check finished successfully.',
      })
    } catch (scanError) {
      const message =
        scanError instanceof Error ? scanError.message : 'Unable to run the quick scan. Please try again.'
      setError(message)
      toast({
        title: 'Scan failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasIssues = (result?.issues?.length || 0) > 0
  const scoreValue = typeof result?.score === 'number' ? Math.round(result.score) : null
  const statusLabel = result?.status || 'completed'

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radar className="h-5 w-5" />
          AI Visibility Quick Scan
        </CardTitle>
        <CardDescription>
          Enter a URL to get an instant, production-ready visibility report backed by our live API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-scan-url">Website URL</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="quick-scan-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !normalizedUrl} className="sm:w-44">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running scan...
                  </>
                ) : (
                  'Run AI Visibility Check'
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={statusLabel === 'failed' ? 'destructive' : 'default'} className="capitalize">
                  {statusLabel}
                </Badge>
                <span className="text-sm text-muted-foreground break-all">{result.url}</span>
              </div>
              {scoreValue !== null && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Visibility score: {scoreValue}/100
                </div>
              )}
            </div>

            {scoreValue !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Overall score</span>
                  <span>{scoreValue}%</span>
                </div>
                <Progress value={scoreValue} />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Summary</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.summary || 'Scan completed. Review the findings below for more details.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span>{hasIssues ? 'Top findings' : 'No critical issues detected'}</span>
              </div>
              {hasIssues ? (
                <div className="space-y-2">
                  {result.issues?.map((issue, index) => (
                    <div key={`${issue.title}-${index}`} className="rounded-md bg-background p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-tight">{issue.title || `Finding ${index + 1}`}</p>
                        {issue.severity && <Badge variant="outline" className="uppercase">{issue.severity}</Badge>}
                      </div>
                      {issue.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{issue.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great job! We did not detect any major visibility blockers on this page.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}
