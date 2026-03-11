

"""
Análisis avanzado: trayectoria de clientes y cross-sell.

Dependencias: matplotlib, pandas, numpy, scipy, seaborn
"""

from __future__ import annotations

# Utilidades inyectadas para suplir la función _setup_style eliminada
COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]

def _setup_style(ax, title=""):
    import matplotlib.pyplot as plt
    ax.set_title(title, fontweight="bold", pad=15)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(True, linestyle="--", alpha=0.5, axis="y")
    return ax



import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats






def plot_customer_journey(
    dominio,
    customer_id: int | None = None,
    top_n: int = 5,
) -> None:
    """
    Visualiza la trayectoria temporal de uno o varios clientes (USD).

    Parameters
    ----------
    dominio : objeto Dominio
    customer_id : int, optional
        ID específico. Si None, muestra los top N por volumen (USD).
    top_n : int, default 5
        Número de clientes top a graficar cuando customer_id es None.
    """
    if not dominio.clientes:
        print("No hay clientes en el dominio.")
        return

    # Si no se pasó un ID en específico, buscar los top N clientes por volumen USD
    if customer_id is not None:
        ids_a_graficar = [customer_id]
    else:
        # Calcular los top clientes
        volumen_por_cliente = []
        for c in dominio.clientes:
            vol = sum([t.monto_usd for t in c.transacciones])
            volumen_por_cliente.append((c.id_cliente, vol))
            
        volumen_por_cliente.sort(key=lambda x: x[1], reverse=True)
        ids_a_graficar = [tpl[0] for tpl in volumen_por_cliente[:top_n]]

    # Colores base
    COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]

    for cid in ids_a_graficar:
        # Encontrar el cliente
        cliente = next((c for c in dominio.clientes if c.id_cliente == cid), None)
        if not cliente:
            print(f"[plot_customer_journey] Cliente {cid} no encontrado.")
            continue
            
        if not cliente.transacciones:
            print(f"[plot_customer_journey] Cliente {cid} no tiene transacciones registradas.")
            continue

        # Ordenar transacciones por fecha
        transacciones_ordenadas = sorted(cliente.transacciones, key=lambda t: t.fecha)
        min_fecha = transacciones_ordenadas[0].fecha
        max_fecha = transacciones_ordenadas[-1].fecha
        antiguedad_dias = (max_fecha - min_fecha).days
        antiguedad_meses = round(antiguedad_dias / 30.44, 1) if antiguedad_dias > 0 else 0
        pais = cliente.pais.strip()
        sexo = cliente.genero.strip()
        segmento = cliente.segmento.strip()
        
        # Calcular variables
        montos_usd = [t.monto_usd for t in transacciones_ordenadas]
        volumen_total = sum(montos_usd)
        n_transacciones = len(transacciones_ordenadas)
        productos_set = set() # Track unique products
        n_productos = len(set([t.producto.id_producto for t in transacciones_ordenadas]))
        ticket_prom = volumen_total / n_transacciones if n_transacciones > 0 else 0

        # Volumen acumulado por mes
        vol_mensual_acumulado = {}
        for t in transacciones_ordenadas:
            mes_idx = (t.fecha.year - min_fecha.year) * 12 + (t.fecha.month - min_fecha.month)
            vol_mensual_acumulado[mes_idx] = vol_mensual_acumulado.get(mes_idx, 0.0) + t.monto_usd
            
        max_idx = max(vol_mensual_acumulado.keys()) if vol_mensual_acumulado else 0
        
        # Generar listas continuas mes a mes (llenando huecos en 0 y acumulando)
        x_vals = []
        y_vals = []
        acum_usd = 0.0
        
        for mes in range(0, max_idx + 1):
            acum_usd += vol_mensual_acumulado.get(mes, 0.0)
            x_vals.append(mes)
            # Acumulado en Miles (K) para la gráfica
            y_vals.append(acum_usd / 1000.0)

        # Timeline de productos (primer uso de cada producto)
        prod_first_seen = {}
        
        for t in transacciones_ordenadas:
            p_id = t.producto.id_producto
            if p_id not in prod_first_seen:
                # Calcular el índice del mes de la primera transacción de este producto
                mes_idx = (t.fecha.year - min_fecha.year) * 12 + (t.fecha.month - min_fecha.month)
                prod_first_seen[p_id] = {
                    "first_date": t.fecha,
                    "nombre": t.producto.nombre_producto,
                    "mes_idx": mes_idx
                }
                
        # Clasificar primeras compras en orden cronológico
        productos_cronologicos = sorted(prod_first_seen.values(), key=lambda x: x["first_date"])
        for i, prod in enumerate(productos_cronologicos):
            prod["label"] = f"P{i+1}"

        # Construir serie step: acumulado de productos mes a mes
        step_x = []
        step_y = []
        acum_prod = 0
        
        for mes in range(0, max_idx + 1):
            nuevos = sum(1 for p in productos_cronologicos if p["mes_idx"] == mes)
            acum_prod += nuevos
            step_x.append(mes)
            step_y.append(acum_prod)

        # Figura 1×3
        fig, axes = plt.subplots(1, 3, figsize=(16, 5))
        fig.suptitle(
            f"Cliente {cid}  |  Antigüedad: {antiguedad_dias} días  ({antiguedad_meses} meses)",
            fontsize=13,
            fontweight="bold",
        )

        # Subplot 1: Volumen acumulado (área)
        ax0 = axes[0]
        ax0.fill_between(x_vals, y_vals, alpha=0.35, color=COLORS[0])
        ax0.plot(x_vals, y_vals, "o-", linewidth=2, color=COLORS[0])
        
        # Añadir un punto rojo por cada nuevo producto comprado en ese mes
        for prod in productos_cronologicos:
            mi = prod["mes_idx"]
            if mi in x_vals:
                idx = x_vals.index(mi)
                ax0.scatter(mi, y_vals[idx], s=80, color="red", zorder=5)
                
        ax0.set_xlabel("Meses desde primera transacción")
        ax0.set_ylabel("Volumen acumulado ($K USD)")
        ax0.set_title("Volumen Acumulado ($K USD)", fontweight="bold")

        # Subplot 2: Productos en el tiempo (step)
        ax1 = axes[1]
        ax1.step(step_x, step_y, where="post", linewidth=2, color=COLORS[2], marker="o")
        
        for prod in productos_cronologicos:
            mi = prod["mes_idx"]
            cnt = sum(1 for p in productos_cronologicos if p["mes_idx"] <= mi)
            ax1.annotate(
                prod["label"],
                xy=(mi, cnt),
                xytext=(mi, cnt + 0.15),
                fontsize=8,
                ha="center",
                alpha=0.8,
            )
            
        ax1.set_xlabel("Meses desde primera transacción")
        ax1.set_ylabel("Productos acumulados")
        ax1.set_xlim(ax0.get_xlim())
        ax1.set_title("Productos a lo Largo del Tiempo", fontweight="bold")

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
            f"Vol. Total  : ${volumen_total:,.0f} USD\n"
            f"# Txns      : {n_transacciones}\n"
            f"# Productos : {n_productos}\n"
            f"Ticket prom : ${ticket_prom:,.0f} USD\n"
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


# ═══════════════════════════════════════════════════════════════════════════════
# ANÁLISIS DE CROSS-SELL Y PENETRACIÓN DE PRODUCTOS
# ═══════════════════════════════════════════════════════════════════════════════


def analisis_productos_frecuencia(dominio, ax=None):
    """
    ¿Tener más productos aumenta la frecuencia de transacciones?

    Técnica: Correlación de Spearman + Scatter Plot agrupado por segmento.
    Calcula por cliente: n_productos_únicos vs n_transacciones.

    Returns
    -------
    dict con: rho (coeficiente Spearman), p_value, datos por cliente.
    """
    ax = ax or plt.gca()

    datos = []
    for c in dominio.clientes:
        if not c.transacciones:
            continue
        n_productos = len(set(t.producto.id_producto for t in c.transacciones))
        n_txns = len(c.transacciones)
        datos.append({
            "id_cliente": c.id_cliente,
            "n_productos": n_productos,
            "n_transacciones": n_txns,
            "segmento": c.segmento.strip()
        })

    if len(datos) < 3:
        ax.text(0.5, 0.5, "Datos insuficientes", ha="center")
        return {}

    df = pd.DataFrame(datos)

    # Correlación de Spearman
    rho, p_val = stats.spearmanr(df["n_productos"], df["n_transacciones"])

    # Scatter con colores por segmento
    import seaborn as sns
    sns.scatterplot(
        data=df, x="n_productos", y="n_transacciones",
        hue="segmento", ax=ax, s=70, alpha=0.7, edgecolor="white"
    )

    # Línea de tendencia global
    x = df["n_productos"].values
    y = df["n_transacciones"].values
    slope, intercept, _, _, _ = stats.linregress(x, y)
    x_line = np.linspace(x.min(), x.max(), 100)
    ax.plot(x_line, slope * x_line + intercept, "k--", lw=2.5, alpha=0.7,
            label=f"ρ Spearman = {rho:.3f} (p={p_val:.4f})")

    ax.legend(title="Segmento / Correlación", fontsize=9)
    ax.set_xlabel("Productos Únicos por Cliente", fontweight="bold")
    ax.set_ylabel("Número de Transacciones", fontweight="bold")

    import matplotlib.ticker as ticker
    ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True))

    significancia = "SÍ significativa" if p_val < 0.05 else "NO significativa"
    _setup_style(ax, f"Productos vs Frecuencia (Correlación {significancia})")

    return {"rho": rho, "p_value": p_val, "datos": df}


def analisis_producto_ticket(dominio):
    """
    ¿Tener ciertos productos aumenta el ticket promedio?

    Técnica: Comparación de medias con Boxplots segmentados.
    Para cada producto, divide clientes en "tiene" vs "no tiene"
    y compara el ticket promedio (USD).

    Returns
    -------
    dict con: resultados por producto (diferencia de medias, p-value Mann-Whitney).
    """
    # Calcular el ticket promedio USD de cada cliente
    clientes_data = {}
    for c in dominio.clientes:
        if not c.transacciones:
            continue
        volumen = sum(t.monto_usd for t in c.transacciones)
        ticket_prom = volumen / len(c.transacciones)
        productos_set = set(t.producto.tipo_producto.strip() for t in c.transacciones)
        clientes_data[c.id_cliente] = {
            "ticket_prom": ticket_prom,
            "productos": productos_set
        }

    # Obtener todos los tipos de producto del catálogo
    tipos_producto = set()
    for p in dominio.productos:
        tipos_producto.add(p.tipo_producto.strip())

    tipos_sorted = sorted(tipos_producto)

    if not tipos_sorted or not clientes_data:
        print("Datos insuficientes para el análisis.")
        return {}

    # Crear la figura
    n_prods = len(tipos_sorted)
    fig, axes = plt.subplots(1, n_prods, figsize=(5 * n_prods, 5), sharey=True)
    if n_prods == 1:
        axes = [axes]

    resultados = {}

    for i, tipo in enumerate(tipos_sorted):
        ax = axes[i]

        # Dividir clientes: los que TIENEN ese producto vs los que NO
        grupo_tiene = [d["ticket_prom"] for d in clientes_data.values() if tipo in d["productos"]]
        grupo_no_tiene = [d["ticket_prom"] for d in clientes_data.values() if tipo not in d["productos"]]

        # Test de Mann-Whitney (no asume normalidad)
        if len(grupo_tiene) >= 2 and len(grupo_no_tiene) >= 2:
            u_stat, p_val = stats.mannwhitneyu(grupo_tiene, grupo_no_tiene, alternative="two-sided")
        else:
            u_stat, p_val = 0, 1.0

        media_tiene = np.mean(grupo_tiene) if grupo_tiene else 0
        media_no = np.mean(grupo_no_tiene) if grupo_no_tiene else 0
        diferencia = media_tiene - media_no

        resultados[tipo] = {
            "media_tiene": media_tiene,
            "media_no_tiene": media_no,
            "diferencia_usd": diferencia,
            "p_value": p_val,
            "n_tiene": len(grupo_tiene),
            "n_no_tiene": len(grupo_no_tiene)
        }

        # Boxplot
        data_box = []
        for v in grupo_tiene:
            data_box.append({"Ticket USD": v, "Grupo": f"Tiene\n(n={len(grupo_tiene)})"})
        for v in grupo_no_tiene:
            data_box.append({"Ticket USD": v, "Grupo": f"No tiene\n(n={len(grupo_no_tiene)})"})

        df_box = pd.DataFrame(data_box)
        if not df_box.empty:
            import seaborn as sns
            sns.boxplot(data=df_box, x="Grupo", y="Ticket USD", ax=ax,
                        palette=["#2ca02c", "#d62728"])

        sig = "★" if p_val < 0.05 else ""
        ax.set_title(f"{tipo} {sig}\nΔ = ${diferencia:,.1f}", fontweight="bold", fontsize=10)
        if i == 0:
            import matplotlib.ticker as ticker
            ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda y, pos: f'${y:,.0f}'))
            ax.set_ylabel("Ticket Promedio (USD)", fontweight="bold")

    fig.suptitle("Impacto de Cada Producto en el Ticket Promedio (USD)\n★ = diferencia estadísticamente significativa (p < 0.05)",
                 fontsize=13, fontweight="bold", y=1.05)
    plt.tight_layout()
    plt.show()

    return resultados


def analisis_combinaciones_volumen(dominio, top_n=10):
    """
    ¿Qué combinación de productos eleva más el volumen?

    Técnica: Análisis de Cestas simplificado.
    Crea la "canasta" de productos por cliente y calcula el volumen
    promedio USD por cada combinación observada.

    Returns
    -------
    DataFrame con las top N combinaciones rankeadas por volumen promedio.
    """
    cestas = []
    for c in dominio.clientes:
        if not c.transacciones:
            continue
        productos = sorted(set(t.producto.tipo_producto.strip() for t in c.transacciones))
        volumen = sum(t.monto_usd for t in c.transacciones)
        combo = " + ".join(productos)
        cestas.append({
            "combinacion": combo,
            "n_productos": len(productos),
            "volumen_usd": volumen,
            "id_cliente": c.id_cliente
        })

    if not cestas:
        print("No hay datos de cestas.")
        return pd.DataFrame()

    df = pd.DataFrame(cestas)

    # Agrupar por combinación
    resumen = df.groupby("combinacion").agg(
        n_clientes=("id_cliente", "count"),
        volumen_promedio=("volumen_usd", "mean"),
        volumen_total=("volumen_usd", "sum"),
        n_productos=("n_productos", "first")
    ).reset_index().sort_values("volumen_promedio", ascending=False)

    top = resumen.head(top_n).copy()

    # Visualización: Barras horizontales
    fig, ax = plt.subplots(figsize=(10, max(4, len(top) * 0.6)))

    colores = plt.cm.YlOrRd(np.linspace(0.3, 0.9, len(top)))[::-1]
    bars = ax.barh(range(len(top)), top["volumen_promedio"].values,
                   color=colores, edgecolor="white", linewidth=0.5)

    ax.set_yticks(range(len(top)))
    ax.set_yticklabels(top["combinacion"].values, fontsize=9)
    ax.invert_yaxis()

    # Anotar valores y cantidad de clientes
    for i, (_, row) in enumerate(top.iterrows()):
        ax.text(row["volumen_promedio"] + 0.5, i,
                f"  ${row['volumen_promedio']:,.0f}  ({int(row['n_clientes'])} clientes)",
                va="center", fontsize=9)

    import matplotlib.ticker as ticker
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda y, pos: f'${y:,.0f}'))
    ax.set_xlabel("Volumen Promedio por Cliente (USD)", fontweight="bold")

    _setup_style(ax, f"Top {top_n} Combinaciones de Productos por Volumen (USD)")
    plt.tight_layout()
    plt.show()

    return resumen


def analisis_potencial_crecimiento(dominio, max_productos=2, top_n=15):
    """
    ¿Qué clientes con baja penetración tienen más potencial de crecimiento?

    Técnica: Scoring de potencial adaptado (Frecuencia × Ticket × Recencia).
    Filtra clientes con pocos productos (≤ max_productos) y los rankea
    por un score compuesto de frecuencia, ticket y recencia.

    Returns
    -------
    DataFrame con los clientes de mayor potencial (top N).
    """
    from datetime import datetime

    hoy = datetime.now()
    datos = []

    for c in dominio.clientes:
        if not c.transacciones:
            continue

        productos = set(t.producto.tipo_producto.strip() for t in c.transacciones)
        n_productos = len(productos)

        # Solo clientes con baja penetración (pocos productos distintos)
        if n_productos > max_productos:
            continue

        txns_sorted = sorted(c.transacciones, key=lambda t: t.fecha)
        volumen = sum(t.monto_usd for t in txns_sorted)
        n_txns = len(txns_sorted)
        ticket_prom = volumen / n_txns if n_txns > 0 else 0

        primera = txns_sorted[0].fecha
        ultima = txns_sorted[-1].fecha
        antiguedad = (hoy - primera).days
        recencia = (hoy - ultima).days  # Menor = más reciente = mejor

        # Productos que NO tiene (oportunidad)
        todos_tipos = set(p.tipo_producto.strip() for p in dominio.productos)
        productos_faltantes = todos_tipos - productos

        datos.append({
            "id_cliente": c.id_cliente,
            "segmento": c.segmento.strip(),
            "pais": c.pais.strip(),
            "n_productos": n_productos,
            "productos_actuales": ", ".join(sorted(productos)),
            "productos_faltantes": ", ".join(sorted(productos_faltantes)),
            "n_transacciones": n_txns,
            "volumen_usd": volumen,
            "ticket_prom_usd": ticket_prom,
            "antiguedad_dias": antiguedad,
            "recencia_dias": recencia,
        })

    if not datos:
        print(f"No hay clientes con ≤ {max_productos} productos.")
        return pd.DataFrame()

    df = pd.DataFrame(datos)

    # Normalización Min-Max de cada componente para el score (0 a 1)
    def _norm(serie):
        mn, mx = serie.min(), serie.max()
        return (serie - mn) / (mx - mn) if mx > mn else pd.Series([0.5] * len(serie))

    df["score_frecuencia"] = _norm(df["n_transacciones"])
    df["score_ticket"] = _norm(df["ticket_prom_usd"])
    # Recencia: menor es mejor, por lo tanto invertimos
    df["score_recencia"] = 1 - _norm(df["recencia_dias"])

    # Score compuesto (ponderado)
    df["score_potencial"] = (
        0.35 * df["score_frecuencia"]
        + 0.35 * df["score_ticket"]
        + 0.30 * df["score_recencia"]
    )

    df = df.sort_values("score_potencial", ascending=False)
    top = df.head(top_n)

    # Visualización: Tabla + Barras de score
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, max(5, len(top) * 0.45)),
                                    gridspec_kw={"width_ratios": [2, 1]})

    # Panel izquierdo: Barras horizontales del score
    colores = plt.cm.RdYlGn(top["score_potencial"].values)
    ax1.barh(range(len(top)), top["score_potencial"].values, color=colores, edgecolor="white")
    ax1.set_yticks(range(len(top)))
    labels = [f"Cliente {int(row['id_cliente'])} ({row['segmento']})" for _, row in top.iterrows()]
    ax1.set_yticklabels(labels, fontsize=9)
    ax1.invert_yaxis()
    ax1.set_xlabel("Score de Potencial (0-1)", fontweight="bold")
    ax1.set_xlim(0, 1.05)

    for i, (_, row) in enumerate(top.iterrows()):
        ax1.text(row["score_potencial"] + 0.02, i,
                 f"{row['score_potencial']:.2f}", va="center", fontsize=9)

    _setup_style(ax1, f"Top {top_n} Clientes con Mayor Potencial (≤{max_productos} productos)")

    # Panel derecho: Ficha resumen de oportunidad
    ax2.axis("off")
    resumen_text = "OPORTUNIDAD DE CROSS-SELL\n" + "─" * 35 + "\n\n"
    for _, row in top.head(5).iterrows():
        resumen_text += (
            f"▸ Cliente {int(row['id_cliente'])} ({row['segmento']})\n"
            f"  Tiene: {row['productos_actuales']}\n"
            f"  Falta: {row['productos_faltantes']}\n"
            f"  Vol: ${row['volumen_usd']:,.0f} | Txns: {row['n_transacciones']}\n\n"
        )

    ax2.text(0.05, 0.95, resumen_text, transform=ax2.transAxes,
             fontsize=9, verticalalignment="top", fontfamily="monospace",
             bbox=dict(boxstyle="round", facecolor="lightyellow", alpha=0.6))

    plt.tight_layout()
    plt.show()

    return df


def analisis_next_best_product(dominio):
    """
    ¿Qué producto adicional tiene más probabilidad de adopción?

    Técnica: Probabilidad Condicional / Reglas de Asociación simples.
    Para cada par (A → B): P(tiene B | tiene A).
    Genera un heatmap de probabilidades de adopción cruzada.

    Returns
    -------
    DataFrame (matriz de probabilidades condicionales).
    """
    # Obtener todos los tipos de producto
    tipos_producto = sorted(set(p.tipo_producto.strip() for p in dominio.productos))

    if len(tipos_producto) < 2:
        print("Se necesitan al menos 2 tipos de producto.")
        return pd.DataFrame()

    # Construir la "canasta" de cada cliente
    canastas = []
    for c in dominio.clientes:
        if not c.transacciones:
            continue
        productos_cliente = set(t.producto.tipo_producto.strip() for t in c.transacciones)
        canastas.append(productos_cliente)

    if not canastas:
        print("No hay canastas de clientes.")
        return pd.DataFrame()

    n_clientes = len(canastas)

    # Calcular P(B | A) para cada par
    matriz = pd.DataFrame(0.0, index=tipos_producto, columns=tipos_producto)

    for prod_a in tipos_producto:
        # Clientes que tienen A
        clientes_con_a = [c for c in canastas if prod_a in c]
        n_con_a = len(clientes_con_a)

        if n_con_a == 0:
            continue

        for prod_b in tipos_producto:
            if prod_a == prod_b:
                # P(A|A) = 1 por definición, pero no es útil
                matriz.loc[prod_a, prod_b] = np.nan
            else:
                # P(B | A) = (clientes que tienen A y B) / (clientes que tienen A)
                n_con_a_y_b = sum(1 for c in clientes_con_a if prod_b in c)
                matriz.loc[prod_a, prod_b] = n_con_a_y_b / n_con_a

    # Visualización: Heatmap
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5),
                                    gridspec_kw={"width_ratios": [1.2, 1]})

    import seaborn as sns

    # Heatmap de probabilidades
    sns.heatmap(
        matriz.astype(float), annot=True, fmt=".0%", cmap="YlGn",
        ax=ax1, vmin=0, vmax=1, linewidths=0.5,
        cbar_kws={"label": "Probabilidad de adopción"},
        mask=matriz.isna()
    )
    ax1.set_xlabel("Producto Recomendado (B)", fontweight="bold")
    ax1.set_ylabel("Producto que YA Tiene (A)", fontweight="bold")
    ax1.set_title("P(adopta B | ya tiene A)", fontweight="bold", pad=15)

    # Panel derecho: Top recomendaciones
    ax2.axis("off")

    # Extraer las mejores recomendaciones (excluyendo diagonal)
    recomendaciones = []
    for prod_a in tipos_producto:
        for prod_b in tipos_producto:
            if prod_a != prod_b and not pd.isna(matriz.loc[prod_a, prod_b]):
                prob = matriz.loc[prod_a, prod_b]
                recomendaciones.append({
                    "tiene": prod_a,
                    "recomendar": prod_b,
                    "probabilidad": prob
                })

    recomendaciones.sort(key=lambda x: x["probabilidad"], reverse=True)

    texto = "TOP RECOMENDACIONES CROSS-SELL\n" + "─" * 40 + "\n\n"
    texto += f"{'Si tiene':<22} → {'Ofrecer':<22} Prob.\n"
    texto += "─" * 55 + "\n"

    for r in recomendaciones[:8]:
        texto += f"{r['tiene']:<22} → {r['recomendar']:<22} {r['probabilidad']:.0%}\n"

    texto += f"\nBase: {n_clientes} clientes activos"

    ax2.text(0.05, 0.95, texto, transform=ax2.transAxes,
             fontsize=9.5, verticalalignment="top", fontfamily="monospace",
             bbox=dict(boxstyle="round", facecolor="honeydew", alpha=0.6))

    fig.suptitle("Análisis Next-Best-Product — Recomendación por Probabilidad Condicional",
                 fontsize=13, fontweight="bold", y=1.03)
    plt.tight_layout()
    plt.show()

    return matriz

