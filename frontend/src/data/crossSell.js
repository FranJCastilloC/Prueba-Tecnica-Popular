// ─── Matriz de adopción P(B|A) — Excel "Matriz Adopción" CONFIRMADO ─
// Valores exactos del Excel: simulacion_cross_sell.xlsx
export const ADOPTION_MATRIX = {
  products: ['Tarjeta de Crédito', 'Cuenta de Ahorros', 'Cuenta Corriente', 'Préstamo'],
  // values[i][j] = P(products[j] | ya tiene products[i])
  // null en diagonal (mismo producto)
  values: [
    // Dado que tiene Tarjeta de Crédito:
    [null,   0.7882, 0.6706, 0.4588],
    // Dado que tiene Cuenta de Ahorros:
    [0.8481, null,   0.6962, 0.4304],
    // Dado que tiene Cuenta Corriente:
    [0.8507, 0.8209, null,   0.4328],
    // Dado que tiene Préstamo:
    [0.8667, 0.7556, 0.6444, null  ],
  ],
}

// ─── Top 10 clientes elegibles — Excel "Detalle Base" CONFIRMADO ─
// Datos reales del simulador: id, segmento, pais, volumen_actual, vol_incremental
export const ELIGIBLE_CLIENTS = [
  { id: 1074, segmento: 'Retail',      pais: 'Chile',     n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 2144, score: 0.7024 },
  { id: 1003, segmento: 'PYME',        pais: 'Argentina', n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 2453, score: 0.4182 },
  { id: 1022, segmento: 'Retail',      pais: 'Colombia',  n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 2043, score: 0.6429 },
  { id: 1050, segmento: 'Retail',      pais: 'Argentina', n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 2071, score: 0.5426 },
  { id: 1055, segmento: 'Retail',      pais: 'México',    n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 1691, score: 0.6306 },
  { id: 1058, segmento: 'PYME',        pais: 'Chile',     n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 1859, score: 0.3113 },
  { id: 1019, segmento: 'PYME',        pais: 'Argentina', n_productos: 2, next_product: 'Cuenta Corriente',   prob: 0.6962, ingreso_estimado: 1735, score: 0.4494 },
  { id: 1053, segmento: 'Retail',      pais: 'Chile',     n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 1693, score: 0.4274 },
  { id: 1023, segmento: 'Corporativo', pais: 'Argentina', n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.8507, ingreso_estimado: 1502, score: 0.1514 },
  { id: 1042, segmento: 'PYME',        pais: 'Colombia',  n_productos: 2, next_product: 'Cuenta de Ahorros',  prob: 0.7882, ingreso_estimado: 1402, score: 0.4207 },
]

// ─── Resumen de universo elegible — Excel "Resumen Ejecutivo" CONFIRMADO ─
export const CROSSSELL_SUMMARY = {
  eligible_clients:              35,
  vol_actual_elegibles:          359860.78,
  ingreso_potencial_conservador: 12244,
  ingreso_potencial_base:        44688,
  ingreso_potencial_agresivo:    99688,
  top_recommended_product:       'Tarjeta de Crédito',
  pct_recommend_tarjeta:         37.14,   // 13 de 35 recomendados
}

// ─── Distribución de recomendaciones — Excel "Resumen Producto" CONFIRMADO ─
// Escenario base
export const RECOMMENDATION_DIST = [
  { tipo: 'Tarjeta de Crédito', n_recomendados: 13, vol_incremental: 18615, delta_ticket: 780 },
  { tipo: 'Cuenta de Ahorros',  n_recomendados: 12, vol_incremental: 13630, delta_ticket:   0 },
  { tipo: 'Cuenta Corriente',   n_recomendados: 10, vol_incremental: 12443, delta_ticket: 196 },
  { tipo: 'Préstamo',           n_recomendados:  0, vol_incremental:     0, delta_ticket:   0 },
]
