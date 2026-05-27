'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { formatPrecio } from '@/data/destinos'

function ReservaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const destino = searchParams.get('destino') || 'San Pedro de Atacama'
  const precioBase = Number(searchParams.get('precio')) || 320000
  const pasajerosCount = Number(searchParams.get('pasajeros')) || 2
  const vuelo = searchParams.get('vuelo') || 'LA124 (LATAM)'
  const hotel = searchParams.get('hotel') || 'Hotel Altiplánico (4★)'
  const auto = searchParams.get('auto') || ''
  const tours = searchParams.get('tours') || ''

  // Pasajeros Form State
  const [pasajeros, setPasajeros] = useState(
    Array.from({ length: pasajerosCount }, (_, i) => ({
      nombres: i === 0 ? 'Rodrigo' : '',
      apellidos: i === 0 ? 'González' : '',
      rut: i === 0 ? '18.456.789-0' : '',
      email: i === 0 ? 'rodrigo@gmail.com' : '',
    }))
  )

  // Addons State
  const [addons, setAddons] = useState({
    equipajeExtra: false,
    seguroViaje: true,
    transferPrivado: false,
  })

  const preciosAddons = {
    equipajeExtra: 25000 * pasajerosCount,
    seguroViaje: 12000 * pasajerosCount,
    transferPrivado: 35000,
  }

  const calcularTotal = () => {
    let total = precioBase
    if (addons.equipajeExtra) total += preciosAddons.equipajeExtra
    if (addons.seguroViaje) total += preciosAddons.seguroViaje
    if (addons.transferPrivado) total += preciosAddons.transferPrivado
    return total
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = calcularTotal()
    const params = new URLSearchParams({
      destino,
      precio: String(total),
      pasajeros: String(pasajerosCount),
      vuelo,
      hotel,
      titular: `${pasajeros[0].nombres} ${pasajeros[0].apellidos}`,
      email: pasajeros[0].email,
    })
    if (auto) params.append('auto', auto)
    if (tours) params.append('tours', tours)
    router.push(`/pago?${params.toString()}`)
  }

  const updatePasajero = (index: number, field: string, value: string) => {
    const updated = [...pasajeros]
    updated[index] = { ...updated[index], [field]: value }
    setPasajeros(updated)
  }

  return (
    <div className="container-main">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}
      >
        {/* Left Column: Form */}
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
              <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Esta es una pasarela de prueba simulada. No se procesarán pagos reales ni reservas ante operadores reales.</span>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '8px' }}>
            Datos de los Pasajeros
          </h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
            Ingresa la información exactamente como aparece en el documento de identidad.
          </p>

          <form onSubmit={handleSubmit} id="reserva-form" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Pasajeros Cards */}
            {pasajeros.map((p, idx) => (
              <div key={idx} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '24px',
              }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-teal)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👤</span> Pasajero {idx + 1} {idx === 0 ? '(Titular)' : ''}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>Nombres</label>
                    <input
                      type="text"
                      className="input-base"
                      value={p.nombres}
                      onChange={e => updatePasajero(idx, 'nombres', e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>Apellidos</label>
                    <input
                      type="text"
                      className="input-base"
                      value={p.apellidos}
                      onChange={e => updatePasajero(idx, 'apellidos', e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>RUT o Pasaporte</label>
                    <input
                      type="text"
                      className="input-base"
                      value={p.rut}
                      onChange={e => updatePasajero(idx, 'rut', e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  {idx === 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '6px' }}>Correo Electrónico</label>
                      <input
                        type="email"
                        className="input-base"
                        value={p.email}
                        onChange={e => updatePasajero(idx, 'email', e.target.value)}
                        required
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Addons Section */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>🧳 Personaliza tu Viaje (Addons)</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Agrega servicios adicionales para mayor comodidad.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Addon 1 */}
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  background: addons.equipajeExtra ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                  borderColor: addons.equipajeExtra ? 'var(--color-teal)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={addons.equipajeExtra}
                      onChange={e => setAddons({ ...addons, equipajeExtra: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-teal)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>Equipaje de Bodega (23kg)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Para todos los pasajeros en vuelos/buses</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-teal)' }}>+{formatPrecio(preciosAddons.equipajeExtra)}</div>
                </label>

                {/* Addon 2 */}
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  background: addons.seguroViaje ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                  borderColor: addons.seguroViaje ? 'var(--color-teal)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={addons.seguroViaje}
                      onChange={e => setAddons({ ...addons, seguroViaje: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-teal)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>Seguro de Viaje & Cancelación</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Cobertura médica completa y reembolso 100%</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-teal)' }}>+{formatPrecio(preciosAddons.seguroViaje)}</div>
                </label>

                {/* Addon 3 */}
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  background: addons.transferPrivado ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                  borderColor: addons.transferPrivado ? 'var(--color-teal)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={addons.transferPrivado}
                      onChange={e => setAddons({ ...addons, transferPrivado: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-teal)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>Transfer Privado Aeropuerto ↔ Hotel</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Chofer esperándote con cartel a tu nombre</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-teal)' }}>+{formatPrecio(preciosAddons.transferPrivado)}</div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
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
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '24px' }}>Resumen del Paquete</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Destino</span>
                <strong style={{ color: '#fff' }}>{destino}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Pasajeros</span>
                <strong style={{ color: '#fff' }}>{pasajerosCount} personas</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Transporte</span>
                <strong style={{ color: '#fff' }}>{vuelo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Alojamiento</span>
                <strong style={{ color: '#fff' }}>{hotel}</strong>
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

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Paquete Base</span>
                <span>{formatPrecio(precioBase)}</span>
              </div>
              {addons.equipajeExtra && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-teal)' }}>
                  <span>Equipaje Extra</span>
                  <span>+{formatPrecio(preciosAddons.equipajeExtra)}</span>
                </div>
              )}
              {addons.seguroViaje && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-teal)' }}>
                  <span>Seguro de Viaje</span>
                  <span>+{formatPrecio(preciosAddons.seguroViaje)}</span>
                </div>
              )}
              {addons.transferPrivado && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-teal)' }}>
                  <span>Transfer Privado</span>
                  <span>+{formatPrecio(preciosAddons.transferPrivado)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total a Pagar</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-teal)' }}>
                  {formatPrecio(calcularTotal())}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="reserva-form"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            >
              🔒 Continuar al Pago
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ReservaPage() {
  return (
    <Suspense fallback={<div className="container-main" style={{ color: 'white', textAlign: 'center', padding: '100px 0' }}>Cargando datos de reserva...</div>}>
      <ReservaContent />
    </Suspense>
  )
}
