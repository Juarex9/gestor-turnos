'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  DollarSign,
  Loader2
} from 'lucide-react'
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  subWeeks,
  subMonths,
  format,
  parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'

interface Stats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  revenue: number
  topBarbers: { name: string; count: number }[]
  appointmentsByDay: { day: string; count: number }[]
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    revenue: 0,
    topBarbers: [],
    appointmentsByDay: []
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, period])

  const fetchStats = async () => {
    setLoading(true)
    
    const now = new Date()
    let startDate: Date, endDate: Date
    
    if (period === 'week') {
      startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      endDate = endOfWeek(now, { weekStartsOn: 1 })
    } else {
      startDate = startOfMonth(subMonths(now, 1))
      endDate = endOfMonth(now)
    }

    const params = new URLSearchParams({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    })

    const res = await fetch(`/api/appointments?${params}`)
    const data = await res.json()
    const appointments = data.appointments || []

    if (appointments) {
      const completed = appointments.filter(a => a.status === 'completed').length
      const cancelled = appointments.filter(a => a.status === 'cancelled').length
      const revenue = appointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0)

      const barberCounts: Record<string, number> = {}
      appointments.forEach(a => {
        const name = a.barber?.name || 'Sin asignar'
        barberCounts[name] = (barberCounts[name] || 0) + 1
      })
      
      const topBarbers = Object.entries(barberCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const dayCounts: Record<string, number> = {}
      const dayLabels: Record<string, string> = {
        0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'
      }
      
      appointments.forEach(a => {
        const day = dayLabels[parseISO(a.scheduled_at).getDay()]
        dayCounts[day] = (dayCounts[day] || 0) + 1
      })

      const appointmentsByDay = Object.entries(dayCounts)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => {
          const order = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
          return order.indexOf(a.day) - order.indexOf(b.day)
        })

      setStats({
        totalAppointments: appointments.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        revenue,
        topBarbers,
        appointmentsByDay,
      })
    }

    setLoading(false)
  }

  const completionRate = stats.totalAppointments > 0
    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-headline">Estadísticas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${
              period === 'week' 
                ? 'bg-white text-black' 
                : 'bg-neutral-800 text-white/60 border border-white/20 hover:bg-white/10'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${
              period === 'month' 
                ? 'bg-white text-black' 
                : 'bg-neutral-800 text-white/60 border border-white/20 hover:bg-white/10'
            }`}
          >
            Este Mes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30">
              <CalendarCheck className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 font-body">Total Turnos</p>
              <p className="text-2xl font-bold text-white font-headline">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 font-body">Completados</p>
              <p className="text-2xl font-bold text-white font-headline">{stats.completedAppointments}</p>
              <p className="text-xs text-white/40 font-body">{completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
              <Users className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 font-body">Cancelados</p>
              <p className="text-2xl font-bold text-white font-headline">{stats.cancelledAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/50 font-body">Ingresos</p>
              <p className="text-2xl font-bold text-white font-headline">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <h3 className="font-semibold mb-4 text-white font-headline">Turnos por Día</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {stats.appointmentsByDay.map((item, i) => {
              const max = Math.max(...stats.appointmentsByDay.map(d => d.count), 1)
              const height = (item.count / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-white rounded-t transition-all"
                    style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-white/50 font-body">{item.day}</span>
                  <span className="text-xs font-medium text-white font-body">{item.count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <h3 className="font-semibold mb-4 text-white font-headline">Top Barberos</h3>
          <div className="space-y-3">
            {stats.topBarbers.map((barber, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-white/80 font-body">{barber.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ 
                        width: `${(barber.count / Math.max(...stats.topBarbers.map(b => b.count), 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-white/50 w-8 text-right font-body">{barber.count}</span>
                </div>
              </div>
            ))}
            {stats.topBarbers.length === 0 && (
              <p className="text-sm text-white/50 text-center py-4 font-body">Sin datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
