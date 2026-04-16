import type { Metadata } from 'next'
import { Space_Grotesk, Manrope } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-headline',
})

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Ciro Premium Grooming - Gestor de Turnos',
  description: 'Sistema de gestión de turnos para peluquería',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${spaceGrotesk.variable} ${manrope.variable} font-body bg-black text-white min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}