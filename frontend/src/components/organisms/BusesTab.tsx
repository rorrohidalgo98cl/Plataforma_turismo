'use client'

import { motion } from 'framer-motion'
import { formatPrecio } from '@/data/destinos'

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

interface BusesTabProps {
  buses: BusOption[]
  origen: string
  destino: string
}

export default function BusesTab({ buses, origen, destino }: BusesTabProps) {
  if (buses.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '3rem' }}>🚌</span>
        <h3>Sin buses disponibles</h3>
        <p>No hay rutas terrestres directas hacia este destino, o es un destino insular.</p>
      </div>
    )
  }

  return (
    <section className="options-section" id="buses-tab">
      <div className="section-header">
        <h3>🚌 Buses Terrestres</h3>
        <span>{buses.length} salidas encontradas · {origen} → {destino}</span>
      </div>

      <div className="buses-list">
        {buses.map((bus, idx) => (
          <motion.a
            key={idx}
            className="bus-card"
            href={bus.deep_link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.005, x: 4 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="bus-left">
              <div className="bus-logo">{bus.operador[0]}</div>
              <div className="bus-info">
                <h4>{bus.operador}</h4>
                <span className="bus-type">{bus.tipo}</span>
              </div>
            </div>

            <div className="bus-schedule">
              <div className="time-block">
                <strong>{bus.hora_salida}</strong>
                <span>{origen}</span>
              </div>
              <div className="bus-duration-line">
                <span className="dur-text">{Math.floor(bus.duracion_min / 60)}h {bus.duracion_min % 60}m</span>
                <div className="line" />
                <span className="bus-icon">🚌</span>
              </div>
              <div className="time-block">
                <strong>{bus.hora_llegada}</strong>
                <span>{destino}</span>
              </div>
            </div>

            <div className="bus-right">
              <span className="bus-price">{formatPrecio(bus.precio)}</span>
              <span className="bus-pp">p/persona</span>
              <span className="bus-link">Comprar en Recorrido.cl ↗</span>
            </div>
          </motion.a>
        ))}
      </div>

      <style jsx>{`
        .buses-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bus-card {
          background: var(--color-surface);
          backdrop-filter: blur(16px);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .bus-card:hover {
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 6px 25px rgba(245, 158, 11, 0.15);
        }
        
        .bus-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bus-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 1.1rem;
        }
        .bus-info h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text);
        }
        .bus-type {
          font-size: 0.72rem;
          color: var(--color-muted);
          padding: 2px 8px;
          background: var(--color-bg-secondary);
          border-radius: 4px;
        }
        
        .bus-schedule {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .time-block {
          text-align: center;
        }
        .time-block strong {
          display: block;
          font-size: 1.15rem;
          color: var(--color-text);
        }
        .time-block span {
          font-size: 0.7rem;
          color: var(--color-muted);
        }
        
        .bus-duration-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
        }
        .dur-text {
          font-size: 0.7rem;
          color: var(--color-muted);
          margin-bottom: 4px;
        }
        .line {
          width: 60px;
          height: 2px;
          background: var(--color-border);
        }
        .bus-icon {
          font-size: 0.7rem;
          margin-top: 2px;
        }
        
        .bus-right {
          text-align: right;
          min-width: 130px;
        }
        .bus-price {
          display: block;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--color-text);
        }
        .bus-pp {
          font-size: 0.7rem;
          color: var(--color-muted);
          display: block;
        }
        .bus-link {
          font-size: 0.72rem;
          color: white;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 700;
          margin-top: 8px;
          display: inline-block;
          text-align: center;
          transition: all 0.2s;
        }
        .bus-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-muted);
        }
        .empty-state h3 { color: var(--color-text); margin: 16px 0 8px; }
        
        @media (max-width: 768px) {
          .bus-card { flex-direction: column; gap: 16px; align-items: flex-start; }
          .bus-schedule { width: 100%; justify-content: center; }
          .bus-right { text-align: left; }
        }
      `}</style>
    </section>
  )
}
