'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: 'Consulta de Reserva', mensaje: '' })
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <div className="container-main" style={{ padding: '60px clamp(1rem, 5vw, 3rem)' }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', marginBottom: '16px' }}>
          Contacto de <span style={{ color: 'var(--color-teal)' }}>Soporte</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          ¿Necesitas asistencia urgente con tu itinerario, cambios de vuelo o dudas generales? Nuestro centro de atención en Santiago está listo para ayudarte.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Left Column: Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="bg-glass-card" style={{ padding: '32px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              📞
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>ATENCIÓN TELEFÓNICA (24/7)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>+56 2 2938 4500</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-teal)', marginTop: '4px' }}>Línea directa para emergencias de vuelo</div>
            </div>
          </div>

          <div className="bg-glass-card" style={{ padding: '32px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              💬
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>WHATSAPP OFICIAL</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>+56 9 8765 4321</div>
              <a href="https://wa.me/56987654321" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-teal)', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}>
                Iniciar chat seguro ↗
              </a>
            </div>
          </div>

          <div className="bg-glass-card" style={{ padding: '32px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              ✉️
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>CORREO DE SOPORTE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>soporte@plataformaturismo.cl</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px' }}>Tiempo de respuesta prom: 15 minutos</div>
            </div>
          </div>

          <div className="bg-glass-card" style={{ padding: '32px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              📍
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>OFICINA CENTRAL</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Av. Vitacura 2670, Piso 14</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px' }}>Las Condes, Santiago, Chile</div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-glass" style={{ borderRadius: '24px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Envíanos un Mensaje</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Completa el formulario y un agente especializado se pondrá en contacto contigo.</p>

          {enviado ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(45, 212, 191, 0.1)', border: '1px solid var(--color-teal)', borderRadius: '16px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>¡Mensaje Enviado Exitosamente!</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>Hemos recibido tu consulta. Te enviaremos una confirmación y respuesta a {form.email}.</p>
              <button onClick={() => setEnviado(false)} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Enviar otro mensaje</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Tu Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rodrigo González"
                  className="input-base"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.cl"
                  className="input-base"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Motivo de la Consulta</label>
                <select
                  className="input-base"
                  value={form.asunto}
                  onChange={e => setForm({ ...form, asunto: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Consulta de Reserva">Consulta sobre una Reserva Existente</option>
                  <option value="Cambio de Vuelo">Solicitud de Cambio de Fecha / Vuelo</option>
                  <option value="Problema de Pago">Duda sobre Cargos o Medios de Pago</option>
                  <option value="Facturacion">Solicitud de Factura Empresa</option>
                  <option value="Otro">Otras Consultas Generales</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Mensaje o Detalle</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Indica tu código de reserva (si lo tienes) y explica tu consulta en detalle..."
                  className="input-base"
                  value={form.mensaje}
                  onChange={e => setForm({ ...form, mensaje: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} type="submit" className="btn btn-primary" style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 700, marginTop: '8px', width: '100%' }}>
                ✉️ Enviar Mensaje a Soporte
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
