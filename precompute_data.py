#!/usr/bin/env python3
"""
Script para pre-computar el JSON estático del dashboard.

Ejecuta la misma lógica que api/main.py pero guarda el resultado
como un archivo estático que Vercel puede servir directamente.

Uso:
    python precompute_data.py
"""

import sys
import json
from pathlib import Path

# Ensure project root is in path
sys.path.insert(0, str(Path(__file__).parent))

# Must set matplotlib backend BEFORE any matplotlib imports
import matplotlib
matplotlib.use("Agg")

# Now import the API compute function
from api.main import _compute_all, plt
from funciones.dominios import cargar_dominio
import pandas as pd

DATA_PATH = Path("data")
OUTPUT_PATH = Path("frontend/public/api")


def main():
    print("⏳ Cargando dominio desde CSVs...")
    dominio = cargar_dominio(
        pd.read_csv(DATA_PATH / "clientes.csv"),
        pd.read_csv(DATA_PATH / "catalogo_productos.csv"),
        pd.read_csv(DATA_PATH / "transacciones.csv"),
        strict=False,
    )
    print(f"✅ Dominio cargado: {len(dominio.clientes)} clientes, {len(dominio.transacciones)} txns")

    print("🔧 Computando todos los análisis...")
    data = _compute_all(dominio)
    plt.close("all")

    # Ensure output directory exists
    OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_PATH / "data.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"✅ Datos exportados a: {output_file} ({size_mb:.2f} MB)")
    print("   → Vercel servirá este archivo en /api/data.json")


if __name__ == "__main__":
    main()
