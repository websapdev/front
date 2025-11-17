
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  FileSearch,
  Quote,
  Network,
  BookOpen,
  FileText,
  Settings,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  { name: 'Audit', href: '/audit', icon: FileSearch },
  { name: 'Citations', href: '/citations', icon: Quote },
  { name: 'Graph', href: '/graph', icon: Network },
  { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession() || {}

  if (status === 'loading') {
    return <div className="h-16 bg-background border-b" />
  }

  if (!session) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <FileSearch className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Vysalytica</span>
          </div>
          <Button onClick={() => signIn()} variant="default">
            Sign In
          </Button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/audit" className="flex items-center space-x-2">
            <FileSearch className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Vysalytica</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
