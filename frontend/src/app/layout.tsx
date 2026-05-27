import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Plataforma Turismo Chile — Paquetes Dinámicos',
    template: '%s | Plataforma Turismo Chile',
  },
  description: 'Descubre los mejores paquetes turísticos en Chile. Vuelos + Hotel + Traslados armados en tiempo real al mejor precio garantizado.',
  keywords: ['turismo chile', 'paquetes turísticos', 'dynamic packaging', 'viajes chile', 'vuelos baratos'],
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Plataforma Turismo Chile',
  },
}

import Navbar from '@/components/organisms/Navbar'
import Footer from '@/components/organisms/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-mesh" style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, overflowX: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Ambient Glowing Background Orbs */}
        <div className="glow-blob" style={{ top: '-10%', left: '-10%' }} />
        <div className="glow-blob" style={{ top: '40%', right: '-10%', animationDelay: '4s' }} />
        <div className="glow-blob" style={{ bottom: '-5%', left: '20%', animationDelay: '2s' }} />
        
        <Navbar />
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
