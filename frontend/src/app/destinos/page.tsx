import type { Metadata } from 'next'
import { DESTINOS } from '@/data/destinos'
import DestinosGridClient from './DestinosGridClient'

export const metadata: Metadata = {
  title: 'Destinos en Chile | Plataforma Turismo — Vuelos, Hoteles y Paquetes',
  description: 'Explora todos los destinos turísticos en Chile disponibles para empaquetado dinámico. Encuentra vuelos, hoteles y actividades al mejor precio en San Pedro de Atacama, Torres del Paine, Chiloé, Rapa Nui y más.',
}

export default function DestinosPage() {
  return (
    <main style={{ background: 'var(--color-obsidian)', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Encabezado Visual */}
      <section style={{
        position: 'relative',
        padding: '6rem 0 4rem 0',
        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), var(--color-obsidian))',
        borderBottom: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <div className="container-main">
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '1rem',
          }}>
            Explora Chile al <span style={{ color: 'var(--color-teal)' }}>Mejor Precio</span>
          </h1>
          <p style={{
            color: 'var(--color-muted)',
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Selecciona cualquiera de nuestros destinos a lo largo del país y arma tu paquete dinámico de vuelo + hotel en tiempo real con confirmación inmediata.
          </p>
        </div>
      </section>

      {/* Grilla Interactiva y Buscador */}
      <DestinosGridClient destinos={DESTINOS} />
    </main>
  )
}
