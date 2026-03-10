"""
Punto de entrada del módulo de gráficos.

Re-exporta todo desde los submódulos para mantener compatibilidad con imports existentes:
    from funciones.graficos import grafico_1_pareto_clientes, ...

Submódulos:
    graficos_eda       — 12 gráficos EDA profesionales
    graficos_avanzado  — trayectoria de clientes y regresión multivariable
"""

from __future__ import annotations

import warnings

warnings.warn(
    "El uso de gráficos EDA desde 'funciones.graficos' está deprecado. "
    "Dichas funciones ahora viven directamente en 'ide.ipynb'.",
    DeprecationWarning,
    stacklevel=2,
)

import pandas as pd

# Re-exportaciones — graficos_eda
from funciones.graficos_eda import (  # noqa: F401
    _setup_style,
    FIG_DPI,
    COLORS,
    BUBBLE_COLORS,
    grafico_1_pareto_clientes,
    grafico_2_tendencia_trimestral,
    grafico_3_bubble_productos,
    grafico_4_treemap_geografico,
    grafico_5_histogram_productos_por_cliente,
    grafico_6_heatmap_producto_segmento,
    grafico_7_donut_segmentos,
    grafico_8_scatter_regresion,
    grafico_9_area_evolucion_mensual,
    grafico_10_scatter_paises,
    grafico_11_radar_segmentos,
    grafico_12_faceted_boxplots,
)

# Re-exportaciones — graficos_avanzado
from funciones.graficos_avanzado import (  # noqa: F401
    plot_customer_journey,
    regresion_multivariable_volumen,
)


def preparar_datos_eda(
    clientes: pd.DataFrame,
    productos: pd.DataFrame,
    transacciones: pd.DataFrame,
) -> dict:
    """
    Prepara todos los DataFrames necesarios para los 12 gráficos y el análisis avanzado.
    Retorna un dict con las estructuras listas para usar.
    """
    import numpy as np

    transacciones = transacciones.copy()
    transacciones["fecha"] = pd.to_datetime(transacciones["fecha"])

    tx_cli = transacciones.merge(
        clientes[["id_cliente", "segmento", "pais", "genero"]],
        on="id_cliente",
    )
    tx_full = tx_cli.merge(
        productos[["id_producto", "nombre_producto", "tipo_producto", "tasa_interes", "moneda"]],
        on="id_producto",
    )

    # 1. Pareto
    cliente_vol = tx_full.groupby("id_cliente").agg(volumen=("monto", "sum")).reset_index()

    # 2. Trimestral
    tx_full["trimestre"] = tx_full["fecha"].dt.to_period("Q").astype(str)
    trimestral = tx_full.groupby("trimestre").agg(
        volumen=("monto", "sum"),
        n_transacciones=("id_transaccion", "count"),
    ).reset_index()

    # 3. Bubble productos
    prod_agg = tx_full.groupby(["id_producto", "nombre_producto", "tipo_producto", "tasa_interes"]).agg(
        volumen=("monto", "sum"),
        n_transacciones=("id_transaccion", "count"),
    ).reset_index()
    prod_agg["tasa_pct"] = prod_agg["tasa_interes"] * 100

    # 4. Treemap países
    pais_agg = tx_full.groupby("pais").agg(
        volumen=("monto", "sum"),
        ticket_promedio=("monto", "mean"),
        n_transacciones=("id_transaccion", "count"),
    ).reset_index()

    # 5. Productos por cliente
    n_prod_cli = tx_full.groupby("id_cliente")["id_producto"].nunique()

    # 6. Heatmap producto × segmento
    heatmap = tx_full.pivot_table(
        values="monto",
        index="tipo_producto",
        columns="segmento",
        aggfunc="sum",
        fill_value=0,
    )

    # 7. Donut segmentos
    seg_agg = tx_full.groupby("segmento").agg(
        volumen=("monto", "sum"),
        n_clientes=("id_cliente", "nunique"),
    ).reset_index()
    seg_agg["pct"] = seg_agg["volumen"] / seg_agg["volumen"].sum() * 100

    # 8. Scatter regresión
    cli_agg = tx_full.groupby("id_cliente").agg(
        volumen=("monto", "sum"),
        n_productos=("id_producto", "nunique"),
    ).reset_index()
    cli_agg = cli_agg.merge(clientes[["id_cliente", "segmento"]], on="id_cliente")

    # 9. Mensual
    tx_full["mes"] = tx_full["fecha"].dt.to_period("M").astype(str)
    mensual = tx_full.groupby("mes")["monto"].sum().reset_index()
    mensual.columns = ["mes", "volumen"]

    # 10. Scatter países
    pais_scatter = tx_full.groupby("pais").agg(
        n_clientes=("id_cliente", "nunique"),
        ticket_promedio=("monto", "mean"),
        volumen=("monto", "sum"),
    ).reset_index()

    # 11. Radar segmentos
    seg_radar = tx_full.groupby("segmento").agg(
        Volumen=("monto", "sum"),
        Transacciones=("id_transaccion", "count"),
        Clientes=("id_cliente", "nunique"),
    )
    seg_radar["Monto promo./txn"] = seg_radar["Volumen"] / seg_radar["Transacciones"]
    prod_per_cli = tx_full.groupby(["segmento", "id_cliente"])["id_producto"].nunique().groupby("segmento").mean()
    seg_radar["Productos_cliente"] = seg_radar.index.map(prod_per_cli)
    dims_radar = ["Volumen", "Monto promo./txn", "Transacciones", "Clientes", "Productos_cliente"]
    seg_radar_norm = (seg_radar[dims_radar] - seg_radar[dims_radar].min()) / (
        seg_radar[dims_radar].max() - seg_radar[dims_radar].min() + 1e-9
    )
    seg_radar_norm.columns = ["Volumen", "Monto promo./txn", "Transacciones", "Clientes", "Productos/cliente"]

    return {
        "cliente_volumen": cliente_vol,
        "trimestral": trimestral,
        "producto_agg": prod_agg,
        "pais_agg": pais_agg,
        "productos_por_cliente": n_prod_cli,
        "heatmap": heatmap,
        "segmento_agg": seg_agg,
        "cliente_agg": cli_agg,
        "mensual": mensual,
        "pais_scatter": pais_scatter,
        "radar": seg_radar_norm,
        "tx_full": tx_full,
    }
