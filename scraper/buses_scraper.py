"""
buses_scraper.py — Extractor de Buses (Recorrido.cl)
=====================================================
Usa Scrapling en modo Stealth para evadir bloqueos anti-bot.
Reemplaza el mock de buses con datos reales de Recorrido.cl.
"""

import asyncio
import logging
import random
from datetime import datetime
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Mapping de slug turístico → slug de Recorrido.cl
RECORRIDO_DEST_MAP: Dict[str, str] = {
    "san-pedro-de-atacama": "san-pedro-de-atacama",
    "torres-del-paine":     "puerto-natales",
    "valdivia":             "valdivia",
    "chiloe":               "castro",
    "pucon":                "pucon",
    "isla-de-pascua":       None,  # No hay buses a Rapa Nui
    "vina-del-mar":         "vina-del-mar",
    "elqui":                "la-serena",
    "cajon-del-maipo":      None,  # Solo transfer local
    "puerto-natales":       "puerto-natales",
}

RECORRIDO_ORIGEN_MAP: Dict[str, str] = {
    "Santiago":       "santiago",
    "Concepción":     "concepcion",
    "Valparaíso":     "valparaiso",
    "La Serena":      "la-serena",
    "Temuco":         "temuco",
    "Puerto Montt":   "puerto-montt",
    "Antofagasta":    "antofagasta",
    "Iquique":        "iquique",
    "Punta Arenas":   "punta-arenas",
    "Arica":          "arica",
}

# Fallback con datos referenciales de buses chilenos reales
BUSES_FALLBACK: Dict[str, List[Dict]] = {
    "san-pedro-de-atacama": [
        {"operador": "Pullman Bus", "precio": 38000, "hora_salida": "21:00", "hora_llegada": "19:30+1", "duracion_min": 1350, "tipo": "Semi Cama"},
        {"operador": "Turbus", "precio": 42000, "hora_salida": "20:00", "hora_llegada": "18:00+1", "duracion_min": 1320, "tipo": "Salón Cama"},
        {"operador": "Buses Atacama 2000", "precio": 28000, "hora_salida": "22:30", "hora_llegada": "20:00+1", "duracion_min": 1290, "tipo": "Semi Cama"},
    ],
    "torres-del-paine": [  # Bus hasta Puerto Natales
        {"operador": "Buses Fernández", "precio": 65000, "hora_salida": "08:00", "hora_llegada": "11:30+2", "duracion_min": 3090, "tipo": "Semi Cama"},
        {"operador": "Bus Sur", "precio": 72000, "hora_salida": "17:00", "hora_llegada": "20:30+2", "duracion_min": 3090, "tipo": "Salón Cama"},
    ],
    "valdivia": [
        {"operador": "Pullman Bus", "precio": 18000, "hora_salida": "23:00", "hora_llegada": "08:30", "duracion_min": 570, "tipo": "Semi Cama"},
        {"operador": "Turbus", "precio": 22000, "hora_salida": "22:00", "hora_llegada": "07:45", "duracion_min": 585, "tipo": "Salón Cama"},
        {"operador": "Cruz del Sur", "precio": 20000, "hora_salida": "21:00", "hora_llegada": "07:15", "duracion_min": 615, "tipo": "Semi Cama"},
        {"operador": "JAC", "precio": 15000, "hora_salida": "22:30", "hora_llegada": "09:00", "duracion_min": 630, "tipo": "Clásico"},
    ],
    "chiloe": [  # Bus hasta Castro
        {"operador": "Cruz del Sur", "precio": 28000, "hora_salida": "20:00", "hora_llegada": "09:30", "duracion_min": 810, "tipo": "Semi Cama"},
        {"operador": "Pullman Bus", "precio": 32000, "hora_salida": "21:00", "hora_llegada": "10:00", "duracion_min": 780, "tipo": "Salón Cama"},
        {"operador": "Queilen Bus", "precio": 25000, "hora_salida": "19:30", "hora_llegada": "09:00", "duracion_min": 810, "tipo": "Semi Cama"},
    ],
    "pucon": [
        {"operador": "JAC", "precio": 14000, "hora_salida": "22:30", "hora_llegada": "07:00", "duracion_min": 510, "tipo": "Semi Cama"},
        {"operador": "Pullman Bus", "precio": 18000, "hora_salida": "23:00", "hora_llegada": "07:30", "duracion_min": 510, "tipo": "Salón Cama"},
        {"operador": "Turbus", "precio": 16000, "hora_salida": "22:00", "hora_llegada": "07:15", "duracion_min": 555, "tipo": "Semi Cama"},
        {"operador": "Cóndor Bus", "precio": 15000, "hora_salida": "21:30", "hora_llegada": "06:30", "duracion_min": 540, "tipo": "Semi Cama"},
    ],
    "vina-del-mar": [
        {"operador": "Turbus", "precio": 5500, "hora_salida": "08:00", "hora_llegada": "09:45", "duracion_min": 105, "tipo": "Express"},
        {"operador": "Pullman Bus", "precio": 5000, "hora_salida": "09:00", "hora_llegada": "10:50", "duracion_min": 110, "tipo": "Express"},
        {"operador": "Cóndor Bus", "precio": 4500, "hora_salida": "10:00", "hora_llegada": "11:50", "duracion_min": 110, "tipo": "Clásico"},
    ],
    "elqui": [  # Bus hasta La Serena
        {"operador": "Pullman Bus", "precio": 15000, "hora_salida": "22:00", "hora_llegada": "05:30", "duracion_min": 450, "tipo": "Semi Cama"},
        {"operador": "Turbus", "precio": 18000, "hora_salida": "21:00", "hora_llegada": "04:30", "duracion_min": 450, "tipo": "Salón Cama"},
        {"operador": "Cóndor Bus", "precio": 13000, "hora_salida": "23:00", "hora_llegada": "06:00", "duracion_min": 420, "tipo": "Semi Cama"},
    ],
    "puerto-natales": [
        {"operador": "Buses Fernández", "precio": 62000, "hora_salida": "08:00", "hora_llegada": "11:00+2", "duracion_min": 3060, "tipo": "Semi Cama"},
        {"operador": "Bus Sur", "precio": 68000, "hora_salida": "17:00", "hora_llegada": "20:00+2", "duracion_min": 3060, "tipo": "Salón Cama"},
    ],
}


def _formato_fecha_recorrido(fecha_iso: str) -> str:
    """Convierte YYYY-MM-DD → DD-MM-YYYY (formato Recorrido.cl)."""
    try:
        dt = datetime.strptime(fecha_iso, "%Y-%m-%d")
        return dt.strftime("%d-%m-%Y")
    except ValueError:
        return fecha_iso


def build_recorrido_url(origen_slug: str, destino_slug: str, fecha_iso: str) -> str:
    """Construye URL de Recorrido.cl."""
    fecha_fmt = _formato_fecha_recorrido(fecha_iso)
    return f"https://www.recorrido.cl/es/bus/{origen_slug}/{destino_slug}/{fecha_fmt}"


def extraer_buses_recorrido(
    destino_slug: str,
    fecha_ida: str,
    fecha_vuelta: str,
    pax: int,
    origen: str = "Santiago"
) -> List[Dict[str, Any]]:
    """
    Extrae buses de Recorrido.cl usando Scrapling Stealth.
    Si falla, retorna datos del catálogo referencial chileno real.
    """
    destino_recorrido = RECORRIDO_DEST_MAP.get(destino_slug)
    origen_recorrido = RECORRIDO_ORIGEN_MAP.get(origen, origen.lower().replace(" ", "-"))

    if not destino_recorrido:
        logger.info(f"🚌 No hay buses terrestres disponibles para '{destino_slug}' (destino insular/local)")
        return []

    deep_link = build_recorrido_url(origen_recorrido, destino_recorrido, fecha_ida)

    try:
        from scrapling import Fetcher

        logger.info(f"🚌 Scraping Recorrido.cl: {deep_link}")
        fetcher = Fetcher(auto_match=True)
        page = fetcher.get(deep_link, stealthy_headers=True)

        resultados = []
        # Selectores para Recorrido.cl 2026
        tarjetas = page.css('.trip-card, [data-testid="trip-result"], .search-result-item')[:5]

        for tarjeta in tarjetas:
            try:
                operador_el = tarjeta.css_first('.company-name, .operator-name, [data-testid="company"]')
                precio_el = tarjeta.css_first('.price, [data-testid="price"]')
                salida_el = tarjeta.css_first('.departure-time, [data-testid="departure"]')
                llegada_el = tarjeta.css_first('.arrival-time, [data-testid="arrival"]')
                duracion_el = tarjeta.css_first('.duration, [data-testid="duration"]')
                tipo_el = tarjeta.css_first('.service-type, .bus-type')

                if not operador_el or not precio_el:
                    continue

                operador = operador_el.text.strip()
                precio_raw = precio_el.text.strip()
                precio = int(''.join(c for c in precio_raw if c.isdigit()) or '0')

                hora_salida = salida_el.text.strip() if salida_el else "22:00"
                hora_llegada = llegada_el.text.strip() if llegada_el else "08:00"

                duracion_min = 480  # Default 8h
                if duracion_el:
                    dur_text = duracion_el.text
                    horas = 0
                    mins = 0
                    parts = dur_text.split("h")
                    if len(parts) >= 1:
                        horas = int(''.join(c for c in parts[0] if c.isdigit()) or '0')
                    if len(parts) >= 2:
                        mins = int(''.join(c for c in parts[1] if c.isdigit()) or '0')
                    duracion_min = horas * 60 + mins

                tipo = tipo_el.text.strip() if tipo_el else "Semi Cama"

                resultados.append({
                    "operador": operador,
                    "precio": precio,
                    "hora_salida": hora_salida,
                    "hora_llegada": hora_llegada,
                    "duracion_min": duracion_min,
                    "tipo": tipo,
                    "deep_link": deep_link,
                    "fuente": "recorrido_live",
                })

            except Exception as e:
                logger.debug(f"Error parseando tarjeta bus: {e}")
                continue

        if resultados:
            logger.info(f"✅ Recorrido.cl: {len(resultados)} buses encontrados para '{destino_slug}'")
            return resultados

    except ImportError:
        logger.warning("⚠️ Scrapling no disponible. Usando catálogo referencial de buses.")
    except Exception as e:
        logger.warning(f"⚠️ Error scraping Recorrido.cl ({e}). Usando catálogo referencial.")

    # Fallback al catálogo referencial
    fallback = BUSES_FALLBACK.get(destino_slug, [])
    if not fallback:
        return []

    result = []
    for b in fallback:
        variacion = random.uniform(0.90, 1.15)
        precio = int(b["precio"] * variacion)

        result.append({
            **b,
            "precio": precio,
            "deep_link": deep_link,
            "fuente": "referencial_catalogo",
        })

    logger.info(f"📋 Usando catálogo referencial: {len(result)} buses para '{destino_slug}'")
    return result


async def buscar_buses_async(
    destino_slug: str,
    fecha_ida: str,
    fecha_vuelta: str,
    pax: int,
    origen: str = "Santiago"
) -> List[Dict[str, Any]]:
    """Wrapper asíncrono para que FastAPI orqueste sin bloquearse."""
    return await asyncio.to_thread(
        extraer_buses_recorrido, destino_slug, fecha_ida, fecha_vuelta, pax, origen
    )
