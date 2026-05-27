'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Ocultar en rutas de checkout
  if (pathname.startsWith('/reserva') || pathname.startsWith('/pago') || pathname.startsWith('/confirmacion')) {
    return null
  }

  // Rutas principales de navegación
  const navItems = [
    { label: '🏠 Inicio', href: '/' },
    { label: '⚙️ Buscador', href: '/#buscar' },
    { label: '🌍 Destinos', href: '/destinos' },
    { label: '🛡️ Ayuda & FAQ', href: '/ayuda/faq' },
    { label: '📞 Contacto', href: '/ayuda/contacto' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
        width: '100%',
      }}
    >
      <div className="container-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--gradient-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            🇨🇱
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#fff',
              letterSpacing: '-0.03em',
            }}>
              Plataforma<span style={{ color: 'var(--color-teal)' }}>Turismo</span>
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '-4px', fontWeight: 600 }}>
              DYNAMIC PACKAGING
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-desktop">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href.split('?')[0].split('#')[0])) ||
              (item.label === '⚙️ Buscador' && pathname.startsWith('/buscar'))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: isActive ? 'var(--color-teal)' : 'var(--color-text)',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  padding: '0.5rem 0',
                }}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--color-teal)',
                      borderRadius: '2px',
                      boxShadow: '0 0 10px var(--color-teal)',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* CTA Directo Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="nav-desktop">
          <Link href="/buscar?origen=Santiago&origen_iata=SCL&destino=San+Pedro+de+Atacama&slug=san-pedro-de-atacama&ida=2026-11-15&vuelta=2026-11-22&pasajeros=1&transporte=avion" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            ⚡ Armar Paquete
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'none',
          }}
          className="btn-mobile-toggle"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              style={{
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '1.1rem',
                color: pathname === item.href ? 'var(--color-teal)' : 'var(--color-text)',
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/buscar?origen=Santiago&origen_iata=SCL&destino=San+Pedro+de+Atacama&slug=san-pedro-de-atacama&ida=2026-11-15&vuelta=2026-11-22&pasajeros=1&transporte=avion"
            onClick={() => setIsOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}
          >
            ⚡ Armar Paquete
          </Link>
        </motion.div>
      )}

      <style jsx global>{`
        @media (max-width: 1024px) {
          .nav-desktop { display: none !important; }
          .btn-mobile-toggle { display: block !important; }
        }
      `}</style>
    </motion.header>
  )
}
