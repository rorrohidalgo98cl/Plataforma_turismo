'use client'

import { motion } from 'framer-motion'

export type TabId = 'paquete' | 'vuelos' | 'hoteles' | 'buses' | 'autos' | 'tours'

interface Tab {
  id: TabId
  label: string
  icon: string
  count?: number
}

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  counts: Record<TabId, number>
}

const TABS: Tab[] = [
  { id: 'paquete', label: 'Paquete Completo', icon: '📦' },
  { id: 'vuelos',  label: 'Vuelos',           icon: '✈️' },
  { id: 'hoteles', label: 'Hoteles',          icon: '🏨' },
  { id: 'buses',   label: 'Buses',            icon: '🚌' },
  { id: 'autos',   label: 'Arriendo Auto',    icon: '🛻' },
  { id: 'tours',   label: 'Tours',            icon: '🎟️' },
]

export default function TabNavigation({ activeTab, onTabChange, counts }: TabNavigationProps) {
  return (
    <nav className="tab-navigation" id="tab-nav">
      {TABS.map((tab) => (
        <motion.button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id={`tab-${tab.id}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {counts[tab.id] > 0 && tab.id !== 'paquete' && (
            <span className="tab-count">{counts[tab.id]}</span>
          )}
          {activeTab === tab.id && (
            <motion.div
              className="tab-indicator"
              layoutId="activeTab"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </motion.button>
      ))}

      <style jsx>{`
        .tab-navigation {
          display: flex;
          gap: 4px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 6px;
          border: 1px solid var(--color-border);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          margin-bottom: 28px;
        }
        .tab-navigation::-webkit-scrollbar { display: none; }
        
        .tab-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          color: var(--color-muted);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 12px;
          white-space: nowrap;
          transition: color 0.2s;
          font-family: var(--font-body);
          z-index: 1;
        }
        .tab-btn:hover { color: var(--color-text); }
        .tab-btn.active { color: white; }
        
        .tab-icon { font-size: 1rem; }
        .tab-label { font-size: 0.82rem; }
        
        .tab-count {
          background: rgba(20, 184, 166, 0.3);
          color: var(--color-teal);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }
        .tab-btn.active .tab-count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        :global(.tab-indicator) {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--color-teal), #0d9488);
          border-radius: 12px;
          z-index: -1;
          box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
        }
        
        @media (max-width: 768px) {
          .tab-label { display: none; }
          .tab-btn { padding: 10px 12px; }
          .tab-icon { font-size: 1.2rem; }
        }
      `}</style>
    </nav>
  )
}
