'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { formatPrecio } from '@/data/destinos'

function PagoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const destino = searchParams.get('destino') || 'San Pedro de Atacama'
  const precio = Number(searchParams.get('precio')) || 357000
  const pasajerosCount = Number(searchParams.get('pasajeros')) || 2
  const vuelo = searchParams.get('vuelo') || 'LA124 (LATAM)'
  const hotel = searchParams.get('hotel') || 'Hotel Altiplánico (4★)'
  const titular = searchParams.get('titular') || 'Rodrigo González'
  const email = searchParams.get('email') || 'rodrigo@gmail.com'
  const auto = searchParams.get('auto') || ''
  const tours = searchParams.get('tours') || ''

  const [metodo, setMetodo] = useState('webpay')
  const [cuotas, setCuotas] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Tarjeta Form State (para metodo tarjeta directo)
  const [tarjeta, setTarjeta] = useState({
    numero: '',
    nombre: titular,
    vencimiento: '',
    cvv: '',
  })

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simular procesamiento con pasarela externa (Webpay / MercadoPago / Transbank)
    setTimeout(() => {
      const codigoReserva = 'CL-' + Math.floor(100000 + Math.random() * 900000)
      const params = new URLSearchParams({
        destino,
        precio: String(precio),
        pasajeros: String(pasajerosCount),
        vuelo,
        hotel,
        titular,
        email,
        codigo: codigoReserva,
        metodo,
        cuotas: String(cuotas),
      })
      if (auto) params.append('auto', auto)
      if (tours) params.append('tours', tours)
      router.push(`/confirmacion?${params.toString()}`)
    }, 2500)
  }

  return (
    <div className="container-main">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}
      >
        {/* Left Column: Payment Gateway Selection */}
        <div>
          {/* Simulation Alert Badge */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <strong style={{ display: 'block', fontWeight: 700 }}>Modo Simulación Activo</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Esta pasarela de pago es una simulación de pruebas. Ingresa cualquier número de tarjeta para continuar.</span>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '8px' }}>
            Selecciona tu Medio de Pago
          </h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
            Todas las transacciones están encriptadas con seguridad bancaria SSL 256-bit.
          </p>

          <form onSubmit={handlePayment} id="pago-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Metodo 1: Webpay Plus */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              background: metodo === 'webpay' ? 'rgba(45, 212, 191, 0.1)' : 'var(--color-surface)',
              borderColor: metodo === 'webpay' ? 'var(--color-teal)' : 'var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'webpay'}
                  onChange={() => setMetodo('webpay')}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-teal)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Webpay Plus (Redcompra / Tarjetas)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Paga con Débito o Crédito bancario chileno</div>
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>🇨🇱</div>
            </label>

            {/* Metodo 2: MercadoPago */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              background: metodo === 'mercadopago' ? 'rgba(45, 212, 191, 0.1)' : 'var(--color-surface)',
              borderColor: metodo === 'mercadopago' ? 'var(--color-teal)' : 'var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'mercadopago'}
                  onChange={() => setMetodo('mercadopago')}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-teal)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>MercadoPago (Hasta 12 Cuotas sin interés)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Paga con saldo de tu cuenta o tarjetas guardadas</div>
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>🤝</div>
            </label>

            {/* Metodo 3: Tarjeta Directa */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              background: metodo === 'tarjeta' ? 'rgba(45, 212, 191, 0.1)' : 'var(--color-surface)',
              borderColor: metodo === 'tarjeta' ? 'var(--color-teal)' : 'var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'tarjeta'}
                  onChange={() => setMetodo('tarjeta')}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-teal)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Tarjeta de Crédito / Débito Internacional</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Visa, Mastercard, American Express</div>
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>💳</div>
            </label>

            {/* Formulario Tarjeta Directa */}
            {metodo === 'tarjeta' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>Número de Tarjeta</label>
                  <input
                    type="text"
                    placeholder="•••• •••• •••• ••••"
                    className="input-base"
                    value={tarjeta.numero}
                    onChange={e => setTarjeta({ ...tarjeta, numero: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    className="input-base"
                    value={tarjeta.nombre}
                    onChange={e => setTarjeta({ ...tarjeta, nombre: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>Vencimiento (MM/AA)</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="input-base"
                      value={tarjeta.vencimiento}
                      onChange={e => setTarjeta({ ...tarjeta, vencimiento: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      className="input-base"
                      value={tarjeta.cvv}
                      onChange={e => setTarjeta({ ...tarjeta, cvv: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Opciones de Cuotas */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
                Opciones de Financiamiento (Cuotas)
              </label>
              <select
                className="input-base"
                value={cuotas}
                onChange={e => setCuotas(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                <option value={1}>1 Cuota (Sin Interés) - {formatPrecio(precio)}</option>
                <option value={3}>3 Cuotas sin interés de {formatPrecio(Math.round(precio / 3))}</option>
                <option value={6}>6 Cuotas sin interés de {formatPrecio(Math.round(precio / 6))}</option>
                <option value={12}>12 Cuotas sin interés de {formatPrecio(Math.round(precio / 12))}</option>
              </select>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '24px',
            padding: '32px',
            position: 'sticky',
            top: '100px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '24px' }}>Detalle de Transacción</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Destino</span>
                <strong style={{ color: '#fff' }}>{destino}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Titular</span>
                <strong style={{ color: '#fff' }}>{titular}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Email</span>
                <strong style={{ color: '#fff' }}>{email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Modalidad</span>
                <strong style={{ color: 'var(--color-teal)' }}>{cuotas} Cuota(s) sin interés</strong>
              </div>
              {auto && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Vehículo</span>
                  <strong style={{ color: '#fff', textAlign: 'right' }}>{auto}</strong>
                </div>
              )}
              {tours && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Tours</span>
                  <strong style={{ color: '#fff', textAlign: 'right', maxWidth: '65%', fontSize: '0.85rem' }}>{tours}</strong>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total a Pagar</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-teal)' }}>
                  {formatPrecio(precio)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="pago-form"
              disabled={isProcessing}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              {isProcessing ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                  Conectando con Banco...
                </>
              ) : (
                <>🔒 Pagar {formatPrecio(precio)}</>
              )}
            </button>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              🔒 Transacción encriptada con certificado SSL Transbank / MercadoPago
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function PagoPage() {
  return (
    <Suspense fallback={<div className="container-main" style={{ color: 'white', textAlign: 'center', padding: '100px 0' }}>Cargando pasarela de pago...</div>}>
      <PagoContent />
    </Suspense>
  )
}
