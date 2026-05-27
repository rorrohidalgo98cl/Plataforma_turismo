"""
Motor de Planificación y Mapeo de Rutas (Route Planner & Ticket Mapper)
======================================================================
Arquitectura limpia en 3 etapas para resolver itinerarios hacia cualquier destino:
1. RoutePlanner: Construye la estructura de tramos (Legs) geográficos según el destino.
2. TicketMapper: Obtiene de forma concurrente los pasajes/servicios para cada tramo desde los proveedores.
3. ItineraryAssembler: Genera las combinaciones posibles de extremo a extremo (Itinerarios).
"""

import asyncio
import logging
import random
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ─── 1. Definición de Estructuras de Datos de Planificación ───────────────────

class RouteLeg(BaseModel):
    id_tramo: int
    origen: str
    origen_codigo: str  # IATA o Slug
    destino: str
    destino_codigo: str
    medio_transporte: str  # "avion", "bus", "transfer", "ferry"
    es_ultima_milla: bool = False

class RoutePlan(BaseModel):
    origen_inicial: str
    destino_final: str
    destino_slug: str
    tramos: List[RouteLeg]
    es_escala_necesaria: bool

# Diccionario de definición de rutas para destinos sin aeropuerto directo o pequeños
GEOGRAPHIC_RULES = {
    'san-pedro-de-atacama': {
        'nombre': 'San Pedro de Atacama',
        'hub': {'nombre': 'Calama', 'codigo': 'CJC'},
        'last_mile': {'medio': 'Transfer', 'duracion': 90, 'precio_ref': 15000, 'operador': 'TransVIP Atacama'}
    },
    'torres-del-paine': {
        'nombre': 'Torres del Paine',
        'hub': {'nombre': 'Puerto Natales', 'codigo': 'PNT'},
        'last_mile': {'medio': 'Bus', 'duracion': 120, 'precio_ref': 12000, 'operador': 'Buses Fernández / Bus Sur'}
    },
    'elqui': {
        'nombre': 'Valle del Elqui',
        'hub': {'nombre': 'La Serena', 'codigo': 'LSC'},
        'last_mile': {'medio': 'Bus', 'duracion': 60, 'precio_ref': 5000, 'operador': 'Buses Vía Elqui'}
    },
    'pucon': {
        'nombre': 'Pucón',
        'hub': {'nombre': 'Temuco', 'codigo': 'ZCO'},
        'last_mile': {'medio': 'Bus', 'duracion': 80, 'precio_ref': 8000, 'operador': 'Buses JAC'}
    },
    'cajon-del-maipo': {
        'nombre': 'Cajón del Maipo',
        'hub': {'nombre': 'Santiago', 'codigo': 'SCL'},
        'last_mile': {'medio': 'Transfer', 'duracion': 60, 'precio_ref': 5000, 'operador': 'Turismoto / Local'}
    },
    'chiloe': {
        'nombre': 'Chiloé (Castro)',
        'hub': {'nombre': 'Puerto Montt', 'codigo': 'PMC'},
        'last_mile': {'medio': 'Bus & Ferry', 'duracion': 180, 'precio_ref': 11000, 'operador': 'Buses Cruz del Sur'}
    }
}

# ─── 2. Catálogo de Reglas Geográficas (RoutePlanner) ─────────────────────────

class RoutePlanner:
    """Etapa 1: Construye el plan de ruta basado en la geografía del destino."""
    
    @staticmethod
    def build_plan(origen_nombre: str, origen_codigo: str, destino_slug: str, destino_nombre: str, modo_transporte: str) -> RoutePlan:
        tramos = []
        
        # Verificar si el destino requiere escala obligatoria / última milla
        if destino_slug in GEOGRAPHIC_RULES and modo_transporte == "avion":
            rule = GEOGRAPHIC_RULES[destino_slug]
            hub = rule['hub']
            lm = rule['last_mile']
            
            # Tramo 1: Vuelo al Hub Principal
            tramos.append(RouteLeg(
                id_tramo=1,
                origen=origen_nombre,
                origen_codigo=origen_codigo,
                destino=hub['nombre'],
                destino_codigo=hub['codigo'],
                medio_transporte="avion"
            ))
            
            # Tramo 2: Conexión Terrestre / Transfer al pueblo
            tramos.append(RouteLeg(
                id_tramo=2,
                origen=hub['nombre'],
                origen_codigo=hub['codigo'],
                destino=rule['nombre'],
                destino_codigo=destino_slug,
                medio_transporte=lm['medio'],
                es_ultima_milla=True
            ))
            
            return RoutePlan(
                origen_inicial=origen_nombre,
                destino_final=rule['nombre'],
                destino_slug=destino_slug,
                tramos=tramos,
                es_escala_necesaria=True
            )
        else:
            # Ruta Directa (ej. Vuelo directo o Bus directo)
            tramos.append(RouteLeg(
                id_tramo=1,
                origen=origen_nombre,
                origen_codigo=origen_codigo,
                destino=destino_nombre,
                destino_codigo=destino_slug,
                medio_transporte=modo_transporte
            ))
            
            return RoutePlan(
                origen_inicial=origen_nombre,
                destino_final=destino_nombre,
                destino_slug=destino_slug,
                tramos=tramos,
                es_escala_necesaria=False
            )

# ─── 3. Mapeo de Pasajes (TicketMapper) ───────────────────────────────────────

class TicketMapper:
    """Etapa 2: Obtiene pasajes de manera concurrente para cada tramo del RoutePlan."""
    
    def __init__(self, fetcher_vuelos_fn, fetcher_buses_fn):
        self.fetcher_vuelos = fetcher_vuelos_fn
        self.fetcher_buses = fetcher_buses_fn

    async def map_plan(self, plan: RoutePlan, fecha_ida: str, fecha_vuelta: str, pax: int) -> Dict[int, List[Any]]:
        from server import VueloOption, Segmento  # Importación local para evitar dependencias circulares
        
        tasks = {}
        for leg in plan.tramos:
            if leg.medio_transporte == "avion":
                tasks[leg.id_tramo] = self.fetcher_vuelos(leg.origen_codigo, leg.destino_codigo, fecha_ida, fecha_vuelta, pax)
            elif leg.es_ultima_milla:
                rule = GEOGRAPHIC_RULES.get(plan.destino_slug, {})
                lm = rule.get('last_mile', {'operador': 'Transfer Local', 'precio_ref': 15000, 'duracion': 90, 'medio': 'Transfer'})
                
                # Adaptador de última milla (devuelve un objeto VueloOption que representa el tramo terrestre)
                lm_option = VueloOption(
                    id=f"lm_{plan.destino_slug}",
                    aerolinea=lm['operador'],
                    precio=float(lm['precio_ref']),
                    moneda="CLP",
                    origen=leg.origen,
                    destino_iata=plan.destino_slug.upper()[:3],
                    fecha_salida=fecha_ida,
                    hora_salida="Conexión coordinada",
                    hora_llegada="--:--",
                    duracion_min=lm['duracion'],
                    escalas=0,
                    fuente="transfer_local_adapter",
                    deep_link="#",
                    segmentos=[Segmento(origen=leg.origen, destino=leg.destino, medio=lm['medio'], duracion_min=lm['duracion'], operador=lm['operador'])],
                    es_ruta_mixta=False
                )
                tasks[leg.id_tramo] = self._async_wrap([lm_option])
            else:
                # Bus regular
                tasks[leg.id_tramo] = self.fetcher_buses(leg.destino_codigo, fecha_ida, fecha_vuelta, pax, leg.origen)
                
        # Ejecutar todas las búsquedas de tramos en paralelo
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        
        mapped_tickets = {}
        for id_tramo, res in zip(tasks.keys(), results):
            if isinstance(res, Exception):
                logger.error(f"Error obteniendo tickets para tramo {id_tramo}: {res}")
                mapped_tickets[id_tramo] = []
            else:
                mapped_tickets[id_tramo] = res
                
        return mapped_tickets

    async def _async_wrap(self, data):
        return data

# ─── 4. Ensamblaje de Itinerarios (ItineraryAssembler) ────────────────────────

class ItineraryAssembler:
    """Etapa 3: Combina los pasajes de los tramos en itinerarios completos (VueloOption consolidados)."""
    
    @staticmethod
    def assemble(plan: RoutePlan, mapped_tickets: Dict[int, List[Any]]) -> List[Any]:
        from server import VueloOption, Segmento
        
        itinerarios = []
        
        # Si es ruta directa (1 solo tramo)
        if not plan.es_escala_necesaria or len(plan.tramos) == 1:
            return mapped_tickets.get(1, [])

        # Si es ruta con escala/conexión (Tramo 1 + Tramo 2)
        tickets_tramo_1 = mapped_tickets.get(1, [])
        tickets_tramo_2 = mapped_tickets.get(2, [])
        
        if not tickets_tramo_1:
            return []

        # Por cada opción de vuelo principal, le asociamos la opción de conexión de última milla
        for i, t1 in enumerate(tickets_tramo_1):
            t2 = tickets_tramo_2[0] if tickets_tramo_2 else None
            
            if not t2:
                continue
                
            # Crear una nueva lista de segmentos combinados
            # Asegurarse de que el tramo 1 tenga su propio segmento si no lo tenía
            segs = list(t1.segmentos)
            if not segs:
                segs.append(Segmento(
                    origen=t1.origen,
                    destino=t2.origen,
                    medio="Vuelo",
                    duracion_min=t1.duracion_min,
                    operador=t1.aerolinea
                ))
            
            # Añadir los segmentos del tramo 2
            segs.extend(t2.segmentos)
            
            # Ensamblar la opción combinada
            aerolinea_combinada = f"{t1.aerolinea} + {t2.aerolinea}" if " + " not in t1.aerolinea else t1.aerolinea
            
            itinerarios.append(VueloOption(
                id=f"itin_{t1.id}_{t2.id}",
                aerolinea=aerolinea_combinada,
                precio=t1.precio + t2.precio,
                moneda=t1.moneda,
                origen=t1.origen,
                destino_iata=t1.destino_iata,
                fecha_salida=t1.fecha_salida,
                hora_salida=t1.hora_salida,
                hora_llegada=t1.hora_llegada,
                duracion_min=t1.duracion_min + t2.duracion_min,
                escalas=t1.escalas + 1,
                fuente=t1.fuente,
                deep_link=t1.deep_link,
                segmentos=segs,
                es_ruta_mixta=True
            ))

        return itinerarios
