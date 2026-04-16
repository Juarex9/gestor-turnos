'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut,
  Scissors,
  BarChart3,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const adminNavItems = [
  { href: '/dashboard', label: 'Turnos', icon: CalendarDays },
  { href: '/dashboard/barbers', label: 'Barberos', icon: Users },
  { href: '/dashboard/services', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/stats', label: 'Estadísticas', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
]

const employeeNavItems = [
  { href: '/dashboard', label: 'Turnos', icon: CalendarDays },
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
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'employee' | null>(null)
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const navItems = userRole === 'employee' ? employeeNavItems : adminNavItems

  return (
    <div className="min-h-screen bg-black flex">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-white/10 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold text-white tracking-tight">CIRO</h1>
                <p className="text-xs text-white/50 -mt-0.5 font-body">Premium Grooming</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="mb-3">
              <p className="text-sm text-white/60 font-body truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 w-full"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-30 md:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-white" />
              <span className="font-headline text-lg font-bold text-white">CIRO</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}