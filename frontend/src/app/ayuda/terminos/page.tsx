import Link from 'next/link'

export default function TerminosPage() {
  return (
    <div className="container-main" style={{ padding: '60px clamp(1rem, 5vw, 3rem)' }}>
      <div className="bg-glass" style={{ maxWidth: '850px', margin: '0 auto', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '32px', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', padding: '6px 16px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--color-teal)', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Marco Legal & Transparencia
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', margin: '16px 0', lineHeight: 1.2 }}>
            Términos y <span style={{ color: 'var(--color-teal)' }}>Condiciones</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>
            Última actualización: 15 de Mayo de 2026 | Regulado por Ley Nº 19.496 (SERNAC Chile)
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--color-muted)', lineHeight: 1.7, fontSize: '1rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>1. Aceptación de los Términos</h2>
            <p>
              El acceso, navegación y uso del cotizador y motor de reservas de <strong>Plataforma Turismo SPA</strong> implica la aceptación expresa, plena y sin reservas de todos y cada uno de los términos y condiciones estipulados en este documento. Si no estás de acuerdo con estos términos, te solicitamos no utilizar nuestros servicios transaccionales.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>2. Naturaleza del Servicio de Empaquetado Dinámico</h2>
            <p>
              Plataforma Turismo opera como un motor tecnológico de empaquetado y consolidación turística. Conectamos al usuario con proveedores externos independientes (aerolíneas, operadores de transporte terrestre y cadenas hoteleras). 
            </p>
            <p style={{ marginTop: '12px' }}>
              Por lo anterior, las condiciones específicas de transporte (horarios, políticas de equipaje) y de alojamiento (horarios de check-in/out, normas del recinto) son fijadas y regidas exclusivamente por el proveedor final del servicio.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>3. Precios y Variaciones de Tarifa</h2>
            <p>
              Las tarifas mostradas en nuestro motor de búsqueda son dinámicas y dependen de la disponibilidad en tiempo real de los sistemas de distribución global (GDS) y APIs conectadas (Tequila, Booking Stealth). 
            </p>
            <p style={{ marginTop: '12px' }}>
              Una cotización no garantiza el congelamiento del precio hasta que el usuario haya completado exitosamente el proceso de pago en la etapa de <code>/pago</code> y haya recibido su Código de Reserva Oficial.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>4. Derecho de Retracto y Devoluciones (Ley Nº 19.496)</h2>
            <p>
              Conforme a la normativa del SERNAC (Ley de Protección de los Derechos de los Consumidores), los servicios de transporte aéreo y paquetes turísticos se rigen por las condiciones de flexibilidad de la tarifa adquirida. 
            </p>
            <p style={{ marginTop: '12px' }}>
              Para asegurar la posibilidad de anulación y reembolso total, recomendamos encarecidamente incluir nuestro <strong>Seguro de Viaje & Cancelación</strong> durante el paso de reserva.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>5. Responsabilidad y Fuerza Mayor</h2>
            <p>
              Plataforma Turismo no se hace responsable por retrasos, cancelaciones de vuelo por condiciones climáticas, huelgas, desastres naturales o cualquier otro evento calificado como caso fortuito o fuerza mayor que afecte la ejecución del viaje por parte del proveedor final.
            </p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/ayuda/privacidad" style={{ color: 'var(--color-teal)', textDecoration: 'underline', fontWeight: 600 }}>
            Ver Política de Privacidad ↗
          </Link>
          <Link href="/ayuda/contacto" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
            📞 Contactar Atención al Cliente
          </Link>
        </div>
      </div>
    </div>
  )
}
