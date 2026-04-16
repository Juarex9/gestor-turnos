'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Scissors, Plus, Pencil, Trash2, Loader2, Sparkles, Search, Clock, Euro } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = services.filter(s => s.is_active).reduce((sum, s) => sum + s.price, 0)

  return (
    <div>
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="md:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-xl">
          <span className="label-md text-primary tracking-[0.1em] text-xs font-bold mb-2 md:mb-4 uppercase block">Service Catalog</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 md:mb-4">Gestión de Servicios</h2>
          <p className="text-on-surface-variant text-sm md:text-base">Administra los servicios de tu salón. Cada servicio incluye precio, duración y descripción.</p>
        </div>
        <div className="bg-primary text-on-primary p-6 md:p-8 rounded-xl flex flex-col justify-between">
          <Sparkles className="h-8 md:h-10 w-8 md:w-10" />
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">Catálogo Total</p>
            <p className="text-xl font-bold">{services.length} Servicios</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3 text-on-surface-variant">
            <Scissors className="h-5 w-5" />
            <span className="label-md uppercase tracking-widest text-xs font-bold">Servicios Activos</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-on-surface">{services.filter(s => s.is_active).length}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3 text-on-surface-variant">
            <Clock className="h-5 w-5" />
            <span className="label-md uppercase tracking-widest text-xs font-bold">Duración Promedio</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-on-surface">
            {services.length > 0 
              ? Math.round(services.reduce((sum, s) => sum + s.duration_minutes, 0) / services.length)
              : 0} min
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3 text-on-surface-variant">
            <Euro className="h-5 w-5" />
            <span className="label-md uppercase tracking-widest text-xs font-bold">Valor Catálogo</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-on-surface">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 md:w-80 pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-5 md:px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-primary-fixed active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </button>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl text-center">
          <Scissors className="h-10 md:h-12 w-10 md:w-12 text-on-surface-variant mx-auto mb-4" />
          <p className="text-on-surface-variant">No hay servicios que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 min-w-[600px]">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container">
                  <th className="px-4 py-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-widest">Servicio</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-widest hidden sm:table-cell">Duración</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-widest hidden md:table-cell">Precio</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-widest">Estado</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-on-surface-variant uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(service => (
                  <tr key={service._id} className={`border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors ${!service.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-surface-container rounded-full flex items-center justify-center flex-shrink-0">
                          <Scissors className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-bold text-on-surface">{service.name}</span>
                          {service.description && (
                            <p className="text-sm text-on-surface-variant">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-on-surface">
                        <Clock className="h-4 w-4 text-on-surface-variant" />
                        <span className="font-medium">{service.duration_minutes} min</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="font-bold text-on-surface">${service.price.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        service.is_active 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {service.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(service)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            service.is_active 
                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {service.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container p-6 md:p-8 rounded-xl border border-outline-variant w-full max-w-md shadow-modal">
            <h3 className="text-lg md:text-xl font-bold mb-6 text-on-surface">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Nombre del Servicio
                </label>
                <input
                  name="name"
                  defaultValue={editingService?.name}
                  required
                  className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Corte de Cabello"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Duración (min)
                  </label>
                  <input
                    name="duration_minutes"
                    type="number"
                    min="15"
                    step="15"
                    defaultValue={editingService?.duration_minutes || 30}
                    required
                    className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Precio (€)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editingService?.price || 0}
                    required
                    className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="label-sm font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Descripción
                </label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
                  rows={2}
                  className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary text-sm resize-none"
                  placeholder="Descripción opcional del servicio..."
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-surface-container-highest text-on-surface font-bold text-sm rounded-xl hover:bg-neutral-300 transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary-fixed transition-colors w-full sm:w-auto"
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