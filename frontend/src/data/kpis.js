// ─── Core KPIs — valores reales del notebook (ide.ipynb, Cell 5) ─
// Total = suma de t.monto_usd para todas las transacciones
// Tipos de cambio: USD=1.0, EUR=1/0.86=1.1628, COP=1/3771.28=0.000265
export const KPIs = {
  volumen_total:    1592897.57,  // $1,592,897.57 USD confirmado en notebook
  n_transacciones:  500,
  n_clientes:       100,
  n_productos:      10,
  ticket_promedio:  3185.80,     // $3,185.80 USD (no $5,071 de data.json — ese estaba sin convertir)
}

// ─── Segmentos — Cell 5 output ────────────────────────────────
export const SEGMENTS = [
  { segmento: 'PYME',        volumen: 602391.98, n_clientes: 35, pct: 37.82, color: '#34d399' },
  { segmento: 'Corporativo', volumen: 539475.52, n_clientes: 33, pct: 33.87, color: '#fbbf24' },
  { segmento: 'Retail',      volumen: 451030.07, n_clientes: 32, pct: 28.32, color: '#22d3ee' },
]

// ─── Países — Cell 5 output ───────────────────────────────────
// Ticket = volumen_usd / n_txn (conteo transacciones es independiente de moneda)
export const COUNTRIES = [
  { pais: 'Argentina', volumen: 451938.90, n_clientes: 23, ticket: 3373.43, n_txn: 134, color: '#34d399' },
  { pais: 'México',    volumen: 435598.42, n_clientes: 30, ticket: 2982.87, n_txn: 146, color: '#22d3ee' },
  { pais: 'Chile',     volumen: 386897.69, n_clientes: 23, ticket: 3423.87, n_txn: 113, color: '#fbbf24' },
  { pais: 'Colombia',  volumen: 318462.55, n_clientes: 24, ticket: 2977.22, n_txn: 107, color: '#f472b6' },
]

// ─── Tipos de producto con colores ────────────────────────────
export const PRODUCT_TYPE_COLORS = {
  'Tarjeta de Crédito': '#22d3ee',
  'Cuenta Corriente':   '#fbbf24',
  'Cuenta de Ahorros':  '#34d399',
  'Préstamo':           '#f472b6',
}

// ─── Catálogo de productos — volúmenes USD reales (Cell 5 output) ─
// IMPORTANTE: Productos en COP tienen volumen USD ≈ $0 (moneda COP × 0.000265)
// Moneda USD/EUR: Producto_1, 3, 4, 5, 7, 10
// Moneda COP:     Producto_2, 6, 8, 9
export const PRODUCTS = [
  { id: 7,  nombre: 'Producto_7',  tipo: 'Cuenta Corriente',   volumen: 296594.01, n_txn: 52,  tasa: 0.16, moneda: 'EUR' },
  { id: 10, nombre: 'Producto_10', tipo: 'Tarjeta de Crédito', volumen: 287983.46, n_txn: 59,  tasa: 0.05, moneda: 'USD' },
  { id: 1,  nombre: 'Producto_1',  tipo: 'Tarjeta de Crédito', volumen: 282358.38, n_txn: 48,  tasa: 0.14, moneda: 'USD' },
  { id: 3,  nombre: 'Producto_3',  tipo: 'Cuenta de Ahorros',  volumen: 260350.82, n_txn: 51,  tasa: 0.23, moneda: 'USD' },
  { id: 4,  nombre: 'Producto_4',  tipo: 'Cuenta Corriente',   volumen: 241423.32, n_txn: 53,  tasa: 0.24, moneda: 'USD' },
  { id: 5,  nombre: 'Producto_5',  tipo: 'Tarjeta de Crédito', volumen: 223915.96, n_txn: 41,  tasa: 0.04, moneda: 'USD' },
  // COP — valor USD mínimo por tipo de cambio (1 COP = $0.000265 USD)
  { id: 6,  nombre: 'Producto_6',  tipo: 'Préstamo',           volumen:      79.52, n_txn: 57,  tasa: 0.05, moneda: 'COP' },
  { id: 9,  nombre: 'Producto_9',  tipo: 'Cuenta de Ahorros',  volumen:      72.90, n_txn: 57,  tasa: 0.14, moneda: 'COP' },
  { id: 2,  nombre: 'Producto_2',  tipo: 'Cuenta de Ahorros',  volumen:      64.96, n_txn: 45,  tasa: 0.15, moneda: 'COP' },
  { id: 8,  nombre: 'Producto_8',  tipo: 'Tarjeta de Crédito', volumen:      54.23, n_txn: 37,  tasa: 0.20, moneda: 'COP' },
]

// ─── Modelo de regresión OLS ─────────────────────────────────
export const REGRESSION = {
  r2:               0.9577,
  r2_adj:           0.9519,
  n_obs:            100,
  coef_txn:         5758.73,
  coef_ticket:      4.19,
  volumen_actual:   1592898,
  volumen_proyectado: 2108660, // +32.41% estimado
  pct_crecimiento:  32.41,
}

// ─── Highlights para tarjetas narrativas ──────────────────────
// Argentina lidera por volumen USD (no México como en data.json sin convertir)
export const HIGHLIGHTS = {
  pareto80_clients:    29,
  top_country:         'Argentina',
  top_country_volume:  451938.90,
  top_country_share:   28.37,
  top_segment:         'PYME',
  top_segment_share:   37.82,
  top_product_type:    'Tarjeta de Crédito',
  top_product_type_pct: 49.86,      // Tarjeta = 50% del volumen USD total
  avg_products_per_client: 2.76,    // (1×9 + 2×26 + 3×45 + 4×20) / 100
  best_quarter:        '2023Q3',
}
