import type { Metadata } from 'next'
import HeroBanner from '@/components/organisms/HeroBanner'
import SearchBar from '@/components/organisms/SearchBar'
import DestinoCard from '@/components/molecules/DestinoCard'
import { DESTINOS } from '@/data/destinos'

export const metadata: Metadata = {
  title: 'Plataforma Turismo Chile — Paquetes Dinámicos al Mejor Precio',
  description: 'Arma tu paquete turístico ideal en Chile: vuelo + hotel al mejor precio en tiempo real. San Pedro de Atacama, Torres del Paine, Chiloé y más.',
}

export default function HomePage() {
  return (
    <main className="main-wrapper" style={{ background: 'var(--color-obsidian)', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Search Bar */}
      <section id="buscar" className="section-search" style={{ position: 'relative', zIndex: 10, marginTop: '-3rem' }}>
        <div className="container-main">
          <SearchBar />
        </div>
      </section>

      {/* Destinos Grid */}
      <section id="destinos" className="section-padding">
        <div className="container-main">
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            10 Destinos Imperdibles
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Paquetes armados en tiempo real • Precio actualizado cada 2 horas
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '2rem',
          }}>
            {DESTINOS.slice(0, 10).map((destino, i) => (
              <DestinoCard key={destino.slug} destino={destino} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="section-padding" style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container-main">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            textAlign: 'center',
          }}>
            {[
              { icon: '⚡', title: 'Precio en Tiempo Real', desc: 'Datos frescos de aerolíneas y hoteles actualizados cada 2 horas' },
              { icon: '🔒', title: 'Paquete Garantizado', desc: 'Armamos el mejor vuelo + hotel automáticamente por ti' },
              { icon: '📱', title: 'Mobile First', desc: 'Diseñado para planificar tu viaje desde el celular' },
              { icon: '🇨🇱', title: '100% Chile', desc: '10 destinos nacionales seleccionados por su impacto visual' },
            ].map(f => (
              <div key={f.title} className="feature-item">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: 'var(--color-text)',
                  marginBottom: '0.75rem',
                }}>{f.title}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
