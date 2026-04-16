'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard,
  Users, 
  Settings, 
  LogOut,
  Scissors,
  BarChart3,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/barbers', label: 'Barberos', icon: Users },
  { href: '/dashboard/services', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/stats', label: 'Estadísticas', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex h-screen w-64 border-r border-outline-variant bg-surface-dim flex-col p-6 gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-black text-on-surface">Ciro</span>
          <span className="font-body text-xs uppercase tracking-widest text-on-surface-variant">Admin</span>
        </div>
        
        <nav className="flex flex-col gap-1 font-body text-sm">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant rounded-xl transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface-dim border-r border-outline-variant flex-col p-6 gap-6 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:hidden
      `}>
        <div className="flex flex-col gap-1">
          <span className="text-xl font-black text-on-surface">Ciro</span>
          <span className="font-body text-xs uppercase tracking-widest text-on-surface-variant">Admin</span>
        </div>
        
        <nav className="flex flex-col gap-1 font-body text-sm">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/50">
          <button
            onClick={() => {
              handleSignOut()
              setSidebarOpen(false)
            }}
            className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant rounded-xl transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header - solo hamburger y titulo */}
        <header className="md:hidden border-b border-outline-variant bg-surface sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-surface-variant rounded-lg"
            >
              <Menu className="h-6 w-6 text-on-surface" />
            </button>
            <span className="font-black text-xl tracking-tight text-on-surface">Ciro</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 xl:p-12 scroll-smooth bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}