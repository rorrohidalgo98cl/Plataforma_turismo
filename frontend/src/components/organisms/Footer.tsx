'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname.startsWith('/reserva') || pathname.startsWith('/pago') || pathname.startsWith('/confirmacion')) {
    return null
  }

  return (
    <footer style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: '5rem 0 3rem 0',
      marginTop: 'auto',
    }}>
      <div className="container-main">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '4rem',
          marginBottom: '4rem',
        }}>
          {/* Columna 1: Marca & Desc */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
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
                🇨🇱
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#fff',
              }}>
                Plataforma<span style={{ color: 'var(--color-teal)' }}>Turismo</span>
              </span>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              El primer motor de empaquetado dinámico en Chile. Combinamos vuelos, buses, hoteles y transfers locales al mejor precio garantizado en tiempo real.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-teal)', fontSize: '1.2rem' }}>
              <span style={{ cursor: 'pointer' }}>𝕏</span>
              <span style={{ cursor: 'pointer' }}>📸</span>
              <span style={{ cursor: 'pointer' }}>💼</span>
            </div>
          </div>

          {/* Columna 2: Destinos Top */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'var(--color-text)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: 'var(--color-teal)' }}>▸</span> Destinos Populares
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'San Pedro de Atacama', href: '/destinos/san-pedro-de-atacama' },
                { label: 'Torres del Paine', href: '/destinos/torres-del-paine' },
                { label: 'Valle del Elqui', href: '/destinos/elqui' },
                { label: 'Chiloé Mágico', href: '/destinos/chiloe' },
                { label: 'Pucón & Villarrica', href: '/destinos/pucon' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Soporte & Confianza */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,

              fontSize: '1.05rem',
              color: 'var(--color-text)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: 'var(--color-teal)' }}>▸</span> Soporte & Ayuda
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: '🛡️ Preguntas Frecuentes (FAQ)', href: '/ayuda/faq' },
                { label: '📞 Contacto de Soporte', href: '/ayuda/contacto' },
                { label: '💼 Portal de Agencias', href: '/ayuda/agencias' },
                { label: '🔒 Política de Privacidad', href: '/ayuda/privacidad' },
                { label: '📜 Términos y Condiciones', href: '/ayuda/terminos' },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'var(--color-text)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: 'var(--color-teal)' }}>▸</span> Boletín de Ofertas
            </h4>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Recibe alertas de caídas de precio en vuelos y hoteles antes que nadie.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('¡Gracias por suscribirte al boletín de ofertas!'); }} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="tu@correo.cl"
                required
                style={{
                  background: 'var(--color-obsidian)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  flexGrow: 1,
                  outline: 'none',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.9rem' }}>
                Unirme
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          color: 'var(--color-muted)',
          fontSize: '0.85rem',
        }}>
          <p>© 2026 Plataforma Turismo Chile SpA. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Hecho con ❤️ en Santiago de Chile</span>
            <span>•</span>
            <span style={{ color: 'var(--color-teal)', fontWeight: 600 }}>Arquitectura Híbrida v2.0</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .footer-link:hover { color: var(--color-teal) !important; transform: translateX(2px); }
      `}</style>
    </footer>
  )
}
