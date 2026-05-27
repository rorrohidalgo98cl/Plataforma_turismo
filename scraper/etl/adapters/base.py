from typing import List, Dict, Any

class BaseAdapter:
    """Clase base para todos los adaptadores de proveedores."""
    
    def __init__(self, name: str):
        self.name = name
        
    async def extract(self) -> List[Dict[str, Any]]:
        """
        Método principal a implementar por cada adaptador.
        Debe devolver una lista de diccionarios con el formato estandarizado:
        [
            {
                "external_id": "...",
                "nombre": "...",
                "region": "...",
                "lat": float,
                "lng": float,
                # Cualquier metadata adicional relevante para este proveedor
            }
        ]
        """
        raise NotImplementedError("Cada adaptador debe implementar extract()")
