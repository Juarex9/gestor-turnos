'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Settings, Store, Clock, CalendarDays, Sparkles, Plus, Minus, ShieldCheck, History, HelpCircle, LogOut, Search, Bell } from 'lucide-react'

const defaultSettings = {
  id: '',
  _id: '',
  business_name: '',
  address: '',
  phone: '',
  email: '',
  opening_time: '09:00',
  closing_time: '20:00',
  work_days: [1, 2, 3, 4, 5],
  slot_duration_minutes: 45,
  require_prepayment: true,
  cancellation_margin_hours: 24,
}

const dayNames = [
  { id: 0, name: 'Domingo', short: 'DOM' },
  { id: 1, name: 'Lunes', short: 'LUN' },
  { id: 2, name: 'Martes', short: 'MAR' },
  { id: 3, name: 'Miércoles', short: 'MIÉ' },
  { id: 4, name: 'Jueves', short: 'JUE' },
  { id: 5, name: 'Viernes', short: 'VIE' },
  { id: 6, name: 'Sábado', short: 'SÁB' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings({
          ...defaultSettings,
          ...data.settings,
          work_days: data.settings.work_days || [1, 2, 3, 4, 5],
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error('Error saving settings:', error)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleWorkDay = (day: number) => {
    const isSelected = settings.work_days.includes(day)
    const newDays = isSelected
      ? settings.work_days.filter(d => d !== day)
      : [...settings.work_days, day].sort()
    setSettings({ ...settings, work_days: newDays })
  }

  const updateSlotDuration = (delta: number) => {
    const newDuration = Math.max(15, Math.min(120, settings.slot_duration_minutes + delta))
    setSettings({ ...settings, slot_duration_minutes: newDuration })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-16">
      {/* Bento Grid Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-center">
          <span className="label-md text-primary tracking-[0.1em] text-xs font-bold mb-4 uppercase">Configuración General</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Administra tu Atelier</h2>
          <p className="text-on-surface-variant max-w-md">Define la identidad de tu marca, tus horarios de atención y la logística de reservas para asegurar una experiencia premium a tus clientes.</p>
        </div>
        <div className="bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between">
          <Sparkles className="h-10 w-10" />
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">Estado del Perfil</p>
            <p className="text-xl font-bold">100% Completado</p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-outline-variant/20 pb-4">
          <h3 className="text-2xl font-bold tracking-tight">Información del Negocio</h3>
          <button 
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-primary-fixed active:scale-95 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo Upload */}
          <div className="md:col-span-4 bg-surface-container-low p-8 rounded-xl flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-surface-container-lowest flex items-center justify-center border-2 border-dashed border-outline-variant relative overflow-hidden group">
              <Store className="h-16 w-16 text-on-surface-variant" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Plus className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest mb-1">Logo del Atelier</p>
              <p className="text-xs text-on-surface-variant">SVG, PNG hasta 5MB</p>
            </div>
          </div>
          
          {/* Fields */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Nombre Comercial</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={e => setSettings({ ...settings, business_name: e.target.value })}
                className="bg-surface-container-lowest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary shadow-sm text-sm"
                placeholder="Ciro Collective"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Teléfono</label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="bg-surface-container-lowest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary shadow-sm text-sm"
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="flex flex-col space-y-2 sm:col-span-2">
              <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Dirección Física</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="bg-surface-container-lowest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary shadow-sm text-sm"
                placeholder="Calle de la Elegancia 12, Madrid, ES"
              />
            </div>
            <div className="flex flex-col space-y-2 sm:col-span-2">
              <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Email de Contacto</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="bg-surface-container-lowest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary shadow-sm text-sm"
                placeholder="hello@cirocollective.com"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="space-y-8">
        <h3 className="text-2xl font-bold tracking-tight">Horarios de Atención</h3>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          {dayNames.map((day, index) => {
            const isOpen = settings.work_days.includes(day.id)
            return (
              <div 
                key={day.id}
                className={`flex items-center justify-between p-6 ${index % 2 === 0 ? 'bg-surface-container-lowest' : ''} ${!isOpen ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-[120px]">
                  <span className="text-sm font-bold uppercase tracking-widest">{day.name}</span>
                  {!isOpen && (
                    <span className="text-[10px] bg-surface-container-highest px-2 py-0.5 rounded-full font-bold">CERRADO</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center p-2 rounded-xl ${isOpen ? 'bg-surface-container' : 'bg-surface-container-highest/40 opacity-20'}`}>
                    <input
                      type="time"
                      value={isOpen ? settings.opening_time : '00:00'}
                      disabled={!isOpen}
                      onChange={e => setSettings({ ...settings, opening_time: e.target.value })}
                      className="bg-transparent border-none text-sm p-0 focus:ring-0 w-20"
                    />
                    <span className="mx-2 text-on-surface-variant">—</span>
                    <input
                      type="time"
                      value={isOpen ? settings.closing_time : '00:00'}
                      disabled={!isOpen}
                      onChange={e => setSettings({ ...settings, closing_time: e.target.value })}
                      className="bg-transparent border-none text-sm p-0 focus:ring-0 w-20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleWorkDay(day.id)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${isOpen ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isOpen ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Booking Logic */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Duración de la Reserva</h3>
          <div className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm border border-outline-variant/10">
            <p className="text-on-surface-variant">Establece el intervalo de tiempo predeterminado para cada cita en tu calendario.</p>
            <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-2xl">
              <button
                type="button"
                onClick={() => updateSlotDuration(-15)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary hover:bg-neutral-50 transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-black">{settings.slot_duration_minutes}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">minutos</span>
              </div>
              <button
                type="button"
                onClick={() => updateSlotDuration(15)}
                className="w-12 h-12 flex items-center justify-center bg-primary rounded-xl shadow-sm text-on-primary hover:bg-primary-fixed transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setSettings({ ...settings, slot_duration_minutes: duration })}
                  className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                    settings.slot_duration_minutes === duration
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant/30 hover:bg-surface-container'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Políticas de Cancelación</h3>
          <div className="bg-surface-container p-8 rounded-xl space-y-4">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-widest mb-1">Requerir Prepago</p>
                <p className="text-xs text-on-surface-variant">Los clientes deben abonar el 20% al reservar para evitar inasistencias.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, require_prepayment: !settings.require_prepayment })}
                className={`w-11 h-6 rounded-full relative transition-colors ${settings.require_prepayment ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.require_prepayment ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="flex items-start gap-4 pt-4 border-t border-outline-variant/20">
              <History className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-widest mb-1">Margen de Cancelación</p>
                <p className="text-xs text-on-surface-variant">Permitir cancelaciones gratuitas hasta 24 horas antes de la cita.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, cancellation_margin_hours: settings.cancellation_margin_hours === 24 ? 48 : 24 })}
                className={`w-11 h-6 rounded-full relative transition-colors ${settings.cancellation_margin_hours <= 24 ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.cancellation_margin_hours <= 24 ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Action */}
      <footer className="pt-12 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setSettings(defaultSettings)}
          className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-neutral-300 transition-colors"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-on-primary px-12 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary-fixed shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Finalizar Configuración
        </button>
      </footer>
    </form>
  )
}