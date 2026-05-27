'use client'

import { motion } from 'framer-motion'
import { formatPrecio } from '@/data/destinos'

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

interface AutosTabProps {
  autos: AutoOption[]
  selectedAuto: AutoOption | null
  onSelectAuto: (auto: AutoOption) => void
}

export default function AutosTab({ autos, selectedAuto, onSelectAuto }: AutosTabProps) {
  if (autos.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '3rem' }}>🛻</span>
        <h3>Sin vehículos disponibles</h3>
        <p>No encontramos opciones de arriendo para este destino.</p>
      </div>
    )
  }

  return (
    <section className="options-section" id="autos-tab">
      <div className="section-header">
        <h3>🛻 Arriendo de Vehículos</h3>
        <span>{autos.length} opciones disponibles</span>
      </div>

      <div className="auto-grid">
        {autos.map((auto, idx) => (
          <motion.div
            key={idx}
            className={`auto-card ${selectedAuto?.nombre_auto === auto.nombre_auto ? 'active' : ''}`}
            onClick={() => onSelectAuto(auto)}
            whileHover={{ scale: 1.01, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="auto-header">
              <div className="auto-category-badge" data-offroad={auto.es_offroad}>
                {auto.es_offroad ? '🏔️' : '🏙️'} {auto.categoria}
              </div>
              {auto.es_offroad && <span className="offroad-tag">4x4</span>}
            </div>

            <h4 className="auto-name">{auto.nombre_auto}</h4>

            <div className="auto-specs">
              <span>⛽ {auto.combustible}</span>
              <span>⚙️ {auto.transmision}</span>
              <span>👥 {auto.plazas} plazas</span>
            </div>

            <div className="auto-proveedor">
              <span className="label">Proveedor</span>
              <span className="value">{auto.proveedor}</span>
            </div>

            <div className="auto-pricing">
              <div className="price-daily">
                <span className="amount">{formatPrecio(auto.precio_diario)}</span>
                <span className="unit">/día</span>
              </div>
              <div className="price-total">
                Total {auto.noches} días: <strong>{formatPrecio(auto.precio_total)}</strong>
              </div>
            </div>

            <div className="auto-pickup">
              📍 Retiro: {auto.punto_retiro}
            </div>

            <div className="auto-actions">
              <button
                className={`btn ${selectedAuto?.nombre_auto === auto.nombre_auto ? 'btn-primary' : 'btn-secondary'}`}
                onClick={(e) => { e.stopPropagation(); onSelectAuto(auto); }}
              >
                {selectedAuto?.nombre_auto === auto.nombre_auto ? '✅ Seleccionado' : 'Agregar al paquete'}
              </button>
              <a href={auto.url_reserva} target="_blank" rel="noopener noreferrer" className="btn-link"
                 onClick={(e) => e.stopPropagation()}>
                Ver externo ↗
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .auto-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .auto-card {
          background: var(--color-surface);
          backdrop-filter: blur(16px);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .auto-card.active {
          border-color: var(--color-teal);
          background: rgba(20, 184, 166, 0.08);
          box-shadow: 0 8px 30px rgba(20, 184, 166, 0.2);
        }
        .auto-card:hover { border-color: rgba(20, 184, 166, 0.4); }
        
        .auto-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .auto-category-badge {
          font-size: 0.75rem;
          color: var(--color-muted);
          padding: 4px 10px;
          background: var(--color-bg-secondary);
          border-radius: 8px;
        }
        .auto-category-badge[data-offroad="true"] {
          background: rgba(234, 179, 8, 0.15);
          color: #eab308;
        }
        .offroad-tag {
          background: linear-gradient(135deg, #ea580c, #dc2626);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .auto-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--color-text);
        }
        
        .auto-specs {
          display: flex;
          gap: 12px;
          font-size: 0.78rem;
          color: var(--color-muted);
          margin-bottom: 12px;
        }
        
        .auto-proveedor {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          padding: 8px 0;
          border-top: 1px solid var(--color-border);
          margin-bottom: 12px;
        }
        .auto-proveedor .label { color: var(--color-muted); }
        .auto-proveedor .value { font-weight: 600; color: var(--color-text); }
        
        .auto-pricing {
          text-align: center;
          margin-bottom: 12px;
        }
        .price-daily .amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-teal);
        }
        .price-daily .unit {
          font-size: 0.8rem;
          color: var(--color-muted);
        }
        .price-total {
          font-size: 0.78rem;
          color: var(--color-muted);
          margin-top: 4px;
        }
        .price-total strong { color: var(--color-text); }
        
        .auto-pickup {
          font-size: 0.75rem;
          color: var(--color-muted);
          margin-bottom: 16px;
          padding: 8px 12px;
          background: var(--color-bg-secondary);
          border-radius: 8px;
        }
        
        .auto-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .auto-actions .btn {
          flex: 1;
          padding: 10px;
          font-size: 0.82rem;
          border-radius: 10px;
        }
        .btn-link {
          font-size: 0.82rem;
          color: var(--color-teal);
          border: 1px solid var(--color-teal);
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          white-space: nowrap;
          text-align: center;
          transition: all 0.2s;
        }
        .btn-link:hover {
          background: rgba(45, 212, 191, 0.1);
          text-decoration: none;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-muted);
        }
        .empty-state h3 { color: var(--color-text); margin: 16px 0 8px; }
        
        @media (max-width: 768px) {
          .auto-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
