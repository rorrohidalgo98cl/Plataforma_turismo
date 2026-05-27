'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const steps = [
    { id: '/reserva', label: '1. Datos de Pasajeros' },
    { id: '/pago', label: '2. Pago Seguro' },
    { id: '/confirmacion', label: '3. Confirmación' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-obsidian)', color: 'var(--color-text)' }}>
      {/* Secure Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div className="container-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--gradient-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: 'var(--shadow-glow)',
            }}>
              🔒
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#fff',
            }}>
              Checkout <span style={{ color: 'var(--color-teal)' }}>Seguro</span>
            </span>
          </Link>

          {/* Stepper */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {steps.map((step, idx) => {
              const isActive = pathname.startsWith(step.id)
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    color: isActive ? 'var(--color-teal)' : 'var(--color-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    transition: 'color 0.2s',
                  }}>
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <span style={{ color: 'var(--color-border)' }}>›</span>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒 SSL 256-bit</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Content */}
      <div style={{ flexGrow: 1, padding: '3rem 0' }}>
        {children}
      </div>

      {/* Minimal Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '2rem 0',
        textAlign: 'center',
        color: 'var(--color-muted)',
        fontSize: '0.85rem',
      }}>
        <div className="container-main">
          <p>© 2026 Plataforma Turismo Chile. Transacción 100% protegida.</p>
        </div>
      </footer>
    </div>
  )
}
