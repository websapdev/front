import { NextResponse } from 'next/server'
import { forwardJson, handleJsonResponse } from '../../utils'

export async function GET() {
  try {
    const upstream = await forwardJson('/api/audit/history')
    return handleJsonResponse(upstream)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch audit history.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
