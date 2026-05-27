'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Destino, formatPrecio } from '@/data/destinos'

interface DestinoCardProps {
  destino: Destino
  index?: number
}

export default function DestinoCard({ destino, index = 0 }: DestinoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/destinos/${destino.slug}`} className="card block group" style={{ textDecoration: 'none' }}>
        {/* Imagen */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={destino.imagen}
            alt={destino.nombre}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            className="group-hover:scale-110"
          />
          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(2,6,23,0.85) 0%, transparent 60%)',
          }} />
          {/* Tags */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {destino.destacado && (
              <span className="badge-urgency">⭐ Destacado</span>
            )}
            {destino.tags.slice(0, 2).map(tag => (
              <span key={tag} className="badge-teal">{tag}</span>
            ))}
          </div>
          {/* Precio */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, textAlign: 'right' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.72rem' }}>desde</p>
            <p style={{
              color: 'var(--color-teal)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}>
              {formatPrecio(destino.precioDesde)}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: '20px' }}>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginBottom: 4 }}>
            {destino.region}
          </p>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: 'var(--color-text)',
            marginBottom: 6,
          }}>
            {destino.nombre}
          </h3>
          <p style={{
            color: 'var(--color-muted)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {destino.tagline}
          </p>

          {/* CTA */}
          <div style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-teal)',
            fontWeight: 600,
            fontSize: '0.875rem',
            fontFamily: 'var(--font-heading)',
          }}>
            Ver paquete
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
