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
              Iniciar Sesión
            </h2>
            <p className="text-white/60 text-sm mt-1 font-body">
              Ingresá tus credenciales para continuar
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-lg text-sm font-body border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
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
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/auth/register"
              className="block text-center text-white/60 text-sm hover:text-white transition-colors"
            >
              ¿No tenés cuenta? <span className="underline">Crear cuenta</span>
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