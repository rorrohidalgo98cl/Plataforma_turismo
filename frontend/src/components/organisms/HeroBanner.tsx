'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Imágenes hero cinemáticas de destinos chilenos en alta calidad (Unsplash)
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1544183946-4e9fdf5f9b17?w=1920&q=90',
    destino: 'San Pedro de Atacama',
    description: 'Atardecer mágico en el Valle de la Luna, salares hiperdetallados y rayos dorados sobre el desierto.',
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=90',
    destino: 'Torres del Paine',
    description: 'Los majestuosos cuernos del Paine bajo una luz de atardecer patagónico y nubes dramáticas.',
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90',
    destino: 'Isla de Pascua',
    description: 'Misteriosos Moais guardianes bajo un cielo estrellado y el sonido del mar en Rapa Nui.',
  },
  {
    url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1920&q=90',
    destino: 'Patagonia Verde',
    description: 'Bosques valdivianos milenarios y ríos de aguas esmeralda cubiertos por una suave bruma matinal.',
  },
  {
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=90',
    destino: 'Capillas de Mármol',
    description: 'Impresionantes formaciones de mármol esculpidas por las aguas turquesas del Lago General Carrera.',
  },
]

export default function HeroBanner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 600,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background imágenes cinemáticas con Ken Burns & Crossfade */}
      {HERO_IMAGES.map((img, index) => (
        <motion.div
          key={img.url}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: index === currentImageIndex ? 1 : 0,
            scale: index === currentImageIndex ? 1 : 1.1,
          }}
          transition={{
            opacity: { duration: 1.5, ease: 'easeInOut' },
            scale: { duration: 6, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${img.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ))}

      {/* Overlay gradiente oscuro */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.5) 50%, rgba(4,47,46,0.6) 100%)',
        zIndex: 1,
      }} />

      {/* Contenido */}
      <div className="container-main" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}
          >
            <div style={{ width: 40, height: 2, background: 'var(--color-teal)' }} />
            <span style={{
              color: 'var(--color-teal)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              Dynamic Packaging • Chile
            </span>
          </motion.div>

          {/* Título principal */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 8vw, 6.5rem)',
            lineHeight: 1.0,
            color: '#fff',
            marginBottom: '2rem',
            letterSpacing: '-0.03em',
          }}>
            Tu aventura <span style={{
              background: 'linear-gradient(135deg, var(--color-teal), #67e8f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>perfecta</span> en Chile, armada en segundos
          </h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              color: 'rgba(241,245,249,0.85)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: '1000px',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Vuelo + Hotel al precio más bajo garantizado. Datos en tiempo real de
            aerolíneas y hoteles. 10 destinos nacionales icónicos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <a href="#buscar" className="btn btn-primary">
              🔍 Buscar mi paquete
            </a>
            <a href="#destinos" className="btn btn-secondary">
              Ver destinos
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            style={{
              display: 'flex',
              gap: 'clamp(1.5rem, 4vw, 3rem)',
              marginTop: '4rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { num: '10', label: 'Destinos en Chile' },
              { num: '2h', label: 'Datos actualizados' },
              { num: '15%', label: 'Ahorro promedio' },
            ].map(stat => (
              <div key={stat.label}>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  color: 'var(--color-teal)',
                  lineHeight: 1,
                }}>
                  {stat.num}
                </p>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 6, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Selector de Imágenes (Carousel Indicators) */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        right: 40,
        zIndex: 20,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(16px)',
        padding: '10px 16px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }} className="carousel-controls-desktop">
        <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600, marginRight: '4px' }}>Destino:</span>
        {HERO_IMAGES.map((img, idx) => (
          <motion.button
            key={img.destino}
            onClick={() => setCurrentImageIndex(idx)}
            style={{
              background: idx === currentImageIndex ? 'var(--color-teal)' : 'rgba(255,255,255,0.15)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '12px',
              color: idx === currentImageIndex ? '#000' : '#fff',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: idx === currentImageIndex ? '0 0 15px var(--color-teal)' : 'none',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {img.destino.split(' ')[0]}
          </motion.button>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          color: 'var(--color-muted)',
          fontSize: '0.8rem',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 1,
          height: 40,
          background: 'linear-gradient(to bottom, var(--color-teal), transparent)',
          margin: '0 auto 8px',
        }} />
        scroll
      </motion.div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .carousel-controls-desktop {
            bottom: 20px !important;
            right: 20px !important;
            left: 20px !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </section>
  )
}
