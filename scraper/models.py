from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base

class Destino(Base):
    __tablename__ = "destinos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    region = Column(String, index=True, nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    codigo_iata = Column(String, nullable=True) # Para aeropuertos si aplica
    
    # Relación uno-a-muchos con los mappings de proveedores
    mappings = relationship("ProviderMapping", back_populates="destino", cascade="all, delete-orphan")

class ProviderMapping(Base):
    __tablename__ = "provider_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    destino_id = Column(Integer, ForeignKey("destinos.id"), nullable=False)
    provider_name = Column(String, index=True, nullable=False) # ej: 'recorrido', 'booking', 'google_flights'
    external_id = Column(String, index=True, nullable=False) # El ID o código en el sistema externo
    last_payload = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    destino = relationship("Destino", back_populates="mappings")
