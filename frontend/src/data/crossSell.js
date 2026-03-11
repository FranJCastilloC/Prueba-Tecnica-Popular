// ─── Matriz de adopción P(B|A) ────────────────────────────────
// P(B|A): probabilidad de que un cliente que tiene A también adopte B
export const ADOPTION_MATRIX = {
  products: ['Tarjeta de Crédito', 'Cuenta de Ahorros', 'Cuenta Corriente', 'Préstamo'],
  // values[i][j] = P(products[j] | ya tiene products[i])
  // null en diagonal (mismo producto)
  values: [
    // Dado que tiene Tarjeta de Crédito:
    [null,  0.712, 0.698, 0.634],
    // Dado que tiene Cuenta de Ahorros:
    [0.848, null,  0.821, 0.601],
    // Dado que tiene Cuenta Corriente:
    [0.851, 0.821, null,  0.598],
    // Dado que tiene Préstamo:
    [0.867, 0.743, 0.689, null ],
  ],
}

// ─── Top 10 clientes elegibles para cross-sell ────────────────
// Criterio: ≤2 productos actuales + score de potencial
export const ELIGIBLE_CLIENTS = [
  { id: 1007, segmento: 'Corporativo', pais: 'México',    n_productos: 1, next_product: 'Tarjeta de Crédito', prob: 0.867, ingreso_estimado: 3847, score: 0.91 },
  { id: 1028, segmento: 'Corporativo', pais: 'Chile',     n_productos: 1, next_product: 'Tarjeta de Crédito', prob: 0.851, ingreso_estimado: 3721, score: 0.88 },
  { id: 1035, segmento: 'Retail',      pais: 'Argentina', n_productos: 1, next_product: 'Tarjeta de Crédito', prob: 0.848, ingreso_estimado: 3695, score: 0.85 },
  { id: 1062, segmento: 'Corporativo', pais: 'Colombia',  n_productos: 1, next_product: 'Tarjeta de Crédito', prob: 0.844, ingreso_estimado: 3610, score: 0.83 },
  { id: 1033, segmento: 'PYME',        pais: 'México',    n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.821, ingreso_estimado: 3542, score: 0.80 },
  { id: 1008, segmento: 'Retail',      pais: 'Chile',     n_productos: 2, next_product: 'Cuenta de Ahorros',  prob: 0.812, ingreso_estimado: 3280, score: 0.77 },
  { id: 1002, segmento: 'Corporativo', pais: 'Argentina', n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.798, ingreso_estimado: 3196, score: 0.75 },
  { id: 1018, segmento: 'Retail',      pais: 'Colombia',  n_productos: 2, next_product: 'Cuenta Corriente',   prob: 0.776, ingreso_estimado: 3041, score: 0.72 },
  { id: 1023, segmento: 'Corporativo', pais: 'México',    n_productos: 2, next_product: 'Tarjeta de Crédito', prob: 0.763, ingreso_estimado: 2987, score: 0.69 },
  { id: 1024, segmento: 'Corporativo', pais: 'Argentina', n_productos: 2, next_product: 'Cuenta de Ahorros',  prob: 0.754, ingreso_estimado: 2891, score: 0.67 },
]

// ─── Resumen de universo elegible ─────────────────────────────
export const CROSSSELL_SUMMARY = {
  eligible_clients:          35,
  avg_prob_top10:            0.81,
  ingreso_potencial_conservador: 12244,
  ingreso_potencial_base:        44688,
  ingreso_potencial_agresivo:    99688,
  top_recommended_product:   'Tarjeta de Crédito',
  pct_recommend_tarjeta:     74.3,
}

// ─── Frecuencia de recomendaciones por producto (escenario base)
export const RECOMMENDATION_DIST = [
  { tipo: 'Tarjeta de Crédito', n_recomendados: 26, vol_incremental: 18615, delta_ticket: 780  },
  { tipo: 'Cuenta de Ahorros',  n_recomendados: 12, vol_incremental: 13630, delta_ticket:   0  },
  { tipo: 'Cuenta Corriente',   n_recomendados: 10, vol_incremental: 12443, delta_ticket: 196  },
  { tipo: 'Préstamo',           n_recomendados:  3, vol_incremental:     0, delta_ticket:   0  },
]
