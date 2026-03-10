"""
exportar.py — Serializa los resultados del análisis Python al dashboard JS.

Uso en el notebook:
    from funciones.exportar import exportar_dashboard_data
    resultado = regresion_multivariable_volumen(datos["tx_full"])
    exportar_dashboard_data(datos, resultado)
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


def exportar_dashboard_data(
    datos: dict,
    resultado_regresion: dict,
    output_path: str = "dashboard/data.json",
) -> None:
    """
    Actualiza data.json con las claves `regresion` y `journey`.

    Parameters
    ----------
    datos : dict
        Resultado de preparar_datos_eda(). Debe contener la clave "tx_full".
    resultado_regresion : dict
        Resultado de regresion_multivariable_volumen(). Debe contener:
        "modelo" (statsmodels RegressionResults), "predicciones" (Series).
    output_path : str
        Ruta relativa al data.json del dashboard.
    """
    modelo     = resultado_regresion["modelo"]
    y_pred     = resultado_regresion["predicciones"]
    df         = datos["tx_full"].copy()
    df["fecha"] = pd.to_datetime(df["fecha"])

    # ── Regresión ──────────────────────────────────────────────────────────────
    y_real = modelo.model.endog

    reg_export = {
        "r2":     round(float(modelo.rsquared), 4),
        "r2_adj": round(float(modelo.rsquared_adj), 4),
        "n_obs":  int(modelo.nobs),
        "y_real":   [round(float(v), 2) for v in y_real],
        "y_pred":   [round(float(v), 2) for v in y_pred],
        "residuos": [round(float(v), 2) for v in modelo.resid],
        "coeficientes": {
            k: {
                "coef":    round(float(v), 4),
                "ci_low":  round(float(modelo.conf_int().loc[k, 0]), 4),
                "ci_high": round(float(modelo.conf_int().loc[k, 1]), 4),
                "pvalue":  round(float(modelo.pvalues[k]), 4),
            }
            for k, v in modelo.params.items()
            if k != "const"
        },
    }

    # ── Journey — todos los clientes, ordenados por volumen ───────────────────
    vol_por_cliente = (
        df.groupby("id_cliente")["monto"]
        .sum()
        .sort_values(ascending=False)
    )
    all_ids = vol_por_cliente.index.tolist()

    journey_export: dict = {}
    for cid in all_ids:
        sub = df[df["id_cliente"] == cid].copy().sort_values("fecha")
        min_f = sub["fecha"].min()
        sub["mes_idx"] = (
            (sub["fecha"].dt.year  - min_f.year)  * 12
            + (sub["fecha"].dt.month - min_f.month)
        )

        vol_men = sub.groupby("mes_idx")["monto"].sum()
        max_idx = int(vol_men.index.max()) if len(vol_men) > 0 else 0
        vol_men = vol_men.reindex(range(0, max_idx + 1), fill_value=0)
        vol_acum = vol_men.cumsum()

        prod_first = (
            sub.groupby("id_producto")
            .agg(first_mes=("mes_idx", "min"), nombre=("nombre_producto", "first"))
            .reset_index()
            .sort_values("first_mes")
        )

        step_x: list[int] = []
        step_y: list[int] = []
        acum = 0
        for m in range(0, max_idx + 1):
            acum += int((prod_first["first_mes"] == m).sum())
            step_x.append(m)
            step_y.append(acum)

        vol_total  = float(vol_por_cliente[cid])
        n_txns     = int(len(sub))
        n_prods    = int(sub["id_producto"].nunique())
        ticket     = round(vol_total / n_txns, 2) if n_txns > 0 else 0.0
        antiguedad = int((sub["fecha"].max() - min_f).days)
        pais       = str(sub["pais"].iloc[0])
        genero     = str(sub["genero"].iloc[0])
        segmento   = str(sub["segmento"].iloc[0])

        journey_export[str(cid)] = {
            "id_cliente":      int(cid),
            "pais":            pais,
            "genero":          genero,
            "segmento":        segmento,
            "volumen_total":   round(vol_total, 2),
            "n_transacciones": n_txns,
            "n_productos":     n_prods,
            "ticket_prom":     ticket,
            "antiguedad_dias": antiguedad,
            "vol_acum_x":      vol_acum.index.tolist(),
            "vol_acum_y":      [round(float(v), 2) for v in vol_acum],
            "step_x":          step_x,
            "step_y":          step_y,
            "productos": [
                {
                    "label":  f"P{i + 1}",
                    "mes":    int(row["first_mes"]),
                    "nombre": str(row["nombre"]),
                }
                for i, (_, row) in enumerate(prod_first.iterrows())
            ],
        }

    # ── Escribir data.json ────────────────────────────────────────────────────
    path = Path(output_path)
    with path.open(encoding="utf-8") as f:
        dash_data = json.load(f)

    dash_data["regresion"] = reg_export
    dash_data["journey"]   = journey_export

    with path.open("w", encoding="utf-8") as f:
        json.dump(dash_data, f, ensure_ascii=False, indent=2, default=str)

    print(f"✓ {path} actualizado")
    print(f"  R² = {reg_export['r2']}  |  R² adj = {reg_export['r2_adj']}  |  N = {reg_export['n_obs']}")
    print(f"  Clientes journey exportados: {len(journey_export)}")
