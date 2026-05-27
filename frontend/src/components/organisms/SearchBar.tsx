'use client'

import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Destino } from '@/data/destinos'

// ─── Ciudades de Origen disponibles ──────────────────────────
const ORIGENES = [
  { nombre: 'Santiago',       iata: 'SCL', terminal: 'Terminal Alameda / Aeropuerto SCL' },
  { nombre: 'Concepción',     iata: 'CCP', terminal: 'Terminal Collao / Aeropuerto Carriel Sur' },
  { nombre: 'Valparaíso',     iata: 'SCL', terminal: 'Terminal Rodoviario / Aeropuerto SCL (traslado)' },
  { nombre: 'La Serena',      iata: 'LSC', terminal: 'Terminal de Buses / Aeropuerto La Florida' },
  { nombre: 'Temuco',         iata: 'ZCO', terminal: 'Terminal Rodoviario / Aeropuerto Araucanía' },
  { nombre: 'Puerto Montt',   iata: 'PMC', terminal: 'Terminal de Buses / Aeropuerto El Tepual' },
  { nombre: 'Antofagasta',    iata: 'ANF', terminal: 'Terminal de Buses / Aeropuerto Cerro Moreno' },
  { nombre: 'Iquique',        iata: 'IQQ', terminal: 'Terminal Rodoviario / Aeropuerto Diego Aracena' },
  { nombre: 'Punta Arenas',   iata: 'PUQ', terminal: 'Terminal de Buses / Aeropuerto Ibáñez' },
  { nombre: 'Arica',          iata: 'ARI', terminal: 'Terminal Rodoviario / Aeropuerto Chacalluta' },
]

// Mapa de regiones a hubs de buses para Atracciones Turísticas
const REGION_HUB_MAP: Record<string, string> = {
  'Antofagasta': 'antofagasta',
  'Tarapacá': 'iquique',
  "O'Higgins": 'rancagua',
  'Metropolitana': 'santiago',
  'Valparaíso': 'valparaiso',
  'Los Lagos': 'puerto-montt',
  'Magallanes': 'punta-arenas',
  'Los Ríos': 'valdivia',
  'Arica y Parinacota': 'arica',
  'Coquimbo': 'la-serena',
  'La Araucanía': 'temuco',
  'Atacama': 'copiapo',
  'Maule': 'talca',
  'Ñuble': 'chillan',
  'Biobío': 'concepcion',
  'Aysén': 'coyhaique',
}

export default function SearchBar() {
  const router = useRouter()
  const [origen, setOrigen] = useState('Santiago')
  const [destino, setDestino] = useState('')
  const [fechaIda, setFechaIda] = useState('')
  const [fechaVuelta, setFechaVuelta] = useState('')
  const [pasajeros, setPasajeros] = useState(1)
  const [modoTransporte, setModoTransporte] = useState<'avion' | 'bus'>('avion')
  const [loading, setLoading] = useState(false)
  const [destinos, setDestinos] = useState<Destino[]>([])

  useEffect(() => {
    fetch('http://localhost:8001/api/destinos')
      .then(res => res.json())
      .then(data => setDestinos(data.destinos))
      .catch(err => console.error("Error al cargar destinos:", err))
  }, [])

  // Agrupar destinos por región para el dropdown
  const destinosPorRegion = useMemo(() => {
    const grupos: Record<string, Destino[]> = {}
    destinos.forEach(d => {
      if (!grupos[d.region]) grupos[d.region] = []
      grupos[d.region].push(d)
    })
    // Ordenar alfabéticamente
    Object.keys(grupos).forEach(region => {
      grupos[region].sort((a, b) => a.nombre.localeCompare(b.nombre))
    })
    return grupos
  }, [destinos])

  const origenData = ORIGENES.find(o => o.nombre === origen)
  const destOrigenData = !origenData ? destinos.find(d => d.nombre === origen) : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origen || !destino || !fechaIda || !fechaVuelta) return
    
    // Resolver IATA de Origen
    let origen_iata = 'SCL'
    if (origenData) {
      origen_iata = origenData.iata
    } else if (destOrigenData) {
      origen_iata = destOrigenData.codigoIATA
    }

    // Buscar el slug correcto usando los datos reales
    const destinoObj = destinos.find(d => d.nombre === destino)
    const slug = destinoObj ? destinoObj.slug : destino.toLowerCase().replace(/\s+/g, '-')
    
    const params = new URLSearchParams({
      origen,
      origen_iata,
      destino,
      slug,
      ida: fechaIda,
      vuelta: fechaVuelta,
      pasajeros: String(pasajeros),
      transporte: modoTransporte,
    })
    router.push(`/buscar?${params.toString()}`)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(15,23,42,0.9)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'var(--color-muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: 6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border)',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6), var(--shadow-glow)',
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
      }}
    >
      <form onSubmit={handleSearch}>
        {/* Selector de Modo de Transporte */}
        <div className="transport-selector">
          <button 
            type="button"
            className={`transport-btn ${modoTransporte === 'avion' ? 'active' : ''}`}
            onClick={() => setModoTransporte('avion')}
          >
            ✈️ Por Aire
          </button>
          <button 
            type="button"
            className={`transport-btn ${modoTransporte === 'bus' ? 'active' : ''}`}
            onClick={() => setModoTransporte('bus')}
          >
            🚌 Por Tierra
          </button>
        </div>

        {/* Fila 1: Origen → Destino */}
        <div className="route-row">
          <div className="route-field">
            <label style={labelStyle}>🚀 Origen</label>
            <select
              value={origen}
              onChange={e => setOrigen(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', height: '56px' }}
              required
            >
              <optgroup label="📍 Ciudades Principales">
                {ORIGENES.map(o => (
                  <option key={o.nombre} value={o.nombre}>
                    {modoTransporte === 'avion' ? `${o.nombre} (${o.iata})` : o.nombre}
                  </option>
                ))}
              </optgroup>
              {Object.entries(destinosPorRegion).map(([region, lugares]) => (
                <optgroup key={region} label={`📍 Región de ${region}`}>
                  {lugares.map(d => (
                    <option key={d.slug} value={d.nombre}>
                      {modoTransporte === 'avion' ? `${d.nombre} (${d.codigoIATA})` : d.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="route-arrow">
            <span>{modoTransporte === 'avion' ? '✈️' : '🚌'}</span>
            <div className="route-line" />
          </div>

          <div className="route-field">
            <label style={labelStyle}>📍 Destino</label>
            <select
              value={destino}
              onChange={e => setDestino(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', height: '56px' }}
              required
            >
              <option value="">Elige tu destino</option>
              {Object.entries(destinosPorRegion).map(([region, lugares]) => (
                <optgroup key={region} label={`📍 Región de ${region}`}>
                  {lugares.map(d => (
                    <option key={d.slug} value={d.nombre}>{d.nombre}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Info de terminal/aeropuerto según modo */}
        <div className="terminal-hint">
          {origenData ? (
            modoTransporte === 'avion'
              ? `Sale desde: Aeropuerto ${origenData.nombre} (${origenData.iata})`
              : `Sale desde: Terminal de Buses ${origenData.nombre}`
          ) : destOrigenData ? (
            modoTransporte === 'avion'
              ? `Sale desde: Aeropuerto más cercano (${destOrigenData.codigoIATA})`
              : `Sale desde: Terminal de Buses en ${REGION_HUB_MAP[destOrigenData.region] || destOrigenData.region}`
          ) : ''}
        </div>

        {/* Fila 2: Fechas + Pax + Botón */}
        {/* Fila 2: Fechas + Pax + Botón */}
        <div className="second-row">
          {/* Fecha ida */}
          <div>
            <label style={labelStyle}>{modoTransporte === 'avion' ? '✈️' : '🚌'} Fecha de ida</label>
            <input
              type="date"
              value={fechaIda}
              onChange={e => setFechaIda(e.target.value)}
              min={new Date().toLocaleDateString('en-CA')}
              style={{ ...inputStyle, height: '56px' }}
              required
            />
          </div>

          {/* Fecha vuelta */}
          <div>
            <label style={labelStyle}>🏠 Fecha de vuelta</label>
            <input
              type="date"
              value={fechaVuelta}
              onChange={e => setFechaVuelta(e.target.value)}
              min={fechaIda || new Date().toLocaleDateString('en-CA')}
              style={{ ...inputStyle, height: '56px' }}
              required
            />
          </div>

          {/* Pasajeros */}
          <div>
            <label style={labelStyle}>👤 Pax</label>
            <select
              value={pasajeros}
              onChange={e => setPasajeros(Number(e.target.value))}
              style={{ ...inputStyle, cursor: 'pointer', height: '56px', padding: '12px' }}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Botón Buscar */}
          <div className="search-action">
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', height: '56px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? 'Buscando...' : '🔍 Buscar Paquetes'}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .transport-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: rgba(0,0,0,0.3);
          padding: 6px;
          border-radius: 14px;
          width: fit-content;
          border: 1px solid var(--color-border);
        }
        .transport-btn {
          padding: 10px 24px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--color-muted);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .transport-btn:hover {
          color: var(--color-teal);
          background: rgba(45, 212, 191, 0.05);
        }
        .transport-btn.active {
          background: var(--color-teal);
          color: #042f2e;
          box-shadow: 0 4px 20px rgba(45, 212, 191, 0.3);
        }

        /* ─── Ruta Origen → Destino ─── */
        .route-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.75rem;
          align-items: end;
          margin-bottom: 0.5rem;
        }
        .route-field { flex: 1; }
        .route-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding-bottom: 10px;
          color: var(--color-teal);
          font-size: 1.3rem;
        }
        .route-line {
          width: 2px;
          height: 16px;
          background: linear-gradient(to bottom, var(--color-teal), transparent);
          border-radius: 2px;
        }
        .terminal-hint {
          font-size: 0.75rem;
          color: var(--color-muted);
          background: rgba(45, 212, 191, 0.06);
          border: 1px solid rgba(45, 212, 191, 0.12);
          border-radius: 8px;
          padding: 8px 14px;
          margin-bottom: 0.25rem;
          letter-spacing: 0.02em;
        }

        /* ─── Fila 2: Fechas + Pax + Botón ─── */
        .second-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 2fr;
          gap: 1rem;
          align-items: end;
          margin-top: 1.25rem;
        }

        @media (max-width: 1024px) {
          .second-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .route-row {
            grid-template-columns: 1fr;
          }
          .route-arrow {
            flex-direction: row;
            justify-content: center;
            padding: 0;
          }
          .route-line {
            width: 30px;
            height: 2px;
          }
          .second-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </motion.div>
  )
}
