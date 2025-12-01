const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const DEFAULT_TIMEOUT = 15000

export interface AuditJob {
  id: string
  domain: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message?: string
  created_at: string
  completed_at?: string
}

export interface QuickScanIssue {
  title?: string
  description?: string
  severity?: 'low' | 'medium' | 'high' | string
}

export interface QuickScanResult {
  url: string
  status?: string
  score?: number
  summary?: string
  issues?: QuickScanIssue[]
  raw?: unknown
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number
  expectBlob?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async getToken(): Promise<string> {
    // Try to get token from localStorage (client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) return token
    }

    // Try to get from NextAuth session (server-side or client-side)
    try {
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      // Use type assertion since we extend the Session type in auth-options.ts
      if (session && (session as any).accessToken) {
        return (session as any).accessToken as string
      }
    } catch (err) {
      // NextAuth not available or session not found
    }

    throw new Error('No authentication token available')
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT)
    const headers = new Headers(options.headers)

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData?.message || errorData?.error || errorMessage
        } catch {
          const fallbackMessage = await response.text().catch(() => '')
          if (fallbackMessage) {
            errorMessage = fallbackMessage
          }
        }

        throw new Error(errorMessage)
      }

      if (options.expectBlob) {
        return (await response.blob()) as T
      }

      if (response.status === 204) {
        return undefined as T
      }

      return (await response.json()) as T
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timed out. Please try again.')
      }

      throw error instanceof Error ? error : new Error('Unexpected error occurred.')
    } finally {
      clearTimeout(timeout)
    }
  }

  async submitAudit(domain: string): Promise<{ job_id: string }> {
    return this.request('/api/audit', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })
  }

  async getJobStatus(jobId: string): Promise<AuditJob> {
    return this.request(`/api/audit/status/${jobId}`)
  }

  async downloadReport(jobId: string): Promise<Blob> {
    return this.request(`/api/audit/${jobId}?format=docx`, { expectBlob: true })
  }

  async getAuditHistory(): Promise<AuditJob[]> {
    try {
      const history = await this.request<AuditJob[]>('/api/audit/history')
      return Array.isArray(history) ? history : []
    } catch (error) {
      console.error('Failed to fetch audit history:', error)
      return []
    }
  }

  async runQuickScan(targetUrl: string): Promise<QuickScanResult> {
    const response = await this.request<unknown>('/api/quickscan', {
      method: 'POST',
      body: JSON.stringify({ url: targetUrl }),
    })

    return this.normalizeQuickScanResponse(response, targetUrl)
  }

  private normalizeQuickScanResponse(response: unknown, fallbackUrl: string): QuickScanResult {
    if (!response || typeof response !== 'object') {
      return { url: fallbackUrl }
    }

    const typedResponse = response as Record<string, any>
    const result = (typedResponse.data || typedResponse.result || typedResponse) as Record<string, any>
    const issues = (result.issues || result.findings || result.problems || []) as QuickScanIssue[]
    const score = result.score ?? result.overall_score ?? result.visibilityScore
    const status = result.status ?? result.state ?? (typedResponse.success === false ? 'failed' : 'completed')
    const summary =
      result.summary ||
      result.message ||
      result.overview ||
      (Array.isArray(issues) ? `${issues.length} potential findings detected` : undefined)

    return {
      url: result.url || result.domain || fallbackUrl,
      status,
      score: typeof score === 'number' ? score : undefined,
      summary,
      issues: Array.isArray(issues) ? issues : [],
      raw: response,
    }
  }

  // Authentication methods
  async signup(email: string, password: string, name?: string): Promise<{ user: any; token: string }> {
    const response = await this.request<{ success: boolean; data: { user: any; token: string } }>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    return response.data
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const response = await this.request<{ success: boolean; data: { user: any; token: string } }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return response.data
  }

  async getCurrentUser(token: string): Promise<any> {
    const response = await this.request<{ success: boolean; data: any }>('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }

  // Brand methods
  async getBrands(token: string): Promise<any[]> {
    const response = await this.request<{ success: boolean; data: any[] }>('/api/v1/brands', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }

  async createBrand(token: string, data: { name: string; primary_url: string; catalog_url?: string; competitors?: string[] }): Promise<any> {
    const response = await this.request<{ success: boolean; data: any }>('/api/v1/brands', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    return response.data
  }

  async getBrand(token: string, brandId: number): Promise<any> {
    const response = await this.request<{ success: boolean; data: any }>(`/api/v1/brands/${brandId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }

  async getBrandAudits(token: string, brandId: number): Promise<any[]> {
    const response = await this.request<{ success: boolean; data: any[] }>(`/api/v1/brands/${brandId}/audits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }

  // Plans methods
  async getPlans(): Promise<any[]> {
    const response = await this.request<{ success: boolean; data: any[] }>('/api/plans')
    return response.data
  }

  async comparePlans(): Promise<any[]> {
    const response = await this.request<{ success: boolean; data: any[] }>('/api/plans/compare')
    return response.data
  }

  // Payment methods
  async createCheckoutSession(amount: number): Promise<{ url: string; session_id: string }> {
    const token = await this.getToken()
    const response = await this.request<{ success: boolean; data: { url: string; session_id: string } }>('/api/v1/payments/create-checkout-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    })
    return response.data
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

export const runQuickScan = (url: string) => apiClient.runQuickScan(url)
