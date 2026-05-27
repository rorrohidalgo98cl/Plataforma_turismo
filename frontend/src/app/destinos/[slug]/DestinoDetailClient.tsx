'use client'

import { useRouter } from 'next/navigation'
import { formatPrecio, Destino } from '@/data/destinos'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function DestinoDetailClient({ destino }: { destino: Destino }) {
  const router = useRouter()

  const [fechaIda, setFechaIda] = useState('')
  const [fechaVuelta, setFechaVuelta] = useState('')
  const [pasajeros, setPasajeros] = useState(2)

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fechaIda || !fechaVuelta) return
    const searchParams = new URLSearchParams({
      destino: destino.nombre,
      slug: destino.slug,
      ida: fechaIda,
      vuelta: fechaVuelta,
      pasajeros: String(pasajeros),
    })
    router.push(`/buscar?${searchParams.toString()}`)
  }

  return (
    <main style={{ background: 'var(--color-obsidian)', minHeight: '100vh', color: 'var(--color-text)' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', height: '60vh', width: '100%' }}>
        <img 
          src={destino.imagen} 
          alt={destino.nombre} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(2,6,23,0.3) 0%, var(--color-obsidian) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge-teal" style={{ marginBottom: 16 }}>{destino.region}</span>
            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 16
            }}>
              {destino.nombre}
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-muted)', maxWidth: 600 }}>
              {destino.tagline}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-main" style={{ marginTop: -80, position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
          
          {/* Info Column */}
          <div className="bg-glass" style={{ 
            borderRadius: '24px',
            padding: '32px'
          }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Sobre este destino</h2>
            <p style={{ lineHeight: 1.8, color: 'var(--color-muted)', marginBottom: 24 }}>
              {destino.descripcion}
            </p>
            
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {destino.tags.map(tag => (
                <span key={tag} className="badge-surface">#{tag}</span>
              ))}
            </div>

            <div style={{ marginTop: 40, borderTop: '1px solid var(--color-border)', paddingTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Desde</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-teal)' }}>
                    {formatPrecio(destino.precioDesde)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Aeropuerto</p>
                  <p style={{ fontWeight: 600 }}>{destino.codigoIATA}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Column */}
          <div className="bg-glass-card" style={{ 
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Reserva tu Experiencia</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
              Comparamos cientos de sitios para encontrarte el mejor precio real.
            </p>

            <form onSubmit={handleQuickSearch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-muted)' }}>
                  FECHA DE IDA
                </label>
                <input 
                  type="date" 
                  className="input-base" 
                  value={fechaIda}
                  onChange={e => setFechaIda(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-muted)' }}>
                  FECHA DE VUELTA
                </label>
                <input 
                  type="date" 
                  className="input-base" 
                  value={fechaVuelta}
                  onChange={e => setFechaVuelta(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-muted)' }}>
                  PASAJEROS
                </label>
                <select 
                  className="input-base" 
                  value={pasajeros}
                  onChange={e => setPasajeros(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Pasajeros</option>)}
                </select>
              </div>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} type="submit" className="btn btn-primary" style={{ marginTop: 8, width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700 }}>
                🚀 Buscar Paquete Real
              </motion.button>
            </form>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ marginTop: 40, textAlign: 'center', paddingBottom: 60 }}>
          <Link href="/destinos" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Volver a todos los destinos
          </Link>
        </div>
      </div>
    </main>
  )
}
