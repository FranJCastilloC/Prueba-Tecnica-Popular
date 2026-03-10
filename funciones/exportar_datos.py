"""
Exporta los datos procesados a JSON para el dashboard JS.
"""

import json
import pandas as pd
from funciones.campos import normalizar_dtypes
from funciones.graficos import preparar_datos_eda


def exportar_json(ruta_salida: str = "dashboard/data.json") -> None:
    """Genera el JSON con todos los datos necesarios para el dashboard."""
    clientes = normalizar_dtypes(pd.read_csv("data/clientes.csv"), "clientes")
    productos = normalizar_dtypes(pd.read_csv("data/catalogo_productos.csv"), "catalogo_productos")
    transacciones = normalizar_dtypes(pd.read_csv("data/transacciones.csv"), "transacciones")

    datos = preparar_datos_eda(clientes, productos, transacciones)

    tx = datos["tx_full"]

    salida = {
        "kpis": {
            "volumen_total": round(tx["monto"].sum(), 2),
            "n_transacciones": int(len(tx)),
            "n_clientes": int(tx["id_cliente"].nunique()),
            "n_productos": int(tx["id_producto"].nunique()),
            "ticket_promedio": round(tx["monto"].mean(), 2),
        },

        "pareto": {
            "clientes": datos["cliente_volumen"]
                .sort_values("volumen", ascending=False)
                .assign(pct_acum=lambda d: (d["volumen"].cumsum() / d["volumen"].sum() * 100).round(2))
                .to_dict(orient="list"),
        },

        "trimestral": datos["trimestral"].to_dict(orient="list"),

        "bubble_productos": datos["producto_agg"].to_dict(orient="list"),

        "treemap": datos["pais_agg"].round(2).to_dict(orient="list"),

        "productos_por_cliente": datos["productos_por_cliente"].value_counts().sort_index().to_dict(),

        "heatmap": {
            "tipos": datos["heatmap"].index.tolist(),
            "segmentos": datos["heatmap"].columns.tolist(),
            "valores": datos["heatmap"].round(2).values.tolist(),
        },

        "donut_segmentos": datos["segmento_agg"].round(2).to_dict(orient="list"),

        "scatter_regresion": datos["cliente_agg"].to_dict(orient="list"),

        "mensual": datos["mensual"].to_dict(orient="list"),

        "scatter_paises": datos["pais_scatter"].round(2).to_dict(orient="list"),

        "radar": {
            "segmentos": datos["radar"].index.tolist(),
            "dimensiones": datos["radar"].columns.tolist(),
            "valores": datos["radar"].round(4).values.tolist(),
        },

        "boxplot": {
            "tipo_transaccion": tx.groupby("tipo_transaccion")["monto"].apply(list).to_dict(),
            "pais": tx.groupby("pais")["monto"].apply(list).to_dict(),
            "segmento": tx.groupby("segmento")["monto"].apply(list).to_dict(),
        },

        "top_clientes": datos["cliente_volumen"]
            .nlargest(15, "volumen")
            .to_dict(orient="list"),

        "ranking_productos": datos["producto_agg"]
            .sort_values("volumen", ascending=False)
            .assign(pct=lambda d: (d["volumen"] / d["volumen"].sum() * 100).round(2))
            .to_dict(orient="list"),
    }

    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)

    print(f"Datos exportados a {ruta_salida}")


if __name__ == "__main__":
    exportar_json()
