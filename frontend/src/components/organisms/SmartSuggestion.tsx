'use client'

import { motion } from 'framer-motion'

interface CrossSellSugerencia {
  tipo: string
  icono: string
  titulo: string
  mensaje: string
  ahorro_estimado: number
  tab_afectada: string
  accion: string
}

interface SmartSuggestionProps {
  sugerencias: CrossSellSugerencia[]
  onNavigateTab: (tab: string) => void
}

export default function SmartSuggestion({ sugerencias, onNavigateTab }: SmartSuggestionProps) {
  if (sugerencias.length === 0) return null

  return (
    <div className="smart-suggestions" id="cross-sell-panel">
      {sugerencias.map((sug, idx) => (
        <motion.div
          key={idx}
          className={`suggestion-card ${sug.tipo}`}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: idx * 0.15, type: 'spring', stiffness: 300 }}
        >
          <div className="sug-icon">{sug.icono}</div>
          <div className="sug-content">
            <h4>{sug.titulo}</h4>
            <p>{sug.mensaje}</p>
          </div>
          {sug.tab_afectada && (
            <button
              className="sug-action"
              onClick={() => onNavigateTab(sug.tab_afectada)}
            >
              Ver {sug.tab_afectada} →
            </button>
          )}
        </motion.div>
      ))}

      <style jsx>{`
        .smart-suggestions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .suggestion-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid;
          backdrop-filter: blur(12px);
        }
        .suggestion-card.logistica_inversa {
          background: rgba(234, 179, 8, 0.08);
          border-color: rgba(234, 179, 8, 0.25);
        }
        .suggestion-card.logistica_mixta {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.25);
        }
        .suggestion-card.afinidad_terreno_positiva {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.25);
        }
        .suggestion-card.afinidad_terreno_sugerencia {
          background: rgba(168, 85, 247, 0.08);
          border-color: rgba(168, 85, 247, 0.25);
        }
        
        .sug-icon {
          font-size: 1.8rem;
          flex-shrink: 0;
        }
        
        .sug-content {
          flex: 1;
        }
        .sug-content h4 {
          margin: 0 0 4px;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-text);
        }
        .sug-content p {
          margin: 0;
          font-size: 0.78rem;
          color: var(--color-muted);
          line-height: 1.4;
        }
        
        .sug-action {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-teal);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          font-family: var(--font-body);
        }
        .sug-action:hover {
          background: rgba(20, 184, 166, 0.1);
          border-color: var(--color-teal);
        }
      `}</style>
    </div>
  )
}
