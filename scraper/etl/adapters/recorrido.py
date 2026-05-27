from typing import List, Dict, Any
from etl.adapters.base import BaseAdapter

class RecorridoAdapter(BaseAdapter):
    """Adaptador para extraer catálogos geográficos desde Recorrido.cl."""
    
    def __init__(self):
        super().__init__(name="recorrido")
        
    async def extract(self) -> List[Dict[str, Any]]:
        # Aquí iría la lógica real de extracción (API, Sitemap, o HTML Parsing)
        # Retornamos datos de prueba por ahora (Mock)
        return [
            {
                "external_id": "REC-123",
                "nombre": "Terminal de Buses Valdivia",
                "region": "Los Ríos",
                "lat": -39.8142,
                "lng": -73.2459,
                "type": "bus_terminal"
            },
            {
                "external_id": "REC-456",
                "nombre": "Terminal de Buses Pucón Centro",
                "region": "La Araucanía",
                "lat": -39.2721,
                "lng": -71.9771,
                "type": "bus_terminal"
            }
        ]
