"""
Análisis avanzado: trayectoria de clientes y regresión multivariable.

Dependencias: matplotlib, pandas, numpy, scipy, statsmodels
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

try:
    import statsmodels.api as sm
except ImportError:
    sm = None

from funciones.graficos_eda import COLORS, FIG_DPI, _setup_style


def plot_customer_journey(
    df: pd.DataFrame,
    customer_id: int | None = None,
    top_n: int = 5,
) -> None:
    """
    Visualiza la trayectoria temporal de uno o varios clientes.

    Parameters
    ----------
    df : DataFrame
        tx_full con columnas: id_cliente, id_producto, nombre_producto,
        pais, genero, segmento, fecha, monto.
    customer_id : int, optional
        ID específico. Si None, muestra los top N por volumen.
    top_n : int, default 5
        Número de clientes top a graficar cuando customer_id es None.
    """
    df = df.copy()
    df["fecha"] = pd.to_datetime(df["fecha"])

    if customer_id is not None:
        ids = [customer_id]
    else:
        ids = df.groupby("id_cliente")["monto"].sum().nlargest(top_n).index.tolist()

    for cid in ids:
        sub = df[df["id_cliente"] == cid].copy()
        if sub.empty:
            print(f"[plot_customer_journey] Cliente {cid} no encontrado.")
            continue

        sub = sub.sort_values("fecha")
        min_fecha = sub["fecha"].min()
        max_fecha = sub["fecha"].max()
        antiguedad_dias = (max_fecha - min_fecha).days
        antiguedad_meses = round(antiguedad_dias / 30.44, 1)
        pais = sub["pais"].iloc[0]
        sexo = sub["genero"].iloc[0]
        segmento = sub["segmento"].iloc[0]
        volumen_total = sub["monto"].sum()
        n_transacciones = len(sub)
        n_productos = sub["id_producto"].nunique()
        ticket_prom = volumen_total / n_transacciones

        # Volumen acumulado por mes
        sub["mes_idx"] = (
            (sub["fecha"].dt.year - min_fecha.year) * 12
            + (sub["fecha"].dt.month - min_fecha.month)
        )
        vol_mensual = sub.groupby("mes_idx")["monto"].sum()
        max_idx = int(vol_mensual.index.max()) if len(vol_mensual) > 0 else 0
        vol_mensual = vol_mensual.reindex(range(0, max_idx + 1), fill_value=0)
        vol_acum = vol_mensual.cumsum() / 1000  # en $K

        # Timeline de productos (primer uso de cada producto)
        prod_first = (
            sub.groupby("id_producto")
            .agg(first_date=("fecha", "min"), nombre=("nombre_producto", "first"))
            .reset_index()
            .sort_values("first_date")
        )
        prod_first["mes_idx"] = (
            (prod_first["first_date"].dt.year - min_fecha.year) * 12
            + (prod_first["first_date"].dt.month - min_fecha.month)
        ).astype(int)
        prod_first["label"] = [f"P{i+1}" for i in range(len(prod_first))]

        # Construir serie step: acumulado de productos mes a mes
        step_x: list[int] = []
        step_y: list[int] = []
        acum = 0
        for mes in range(0, max_idx + 1):
            nuevos = (prod_first["mes_idx"] == mes).sum()
            acum += nuevos
            step_x.append(mes)
            step_y.append(acum)

        # Figura 1×3
        fig, axes = plt.subplots(1, 3, figsize=(16, 5))
        fig.suptitle(
            f"Cliente {cid}  |  Antigüedad: {antiguedad_dias} días  ({antiguedad_meses} meses)",
            fontsize=13,
            fontweight="bold",
        )

        # Subplot 1: Volumen acumulado (área)
        ax0 = axes[0]
        x_vals = list(vol_acum.index)
        y_vals = vol_acum.values
        ax0.fill_between(x_vals, y_vals, alpha=0.35, color=COLORS[0])
        ax0.plot(x_vals, y_vals, "o-", linewidth=2, color=COLORS[0])
        for _, row in prod_first.iterrows():
            mi = row["mes_idx"]
            if mi in vol_acum.index:
                ax0.scatter(mi, vol_acum[mi], s=80, color="red", zorder=5)
        ax0.set_xlabel("Meses desde primera transacción")
        ax0.set_ylabel("Volumen acumulado ($K)")
        _setup_style(ax0, "Volumen Acumulado")

        # Subplot 2: Productos en el tiempo (step)
        ax1 = axes[1]
        ax1.step(step_x, step_y, where="post", linewidth=2, color=COLORS[2], marker="o")
        for _, row in prod_first.iterrows():
            mi = int(row["mes_idx"])
            cnt = int((prod_first["mes_idx"] <= mi).sum())
            ax1.annotate(
                row["label"],
                xy=(mi, cnt),
                xytext=(mi, cnt + 0.15),
                fontsize=8,
                ha="center",
                alpha=0.8,
            )
        ax1.set_xlabel("Meses desde primera transacción")
        ax1.set_ylabel("Productos acumulados")
        ax1.set_xlim(ax0.get_xlim())
        _setup_style(ax1, "Productos a lo Largo del Tiempo")

        # Subplot 3: Ficha resumen del cliente
        ax2 = axes[2]
        ax2.axis("off")
        info_text = (
            f"CLIENTE {cid}\n"
            f"{'─'*30}\n"
            f"Antigüedad  : {antiguedad_dias} días ({antiguedad_meses} meses)\n"
            f"País        : {pais}\n"
            f"Sexo        : {sexo}\n"
            f"Segmento    : {segmento}\n"
            f"\n"
            f"Vol. Total  : ${volumen_total:,.0f}\n"
            f"# Txns      : {n_transacciones}\n"
            f"# Productos : {n_productos}\n"
            f"Ticket prom : ${ticket_prom:,.0f}\n"
            f"\n"
            f"Primero     : {min_fecha.strftime('%Y-%m-%d')}\n"
            f"Último      : {max_fecha.strftime('%Y-%m-%d')}"
        )
        ax2.text(
            0.05, 0.95, info_text,
            transform=ax2.transAxes,
            fontsize=10,
            verticalalignment="top",
            fontfamily="monospace",
            bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.4),
        )

        plt.tight_layout()
        plt.show()


def regresion_multivariable_volumen(df: pd.DataFrame) -> dict:
    """
    Regresión OLS ampliada:
    Volumen ~ Transacciones + Productos + Ticket_max + Ticket_mean
             + Antigüedad + Volatilidad
             + Segmento + País + Sexo

    Parameters
    ----------
    df : DataFrame
        tx_full con columnas: id_cliente, id_producto, fecha, monto,
        pais, genero, segmento.

    Returns
    -------
    dict con: modelo, R_squared, coeficientes, predicciones.
    """
    if sm is None:
        raise ImportError(
            "statsmodels es requerido. Instálalo con: pip install statsmodels>=0.14.0"
        )

    df = df.copy()
    df["fecha"] = pd.to_datetime(df["fecha"])

    # Construir features a nivel cliente
    cli = (
        df.groupby("id_cliente")
        .agg(
            volumen=("monto", "sum"),
            num_productos=("id_producto", "nunique"),
            n_transacciones=("id_transaccion", "count"),
            ticket_max=("monto", "max"),
            ticket_mean=("monto", "mean"),
            min_fecha=("fecha", "min"),
            max_fecha=("fecha", "max"),
            pais=("pais", "first"),
            genero=("genero", "first"),
            segmento=("segmento", "first"),
        )
        .reset_index()
    )
    cli["antiguedad_dias"] = (cli["max_fecha"] - cli["min_fecha"]).dt.days

    # Volatilidad: std del pct_change mensual (compatible pandas >=1.5)
    def _calc_vol(group: pd.DataFrame) -> float:
        monthly = group.groupby(group["fecha"].dt.to_period("M"))["monto"].sum()
        if len(monthly) < 2:
            return 0.0
        return float(monthly.pct_change().dropna().std())

    vol_dict = df.groupby("id_cliente").apply(_calc_vol).to_dict()
    cli["volatilidad"] = cli["id_cliente"].map(vol_dict).fillna(0.0)

    # Dummies país (México = baseline, el más frecuente con 30 clientes)
    cli["pais_Argentina"] = (cli["pais"] == "Argentina").astype(int)
    cli["pais_Chile"] = (cli["pais"] == "Chile").astype(int)
    cli["pais_Colombia"] = (cli["pais"] == "Colombia").astype(int)
    cli["sexo_femenino"] = (cli["genero"] == "F").astype(int)
    # Dummies segmento (Retail = baseline, segmento más uniforme)
    cli["seg_PYME"] = (cli["segmento"] == "PYME").astype(int)
    cli["seg_Corporativo"] = (cli["segmento"] == "Corporativo").astype(int)

    features = [
        "n_transacciones", "num_productos", "ticket_max", "ticket_mean",
        "antiguedad_dias", "volatilidad",
        "seg_PYME", "seg_Corporativo",
        "pais_Argentina", "pais_Chile", "pais_Colombia", "sexo_femenino",
    ]
    modelo_df = cli[["volumen"] + features].dropna()

    X = sm.add_constant(modelo_df[features])
    y = modelo_df["volumen"]
    modelo = sm.OLS(y, X).fit()
    print(modelo.summary())

    y_pred = modelo.predict(X)
    residuos = modelo.resid
    r2 = modelo.rsquared
    coefs = modelo.params.drop("const")
    conf_int = modelo.conf_int().drop("const")  # columnas [0, 1]

    coef_vals = coefs.values
    ci_low = conf_int[0].values
    ci_high = conf_int[1].values

    # Figura 2×2
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Regresión Multivariable — Volumen del Cliente", fontsize=14, fontweight="bold")

    # (0,0) Predicho vs Real
    ax00 = axes[0, 0]
    ax00.scatter(y, y_pred, alpha=0.6, edgecolors="white", linewidths=0.5, color=COLORS[0])
    min_val = min(float(y.min()), float(y_pred.min()))
    max_val = max(float(y.max()), float(y_pred.max()))
    ax00.plot([min_val, max_val], [min_val, max_val], "r--", linewidth=2, label="Pred. perfecta")
    ax00.set_xlabel("Volumen Real (USD)")
    ax00.set_ylabel("Volumen Predicho (USD)")
    ax00.legend()
    _setup_style(ax00, f"Predicho vs Real  (R² = {r2:.3f})")

    # (0,1) Histograma de residuos
    ax01 = axes[0, 1]
    ax01.hist(residuos, bins=20, edgecolor="white", color=COLORS[1], alpha=0.8)
    ax01.axvline(0, color="red", linestyle="--", linewidth=2)
    ax01.set_xlabel("Residuos (USD)")
    ax01.set_ylabel("Frecuencia")
    _setup_style(ax01, "Distribución de Residuos")

    # (1,0) Coeficientes con IC 95%
    ax10 = axes[1, 0]
    colors_coef = ["#22c55e" if v > 0 else "#ef4444" for v in coef_vals]
    xerr_lo = coef_vals - ci_low
    xerr_hi = ci_high - coef_vals
    ax10.barh(
        coefs.index.tolist(), coef_vals,
        xerr=[xerr_lo, xerr_hi],
        color=colors_coef, alpha=0.75, capsize=4,
    )
    ax10.axvline(0, color="black", linewidth=1)
    ax10.set_xlabel("Coeficiente")
    _setup_style(ax10, "Coeficientes con IC 95%")

    # (1,1) QQ-plot
    ax11 = axes[1, 1]
    (osm, osr), (slope, intercept, _) = stats.probplot(residuos, dist="norm")
    ax11.scatter(osm, osr, alpha=0.6, edgecolors="white", linewidths=0.5, color=COLORS[3])
    x_line = np.array([osm[0], osm[-1]])
    ax11.plot(x_line, slope * x_line + intercept, "r-", linewidth=2)
    ax11.set_xlabel("Cuantiles teóricos")
    ax11.set_ylabel("Cuantiles muestrales")
    _setup_style(ax11, "QQ-Plot de Residuos")

    plt.tight_layout()
    plt.show()

    return {
        "modelo": modelo,
        "R_squared": r2,
        "coeficientes": coefs,
        "predicciones": y_pred,
    }
