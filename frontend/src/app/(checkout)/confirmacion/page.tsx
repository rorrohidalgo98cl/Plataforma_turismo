'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { formatPrecio } from '@/data/destinos'
import Link from 'next/link'

function ConfirmacionContent() {
  const searchParams = useSearchParams()

  const destino = searchParams.get('destino') || 'San Pedro de Atacama'
  const precio = Number(searchParams.get('precio')) || 357000
  const pasajerosCount = Number(searchParams.get('pasajeros')) || 2
  const vuelo = searchParams.get('vuelo') || 'LA124 (LATAM)'
  const hotel = searchParams.get('hotel') || 'Hotel Altiplánico (4★)'
  const titular = searchParams.get('titular') || 'Rodrigo González'
  const email = searchParams.get('email') || 'rodrigo@gmail.com'
  const codigo = searchParams.get('codigo') || 'CL-849201'
  const metodo = searchParams.get('metodo') || 'webpay'
  const cuotas = searchParams.get('cuotas') || '1'
  const auto = searchParams.get('auto') || ''
  const tours = searchParams.get('tours') || ''

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container-main printable-area" style={{ maxWidth: '800px' }}>
      {/* Simulation Alert Badge for UI */}
      <div className="no-print" style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        color: '#fbbf24',
        textAlign: 'center',
        fontWeight: 600,
      }}>
        🧪 Comprobante de Simulación (No se realizó ningún cargo real)
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="print-card"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Decorative Banner */}
        <div className="no-print" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'var(--gradient-teal)',
        }} />

        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(45, 212, 191, 0.1)',
            border: '2px solid var(--color-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 24px auto',
            boxShadow: '0 0 30px rgba(45, 212, 191, 0.3)',
          }}>
            🎉
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '12px' }}>
            ¡Reserva Confirmada Exitosamente!
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
            Hemos enviado los vouchers y pasajes oficiales al correo: <strong style={{ color: '#fff' }}>{email}</strong>
          </p>
        </div>

        {/* Booking Code Banner */}
        <div style={{
          background: 'var(--color-obsidian)',
          border: '1px dashed var(--color-teal)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>CÓDIGO DE RESERVA OFICIAL</div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-teal)', letterSpacing: '2px' }}>
              {codigo}
            </div>
          </div>
          <button onClick={handlePrint} className="btn btn-secondary no-print" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>

        {/* Itinerary Details */}
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          🗺️ Desglose del Itinerario
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="detail-box" style={{ background: 'var(--color-obsidian)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>DESTINO</span>
            <strong style={{ fontSize: '1.2rem', color: '#fff', display: 'block' }}>{destino}</strong>
          </div>
          <div className="detail-box" style={{ background: 'var(--color-obsidian)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>TITULAR DE RESERVA</span>
            <strong style={{ fontSize: '1.2rem', color: '#fff', display: 'block' }}>{titular}</strong>
          </div>
          <div className="detail-box" style={{ background: 'var(--color-obsidian)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>TRANSPORTE</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff', display: 'block' }}>{vuelo}</strong>
          </div>
          <div className="detail-box" style={{ background: 'var(--color-obsidian)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>ALOJAMIENTO</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff', display: 'block' }}>{hotel}</strong>
          </div>
          {auto && (
            <div className="detail-box" style={{ background: 'var(--color-obsidian)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>VEHÍCULO</span>
              <strong style={{ fontSize: '1.1rem', color: '#fff', display: 'block' }}>{auto}</strong>
            </div>
          )}
          {tours && (
            <div className="detail-box" style={{ background: 'var(--color-obsidian)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>TOURS CONTRATADOS</span>
              <strong style={{ fontSize: '1.0rem', color: '#fff', display: 'block' }}>{tours}</strong>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          💳 Detalle de Pago
        </h3>

        <div className="payment-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-obsidian)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-muted)' }}>Método de Pago</span>
            <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{metodo} ({cuotas} Cuota/s)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-muted)' }}>Pasajeros Totales</span>
            <strong style={{ color: '#fff' }}>{pasajerosCount} Persona(s)</strong>
          </div>
          {auto && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted)' }}>Arriendo de Auto</span>
              <strong style={{ color: '#fff' }}>Incluido</strong>
            </div>
          )}
          {tours && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted)' }}>Actividades Especiales</span>
              <strong style={{ color: '#fff' }}>Incluido</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Pagado</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--color-teal)' }}>{formatPrecio(precio)}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            🏠 Volver al Inicio
          </Link>
          <Link href="/destinos" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            🌍 Explorar Más Destinos
          </Link>
        </div>

        {/* Print only footer */}
        <div className="print-only" style={{
          display: 'none',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#666',
          marginTop: '30px',
          borderTop: '1px solid #ccc',
          paddingTop: '10px'
        }}>
          Este comprobante es una representación impresa de una reserva simulada. No posee validez fiscal ni comercial.
        </div>

        <style jsx>{`
          @media print {
            :global(body) {
              background: white !important;
              color: black !important;
            }
            :global(.no-print) {
              display: none !important;
            }
            .print-card {
              background: white !important;
              color: black !important;
              border: 1px solid #000 !important;
              box-shadow: none !important;
              padding: 20px !important;
              border-radius: 0 !important;
            }
            .detail-box, .payment-box {
              background: #f9fafb !important;
              border: 1px solid #ccc !important;
              color: black !important;
            }
            .detail-box *, .payment-box * {
              color: black !important;
            }
            .print-only {
              display: block !important;
            }
          }
        `}</style>
      </motion.div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="container-main" style={{ color: 'white', textAlign: 'center', padding: '100px 0' }}>Generando voucher de confirmación...</div>}>
      <ConfirmacionContent />
    </Suspense>
  )
}
