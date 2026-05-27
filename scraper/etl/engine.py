import asyncio
import logging
import math
import sys
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from thefuzz import fuzz
from thefuzz import process
from sqlalchemy.future import select

from db import AsyncSessionLocal
from models import Destino, ProviderMapping

# Importar adaptadores
from etl.adapters.kiwi import KiwiAdapter
from etl.adapters.recorrido import RecorridoAdapter

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# Función Haversine para cálculo de distancia (en km)
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Radio de la tierra en km
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

class EntityResolutionEngine:
    """Motor Multi-Factor de Resolución de Entidades."""
    
    def __init__(self, umbral_similitud: int = 80, radio_max_km: float = 100.0):
        self.umbral_similitud = umbral_similitud
        self.radio_max_km = radio_max_km
        self.destinos_db: List[Destino] = []
        
    async def load_destinos(self):
        """Carga en memoria todos los destinos base para hacer la resolución rápida."""
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Destino))
            self.destinos_db = result.scalars().all()
            logger.info(f"Se cargaron {len(self.destinos_db)} destinos desde la base de datos.")
            
    def _clean_text(self, text: str) -> str:
        """Limpieza básica NLP."""
        stop_words = ["san", "de", "la", "el", "los", "las", "puerto", "villa", "isla", "lago", "volcan", "terminal", "buses", "aeropuerto", "airport", "centro", "ciudad", "parque", "nacional"]
        text = text.lower().strip()
        words = text.split()
        cleaned = [w for w in words if w not in stop_words]
        return " ".join(cleaned) if cleaned else text
            
    def find_match(self, external_entity: Dict[str, Any]) -> Optional[Destino]:
        """Aplica el motor de 3 escudos para encontrar coincidencias."""
        
        ext_nombre = external_entity.get("nombre", "")
        ext_region = external_entity.get("region", "")
        ext_lat = external_entity.get("lat")
        ext_lng = external_entity.get("lng")
        
        if not ext_nombre:
            return None
            
        ext_clean = self._clean_text(ext_nombre)
        
        candidatos = []
        
        for d in self.destinos_db:
            # 1. Filtro Administrativo (Región) - Si está provisto, debe coincidir, o se penaliza
            # Para mayor flexibilidad, lo dejamos como bonificador/penalizador
            
            # 2. Distancia GPS (Haversine)
            dist_km = None
            if ext_lat is not None and ext_lng is not None and d.latitud is not None and d.longitud is not None:
                dist_km = haversine(ext_lat, ext_lng, d.latitud, d.longitud)
                
                # Falla Rápida: Si la distancia es enorme (> 100km), no es el mismo destino.
                if dist_km > self.radio_max_km:
                    # logger.debug(f"Skip {d.nombre} due to distance: {dist_km:.2f} km")
                    continue
            
            # 3. NLP (Fuzzy Matching)
            d_clean = self._clean_text(d.nombre)
            similitud = fuzz.token_sort_ratio(ext_clean, d_clean)
            
            # Boost si coincide la región exactamente
            if ext_region and d.region.lower() == ext_region.lower():
                similitud += 10
                
            if similitud >= self.umbral_similitud:
                candidatos.append({
                    "destino": d,
                    "similitud": similitud,
                    "dist_km": dist_km
                })
            # else:
            #     if similitud > 50:
            #         logger.debug(f"Match rejected for {d.nombre}: similitud={similitud}")
                
        if not candidatos:
            return None
            
        # Ordenar por mayor similitud y menor distancia
        candidatos.sort(key=lambda x: (-x['similitud'], x['dist_km'] if x['dist_km'] is not None else float('inf')))
        return candidatos[0]["destino"]

async def upsert_provider_mapping(session, destino_id: int, provider: str, external_id: str, payload: dict):
    """Operación Upsert (Update or Insert) en la tabla provider_mappings."""
    # Buscar si ya existe
    result = await session.execute(
        select(ProviderMapping).where(
            ProviderMapping.destino_id == destino_id,
            ProviderMapping.provider_name == provider
        )
    )
    mapping = result.scalar_one_or_none()
    
    if mapping:
        # Update
        mapping.external_id = external_id
        mapping.last_payload = payload
        mapping.updated_at = datetime.utcnow() # dummy update for timestamp
        logger.debug(f"UPDATED mapping for DestinoID={destino_id} -> {provider}:{external_id}")
    else:
        # Insert
        new_mapping = ProviderMapping(
            destino_id=destino_id,
            provider_name=provider,
            external_id=external_id,
            last_payload=payload
        )
        session.add(new_mapping)
        logger.debug(f"INSERTED mapping for DestinoID={destino_id} -> {provider}:{external_id}")
    
async def run_etl():
    """Flujo Principal ETL."""
    logger.info("Iniciando Proceso ETL Asíncrono...")
    
    engine = EntityResolutionEngine()
    await engine.load_destinos()
    
    # Adaptadores instanciados
    adapters = [
        KiwiAdapter(),
        RecorridoAdapter()
    ]
    
    async with AsyncSessionLocal() as session:
        for adapter in adapters:
            logger.info(f"[{adapter.name}] Iniciando Extracción...")
            data = await adapter.extract()
            logger.info(f"[{adapter.name}] Se extrajeron {len(data)} entidades. Iniciando Resolución...")
            
            match_count = 0
            for item in data:
                # Buscar Match
                match = engine.find_match(item)
                
                if match:
                    # Registrar Upsert
                    await upsert_provider_mapping(
                        session=session,
                        destino_id=match.id,
                        provider=adapter.name,
                        external_id=item["external_id"],
                        payload=item
                    )
                    match_count += 1
                else:
                    logger.debug(f"[{adapter.name}] No match found para: {item.get('nombre')}")
                    
            await session.commit()
            logger.info(f"[{adapter.name}] Proceso completado. Matches exitosos: {match_count}/{len(data)}.")
            
    logger.info("ETL Finalizado con Éxito.")

if __name__ == "__main__":
    asyncio.run(run_etl())
