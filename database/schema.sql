-- ================================================================
-- Schema PostgreSQL — Plataforma Turismo MVP
-- Sin PostGIS (portable): lat/lng como DECIMAL
-- Ejecutar: C:\pgsql\bin\psql.exe -U postgres -d turismo_mvp -f schema.sql
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- TABLA: destinos (datos fijos de los 10 destinos)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinos (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    nombre      VARCHAR(200) NOT NULL,
    region      VARCHAR(100),
    codigo_iata VARCHAR(3),
    tagline     TEXT,
    descripcion TEXT,
    imagen_url  TEXT,
    lat         DECIMAL(10, 7),
    lng         DECIMAL(10, 7),
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABLA: vuelos_scrapeados
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vuelos_scrapeados (
    id              SERIAL PRIMARY KEY,
    destino_slug    VARCHAR(100) REFERENCES destinos(slug),
    origen_iata     VARCHAR(3) NOT NULL DEFAULT 'SCL',
    destino_iata    VARCHAR(3) NOT NULL,
    aerolinea       VARCHAR(100),
    precio          DECIMAL(12, 2) NOT NULL,
    moneda          VARCHAR(3) DEFAULT 'CLP',
    fecha_salida    DATE,
    fecha_llegada   DATE,
    hora_salida     TIME,
    hora_llegada    TIME,
    duracion_min    INTEGER,
    escalas         INTEGER DEFAULT 0,
    disponible      BOOLEAN DEFAULT TRUE,
    fuente          VARCHAR(50),  -- 'latam_xhr', 'sky_xhr', 'latam_dom', etc.
    scraped_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'  -- TTL 2h
);

-- ────────────────────────────────────────────────────────────────
-- TABLA: hoteles_scrapeados
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hoteles_scrapeados (
    id              SERIAL PRIMARY KEY,
    destino_slug    VARCHAR(100) REFERENCES destinos(slug),
    nombre          VARCHAR(300) NOT NULL,
    precio          DECIMAL(12, 2) NOT NULL,
    moneda          VARCHAR(3) DEFAULT 'CLP',
    estrellas       DECIMAL(2, 1),
    score_calidad   DECIMAL(4, 2),  -- 0.0 - 10.0
    imagen_url      TEXT,
    disponible      BOOLEAN DEFAULT TRUE,
    fecha_checkin   DATE,
    fecha_checkout  DATE,
    noches          INTEGER,
    fuente          VARCHAR(50),  -- 'booking_xhr', 'booking_dom'
    scraped_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'
);

-- ────────────────────────────────────────────────────────────────
-- TABLA: paquetes_armados (resultado del armar_paquete_mvp)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paquetes_armados (
    id                  SERIAL PRIMARY KEY,
    destino_slug        VARCHAR(100) REFERENCES destinos(slug),
    vuelo_id            INTEGER REFERENCES vuelos_scrapeados(id),
    hotel_id            INTEGER REFERENCES hoteles_scrapeados(id),
    precio_total        DECIMAL(12, 2) NOT NULL,
    precio_vuelo        DECIMAL(12, 2),
    precio_hotel        DECIMAL(12, 2),
    ahorro_estimado     DECIMAL(12, 2),
    precio_sin_descuento DECIMAL(12, 2),
    calidad_score       DECIMAL(4, 2),
    fecha_ida           DATE,
    fecha_vuelta        DATE,
    pasajeros           INTEGER DEFAULT 1,
    creado_at           TIMESTAMP DEFAULT NOW(),
    expires_at          TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'
);

-- ────────────────────────────────────────────────────────────────
-- TABLA: cache_busquedas (para evitar re-scraping en 2 horas)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cache_busquedas (
    id              SERIAL PRIMARY KEY,
    cache_key       VARCHAR(500) UNIQUE NOT NULL,
    destino_slug    VARCHAR(100),
    fecha_ida       DATE,
    fecha_vuelta    DATE,
    pasajeros       INTEGER DEFAULT 1,
    paquete_id      INTEGER REFERENCES paquetes_armados(id),
    status          VARCHAR(20) DEFAULT 'pending',  -- pending, ready, error
    scraped_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'
);

-- ────────────────────────────────────────────────────────────────
-- ÍNDICES para consultas rápidas del frontend
-- ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vuelos_destino_fecha  ON vuelos_scrapeados(destino_slug, fecha_salida, expires_at);
CREATE INDEX IF NOT EXISTS idx_hoteles_destino_fecha ON hoteles_scrapeados(destino_slug, fecha_checkin, expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_key             ON cache_busquedas(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_paquetes_destino      ON paquetes_armados(destino_slug, fecha_ida, expires_at);

-- ────────────────────────────────────────────────────────────────
-- FUNCIÓN: cache válida (datos frescos < 2 horas)
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cache_valida(p_cache_key VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM cache_busquedas
        WHERE cache_key = p_cache_key
          AND status = 'ready'
          AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────
-- LIMPIEZA automática de datos expirados (llamar en CRON)
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION limpiar_datos_expirados()
RETURNS void AS $$
BEGIN
    DELETE FROM cache_busquedas WHERE expires_at < NOW();
    DELETE FROM paquetes_armados WHERE expires_at < NOW();
    DELETE FROM vuelos_scrapeados WHERE expires_at < NOW();
    DELETE FROM hoteles_scrapeados WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
