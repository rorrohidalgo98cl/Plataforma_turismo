"""
Scraper LATAM Airlines — Estrategia Sin Proxies
===============================================
Estrategia: Interceptar la respuesta XHR/JSON que LATAM carga dinámicamente.
LATAM usa una API interna que devuelve JSON con tarifas — capturamos eso
directamente en lugar de parsear HTML, lo que es más rápido y menos detectable.

Destinos domésticos Chile soportados en este MVP:
- SCL → CJC (Calama → San Pedro de Atacama)
- SCL → PUQ (Punta Arenas → Torres del Paine)
- SCL → ZAL (Valdivia)
- SCL → PMC (Puerto Montt → Chiloé)
- SCL → ZCO (Temuco → Pucón)
- SCL → IPC (Isla de Pascua)
- SCL → LSC (La Serena → Valle del Elqui)
- SCL → PNT (Puerto Natales)
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional
from .base import create_stealth_context, human_delay, human_scroll, intercept_xhr_responses

logger = logging.getLogger(__name__)

# Códigos IATA de los 10 destinos MVP
DESTINOS_IATA = {
    'san-pedro-de-atacama': 'CJC',
    'torres-del-paine': 'PUQ',
    'valdivia': 'ZAL',
    'chiloe': 'PMC',
    'pucon': 'ZCO',
    'isla-de-pascua': 'IPC',
    'via-del-mar': 'SCL',  # Desde Santiago en bus
    'elqui': 'LSC',
    'cajon-del-maipo': 'SCL',  # Day trip desde SCL
    'puerto-natales': 'PNT',
}

LATAM_URL_BASE = "https://www.latamairlines.com/cl/es/ofertas-vuelos"


async def scrape_vuelos_latam(
    origen: str,
    destino_iata: str,
    fecha_ida: str,   # formato: YYYY-MM-DD
    fecha_vuelta: str,
    pasajeros: int = 1,
) -> list[dict]:
    """
    Scrapea vuelos de LATAM usando interceptación XHR.
    Retorna lista de vuelos normalizados.
    """
    resultados = []

    async with async_playwright() as p:
        browser, context = await create_stealth_context(p)
        page = await context.new_page()

        # Patrones de URL de la API interna de LATAM a interceptar
        xhr_patterns = [
            'availability',
            'flightAvailability',
            'flights/search',
            '/api/v',
        ]
        captured = intercept_xhr_responses(page, xhr_patterns)

        try:
            # URL de búsqueda LATAM
            url = (
                f"{LATAM_URL_BASE}?"
                f"origin={origen}&inbound={destino_iata}"
                f"&outbound={origen}&destination={destino_iata}"
                f"&adt={pasajeros}&chd=0&inf=0"
                f"&trip=RT"
                f"&dt={fecha_ida}&ot={fecha_vuelta}"
                f"&em=false&sc=false"
            )

            logger.info(f"🛫 LATAM: scrapeando {origen}→{destino_iata} ({fecha_ida})")

            await page.goto(url, wait_until='domcontentloaded', timeout=30000)

            # Espera humana mientras carga la página
            await human_delay(2000, 4000)

            # Scroll simulado (comportamiento humano)
            await human_scroll(page)
            await human_delay(1500, 3000)

            # Intentar leer XHR capturados
            if captured:
                for item in captured:
                    vuelos = _parse_latam_json(item['data'])
                    resultados.extend(vuelos)
                logger.info(f"✅ LATAM XHR: {len(resultados)} vuelos encontrados")
            else:
                # Fallback: scraping HTML del DOM
                resultados = await _scrape_latam_dom(page, origen, destino_iata, fecha_ida)

        except Exception as e:
            logger.error(f"❌ Error LATAM {origen}→{destino_iata}: {e}")
        finally:
            await context.close()
            await browser.close()

    return resultados


def _parse_latam_json(data: dict) -> list[dict]:
    """Normaliza la respuesta JSON de la API de LATAM al formato estándar."""
    vuelos = []
    try:
        # Estructura típica de LATAM: data.flights o data.itineraries
        flights = (
            data.get('flights') or
            data.get('itineraries') or
            data.get('data', {}).get('flights', [])
        )

        for flight in flights[:5]:  # Máximo 5 opciones por búsqueda
            precio = (
                flight.get('price', {}).get('total') or
                flight.get('totalPrice') or
                flight.get('fare', {}).get('total', 0)
            )

            salida = (
                flight.get('departureDate') or
                flight.get('departure', {}).get('dateTime', '')
            )

            llegada = (
                flight.get('arrivalDate') or
                flight.get('arrival', {}).get('dateTime', '')
            )

            if precio and precio > 0:
                vuelos.append({
                    'aerolinea': 'LATAM',
                    'precio': float(precio),
                    'moneda': 'CLP',
                    'salida': salida,
                    'llegada': llegada,
                    'duracion_min': flight.get('durationInMinutes', 0),
                    'escalas': len(flight.get('segments', [])) - 1,
                    'disponible': True,
                    'fuente': 'latam_xhr',
                    'scraped_at': datetime.now().isoformat(),
                })
    except Exception as e:
        logger.warning(f"⚠️ Error parseando JSON LATAM: {e}")
    return vuelos


async def _scrape_latam_dom(
    page,
    origen: str,
    destino: str,
    fecha: str,
) -> list[dict]:
    """
    Fallback: scraping directo del DOM cuando XHR no fue capturado.
    Más lento pero funcional.
    """
    vuelos = []
    try:
        # Espera a que carguen los precios
        await page.wait_for_selector('[data-testid="price"], .price, [class*="price"]',
                                      timeout=15000)

        precios_elements = await page.query_selector_all('[data-testid="price"], [class*="price-amount"]')

        for el in precios_elements[:5]:
            texto = await el.inner_text()
            precio_str = ''.join(c for c in texto if c.isdigit())
            if precio_str and len(precio_str) > 3:
                vuelos.append({
                    'aerolinea': 'LATAM',
                    'precio': float(precio_str),
                    'moneda': 'CLP',
                    'salida': fecha,
                    'llegada': fecha,
                    'duracion_min': 0,
                    'escalas': 0,
                    'disponible': True,
                    'fuente': 'latam_dom',
                    'scraped_at': datetime.now().isoformat(),
                })

    except Exception as e:
        logger.warning(f"⚠️ Fallback DOM LATAM falló: {e}")

    return vuelos
