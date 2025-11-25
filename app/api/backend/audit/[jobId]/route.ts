import { NextResponse } from 'next/server'
import { BACKEND_BASE_URL } from '../../utils'

interface Params {
  params: { jobId: string }
}

export async function GET(request: Request, { params }: Params) {
  const url = new URL(request.url)
  const search = url.search ? url.search : ''

  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/audit/${params.jobId}${search}`, {
      cache: 'no-store',
    })

    const headers = new Headers()
    const contentType = upstream.headers.get('content-type')
    const disposition = upstream.headers.get('content-disposition')

    if (contentType) headers.set('content-type', contentType)
    if (disposition) headers.set('content-disposition', disposition)

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to download report.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
