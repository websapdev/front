
import { AuditForm } from './components/audit-form'
import { AuditHistory } from './components/audit-history'
import { QuickScan } from './components/quick-scan'
import { FileSearch, TrendingUp, Shield, Zap } from 'lucide-react'

export default function AuditPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Website Audit</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive analysis of your website's performance, SEO, and accessibility
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
          <TrendingUp className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Performance Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Detailed performance metrics and optimization recommendations
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
          <Shield className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Security Check</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive security audit and vulnerability assessment
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
          <Zap className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Quick Results</h3>
            <p className="text-sm text-muted-foreground">
              Fast processing with real-time progress updates
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        <QuickScan />
        <AuditForm />
      </div>

      <AuditHistory />
    </div>
  )
}
