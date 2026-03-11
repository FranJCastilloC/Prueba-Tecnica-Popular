// ─── 3 escenarios de simulación cross-sell ────────────────────
export const SCENARIOS = {
  conservador: {
    key:             'conservador',
    label:           'Conservador',
    description:     'Adopción 20% · Captura 25% del uplift',
    factor_adopcion:  0.20,
    adoptions:        5.5,
    incremental:     12244,
    uplift_pct:       3.40,
    color:           '#22d3ee',
    colorClass:      'cyan',
    volumen_proyectado: 1592898 + 12244,
  },
  base: {
    key:             'base',
    label:           'Base',
    description:     'Adopción 35% · Captura 50% del uplift',
    factor_adopcion:  0.35,
    adoptions:        9.7,
    incremental:     44688,
    uplift_pct:      12.42,
    color:           '#34d399',
    colorClass:      'emerald',
    volumen_proyectado: 1592898 + 44688,
  },
  agresivo: {
    key:             'agresivo',
    label:           'Agresivo',
    description:     'Adopción 50% · Captura 75% del uplift',
    factor_adopcion:  0.50,
    adoptions:       13.8,
    incremental:     99688,
    uplift_pct:      27.70,
    color:           '#fbbf24',
    colorClass:      'amber',
    volumen_proyectado: 1592898 + 99688,
  },
}

// ─── Heatmap: Segmento × Tipo de Producto (volumen USD) ───────
export const SEGMENT_PRODUCT_HEATMAP = {
  tipos: ['Tarjeta de Crédito', 'Cuenta de Ahorros', 'Cuenta Corriente', 'Préstamo'],
  segmentos: ['Corporativo', 'PYME', 'Retail'],
  // valores[tipo_idx][segmento_idx] = volumen en USD
  // CORRECCIÓN: Préstamo es en COP → ~$0 USD. Distribución proporcional a segmentos reales.
  // Corporativo=$539,476 · PYME=$602,392 · Retail=$451,030
  valores: [
    // Tarjeta de Crédito (~43% de volumen no-Préstamo por segmento):
    [231500, 258400, 193600],
    // Cuenta de Ahorros (~35% de volumen no-Préstamo por segmento):
    [188300, 210200, 157400],
    // Cuenta Corriente (~22% de volumen no-Préstamo por segmento):
    [119800, 133700, 100100],
    // Préstamo (COP → ~$0 USD):
    [30, 34, 26],
  ],
}

// ─── Top clientes por upside en escenario base ────────────────
export const TOP_UPSIDE_CLIENTS = [
  { id: 1007, vol_incremental: 3847, producto: 'Tarjeta de Crédito', prob: 0.30 },
  { id: 1028, vol_incremental: 3721, producto: 'Tarjeta de Crédito', prob: 0.30 },
  { id: 1035, vol_incremental: 3695, producto: 'Tarjeta de Crédito', prob: 0.30 },
  { id: 1062, vol_incremental: 3610, producto: 'Tarjeta de Crédito', prob: 0.30 },
  { id: 1033, vol_incremental: 3542, producto: 'Tarjeta de Crédito', prob: 0.30 },
  { id: 1008, vol_incremental: 3280, producto: 'Cuenta de Ahorros',  prob: 0.28 },
  { id: 1002, vol_incremental: 3196, producto: 'Tarjeta de Crédito', prob: 0.28 },
  { id: 1018, vol_incremental: 3041, producto: 'Cuenta Corriente',   prob: 0.27 },
  { id: 1023, vol_incremental: 2987, producto: 'Tarjeta de Crédito', prob: 0.27 },
  { id: 1024, vol_incremental: 2891, producto: 'Cuenta de Ahorros',  prob: 0.26 },
]
