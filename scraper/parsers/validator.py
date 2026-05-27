"""
Módulo de Validación del Scraper — Plataforma Turismo MVP
==========================================================
Valida los datos crudos extraídos antes de insertarlos en PostgreSQL.
Detecta precios inválidos, datos faltantes, y resultados sospechosos.
"""

import logging
from datetime import datetime, date
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Rangos de precios válidos por ruta (en CLP) ─────────────────────────────
# Fuente: estimados históricos de vuelos domésticos Chile 2024-2026
PRECIO_VUELO_RANGOS = {
    'CJC': (40_000,  250_000),   # SCL → Calama (Atacama)
    'PUQ': (50_000,  300_000),   # SCL → Punta Arenas (Patagonia)
    'ZAL': (30_000,  150_000),   # SCL → Valdivia
    'PMC': (35_000,  180_000),   # SCL → Puerto Montt (Chiloé)
    'ZCO': (30_000,  160_000),   # SCL → Temuco (Pucón)
    'IPC': (150_000, 900_000),   # SCL → Isla de Pascua (el más caro)
    'LSC': (25_000,  120_000),   # SCL → La Serena (Elqui)
    'PNT': (50_000,  280_000),   # SCL → Puerto Natales
    'SCL': (10_000,  80_000),    # Destinos cercanos (Cajón del Maipo, Viña)
}

PRECIO_HOTEL_RANGO_GENERAL = (20_000, 500_000)  # CLP por noche

# ─── Validación de Vuelos ─────────────────────────────────────────────────────

class VueloInvalidoError(Exception):
    pass

def validar_vuelo(vuelo: dict, destino_iata: str = '') -> tuple[bool, list[str]]:
    """
    Valida un vuelo scrapeado. Retorna (es_valido, lista_de_errores).
    """
    errores = []

    # 1. Campos requeridos
    for campo in ['precio', 'aerolinea', 'disponible']:
        if campo not in vuelo or vuelo[campo] is None:
            errores.append(f"Campo requerido faltante: '{campo}'")

    if errores:
        return False, errores

    # 2. Precio dentro de rango válido
    precio = vuelo.get('precio', 0)
    if not isinstance(precio, (int, float)) or precio <= 0:
        errores.append(f"Precio inválido: {precio}")
    else:
        rango = PRECIO_VUELO_RANGOS.get(destino_iata, (10_000, 1_000_000))
        if precio < rango[0]:
            errores.append(f"Precio sospechosamente bajo: ${precio:,.0f} CLP (mínimo esperado: ${rango[0]:,.0f})")
        elif precio > rango[1]:
            errores.append(f"Precio sospechosamente alto: ${precio:,.0f} CLP (máximo esperado: ${rango[1]:,.0f})")

    # 3. Aerolínea conocida
    aerolineas_validas = {'LATAM', 'SKY', 'JetSMART', 'Aerolíneas Argentinas'}
    aerolinea = vuelo.get('aerolinea', '').upper()
    if not any(a.upper() in aerolinea for a in aerolineas_validas):
        errores.append(f"Aerolínea desconocida: '{vuelo.get('aerolinea')}'")

    # 4. Fecha de salida válida (no en el pasado)
    salida_str = vuelo.get('salida', '')
    if salida_str:
        try:
            salida = datetime.fromisoformat(salida_str.replace('Z', ''))
            if salida.date() < date.today():
                errores.append(f"Fecha de salida en el pasado: {salida_str}")
        except ValueError:
            errores.append(f"Formato de fecha inválido: '{salida_str}'")

    # 5. Escalas no negativas
    escalas = vuelo.get('escalas', 0)
    if not isinstance(escalas, int) or escalas < 0:
        errores.append(f"Número de escalas inválido: {escalas}")

    # 6. Fuente de datos conocida
    fuentes_validas = {'latam_xhr', 'latam_dom', 'sky_xhr', 'sky_dom', 'jetsmart_xhr'}
    if vuelo.get('fuente') not in fuentes_validas:
        logger.warning(f"⚠️ Fuente de datos no estándar: '{vuelo.get('fuente')}'")

    es_valido = len(errores) == 0
    return es_valido, errores


def validar_vuelos_batch(
    vuelos: list[dict],
    destino_iata: str = '',
    min_requeridos: int = 1,
) -> tuple[list[dict], dict]:
    """
    Valida una lista de vuelos scrapeados.
    Retorna (vuelos_validos, reporte_validacion).
    """
    validos = []
    invalidos = []

    for i, vuelo in enumerate(vuelos):
        ok, errores = validar_vuelo(vuelo, destino_iata)
        if ok:
            validos.append(vuelo)
        else:
            invalidos.append({'vuelo': vuelo, 'errores': errores})
            logger.warning(f"⛔ Vuelo #{i} descartado: {errores}")

    reporte = {
        'total_scrapeados': len(vuelos),
        'validos': len(validos),
        'invalidos': len(invalidos),
        'tasa_exito': round(len(validos) / max(len(vuelos), 1) * 100, 1),
        'suficientes': len(validos) >= min_requeridos,
        'errores_detalle': invalidos,
    }

    if reporte['tasa_exito'] < 50:
        logger.error(
            f"🚨 Alta tasa de fallos en scraping {destino_iata}: "
            f"solo {reporte['tasa_exito']}% válidos. "
            f"Posible bloqueo o cambio en la estructura del sitio."
        )
    elif reporte['tasa_exito'] < 80:
        logger.warning(f"⚠️ Tasa de éxito baja {destino_iata}: {reporte['tasa_exito']}%")
    else:
        logger.info(f"✅ Validación OK {destino_iata}: {reporte['tasa_exito']}% válidos ({len(validos)}/{len(vuelos)})")

    return validos, reporte


# ─── Validación de Hoteles ────────────────────────────────────────────────────

def validar_hotel(hotel: dict) -> tuple[bool, list[str]]:
    """Valida un hotel scrapeado."""
    errores = []

    for campo in ['nombre', 'precio', 'disponible']:
        if campo not in hotel or hotel[campo] is None:
            errores.append(f"Campo requerido faltante: '{campo}'")

    if errores:
        return False, errores

    precio = hotel.get('precio', 0)
    if not isinstance(precio, (int, float)) or precio <= 0:
        errores.append(f"Precio inválido: {precio}")
    else:
        mn, mx = PRECIO_HOTEL_RANGO_GENERAL
        if precio < mn:
            errores.append(f"Precio hotel muy bajo: ${precio:,.0f} CLP")
        elif precio > mx:
            errores.append(f"Precio hotel muy alto: ${precio:,.0f} CLP")

    nombre = hotel.get('nombre', '')
    if len(nombre) < 3:
        errores.append(f"Nombre de hotel muy corto: '{nombre}'")

    score = hotel.get('score_calidad', -1)
    if score is not None and not (0 <= score <= 10):
        errores.append(f"Score fuera de rango [0-10]: {score}")

    return len(errores) == 0, errores


def validar_hoteles_batch(hoteles: list[dict]) -> tuple[list[dict], dict]:
    """Valida lista de hoteles. Retorna (válidos, reporte)."""
    validos, invalidos = [], []
    for i, hotel in enumerate(hoteles):
        ok, errores = validar_hotel(hotel)
        if ok:
            validos.append(hotel)
        else:
            invalidos.append({'hotel': hotel, 'errores': errores})
            logger.warning(f"⛔ Hotel #{i} descartado: {errores}")

    reporte = {
        'total': len(hoteles),
        'validos': len(validos),
        'invalidos': len(invalidos),
        'tasa_exito': round(len(validos) / max(len(hoteles), 1) * 100, 1),
    }
    logger.info(f"🏨 Validación hoteles: {reporte['tasa_exito']}% válidos")
    return validos, reporte


# ─── Validación del Paquete Final ─────────────────────────────────────────────

def validar_paquete(paquete: Optional[dict]) -> tuple[bool, list[str]]:
    """
    Valida el paquete final antes de enviarlo al frontend.
    Es la última línea de defensa antes de mostrar datos al usuario.
    """
    if paquete is None:
        return False, ["Paquete es None — scraping sin resultados"]

    errores = []
    required = ['vuelo', 'hotel', 'precio_total', 'ahorro_estimado']
    for campo in required:
        if campo not in paquete:
            errores.append(f"Campo requerido faltante en paquete: '{campo}'")

    if errores:
        return False, errores

    # El precio total debe ser mayor que cada componente
    total = paquete.get('precio_total', 0)
    precio_vuelo = paquete.get('vuelo', {}).get('precio', 0)
    precio_hotel = paquete.get('hotel', {}).get('precio', 0)

    if total < precio_vuelo:
        errores.append(f"Total ({total}) menor que precio vuelo ({precio_vuelo})")
    if total < precio_hotel:
        errores.append(f"Total ({total}) menor que precio hotel ({precio_hotel})")
    if total <= 0:
        errores.append(f"Precio total inválido: {total}")

    es_valido = len(errores) == 0
    if es_valido:
        logger.info(f"✅ Paquete válido: ${total:,.0f} CLP")
    else:
        logger.error(f"❌ Paquete inválido: {errores}")

    return es_valido, errores
