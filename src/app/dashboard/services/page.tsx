'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Scissors, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Service {
  _id: string
  name: string
  duration_minutes: number
  price: number
  description?: string
  is_active: boolean
}

export default function ServicesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchServices()
    }
  }, [status])

  const fetchServices = async () => {
    const res = await fetch('/api/services')
    const data = await res.json()
    setServices(data.services || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string),
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string || null,
      is_active: true,
    }

    if (editingService) {
      await fetch(`/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }

    closeModal()
    fetchServices()
  }

  const deleteService = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    fetchServices()
  }

  const toggleActive = async (service: Service) => {
    await fetch(`/api/services/${service._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !service.is_active }),
    })
    fetchServices()
  }

  const openEditModal = (service: Service) => {
    setEditingService(service)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-headline">Servicios</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 flex items-center gap-2 font-body text-sm font-medium transition-all"
        >
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Servicio</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Duración</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase font-body">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service._id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!service.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                        <Scissors className="h-5 w-5 text-white/60" />
                      </div>
                      <div>
                        <span className="font-medium text-white font-body">{service.name}</span>
                        {service.description && (
                          <p className="text-sm text-white/50">{service.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80 font-body">
                    {service.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 text-white/80 font-body">
                    ${service.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      service.is_active 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}>
                      {service.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(service)}
                        className={`p-2 rounded-lg transition-colors ${
                          service.is_active 
                            ? 'text-yellow-400 hover:bg-yellow-500/20' 
                            : 'text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {service.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => deleteService(service._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
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
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Nombre del Servicio
                </label>
                <input
                  name="name"
                  defaultValue={editingService?.name}
                  required
                  className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-body"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                    Duración (min)
                  </label>
                  <input
                    name="duration_minutes"
                    type="number"
                    min="15"
                    step="15"
                    defaultValue={editingService?.duration_minutes || 30}
                    required
                    className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                    Precio ($)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editingService?.price || 0}
                    required
                    className="w-full bg-neutral-800 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors font-body"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-body">
                  Descripción
                </label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
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
