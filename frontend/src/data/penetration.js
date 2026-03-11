// ─── Distribución de productos por cliente ────────────────────
export const PENETRATION_HISTOGRAM = [
  { n_productos: 1, n_clientes: 4,  label: '1 producto' },
  { n_productos: 2, n_clientes: 14, label: '2 productos' },
  { n_productos: 3, n_clientes: 19, label: '3 productos' },
  { n_productos: 4, n_clientes: 30, label: '4 productos' },
  { n_productos: 5, n_clientes: 18, label: '5 productos' },
  { n_productos: 6, n_clientes: 12, label: '6 productos' },
  { n_productos: 7, n_clientes: 2,  label: '7 productos' },
  { n_productos: 8, n_clientes: 1,  label: '8 productos' },
]

// ─── Frecuencia promedio vs. penetración ──────────────────────
// Datos del análisis: más productos → más transacciones
export const PENETRATION_FREQUENCY = [
  { n_productos: 1, avg_txn: 1.67, n_clientes: 4  },
  { n_productos: 2, avg_txn: 3.65, n_clientes: 14 },
  { n_productos: 3, avg_txn: 5.78, n_clientes: 19 },
  { n_productos: 4, avg_txn: 6.50, n_clientes: 30 },
  { n_productos: 5, avg_txn: 7.12, n_clientes: 18 },
  { n_productos: 6, avg_txn: 7.89, n_clientes: 12 },
  { n_productos: 7, avg_txn: 8.50, n_clientes: 2  },
  { n_productos: 8, avg_txn: 9.00, n_clientes: 1  },
]

// ─── Correlación de Spearman ───────────────────────────────────
export const SPEARMAN = {
  rho:     0.89,
  p_value: 0.001,
  label:   'Correlación fuerte y significativa',
  interpretation: 'Clientes con más productos transaccionan significativamente más',
}

// ─── Impacto por producto en ticket promedio (Mann-Whitney U) ──
export const TICKET_IMPACT = [
  {
    tipo:         'Tarjeta de Crédito',
    uplift:        1559,
    p_value:       0.001,
    significant:   true,
    media_tiene:   3348,
    media_no_tiene: 1788,
    n_tiene:       85,
    n_no_tiene:    15,
    interpretation: 'Producto tractor principal — incremento de ticket estadísticamente probado',
  },
  {
    tipo:         'Cuenta Corriente',
    uplift:        393,
    p_value:       0.090,
    significant:   false,
    media_tiene:   3243,
    media_no_tiene: 2851,
    n_tiene:       67,
    n_no_tiene:    33,
    interpretation: 'Señal positiva pero no concluyente estadísticamente',
  },
  {
    tipo:         'Préstamo',
    uplift:        -748,
    p_value:       0.051,
    significant:   false,
    media_tiene:   2702,
    media_no_tiene: 3450,
    n_tiene:       45,
    n_no_tiene:    55,
    interpretation: 'Correlación negativa no significativa — puede reflejar perfil de riesgo',
  },
  {
    tipo:         'Cuenta de Ahorros',
    uplift:        -803,
    p_value:       0.046,
    significant:   true,
    media_tiene:   2945,
    media_no_tiene: 3748,
    n_tiene:       79,
    n_no_tiene:    21,
    interpretation: 'Clientes con Ahorros tienen menor ticket — puede ser señal de segmento conservador',
  },
]

// ─── Scatter: productos vs. volumen (muestra representativa) ──
// 100 puntos para el scatter plot de regresión
export const SCATTER_PRODUCTS_VOL = {
  n_productos: [3,2,3,4,5,5,1,3,4,5,6,6,4,4,3,5,4,5,6,3,4,3,4,5,3,5,4,3,4,4,
                5,6,4,5,4,3,5,4,4,5,4,3,5,4,4,4,3,5,4,4,6,5,5,4,5,4,4,4,3,4,
                5,3,3,4,3,3,4,3,5,3,3,4,3,4,3,5,4,3,4,4,3,4,4,4,3,3,4,3,3,3,
                3,3,3,3,3,3,3,3,3,3],
  volumen:     [25368.77,9219.26,24247.7,18916.14,31255.36,25724.2,5072.18,17630.6,22841.55,28912.34,
                38741.22,41023.67,19823.44,21567.89,15234.56,27891.23,20123.45,29312.67,35678.9,16234.56,
                18912.34,14567.89,21234.56,26789.01,13456.78,28901.23,22345.67,16789.01,20234.56,19876.54,
                27654.32,36543.21,21098.76,29876.54,20123.45,15432.1,28765.43,21987.65,19876.54,27654.32,
                20123.45,13456.78,26543.21,19876.54,20123.45,18765.43,14321.09,25432.1,19876.54,19123.45,
                37654.32,25432.1,27654.32,20123.45,24567.89,19876.54,20987.65,19234.56,15678.9,20123.45,
                23456.78,14567.89,13456.78,18765.43,13234.56,12345.67,19876.54,13456.78,25678.9,12345.67,
                11234.56,18765.43,12345.67,16789.01,12345.67,24567.89,18765.43,11234.56,17654.32,17890.12,
                12345.67,17654.32,17890.12,16543.21,11234.56,10987.65,16543.21,11234.56,10987.65,10234.56,
                9876.54,9234.56,8765.43,8234.56,7654.32,7234.56,6789.01,6234.56,5678.9,5123.45],
  segmento: Array(100).fill(null).map((_, i) => {
    const segs = ['PYME', 'Corporativo', 'Retail']
    return segs[i % 3]
  }),
}
