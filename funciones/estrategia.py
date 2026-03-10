"""
estrategia.py — Análisis de brechas y estrategia de activación basada en el modelo OLS.

Uso:
    from funciones.estrategia import analizar_estrategia
    resultado = regresion_multivariable_volumen(datos["tx_full"])
    estrategia = analizar_estrategia(resultado, datos["tx_full"])
"""

from __future__ import annotations

import pandas as pd


def analizar_estrategia(resultado_regresion: dict, df: pd.DataFrame) -> dict:
    """
    Calcula brechas, segmenta clientes y proyecta impacto de intervenciones.

    Parameters
    ----------
    resultado_regresion : dict
        Salida de regresion_multivariable_volumen(). Debe contener:
        - "modelo"       : statsmodels RegressionResults
        - "predicciones" : pandas Series con y_pred indexado igual que modelo_df
    df : pd.DataFrame
        tx_full con columnas: id_cliente, id_transaccion, monto, fecha,
        pais, genero, segmento.

    Returns
    -------
    dict con claves: clientes, resumen_segmentos, volumen_actual,
    volumen_proyectado, impacto_total, pct_crecimiento,
    tabla_accionable, coef_txn, coef_ticket.
    """
    modelo      = resultado_regresion["modelo"]
    predicciones = resultado_regresion["predicciones"]

    # ── 1. Extraer coeficientes reales del modelo ─────────────────────────────
    params      = modelo.params
    coef_txn    = float(params["n_transacciones"])
    coef_ticket = float(params["ticket_mean"])

    # ── 2. Construir tabla a nivel cliente ────────────────────────────────────
    df = df.copy()
    df["fecha"] = pd.to_datetime(df["fecha"])

    cli = (
        df.groupby("id_cliente")
        .agg(
            volumen_real=("monto", "sum"),
            n_transacciones=("id_transaccion", "count"),
            ticket_mean=("monto", "mean"),
            pais=("pais", "first"),
            segmento=("segmento", "first"),
            genero=("genero", "first"),
        )
        .reset_index()
    )

    # ── 3. Volumen esperado — desde las predicciones del modelo ───────────────
    # predicciones está indexado por el índice de modelo_df (que es el índice
    # original de cli después del dropna). Reconstruimos el mismo cli con
    # los mismos features para hacer el merge por id_cliente.
    pred_df = predicciones.reset_index()
    pred_df.columns = ["idx", "volumen_esperado"]

    # El modelo fue ajustado sobre modelo_df que tiene los mismos id_cliente
    # en el mismo orden. Extraemos id_cliente del modelo usando su índice.
    modelo_endog_index = modelo.model.data.row_labels  # índices de las filas usadas
    cli_indexed = cli.set_index(cli.index)  # preservar índice original

    # Mapear predicciones al cli mediante el índice de fila
    cli["volumen_esperado"] = float("nan")
    for pos, orig_idx in enumerate(modelo_endog_index):
        if orig_idx < len(cli):
            cli.loc[orig_idx, "volumen_esperado"] = float(predicciones.iloc[pos])

    # Fallback: clientes sin predicción → usar volumen_real
    cli["volumen_esperado"] = cli["volumen_esperado"].fillna(cli["volumen_real"])

    # ── 4. Gap y performance ──────────────────────────────────────────────────
    cli["gap"]     = cli["volumen_real"] - cli["volumen_esperado"]
    cli["pct_gap"] = (cli["gap"] / cli["volumen_esperado"].abs() * 100).round(2)

    cli["performance"] = "NORMAL"
    cli.loc[cli["pct_gap"] >  10, "performance"] = "OVERPERFORMER"
    cli.loc[cli["pct_gap"] < -20, "performance"] = "UNDERPERFORMER"

    # ── 5. Segmentación por oportunidad ───────────────────────────────────────
    txn_med    = cli["n_transacciones"].median()
    ticket_med = cli["ticket_mean"].median()

    def _segmentar(row: pd.Series) -> str:
        txn    = row["n_transacciones"]
        ticket = row["ticket_mean"]
        gap    = row["pct_gap"]
        if txn < txn_med and ticket > ticket_med:
            return "DORMIDO_CON_POTENCIAL"
        if txn > txn_med and ticket < ticket_med:
            return "ACTIVO_BAJO_VALOR"
        if txn > txn_med and ticket > ticket_med and gap > -5:
            return "ESTRELLA"
        if txn < txn_med and ticket < ticket_med:
            return "CRISIS"
        return "NORMAL"

    cli["segmento_oportunidad"] = cli.apply(_segmentar, axis=1)

    # ── 6. Impacto por segmento (coeficientes reales) ─────────────────────────
    impactos_def = {
        "DORMIDO_CON_POTENCIAL": coef_txn * 2.5,
        "ACTIVO_BAJO_VALOR":     coef_ticket * 1200,
        "ESTRELLA":              coef_txn * 1.0,
        "CRISIS":                coef_txn * 2.0,
        "NORMAL":                0.0,
    }

    resumen_segmentos: list[dict] = []
    for seg, imp_unit in impactos_def.items():
        n = int((cli["segmento_oportunidad"] == seg).sum())
        resumen_segmentos.append({
            "segmento":         seg,
            "n_clientes":       n,
            "impacto_unitario": round(imp_unit, 2),
            "impacto_total":    round(n * imp_unit, 2),
        })

    # ── 7. Proyección ─────────────────────────────────────────────────────────
    volumen_actual     = float(cli["volumen_real"].sum())
    impacto_total      = sum(r["impacto_total"] for r in resumen_segmentos)
    volumen_proyectado = volumen_actual + impacto_total
    pct_crecimiento    = round(impacto_total / volumen_actual * 100, 2) if volumen_actual else 0.0

    # ── 8. Tabla accionable ───────────────────────────────────────────────────
    cols_tabla = [
        "id_cliente", "volumen_real", "volumen_esperado", "gap", "pct_gap",
        "n_transacciones", "ticket_mean", "segmento",
        "segmento_oportunidad", "performance",
    ]
    tabla = (
        cli[cli["pct_gap"] < -5][cols_tabla]
        .sort_values("gap")
        .reset_index(drop=True)
    )
    # Redondear floats para JSON limpio
    for col in ["volumen_real", "volumen_esperado", "gap", "ticket_mean"]:
        tabla[col] = tabla[col].round(2)

    return {
        "clientes":           cli[cols_tabla].round(2).to_dict(orient="records"),
        "resumen_segmentos":  resumen_segmentos,
        "volumen_actual":     round(volumen_actual, 2),
        "volumen_proyectado": round(volumen_proyectado, 2),
        "impacto_total":      round(impacto_total, 2),
        "pct_crecimiento":    pct_crecimiento,
        "tabla_accionable":   tabla.to_dict(orient="records"),
        "coef_txn":           round(coef_txn, 2),
        "coef_ticket":        round(coef_ticket, 4),
    }


def analizar_crosssell(df: pd.DataFrame) -> dict:
    """
    Identifica qué productos le faltan a cada cliente y estima el ingreso potencial.

    Parameters
    ----------
    df : pd.DataFrame
        tx_full con columnas: id_cliente, id_producto, nombre_producto,
        tipo_producto, monto, segmento, pais.

    Returns
    -------
    dict con: oportunidades, heatmap, top_por_producto,
              volumen_medio_por_producto, total_oportunidades,
              ingreso_potencial_total.
    """
    # ── Catálogo y presencia por cliente ─────────────────────────────────────
    catalogo = (
        df[["id_producto", "nombre_producto", "tipo_producto"]]
        .drop_duplicates()
        .set_index("id_producto")
        .sort_index()
    )
    all_ids = catalogo.index.tolist()

    cli_prods = df.groupby("id_cliente")["id_producto"].apply(set)
    cli_info = df.groupby("id_cliente").agg(
        segmento=("segmento", "first"),
        pais=("pais", "first"),
    )

    # ── Volumen medio por producto (base para estimación de ingreso) ──────────
    vol_medio = df.groupby("id_producto")["monto"].mean()

    # ── Oportunidades por cliente ─────────────────────────────────────────────
    oportunidades: list[dict] = []
    for cid, prods_set in cli_prods.items():
        faltantes = [pid for pid in all_ids if pid not in prods_set]
        if not faltantes:
            continue

        top_prod = max(faltantes, key=lambda p: vol_medio.get(p, 0))
        ingreso_est = round(float(vol_medio.get(top_prod, 0)) * 3, 2)

        oportunidades.append({
            "id_cliente":            int(cid),
            "segmento":              str(cli_info.loc[cid, "segmento"]),
            "pais":                  str(cli_info.loc[cid, "pais"]),
            "n_productos_actuales":  len(prods_set),
            "n_productos_faltantes": len(faltantes),
            "productos_actuales":    [catalogo.loc[p, "nombre_producto"] for p in sorted(prods_set)],
            "productos_faltantes":   [catalogo.loc[p, "nombre_producto"] for p in faltantes],
            "top_recomendacion":     str(catalogo.loc[top_prod, "nombre_producto"]),
            "ingreso_estimado":      ingreso_est,
        })

    oportunidades.sort(key=lambda x: x["ingreso_estimado"], reverse=True)

    # ── Heatmap (clientes × productos, 0/1) ───────────────────────────────────
    clientes_sorted = sorted(cli_prods.index.tolist())
    nombres_prods   = [catalogo.loc[p, "nombre_producto"] for p in all_ids]
    values = [
        [int(pid in cli_prods.get(cid, set())) for pid in all_ids]
        for cid in clientes_sorted
    ]
    heatmap = {
        "clientes": [f"C{c}" for c in clientes_sorted],
        "productos": nombres_prods,
        "values":    values,
    }

    # ── Cuántos clientes no tienen cada producto ──────────────────────────────
    top_por_producto = {
        catalogo.loc[pid, "nombre_producto"]: int(
            sum(1 for c in cli_prods.index if pid not in cli_prods[c])
        )
        for pid in all_ids
    }
    # Ordenar de mayor a menor
    top_por_producto = dict(
        sorted(top_por_producto.items(), key=lambda x: x[1], reverse=True)
    )

    vol_medio_por_producto = {
        catalogo.loc[p, "nombre_producto"]: round(float(vol_medio.get(p, 0)), 2)
        for p in all_ids
    }

    return {
        "oportunidades":              oportunidades,
        "heatmap":                    heatmap,
        "top_por_producto":           top_por_producto,
        "volumen_medio_por_producto": vol_medio_por_producto,
        "total_oportunidades":        len(oportunidades),
        "ingreso_potencial_total":    round(sum(o["ingreso_estimado"] for o in oportunidades), 2),
    }
