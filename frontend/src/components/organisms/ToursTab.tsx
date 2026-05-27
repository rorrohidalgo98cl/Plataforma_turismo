'use client'

import { motion } from 'framer-motion'
import { formatPrecio } from '@/data/destinos'

interface TourOption {
  tour: string
  precio: number
  duracion_horas: number
  incluye_traslado: boolean
  punto_encuentro: string
  url_reserva: string
  fuente: string
}

interface ToursTabProps {
  tours: TourOption[]
  selectedTours: string[]
  onToggleTour: (tourName: string) => void
}

export default function ToursTab({ tours, selectedTours, onToggleTour }: ToursTabProps) {
  if (tours.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '3rem' }}>🎟️</span>
        <h3>Sin tours disponibles</h3>
        <p>No encontramos actividades para este destino.</p>
      </div>
    )
  }

  const totalSeleccionado = tours
    .filter(t => selectedTours.includes(t.tour))
    .reduce((sum, t) => sum + t.precio, 0)

  return (
    <section className="options-section" id="tours-tab">
      <div className="section-header">
        <h3>🎟️ Tours y Actividades</h3>
        <span>
          {selectedTours.length > 0
            ? `${selectedTours.length} seleccionados · ${formatPrecio(totalSeleccionado)}`
            : `${tours.length} actividades disponibles`}
        </span>
      </div>

      <div className="tours-list">
        {tours.map((tour, idx) => {
          const isSelected = selectedTours.includes(tour.tour)
          return (
            <motion.div
              key={idx}
              className={`tour-card ${isSelected ? 'active' : ''}`}
              onClick={() => onToggleTour(tour.tour)}
              whileHover={{ scale: 1.005 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <div className="tour-left">
                <div className="tour-duration-badge">
                  ⏱️ {tour.duracion_horas}h
                </div>
                <div className="tour-info">
                  <h4>{tour.tour}</h4>
                  <div className="tour-tags">
                    {tour.incluye_traslado && (
                      <span className="tag traslado">🚐 Traslado incluido</span>
                    )}
                    <span className="tag location">📍 {tour.punto_encuentro}</span>
                  </div>
                </div>
              </div>

              <div className="tour-right">
                <span className="tour-price">{formatPrecio(tour.precio)}</span>
                <span className="tour-pp">p/persona</span>
                <button
                  className={`btn-tour ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggleTour(tour.tour); }}
                >
                  {isSelected ? '✅ Agregado' : '+ Agregar'}
                </button>
                {tour.url_reserva && tour.url_reserva !== '#' && (
                  <a
                    href={tour.url_reserva}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-teal)',
                      border: '1px solid var(--color-teal)',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      textDecoration: 'none',
                      marginTop: '6px',
                      display: 'inline-block',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver actividad ↗
                  </a>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <style jsx>{`
        .tours-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tour-card {
          background: var(--color-surface);
          backdrop-filter: blur(16px);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .tour-card:hover {
          border-color: rgba(20, 184, 166, 0.4);
          box-shadow: 0 6px 24px rgba(20, 184, 166, 0.1);
        }
        .tour-card.active {
          border-color: var(--color-teal);
          background: rgba(20, 184, 166, 0.08);
        }
        
        .tour-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        
        .tour-duration-badge {
          background: var(--color-bg-secondary);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          color: var(--color-text);
        }
        
        .tour-info h4 {
          margin: 0 0 6px;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text);
        }
        
        .tour-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 6px;
          background: var(--color-bg-secondary);
          color: var(--color-muted);
        }
        .tag.traslado {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          font-weight: 600;
        }
        
        .tour-right {
          text-align: right;
          min-width: 130px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .tour-price {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--color-text);
        }
        .tour-pp {
          font-size: 0.7rem;
          color: var(--color-muted);
        }
        
        .btn-tour {
          margin-top: 4px;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: transparent;
          color: var(--color-teal);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-body);
        }
        .btn-tour:hover {
          background: rgba(20, 184, 166, 0.1);
          border-color: var(--color-teal);
        }
        .btn-tour.selected {
          background: var(--color-teal);
          color: white;
          border-color: var(--color-teal);
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-muted);
        }
        .empty-state h3 { color: var(--color-text); margin: 16px 0 8px; }
        
        @media (max-width: 768px) {
          .tour-card { flex-direction: column; align-items: flex-start; gap: 12px; }
          .tour-right { align-items: flex-start; }
          .tour-left { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </section>
  )
}
