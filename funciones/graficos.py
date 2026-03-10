"""
EDA: 12 gráficos profesionales para análisis de transacciones financieras.

Cada función recibe DataFrames preparados y retorna/ muestra el gráfico.
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

# Configuración global
FIG_DPI = 100
COLORS = sns.color_palette("husl", 10)


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


# Paleta explícita para bubble: colores claros y distinguibles (ninguno oscuro/negro)
BUBBLE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"]


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


# =========================================================
# DASHBOARDS
# =========================================================


def dashboard_overview(datos: dict) -> None:
    """Dashboard 1: KPIs + Pareto + Tendencia + Treemap + Top Clientes."""
    fig = plt.figure(figsize=(16, 12))
    gs = fig.add_gridspec(3, 3, hspace=0.35, wspace=0.3)

    # KPIs
    ax_kpi = fig.add_subplot(gs[0, :])
    ax_kpi.axis("off")
    vol_total = datos["tx_full"]["monto"].sum()
    n_tx = len(datos["tx_full"])
    n_cli = datos["tx_full"]["id_cliente"].nunique()
    ticket = vol_total / n_tx
    ax_kpi.text(0.1, 0.5, f"Volumen total: {vol_total:,.0f}  |  Transacciones: {n_tx}  |  Clientes: {n_cli}  |  Monto promo./txn: {ticket:,.0f}", fontsize=14)

    grafico_1_pareto_clientes(datos["cliente_volumen"], fig.add_subplot(gs[1, 0]))
    grafico_2_tendencia_trimestral(datos["trimestral"], fig.add_subplot(gs[1, 1]))
    grafico_4_treemap_geografico(datos["pais_agg"], fig.add_subplot(gs[1, 2]))

    # Top clientes
    ax_top = fig.add_subplot(gs[2, :])
    top = datos["cliente_volumen"].nlargest(15, "volumen")
    ax_top.barh(range(len(top)), top["volumen"].values)
    ax_top.set_yticks(range(len(top)))
    ax_top.set_yticklabels([f"Cliente {c}" for c in top["id_cliente"]], fontsize=9)
    ax_top.set_xlabel("Volumen")
    ax_top.set_title("Top 15 clientes por volumen")
    ax_top.invert_yaxis()

    fig.suptitle("Dashboard 1 — Overview", fontsize=16, fontweight="bold", y=1.02)
    plt.show()


def dashboard_rentabilidad(datos: dict) -> None:
    """Dashboard 2: Ranking productos + Heatmap + Bubble + Ingreso%."""
    fig = plt.figure(figsize=(16, 10))
    gs = fig.add_gridspec(2, 2, hspace=0.35, wspace=0.3)

    grafico_3_bubble_productos(datos["producto_agg"], fig.add_subplot(gs[0, 0]))
    grafico_6_heatmap_producto_segmento(datos["heatmap"], fig.add_subplot(gs[0, 1]))

    # Ranking productos
    ax_rank = fig.add_subplot(gs[1, 0])
    prod = datos["producto_agg"].sort_values("volumen", ascending=True)
    ax_rank.barh(prod["nombre_producto"], prod["volumen"])
    ax_rank.set_xlabel("Volumen")
    ax_rank.set_title("Ranking productos por volumen")

    # Ingreso % por producto
    ax_pct = fig.add_subplot(gs[1, 1])
    prod["pct"] = prod["volumen"] / prod["volumen"].sum() * 100
    ax_pct.pie(prod["volumen"], labels=prod["nombre_producto"], autopct="%1.1f%%", startangle=90)
    ax_pct.set_title("Participación por producto")

    fig.suptitle("Dashboard 2 — Rentabilidad", fontsize=16, fontweight="bold", y=1.02)
    plt.show()


# =========================================================
# PREPARACIÓN DE DATOS
# =========================================================


def preparar_datos_eda(
    clientes: pd.DataFrame,
    productos: pd.DataFrame,
    transacciones: pd.DataFrame,
) -> dict:
    """
    Prepara todos los DataFrames necesarios para los 12 gráficos.
    Retorna un dict con las estructuras listas para usar.
    """
    transacciones = transacciones.copy()
    transacciones["fecha"] = pd.to_datetime(transacciones["fecha"])

    tx_cli = transacciones.merge(
        clientes[["id_cliente", "segmento", "pais"]],
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
