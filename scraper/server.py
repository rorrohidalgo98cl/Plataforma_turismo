"""
Servidor Python — Plataforma Turismo OTA v2.0
==============================================
FastAPI server — OTA completa con 5 servicios paralelos:
Vuelos (Tequila API) + Hoteles (Booking Scrapling) + Buses (Recorrido) + Autos (Rentalcars) + Tours (Tur.com)
+ Motor de Cross-Selling inteligente.
"""

import asyncio
import hashlib
import logging
import os
import random
from datetime import date, datetime
from typing import List, Optional

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scrapling import StealthyFetcher
from sqlalchemy.future import select
from db import get_db
from models import Destino

# Cargar variables de entorno (.env)
load_dotenv()
TEQUILA_API_KEY = os.getenv("TEQUILA_API_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# ─── Configuración ────────────────────────────────────────────────────────────

app = FastAPI(title="Turismo OTA API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Modelos de respuesta ─────────────────────────────────────────────────────

@app.get("/api/destinos")
async def get_all_destinos(db = Depends(get_db)):
    """Devuelve la lista de todos los destinos activos desde la base de datos."""
    result = await db.execute(select(Destino))
    destinos_db = result.scalars().all()
    
    # Formateamos la respuesta para que coincida exactamente con la interfaz 'Destino' del frontend
    destinos = []
    for d in destinos_db:
        destinos.append({
            "id": d.id,
            "slug": d.slug,
            "nombre": d.nombre,
            "region": d.region,
            "lat": d.latitud,
            "lng": d.longitud,
            "codigoIATA": d.codigo_iata,
            # Campos por defecto para que no se rompa el frontend actual
            "tagline": "Aventura y Naturaleza",
            "descripcion": "Descubre este increíble destino.",
            "imagen": "https://images.unsplash.com/photo-1544183946-4e9fdf5f9b17?w=1200&q=80",
            "precioDesde": 200000,
            "destacado": False,
            "tags": ["Aventura"]
        })
    return {"destinos": destinos}
class Segmento(BaseModel):
    origen: str
    destino: str
    medio: str  # "Vuelo", "Bus", "Transfer"
    duracion_min: int
    operador: str

class VueloOption(BaseModel):
    id: str
    aerolinea: str
    precio: float
    moneda: str
    origen: str
    destino_iata: str
    fecha_salida: str
    hora_salida: str
    hora_llegada: str
    duracion_min: int
    escalas: int
    fuente: str
    deep_link: str
    segmentos: List[Segmento] = []
    es_ruta_mixta: bool = False

class HotelResponse(BaseModel):
    nombre: str
    precio: float
    moneda: str
    estrellas: float
    score_calidad: float
    url_reserva: str
    fuente: str

class PaqueteResponse(BaseModel):
    destino: str
    destino_slug: str
    fecha_ida: str
    fecha_vuelta: str
    pasajeros: int
    vuelos: List[VueloOption]  # Múltiples opciones de vuelos
    vuelo_seleccionado: VueloOption  # El mejor/más barato
    hotel: HotelResponse
    precio_total: float
    precio_sin_descuento: float
    ahorro_estimado: float
    calidad_score: float
    es_cache: bool
    scraped_at: str
    demo_mode: bool

class AutoOption(BaseModel):
    nombre_auto: str
    categoria: str
    proveedor: str
    precio_diario: int
    precio_total: int
    noches: int
    combustible: str
    transmision: str
    plazas: int
    es_offroad: bool
    punto_retiro: str
    punto_retiro_lat: float
    punto_retiro_lng: float
    url_reserva: str
    fuente: str

class TourOption(BaseModel):
    tour: str
    precio: int
    duracion_horas: int
    incluye_traslado: bool
    punto_encuentro: str
    punto_encuentro_lat: float
    punto_encuentro_lng: float
    url_reserva: str
    fuente: str

class BusOption(BaseModel):
    operador: str
    precio: int
    hora_salida: str
    hora_llegada: str
    duracion_min: int
    tipo: str
    deep_link: str
    fuente: str

class CrossSellSugerencia(BaseModel):
    tipo: str
    icono: str
    titulo: str
    mensaje: str
    ahorro_estimado: float
    tab_afectada: str
    accion: str

class CotizacionResponse(BaseModel):
    destino: str
    destino_slug: str
    fecha_ida: str
    fecha_vuelta: str
    pasajeros: int
    # Transporte aéreo
    vuelos: List[VueloOption]
    vuelo_seleccionado: Optional[VueloOption] = None
    # Hotel
    hotel: HotelResponse
    # Buses
    buses: List[BusOption]
    # Autos
    autos: List[AutoOption]
    # Tours
    tours: List[TourOption]
    # Cross-Selling
    sugerencias: List[CrossSellSugerencia]
    # Totales
    precio_total: float
    precio_sin_descuento: float
    ahorro_estimado: float
    calidad_score: float
    es_cache: bool
    scraped_at: str
    demo_mode: bool

# ─── Helpers ──────────────────────────────────────────────────────────────────
IATA_MAP = {
    'san-pedro-de-atacama': 'CJC',
    'torres-del-paine':     'PUQ',
    'valdivia':             'ZAL',
    'chiloe':               'PMC',
    'pucon':                'ZCO',
    'isla-de-pascua':       'IPC',
    'vina-del-mar':         'SCL',
    'elqui':                'LSC',
    'cajon-del-maipo':      'SCL',
    'puerto-natales':       'PNT',
}

# Rangos referenciales de precios por ruta (CLP) — usados SOLO cuando API falla
PRECIOS_VUELO_REF = {
    'CJC': (85_000,  180_000),
    'PUQ': (95_000,  250_000),
    'ZAL': (45_000,  120_000),
    'PMC': (55_000,  140_000),
    'ZCO': (40_000,  110_000),
    'IPC': (250_000, 650_000),
    'LSC': (35_000,   95_000),
    'PNT': (85_000,  220_000),
    'SCL': (15_000,   60_000),
}

# Mapa de Rutas de Última Milla (Hub -> Pueblo)
RUTAS_DESTINO = {
    'san-pedro-de-atacama': {
        'hub_iata': 'CJC',
        'hub_nombre': 'Calama',
        'last_mile': {'medio': 'Transfer', 'duracion_min': 90, 'precio_ref': 15000, 'operador': 'TransVIP / Local'}
    },
    'torres-del-paine': {
        'hub_iata': 'PNT',
        'hub_nombre': 'Puerto Natales',
        'last_mile': {'medio': 'Bus', 'duracion_min': 120, 'precio_ref': 12000, 'operador': 'Bus Sur / Local'}
    },
    'elqui': {
        'hub_iata': 'LSC',
        'hub_nombre': 'La Serena',
        'last_mile': {'medio': 'Bus', 'duracion_min': 60, 'precio_ref': 5000, 'operador': 'Buses Vía Elqui'}
    },
    'pucon': {
        'hub_iata': 'ZCO',
        'hub_nombre': 'Temuco',
        'last_mile': {'medio': 'Bus', 'duracion_min': 80, 'precio_ref': 8000, 'operador': 'JAC / Pullman'}
    },
    'cajon-del-maipo': {
        'hub_iata': 'SCL',
        'hub_nombre': 'Santiago',
        'last_mile': {'medio': 'Bus/Transfer', 'duracion_min': 60, 'precio_ref': 3000, 'operador': 'TurMaipo'}
    },
    'chiloe': {
        'hub_iata': 'PMC',
        'hub_nombre': 'Puerto Montt',
        'last_mile': {'medio': 'Bus + Ferry', 'duracion_min': 180, 'precio_ref': 10000, 'operador': 'Cruz del Sur'}
    }
}

# Nombres reales de hoteles por zona para mayor credibilidad
HOTELES_REALES = {
    'CJC': ['Hotel Cumbres San Pedro', 'Hotel Altiplanico', 'Hotel Kimal'],
    'PUQ': ['Hotel Dreams del Estrecho', 'Hotel Cabo de Hornos', 'Hotel José Nogueira'],
    'ZAL': ['Hotel Dreams Valdivia', 'Hotel Naguilán', 'Hotel Villa del Río'],
    'PMC': ['Hotel Enjoy Chiloé', 'Palafito 1326 Hotel Boutique', 'Hotel Parque Quilquico'],
    'ZCO': ['Hotel Enjoy Pucón', 'Hotel Antumalal', 'Hotel Huife'],
    'IPC': ['Hotel Hangaroa Eco Village', 'Hotel Taha Tai', 'Hotel Altiplanico Rapa Nui'],
    'LSC': ['Hotel Enjoy Coquimbo', 'Hotel Terral', 'Hotel Elqui Domos'],
    'PNT': ['Hotel Costaustralis', 'Hotel Remota', 'Hotel Weskar Lodge'],
    'SCL': ['Hotel W Santiago', 'Hotel Cumbres Lastarria', 'Hotel Luciano K'],
}

def make_cache_key(slug: str, fecha_ida: str, fecha_vuelta: str, pax: int) -> str:
    raw = f"{slug}|{fecha_ida}|{fecha_vuelta}|{pax}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]

# ─── Vuelos vía Tequila API (Kiwi.com) ────────────────────────────────────────
async def buscar_vuelos_tequila(origen_iata: str, iata: str, fecha_ida: str, fecha_vuelta: str, pax: int) -> List[VueloOption]:
    """Obtiene vuelos reales desde Tequila API."""
    if not TEQUILA_API_KEY or TEQUILA_API_KEY == "your_tequila_api_key_here":
        logger.warning("⚠️ TEQUILA_API_KEY no configurada. Usando datos referenciales.")
        return []

    url = "https://tequila-api.kiwi.com/v2/search"
    # Formato Kiwi: dd/mm/yyyy
    d_ida = datetime.strptime(fecha_ida, "%Y-%m-%d").strftime("%d/%m/%Y")
    d_vuelta = datetime.strptime(fecha_vuelta, "%Y-%m-%d").strftime("%d/%m/%Y")

    params = {
        "fly_from": origen_iata,
        "fly_to": iata,
        "date_from": d_ida,
        "date_to": d_ida,
        "return_from": d_vuelta,
        "return_to": d_vuelta,
        "adults": pax,
        "curr": "CLP",
        "limit": 5,  # Traer las 5 mejores opciones
        "selected_cabins": "M",
    }
    headers = {"apikey": TEQUILA_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()

            vuelos = []
            for it in data.get("data", []):
                
                # Crear segmento principal del vuelo
                vuelo_seg = Segmento(
                    origen=origen_iata,
                    destino=iata,
                    medio="Vuelo",
                    duracion_min=int(it.get("duration", {}).get("total", 0) / 60),
                    operador=it.get("airlines", ["LATAM"])[0]
                )
                
                vuelos.append(VueloOption(
                    id=it.get("id", ""),
                    aerolinea=it.get("airlines", ["LATAM"])[0],
                    precio=float(it.get("price", 0)),
                    moneda="CLP",
                    origen=origen_iata,
                    destino_iata=iata,
                    fecha_salida=fecha_ida,
                    hora_salida=datetime.fromtimestamp(it.get("dTime", 0)).strftime("%H:%M"),
                    hora_llegada=datetime.fromtimestamp(it.get("aTime", 0)).strftime("%H:%M"),
                    duracion_min=int(it.get("duration", {}).get("total", 0) / 60),
                    escalas=len(it.get("route", [])) - 2, # -2 porque route incluye ida y vuelta
                    fuente="tequila_api",
                    deep_link=it.get("deep_link", ""),
                    segmentos=[vuelo_seg]
                ))
            return vuelos
    except Exception as e:
        logger.error(f"❌ Error en Tequila API: {e}")
        return []

# ─── Hoteles vía Scrapling (Stealth) ──────────────────────────────────────────
async def buscar_hoteles_scrapling(slug: str, fecha_ida: str, fecha_vuelta: str, pax: int) -> dict:
    """Obtiene hoteles reales desde Booking vía Scrapling."""
    try:
        # Scrapling es síncrono por defecto en su StealthyFetcher, 
        # pero lo ejecutaremos en un hilo para no bloquear el loop.
        def _fetch():
            fetcher = StealthyFetcher()
            # Configurar para evitar detecciones (Opcional pero recomendado)
            # fetcher.configure(user_agent="Mozilla/5.0 ...") 
            
            destino = slug.replace('-', ' ').title()
            url = (
                f"https://www.booking.com/searchresults.es.html"
                f"?ss={destino}%2C+Chile&checkin={fecha_ida}&checkout={fecha_vuelta}"
                f"&group_adults={pax}&no_rooms=1"
            )
            logger.info(f"🏨 Navegando a Booking con Scrapling: {url[:60]}...")
            
            response = fetcher.fetch(url, headless=True)
            
            # Selectores actualizados para Booking 2026
            # Usamos selectores más genéricos o de data-testid si están disponibles
            hoteles_list = response.css('[data-testid="property-card"]')
            
            if hoteles_list:
                first = hoteles_list[0]
                nombre = first.css('[data-testid="title"]').text
                precio_txt = first.css('[data-testid="price-and-discounted-price"]').text
                score = first.css('[data-testid="review-score"] div:first-child').text
                
                if nombre and precio_txt:
                    p_nums = ''.join(c for c in precio_txt if c.isdigit())
                    return {
                        'nombre': nombre.strip(),
                        'precio': float(p_nums) if p_nums else 0,
                        'score': float(score.replace(',', '.')) if score else 8.5,
                        'exitoso': True,
                        'url': url
                    }
            
            # Fallback manual si el listado falló pero la página cargó
            nombres = [el.text for el in response.css('div.sr_property_block_main_row span.sr-hotel__name')]
            if not nombres:
                nombres = [el.text for el in response.css('[data-testid="title"]')]
            
            if nombres:
                 return {
                    'nombre': nombres[0].strip(),
                    'precio': 65000.0, # Precio estimado si no se pudo parsear
                    'score': 8.0,
                    'exitoso': True,
                    'url': url
                }

            return {'exitoso': False}

        loop = asyncio.get_event_loop()
        # Timeout de 45s para el scraping para evitar el timeout del frontend (60s)
        try:
            return await asyncio.wait_for(loop.run_in_executor(None, _fetch), timeout=45.0)
        except asyncio.TimeoutError:
            logger.warning("🏨 Timeout en scraping de hoteles. Usando fallback.")
            return {'exitoso': False}
    except Exception as e:
        logger.error(f"❌ Error en Scrapling Hoteles: {e}")
        return {'exitoso': False}

# ─── Buses vía Mock (Próximamente Scrapling) ──────────────────────────────────
# Mapa de slugs compatibles con Recorrido.cl
RECORRIDO_SLUG = {
    'Santiago': 'santiago', 'Concepción': 'concepcion', 'Valparaíso': 'valparaiso',
    'La Serena': 'la-serena', 'Temuco': 'temuco', 'Puerto Montt': 'puerto-montt',
    'Antofagasta': 'antofagasta', 'Iquique': 'iquique', 'Punta Arenas': 'punta-arenas',
    'Arica': 'arica',
    'san-pedro-de-atacama': 'san-pedro-de-atacama', 'torres-del-paine': 'torres-del-paine',
    'valdivia': 'valdivia', 'chiloe': 'castro', 'pucon': 'pucon',
    'vina-del-mar': 'vina-del-mar', 'elqui': 'la-serena',
    'cajon-del-maipo': 'santiago', 'puerto-natales': 'puerto-natales',
}

def build_recorrido_url(origen: str, slug_destino: str, fecha_ida: str) -> str:
    """Construye URL de Recorrido.cl: /es/bus/{origen}/{destino}/{DD-MM-YYYY}"""
    o = RECORRIDO_SLUG.get(origen, origen.lower().replace(' ', '-'))
    d = RECORRIDO_SLUG.get(slug_destino, slug_destino)
    # Convertir YYYY-MM-DD → DD-MM-YYYY
    try:
        dt = datetime.strptime(fecha_ida, "%Y-%m-%d")
        f = dt.strftime("%d-%m-%Y")
    except ValueError:
        f = fecha_ida
    return f"https://www.recorrido.cl/es/bus/{o}/{d}/{f}"

async def buscar_buses_mock(slug: str, fecha_ida: str, fecha_vuelta: str, pax: int, origen: str = "Santiago") -> List[VueloOption]:
    """Simula resultados de buses mientras implementamos buses_scraper.py."""
    deep_link = build_recorrido_url(origen, slug, fecha_ida)
    
    buses = [
        ("Pullman Bus", random.randint(15000, 28000), "22:30", "07:45", 555),
        ("Turbus",      random.randint(14000, 26000), "23:00", "08:15", 555),
        ("Cóndor Bus",  random.randint(16000, 32000), "21:00", "06:30", 570),
    ]
    
    return [
        VueloOption(
            id=f"bus_{i+1}",
            aerolinea=nombre,
            precio=float(precio),
            moneda="CLP",
            origen=f"Terminal de Buses ({origen})",
            destino_iata=slug.upper()[:3],
            fecha_salida=fecha_ida,
            hora_salida=salida,
            hora_llegada=llegada,
            duracion_min=dur,
            escalas=0,
            fuente="recorrido_mock",
            deep_link=deep_link,
            segmentos=[Segmento(origen=origen, destino=slug.replace('-',' ').title(), medio="Bus", duracion_min=dur, operador=nombre)]
        )
        for i, (nombre, precio, salida, llegada, dur) in enumerate(buses)
    ]

# ─── Orquestador ──────────────────────────────────────────────────────────────
async def scrape_datos_hibrido(slug: str, iata: str, fecha_ida: str, fecha_vuelta: str, pax: int, transporte: str = "avion", origen: str = "Santiago", origen_iata: str = "SCL") -> dict:
    """Ejecuta búsquedas de transporte y hoteles en paralelo usando el motor de Rutas de 3 etapas."""
    from rutas import RoutePlanner, TicketMapper, ItineraryAssembler
    
    # 1. Armar Plan de Ruta (RoutePlanner)
    destino_nombre = slug.replace('-', ' ').title()
    plan = RoutePlanner.build_plan(origen, origen_iata, slug, destino_nombre, transporte)
    
    # 2. Mapear Pasajes de forma concurrente (TicketMapper) + Hoteles en paralelo
    mapper = TicketMapper(buscar_vuelos_tequila, buscar_buses_mock)
    
    hoteles_task = buscar_hoteles_scrapling(slug, fecha_ida, fecha_vuelta, pax)
    mapped_tickets_task = mapper.map_plan(plan, fecha_ida, fecha_vuelta, pax)
    
    mapped_tickets, hotel_res = await asyncio.gather(mapped_tickets_task, hoteles_task)
    
    demo_mode = False
    
    # 3. Ensamblar Itinerarios (ItineraryAssembler)
    trans_options = ItineraryAssembler.assemble(plan, mapped_tickets)
    
    # Fallback si no hay opciones de transporte tras el ensamblaje
    if not trans_options:
        logger.warning(f"⚠️ Sin transporte real para {slug}. Generando fallback.")
        rango = PRECIOS_VUELO_REF.get(iata, (60000, 150000))
        p_ref = (rango[0] + rango[1]) // 2
        trans_options = [VueloOption(
            id="fallback_vuelo", aerolinea="Aerolínea Referencial", precio=float(p_ref),
            moneda="CLP", origen=origen_iata, destino_iata=iata,
            fecha_salida=fecha_ida, hora_salida="09:00", hora_llegada="11:30",
            duracion_min=150, escalas=0, fuente="referencial_fallback",
            deep_link=f"https://www.skyscanner.cl/transporte/vuelos/{origen_iata.lower()}/{iata.lower()}/{fecha_ida[2:].replace('-', '')}/{fecha_vuelta[2:].replace('-', '')}/?adults={pax}&curr=CLP",
            segmentos=[Segmento(origen=origen_iata, destino=iata, medio="Vuelo", duracion_min=150, operador="Aerolínea Referencial")]
        )]
        demo_mode = True

    # Fallback para hoteles
    if not hotel_res.get('exitoso'):
        hotel_nombre = random.choice(HOTELES_REALES.get(iata, ["Hotel Central"]))
        url_booking = f"https://www.booking.com/searchresults.es.html?ss={slug.replace('-', '+')}%2C+Chile&checkin={fecha_ida}&checkout={fecha_vuelta}&group_adults={pax}&no_rooms=1"
        hotel_res = { 'nombre': hotel_nombre, 'precio': 55000.0, 'score': 8.2, 'url': url_booking, 'exitoso': False }
        demo_mode = True

    return {
        'transporte_opciones': trans_options,
        'transporte_top': trans_options[0],
        'hotel': hotel_res,
        'demo_mode': demo_mode
    }

# ─── Endpoint principal ───────────────────────────────────────────────────────
@app.get("/api/buscar", response_model=PaqueteResponse)
async def buscar_paquete(
    slug:        str = Query(..., description="Slug del destino"),
    fecha_ida:   str = Query(..., alias="ida", description="YYYY-MM-DD"),
    fecha_vuelta: str = Query(..., alias="vuelta", description="YYYY-MM-DD"),
    pasajeros:   int = Query(1, ge=1, le=9),
    transporte:  str = Query("avion", description="avion o bus"),
    origen:      str = Query("Santiago", description="Ciudad de origen"),
    origen_iata: str = Query("SCL", description="Código IATA del origen"),
    db = Depends(get_db)
):
    try:
        d_ida    = date.fromisoformat(fecha_ida)
        d_vuelta = date.fromisoformat(fecha_vuelta)
        
        result = await db.execute(select(Destino).where(Destino.slug == slug))
        destino_row = result.scalar_one_or_none()
        
        if not destino_row:
            raise HTTPException(status_code=404, detail="Destino no encontrado")

        nombre = destino_row.nombre
        iata = destino_row.codigo_iata or IATA_MAP.get(slug, 'SCL')
        
        datos = await scrape_datos_hibrido(slug, iata, fecha_ida, fecha_vuelta, pasajeros, transporte, origen, origen_iata)
        
        trans_top = datos['transporte_top']
        hotel = datos['hotel']
        
        precio_total = (trans_top.precio + hotel['precio']) * pasajeros
        precio_sin_dto = round(precio_total * 1.18)
        ahorro = precio_sin_dto - precio_total

        return PaqueteResponse(
            destino=nombre,
            destino_slug=slug,
            fecha_ida=fecha_ida,
            fecha_vuelta=fecha_vuelta,
            pasajeros=pasajeros,
            vuelos=datos['transporte_opciones'],
            vuelo_seleccionado=trans_top,
            hotel=HotelResponse(
                nombre=hotel['nombre'], precio=hotel['precio'], moneda="CLP", estrellas=4.0,
                score_calidad=hotel['score'], url_reserva=hotel['url'],
                fuente="booking_stealth" if not datos['demo_mode'] else "referencial"
            ),
            precio_total=precio_total,
            precio_sin_descuento=precio_sin_dto,
            ahorro_estimado=ahorro,
            calidad_score=hotel['score'],
            es_cache=False,
            scraped_at=datetime.now().isoformat(),
            demo_mode=datos['demo_mode']
        )

    except Exception as e:
        logger.error(f"Error en buscar_paquete: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Endpoint unificado /api/cotizar (5 servicios paralelos) ──────────────────
@app.get("/api/cotizar", response_model=CotizacionResponse)
async def cotizar_paquete(
    slug:        str = Query(..., description="Slug del destino"),
    fecha_ida:   str = Query(..., alias="ida", description="YYYY-MM-DD"),
    fecha_vuelta: str = Query(..., alias="vuelta", description="YYYY-MM-DD"),
    pasajeros:   int = Query(1, ge=1, le=9),
    transporte:  str = Query("avion", description="avion o bus"),
    origen:      str = Query("Santiago", description="Ciudad de origen"),
    origen_iata: str = Query("SCL", description="Código IATA del origen"),
    db = Depends(get_db)
):
    """Endpoint unificado: obtiene vuelos, hoteles, buses, autos y tours en paralelo."""
    from tours_scraper import buscar_tours_async
    from autos_scraper import buscar_autos_async
    from buses_scraper import buscar_buses_async
    from cross_sell import generar_sugerencias_cross_sell
    from rutas import RoutePlanner, TicketMapper, ItineraryAssembler

    try:
        result = await db.execute(select(Destino).where(Destino.slug == slug))
        destino_row = result.scalar_one_or_none()
        if not destino_row:
            raise HTTPException(status_code=404, detail="Destino no encontrado")

        nombre = destino_row.nombre
        iata = destino_row.codigo_iata or IATA_MAP.get(slug, 'SCL')
        demo_mode = False

        # ── Ejecutar los 5 servicios en paralelo ──────────────────────────
        destino_nombre = slug.replace('-', ' ').title()
        plan = RoutePlanner.build_plan(origen, origen_iata, slug, destino_nombre, transporte)
        mapper = TicketMapper(buscar_vuelos_tequila, buscar_buses_mock)

        logger.info(f"🚀 Cotización completa para '{nombre}': lanzando 5 scrapers en paralelo...")

        (
            mapped_tickets,
            hotel_res,
            buses_raw,
            autos_raw,
            tours_raw
        ) = await asyncio.gather(
            mapper.map_plan(plan, fecha_ida, fecha_vuelta, pasajeros),
            buscar_hoteles_scrapling(slug, fecha_ida, fecha_vuelta, pasajeros),
            buscar_buses_async(slug, fecha_ida, fecha_vuelta, pasajeros, origen),
            buscar_autos_async(slug, fecha_ida, fecha_vuelta),
            buscar_tours_async(slug, fecha_ida),
            return_exceptions=True
        )

        # ── Procesar resultados (tolerancia a fallos individuales) ─────────
        # Vuelos
        if isinstance(mapped_tickets, Exception):
            logger.error(f"❌ Error en vuelos: {mapped_tickets}")
            mapped_tickets = {}
        trans_options = ItineraryAssembler.assemble(plan, mapped_tickets)
        if not trans_options:
            rango = PRECIOS_VUELO_REF.get(iata, (60000, 150000))
            p_ref = (rango[0] + rango[1]) // 2
            trans_options = [VueloOption(
                id="fallback_vuelo", aerolinea="Aerolínea Referencial", precio=float(p_ref),
                moneda="CLP", origen=origen_iata, destino_iata=iata,
                fecha_salida=fecha_ida, hora_salida="09:00", hora_llegada="11:30",
                duracion_min=150, escalas=0, fuente="referencial_fallback",
                deep_link=f"https://www.skyscanner.cl/transporte/vuelos/{origen_iata.lower()}/{iata.lower()}/{fecha_ida[2:].replace('-', '')}/{fecha_vuelta[2:].replace('-', '')}/?adults={pasajeros}&curr=CLP",
                segmentos=[Segmento(origen=origen_iata, destino=iata, medio="Vuelo", duracion_min=150, operador="Aerolínea Referencial")]
            )]
            demo_mode = True

        # Hotel
        if isinstance(hotel_res, Exception):
            logger.error(f"❌ Error en hoteles: {hotel_res}")
            hotel_res = {'exitoso': False}
        if not hotel_res.get('exitoso'):
            hotel_nombre = random.choice(HOTELES_REALES.get(iata, ["Hotel Central"]))
            url_booking = f"https://www.booking.com/searchresults.es.html?ss={slug.replace('-', '+')}%2C+Chile&checkin={fecha_ida}&checkout={fecha_vuelta}&group_adults={pasajeros}&no_rooms=1"
            hotel_res = {'nombre': hotel_nombre, 'precio': 55000.0, 'score': 8.2, 'url': url_booking, 'exitoso': False}
            demo_mode = True

        # Buses
        if isinstance(buses_raw, Exception):
            logger.error(f"❌ Error en buses: {buses_raw}")
            buses_raw = []
        buses_options = [
            BusOption(**{k: v for k, v in b.items() if k in BusOption.model_fields})
            for b in buses_raw
        ] if buses_raw else []

        # Autos
        if isinstance(autos_raw, Exception):
            logger.error(f"❌ Error en autos: {autos_raw}")
            autos_raw = []
        autos_options = [
            AutoOption(**{k: v for k, v in a.items() if k in AutoOption.model_fields})
            for a in autos_raw
        ] if autos_raw else []

        # Tours
        if isinstance(tours_raw, Exception):
            logger.error(f"❌ Error en tours: {tours_raw}")
            tours_raw = []
        tours_options = [
            TourOption(**{k: v for k, v in t.items() if k in TourOption.model_fields})
            for t in tours_raw
        ] if tours_raw else []

        # ── Cross-Selling Engine ───────────────────────────────────────────
        sugerencias_raw = generar_sugerencias_cross_sell(tours_raw, autos_raw)
        sugerencias = [
            CrossSellSugerencia(**{k: v for k, v in s.items() if k in CrossSellSugerencia.model_fields})
            for s in sugerencias_raw
        ]

        # ── Calcular precio total ──────────────────────────────────────────
        trans_top = trans_options[0]
        precio_total = (trans_top.precio + hotel_res['precio']) * pasajeros
        precio_sin_dto = round(precio_total * 1.18)
        ahorro = precio_sin_dto - precio_total

        logger.info(
            f"✅ Cotización completa: {len(trans_options)} vuelos, {len(buses_options)} buses, "
            f"{len(autos_options)} autos, {len(tours_options)} tours, {len(sugerencias)} sugerencias"
        )

        return CotizacionResponse(
            destino=nombre,
            destino_slug=slug,
            fecha_ida=fecha_ida,
            fecha_vuelta=fecha_vuelta,
            pasajeros=pasajeros,
            vuelos=trans_options,
            vuelo_seleccionado=trans_top,
            hotel=HotelResponse(
                nombre=hotel_res['nombre'], precio=hotel_res['precio'], moneda="CLP", estrellas=4.0,
                score_calidad=hotel_res['score'], url_reserva=hotel_res.get('url', '#'),
                fuente="booking_stealth" if hotel_res.get('exitoso') else "referencial"
            ),
            buses=buses_options,
            autos=autos_options,
            tours=tours_options,
            sugerencias=sugerencias,
            precio_total=precio_total,
            precio_sin_descuento=precio_sin_dto,
            ahorro_estimado=ahorro,
            calidad_score=hotel_res['score'],
            es_cache=False,
            scraped_at=datetime.now().isoformat(),
            demo_mode=demo_mode
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en cotizar_paquete: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "engine": "ota_v2_5services", "version": "4.0.0"}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
