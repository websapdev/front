import { NextResponse } from 'next/server'
import { forwardJson, handleJsonResponse } from '../utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const upstream = await forwardJson('/api/audit', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return handleJsonResponse(upstream)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit audit.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
