'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const faqs = [
  {
    cat: 'Empaquetado y Reservas',
    q: '¿Cómo funciona el empaquetado dinámico de Plataforma Turismo?',
    a: 'Nuestro motor conecta en tiempo real con aerolíneas (vía Tequila API), buses locales (vía Recorrido) y hoteles (vía Booking Stealth). Al seleccionar un paquete, combinamos automáticamente las mejores tarifas disponibles, permitiéndote ahorrar hasta un 35% en comparación a comprar cada servicio por separado.',
  },
  {
    cat: 'Empaquetado y Reservas',
    q: '¿Qué significa que un paquete tenga "Datos Referenciales"?',
    a: 'Cuando el motor no puede establecer una conexión en vivo con los proveedores externos (por ejemplo, si estás en modo offline o el servidor de scraping está en pausa), mostramos precios basados en promedios históricos recientes para que puedas seguir planificando tu presupuesto.',
  },
  {
    cat: 'Pagos y Facturación',
    q: '¿Qué medios de pago aceptan y qué tan seguro es el proceso?',
    a: 'Aceptamos tarjetas de débito y crédito bancarias chilenas a través de Webpay Plus (Redcompra), MercadoPago con hasta 12 cuotas sin interés, y tarjetas internacionales (Visa, Mastercard, AMEX). Todo el flujo está protegido con encriptación de grado bancario SSL 256-bit.',
  },
  {
    cat: 'Pagos y Facturación',
    q: '¿Puedo solicitar factura para mi empresa?',
    a: '¡Sí! Durante el paso de reserva o contactando a nuestro equipo de soporte tras la compra, puedes ingresar el RUT de tu empresa para la emisión de la Factura Electrónica correspondiente (cumpliendo con la normativa del SII).',
  },
  {
    cat: 'Cambios y Cancelaciones',
    q: '¿Cuáles son las políticas de cambio de fecha o cancelación?',
    a: 'Las políticas dependen de la tarifa seleccionada por la aerolínea y el hotel. Sin embargo, si agregas nuestro "Seguro de Viaje & Cancelación" en el paso de reserva, obtienes flexibilidad total para cambios de fecha sin multa y reembolso del 100% ante imprevistos médicos o de fuerza mayor.',
  },
  {
    cat: 'Soporte y Entrega',
    q: '¿Cómo y cuándo recibiré mis pasajes y vouchers de hotel?',
    a: 'Inmediatamente después de confirmar el pago, se generará tu Código de Reserva Oficial (ej. CL-849201) y enviaremos los tickets electrónicos de vuelo/bus y el voucher de confirmación de hotel directamente a tu correo electrónico registrado.',
  },
]

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <div className="container-main" style={{ padding: '60px clamp(1rem, 5vw, 3rem)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', marginBottom: '16px' }}>
          Preguntas <span style={{ color: 'var(--color-teal)' }}>Frecuentes</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Resolvemos tus dudas sobre nuestro motor híbrido de empaquetado dinámico, métodos de pago, seguridad y gestión de reservas en Chile.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                borderColor: isOpen ? 'var(--color-teal)' : 'var(--color-border)',
              }}
            >
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', padding: '4px 10px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--color-teal)', borderRadius: '8px', fontWeight: 700 }}>
                    {faq.cat}
                  </span>
                  <span>{faq.q}</span>
                </div>
                <span style={{ fontSize: '1.5rem', color: isOpen ? 'var(--color-teal)' : 'var(--color-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </button>

              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: '0 24px 24px 24px',
                    color: 'var(--color-muted)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                  }}
                >
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div style={{ textAlign: 'center', marginTop: '60px', padding: '40px', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)', maxWidth: '900px', margin: '60px auto 0 auto' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>¿Aún tienes dudas sin resolver?</h3>
        <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>Nuestro equipo de agentes turísticos está disponible 24/7 para ayudarte con tu itinerario.</p>
        <Link href="/ayuda/contacto" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
          📞 Contactar Soporte
        </Link>
      </div>
    </div>
  )
}
