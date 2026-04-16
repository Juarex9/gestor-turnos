'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

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
        <h2 className="text-2xl font-bold text-white font-headline">Barberos</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 flex items-center gap-2 font-body text-sm font-medium transition-all"
        >
          <Plus className="h-4 w-4" />
          Nuevo Barbero
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map(barber => (
            <div
              key={barber._id}
              className={`bg-neutral-900 rounded-xl border border-white/10 p-4 ${!barber.is_active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <User className="h-6 w-6 text-white/60" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white font-body">{barber.name}</h3>
                    {barber.phone && (
                      <p className="text-sm text-white/50">{barber.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              {barber.specialties && barber.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {barber.specialties.map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70 font-body">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEditModal(barber)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 text-white/80 text-sm font-body transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(barber)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                    barber.is_active 
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20'
                      : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                  }`}
                >
                  {barber.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => deleteBarber(barber._id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-6 text-white font-headline">
              {editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Nombre
                </label>
                <input
                  name="name"
                  defaultValue={editingBarber?.name}
                  required
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={editingBarber?.phone || ''}
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Especialidades (separadas por coma)
                </label>
                <input
                  name="specialties"
                  defaultValue={editingBarber?.specialties?.join(', ') || ''}
                  placeholder="Corte, Barba, Afeitado"
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
