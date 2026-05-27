import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8001'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug       = searchParams.get('slug')
  const fechaIda   = searchParams.get('ida')
  const fechaVuelta = searchParams.get('vuelta')
  const pasajeros  = searchParams.get('pasajeros') || '1'

  if (!slug || !fechaIda || !fechaVuelta) {
    return NextResponse.json(
      { error: 'Parámetros requeridos: slug, ida, vuelta' },
      { status: 400 }
    )
  }

  try {
    const url = `${PYTHON_API}/api/buscar?${searchParams.toString()}`
    
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(60_000), // 60s timeout para scraping
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error del servidor Python' }))
      return NextResponse.json(
        { error: err.detail || 'Error en el servidor de scraping' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    const isOffline = msg.includes('ECONNREFUSED') || msg.includes('fetch failed')

    return NextResponse.json(
      {
        error: isOffline
          ? 'El servidor de scraping no está iniciado. Ejecuta: python scraper/server.py'
          : msg,
        offline: isOffline,
      },
      { status: 503 }
    )
  }
}
