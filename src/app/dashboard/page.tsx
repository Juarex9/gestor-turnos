'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  format, 
  startOfDay, 
  endOfDay, 
  addDays, 
  subDays,
  parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  User, 
  Clock,
  Check,
  X,
  AlertCircle,
  Loader2
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

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  confirmed: { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  completed: { label: 'Completado', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  no_show: { label: 'No presentado', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
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
    
    const start = startOfDay(selectedDate).toISOString()
    const end = endOfDay(selectedDate).toISOString()

    const params = new URLSearchParams({
      start,
      end,
      ...(selectedBarber !== 'all' && { barber_id: selectedBarber }),
    })

    try {
      const [appointmentsRes, barbersRes, servicesRes] = await Promise.all([
        fetch(`/api/appointments?${params}`),
        fetch('/api/barbers'),
        fetch('/api/services'),
      ])

      const [appointmentsData, barbersData, servicesData] = await Promise.all([
        appointmentsRes.json(),
        barbersRes.json(),
        servicesRes.json(),
      ])

      setAppointments(appointmentsData.appointments || [])
      setBarbers(barbersData.barbers || [])
      setServices(servicesData.services || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    
    setLoading(false)
  }

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
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
      status: formData.get('status') as AppointmentStatus || 'pending',
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

  const goToToday = () => setSelectedDate(new Date())

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-headline">Gestión de Turnos</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 font-body text-sm font-medium transition-all"
        >
          + Nuevo Turno
        </button>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm border border-white/20 rounded-lg hover:bg-white/10 text-white/80 transition-colors font-body"
            >
              Hoy
            </button>
            <span className="text-lg font-medium ml-2 text-white font-body">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
            </span>
          </div>

          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="bg-neutral-800 border border-white/20 rounded-lg px-3 py-2 text-white font-body"
          >
            <option value="all" className="bg-neutral-800">Todos los barberos</option>
            {barbers.map(barber => (
              <option key={barber._id} value={barber._id} className="bg-neutral-800">{barber.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 font-body">No hay turnos para esta fecha</p>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Hora</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Barbero</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Servicio</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/40" />
                      <span className="font-medium text-white font-body">
                        {format(parseISO(appointment.scheduled_at), 'HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-white/40" />
                      <span className="text-white font-body">{appointment.client_name}</span>
                    </div>
                    {appointment.client_phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                        <Phone className="h-3 w-3" />
                        {appointment.client_phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/80 font-body">
                    {appointment.barber?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-white/80 font-body">
                    {appointment.service?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[appointment.status].bg} ${statusConfig[appointment.status].color} ${statusConfig[appointment.status].border}`}>
                      {statusConfig[appointment.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(appointment._id, 'confirmed')}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Confirmar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <button
                          onClick={() => updateStatus(appointment._id, 'completed')}
                          className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Completar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <button
                          onClick={() => updateStatus(appointment._id, 'cancelled')}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(appointment)}
                        className="px-2 py-1 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-body"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteAppointment(appointment._id)}
                        className="px-2 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-body"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-6 text-white font-headline">
              {editingAppointment ? 'Editar Turno' : 'Nuevo Turno'}
            </h3>
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Cliente
                </label>
                <input
                  name="client_name"
                  defaultValue={editingAppointment?.client_name}
                  required
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Teléfono
                </label>
                <input
                  name="client_phone"
                  type="tel"
                  defaultValue={editingAppointment?.client_phone}
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Barbero
                </label>
                <select
                  name="barber_id"
                  defaultValue={editingAppointment?.barber_id}
                  required
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
                >
                  <option value="" className="bg-neutral-800">Seleccionar barbero</option>
                  {barbers.map(barber => (
                    <option key={barber._id} value={barber._id} className="bg-neutral-800">{barber.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Servicio
                </label>
                <select
                  name="service_id"
                  defaultValue={editingAppointment?.service_id}
                  required
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
                >
                  <option value="" className="bg-neutral-800">Seleccionar servicio</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id} className="bg-neutral-800">
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Fecha y Hora
                </label>
                <input
                  name="scheduled_at"
                  type="datetime-local"
                  defaultValue={editingAppointment ? 
                    format(parseISO(editingAppointment.scheduled_at), "yyyy-MM-dd'T'HH:mm") : 
                    format(selectedDate, "yyyy-MM-dd'T'09:00")
                  }
                  required
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              {editingAppointment && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                    Estado
                  </label>
                  <select
                    name="status"
                    defaultValue={editingAppointment.status}
                    className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
                  >
                    <option value="pending" className="bg-neutral-800">Pendiente</option>
                    <option value="confirmed" className="bg-neutral-800">Confirmado</option>
                    <option value="completed" className="bg-neutral-800">Completado</option>
                    <option value="cancelled" className="bg-neutral-800">Cancelado</option>
                    <option value="no_show" className="bg-neutral-800">No presentado</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Notas
                </label>
                <textarea
                  name="notes"
                  defaultValue={editingAppointment?.notes || ''}
                  rows={2}
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-white/20 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-body text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-body text-sm font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}