'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, Save } from 'lucide-react'
import type { BusinessSettings } from '@/types'

const defaultSettings: BusinessSettings = {
  id: '',
  _id: '',
  business_name: '',
  address: '',
  phone: '',
  opening_time: '09:00',
  closing_time: '19:00',
  work_days: [1, 2, 3, 4, 5],
  slot_duration_minutes: 30,
  whatsapp_number: '',
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings)
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
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()

      if (data.settings) {
        setSettings({ ...settings, _id: data.settings._id })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleWorkDay = (day: number) => {
    const days = settings.work_days.includes(day)
      ? settings.work_days.filter(d => d !== day)
      : [...settings.work_days, day].sort()
    setSettings({ ...settings, work_days: days })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-headline">Configuración</h2>
        {saved && (
          <span className="text-green-400 text-sm flex items-center gap-1 font-body">
            <Save className="h-4 w-4" />
            Guardado
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl">
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-white font-headline">
            <Settings className="h-5 w-5" />
            Información del Negocio
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 font-body">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={settings.business_name}
                onChange={e => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 font-body">
                Dirección
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 font-body">
                Teléfono
              </label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 font-body">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                value={settings.whatsapp_number || ''}
                onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="+54911..."
                className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
              />
              <p className="text-xs text-white/40 mt-1 font-body">
                Número donde recibirás los mensajes de Turnos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="font-semibold mb-4 text-white font-headline">Horarios</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 font-body">
                Apertura
              </label>
              <input
                type="time"
                value={settings.opening_time}
                onChange={e => setSettings({ ...settings, opening_time: e.target.value })}
                className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 font-body">
                Cierre
              </label>
              <input
                type="time"
                value={settings.closing_time}
                onChange={e => setSettings({ ...settings, closing_time: e.target.value })}
                className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 font-body">
              Días Laborales
            </label>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((name, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkDay(day)}
                  className={`px-3 py-1.5 rounded-full text-sm font-body ${
                    settings.work_days.includes(day)
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 mb-6">
          <h3 className="font-semibold mb-4 text-white font-headline">Reservas</h3>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1 font-body">
              Duración de Turno (minutos)
            </label>
            <select
              value={settings.slot_duration_minutes}
              onChange={e => setSettings({ ...settings, slot_duration_minutes: parseInt(e.target.value)})}
              className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
            >
              <option value={15} className="bg-neutral-800">15 minutos</option>
              <option value={20} className="bg-neutral-800">20 minutos</option>
              <option value={30} className="bg-neutral-800">30 minutos</option>
              <option value={45} className="bg-neutral-800">45 minutos</option>
              <option value={60} className="bg-neutral-800">60 minutos</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-white text-black py-3 rounded-lg hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2 font-body font-medium"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Guardar Configuración
            </>
          )}
        </button>
      </form>
    </div>
  )
}
