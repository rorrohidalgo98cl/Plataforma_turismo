"""
autos_scraper.py — Extractor de Autos (Rentalcars.com)
=======================================================
Usa Scrapling en modo Stealth para evadir bloqueos anti-bot.
Captura categoría del vehículo para el motor de Afinidad de Terreno (Cross-Selling).
"""

import asyncio
import logging
import random
from datetime import datetime
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Mapping de slug → ciudad de retiro en Rentalcars
RENTALCARS_LOCATION_MAP: Dict[str, Dict[str, str]] = {
    "san-pedro-de-atacama": {"ciudad": "San Pedro de Atacama", "pais": "CL", "iata": "CJC"},
    "torres-del-paine":     {"ciudad": "Puerto Natales", "pais": "CL", "iata": "PNT"},
    "valdivia":             {"ciudad": "Valdivia", "pais": "CL", "iata": "ZAL"},
    "chiloe":               {"ciudad": "Castro", "pais": "CL", "iata": "PMC"},
    "pucon":                {"ciudad": "Pucón", "pais": "CL", "iata": "ZCO"},
    "isla-de-pascua":       {"ciudad": "Hanga Roa", "pais": "CL", "iata": "IPC"},
    "vina-del-mar":         {"ciudad": "Viña del Mar", "pais": "CL", "iata": "SCL"},
    "elqui":                {"ciudad": "La Serena", "pais": "CL", "iata": "LSC"},
    "cajon-del-maipo":      {"ciudad": "Santiago", "pais": "CL", "iata": "SCL"},
    "puerto-natales":       {"ciudad": "Puerto Natales", "pais": "CL", "iata": "PNT"},
}

# Categorías de vehículos y su relevancia para destinos
CATEGORIAS_OFFROAD = {"SUV 4x4", "4x4 Doble Cabina", "SUV Premium 4x4", "Pickup 4x4"}
DESTINOS_OFFROAD = {"san-pedro-de-atacama", "torres-del-paine", "cajon-del-maipo", "puerto-natales"}

# Catálogo referencial de autos por destino
AUTOS_FALLBACK: Dict[str, List[Dict]] = {
    "san-pedro-de-atacama": [
        {"nombre_auto": "Toyota Hilux 4x4", "categoria": "4x4 Doble Cabina", "proveedor": "Hertz", "precio_diario": 85000, "combustible": "Diesel", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Chevrolet S10 Max 4x4", "categoria": "SUV 4x4", "proveedor": "Budget", "precio_diario": 78000, "combustible": "Diesel", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Suzuki Jimny 4x4", "categoria": "SUV 4x4", "proveedor": "Europcar", "precio_diario": 60000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 4},
        {"nombre_auto": "Ford Ranger 4x4", "categoria": "Pickup 4x4", "proveedor": "Avis", "precio_diario": 90000, "combustible": "Diesel", "transmision": "Automático", "plazas": 5},
    ],
    "torres-del-paine": [
        {"nombre_auto": "Toyota Hilux 4x4", "categoria": "4x4 Doble Cabina", "proveedor": "Hertz", "precio_diario": 95000, "combustible": "Diesel", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Land Rover Defender", "categoria": "SUV Premium 4x4", "proveedor": "Sixt", "precio_diario": 130000, "combustible": "Diesel", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Mitsubishi L200 4x4", "categoria": "Pickup 4x4", "proveedor": "Europcar", "precio_diario": 82000, "combustible": "Diesel", "transmision": "Manual", "plazas": 5},
    ],
    "valdivia": [
        {"nombre_auto": "Toyota Yaris", "categoria": "Hatchback Compacto", "proveedor": "Hertz", "precio_diario": 35000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Hyundai Accent", "categoria": "Sedán Compacto", "proveedor": "Budget", "precio_diario": 30000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Suzuki Vitara 4x4", "categoria": "SUV 4x4", "proveedor": "Europcar", "precio_diario": 55000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
    ],
    "chiloe": [
        {"nombre_auto": "Mitsubishi Outlander 4x4", "categoria": "SUV 4x4", "proveedor": "Hertz", "precio_diario": 65000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 7},
        {"nombre_auto": "Honda CR-V AWD", "categoria": "SUV 4x4", "proveedor": "Avis", "precio_diario": 70000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Toyota Fortuner 4x4", "categoria": "SUV 4x4", "proveedor": "Budget", "precio_diario": 80000, "combustible": "Diesel", "transmision": "Automático", "plazas": 7},
    ],
    "pucon": [
        {"nombre_auto": "Kia Sportage 4x4", "categoria": "SUV 4x4", "proveedor": "Hertz", "precio_diario": 58000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Toyota Rav4 4x4", "categoria": "SUV 4x4", "proveedor": "Europcar", "precio_diario": 65000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Chevrolet Tracker", "categoria": "SUV Compacto", "proveedor": "Budget", "precio_diario": 45000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
    ],
    "isla-de-pascua": [
        {"nombre_auto": "Jeep Wrangler 4x4", "categoria": "SUV 4x4", "proveedor": "Local Rapa Nui", "precio_diario": 95000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 4},
        {"nombre_auto": "Toyota Land Cruiser 4x4", "categoria": "SUV Premium 4x4", "proveedor": "Local Rapa Nui", "precio_diario": 110000, "combustible": "Diesel", "transmision": "Automático", "plazas": 7},
        {"nombre_auto": "Scooter 125cc", "categoria": "Motocicleta", "proveedor": "Moto Rapa Nui", "precio_diario": 25000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 1},
    ],
    "vina-del-mar": [
        {"nombre_auto": "Toyota Yaris", "categoria": "Hatchback Compacto", "proveedor": "Hertz", "precio_diario": 28000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Hyundai Tucson", "categoria": "SUV Compacto", "proveedor": "Budget", "precio_diario": 48000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Chevrolet Spark", "categoria": "City Car", "proveedor": "Europcar", "precio_diario": 22000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 4},
    ],
    "elqui": [
        {"nombre_auto": "Suzuki Jimny 4x4", "categoria": "SUV 4x4", "proveedor": "Local La Serena", "precio_diario": 55000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 4},
        {"nombre_auto": "Hyundai Tucson 4x4", "categoria": "SUV 4x4", "proveedor": "Hertz", "precio_diario": 60000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Toyota Yaris", "categoria": "Hatchback Compacto", "proveedor": "Budget", "precio_diario": 30000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 5},
    ],
    "cajon-del-maipo": [
        {"nombre_auto": "Toyota Hilux 4x4", "categoria": "4x4 Doble Cabina", "proveedor": "Hertz Santiago", "precio_diario": 80000, "combustible": "Diesel", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Ford Ranger 4x4", "categoria": "Pickup 4x4", "proveedor": "Budget Santiago", "precio_diario": 85000, "combustible": "Diesel", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Mitsubishi Outlander 4x4", "categoria": "SUV 4x4", "proveedor": "Avis Santiago", "precio_diario": 70000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 7},
        {"nombre_auto": "Chevrolet Captiva", "categoria": "SUV Compacto", "proveedor": "Europcar Santiago", "precio_diario": 50000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 5},
    ],
    "puerto-natales": [
        {"nombre_auto": "Toyota Hilux 4x4", "categoria": "4x4 Doble Cabina", "proveedor": "Hertz Patagonia", "precio_diario": 100000, "combustible": "Diesel", "transmision": "Manual", "plazas": 5},
        {"nombre_auto": "Ford F-150 Raptor 4x4", "categoria": "Pickup 4x4", "proveedor": "Local Natales", "precio_diario": 120000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        {"nombre_auto": "Jeep Grand Cherokee 4x4", "categoria": "SUV Premium 4x4", "proveedor": "Sixt", "precio_diario": 115000, "combustible": "Diesel", "transmision": "Automático", "plazas": 5},
    ],
}

# Coordenadas de puntos de retiro por slug
PICKUP_COORDS: Dict[str, Dict[str, float]] = {
    "san-pedro-de-atacama": {"lat": -22.9087, "lng": -68.1997},
    "torres-del-paine":     {"lat": -51.7289, "lng": -72.4977},
    "valdivia":             {"lat": -39.8142, "lng": -73.2459},
    "chiloe":               {"lat": -42.4822, "lng": -73.7645},
    "pucon":                {"lat": -39.2721, "lng": -71.9771},
    "isla-de-pascua":       {"lat": -27.1127, "lng": -109.3497},
    "vina-del-mar":         {"lat": -33.0153, "lng": -71.55},
    "elqui":                {"lat": -29.9027, "lng": -71.2519},
    "cajon-del-maipo":      {"lat": -33.4489, "lng": -70.6693},
    "puerto-natales":       {"lat": -51.7289, "lng": -72.4977},
}


def extraer_autos_rentalcars(
    destino_slug: str,
    fecha_retiro: str,
    fecha_devolucion: str
) -> List[Dict[str, Any]]:
    """
    Extrae disponibilidad de autos de Rentalcars.com usando Scrapling Stealth.
    Si falla, retorna datos del catálogo referencial.
    """
    loc = RENTALCARS_LOCATION_MAP.get(destino_slug)
    coords = PICKUP_COORDS.get(destino_slug, {"lat": -33.45, "lng": -70.66})

    try:
        from scrapling import Fetcher

        if not loc:
            raise ValueError(f"Destino {destino_slug} no tiene mapping en Rentalcars")

        # Construir URL de búsqueda de Rentalcars
        ciudad_encoded = loc["ciudad"].replace(" ", "+")
        dt_pickup = datetime.strptime(fecha_retiro, "%Y-%m-%d")
        dt_dropoff = datetime.strptime(fecha_devolucion, "%Y-%m-%d")
        url = (
            f"https://www.rentalcars.com/search-results"
            f"?locationName={ciudad_encoded}&ftsLocationName={ciudad_encoded}"
            f"&puYear={dt_pickup.year}&puMonth={dt_pickup.month}&puDay={dt_pickup.day}&puHour=10&puMinute=0"
            f"&doYear={dt_dropoff.year}&doMonth={dt_dropoff.month}&doDay={dt_dropoff.day}&doHour=10&doMinute=0"
            f"&preflang=es"
        )
        logger.info(f"🛻 Scraping Rentalcars para '{destino_slug}': {url[:70]}...")

        fetcher = Fetcher(auto_match=True)
        page = fetcher.get(url, stealthy_headers=True)

        resultados = []
        # Selectores para Rentalcars 2026
        tarjetas = page.css('[data-testid="car-result"], .car-result, .searchResult')[:5]

        for tarjeta in tarjetas:
            try:
                nombre_el = tarjeta.css_first('[data-testid="car-name"], .carName, h3')
                precio_el = tarjeta.css_first('[data-testid="price"], .priceAmount')
                proveedor_el = tarjeta.css_first('[data-testid="supplier-name"], .supplierName')

                if not nombre_el or not precio_el:
                    continue

                nombre = nombre_el.text.strip()
                precio_raw = precio_el.text.strip()
                precio_diario = int(''.join(c for c in precio_raw if c.isdigit()) or '0')

                proveedor = proveedor_el.text.strip() if proveedor_el else "Rentalcars"

                # Determinar categoría y si es offroad
                nombre_lower = nombre.lower()
                if any(k in nombre_lower for k in ["hilux", "ranger", "4x4", "l200", "raptor", "amarok"]):
                    categoria = "4x4 Doble Cabina"
                elif any(k in nombre_lower for k in ["land cruiser", "defender", "wrangler"]):
                    categoria = "SUV Premium 4x4"
                elif any(k in nombre_lower for k in ["rav4", "tucson", "jimny", "vitara", "outback"]):
                    categoria = "SUV 4x4"
                elif any(k in nombre_lower for k in ["yaris", "accent", "spark", "fit"]):
                    categoria = "Hatchback Compacto"
                else:
                    categoria = "Sedán Compacto"

                # Calcular noches
                d1 = datetime.strptime(fecha_retiro, "%Y-%m-%d")
                d2 = datetime.strptime(fecha_devolucion, "%Y-%m-%d")
                noches = max((d2 - d1).days, 1)

                resultados.append({
                    "nombre_auto": nombre,
                    "categoria": categoria,
                    "proveedor": proveedor,
                    "precio_diario": precio_diario,
                    "precio_total": precio_diario * noches,
                    "noches": noches,
                    "combustible": "Diesel" if "diesel" in nombre_lower else "Gasolina",
                    "transmision": "Automático" if "auto" in nombre_lower else "Manual",
                    "plazas": 5,
                    "es_offroad": categoria in CATEGORIAS_OFFROAD,
                    "punto_retiro": loc["ciudad"],
                    "punto_retiro_lat": coords["lat"] + random.uniform(-0.005, 0.005),
                    "punto_retiro_lng": coords["lng"] + random.uniform(-0.005, 0.005),
                    "url_reserva": url,
                    "fuente": "rentalcars_live",
                })

            except Exception as e:
                logger.debug(f"Error parseando tarjeta auto: {e}")
                continue

        if resultados:
            logger.info(f"✅ Rentalcars: {len(resultados)} autos encontrados para '{destino_slug}'")
            return resultados

    except ImportError:
        logger.warning("⚠️ Scrapling no disponible. Usando catálogo referencial de autos.")
    except Exception as e:
        logger.warning(f"⚠️ Error scraping Rentalcars ({e}). Usando catálogo referencial.")

    # Fallback al catálogo referencial
    fallback = AUTOS_FALLBACK.get(destino_slug, [])
    if not fallback:
        # Default genérico
        fallback = [
            {"nombre_auto": "Toyota Yaris", "categoria": "Hatchback Compacto", "proveedor": "Hertz", "precio_diario": 35000, "combustible": "Gasolina", "transmision": "Manual", "plazas": 5},
            {"nombre_auto": "Hyundai Tucson 4x4", "categoria": "SUV 4x4", "proveedor": "Budget", "precio_diario": 60000, "combustible": "Gasolina", "transmision": "Automático", "plazas": 5},
        ]

    d1 = datetime.strptime(fecha_retiro, "%Y-%m-%d")
    d2 = datetime.strptime(fecha_devolucion, "%Y-%m-%d")
    noches = max((d2 - d1).days, 1)

    result = []
    loc_fallback = RENTALCARS_LOCATION_MAP.get(destino_slug, {"ciudad": destino_slug.replace("-", " ").title()})

    for a in fallback:
        # Añadir variación de precio (±10%) para datos más realistas
        variacion = random.uniform(0.92, 1.12)
        precio_diario = int(a["precio_diario"] * variacion)

        result.append({
            **a,
            "precio_diario": precio_diario,
            "precio_total": precio_diario * noches,
            "noches": noches,
            "es_offroad": a["categoria"] in CATEGORIAS_OFFROAD,
            "punto_retiro": loc_fallback["ciudad"],
            "punto_retiro_lat": coords["lat"] + random.uniform(-0.005, 0.005),
            "punto_retiro_lng": coords["lng"] + random.uniform(-0.005, 0.005),
            "url_reserva": (
                f"https://www.rentalcars.com/search-results"
                f"?locationName={loc_fallback['ciudad'].replace(' ', '+')}&ftsLocationName={loc_fallback['ciudad'].replace(' ', '+')}"
                f"&puYear={d1.year}&puMonth={d1.month}&puDay={d1.day}&puHour=10&puMinute=0"
                f"&doYear={d2.year}&doMonth={d2.month}&doDay={d2.day}&doHour=10&doMinute=0"
                f"&preflang=es"
            ),
            "fuente": "referencial_catalogo",
        })

    logger.info(f"📋 Usando catálogo referencial: {len(result)} autos para '{destino_slug}'")
    return result


async def buscar_autos_async(
    destino_slug: str,
    fecha_retiro: str,
    fecha_devolucion: str
) -> List[Dict[str, Any]]:
    """Wrapper asíncrono para que FastAPI orqueste sin bloquearse."""
    return await asyncio.to_thread(extraer_autos_rentalcars, destino_slug, fecha_retiro, fecha_devolucion)
