import asyncio
import re
import json
from db import engine, AsyncSessionLocal
from models import Destino, Base
import init_db

async def seed_data():
    # Asegurarnos de que las tablas existan
    await init_db.init_models()
    
    # Leer el archivo TypeScript
    ts_file_path = "../frontend/src/data/destinos.ts"
    try:
        with open(ts_file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error leyendo {ts_file_path}: {e}")
        return

    # Extraer bloques dentro de llaves {}
    blocks = re.findall(r'\{([^{}]+)\}', content)
    
    seen_slugs = set()
    destinos_to_insert = []
    for block in blocks:
        if 'slug:' not in block or 'nombre:' not in block or 'lat:' not in block:
            continue
            
        try:
            nombre = re.search(r'nombre:\s*[\'"]([^\'"]+)[\'"]', block).group(1)
            slug = re.search(r'slug:\s*[\'"]([^\'"]+)[\'"]', block).group(1)
            region = re.search(r'region:\s*[\'"]([^\'"]+)[\'"]', block).group(1)
            
            if slug in seen_slugs:
                # Si el slug ya existe, le agregamos la región para hacerlo único
                slug = f"{slug}-{region.lower().replace(' ', '-')}"
                if slug in seen_slugs:
                    continue # Si sigue duplicado, lo saltamos
            
            seen_slugs.add(slug)
            
            iata_match = re.search(r'codigoIATA:\s*[\'"]([^\'"]+)[\'"]', block)
            codigo_iata = iata_match.group(1) if iata_match else None
            
            lat = float(re.search(r'lat:\s*([\-\.\d]+)', block).group(1))
            lng = float(re.search(r'lng:\s*([\-\.\d]+)', block).group(1))
            
            destinos_to_insert.append(Destino(
                nombre=nombre,
                slug=slug,
                region=region,
                latitud=lat,
                longitud=lng,
                codigo_iata=codigo_iata
            ))
        except Exception as e:
            pass
        
    print(f"Se encontraron {len(destinos_to_insert)} destinos en el archivo TypeScript.")
    
    if not destinos_to_insert:
        print("No se encontraron destinos para migrar.")
        return

    async with AsyncSessionLocal() as session:
        # Verificar si ya hay datos
        # No usamos execute directamente si no importamos select, hagamos un workaround
        try:
            for destino in destinos_to_insert:
                session.add(destino)
            await session.commit()
            print("¡Migración de destinos completada con éxito!")
        except Exception as e:
            await session.rollback()
            print(f"Error insertando datos: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
