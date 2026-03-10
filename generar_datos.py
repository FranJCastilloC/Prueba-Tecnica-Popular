#!/usr/bin/env python3
"""
generar_datos.py — Pipeline de producción del dashboard.

Lee los CSVs de data/, calcula todos los análisis (EDA, regresión,
estrategia, cross-sell, journey) y escribe dashboard/data.json.
No requiere el notebook.

Uso:
    python generar_datos.py
    python generar_datos.py --data data/ --output dashboard/data.json
"""

import argparse
import sys
from pathlib import Path

# Asegurar que el directorio del proyecto esté en el path
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd

from funciones.campos import normalizar_dtypes
from funciones.graficos import preparar_datos_eda
from funciones.graficos_avanzado import regresion_multivariable_volumen
from funciones.exportar import exportar_dashboard_data


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genera data.json para el dashboard sin depender del notebook."
    )
    parser.add_argument(
        "--data",
        default="data",
        help="Directorio que contiene clientes.csv, catalogo_productos.csv y transacciones.csv",
    )
    parser.add_argument(
        "--output",
        default="dashboard/data.json",
        help="Ruta de salida para data.json",
    )
    args = parser.parse_args()

    data_dir = Path(args.data)

    # ── 1. Leer CSVs ──────────────────────────────────────────────────────────
    print(f"[1/4] Leyendo datos desde '{data_dir}/'...")
    clientes      = pd.read_csv(data_dir / "clientes.csv")
    productos     = pd.read_csv(data_dir / "catalogo_productos.csv")
    transacciones = pd.read_csv(data_dir / "transacciones.csv")

    # Normalizar tipos (convierte fechas, numéricos, etc.)
    clientes      = normalizar_dtypes(clientes,      "clientes")
    productos     = normalizar_dtypes(productos,     "productos")
    transacciones = normalizar_dtypes(transacciones, "transacciones")

    print(f"     Clientes: {len(clientes)} | Productos: {len(productos)} | Transacciones: {len(transacciones)}")

    # ── 2. Preparar datos EDA ─────────────────────────────────────────────────
    print("[2/4] Preparando datos EDA...")
    datos = preparar_datos_eda(clientes, productos, transacciones)

    # ── 3. Modelo OLS ─────────────────────────────────────────────────────────
    print("[3/4] Entrenando modelo OLS...")
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        resultado = regresion_multivariable_volumen(datos["tx_full"])
    print(f"     R² = {resultado['R_squared']:.4f}")

    # ── 4. Exportar data.json ─────────────────────────────────────────────────
    print(f"[4/4] Exportando '{args.output}'...")
    exportar_dashboard_data(datos, resultado, output_path=args.output)

    print("\n✓ Dashboard listo.")


if __name__ == "__main__":
    main()
