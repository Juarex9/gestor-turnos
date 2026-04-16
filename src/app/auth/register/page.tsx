'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Loader2, Scissors, Mail, Lock, User, AlertCircle, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="w-full max-w-md px-6 py-12">
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center shadow-card">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
              Cuenta creada
            </h2>
            <p className="text-on-surface-variant text-sm font-body mb-6">
              El {roleLabel} puede iniciar sesión con su email <br />
              <span className="text-primary font-medium">{email}</span>
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Scissors className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface">
            CIRO
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 font-body">
            Premium Grooming
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Crear Cuenta
            </h2>
            <p className="text-on-surface-variant text-sm mt-1 font-body">
              Registrate para comenzar a usar el sistema
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-error-container text-error p-3 rounded-xl text-sm font-body">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-label text-on-surface-variant mb-3 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-label text-on-surface-variant mb-3 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-label text-on-surface-variant mb-3 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label py-4 px-4 rounded-xl hover:bg-primary-fixed transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm font-body font-bold"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-outline-variant/20 -mx-8 px-8 mt-8 -mb-8 rounded-b-2xl">
            <Link
              href="/auth/login"
              className="block text-center text-on-surface-variant text-sm hover:text-primary transition-colors font-body"
            >
              ¿Ya tenés cuenta? <span className="underline">Iniciar sesión</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-on-surface-variant text-xs mt-8 font-body">
          © 2026 Ciro Premium Grooming
        </p>
      </div>
    </div>
  )
}