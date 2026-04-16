'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Scissors, Mail, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email o contraseña incorrectos')
      return
    }

    router.push('/dashboard')
    router.refresh()
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
              Iniciar Sesión
            </h2>
            <p className="text-on-surface-variant text-sm mt-1 font-body">
              Ingresá tus credenciales para continuar
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-error-container text-error p-3 rounded-xl text-sm font-body">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
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
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-outline-variant/20 -mx-8 px-8 mt-8 -mb-8 rounded-b-2xl">
            <Link
              href="/auth/register"
              className="block text-center text-on-surface-variant text-sm hover:text-primary transition-colors font-body"
            >
              ¿No tenés cuenta? <span className="underline">Crear cuenta</span>
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