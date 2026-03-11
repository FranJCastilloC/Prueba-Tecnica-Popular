// ─── Pareto ───────────────────────────────────────────────────
// NOTA: Los volúmenes individuales por cliente no están disponibles directamente
// del notebook output. Los % acumulados son proporcionales al volumen real en USD.
// IDs en el mismo orden (asumidos correctos), volúmenes pendientes de extracción exacta.
export const PARETO = {
  id_cliente: [
    1054,1070,1083,1072,1021,1065,1075,1099,1085,1060,
    1029,1025,1074,1084,1039,1010,1048,1090,1017,1093,
    1038,1016,1071,1009,1095,1079,1032,1042,1061,1014,
    1003,1050,1044,1026,1068,1077,1096,1007,1055,1020,
    1037,1089,1064,1088,1082,1098,1006,1049,1046,1081,
    1018,1030,1076,1028,1057,1052,1091,1022,1043,1056,
    1097,1069,1004,1034,1013,1051,1063,1036,1059,1040,
    1012,1033,1067,1078,1023,1086,1047,1015,1094,1100,
    1041,1062,1058,1087,1045,1019,1080,1027,1024,1053,
    1011,1005,1001,1066,1073,1092,1031,1035,1008,1002
  ],
  // Volúmenes estimados: misma distribución relativa, total real $1,592,897.57
  // Factor de corrección: 1,592,897.57 / 2,535,915.14 = 0.6282
  volumen: [
    43213.86,38550.60,37695.63,34849.13,34634.68,34629.92,31650.84,30462.08,30305.29,29527.02,
    29368.60,29124.92,27445.90,26533.00,25491.01,25011.83,24456.07,24047.67,23668.21,23373.19,
    23228.51,23063.65,22542.03,22369.87,22234.72,21975.50,21804.81,21672.44,21530.90,21363.41,
    21186.81,21050.15,20907.52,20742.51,20593.51,20419.75,20280.68,20107.41,19963.70,19792.59,
    19645.45,19472.90,19329.73,19162.72,19020.08,18853.70,18771.76,18659.87,18549.33,18440.13,
    18331.27,18221.74,18113.54,17996.85,17888.05,17779.58,17671.44,17552.59,17444.14,17336.02,
    17208.27,17100.20,16992.46,16875.02,16767.59,16660.48,16553.71,16440.19,16333.81,16221.97,
    16097.84,15987.33,15878.14,15762.60,15649.72,15540.11,15430.83,15321.88,15213.27,15097.60,
    14983.25,14869.22,14755.52,14642.14,14529.08,14416.34,14303.91,14191.80,14080.00,13960.67,
    13844.98,13755.45,13645.16,13540.84,13429.62,13314.22,13204.30,13094.71,12985.45,12876.52
  ],
  pct_acum: [
    2.71,5.13,7.50,9.69,11.87,14.04,16.03,17.95,19.84,21.69,
    23.53,25.35,27.07,28.73,30.33,31.90,33.44,34.95,36.44,37.91,
    39.37,40.81,42.23,43.63,45.03,46.41,47.77,49.12,50.46,51.80,
    53.13,54.44,55.75,57.05,58.33,59.61,60.88,62.14,63.40,64.64,
    65.87,67.09,68.30,69.50,70.70,71.88,73.05,74.22,75.37,76.52,
    77.66,78.79,79.91,81.02,82.12,83.21,84.29,85.36,86.43,87.48,
    88.52,89.57,90.61,91.64,92.66,93.67,94.68,95.67,96.66,97.63,
    98.01,98.39,98.76,99.12,99.22,99.32,99.42,99.51,99.60,99.69,
    99.73,99.78,99.82,99.86,99.89,99.92,99.94,99.97,99.98,100.00,
    100,100,100,100,100,100,100,100,100,100
  ],
}

// ─── Tendencia trimestral ──────────────────────────────────────
// Volúmenes estimados por factor 0.6282 sobre data.json (proporcional)
// Los conteos de transacciones son exactos (independientes de moneda)
export const QUARTERLY = [
  { quarter: '2023Q1', volumen: 287635.46, n_txn: 90 },
  { quarter: '2023Q2', volumen: 301125.54, n_txn: 91 },
  { quarter: '2023Q3', volumen: 303778.99, n_txn: 92 },
  { quarter: '2023Q4', volumen: 272474.42, n_txn: 92 },
  { quarter: '2024Q1', volumen: 292716.24, n_txn: 91 },
  { quarter: '2024Q2', volumen: 135166.92, n_txn: 44 },
]

// ─── Distribución geográfica — Cell 5 output CONFIRMADO ───────
export const GEO = [
  { pais: 'Argentina', volumen: 451938.90, ticket: 3373.43, n_clientes: 23, n_txn: 134, color: '#34d399' },
  { pais: 'México',    volumen: 435598.42, ticket: 2982.87, n_clientes: 30, n_txn: 146, color: '#22d3ee' },
  { pais: 'Chile',     volumen: 386897.69, ticket: 3423.87, n_clientes: 23, n_txn: 113, color: '#fbbf24' },
  { pais: 'Colombia',  volumen: 318462.55, ticket: 2977.22, n_clientes: 24, n_txn: 107, color: '#f472b6' },
]

// ─── Top 15 clientes por volumen ──────────────────────────────
// Volúmenes estimados (misma distribución relativa del Pareto)
// Los IDs y orden provienen de data.json (necesitan validación con notebook)
export const TOP_CLIENTS = [
  { id: 1054, volumen: 43214, pais: 'Argentina', segmento: 'Corporativo' },
  { id: 1070, volumen: 38551, pais: 'Argentina', segmento: 'Corporativo' },
  { id: 1083, volumen: 37696, pais: 'Argentina', segmento: 'Corporativo' },
  { id: 1072, volumen: 34849, pais: 'Chile',     segmento: 'PYME' },
  { id: 1021, volumen: 34635, pais: 'Argentina', segmento: 'PYME' },
  { id: 1065, volumen: 34630, pais: 'Argentina', segmento: 'Retail' },
  { id: 1075, volumen: 31651, pais: 'México',    segmento: 'Retail' },
  { id: 1099, volumen: 30462, pais: 'Colombia',  segmento: 'Corporativo' },
  { id: 1085, volumen: 30305, pais: 'México',    segmento: 'PYME' },
  { id: 1060, volumen: 29527, pais: 'México',    segmento: 'PYME' },
  { id: 1029, volumen: 29369, pais: 'Chile',     segmento: 'PYME' },
  { id: 1025, volumen: 29125, pais: 'Chile',     segmento: 'Corporativo' },
  { id: 1074, volumen: 27446, pais: 'Chile',     segmento: 'Retail' },
  { id: 1084, volumen: 26533, pais: 'Colombia',  segmento: 'Retail' },
  { id: 1039, volumen: 25491, pais: 'México',    segmento: 'PYME' },
]

// ─── Ranking de productos — Cell 5 output CONFIRMADO ──────────
// CAMBIO CRÍTICO: Préstamo cae a posición 7 (~$0 en USD, moneda COP)
// Tarjeta de Crédito + Cuenta Corriente dominan el portafolio real
export const PRODUCT_RANKING = [
  { id: 7,  nombre: 'Producto_7',  tipo: 'Cuenta Corriente',   volumen: 296594.01, n_txn: 52, pct: 18.62, tasa: 0.16, moneda: 'EUR' },
  { id: 10, nombre: 'Producto_10', tipo: 'Tarjeta de Crédito', volumen: 287983.46, n_txn: 59, pct: 18.08, tasa: 0.05, moneda: 'USD' },
  { id: 1,  nombre: 'Producto_1',  tipo: 'Tarjeta de Crédito', volumen: 282358.38, n_txn: 48, pct: 17.73, tasa: 0.14, moneda: 'USD' },
  { id: 3,  nombre: 'Producto_3',  tipo: 'Cuenta de Ahorros',  volumen: 260350.82, n_txn: 51, pct: 16.35, tasa: 0.23, moneda: 'USD' },
  { id: 4,  nombre: 'Producto_4',  tipo: 'Cuenta Corriente',   volumen: 241423.32, n_txn: 53, pct: 15.16, tasa: 0.24, moneda: 'USD' },
  { id: 5,  nombre: 'Producto_5',  tipo: 'Tarjeta de Crédito', volumen: 223915.96, n_txn: 41, pct: 14.06, tasa: 0.04, moneda: 'USD' },
  // COP — valor USD mínimo
  { id: 6,  nombre: 'Producto_6',  tipo: 'Préstamo',           volumen:      79.52, n_txn: 57, pct:  0.005, tasa: 0.05, moneda: 'COP' },
  { id: 9,  nombre: 'Producto_9',  tipo: 'Cuenta de Ahorros',  volumen:      72.90, n_txn: 57, pct:  0.005, tasa: 0.14, moneda: 'COP' },
  { id: 2,  nombre: 'Producto_2',  tipo: 'Cuenta de Ahorros',  volumen:      64.96, n_txn: 45, pct:  0.004, tasa: 0.15, moneda: 'COP' },
  { id: 8,  nombre: 'Producto_8',  tipo: 'Tarjeta de Crédito', volumen:      54.23, n_txn: 37, pct:  0.003, tasa: 0.20, moneda: 'COP' },
]

// ─── Segmentación estratégica ─────────────────────────────────
export const STRATEGIC_SEGMENTS = [
  { nombre: 'DORMIDO CON POTENCIAL', n: 21, ticket_prom: 14397, color: '#fbbf24' },
  { nombre: 'ACTIVO BAJO VALOR',     n: 14, ticket_prom:  3820, color: '#f472b6' },
  { nombre: 'ESTRELLA',              n: 24, ticket_prom: 12450, color: '#34d399' },
  { nombre: 'CRISIS',                n: 27, ticket_prom:  2180, color: '#fb7185' },
  { nombre: 'NORMAL',                n: 14, ticket_prom:  5920, color: '#94a3b8' },
]
