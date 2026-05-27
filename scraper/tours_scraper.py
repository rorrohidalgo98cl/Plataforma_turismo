"""
tours_scraper.py — Extractor de Tours y Actividades (Tur.com)
=============================================================
Usa Scrapling en modo Stealth para evadir bloqueos anti-bot.
Captura datos vitales para el motor de Cross-Selling (incluye_traslado).
"""

import asyncio
import logging
import random
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Mapping de slug → ID de búsqueda en Tur.com
TURCOM_DEST_MAP: Dict[str, str] = {
    "san-pedro-de-atacama": "San+Pedro+de+Atacama",
    "torres-del-paine":     "Torres+del+Paine",
    "valdivia":             "Valdivia",
    "chiloe":               "Chiloé",
    "pucon":                "Pucón",
    "isla-de-pascua":       "Isla+de+Pascua",
    "vina-del-mar":         "Viña+del+Mar",
    "elqui":                "Valle+del+Elqui",
    "cajon-del-maipo":      "Cajón+del+Maipo",
    "puerto-natales":       "Puerto+Natales",
}

# Catálogo referencial de tours por destino (fallback cuando Scrapling falla)
TOURS_FALLBACK: Dict[str, List[Dict]] = {
    "san-pedro-de-atacama": [
        {"tour": "Tour Valle de la Luna al Atardecer", "precio": 35000, "duracion_horas": 4, "incluye_traslado": True, "punto_encuentro": "Hotel en San Pedro"},
        {"tour": "Visita Géiseres del Tatio (Madrugada)", "precio": 45000, "duracion_horas": 5, "incluye_traslado": True, "punto_encuentro": "Hotel en San Pedro"},
        {"tour": "Laguna Cejar y Ojos del Salar", "precio": 30000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Oficina Central SPA"},
        {"tour": "Sandboard en Dunas de Atacama", "precio": 25000, "duracion_horas": 2, "incluye_traslado": False, "punto_encuentro": "Dunas de Valle de la Luna"},
        {"tour": "Observación Astronómica Premium", "precio": 20000, "duracion_horas": 3, "incluye_traslado": False, "punto_encuentro": "Observatorio SPACE"},
    ],
    "torres-del-paine": [
        {"tour": "Trekking Base Las Torres (Ida y Vuelta)", "precio": 55000, "duracion_horas": 10, "incluye_traslado": False, "punto_encuentro": "Camping Las Torres"},
        {"tour": "Navegación Glaciar Grey", "precio": 80000, "duracion_horas": 6, "incluye_traslado": False, "punto_encuentro": "Muelle Pudeto"},
        {"tour": "Full Day Circuito W (Cuernos + Valle)", "precio": 65000, "duracion_horas": 12, "incluye_traslado": True, "punto_encuentro": "Hotel en Puerto Natales"},
        {"tour": "Kayak en Río Serrano", "precio": 45000, "duracion_horas": 4, "incluye_traslado": False, "punto_encuentro": "Rio Serrano Lodge"},
        {"tour": "Avistamiento de Cóndores y Fauna Patagónica", "precio": 35000, "duracion_horas": 5, "incluye_traslado": True, "punto_encuentro": "Hotel en Puerto Natales"},
    ],
    "pucon": [
        {"tour": "Ascenso Volcán Villarrica", "precio": 70000, "duracion_horas": 8, "incluye_traslado": False, "punto_encuentro": "Oficina Pucón Centro"},
        {"tour": "Rafting Río Trancura (Clase IV)", "precio": 40000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Pucón"},
        {"tour": "Termas Los Pozones Nocturnas", "precio": 25000, "duracion_horas": 3, "incluye_traslado": False, "punto_encuentro": "Ruta al Volcán Km 35"},
        {"tour": "Canopy y Tirolesa Bosque Nativo", "precio": 35000, "duracion_horas": 2, "incluye_traslado": False, "punto_encuentro": "Parque Fluvial Pucón"},
        {"tour": "Kayak Lago Villarrica (Atardecer)", "precio": 30000, "duracion_horas": 3, "incluye_traslado": False, "punto_encuentro": "Muelle Pucón"},
    ],
    "chiloe": [
        {"tour": "Visita Iglesias Patrimonio UNESCO", "precio": 30000, "duracion_horas": 5, "incluye_traslado": True, "punto_encuentro": "Hotel en Castro"},
        {"tour": "Palafitos y Gastronomía Chilota", "precio": 25000, "duracion_horas": 4, "incluye_traslado": True, "punto_encuentro": "Hotel en Castro"},
        {"tour": "Avistamiento Pingüinos Isla Metalqui", "precio": 60000, "duracion_horas": 6, "incluye_traslado": False, "punto_encuentro": "Muelle Cucao"},
        {"tour": "Curanto en Hoyo Traditional", "precio": 35000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Castro"},
        {"tour": "Navegación Fiordos de Chiloé", "precio": 75000, "duracion_horas": 8, "incluye_traslado": False, "punto_encuentro": "Puerto Montt"},
    ],
    "valdivia": [
        {"tour": "Paseo en Catamarán por el Río Valdivia", "precio": 20000, "duracion_horas": 2, "incluye_traslado": False, "punto_encuentro": "Muelle Mancera"},
        {"tour": "Visita Fuerte Niebla y Corral", "precio": 25000, "duracion_horas": 4, "incluye_traslado": False, "punto_encuentro": "Muelle Niebla"},
        {"tour": "Cerveza Artesanal Kunstmann + Culinaria", "precio": 30000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Valdivia"},
        {"tour": "Observación de Lobos Marinos Mancera", "precio": 22000, "duracion_horas": 3, "incluye_traslado": False, "punto_encuentro": "Muelle Corral"},
    ],
    "isla-de-pascua": [
        {"tour": "Tour Moáis Ahu Tongariki al Amanecer", "precio": 45000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Hanga Roa"},
        {"tour": "Snorkel Playa Anakena (Aguas Cristalinas)", "precio": 35000, "duracion_horas": 4, "incluye_traslado": True, "punto_encuentro": "Hotel en Hanga Roa"},
        {"tour": "Cabalgata Costera a los Moáis", "precio": 55000, "duracion_horas": 5, "incluye_traslado": False, "punto_encuentro": "Rancho Ariki"},
        {"tour": "Volcán Rano Raraku (Cantera Moáis)", "precio": 30000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Hanga Roa"},
    ],
    "cajon-del-maipo": [
        {"tour": "Trekking Glaciar El Morado (Full Day)", "precio": 35000, "duracion_horas": 8, "incluye_traslado": True, "punto_encuentro": "Metro Bellavista de la Florida"},
        {"tour": "Rafting Río Maipo (Clase III)", "precio": 40000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Metro Bellavista de la Florida"},
        {"tour": "Termas Baños Morales + Cascada", "precio": 30000, "duracion_horas": 6, "incluye_traslado": True, "punto_encuentro": "Plaza Italia Santiago"},
        {"tour": "Canopy y Rappel El Volcán", "precio": 35000, "duracion_horas": 4, "incluye_traslado": True, "punto_encuentro": "Centro Providencia"},
    ],
    "elqui": [
        {"tour": "Observatorio Astronómico Mamalluca", "precio": 18000, "duracion_horas": 3, "incluye_traslado": False, "punto_encuentro": "Vicuña Centro"},
        {"tour": "Visita Destilería Pisco Premium", "precio": 22000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Vicuña"},
        {"tour": "Trekking Parque Nacional Fray Jorge", "precio": 30000, "duracion_horas": 5, "incluye_traslado": False, "punto_encuentro": "La Serena"},
        {"tour": "Meditación y Retiro Espiritual Valle", "precio": 25000, "duracion_horas": 4, "incluye_traslado": True, "punto_encuentro": "Hotel en Pisco Elqui"},
    ],
    "vina-del-mar": [
        {"tour": "City Tour Viña del Mar + Valparaíso", "precio": 25000, "duracion_horas": 5, "incluye_traslado": True, "punto_encuentro": "Hotel en Viña del Mar"},
        {"tour": "Paseo en Kayak Bahía de Valparaíso", "precio": 30000, "duracion_horas": 3, "incluye_traslado": False, "punto_encuentro": "Muelle Vergara"},
        {"tour": "Gastronomía Cerros Valparaíso (Noche)", "precio": 35000, "duracion_horas": 4, "incluye_traslado": True, "punto_encuentro": "Hotel en Viña del Mar"},
    ],
    "puerto-natales": [
        {"tour": "Navegación Fiordos Patagónicos", "precio": 90000, "duracion_horas": 8, "incluye_traslado": False, "punto_encuentro": "Puerto de Natales"},
        {"tour": "Cueva del Milodón + Historia Precolombina", "precio": 30000, "duracion_horas": 3, "incluye_traslado": True, "punto_encuentro": "Hotel en Puerto Natales"},
        {"tour": "Trekking Cerro Dorotea (Vistas Patagónicas)", "precio": 25000, "duracion_horas": 4, "incluye_traslado": False, "punto_encuentro": "Km 9 Ruta a Torres del Paine"},
    ],
}

# Coordenadas de puntos de encuentro para el mapa reactivo
PUNTOS_ENCUENTRO_COORDS: Dict[str, Dict[str, float]] = {
    "san-pedro-de-atacama": {"lat": -22.9087, "lng": -68.1997},
    "torres-del-paine":     {"lat": -51.7289, "lng": -72.4977},
    "pucon":                {"lat": -39.2721, "lng": -71.9771},
    "chiloe":               {"lat": -42.4822, "lng": -73.7645},
    "valdivia":             {"lat": -39.8142, "lng": -73.2459},
    "isla-de-pascua":       {"lat": -27.1127, "lng": -109.3497},
    "cajon-del-maipo":      {"lat": -33.649, "lng": -70.354},
    "elqui":                {"lat": -30.0285, "lng": -70.7945},
    "vina-del-mar":         {"lat": -33.0153, "lng": -71.55},
    "puerto-natales":       {"lat": -51.7289, "lng": -72.4977},
}


def extraer_tours_turcom(destino_slug: str, fecha: str) -> List[Dict[str, Any]]:
    """
    Extrae el catálogo de experiencias de Tur.com usando Scrapling Stealth.
    Si falla, retorna datos del catálogo referencial enriquecido.
    """
    try:
        from scrapling import Fetcher
        dest_id = TURCOM_DEST_MAP.get(destino_slug)
        if not dest_id:
            raise ValueError(f"Destino {destino_slug} no tiene mapping en Tur.com")

        url = f"https://www.tur.com/actividades/?destino={dest_id}&fecha={fecha}"
        logger.info(f"🎟️ Scraping Tur.com para '{destino_slug}': {url[:70]}...")

        fetcher = Fetcher(auto_match=True)
        page = fetcher.get(url, stealthy_headers=True)

        resultados = []
        # Selectores actualizados para Tur.com 2026
        tarjetas = page.css('[data-testid="activity-card"], .activity-card, .tour-card')[:5]

        for tarjeta in tarjetas:
            try:
                nombre_el = tarjeta.css_first('[data-testid="title"], .title, h3')
                precio_el = tarjeta.css_first('[data-testid="price"], .price')
                duracion_el = tarjeta.css_first('.duration, .duracion')

                if not nombre_el or not precio_el:
                    continue

                nombre = nombre_el.text.strip()
                precio_raw = precio_el.text.strip()
                precio = int(''.join(c for c in precio_raw if c.isdigit()) or '0')

                texto_completo = tarjeta.text.lower()
                incluye_traslado = any(kw in texto_completo for kw in [
                    "traslado incluido", "pickup incluido", "incluye pickup",
                    "recogida en hotel", "traslado gratuito"
                ])

                duracion_horas = 3  # Default
                if duracion_el:
                    dur_text = duracion_el.text
                    for ch in dur_text:
                        if ch.isdigit():
                            duracion_horas = int(ch)
                            break

                coords = PUNTOS_ENCUENTRO_COORDS.get(destino_slug, {"lat": -33.45, "lng": -70.66})
                resultados.append({
                    "tour": nombre,
                    "precio": precio,
                    "duracion_horas": duracion_horas,
                    "incluye_traslado": incluye_traslado,
                    "punto_encuentro": f"{destino_slug.replace('-', ' ').title()} Centro",
                    "punto_encuentro_lat": coords["lat"] + random.uniform(-0.01, 0.01),
                    "punto_encuentro_lng": coords["lng"] + random.uniform(-0.01, 0.01),
                    "url_reserva": url,
                    "fuente": "turcom_live",
                })

            except Exception as e:
                logger.debug(f"Error parseando tarjeta: {e}")
                continue

        if resultados:
            logger.info(f"✅ Tur.com: {len(resultados)} tours encontrados para '{destino_slug}'")
            return resultados

    except ImportError:
        logger.warning("⚠️ Scrapling no disponible. Usando catálogo referencial.")
    except Exception as e:
        logger.warning(f"⚠️ Error scraping Tur.com ({e}). Usando catálogo referencial.")

    # Fallback al catálogo referencial enriquecido
    fallback = TOURS_FALLBACK.get(destino_slug, [])
    coords = PUNTOS_ENCUENTRO_COORDS.get(destino_slug, {"lat": -33.45, "lng": -70.66})

    result = []
    for t in fallback:
        result.append({
            **t,
            "punto_encuentro_lat": coords["lat"] + random.uniform(-0.008, 0.008),
            "punto_encuentro_lng": coords["lng"] + random.uniform(-0.008, 0.008),
            "url_reserva": f"https://www.tur.com/actividades/?destino={TURCOM_DEST_MAP.get(destino_slug, destino_slug)}&fecha={fecha}",
            "fuente": "referencial_catalogo",
        })

    logger.info(f"📋 Usando catálogo referencial: {len(result)} tours para '{destino_slug}'")
    return result


async def buscar_tours_async(destino_slug: str, fecha: str) -> List[Dict[str, Any]]:
    """Wrapper asíncrono para que FastAPI orqueste sin bloquearse."""
    return await asyncio.to_thread(extraer_tours_turcom, destino_slug, fecha)
