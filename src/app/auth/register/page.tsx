'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Scissors, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Error al crear la cuenta')
        setLoading(false)
        return
      }

      // Auto-login after registration
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      setSuccess(true)
    } catch (err) {
      setError('Error al crear la cuenta')
      setLoading(false)
    }
  }

  if (success) {
    const roleLabel = role === 'admin' ? 'administrador' : role === 'manager' ? 'gestor' : 'empleado'
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-neutral-900 rounded-xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-headline text-xl font-semibold text-white mb-2">
              Cuenta creada
            </h2>
            <p className="text-white/60 text-sm font-body mb-6">
              El {roleLabel} puede iniciar sesión con su email <br />
              <span className="text-white">{email}</span>
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 w-4" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 border border-white/20 mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-headline text-3xl font-bold text-white tracking-tight">
            CIRO
          </h1>
          <p className="text-white/60 text-sm mt-1 font-body">
            Premium Grooming
          </p>
        </div>

        <div className="bg-neutral-900 rounded-xl p-8 border border-white/10 shadow-card">
          <div className="text-center mb-6">
            <h2 className="font-headline text-xl font-semibold text-white">
              Crear Cuenta
            </h2>
            <p className="text-white/60 text-sm mt-1 font-body">
              Registrate para comenzar a usar el sistema
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-lg text-sm font-body border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-label text-white/60 mb-2 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-body"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-label text-white/60 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-body"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-label text-white/60 mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-body"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-label py-3 px-4 rounded-md hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/auth/login"
              className="block text-center text-white/60 text-sm hover:text-white transition-colors"
            >
              ¿Ya tenés cuenta? <span className="underline">Iniciar sesión</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6 font-body">
          © 2026 Ciro Premium Grooming
        </p>
      </div>
    </div>
  )
}