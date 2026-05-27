from typing import List, Dict, Any
from etl.adapters.base import BaseAdapter

class KiwiAdapter(BaseAdapter):
    """Adaptador para extraer catálogos geográficos desde Kiwi.com (Tequila API)."""
    
    def __init__(self):
        super().__init__(name="kiwi")
        
    async def extract(self) -> List[Dict[str, Any]]:
        # Aquí iría la lógica real de conexión a la API de Tequila
        # Retornamos datos de prueba por ahora (Mock)
        return [
            {
                "external_id": "CJC", # Calama airport near San Pedro
                "nombre": "San Pedro de Atacama (Aeropuerto de Calama)",
                "region": "Antofagasta",
                "lat": -22.9,
                "lng": -68.2,
                "type": "airport_hub"
            },
            {
                "external_id": "PNT",
                "nombre": "Parque Nacional Torres del Paine",
                "region": "Magallanes",
                "lat": -50.94,
                "lng": -73.4,
                "type": "national_park"
            }
        ]
