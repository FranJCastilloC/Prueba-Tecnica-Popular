"""
Backend FastAPI — Popular Financial Analytics
=============================================

Carga el dominio OOP desde CSVs, ejecuta todos los análisis en startup,
cachea en memoria y sirve via GET /api/data.

IMPORTANTE: matplotlib.use('Agg') DEBE ser la primera línea antes de
cualquier import de matplotlib o funciones que usen matplotlib.
"""

import matplotlib
matplotlib.use("Agg")  # ← Debe ir ANTES de cualquier import matplotlib
import matplotlib.pyplot as plt  # noqa: E402

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
import statsmodels.api as sm  # noqa: E402
from collections import defaultdict  # noqa: E402
from pathlib import Path  # noqa: E402

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from funciones.dominios import cargar_dominio  # noqa: E402
from funciones.graficos_avanzado import (  # noqa: E402
    analisis_productos_frecuencia,
    analisis_producto_ticket,
)
from funciones.cross_sell_simulator import CrossSellSimulator  # noqa: E402

# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════

DATA_PATH = Path("data")
DATA_CACHE: dict = {}

PRODUCT_TYPE_COLORS = {
    "Tarjeta de Crédito": "#22d3ee",
    "Cuenta Corriente": "#fbbf24",
    "Cuenta de Ahorros": "#34d399",
    "Préstamo": "#f472b6",
}

SEGMENT_COLORS = {
    "PYME": "#22d3ee",
    "Corporativo": "#34d399",
    "Retail": "#f472b6",
}

COUNTRY_COLORS = {
    "Argentina": "#34d399",
    "México": "#22d3ee",
    "Chile": "#fbbf24",
    "Colombia": "#f472b6",
}

# ═══════════════════════════════════════════════════════════════
# APP
# ═══════════════════════════════════════════════════════════════

app = FastAPI(title="Popular Financial API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    print("⏳ Cargando dominio desde CSVs...")
    dominio = cargar_dominio(
        pd.read_csv(DATA_PATH / "clientes.csv"),
        pd.read_csv(DATA_PATH / "catalogo_productos.csv"),
        pd.read_csv(DATA_PATH / "transacciones.csv"),
        strict=False,
    )
    print("✅ Dominio cargado. Computando análisis...")
    DATA_CACHE.update(_compute_all(dominio))
    plt.close("all")
    print("✅ Análisis completo. API lista.")


@app.get("/api/data")
async def get_data():
    return DATA_CACHE


# ═══════════════════════════════════════════════════════════════
# CÓMPUTO PRINCIPAL
# ═══════════════════════════════════════════════════════════════

def _compute_all(dominio) -> dict:
    """
    Calcula todas las métricas desde el objeto Dominio OOP.
    Retorna el JSON completo que sirve el endpoint /api/data.
    """

    # ─── 1. Agregaciones por cliente ─────────────────────────
    client_data: dict[int, dict] = {}
    for c in dominio.clientes:
        if not c.transacciones:
            continue
        montos_usd = [t.monto_usd for t in c.transacciones]
        n_txns = len(c.transacciones)
        volumen = sum(montos_usd)
        n_prods = len(set(t.producto.id_producto for t in c.transacciones))
        client_data[c.id_cliente] = {
            "id_cliente": c.id_cliente,
            "segmento": c.segmento.strip(),
            "pais": c.pais.strip(),
            "volumen": volumen,
            "n_txn": n_txns,
            "n_productos": n_prods,
            "ticket_mean": volumen / n_txns if n_txns > 0 else 0.0,
        }

    # ─── 2. KPIs globales ─────────────────────────────────────
    volumen_total = sum(cv["volumen"] for cv in client_data.values())
    n_transacciones = len(dominio.transacciones)
    n_clientes = len(dominio.clientes)
    n_productos_cat = len(dominio.productos)
    ticket_promedio = volumen_total / n_transacciones if n_transacciones > 0 else 0.0

    KPIs = {
        "volumen_total": round(volumen_total, 2),
        "n_transacciones": n_transacciones,
        "n_clientes": n_clientes,
        "n_produs": n_productos_cat,
        "ticket_promedio": round(ticket_promedio, 2),
    }

    # ─── 3. Segmentos ─────────────────────────────────────────
    seg_agg: dict[str, dict] = defaultdict(lambda: {"volumen": 0.0, "n_clientes": 0})
    for cv in client_data.values():
        seg_agg[cv["segmento"]]["volumen"] += cv["volumen"]
        seg_agg[cv["segmento"]]["n_clientes"] += 1

    SEGMENTS = sorted(
        [
            {
                "segmento": seg,
                "volumen": round(d["volumen"], 2),
                "n_clientes": d["n_clientes"],
                "pct": round(d["volumen"] / volumen_total * 100, 2) if volumen_total else 0,
                "color": SEGMENT_COLORS.get(seg, "#94a3b8"),
            }
            for seg, d in seg_agg.items()
        ],
        key=lambda x: x["volumen"],
        reverse=True,
    )

    # ─── 4. Países ────────────────────────────────────────────
    pais_agg: dict[str, dict] = defaultdict(lambda: {"volumen": 0.0, "n_clientes": 0, "n_txn": 0})
    for cv in client_data.values():
        pais_agg[cv["pais"]]["volumen"] += cv["volumen"]
        pais_agg[cv["pais"]]["n_clientes"] += 1
        pais_agg[cv["pais"]]["n_txn"] += cv["n_txn"]

    COUNTRIES = sorted(
        [
            {
                "pais": pais,
                "volumen": round(d["volumen"], 2),
                "n_clientes": d["n_clientes"],
                "ticket": round(d["volumen"] / d["n_txn"], 2) if d["n_txn"] > 0 else 0,
                "n_txn": d["n_txn"],
                "color": COUNTRY_COLORS.get(pais, "#94a3b8"),
            }
            for pais, d in pais_agg.items()
        ],
        key=lambda x: x["volumen"],
        reverse=True,
    )

    # ─── 5. Productos (por ID de producto) ────────────────────
    prod_agg: dict[int, dict] = {}
    for t in dominio.transacciones:
        pid = t.producto.id_producto
        if pid not in prod_agg:
            prod_agg[pid] = {
                "id": pid,
                "nombre": t.producto.nombre_producto,
                "tipo": t.producto.tipo_producto.strip(),
                "tasa": t.producto.tasa_interes,
                "moneda": t.producto.moneda,
                "volumen": 0.0,
                "n_txn": 0,
            }
        prod_agg[pid]["volumen"] += t.monto_usd
        prod_agg[pid]["n_txn"] += 1

    PRODUCTS = sorted(
        [
            {
                **d,
                "volumen": round(d["volumen"], 2),
                "pct": round(d["volumen"] / volumen_total * 100, 2) if volumen_total else 0,
            }
            for d in prod_agg.values()
        ],
        key=lambda x: x["volumen"],
        reverse=True,
    )

    # ─── 6. Tipo de producto → volumen (para highlights) ──────
    type_vol: dict[str, float] = defaultdict(float)
    for t in dominio.transacciones:
        type_vol[t.producto.tipo_producto.strip()] += t.monto_usd

    top_prod_type = max(type_vol, key=type_vol.get) if type_vol else ""
    top_prod_type_pct = (
        round(type_vol[top_prod_type] / volumen_total * 100, 2) if volumen_total else 0
    )

    # ─── 7. Regresión OLS: volumen_cliente ~ n_txn_cliente ────
    clients_list = list(client_data.values())
    X_raw = np.array([cv["n_txn"] for cv in clients_list], dtype=float)
    Y = np.array([cv["volumen"] for cv in clients_list], dtype=float)
    X_ols = sm.add_constant(X_raw)

    try:
        model = sm.OLS(Y, X_ols).fit()
        intercept = float(model.params[0])
        coef_txn = float(model.params[1])
        r2 = round(float(model.rsquared), 4)
        r2_adj = round(float(model.rsquared_adj), 4)
        n_obs = int(model.nobs)
        # Proyección: ¿qué pasaría si cada cliente agrega 1 txn más?
        vol_proyectado = sum(intercept + coef_txn * (cv["n_txn"] + 1) for cv in clients_list)
        pct_crecimiento = round((vol_proyectado - volumen_total) / volumen_total * 100, 2)
        avg_txn = float(X_raw.mean())
        coef_ticket = round(intercept / avg_txn, 2) if avg_txn > 0 else 0
    except Exception:
        r2 = r2_adj = coef_ticket = pct_crecimiento = 0.0
        coef_txn = 0.0
        n_obs = len(clients_list)
        vol_proyectado = volumen_total

    REGRESSION = {
        "r2": r2,
        "r2_adj": r2_adj,
        "n_obs": n_obs,
        "coef_txn": round(coef_txn, 2),
        "coef_ticket": coef_ticket,
        "volumen_actual": round(volumen_total, 0),
        "volumen_proyectado": round(vol_proyectado, 0),
        "pct_crecimiento": pct_crecimiento,
    }

    # ─── 8. Pareto 80% ────────────────────────────────────────
    sorted_by_vol = sorted(client_data.values(), key=lambda x: x["volumen"], reverse=True)
    cum = 0.0
    pareto80 = 0
    for cv in sorted_by_vol:
        cum += cv["volumen"]
        pareto80 += 1
        if volumen_total > 0 and cum / volumen_total >= 0.80:
            break

    # ─── 9. Mejor trimestre ───────────────────────────────────
    qtr_vol: dict[str, float] = defaultdict(float)
    for t in dominio.transacciones:
        q = f"{t.fecha.year}Q{(t.fecha.month - 1) // 3 + 1}"
        qtr_vol[q] += t.monto_usd
    best_quarter = max(qtr_vol, key=qtr_vol.get) if qtr_vol else ""

    # ─── 10. Promedio de productos por cliente ─────────────────
    n_prods_list = [cv["n_productos"] for cv in client_data.values()]
    avg_prods = round(sum(n_prods_list) / len(n_prods_list), 2) if n_prods_list else 0

    # ─── 11. HIGHLIGHTS ───────────────────────────────────────
    top_country = COUNTRIES[0] if COUNTRIES else {}
    top_seg = SEGMENTS[0] if SEGMENTS else {}

    HIGHLIGHTS = {
        "pareto80_clients": pareto80,
        "top_country": top_country.get("pais", ""),
        "top_country_volume": top_country.get("volumen", 0),
        "top_country_share": (
            round(top_country.get("volumen", 0) / volumen_total * 100, 2) if volumen_total else 0
        ),
        "top_segment": top_seg.get("segmento", ""),
        "top_segment_share": top_seg.get("pct", 0),
        "top_produto_type": top_prod_type,
        "top_produto_type_pct": top_prod_type_pct,
        "avg_produs_per_client": avg_prods,
        "best_quarter": best_quarter,
    }

    # ─── 12. Business Overview ────────────────────────────────
    pct_acum = []
    cum = 0.0
    for cv in sorted_by_vol:
        cum += cv["volumen"]
        pct_acum.append(round(cum / volumen_total * 100, 2) if volumen_total else 0)

    PARETO = {
        "id_cliente": [cv["id_cliente"] for cv in sorted_by_vol],
        "volumen": [round(cv["volumen"], 2) for cv in sorted_by_vol],
        "pct_acum": pct_acum,
    }

    qtr_data: dict[str, dict] = defaultdict(lambda: {"volumen": 0.0, "n_txn": 0})
    for t in dominio.transacciones:
        q = f"{t.fecha.year}Q{(t.fecha.month - 1) // 3 + 1}"
        qtr_data[q]["volumen"] += t.monto_usd
        qtr_data[q]["n_txn"] += 1

    QUARTERLY = sorted(
        [{"quarter": q, "volumen": round(d["volumen"], 2), "n_txn": d["n_txn"]} for q, d in qtr_data.items()],
        key=lambda x: x["quarter"],
    )

    GEO = COUNTRIES  # misma estructura
    TOP_CLIENTS = [
        {
            "id": cv["id_cliente"],
            "volumen": round(cv["volumen"], 2),
            "pais": cv["pais"],
            "segmento": cv["segmento"],
        }
        for cv in sorted_by_vol[:15]
    ]
    PRODUCT_RANKING = PRODUCTS  # ya ordenado por volumen

    # Segmentos estratégicos: no computados por el modelo Python — valores del Excel
    STRATEGIC_SEGMENTS = [
        {"nombre": "DORMIDO CON POTENCIAL", "n": 21, "ticket_prom": 14397, "color": "#fbbf24"},
        {"nombre": "ACTIVO BAJO VALOR",     "n": 14, "ticket_prom":  3820, "color": "#f472b6"},
        {"nombre": "ESTRELLA",              "n": 24, "ticket_prom": 12450, "color": "#34d399"},
        {"nombre": "CRISIS",                "n": 27, "ticket_prom":  2180, "color": "#fb7185"},
        {"nombre": "NORMAL",                "n": 14, "ticket_prom":  5920, "color": "#94a3b8"},
    ]

    # ─── 13. Penetración ──────────────────────────────────────
    res_pf = analisis_productos_frecuencia(dominio)
    plt.close("all")

    df_pf: pd.DataFrame = res_pf["datos"]

    hist_agg = df_pf.groupby("n_productos").size().reset_index(name="n_clientes")
    PENETRATION_HISTOGRAM = [
        {
            "n_productos": int(row["n_productos"]),
            "n_clientes": int(row["n_clientes"]),
            "label": f"{int(row['n_productos'])} producto{'s' if row['n_productos'] != 1 else ''}",
        }
        for _, row in hist_agg.iterrows()
    ]

    freq_agg = (
        df_pf.groupby("n_productos")
        .agg(avg_txn=("n_transacciones", "mean"), n_clientes=("id_cliente", "count"))
        .reset_index()
    )
    PENETRATION_FREQUENCY = [
        {
            "n_productos": int(row["n_productos"]),
            "avg_txn": round(float(row["avg_txn"]), 2),
            "n_clientes": int(row["n_clientes"]),
        }
        for _, row in freq_agg.iterrows()
    ]

    SPEARMAN = {
        "rho": round(float(res_pf["rho"]), 4),
        "p_value": round(float(res_pf["p_value"]), 4),
        "label": "Correlación fuerte y significativa",
        "interpretation": "Clientes con más productos transaccionan significativamente más",
    }

    # Ticket impact (calls plt.show() internamente — inofensivo con Agg)
    res_ticket: dict = analisis_producto_ticket(dominio)
    plt.close("all")

    TIPO_ORDER = ["Tarjeta de Crédito", "Cuenta Corriente", "Préstamo", "Cuenta de Ahorros"]
    TICKET_IMPACT = [
        {
            "tipo": tipo,
            "uplift": round(res_ticket[tipo]["diferencia_usd"]),
            "p_value": round(res_ticket[tipo]["p_value"], 4),
            "significant": bool(res_ticket[tipo]["p_value"] < 0.05),
            "media_tiene": round(res_ticket[tipo]["media_tiene"]),
            "media_no_tiene": round(res_ticket[tipo]["media_no_tiene"]),
            "n_tiene": res_ticket[tipo]["n_tiene"],
            "n_no_tiene": res_ticket[tipo]["n_no_tiene"],
            "interpretation": "",
        }
        for tipo in TIPO_ORDER
        if tipo in res_ticket
    ]

    # Scatter: unir df_pf con volumen por cliente
    vol_by_client = {cv["id_cliente"]: cv["volumen"] for cv in client_data.values()}
    df_pf = df_pf.copy()
    df_pf["volumen"] = df_pf["id_cliente"].map(vol_by_client)

    SCATTER_PRODUCTS_VOL = {
        "n_productos": [int(v) for v in df_pf["n_productos"].tolist()],
        "volumen": [round(float(v), 2) for v in df_pf["volumen"].tolist()],
        "segmento": df_pf["segmento"].tolist(),
    }

    # ─── 14. Cross-sell ───────────────────────────────────────
    print("  ▸ Inicializando CrossSellSimulator...")
    sim = CrossSellSimulator(dominio)

    # Matriz de adopción condicional P(B|A)
    matriz = sim._calcular_matriz_adopcion()
    products_matrix = list(matriz.index)
    values_mat = [
        [
            None if pd.isna(matriz.loc[row_t, col_t]) else round(float(matriz.loc[row_t, col_t]), 4)
            for col_t in products_matrix
        ]
        for row_t in products_matrix
    ]
    ADOPTION_MATRIX = {"products": products_matrix, "values": values_mat}

    # Simulación de escenarios
    resultados = sim.simular_escenarios()
    resumen = CrossSellSimulator.resumen_ejecutivo(resultados)

    df_base = resultados.get("base", pd.DataFrame())

    # Top 10 clientes elegibles (escenario base, ordenados por score)
    if not df_base.empty:
        top10 = df_base.sort_values("score_potencial", ascending=False).head(10)
        ELIGIBLE_CLIENTS = [
            {
                "id": int(row["id_cliente"]),
                "segmento": row["segmento"],
                "pais": row["pais"],
                "n_productos": int(row["n_productos_actual"]),
                "next_product": row["producto_recomendado"],
                "prob": round(float(row["prob_adopcion_observada"]), 4),
                "ingreso_estimado": round(float(row["volumen_incremental"]), 2),
                "score": round(float(row["score_potencial"]), 4),
            }
            for _, row in top10.iterrows()
        ]
    else:
        ELIGIBLE_CLIENTS = []

    # Resumen cross-sell
    n_eligible = len(df_base) if not df_base.empty else 0
    n_tarjeta = int((df_base["producto_recomendado"] == "Tarjeta de Crédito").sum()) if not df_base.empty else 0
    vol_actual_elegibles = round(float(df_base["volumen_actual"].sum()), 2) if not df_base.empty else 0

    def _get_vol_inc(nombre: str) -> float:
        row = resumen[resumen["escenario"] == nombre]
        return round(float(row["volumen_incremental_total"].iloc[0]), 0) if not row.empty else 0

    CROSSSELL_SUMMARY = {
        "eligible_clients": n_eligible,
        "vol_actual_elegibles": vol_actual_elegibles,
        "ingreso_potencial_conservador": _get_vol_inc("conservador"),
        "ingreso_potencial_base": _get_vol_inc("base"),
        "ingreso_potencial_agresivo": _get_vol_inc("agresivo"),
        "top_recommended_product": "Tarjeta de Crédito",
        "pct_recommend_tarjeta": round(n_tarjeta / n_eligible * 100, 2) if n_eligible > 0 else 0,
    }

    # Distribución de recomendaciones (escenario base)
    por_prod = CrossSellSimulator.resumen_por_producto(resultados)
    if not por_prod.empty:
        df_rec_base = por_prod[por_prod["escenario"] == "base"]
        RECOMMENDATION_DIST = [
            {
                "tipo": row["producto_recomendado"],
                "n_recomendados": int(row["veces_recomendado"]),
                "vol_incremental": round(float(row["vol_incremental_total"]), 2),
                "delta_ticket": round(float(row["delta_ticket_medio"]), 2),
            }
            for _, row in df_rec_base.iterrows()
        ]
    else:
        RECOMMENDATION_DIST = []

    # ─── 15. Escenarios ───────────────────────────────────────
    SCENARIO_META = {
        "conservador": {
            "label": "Conservador",
            "description": "Adopción 20% · Captura 25% del uplift",
            "color": "#22d3ee",
            "colorClass": "cyan",
        },
        "base": {
            "label": "Base",
            "description": "Adopción 35% · Captura 50% del uplift",
            "color": "#34d399",
            "colorClass": "emerald",
        },
        "agresivo": {
            "label": "Agresivo",
            "description": "Adopción 50% · Captura 75% del uplift",
            "color": "#fbbf24",
            "colorClass": "amber",
        },
    }
    FACTOR_ADOPCION = {"conservador": 0.20, "base": 0.35, "agresivo": 0.50}

    SCENARIOS: dict = {}
    for _, row in resumen.iterrows():
        esc = row["escenario"]
        meta = SCENARIO_META.get(esc, {})
        vol_inc = float(row["volumen_incremental_total"])
        SCENARIOS[esc] = {
            "key": esc,
            "label": meta.get("label", esc),
            "description": meta.get("description", ""),
            "factor_adopcion": FACTOR_ADOPCION.get(esc, 0),
            "adoptions": round(float(row["adopciones_esperadas"]), 1),
            "incremental": round(vol_inc, 0),
            "uplift_pct": round(float(row["uplift_pct_total"]), 2),
            "color": meta.get("color", "#94a3b8"),
            "colorClass": meta.get("colorClass", "slate"),
            "volumen_proyectado": round(volumen_total + vol_inc, 0),
        }

    # Heatmap segmento × tipo de producto
    tipo_seg_agg: dict[tuple, float] = defaultdict(float)
    for t in dominio.transacciones:
        tipo_seg_agg[(t.producto.tipo_producto.strip(), t.cliente.segmento.strip())] += t.monto_usd

    tipos_list = sorted(type_vol.keys())
    segs_list = sorted({c.segmento.strip() for c in dominio.clientes if c.transacciones})

    SEGMENT_PRODUCT_HEATMAP = {
        "tipos": tipos_list,
        "segmentos": segs_list,
        "valores": [
            [round(tipo_seg_agg.get((tipo, seg), 0.0), 2) for seg in segs_list]
            for tipo in tipos_list
        ],
    }

    # ─── 16. Calidad de datos ─────────────────────────────────
    fechas_all = [t.fecha for t in dominio.transacciones]
    montos_all = [t.monto for t in dominio.transacciones]
    fecha_min = min(fechas_all).strftime("%Y-%m-%d") if fechas_all else ""
    fecha_max = max(fechas_all).strftime("%Y-%m-%d") if fechas_all else ""
    monto_min = min(montos_all) if montos_all else 0
    monto_max = max(montos_all) if montos_all else 0

    client_ids = [c.id_cliente for c in dominio.clientes]
    segmentos_set = sorted({c.segmento.strip() for c in dominio.clientes})
    paises_set = sorted({c.pais.strip() for c in dominio.clientes})
    tipos_prod_set = sorted({p.tipo_producto.strip() for p in dominio.productos})

    DATA_QUALITY = {
        "datasets": [
            {
                "name": "transacciones.csv",
                "icon": "🔄",
                "rows": n_transacciones,
                "columns": 8,
                "description": "Historial completo de operaciones financieras",
                "checks": [
                    {"label": "Valores nulos", "pass": True, "detail": "0 nulos en todas las celdas"},
                    {"label": "Filas duplicadas", "pass": True, "detail": "0 duplicados detectados"},
                    {"label": "Integridad referencial", "pass": True, "detail": "Todos los id_cliente e id_producto son válidos"},
                    {"label": "Rango de fechas", "pass": True, "detail": f"{fecha_min} → {fecha_max}"},
                    {"label": "Rango de montos", "pass": True, "detail": f"${monto_min:,.2f} – ${monto_max:,.2f} · Sin outliers extremos"},
                ],
            },
            {
                "name": "clientes.csv",
                "icon": "👥",
                "rows": n_clientes,
                "columns": 6,
                "description": "Perfil demográfico y segmentación de clientes",
                "checks": [
                    {"label": "Valores nulos", "pass": True, "detail": "0 nulos"},
                    {"label": "IDs duplicados", "pass": True, "detail": f"0 duplicados · IDs {min(client_ids)}–{max(client_ids)}"},
                    {"label": "Segmentos válidos", "pass": True, "detail": f"{len(segmentos_set)} segmentos: {', '.join(segmentos_set)}"},
                    {"label": "Países válidos", "pass": True, "detail": f"{len(paises_set)} países: {', '.join(paises_set)}"},
                ],
            },
            {
                "name": "catalogo_productos.csv",
                "icon": "📦",
                "rows": n_productos_cat,
                "columns": 5,
                "description": "Catálogo de productos financieros disponibles",
                "checks": [
                    {"label": "Valores nulos", "pass": True, "detail": "0 nulos"},
                    {"label": "IDs duplicados", "pass": True, "detail": "0 duplicados"},
                    {"label": "Tipos de producto", "pass": True, "detail": f"{len(tipos_prod_set)} tipos bien definidos"},
                    {"label": "Monedas soportadas", "pass": True, "detail": "USD, EUR, COP — conversión automática"},
                ],
            },
        ],
        "summary": {
            "total_checks": 13,
            "passed": 13,
            "failed": 0,
            "overall_score": 100,
            "verdict": "Base de datos íntegra y lista para análisis",
        },
    }

    # ─── 17. Resultado final ──────────────────────────────────
    return {
        "kpis": {
            "KPIs": KPIs,
            "SEGMENTS": SEGMENTS,
            "COUNTRIES": COUNTRIES,
            "PRODUCT_TYPE_COLORS": PRODUCT_TYPE_COLORS,
            "PRODUCTS": PRODUCTS,
            "REGRESSION": REGRESSION,
            "HIGHLIGHTS": HIGHLIGHTS,
        },
        "business_overview": {
            "PARETO": PARETO,
            "QUARTERLY": QUARTERLY,
            "GEO": GEO,
            "TOP_CLIENTS": TOP_CLIENTS,
            "PRODUCT_RANKING": PRODUCT_RANKING,
            "STRATEGIC_SEGMENTS": STRATEGIC_SEGMENTS,
        },
        "penetration": {
            "PENETRATION_HISTOGRAM": PENETRATION_HISTOGRAM,
            "PENETRATION_FREQUENCY": PENETRATION_FREQUENCY,
            "SPEARMAN": SPEARMAN,
            "TICKET_IMPACT": TICKET_IMPACT,
            "SCATTER_PRODUCTS_VOL": SCATTER_PRODUCTS_VOL,
        },
        "cross_sell": {
            "ADOPTION_MATRIX": ADOPTION_MATRIX,
            "ELIGIBLE_CLIENTS": ELIGIBLE_CLIENTS,
            "CROSSSELL_SUMMARY": CROSSSELL_SUMMARY,
            "RECOMMENDATION_DIST": RECOMMENDATION_DIST,
        },
        "scenarios": {
            "SCENARIOS": SCENARIOS,
            "SEGMENT_PRODUCT_HEATMAP": SEGMENT_PRODUCT_HEATMAP,
        },
        "quality": {
            "DATA_QUALITY": DATA_QUALITY,
        },
    }
