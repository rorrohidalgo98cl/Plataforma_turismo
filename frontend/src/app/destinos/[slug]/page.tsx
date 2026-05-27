import { DESTINOS } from '@/data/destinos'
import DestinoDetailClient from './DestinoDetailClient'

// Generar rutas estáticas en tiempo de compilación (SSG / SEO Programático)
export function generateStaticParams() {
  return DESTINOS.map((destino) => ({
    slug: destino.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const destino = DESTINOS.find((d) => d.slug === params.slug)
  if (!destino) {
    return { title: 'Destino no encontrado | Plataforma de Turismo' }
  }
  return {
    title: `Viajes a ${destino.nombre}, ${destino.region} | Vuelos, Hoteles y Paquetes`,
    description: destino.descripcion || `Descubre los mejores paquetes turísticos, vuelos y hoteles en ${destino.nombre}. Explora atractivos, clima y planifica tu viaje perfecto.`,
    openGraph: {
      title: `Viajes a ${destino.nombre} | Plataforma de Turismo`,
      description: destino.descripcion || `Descubre los mejores paquetes turísticos en ${destino.nombre}.`,
      images: [destino.imagen],
    },
  }
}

export default function DestinoDetailPage({ params }: { params: { slug: string } }) {
  const destino = DESTINOS.find((d) => d.slug === params.slug)

  if (!destino) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', fontFamily: 'var(--font-heading)' }}>Destino no encontrado</h1>
      </div>
    )
  }

  return <DestinoDetailClient destino={destino} />
}
