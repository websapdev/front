import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            The page you were looking for doesn&apos;t exist. Head back to the audit dashboard to run a scan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/audit">Return to audits</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
