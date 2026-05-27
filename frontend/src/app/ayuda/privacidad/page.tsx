import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div className="container-main" style={{ padding: '60px clamp(1rem, 5vw, 3rem)' }}>
      <div className="bg-glass" style={{ maxWidth: '850px', margin: '0 auto', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '32px', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', padding: '6px 16px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--color-teal)', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Marco Legal & Transparencia
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', margin: '16px 0', lineHeight: 1.2 }}>
            Política de <span style={{ color: 'var(--color-teal)' }}>Privacidad</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>
            Última actualización: 15 de Mayo de 2026 | Cumplimiento Ley Nº 19.628 (Chile)
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--color-muted)', lineHeight: 1.7, fontSize: '1rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>1. Almacenamiento y Protección de Datos</h2>
            <p>
              En <strong>Plataforma Turismo SPA</strong> nos tomamos muy en serio la seguridad de tu información. Todos los datos personales ingresados en nuestro sitio web (nombres, documentos de identidad, fechas de nacimiento y datos de contacto) son tratados bajo los más estrictos estándares de confidencialidad y encriptación de grado militar mediante el protocolo <strong>SSL/TLS de 256 bits</strong>.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>2. Uso de la Información Recopilada</h2>
            <p>
              La información recopilada en nuestro motor de búsqueda y embudo de reservas se utiliza exclusivamente para los siguientes fines transaccionales y operativos:
            </p>
            <ul style={{ listStylePosition: 'inside', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Emisión de pasajes aéreos y de bus ante los operadores externos correspondientes.</li>
              <li>Confirmación y generación de vouchers de reserva de hotel.</li>
              <li>Envío de notificaciones operativas sobre cambios de itinerario o estado de vuelos.</li>
              <li>Procesamiento de pagos a través de pasarelas reguladas (Webpay Plus, MercadoPago).</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>3. No Comercialización de Datos (Cero Spam)</h2>
            <p>
              Plataforma Turismo garantiza que <strong>nunca venderá, cederá ni arrendará</strong> tu información personal a bases de datos externas, agencias de publicidad o terceros ajenos a la transacción turística solicitada por el usuario.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>4. Uso de Cookies y Tecnologías de Seguimiento</h2>
            <p>
              Utilizamos cookies técnicas y de sesión para mantener tus preferencias de búsqueda (origen, destino, fechas) mientras navegas entre las distintas etapas de la cotización. Estas cookies no extraen información privada de tu dispositivo y pueden ser desactivadas en la configuración de tu navegador.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>5. Derechos del Titular (Ley Nº 19.628)</h2>
            <p>
              Conforme a la legislación chilena sobre Protección de Datos de Carácter Personal, tienes el derecho irrenunciable a solicitar en cualquier momento el acceso, rectificación, cancelación u oposición (Derechos ARCO) respecto de tus datos almacenados en nuestros sistemas.
            </p>
            <p style={{ marginTop: '12px' }}>
              Para ejercer estos derechos, puedes ponerte en contacto directo con nuestro Oficial de Privacidad a través de nuestro canal de soporte.
            </p>
          </section>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/ayuda/terminos" style={{ color: 'var(--color-teal)', textDecoration: 'underline', fontWeight: 600 }}>
            Ver Términos y Condiciones ↗
          </Link>
          <Link href="/ayuda/contacto" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
            📞 Contactar Oficial de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}
