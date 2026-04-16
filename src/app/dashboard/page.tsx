'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format, startOfDay, endOfDay, addDays, subDays, parseISO, subDays as subDaysFunc } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  User, 
  AlertCircle,
  Loader2,
  Plus,
  MoreVertical,
  Star,
  CalendarClock,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface Appointment {
  _id: string
  client_name: string
  client_phone?: string
  barber_id: string
  service_id: string
  scheduled_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at: string
  updated_at?: string
  barber?: Barber
  service?: Service
}

interface Barber {
  _id: string
  name: string
  is_active: boolean
}

interface Service {
  _id: string
  name: string
  price: number
  duration_minutes: number
  is_active: boolean
}

interface DashboardStats {
  todayRevenue: number
  yesterdayRevenue: number
  todayAppointments: number
  yesterdayAppointments: number
  busiestBarber: { name: string; count: number } | null
  pendingCount: number
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBarber, setSelectedBarber] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    yesterdayRevenue: 0,
    todayAppointments: 0,
    yesterdayAppointments: 0,
    busiestBarber: null,
    pendingCount: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [selectedDate, selectedBarber, status])

  const fetchData = async () => {
    setLoading(true)
    
    const today = startOfDay(selectedDate)
    const todayEnd = endOfDay(selectedDate)
    const yesterday = subDaysFunc(selectedDate, 1)
    const yesterdayEnd = endOfDay(yesterday)

    const todayParams = new URLSearchParams({
      start: today.toISOString(),
      end: todayEnd.toISOString(),
    })

    const yesterdayParams = new URLSearchParams({
      start: startOfDay(yesterday).toISOString(),
      end: yesterdayEnd.toISOString(),
    })

    try {
      const [todayRes, yesterdayRes, barbersRes, servicesRes] = await Promise.all([
        fetch(`/api/appointments?${todayParams}`),
        fetch(`/api/appointments?${yesterdayParams}`),
        fetch('/api/barbers'),
        fetch('/api/services'),
      ])

      const [todayData, yesterdayData, barbersData, servicesData] = await Promise.all([
        todayRes.json(),
        yesterdayRes.json(),
        barbersRes.json(),
        servicesRes.json(),
      ])

      const todayApps = todayData.appointments || []
      const yesterdayApps = yesterdayData.appointments || []

      setAppointments(todayApps)
      setBarbers(barbersData.barbers || [])
      setServices(servicesData.services || [])

      const todayRevenue = todayApps
        .filter((a: any) => a.status === 'completed')
        .reduce((sum: number, a: any) => sum + (a.service?.price || 0), 0)

      const yesterdayRevenue = yesterdayApps
        .filter((a: any) => a.status === 'completed')
        .reduce((sum: number, a: any) => sum + (a.service?.price || 0), 0)

      const barberCounts: Record<string, number> = {}
      todayApps.forEach((a: any) => {
        const name = a.barber?.name || 'Sin asignar'
        barberCounts[name] = (barberCounts[name] || 0) + 1
      })
      
      const busiestBarber = Object.entries(barberCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)[0] || null

      setStats({
        todayRevenue,
        yesterdayRevenue,
        todayAppointments: todayApps.length,
        yesterdayAppointments: yesterdayApps.length,
        busiestBarber,
        pendingCount: todayApps.filter((a: any) => a.status === 'pending').length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }),
    })
    fetchData()
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAppointment(null)
  }

  const handleSaveAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      client_name: formData.get('client_name') as string,
      client_phone: formData.get('client_phone') as string || null,
      barber_id: formData.get('barber_id') as string,
      service_id: formData.get('service_id') as string,
      scheduled_at: formData.get('scheduled_at') as string,
      status: formData.get('status') as string || 'pending',
      notes: formData.get('notes') as string || null,
    }

    const url = editingAppointment 
      ? `/api/appointments/${editingAppointment._id}`
      : '/api/appointments'
    
    const method = editingAppointment ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    closeModal()
    fetchData()
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1))
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0, 2).toUpperCase()
  }

  const revenueChange = stats.yesterdayRevenue > 0
    ? ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue * 100).toFixed(0)
    : '0'

  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const greeting = isToday 
    ? `¡Hola, ${session?.user?.name || 'Ciro'}!`
    : format(selectedDate, "EEEE d 'de' MMMM", { locale: es })

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2">{greeting}</h1>
          <p className="text-on-surface-variant text-lg">Así van las cosas hoy.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-6 md:px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg hover:bg-primary-fixed transition-all active:scale-95 group"
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
          <span className="font-bold">Agregar Turno</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <DollarSign className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Ingresos de Hoy</span>
          </div>
          <div className="text-2xl md:text-4xl font-black text-on-surface">${stats.todayRevenue.toFixed(2)}</div>
          <div className={`mt-4 text-sm font-medium flex items-center gap-1 ${Number(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Number(revenueChange) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Number(revenueChange) >= 0 ? '+' : ''}{revenueChange}% vs ayer</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <Star className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Barbero Top</span>
          </div>
          <div className="text-2xl md:text-4xl font-black text-on-surface">
            {stats.busiestBarber?.name || 'N/A'}
          </div>
          <p className="mt-4 text-on-surface-variant text-sm">
            {stats.busiestBarber?.count || 0} turnos hoy
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-card">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <CalendarClock className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Turnos Pendientes</span>
          </div>
          <div className="text-2xl md:text-4xl font-black text-on-surface">{stats.pendingCount}</div>
          <div className="mt-4 flex -space-x-2">
            {barbers.filter(b => b.is_active).slice(0, 3).map((barber, i) => (
              <div 
                key={barber._id} 
                className="h-8 w-8 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-[10px] font-bold"
              >
                {getInitials(barber.name)}
              </div>
            ))}
            {barbers.filter(b => b.is_active).length > 3 && (
              <div className="h-8 w-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-on-primary">
                +{barbers.filter(b => b.is_active).length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface">
              {isToday ? 'Turnos de Hoy' : `Turnos del ${format(selectedDate, "d MMMM", { locale: es })}`}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-surface-variant rounded-lg">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {!isToday && (
                <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-surface-variant rounded-lg">
                  Hoy
                </button>
              )}
              <button onClick={() => navigateDate('next')} className="p-2 hover:bg-surface-variant rounded-lg">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="bg-surface-container-low p-2 rounded-xl">
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
                  <AlertCircle className="h-12 w-12 text-on-surface-variant mx-auto mb-4" />
                  <p className="text-on-surface-variant">No hay turnos para esta fecha</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment._id} className="bg-surface-container-lowest p-4 md:p-6 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="text-center w-12 md:w-16">
                        <div className="text-sm font-black uppercase text-on-surface-variant">
                          {format(parseISO(appointment.scheduled_at), 'HH:mm')}
                        </div>
                      </div>
                      <div className="h-8 md:h-10 w-px bg-outline-variant"></div>
                      <div>
                        <h3 className="font-bold text-on-surface">{appointment.client_name}</h3>
                        <p className="text-sm text-on-surface-variant">{appointment.service?.name || 'Service'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-bold uppercase text-on-surface-variant">Barber</div>
                        <div className="text-sm font-medium">{appointment.barber?.name || '-'}</div>
                      </div>
                      <button onClick={() => openEditModal(appointment)}>
                        <MoreVertical className="h-5 w-5 text-on-surface-variant" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface">Estado del Equipo</h2>
          <div className="flex flex-col gap-3 md:gap-4">
            {barbers.map((barber) => (
              <div key={barber._id} className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10 flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-surface-variant flex items-center justify-center">
                    <span className="font-bold text-on-surface-variant">{getInitials(barber.name)}</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${barber.is_active ? 'bg-green-500' : 'bg-orange-400'} border-2 border-white rounded-full`}></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface">{barber.name}</h4>
                  <p className="text-xs text-on-surface-variant">
                    {barber.is_active ? 'Disponible' : 'En descanso'}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${barber.is_active ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                  {barber.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container p-6 md:p-8 rounded-xl border border-outline-variant w-full max-w-md shadow-modal max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-6 text-on-surface">
              {editingAppointment ? 'Editar Turno' : 'Nuevo Turno'}
            </h3>
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Cliente</label>
                <input name="client_name" defaultValue={editingAppointment?.client_name} required className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Teléfono</label>
                <input name="client_phone" type="tel" defaultValue={editingAppointment?.client_phone} className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Barbero</label>
                <select name="barber_id" defaultValue={editingAppointment?.barber_id} required className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface">
                  <option value="">Seleccionar barbero</option>
                  {barbers.map(barber => (
                    <option key={barber._id} value={barber._id}>{barber.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Servicio</label>
                <select name="service_id" defaultValue={editingAppointment?.service_id} required className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface">
                  <option value="">Seleccionar servicio</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>{service.name} ({service.duration_minutes} min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Fecha y Hora</label>
                <input name="scheduled_at" type="datetime-local" defaultValue={editingAppointment ? format(parseISO(editingAppointment.scheduled_at), "yyyy-MM-dd'T'HH:mm") : format(selectedDate, "yyyy-MM-dd'T'09:00")} required className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-variant">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}