"""
EDA: 12 gráficos profesionales para análisis de transacciones financieras.

Cada función recibe DataFrames preparados y retorna el axes modificado.
Dependencias: matplotlib, seaborn, pandas, numpy, scipy, squarify
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

try:
    import squarify
except ImportError:
    squarify = None

# Configuración global compartida
FIG_DPI = 100
COLORS = sns.color_palette("husl", 10)
BUBBLE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"]


def _setup_style(ax: plt.Axes, title: str) -> None:
    """Aplica estilo consistente a un axes."""
    ax.set_title(title, fontsize=12, fontweight="bold")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def grafico_1_pareto_clientes(
    df_cliente_volumen: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Curva de Pareto: concentración de clientes por volumen.
    Responde: ¿Cuántos clientes generan 80% del volumen?
    """
    ax = ax or plt.gca()
    df = df_cliente_volumen.sort_values("volumen", ascending=False).reset_index(drop=True)
    df["pct_acum"] = df["volumen"].cumsum() / df["volumen"].sum() * 100
    df["n_cliente"] = range(1, len(df) + 1)

    ax.fill_between(df["n_cliente"], df["pct_acum"], alpha=0.3)
    ax.plot(df["n_cliente"], df["pct_acum"], linewidth=2)
    ax.axhline(80, color="red", linestyle="--", alpha=0.7, label="80%")
    ax.set_xlabel("Clientes (ordenados por volumen)")
    ax.set_ylabel("% acumulado del volumen")
    ax.legend()
    _setup_style(ax, "1. Pareto — Concentración de clientes")
    return ax


def grafico_2_tendencia_trimestral(
    df_trimestral: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Dual axis: volumen (línea) y # transacciones (barras) por trimestre.
    Responde: ¿Cuál es la tendencia? ¿Hay caída?
    """
    ax = ax or plt.gca()
    ax2 = ax.twinx()

    x = range(len(df_trimestral))
    ax2.bar(x, df_trimestral["n_transacciones"], alpha=0.4, label="# Transacciones")
    ax.plot(x, df_trimestral["volumen"], "o-", linewidth=2, label="Volumen")

    ax.set_xticks(x)
    ax.set_xticklabels(df_trimestral["trimestre"], rotation=45, ha="right")
    ax.set_ylabel("Volumen")
    ax2.set_ylabel("# Transacciones")
    ax.legend(loc="upper left")
    ax2.legend(loc="upper right")
    _setup_style(ax, "2. Tendencia trimestral")
    return ax


def grafico_3_bubble_productos(
    df_producto: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Bubble: tasa vs volumen, tamaño = # transacciones, color = tipo de producto.
    Responde: ¿Qué productos son más rentables?
    """
    ax = ax or plt.gca()
    tipos = df_producto["tipo_producto"].str.strip().unique()
    pal = {t: BUBBLE_COLORS[i % len(BUBBLE_COLORS)] for i, t in enumerate(tipos)}

    for tipo in tipos:
        sub = df_producto[df_producto["tipo_producto"].str.strip() == tipo]
        ax.scatter(
            sub["tasa_pct"],
            sub["volumen"],
            s=sub["n_transacciones"] * 3,
            c=pal.get(tipo, "gray"),
            alpha=0.7,
            edgecolors="white",
            linewidths=1,
            label=tipo,
        )

    for _, row in df_producto.iterrows():
        ax.annotate(
            row["nombre_producto"],
            (row["tasa_pct"], row["volumen"]),
            fontsize=8,
            ha="center",
            va="bottom",
        )

    ax.set_xlabel("Tasa de interés (%)")
    ax.set_ylabel("Volumen")
    ax.legend(loc="best", fontsize=8)
    _setup_style(ax, "3. Bubble — Rentabilidad por producto")
    return ax


def grafico_4_treemap_geografico(
    df_pais: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Treemap: tamaño = volumen, color = monto promedio por transacción.
    Responde: ¿Dónde hay participación? ¿Oportunidades?
    """
    ax = ax or plt.gca()
    if squarify is None:
        ax.text(0.5, 0.5, "Instala squarify: pip install squarify", ha="center", va="center")
        return ax

    df = df_pais.copy()
    df["label"] = df.apply(
        lambda r: f"{r['pais']}\n{r['volumen']:,.0f}\nTxn: {r['n_transacciones']:.0f}  |  Monto promo./txn: {r['ticket_promedio']:,.0f}",
        axis=1,
    )
    sizes = df["volumen"].tolist()
    colors = plt.cm.Blues(np.linspace(0.4, 0.9, len(df)))
    squarify.plot(sizes=sizes, label=df["label"].tolist(), color=colors, ax=ax)
    ax.axis("off")
    _setup_style(ax, "4. Treemap — Distribución geográfica")
    return ax


def grafico_5_histogram_productos_por_cliente(
    productos_por_cliente: pd.Series,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Histogram + KDE + media/mediana.
    Responde: ¿Hay oportunidad de cross-sell?
    """
    ax = ax or plt.gca()
    sns.histplot(productos_por_cliente, kde=True, ax=ax, bins=range(1, 10))
    media = productos_por_cliente.mean()
    mediana = productos_por_cliente.median()
    ax.axvline(media, color="red", linestyle="--", label=f"Media: {media:.1f}")
    ax.axvline(mediana, color="green", linestyle=":", label=f"Mediana: {mediana:.0f}")
    ax.set_xlabel("# productos por cliente")
    ax.set_ylabel("Frecuencia")
    ax.legend()
    _setup_style(ax, "5. Histogram — Productos por cliente")
    return ax


def grafico_6_heatmap_producto_segmento(
    df_heatmap: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Heatmap: Producto × Segmento, valores = Volumen USD.
    Responde: ¿Qué productos funcionan mejor en cada segmento?
    """
    ax = ax or plt.gca()
    sns.heatmap(
        df_heatmap,
        annot=True,
        fmt=".0f",
        cmap="YlOrRd",
        ax=ax,
        cbar_kws={"label": "Volumen"},
    )
    ax.set_xlabel("Segmento")
    ax.set_ylabel("Tipo producto")
    _setup_style(ax, "6. Heatmap — Producto × Segmento")
    return ax


def grafico_7_donut_segmentos(
    df_segmento: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Donut: composición por segmento (%, monto, # clientes).
    Responde: ¿Cómo se distribuye?
    """
    ax = ax or plt.gca()
    sizes = df_segmento["volumen"].values
    labels = [
        f"{row['segmento']}\n{row['pct']:.1f}% | {row['volumen']:,.0f}\n{int(row['n_clientes'])} clientes"
        for _, row in df_segmento.iterrows()
    ]
    ax.pie(sizes, labels=labels, autopct=None, startangle=90)
    ax.add_patch(plt.Circle((0, 0), 0.5, fc="white"))
    _setup_style(ax, "7. Donut — Composición por segmento")
    return ax


def grafico_8_scatter_regresion(
    df_cliente: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Scatter: # productos vs volumen, color = segmento, línea regresión + R².
    Responde: ¿Correlación entre productos y volumen?
    """
    ax = ax or plt.gca()
    sns.scatterplot(
        data=df_cliente,
        x="n_productos",
        y="volumen",
        hue="segmento",
        ax=ax,
        alpha=0.8,
    )
    x = df_cliente["n_productos"].values
    y = df_cliente["volumen"].values
    slope, intercept, r, p, se = stats.linregress(x, y)
    x_line = np.linspace(x.min(), x.max(), 100)
    ax.plot(x_line, slope * x_line + intercept, "k--", linewidth=2, label=f"R² = {r**2:.3f}")
    ax.legend()
    ax.set_xlabel("# productos por cliente")
    ax.set_ylabel("Volumen cliente")
    _setup_style(ax, "8. Scatter + Regresión — Productos vs Volumen")
    return ax


def grafico_9_area_evolucion_mensual(
    df_mensual: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Area chart: volumen mensual + media móvil 3 meses.
    Responde: ¿Hay patrones mensuales?
    """
    ax = ax or plt.gca()
    df = df_mensual.copy()
    df["ma3"] = df["volumen"].rolling(3, min_periods=1).mean()
    ax.fill_between(range(len(df)), df["volumen"], alpha=0.4)
    ax.plot(range(len(df)), df["ma3"], "k-", linewidth=2, label="MA 3 meses")
    ax.set_xticks(range(len(df)))
    ax.set_xticklabels(df["mes"], rotation=45, ha="right")
    ax.set_ylabel("Volumen")
    ax.legend()
    _setup_style(ax, "9. Area — Evolución mensual")
    return ax


def grafico_10_scatter_paises(
    df_pais: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Scatter: # clientes vs monto promedio por transacción, tamaño = volumen.
    Responde: ¿Dónde hay potencial?
    """
    ax = ax or plt.gca()
    scale = df_pais["volumen"].max() / 500
    for _, row in df_pais.iterrows():
        ax.scatter(
            row["n_clientes"],
            row["ticket_promedio"],
            s=row["volumen"] / scale,
            alpha=0.6,
            edgecolors="black",
            linewidths=0.5,
        )
        ax.annotate(row["pais"], (row["n_clientes"], row["ticket_promedio"]), fontsize=10)
    ax.set_xlabel("# clientes")
    ax.set_ylabel("Monto promedio por transacción")
    _setup_style(ax, "10. Scatter — Países (eficiencia)")
    return ax


def grafico_11_radar_segmentos(
    df_radar: pd.DataFrame,
    ax: plt.Axes | None = None,
) -> plt.Axes:
    """
    Radar: 5 dimensiones por segmento.
    Responde: ¿En qué difieren los segmentos?
    """
    dims = ["Volumen", "Monto promo./txn", "Transacciones", "Clientes", "Productos/cliente"]
    n_dims = len(dims)
    angles = np.linspace(0, 2 * np.pi, n_dims, endpoint=False).tolist()
    angles += angles[:1]

    if ax is None:
        _, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))

    for i, (seg, row) in enumerate(df_radar.iterrows()):
        vals = [row.get(d, 0) for d in dims]
        vals += vals[:1]
        ax.plot(angles, vals, "o-", linewidth=2, label=str(seg))
        ax.fill(angles, vals, alpha=0.15)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(dims)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1))
    ax.set_title("11. Radar — Segmentos (5 dimensiones)", fontsize=12, fontweight="bold", pad=20)
    return ax


def grafico_12_faceted_boxplots(
    df: pd.DataFrame,
    ax1: plt.Axes | None = None,
    ax2: plt.Axes | None = None,
    ax3: plt.Axes | None = None,
) -> tuple[plt.Axes, plt.Axes, plt.Axes]:
    """
    3 boxplots: monto por tipo_txn, país, segmento.
    Responde: ¿Hay outliers o patrones?
    """
    if ax1 is None:
        fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(14, 5))
    else:
        fig = plt.gcf()

    sns.boxplot(data=df, x="tipo_transaccion", y="monto", ax=ax1)
    ax1.tick_params(axis="x", rotation=45)
    _setup_style(ax1, "Por tipo transacción")

    sns.boxplot(data=df, x="pais", y="monto", ax=ax2)
    _setup_style(ax2, "Por país")

    sns.boxplot(data=df, x="segmento", y="monto", ax=ax3)
    _setup_style(ax3, "Por segmento")

    fig.suptitle("12. Faceted Boxplots — Anomalías", fontsize=14, fontweight="bold", y=1.02)
    return ax1, ax2, ax3
