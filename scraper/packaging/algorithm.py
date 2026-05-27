"""
Algoritmo de Empaquetado MVP — armar_paquete_mvp()
===================================================
Lógica Python para consolidar datos scrapeados de vuelos y hoteles
en un paquete turístico dinámico optimizado.
"""

from typing import Optional
import logging

logger = logging.getLogger(__name__)


def armar_paquete_mvp(
    vuelos_scraped: list[dict],
    hoteles_scraped: list[dict],
    destino_slug: str = '',
) -> Optional[dict]:
    """
    Consolida vuelos y hoteles scrapeados en el mejor paquete posible.

    Criterios de selección (del documento V3):
    - Vuelo: precio mínimo disponible
    - Hotel: mayor score de calidad entre los disponibles
    - Ahorro estimado: 15% del precio total (margen dinámico simulado)

    Args:
        vuelos_scraped: Lista de vuelos normalizados del scraper
        hoteles_scraped: Lista de hoteles normalizados del scraper
        destino_slug: Slug del destino para logs

    Returns:
        Dict con el paquete armado, o None si no hay datos suficientes
    """
    if not vuelos_scraped:
        logger.warning(f"⚠️ [{destino_slug}] No hay vuelos disponibles para empaquetar")
        return None

    if not hoteles_scraped:
        logger.warning(f"⚠️ [{destino_slug}] No hay hoteles disponibles para empaquetar")
        return None

    # Seleccionar vuelo más barato disponible
    vuelos_disponibles = [v for v in vuelos_scraped if v.get('disponible', True)]
    if not vuelos_disponibles:
        logger.warning(f"⚠️ [{destino_slug}] Todos los vuelos están no disponibles")
        return None

    vuelo_optimo = min(vuelos_disponibles, key=lambda x: x['precio'])

    # Filtrar hoteles con disponibilidad y seleccionar el de mayor score
    hoteles_disponibles = [h for h in hoteles_scraped if h.get('disponible', False)]
    if not hoteles_disponibles:
        logger.warning(f"⚠️ [{destino_slug}] No hay hoteles disponibles")
        return None

    hotel_optimo = max(hoteles_disponibles, key=lambda x: x.get('score_calidad', 0))

    # Calcular precio total
    precio_vuelo = vuelo_optimo['precio']
    precio_hotel = hotel_optimo['precio']
    precio_total = precio_vuelo + precio_hotel

    # Margen dinámico simulado del 15% (V3 spec)
    ahorro_estimado = round(precio_total * 0.15)

    paquete = {
        "destino": destino_slug,
        "vuelo": {
            "aerolinea": vuelo_optimo.get('aerolinea', ''),
            "precio": precio_vuelo,
            "salida": vuelo_optimo.get('salida', ''),
            "llegada": vuelo_optimo.get('llegada', ''),
            "duracion_min": vuelo_optimo.get('duracion_min', 0),
            "escalas": vuelo_optimo.get('escalas', 0),
            "fuente": vuelo_optimo.get('fuente', ''),
        },
        "hotel": {
            "nombre": hotel_optimo.get('nombre', ''),
            "precio": precio_hotel,
            "score_calidad": hotel_optimo.get('score_calidad', 0),
            "estrellas": hotel_optimo.get('estrellas', 0),
            "imagen": hotel_optimo.get('imagen', ''),
            "fuente": hotel_optimo.get('fuente', ''),
        },
        "precio_total": precio_total,
        "ahorro_estimado": ahorro_estimado,
        "precio_sin_descuento": round(precio_total * 1.15),  # precio "tachado"
        "calidad_score": _calcular_calidad_paquete(vuelo_optimo, hotel_optimo),
        "scraped_at": vuelo_optimo.get('scraped_at', ''),
    }

    logger.info(
        f"✅ [{destino_slug}] Paquete armado: "
        f"${precio_total:,.0f} CLP "
        f"(vuelo: ${precio_vuelo:,.0f} + hotel: ${precio_hotel:,.0f}) "
        f"| Ahorro estimado: ${ahorro_estimado:,.0f}"
    )

    return paquete


def _calcular_calidad_paquete(vuelo: dict, hotel: dict) -> float:
    """
    Score de calidad del paquete (0-10) para ordenar resultados.
    Combina score del hotel, número de escalas y precio.
    """
    score_hotel = hotel.get('score_calidad', 5) / 10  # normalizar a 0-1
    penalizacion_escalas = vuelo.get('escalas', 0) * 0.1
    score_final = (score_hotel * 0.7) - penalizacion_escalas
    return round(max(0, min(10, score_final * 10)), 1)


def comparar_paquetes(paquetes: list[dict]) -> list[dict]:
    """
    Ordena múltiples paquetes por mejor relación calidad/precio.
    Para el Split-View del frontend donde el usuario puede "swappear".
    """
    return sorted(
        [p for p in paquetes if p is not None],
        key=lambda x: (x.get('precio_total', 999999999), -x.get('calidad_score', 0))
    )
