"""
cross_sell.py — Motor de Cross-Selling Inteligente
====================================================
Implementa dos reglas de negocio algorítmicas:
1. Logística Inversa: Si un tour incluye traslado → sugerir omitir auto ese día
2. Afinidad de Terreno: Si el auto es 4x4 → priorizar tours off-road/aventura
"""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Palabras clave para detectar tours de aventura/off-road
ADVENTURE_KEYWORDS = [
    "trekking", "4x4", "sandboard", "rafting", "kayak", "canopy",
    "volcán", "ascenso", "glaciar", "rappel", "cabalgata",
    "off-road", "todo terreno", "todoterreno"
]


def aplicar_logistica_inversa(
    tours: List[Dict[str, Any]],
    autos: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Regla 1 — Logística Inversa:
    Si varios tours incluyen traslado, el usuario probablemente no necesita auto.
    Genera sugerencias contextuales para la UI.
    """
    sugerencias = []

    tours_con_traslado = [t for t in tours if t.get("incluye_traslado")]
    total_tours = len(tours)
    pct_con_traslado = len(tours_con_traslado) / total_tours if total_tours > 0 else 0

    if pct_con_traslado >= 0.6 and autos:
        # Más del 60% de los tours incluyen traslado
        ahorro_auto = min(a.get("precio_total", a.get("precio_diario", 0) * 3) for a in autos)
        sugerencias.append({
            "tipo": "logistica_inversa",
            "icono": "🚐",
            "titulo": "¿Realmente necesitas auto?",
            "mensaje": (
                f"{len(tours_con_traslado)} de {total_tours} tours incluyen traslado desde el hotel. "
                f"Si sólo harás tours organizados, podrías ahorrar hasta ${ahorro_auto:,.0f} CLP "
                f"al no arrendar vehículo."
            ),
            "ahorro_estimado": ahorro_auto,
            "tab_afectada": "autos",
            "accion": "omitir_auto",
        })

    elif pct_con_traslado > 0 and pct_con_traslado < 0.6 and autos:
        # Algunos tours tienen traslado, otros no — auto sigue siendo útil
        tours_sin_traslado = [t for t in tours if not t.get("incluye_traslado")]
        sugerencias.append({
            "tipo": "logistica_mixta",
            "icono": "💡",
            "titulo": "Combina tours con y sin traslado",
            "mensaje": (
                f"{len(tours_sin_traslado)} tours requieren movilización propia. "
                f"El auto te da flexibilidad para actividades independientes."
            ),
            "ahorro_estimado": 0,
            "tab_afectada": "tours",
            "accion": "info",
        })

    return sugerencias


def aplicar_afinidad_terreno(
    tours: List[Dict[str, Any]],
    auto_seleccionado: Optional[Dict[str, Any]] = None,
    autos: List[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Regla 2 — Afinidad de Terreno:
    Si el auto arrendado es 4x4 → priorizar tours de aventura/off-road.
    Si no hay auto pero hay tours de aventura → sugerir 4x4.
    """
    sugerencias = []

    # Detectar tours de aventura
    tours_aventura = []
    for t in tours:
        nombre_lower = t.get("tour", "").lower()
        if any(kw in nombre_lower for kw in ADVENTURE_KEYWORDS):
            tours_aventura.append(t)

    if not tours_aventura:
        return sugerencias

    # Caso A: El usuario ya tiene un 4x4 seleccionado
    if auto_seleccionado and auto_seleccionado.get("es_offroad"):
        sugerencias.append({
            "tipo": "afinidad_terreno_positiva",
            "icono": "🏔️",
            "titulo": f"Tu {auto_seleccionado.get('nombre_auto', '4x4')} es perfecto para estos tours",
            "mensaje": (
                f"Encontramos {len(tours_aventura)} tours de aventura que aprovechan "
                f"tu vehículo 4x4: {', '.join(t['tour'][:30] for t in tours_aventura[:3])}."
            ),
            "tours_sugeridos": [t["tour"] for t in tours_aventura],
            "ahorro_estimado": 0,
            "tab_afectada": "tours",
            "accion": "destacar_tours",
        })

    # Caso B: No hay auto seleccionado pero hay tours de aventura
    elif not auto_seleccionado and tours_aventura and autos:
        autos_4x4 = [a for a in autos if a.get("es_offroad")]
        if autos_4x4:
            auto_recomendado = min(autos_4x4, key=lambda a: a.get("precio_diario", 999999))
            sugerencias.append({
                "tipo": "afinidad_terreno_sugerencia",
                "icono": "🛻",
                "titulo": f"¿Pensaste en un {auto_recomendado.get('nombre_auto', '4x4')}?",
                "mensaje": (
                    f"Para {len(tours_aventura)} tours de aventura, un 4x4 sería ideal. "
                    f"Desde ${auto_recomendado.get('precio_diario', 0):,.0f}/día con {auto_recomendado.get('proveedor', 'proveedor local')}."
                ),
                "auto_sugerido": auto_recomendado.get("nombre_auto"),
                "ahorro_estimado": 0,
                "tab_afectada": "autos",
                "accion": "sugerir_4x4",
            })

    return sugerencias


def generar_sugerencias_cross_sell(
    tours: List[Dict[str, Any]],
    autos: List[Dict[str, Any]],
    auto_seleccionado: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Orquestador principal: Ejecuta todas las reglas de cross-selling
    y retorna una lista unificada de sugerencias.
    """
    sugerencias = []

    if tours and autos:
        sugerencias.extend(aplicar_logistica_inversa(tours, autos))
        sugerencias.extend(aplicar_afinidad_terreno(tours, auto_seleccionado, autos))

    logger.info(f"🧠 Cross-Selling Engine: {len(sugerencias)} sugerencias generadas")
    return sugerencias
