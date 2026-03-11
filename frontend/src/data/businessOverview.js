// ─── Pareto: top 30 clientes (80% del negocio) ────────────────
// Nota: solo se muestran los primeros 30 para el gráfico de concentración
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
  volumen: [
    68769.29,61372.05,60018.81,55487.64,55151.79,55143.61,50398.95,48499.22,48251.81,47014.58,
    46747.18,46367.81,43706.85,42249.70,40589.10,39822.40,38941.62,38307.88,37689.42,37215.30,
    36984.17,36721.55,35890.24,35612.87,35421.64,34987.21,34712.90,34501.38,34289.65,34012.44,
    33745.82,33512.67,33287.41,33012.88,32789.45,32512.34,32287.12,32012.67,31789.34,31512.89,
    31287.56,31012.23,30789.90,30512.57,30287.24,30012.91,29889.58,29712.25,29534.92,29357.59,
    29180.26,29002.93,28825.60,28648.27,28470.94,28293.61,28116.28,27938.95,27761.62,27584.29,
    27406.96,27229.63,27052.30,26874.97,26697.64,26520.31,26342.98,26165.65,25988.32,25810.99,
    25633.66,25456.33,25279.00,25101.67,24924.34,24747.01,24569.68,24392.35,24215.02,24037.69,
    23860.36,23683.03,23505.70,23328.37,23151.04,22973.71,22796.38,22619.05,22441.72,22264.39,
    22087.06,21909.73,21732.40,21555.07,21377.74,21200.41,21023.08,20845.75,20668.42,20491.09
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
export const QUARTERLY = [
  { quarter: '2023Q1', volumen: 457849.62,  n_txn: 90 },
  { quarter: '2023Q2', volumen: 479370.00,  n_txn: 91 },
  { quarter: '2023Q3', volumen: 483591.61,  n_txn: 92 },
  { quarter: '2023Q4', volumen: 433759.65,  n_txn: 92 },
  { quarter: '2024Q1', volumen: 466016.90,  n_txn: 91 },
  { quarter: '2024Q2', volumen: 215327.36,  n_txn: 44 },
]

// ─── Distribución geográfica ───────────────────────────────────
export const GEO = [
  { pais: 'México',    volumen: 734726.09, ticket: 5032.37, n_clientes: 30, n_txn: 146, color: '#22d3ee' },
  { pais: 'Argentina', volumen: 696956.47, ticket: 5201.17, n_clientes: 23, n_txn: 134, color: '#34d399' },
  { pais: 'Chile',     volumen: 575815.64, ticket: 5095.71, n_clientes: 23, n_txn: 113, color: '#fbbf24' },
  { pais: 'Colombia',  volumen: 528416.94, ticket: 4938.48, n_clientes: 24, n_txn: 107, color: '#f472b6' },
]

// ─── Top 15 clientes por volumen ──────────────────────────────
export const TOP_CLIENTS = [
  { id: 1054, volumen: 68769.29, pais: 'Argentina', segmento: 'Corporativo' },
  { id: 1070, volumen: 61372.05, pais: 'Argentina', segmento: 'Corporativo' },
  { id: 1083, volumen: 60018.81, pais: 'Argentina', segmento: 'Corporativo' },
  { id: 1072, volumen: 55487.64, pais: 'Chile',     segmento: 'PYME' },
  { id: 1021, volumen: 55151.79, pais: 'Argentina', segmento: 'PYME' },
  { id: 1065, volumen: 55143.61, pais: 'Argentina', segmento: 'Retail' },
  { id: 1075, volumen: 50398.95, pais: 'México',    segmento: 'Retail' },
  { id: 1099, volumen: 48499.22, pais: 'Colombia',  segmento: 'Corporativo' },
  { id: 1085, volumen: 48251.81, pais: 'México',    segmento: 'PYME' },
  { id: 1060, volumen: 47014.58, pais: 'México',    segmento: 'PYME' },
  { id: 1029, volumen: 46747.18, pais: 'Chile',     segmento: 'PYME' },
  { id: 1025, volumen: 46367.81, pais: 'Chile',     segmento: 'Corporativo' },
  { id: 1074, volumen: 43706.85, pais: 'Chile',     segmento: 'Retail' },
  { id: 1084, volumen: 42249.70, pais: 'Colombia',  segmento: 'Retail' },
  { id: 1039, volumen: 40589.10, pais: 'México',    segmento: 'PYME' },
]

// ─── Ranking de productos ──────────────────────────────────────
export const PRODUCT_RANKING = [
  { id: 6,  nombre: 'Producto_6',  tipo: 'Préstamo',           volumen: 299905.12, n_txn: 57, pct: 11.83, tasa: 0.05 },
  { id: 10, nombre: 'Producto_10', tipo: 'Tarjeta de Crédito', volumen: 287983.46, n_txn: 59, pct: 11.36, tasa: 0.05 },
  { id: 9,  nombre: 'Producto_9',  tipo: 'Cuenta de Ahorros',  volumen: 274923.82, n_txn: 57, pct: 10.84, tasa: 0.14 },
  { id: 3,  nombre: 'Producto_3',  tipo: 'Cuenta de Ahorros',  volumen: 260350.82, n_txn: 51, pct: 10.27, tasa: 0.23 },
  { id: 7,  nombre: 'Producto_7',  tipo: 'Cuenta Corriente',   volumen: 255070.85, n_txn: 52, pct: 10.06, tasa: 0.16 },
  { id: 2,  nombre: 'Producto_2',  tipo: 'Cuenta de Ahorros',  volumen: 244992.29, n_txn: 45, pct: 9.66,  tasa: 0.15 },
  { id: 1,  nombre: 'Producto_1',  tipo: 'Tarjeta de Crédito', volumen: 242828.21, n_txn: 48, pct: 9.58,  tasa: 0.14 },
  { id: 4,  nombre: 'Producto_4',  tipo: 'Cuenta Corriente',   volumen: 241423.32, n_txn: 53, pct: 9.52,  tasa: 0.24 },
  { id: 5,  nombre: 'Producto_5',  tipo: 'Tarjeta de Crédito', volumen: 223915.96, n_txn: 41, pct: 8.83,  tasa: 0.04 },
  { id: 8,  nombre: 'Producto_8',  tipo: 'Tarjeta de Crédito', volumen: 204521.29, n_txn: 37, pct: 8.06,  tasa: 0.20 },
]

// ─── Segmentación 5 clústeres estratégicos ────────────────────
export const STRATEGIC_SEGMENTS = [
  { nombre: 'DORMIDO CON POTENCIAL', n: 21, ticket_prom: 14397, color: '#fbbf24' },
  { nombre: 'ACTIVO BAJO VALOR',     n: 14, ticket_prom:  3820, color: '#f472b6' },
  { nombre: 'ESTRELLA',              n: 24, ticket_prom: 12450, color: '#34d399' },
  { nombre: 'CRISIS',                n: 27, ticket_prom:  2180, color: '#fb7185' },
  { nombre: 'NORMAL',                n: 14, ticket_prom:  5920, color: '#94a3b8' },
]
