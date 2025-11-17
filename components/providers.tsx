
'use client'

import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
