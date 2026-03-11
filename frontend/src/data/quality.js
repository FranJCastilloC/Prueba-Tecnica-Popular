// ─── Auditoría completa de calidad de datos ───────────────────
export const DATA_QUALITY = {
  datasets: [
    {
      name: 'transacciones.csv',
      icon: '🔄',
      rows: 500,
      columns: 8,
      description: 'Historial completo de operaciones financieras',
      checks: [
        { label: 'Valores nulos',         pass: true,  detail: '0 nulos en 4,000 celdas' },
        { label: 'Filas duplicadas',      pass: true,  detail: '0 duplicados detectados' },
        { label: 'Integridad referencial',pass: true,  detail: 'Todos los id_cliente e id_producto son válidos' },
        { label: 'Rango de fechas',       pass: true,  detail: '2023-01-01 → 2024-05-31 (17 meses)' },
        { label: 'Rango de montos',       pass: true,  detail: '$76.52 – $9,963.99 · Sin outliers extremos' },
      ],
    },
    {
      name: 'clientes.csv',
      icon: '👥',
      rows: 100,
      columns: 6,
      description: 'Perfil demográfico y segmentación de clientes',
      checks: [
        { label: 'Valores nulos',     pass: true, detail: '0 nulos' },
        { label: 'IDs duplicados',    pass: true, detail: '0 duplicados · IDs 1001–1100' },
        { label: 'Segmentos válidos', pass: true, detail: '3 segmentos: PYME, Corporativo, Retail' },
        { label: 'Países válidos',    pass: true, detail: '4 países: Chile, Argentina, México, Colombia' },
      ],
    },
    {
      name: 'catalogo_productos.csv',
      icon: '📦',
      rows: 10,
      columns: 5,
      description: 'Catálogo de productos financieros disponibles',
      checks: [
        { label: 'Valores nulos',      pass: true, detail: '0 nulos' },
        { label: 'IDs duplicados',     pass: true, detail: '0 duplicados' },
        { label: 'Tipos de producto',  pass: true, detail: '4 tipos bien definidos' },
        { label: 'Monedas soportadas', pass: true, detail: 'USD, EUR, COP — conversión automática' },
      ],
    },
  ],
  summary: {
    total_checks: 13,
    passed:        13,
    failed:         0,
    overall_score: 100,
    verdict: 'Base de datos íntegra y lista para análisis',
  },
}
