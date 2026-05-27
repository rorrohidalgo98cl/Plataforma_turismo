'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Destino } from '@/data/destinos'
import DestinoCard from '@/components/molecules/DestinoCard'

interface DestinosGridClientProps {
  destinos: Destino[]
}

export default function DestinosGridClient({ destinos }: DestinosGridClientProps) {
  const [busqueda, setBusqueda] = useState('')
  const [regionSeleccionada, setRegionSeleccionada] = useState('Todas')

  // Obtener lista única de regiones
  const regiones = useMemo(() => {
    const lista = Array.from(new Set(destinos.map(d => d.region))).filter(Boolean)
    return ['Todas', ...lista]
  }, [destinos])

  // Filtrar destinos según búsqueda y región
  const destinosFiltrados = useMemo(() => {
    return destinos.filter(destino => {
      const coincideRegion = regionSeleccionada === 'Todas' || destino.region === regionSeleccionada
      const textoBusqueda = busqueda.toLowerCase()
      const coincideBusqueda = 
        destino.nombre.toLowerCase().includes(textoBusqueda) ||
        destino.region.toLowerCase().includes(textoBusqueda) ||
        (destino.tagline && destino.tagline.toLowerCase().includes(textoBusqueda)) ||
        destino.tags.some(t => t.toLowerCase().includes(textoBusqueda))

      return coincideRegion && coincideBusqueda
    })
  }, [destinos, busqueda, regionSeleccionada])

  return (
    <div className="container-main" style={{ padding: '2rem 0 6rem 0' }}>
      {/* Buscador y Filtros */}
      <div className="bg-glass" style={{
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '3rem',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* Barra de búsqueda */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por ciudad, región, atractivo o actividad (ej. Atacama, playa, trekking)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-base"
              style={{
                width: '100%',
                padding: '16px 16px 16px 50px',
                fontSize: '1rem',
                fontFamily: 'var(--font-heading)',
              }}
            />
          </div>

          {/* Filtros por Región */}
          <div>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--color-muted)',
              marginBottom: '0.75rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}>
              FILTRAR POR REGIÓN:
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              {regiones.map(region => {
                const active = regionSeleccionada === region
                return (
                  <button
                    key={region}
                    onClick={() => setRegionSeleccionada(region)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: active ? '1px solid var(--color-teal)' : '1px solid var(--color-border)',
                      background: active ? 'rgba(45, 212, 191, 0.1)' : 'var(--color-obsidian)',
                      color: active ? 'var(--color-teal)' : 'var(--color-text)',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: active ? '0 0 10px rgba(45, 212, 191, 0.2)' : 'none',
                    }}
                    className="hover:border-[#2dd4bf]"
                  >
                    {region}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          Mostrando <span style={{ color: 'var(--color-teal)', fontWeight: 700 }}>{destinosFiltrados.length}</span> destinos disponibles
        </p>
        {(busqueda || regionSeleccionada !== 'Todas') && (
          <button
            onClick={() => { setBusqueda(''); setRegionSeleccionada('Todas'); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-teal)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grilla de Destinos */}
      {destinosFiltrados.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            No encontramos destinos que coincidan
          </h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
            Intenta con otros términos de búsqueda o selecciona una región diferente.
          </p>
          <button
            onClick={() => { setBusqueda(''); setRegionSeleccionada('Todas'); }}
            className="btn btn-primary"
            style={{ padding: '8px 24px' }}
          >
            Ver todos los destinos
          </button>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '2rem',
        }}>
          <AnimatePresence>
            {destinosFiltrados.map((destino, i) => (
              <DestinoCard key={`${destino.slug}-${i}`} destino={destino} index={i % 10} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
