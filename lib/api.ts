
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://vysalytica-api.onrender.com'

export interface AuditJob {
  id: string
  domain: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message?: string
  created_at: string
  completed_at?: string
}

export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE
  }

  async submitAudit(domain: string): Promise<{ job_id: string }> {
    const response = await fetch(`${this.baseUrl}/api/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    })

    if (!response.ok) {
      throw new Error(`Audit submission failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getJobStatus(jobId: string): Promise<AuditJob> {
    const response = await fetch(`${this.baseUrl}/api/audit/status/${jobId}`)

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`)
    }

    return response.json()
  }

  async downloadReport(jobId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/audit/${jobId}?format=docx`)

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`)
    }

    return response.blob()
  }

  async getAuditHistory(): Promise<AuditJob[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/audit/history`)
      
      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch audit history:', error)
      return []
    }
  }
}

export const apiClient = new ApiClient()
