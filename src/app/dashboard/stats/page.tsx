'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  DollarSign,
  Loader2,
  History,
  Tag,
  ChevronRight,
  CalendarCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  subWeeks,
  subMonths,
  eachDayOfInterval
} from 'date-fns'

interface StatsData {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  revenue: number
  topBarbers: { name: string; count: number; _id: string }[]
  appointmentsByDay: { day: string; count: number; revenue: number }[]
  servicesByType: { name: string; count: number; revenue: number }[]
}

export default function StatsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData>({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    revenue: 0,
    topBarbers: [],
    appointmentsByDay: [],
    servicesByType: []
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month'>('month')
  const [chartMode, setChartMode] = useState<'income' | 'volume'>('income')
  const [prevRevenue, setPrevRevenue] = useState(0)
  const [prevAppointments, setPrevAppointments] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, period])

  const fetchData = async () => {
    setLoading(true)
    const now = new Date()
    let startDate: Date, endDate: Date, prevStart: Date, prevEnd: Date
    
    if (period === 'week') {
      startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      endDate = endOfWeek(now, { weekStartsOn: 1 })
      prevStart = startOfWeek(subWeeks(now, 2), { weekStartsOn: 1 })
      prevEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    } else {
      startDate = startOfMonth(subMonths(now, 1))
      endDate = endOfMonth(now)
      prevStart = startOfMonth(subMonths(now, 2))
      prevEnd = endOfMonth(subMonths(now, 1))
    }

    try {
      const currentRes = await fetch(`/api/appointments?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
      const prevRes = await fetch(`/api/appointments?start=${prevStart.toISOString()}&end=${prevEnd.toISOString()}`)

      const currentData = await currentRes.json()
      const prevData = await prevRes.json()

      const appointments = currentData.appointments || []
      const prevApps = prevData.appointments || []

      const completed = appointments.filter((a: any) => a.status === 'completed').length
      const cancelled = appointments.filter((a: any) => a.status === 'cancelled').length
      const revenue = appointments.filter((a: any) => a.status === 'completed').reduce((sum: number, a: any) => sum + (a.service?.price || 0), 0)
      const prevRev = prevApps.filter((a: any) => a.status === 'completed').reduce((sum: number, a: any) => sum + (a.service?.price || 0), 0)

      setPrevRevenue(prevRev)
      setPrevAppointments(prevApps.length)

      const barberCounts: Record<string, { count: number; id: string }> = {}
      appointments.forEach((a: any) => {
        const name = a.barber?.name || 'Sin asignar'
        const id = a.barber?._id || 'unknown'
        if (!barberCounts[name]) barberCounts[name] = { count: 0, id }
        barberCounts[name].count++
      })
      const topBarbers = Object.entries(barberCounts).map(([name, data], i) => ({ name, count: data.count, _id: data.id })).sort((a, b) => b.count - a.count).slice(0, 5)

      const days = eachDayOfInterval({ start: startDate, end: endDate })
      const dayLabels = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
      const appointmentsByDay = days.map(day => {
        const dayApps = appointments.filter((a: any) => new Date(a.scheduled_at).toDateString() === day.toDateString())
        return {
          day: dayLabels[day.getDay()],
          count: dayApps.length,
          revenue: dayApps.filter((a: any) => a.status === 'completed').reduce((sum, a) => sum + (a.service?.price || 0), 0)
        }
      })

      const serviceCounts: Record<string, { count: number; revenue: number }> = {}
      appointments.forEach((a: any) => {
        const name = a.service?.name || 'Otro'
        if (!serviceCounts[name]) serviceCounts[name] = { count: 0, revenue: 0 }
        serviceCounts[name].count++
        if (a.status === 'completed') serviceCounts[name].revenue += a.service?.price || 0
      })
      const servicesByType = Object.entries(serviceCounts).map(([name, data]) => ({ name, count: data.count, revenue: data.revenue })).sort((a, b) => b.count - a.count)

      setStats({
        totalAppointments: appointments.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        revenue,
        topBarbers,
        appointmentsByDay,
        servicesByType
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  const completionRate = stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0
  const avgTicket = stats.completedAppointments > 0 ? stats.revenue / stats.completedAppointments : 0
  const revenueChange = prevRevenue > 0 ? ((stats.revenue - prevRevenue) / prevRevenue * 100).toFixed(0) : '0'
  const appointmentsChange = prevAppointments > 0 ? ((stats.totalAppointments - prevAppointments) / prevAppointments * 100).toFixed(0) : '0'
  const totalServices = stats.servicesByType.reduce((sum, s) => sum + s.count, 0)
  const getServicePct = (count: number) => totalServices > 0 ? Math.round((count / totalServices) * 100) : 0
  const getInitials = (name: string) => { const p = name.split(' '); return p.length > 1 ? p[0][0] + p[1][0] : name.substring(0, 2).toUpperCase() }
  const topPeak = stats.appointmentsByDay.reduce((max, d) => d.revenue > max.revenue ? d : max, { day: '', count: 0, revenue: 0 })

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div>
      <section className="mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2">Análisis y Estadísticas</h2>
        <p className="text-on-surface-variant text-lg">{period === 'week' ? 'Esta semana' : 'Este mes'} - Revisión del desempeño</p>
      </section>

      <div className="flex gap-2 mb-8">
        <button onClick={() => setPeriod('week')} className={`px-4 py-2 rounded-full text-sm font-bold ${period === 'week' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}>Semana</button>
        <button onClick={() => setPeriod('month')} className={`px-4 py-2 rounded-full text-sm font-bold ${period === 'month' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}>Mes</button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ingresos</span>
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${Number(revenueChange) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{Number(revenueChange) >= 0 ? '+' : ''}{revenueChange}%</span>
          </div>
          <p className="text-2xl md:text-3xl font-black">${stats.revenue.toFixed(2)}</p>
          <p className="text-xs text-neutral-400">vs período anterior</p>
        </div>
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Turnos</span>
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${Number(appointmentsChange) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{Number(appointmentsChange) >= 0 ? '+' : ''}{appointmentsChange}%</span>
          </div>
          <p className="text-2xl md:text-3xl font-black">{stats.totalAppointments}</p>
          <p className="text-xs text-neutral-400">{completionRate}% completados</p>
        </div>
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ticket Promedio</span>
            <DollarSign className="h-4 w-4 text-neutral-300" />
          </div>
          <p className="text-2xl md:text-3xl font-black">${avgTicket.toFixed(2)}</p>
          <p className="text-xs text-neutral-400">por cliente</p>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-4 md:gap-8">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold">{chartMode === 'income' ? 'Ingresos' : 'Turnos'} por Día</h3>
            <div className="flex gap-2">
              <button onClick={() => setChartMode('income')} className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${chartMode === 'income' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>Income</button>
              <button onClick={() => setChartMode('volume')} className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${chartMode === 'volume' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>Volume</button>
            </div>
          </div>
          <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2 border-b border-neutral-100 pb-2">
            {stats.appointmentsByDay.length > 0 ? stats.appointmentsByDay.map((item, i) => {
              const val = chartMode === 'income' ? item.revenue : item.count
              const max = Math.max(...stats.appointmentsByDay.map(d => chartMode === 'income' ? d.revenue : d.count), 1)
              const h = (val / max) * 100
              const isMax = val === max
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className={`w-full rounded-t-lg ${isMax ? 'bg-black' : 'bg-neutral-100'} group-hover:bg-neutral-300`} style={{ height: `${h}%`, minHeight: val > 0 ? '8px' : '0' }} />
                  <span className="text-[10px] font-bold mt-2 text-neutral-400">{item.day}</span>
                </div>
              )
            }) : <div className="flex-1 text-center text-neutral-400">Sin datos</div>}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <h3 className="text-lg md:text-xl font-bold mb-6">Servicios</h3>
          <div className="space-y-4">
            {stats.servicesByType.length > 0 ? stats.servicesByType.slice(0, 4).map((s, i) => {
              const pct = getServicePct(s.count)
              const colors = ['bg-black', 'bg-neutral-400', 'bg-neutral-300', 'bg-neutral-200']
              return (
                <div key={i}>
                  <div className="flex justify-between"><span className="text-sm font-semibold">{s.name}</span><span className="text-xs font-bold">{pct}%</span></div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full"><div className={colors[i]} style={{ width: `${pct}%` }} /></div>
                </div>
              )
            }) : <p className="text-sm text-neutral-400">Sin servicios</p>}
          </div>
        </div>

        <div className="col-span-12 bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-bold">Top Barberos</h3>
            <Link href="/dashboard/barbers" className="text-sm font-bold text-neutral-400 hover:text-black">Ver todos <ChevronRight className="h-4 w-4 inline" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.topBarbers.length > 0 ? stats.topBarbers.map((b, i) => (
              <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100">
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold">{getInitials(b.name)}</div>
                <div className="flex-1"><p className="font-bold text-sm truncate">{b.name}</p><p className="text-xs text-neutral-400">{b.count} turnos</p></div>
                <span className={`font-black ${i === 0 ? 'text-black' : 'text-neutral-300'}`}>#{i + 1}</span>
              </div>
            )) : <p className="col-span-4 text-neutral-400">Sin datos</p>}
          </div>
        </div>
      </div>

      <section className="mt-8 md:mt-12 bg-surface-container p-1 rounded-xl">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Picos de Actividad</h3><History className="h-5 w-5 text-neutral-400" /></div>
          <div className="space-y-3">
            {topPeak.day && (
              <div className="flex justify-between items-center p-4 bg-surface-container-lowest rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-black text-white rounded-lg flex items-center justify-center"><CalendarCheck className="h-5 w-5" /></div>
                  <div><p className="font-bold">Día con más ingresos: {topPeak.day}</p><p className="text-xs text-neutral-400">{topPeak.count} turnos • ${topPeak.revenue.toFixed(2)}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {Number(revenueChange) >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                  <span className={`font-bold ${Number(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(revenueChange) >= 0 ? '+' : ''}{revenueChange}%</span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center p-4 bg-surface-container-lowest rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-neutral-200 rounded-lg flex items-center justify-center"><Tag className="h-5 w-5" /></div>
                <div><p className="font-bold">Servicio más popular</p><p className="text-xs text-neutral-400">{stats.servicesByType[0]?.name || 'N/A'} • {stats.servicesByType[0]?.count || 0}</p></div>
              </div>
              <span className="font-bold">{totalServices > 0 ? Math.round((stats.servicesByType[0]?.count || 0) / totalServices * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}