import { NextResponse } from 'next/server'
import { forwardJson, handleJsonResponse } from '../../../utils'

interface Params {
  params: { jobId: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const upstream = await forwardJson(`/api/audit/status/${params.jobId}`)
    return handleJsonResponse(upstream)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch job status.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
