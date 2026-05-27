'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AgenciasPage() {
  const [form, setForm] = useState({ nombreAgencia: '', rutAgencia: '', contacto: '', email: '', telefono: '', plan: 'Pro' })
  const [registrado, setRegistrado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRegistrado(true)
  }

  return (
    <div className="container-main" style={{ padding: '60px clamp(1rem, 5vw, 3rem)' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 60px auto' }}>
        <span style={{ fontSize: '0.85rem', padding: '6px 16px', background: 'rgba(45, 212, 191, 0.1)', color: 'var(--color-teal)', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Plataforma Turismo B2B
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.2rem', margin: '16px 0', lineHeight: 1.2 }}>
          Portal para <span style={{ color: 'var(--color-teal)' }}>Agencias de Viajes</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.2rem', lineHeight: 1.6 }}>
          Potencia tu agencia con nuestro motor híbrido de empaquetado dinámico. Accede a tarifas netas mayoristas de aerolíneas, buses locales y hoteles con comisiones de hasta el 16%.
        </p>
      </div>

      {/* Benefits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto 60px auto' }}>
        <div className="bg-glass-card" style={{ padding: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔌</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '12px' }}>Acceso API & Marca Blanca</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Integra nuestro inventario de vuelos y hoteles directamente en el sitio web de tu agencia mediante nuestra API REST o utiliza nuestra plataforma en modo marca blanca.
          </p>
        </div>

        <div className="bg-glass-card" style={{ padding: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💰</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '12px' }}>Comisiones Atractivas</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Obtén comisiones garantizadas del 12% al 16% sobre el valor neto de cada paquete dinámico reservado, con liquidaciones automáticas quincenales en tu cuenta bancaria.
          </p>
        </div>

        <div className="bg-glass-card" style={{ padding: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛠️</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '12px' }}>Herramienta de Cotización B2B</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Genera cotizaciones en PDF personalizadas con el logo de tu agencia en segundos, permitiendo a tus ejecutivos de venta cerrar negocios más rápido.
          </p>
        </div>
      </div>

      {/* Registration Section */}
      <div className="bg-glass" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: '12px' }}>Solicitar Cuenta de Agencia B2B</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>Únete a más de 45 agencias a lo largo de Chile que ya operan con nuestra tecnología.</p>
        </div>

        {registrado ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(45, 212, 191, 0.1)', border: '1px solid var(--color-teal)', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>¡Solicitud Recibida con Éxito!</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>Nuestro equipo comercial B2B evaluará los antecedentes de {form.nombreAgencia} (RUT: {form.rutAgencia}) y te contactará en las próximas 24 horas hábiles.</p>
            <button onClick={() => setRegistrado(false)} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Nueva solicitud</button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Nombre de la Agencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Turismo del Sur SPA"
                  className="input-base"
                  value={form.nombreAgencia}
                  onChange={e => setForm({ ...form, nombreAgencia: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>RUT de la Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 76.543.210-K"
                  className="input-base"
                  value={form.rutAgencia}
                  onChange={e => setForm({ ...form, rutAgencia: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Nombre del Contacto Comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Camila Silva"
                  className="input-base"
                  value={form.contacto}
                  onChange={e => setForm({ ...form, contacto: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Teléfono Móvil / WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +56 9 1234 5678"
                  className="input-base"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Correo Electrónico Corporativo</label>
              <input
                type="email"
                required
                placeholder="contacto@agenciadelsur.cl"
                className="input-base"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '8px' }}>Plan de Integración Deseado</label>
              <select
                className="input-base"
                value={form.plan}
                onChange={e => setForm({ ...form, plan: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Pro">Plan Pro (Portal Web B2B + Cotizador PDF)</option>
                <option value="API">Plan Enterprise API (Integración XML/JSON Marca Blanca)</option>
                <option value="Afiliado">Plan Afiliado (Widgets y Banners para Blog/Web)</option>
              </select>
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} type="submit" className="btn btn-primary" style={{ padding: '18px', fontSize: '1.1rem', fontWeight: 700, marginTop: '12px', width: '100%' }}>
              🚀 Solicitar Acreditación B2B
            </motion.button>
          </form>
        )}
      </div>
    </div>
  )
}
