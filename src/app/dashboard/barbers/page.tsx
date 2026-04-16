'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Plus, Pencil, Trash2, Loader2, Sparkles, Search } from 'lucide-react'

interface Barber {
  _id: string
  name: string
  phone?: string
  specialties?: string[]
  is_active: boolean
}

export default function BarbersPage() {
  const { status } = useSession()
  const router = useRouter()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBarbers()
    }
  }, [status])

  const fetchBarbers = async () => {
    try {
      const res = await fetch('/api/barbers')
      const data = await res.json()
      setBarbers(data.barbers || [])
    } catch (error) {
      console.error('Error fetching barbers:', error)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || null,
      specialties: (formData.get('specialties') as string).split(',').map(s => s.trim()).filter(Boolean),
      is_active: true,
    }

    const method = editingBarber ? 'PUT' : 'POST'
    const url = editingBarber ? `/api/barbers/${editingBarber._id}` : '/api/barbers'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    closeModal()
    fetchBarbers()
  }

  const deleteBarber = async (id: string) => {
    if (!confirm('¿Eliminar este barbero?')) return
    await fetch(`/api/barbers/${id}`, { method: 'DELETE' })
    fetchBarbers()
  }

  const toggleActive = async (barber: Barber) => {
    await fetch(`/api/barbers/${barber._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !barber.is_active }),
    })
    fetchBarbers()
  }

  const openEditModal = (barber: Barber) => {
    setEditingBarber(barber)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBarber(null)
  }

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-center">
          <span className="label-md text-primary tracking-[0.1em] text-xs font-bold mb-4 uppercase">Team Management</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Tu Equipo de Expertos</h2>
          <p className="text-on-surface-variant max-w-md">Gestiona tu equipo de barberos. Agrega nuevos talentos, actualiza sus especialidades y controla su disponibilidad.</p>
        </div>
        <div className="bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between">
          <Sparkles className="h-10 w-10" />
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">Total Equipo</p>
            <p className="text-xl font-bold">{barbers.length} Barberos</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar barbería o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-primary-fixed active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Barbero
        </button>
      </div>

      {/* Barbers Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBarbers.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
          <User className="h-12 w-12 text-on-surface-variant mx-auto mb-4" />
          <p className="text-on-surface-variant">No hay barberos que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarbers.map(barber => (
            <div
              key={barber._id}
              className={`bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 transition-all hover:shadow-card ${!barber.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-surface-container rounded-full flex items-center justify-center">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">{barber.name}</h3>
                    {barber.phone && (
                      <p className="text-sm text-on-surface-variant">{barber.phone}</p>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                  barber.is_active 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {barber.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              {barber.specialties && barber.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {barber.specialties.map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-surface-container rounded-full text-xs text-on-surface-variant font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t border-outline-variant/20">
                <button
                  onClick={() => openEditModal(barber)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-container rounded-xl hover:bg-surface-variant text-sm font-medium text-on-surface transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(barber)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    barber.is_active 
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {barber.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => deleteBarber(barber._id)}
                  className="p-2 text-error hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container p-8 rounded-xl border border-outline-variant w-full max-w-md shadow-modal">
            <h3 className="text-xl font-bold mb-6 text-on-surface">
              {editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Nombre Completo
                </label>
                <input
                  name="name"
                  defaultValue={editingBarber?.name}
                  required
                  className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={editingBarber?.phone || ''}
                  className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Especialidades (separadas por coma)
                </label>
                <input
                  name="specialties"
                  defaultValue={editingBarber?.specialties?.join(', ') || ''}
                  placeholder="Corte, Barba, Afeitado"
                  className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-surface-container-highest text-on-surface font-bold text-sm rounded-xl hover:bg-neutral-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary-fixed transition-colors"
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