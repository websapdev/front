import { NextResponse } from 'next/server'

const DEFAULT_BACKEND = 'https://vs-6lye.onrender.com'
export const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND).replace(/\/$/, '')

export async function forwardJson(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`${BACKEND_BASE_URL}${path}`, {
    cache: 'no-store',
    ...init,
    headers,
  })
}

export async function handleJsonResponse(upstream: Response) {
  const contentType = upstream.headers.get('content-type') || ''

  if (!upstream.ok) {
    const text = await upstream.text()
    return new NextResponse(text || 'Upstream request failed', { status: upstream.status })
  }

  if (contentType.includes('application/json')) {
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  }

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType || 'text/plain' },
  })
}
