import asyncio
from db import engine, Base
import models # Asegurar que los modelos se registren en Base.metadata

async def init_models():
    async with engine.begin() as conn:
        # Crea todas las tablas si no existen
        await conn.run_sync(Base.metadata.create_all)
    print("Base de datos y tablas creadas exitosamente.")

if __name__ == "__main__":
    asyncio.run(init_models())
