-- ================================================================
-- Seed Data — 10 Destinos Chile MVP (sin PostGIS)
-- Ejecutar: C:\pgsql\bin\psql.exe -U postgres -d turismo_mvp -f seed.sql
-- ================================================================

INSERT INTO destinos (slug, nombre, region, codigo_iata, tagline, descripcion, imagen_url, lat, lng)
VALUES
  (
    'san-pedro-de-atacama',
    'San Pedro de Atacama',
    'Antofagasta',
    'CJC',
    'El desierto más árido del mundo, a tus pies',
    'Salar de Atacama, lagunas altiplánicas y el Valle de la Luna.',
    'https://images.unsplash.com/photo-1544183946-4e9fdf5f9b17?w=1200&q=80',
    -22.9087, -68.1997
  ),
  (
    'torres-del-paine',
    'Torres del Paine',
    'Magallanes',
    'PUQ',
    'El fin del mundo, donde la naturaleza manda',
    'Torres imponentes, glaciares azules y fauna salvaje.',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
    -50.9423, -73.4068
  ),
  (
    'valdivia',
    'Valdivia',
    'Los Ríos',
    'ZAL',
    'Cultura, ríos y cerveza artesanal en el sur',
    'Ciudad fluvial con arquitectura histórica alemana.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    -39.8142, -73.2459
  ),
  (
    'chiloe',
    'Chiloé',
    'Los Lagos',
    'PMC',
    'Palafitos, iglesias y mitología en el archipiélago mágico',
    'Patrimonio UNESCO. Iglesias de madera, palafitos coloridos.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    -42.6259, -73.9297
  ),
  (
    'pucon',
    'Pucón',
    'La Araucanía',
    'ZCO',
    'Adrenalina junto al volcán Villarrica',
    'Capital de la aventura en el sur. Volcán activo, termas, kayak.',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    -39.2721, -71.9771
  ),
  (
    'isla-de-pascua',
    'Isla de Pascua',
    'Valparaíso',
    'IPC',
    'Los Moáis te esperan en el ombligo del mundo',
    'El destino más remoto de Chile. Moáis ancestrales y playas cristalinas.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    -27.1127, -109.3497
  ),
  (
    'vina-del-mar',
    'Viña del Mar',
    'Valparaíso',
    'SCL',
    'La Ciudad Jardín: sol, playa y festival',
    'Playas urbanas, casino, jardines y el Festival de la Canción.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    -33.0153, -71.5500
  ),
  (
    'elqui',
    'Valle del Elqui',
    'Coquimbo',
    'LSC',
    'Cielos perfectos, pisco y mística andina',
    'El cielo más limpio de América para astroturismo.',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80',
    -30.0285, -70.7945
  ),
  (
    'cajon-del-maipo',
    'Cajón del Maipo',
    'Metropolitana',
    'SCL',
    'Aventura andina a 1 hora de Santiago',
    'Rafting, trekking, termas y el imponente Embalse El Yeso.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    -33.6490, -70.3540
  ),
  (
    'puerto-natales',
    'Puerto Natales',
    'Magallanes',
    'PNT',
    'La puerta de entrada a la Patagonia salvaje',
    'Base ideal para Torres del Paine. Glaciares y fiordos.',
    'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=1200&q=80',
    -51.7289, -72.4977
  )
ON CONFLICT (slug) DO NOTHING;
