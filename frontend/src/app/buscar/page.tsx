'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useReducer, useCallback } from 'react'
import { motion } from 'framer-motion'
import { formatPrecio, getDestinoBySlug } from '@/data/destinos'
import TabNavigation, { TabId } from '@/components/organisms/TabNavigation'
import AutosTab from '@/components/organisms/AutosTab'
import ToursTab from '@/components/organisms/ToursTab'
import BusesTab from '@/components/organisms/BusesTab'
import SmartSuggestion from '@/components/organisms/SmartSuggestion'

// ─── Tipos de la API (/api/cotizar) ───────────────────────────
interface Segmento {
  origen: string
  destino: string
  medio: string
  duracion_min: number
  operador: string
}

interface VueloOption {
  id: string
  aerolinea: string
  precio: number
  moneda: string
  origen: string
  destino_iata: string
  fecha_salida: string
  hora_salida: string
  hora_llegada: string
  duracion_min: number
  escalas: number
  fuente: string
  deep_link: string
  segmentos?: Segmento[]
  es_ruta_mixta?: boolean
}

interface HotelResponse {
  nombre: string
  precio: number
  estrellas: number
  score_calidad: number
  url_reserva: string
  fuente: string
}

interface BusOption {
  operador: string
  precio: number
  hora_salida: string
  hora_llegada: string
  duracion_min: number
  tipo: string
  deep_link: string
  fuente: string
}

interface AutoOption {
  nombre_auto: string
  categoria: string
  proveedor: string
  precio_diario: number
  precio_total: number
  noches: number
  combustible: string
  transmision: string
  plazas: number
  es_offroad: boolean
  punto_retiro: string
  url_reserva: string
  fuente: string
}

interface TourOption {
  tour: string
  precio: number
  duracion_horas: number
  incluye_traslado: boolean
  punto_encuentro: string
  url_reserva: string
  fuente: string
}

interface CrossSellSugerencia {
  tipo: string
  icono: string
  titulo: string
  mensaje: string
  ahorro_estimado: number
  tab_afectada: string
  accion: string
}

interface CotizacionAPI {
  destino: string
  destino_slug: string
  fecha_ida: string
  fecha_vuelta: string
  pasajeros: number
  vuelos: VueloOption[]
  vuelo_seleccionado: VueloOption
  hotel: HotelResponse
  buses: BusOption[]
  autos: AutoOption[]
  tours: TourOption[]
  sugerencias: CrossSellSugerencia[]
  precio_total: number
  precio_sin_descuento: number
  ahorro_estimado: number
  calidad_score: number
  es_cache: boolean
  scraped_at: string
  demo_mode: boolean
}

// ─── State Management (useReducer) ───────────────────────────
type SelectionState = {
  vueloSeleccionado: VueloOption | null
  autoSeleccionado: AutoOption | null
  toursSeleccionados: string[]
}

type SelectionAction =
  | { type: 'SET_VUELO'; payload: VueloOption }
  | { type: 'SET_AUTO'; payload: AutoOption | null }
  | { type: 'TOGGLE_TOUR'; payload: string }
  | { type: 'INIT'; payload: { vuelo: VueloOption } }

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'SET_VUELO':
      return { ...state, vueloSeleccionado: action.payload }
    case 'SET_AUTO':
      return { ...state, autoSeleccionado: action.payload }
    case 'TOGGLE_TOUR': {
      const name = action.payload
      return {
        ...state,
        toursSeleccionados: state.toursSeleccionados.includes(name)
          ? state.toursSeleccionados.filter(t => t !== name)
          : [...state.toursSeleccionados, name]
      }
    }
    case 'INIT':
      return { vueloSeleccionado: action.payload.vuelo, autoSeleccionado: null, toursSeleccionados: [] }
    default:
      return state
  }
}

// ─── Skeletons ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 180, marginBottom: 16, borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 24, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '40%' }} />
    </div>
  )
}

function LoadingState({ destino }: { destino: string }) {
  const [dots, setDots] = useState('.')
  const [step, setStep] = useState(0)
  const steps = ['Buscando vuelos', 'Consultando hoteles', 'Rastreando buses', 'Cotizando vehículos', 'Encontrando tours']

  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    const sv = setInterval(() => setStep(s => (s + 1) % steps.length), 2000)
    return () => { clearInterval(iv); clearInterval(sv) }
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 56, height: 56,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-teal)',
          borderRadius: '50%',
          margin: '0 auto 24px',
        }}
      />
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: 8 }}>
        {steps[step]}{dots}
      </h2>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: 12 }}>
        Cotización completa (5 servicios) para <strong style={{ color: 'var(--color-teal)' }}>{destino}</strong>
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
        {['✈️', '🏨', '🚌', '🛻', '🎟️'].map((emoji, i) => (
          <motion.span
            key={i}
            animate={{ opacity: i <= step ? 1 : 0.3, scale: i === step ? 1.3 : 1 }}
            style={{ fontSize: '1.2rem' }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}

function ErrorState({ message, offline }: { message: string; offline: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 500, margin: '40px auto',
      }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>{offline ? '🔌' : '⚠️'}</div>
      <h3 style={{ color: '#b91c1c', marginBottom: 8 }}>Vaya, algo salió mal</h3>
      <p style={{ color: '#991b1b', fontSize: '0.95rem', marginBottom: 24 }}>{message}</p>
      <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ background: '#dc2626' }}>
        Reintentar búsqueda
      </button>
    </motion.div>
  )
}

// ─── Componente Principal ────────────────────────────────────
function ResultadosBusqueda() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const origen = searchParams.get('origen') || 'Santiago'
  const origenIata = searchParams.get('origen_iata') || 'SCL'
  const fechaIda = searchParams.get('fecha_ida') || searchParams.get('ida') || ''
  const fechaVuelta = searchParams.get('fecha_vuelta') || searchParams.get('vuelta') || ''
  const pasajeros = parseInt(searchParams.get('pasajeros') || '1')
  const transporte = searchParams.get('transporte') || 'avion'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CotizacionAPI | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('paquete')

  const [selection, dispatch] = useReducer(selectionReducer, {
    vueloSeleccionado: null,
    autoSeleccionado: null,
    toursSeleccionados: [],
  })

  const destinoData = getDestinoBySlug(slug)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          slug, origen, origen_iata: origenIata,
          ida: fechaIda, vuelta: fechaVuelta,
          pasajeros: pasajeros.toString(), transporte,
        })
        const res = await fetch(`/api/cotizar?${params.toString()}`)
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Error desconocido' }))
          throw new Error(errData.error || 'Error en la cotización')
        }
        const result: CotizacionAPI = await res.json()
        setData(result)
        dispatch({ type: 'INIT', payload: { vuelo: result.vuelo_seleccionado } })
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'No pudimos conectar con el servidor')
      } finally {
        setLoading(false)
      }
    }
    if (slug && fechaIda) fetchData()
  }, [slug, fechaIda, fechaVuelta, pasajeros, transporte, origen, origenIata])

  // Calcular precio total reactivo
  const calcPrecioTotal = useCallback(() => {
    if (!data) return 0
    const vuelo = selection.vueloSeleccionado?.precio || 0
    const hotel = data.hotel.precio || 0
    const auto = selection.autoSeleccionado?.precio_total || 0
    const tours = data.tours
      .filter(t => selection.toursSeleccionados.includes(t.tour))
      .reduce((sum, t) => sum + t.precio, 0)
    return (vuelo + hotel) * pasajeros + auto + tours * pasajeros
  }, [data, selection, pasajeros])

  const handleTabChange = useCallback((tab: TabId) => setActiveTab(tab), [])

  if (loading) return <LoadingState destino={destinoData?.nombre || slug} />
  if (error) return <ErrorState message={error} offline={error.includes('connect')} />
  if (!data) return null

  const precioTotal = calcPrecioTotal()

  const tabCounts: Record<TabId, number> = {
    paquete: 0,
    vuelos: data.vuelos.length,
    hoteles: 1,
    buses: data.buses.length,
    autos: data.autos.length,
    tours: data.tours.length,
  }

  const buildReservaUrl = () => {
    if (!data) return '#'
    const params = new URLSearchParams({
      destino: data.destino,
      precio: String(precioTotal),
      pasajeros: String(pasajeros),
      vuelo: selection.vueloSeleccionado ? `${selection.vueloSeleccionado.aerolinea} (${selection.vueloSeleccionado.hora_salida})` : 'No seleccionado',
      hotel: `${data.hotel.nombre} (${'★'.repeat(Math.floor(data.hotel.estrellas))})`,
    })
    if (selection.autoSeleccionado) {
      params.append('auto', `${selection.autoSeleccionado.nombre_auto} (${selection.autoSeleccionado.proveedor})`)
    }
    if (selection.toursSeleccionados.length > 0) {
      params.append('tours', selection.toursSeleccionados.join(', '))
    }
    return `/reserva?${params.toString()}`
  }

  return (
    <div className="ota-layout" id="resultados-busqueda">
      {/* ─── Sidebar Izquierda: Resumen del Paquete ─── */}
      <aside className="ota-sidebar">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="destination-brief">
          <div className="dest-hero-mini" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7)), url(${destinoData?.imagen})` }}>
            <h2>{data.destino}</h2>
            <p>{destinoData?.region}</p>
          </div>

          <div className="package-summary-card">
            <h3>Tu Paquete OTA</h3>
            <div className="summary-item"><span>Ruta</span><strong>{origen} → {data.destino}</strong></div>
            <div className="summary-item"><span>Fechas</span>
              <strong>
                {fechaIda && !isNaN(new Date(fechaIda).getTime()) ? new Date(fechaIda).toLocaleDateString() : '-'} -
                {fechaVuelta && !isNaN(new Date(fechaVuelta).getTime()) ? new Date(fechaVuelta).toLocaleDateString() : '-'}
              </strong>
            </div>
            <div className="summary-item"><span>Viajeros</span><strong>{pasajeros} {pasajeros === 1 ? 'persona' : 'personas'}</strong></div>

            <hr style={{ margin: '16px 0', borderColor: 'var(--color-border)' }} />

            {/* Desglose */}
            <div className="price-breakdown">
              <div className="bd-row">
                <span>✈️ Vuelo</span>
                <span>{formatPrecio((selection.vueloSeleccionado?.precio || 0) * pasajeros)}</span>
              </div>
              <div className="bd-row">
                <span>🏨 Hotel</span>
                <span>{formatPrecio(data.hotel.precio * pasajeros)}</span>
              </div>
              {selection.autoSeleccionado && (
                <div className="bd-row">
                  <span>🛻 Auto</span>
                  <span>{formatPrecio(selection.autoSeleccionado.precio_total)}</span>
                </div>
              )}
              {selection.toursSeleccionados.length > 0 && (
                <div className="bd-row">
                  <span>🎟️ Tours ({selection.toursSeleccionados.length})</span>
                  <span>{formatPrecio(
                    data.tours.filter(t => selection.toursSeleccionados.includes(t.tour)).reduce((s, t) => s + t.precio, 0) * pasajeros
                  )}</span>
                </div>
              )}
            </div>

            <div className="price-big">
              <span className="label">Total del viaje</span>
              <span className="value">{formatPrecio(precioTotal)}</span>
              <span className="discount">Ahorras {formatPrecio(data.ahorro_estimado)}</span>
            </div>
          </div>

          <div className="transparency-notice" style={{ background: data.demo_mode ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)' }}>
            <p>
              {data.demo_mode ? (
                <><span style={{ color: '#d97706' }}>⚠️ Datos Referenciales</span><br />
                Precios son estimaciones basadas en promedios históricos.</>
              ) : (
                <><span style={{ color: '#059669' }}>✅ Precios Reales (Hybrid Engine)</span><br />
                {data.scraped_at && !isNaN(new Date(data.scraped_at).getTime()) && (
                  <>Actualizado hace {Math.round((Date.now() - new Date(data.scraped_at).getTime()) / 60000)} min.</>
                )}</>
              )}
            </p>
          </div>

          {/* Botón de Reserva */}
          <motion.a
            href={buildReservaUrl()}
            className="btn btn-primary checkout-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Reservar Paquete
          </motion.a>
        </motion.div>
      </aside>

      {/* ─── Main Content: Pestañas + Mapa ─── */}
      <main className="ota-main">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} counts={tabCounts} />

        {/* Cross-Selling Banners */}
        {data.sugerencias.length > 0 && (activeTab === 'paquete' || activeTab === 'autos' || activeTab === 'tours') && (
          <SmartSuggestion
            sugerencias={data.sugerencias}
            onNavigateTab={(tab) => setActiveTab(tab as TabId)}
          />
        )}

        {/* ─── TAB: Paquete Completo ─── */}
        {activeTab === 'paquete' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="paquete">
            <div className="paquete-overview">
              <div className="paquete-card">
                <div className="paq-header">✈️ Vuelo Seleccionado</div>
                <div className="paq-body">
                  <strong>{selection.vueloSeleccionado?.aerolinea}</strong>
                  <span>{selection.vueloSeleccionado?.hora_salida} → {selection.vueloSeleccionado?.hora_llegada}</span>
                  <span className="paq-price">{formatPrecio(selection.vueloSeleccionado?.precio || 0)}</span>
                </div>
                {selection.vueloSeleccionado?.deep_link && selection.vueloSeleccionado.deep_link !== '#' && (
                  <a
                    href={selection.vueloSeleccionado.deep_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-change"
                    style={{ marginTop: '8px', display: 'block', textAlign: 'center', borderColor: 'var(--color-teal)', color: 'var(--color-teal)', textDecoration: 'none', marginBottom: '8px' }}
                  >
                    Ver Vuelo Externo ↗
                  </a>
                )}
                <button className="btn-change" onClick={() => setActiveTab('vuelos')}>Cambiar Vuelo ✏️</button>
              </div>

              <div className="paquete-card">
                <div className="paq-header">🏨 Hotel</div>
                <div className="paq-body">
                  <strong>{data.hotel.nombre}</strong>
                  <span>{'★'.repeat(Math.floor(data.hotel.estrellas))} · {data.hotel.score_calidad}</span>
                  <span className="paq-price">{formatPrecio(data.hotel.precio)}/noche</span>
                </div>
                {data.hotel.url_reserva && data.hotel.url_reserva !== '#' && (
                  <a
                    href={data.hotel.url_reserva}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-change"
                    style={{ marginTop: '8px', display: 'block', textAlign: 'center', borderColor: 'var(--color-teal)', color: 'var(--color-teal)', textDecoration: 'none', marginBottom: '8px' }}
                  >
                    Ver Hotel Externo ↗
                  </a>
                )}
                <button className="btn-change" onClick={() => setActiveTab('hoteles')}>Cambiar Hotel ✏️</button>
              </div>

              {data.buses.length > 0 && (
                <div className="paquete-card">
                  <div className="paq-header">🚌 Bus ({data.buses.length} rutas)</div>
                  <div className="paq-body">
                    <strong>Desde {formatPrecio(Math.min(...data.buses.map(b => b.precio)))}</strong>
                    <span>{data.buses[0]?.operador} y más</span>
                  </div>
                  {data.buses[0]?.deep_link && data.buses[0].deep_link !== '#' && (
                    <a
                      href={data.buses[0].deep_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-change"
                      style={{ marginTop: '8px', display: 'block', textAlign: 'center', borderColor: 'var(--color-teal)', color: 'var(--color-teal)', textDecoration: 'none', marginBottom: '8px' }}
                    >
                      Ver Bus Externo ↗
                    </a>
                  )}
                  <button className="btn-change" onClick={() => setActiveTab('buses')}>Ver Buses ✏️</button>
                </div>
              )}

              {data.autos.length > 0 && (
                <div className="paquete-card">
                  <div className="paq-header">🛻 Autos ({data.autos.length})</div>
                  <div className="paq-body">
                    <strong>{selection.autoSeleccionado ? selection.autoSeleccionado.nombre_auto : 'Sin vehículo'}</strong>
                    <span>{selection.autoSeleccionado
                      ? `${formatPrecio(selection.autoSeleccionado.precio_diario)}/día · ${selection.autoSeleccionado.proveedor}`
                      : `Desde ${formatPrecio(Math.min(...data.autos.map(a => a.precio_diario)))}/día`
                    }</span>
                  </div>
                  {selection.autoSeleccionado?.url_reserva && selection.autoSeleccionado.url_reserva !== '#' && (
                    <a
                      href={selection.autoSeleccionado.url_reserva}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-change"
                      style={{ marginTop: '8px', display: 'block', textAlign: 'center', borderColor: 'var(--color-teal)', color: 'var(--color-teal)', textDecoration: 'none', marginBottom: '8px' }}
                    >
                      Ver Auto Externo ↗
                    </a>
                  )}
                  <button className="btn-change" onClick={() => setActiveTab('autos')}>
                    {selection.autoSeleccionado ? 'Cambiar Auto ✏️' : 'Agregar Auto +'}
                  </button>
                </div>
              )}

              {data.tours.length > 0 && (
                <div className="paquete-card">
                  <div className="paq-header">🎟️ Tours ({selection.toursSeleccionados.length}/{data.tours.length})</div>
                  <div className="paq-body">
                    <strong>{selection.toursSeleccionados.length > 0
                      ? `${selection.toursSeleccionados.length} seleccionados`
                      : 'Sin tours'}</strong>
                    <span>Desde {formatPrecio(Math.min(...data.tours.map(t => t.precio)))}</span>
                  </div>
                  {selection.toursSeleccionados.length > 0 && (() => {
                    const tourObj = data.tours.find(t => t.tour === selection.toursSeleccionados[0]);
                    if (tourObj?.url_reserva && tourObj.url_reserva !== '#') {
                      return (
                        <a
                          href={tourObj.url_reserva}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-change"
                          style={{ marginTop: '8px', display: 'block', textAlign: 'center', borderColor: 'var(--color-teal)', color: 'var(--color-teal)', textDecoration: 'none', marginBottom: '8px' }}
                        >
                          Ver Tour Externo ↗
                        </a>
                      );
                    }
                    return null;
                  })()}
                  <button className="btn-change" onClick={() => setActiveTab('tours')}>
                    {selection.toursSeleccionados.length > 0 ? 'Modificar Tours ✏️' : 'Agregar Tours +'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── TAB: Vuelos ─── */}
        {activeTab === 'vuelos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="vuelos">
            <section className="options-section">
              <div className="section-header">
                <h3>✈️ Selecciona tu Vuelo</h3>
                <span>{data.vuelos.length} opciones</span>
              </div>
              <div className="options-list">
                {data.vuelos.map((v) => (
                  <motion.div
                    key={v.id}
                    className={`option-card flight ${selection.vueloSeleccionado?.id === v.id ? 'active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_VUELO', payload: v })}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="option-info">
                      <div className="airline-info">
                        <div className="airline-logo">{v.es_ruta_mixta ? '🗺️' : v.aerolinea[0]}</div>
                        <div>
                          <span className="name">{v.aerolinea}</span>
                          <span className="type">
                            {v.es_ruta_mixta ? 'Ruta con conexión' : v.escalas === 0 ? 'Directo' : `${v.escalas} escalas`}
                            {' • '}{Math.floor(v.duracion_min / 60)}h {v.duracion_min % 60}m
                          </span>
                        </div>
                      </div>
                      <div className="times">
                        <div className="time"><strong>{v.hora_salida}</strong><span>{v.origen}</span></div>
                        <div className="path-line" />
                        <div className="time"><strong>{v.hora_llegada}</strong><span>{v.destino_iata}</span></div>
                      </div>
                    </div>
                    <div className="option-price">
                      <span className="price">{formatPrecio(v.precio)}</span>
                      <span className="p-p">p/persona</span>
                      {selection.vueloSeleccionado?.id === v.id && <span className="badge">Seleccionado</span>}
                      {v.deep_link && v.deep_link !== '#' && (
                        <a
                          href={v.deep_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--color-teal)', textDecoration: 'none', display: 'block', marginTop: '8px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver vuelo externo ↗
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ─── TAB: Hoteles ─── */}
        {activeTab === 'hoteles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="hoteles">
            <section className="options-section">
              <div className="section-header"><h3>🏨 Hotel Seleccionado</h3></div>
              <div className="option-card hotel active">
                <div className="hotel-image" style={{ width: 120, height: 100, borderRadius: 12, background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                  <img src={destinoData?.imagen} alt="hotel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="option-info">
                  <div className="hotel-meta">
                    <span className="stars">{'★'.repeat(Math.floor(data.hotel.estrellas))}</span>
                    <span className="score">{data.hotel.score_calidad} Extraordinario</span>
                  </div>
                  <h4 className="hotel-name">{data.hotel.nombre}</h4>
                  <p className="hotel-location">{data.destino}, Chile</p>
                </div>
                <div className="option-price">
                  <span className="price">{formatPrecio(data.hotel.precio)}</span>
                  <span className="p-p">p/noche</span>
                </div>
              </div>
              {data.hotel.url_reserva && data.hotel.url_reserva !== '#' && (
                <a href={data.hotel.url_reserva} target="_blank" rel="noopener noreferrer"
                   className="btn btn-secondary" style={{ marginTop: 16, display: 'inline-block' }}>
                  🏨 Ver en Booking.com ↗
                </a>
              )}
            </section>
          </motion.div>
        )}

        {/* ─── TAB: Buses ─── */}
        {activeTab === 'buses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="buses">
            <BusesTab buses={data.buses} origen={origen} destino={data.destino} />
          </motion.div>
        )}

        {/* ─── TAB: Autos ─── */}
        {activeTab === 'autos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="autos">
            <AutosTab
              autos={data.autos}
              selectedAuto={selection.autoSeleccionado}
              onSelectAuto={(auto) => dispatch({
                type: 'SET_AUTO',
                payload: selection.autoSeleccionado?.nombre_auto === auto.nombre_auto ? null : auto
              })}
            />
          </motion.div>
        )}

        {/* ─── TAB: Tours ─── */}
        {activeTab === 'tours' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="tours">
            <ToursTab
              tours={data.tours}
              selectedTours={selection.toursSeleccionados}
              onToggleTour={(name) => dispatch({ type: 'TOGGLE_TOUR', payload: name })}
            />
          </motion.div>
        )}
      </main>

      <style jsx>{`
        .ota-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 40px;
          max-width: 1920px;
          margin: 0 auto;
          padding: 40px clamp(1rem, 5vw, 5rem);
        }
        .ota-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }
        .dest-hero-mini {
          height: 160px;
          border-radius: 20px;
          background-size: cover;
          background-position: center;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          color: white;
          margin-bottom: 24px;
        }
        .dest-hero-mini h2 { font-size: 1.4rem; margin: 0; }
        .dest-hero-mini p { font-size: 0.85rem; opacity: 0.8; margin: 0; }
        .package-summary-card {
          background: var(--color-surface);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border: 1px solid var(--color-border);
          margin-bottom: 20px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }
        .price-breakdown { margin: 12px 0; }
        .bd-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--color-muted);
          margin-bottom: 4px;
        }
        .price-big { text-align: center; margin-top: 16px; }
        .price-big .label { display: block; font-size: 0.75rem; color: var(--color-muted); }
        .price-big .value { display: block; font-size: 1.8rem; font-weight: 800; color: var(--color-teal); margin: 4px 0; }
        .price-big .discount { font-size: 0.85rem; color: #059669; font-weight: 600; }
        .transparency-notice { padding: 16px; border-radius: 12px; font-size: 0.75rem; line-height: 1.4; margin-bottom: 16px; }
        .checkout-btn {
          display: block !important;
          width: 100%;
          text-align: center;
          padding: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(45, 212, 191, 0.4);
        }

        /* Tabs Content */
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h3 { font-size: 1.1rem; margin: 0; }
        .section-header span { font-size: 0.8rem; color: var(--color-muted); }
        .options-list { display: grid; gap: 16px; }
        .option-card {
          background: var(--color-surface);
          backdrop-filter: blur(16px);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .option-card.active { border-color: var(--color-teal); background: rgba(20, 184, 166, 0.1); }
        .option-card:hover { border-color: var(--color-teal); box-shadow: 0 8px 25px rgba(20, 184, 166, 0.2); }
        .airline-info { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .airline-logo {
          width: 32px; height: 32px; background: var(--color-bg-secondary);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-weight: 800; color: var(--color-teal);
        }
        .airline-info .name { display: block; font-weight: 600; font-size: 0.95rem; }
        .airline-info .type { font-size: 0.75rem; color: var(--color-muted); }
        .times { display: flex; align-items: center; gap: 20px; }
        .time strong { display: block; font-size: 1.2rem; }
        .time span { font-size: 0.75rem; color: var(--color-muted); }
        .path-line { width: 60px; height: 2px; background: var(--color-border); position: relative; }
        .path-line::after { content: '✈'; position: absolute; right: 0; top: -8px; font-size: 12px; color: var(--color-muted); }
        .option-price { text-align: right; min-width: 120px; }
        .option-price .price { display: block; font-size: 1.3rem; font-weight: 800; color: var(--color-text); }
        .option-price .p-p { font-size: 0.7rem; color: var(--color-muted); }
        .badge { background: var(--color-teal); color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; margin-top: 8px; display: inline-block; }
        .hotel-name { margin: 4px 0; font-size: 1rem; }
        .hotel-meta { display: flex; gap: 12px; align-items: center; font-size: 0.75rem; }
        .stars { color: #f59e0b; }
        .score { color: #059669; font-weight: 600; }

        /* Paquete Overview */
        .paquete-overview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .paquete-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.2s;
        }
        .paquete-card:hover { border-color: rgba(20, 184, 166, 0.3); }
        .paq-header {
          font-size: 0.75rem;
          color: var(--color-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .paq-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }
        .paq-body strong { font-size: 0.95rem; color: var(--color-text); }
        .paq-body span { font-size: 0.78rem; color: var(--color-muted); }
        .paq-price { color: var(--color-teal) !important; font-weight: 700 !important; font-size: 1rem !important; }
        .btn-change {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-teal);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
          font-family: var(--font-body);
        }
        .btn-change:hover { background: rgba(20, 184, 166, 0.1); border-color: var(--color-teal); }

        @media (max-width: 900px) {
          .ota-layout { grid-template-columns: 1fr; }
          .ota-sidebar { position: relative; top: 0; }
        }
      `}</style>
    </div>
  )
}

export default function BuscarPage() {
  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <Suspense fallback={<LoadingState destino="Chile" />}>
        <ResultadosBusqueda />
      </Suspense>
    </div>
  )
}
