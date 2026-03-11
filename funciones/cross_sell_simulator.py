"""
Simulador Estratégico de Cross-Sell
====================================

Herramienta de simulación que estima el impacto de una estrategia de
cross-sell sobre clientes con baja penetración de productos, asignando
un next-best-product y proyectando el efecto en frecuencia, ticket y
volumen bajo escenarios conservador, base y agresivo.

Trabaja directamente con el objeto Dominio (OOP) del proyecto.

Dependencias: pandas, numpy, matplotlib, seaborn, scipy
Opcional para exportar: openpyxl

Autor: Generado por Antigravity para Prueba Popular
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE ESCENARIOS
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class EscenarioConfig:
    """
    Configuración de un escenario de simulación.

    Attributes
    ----------
    nombre : str
        Nombre legible del escenario (e.g. "conservador").
    factor_adopcion : float
        Fracción de la probabilidad condicional observada que se espera
        capturar como adopción real.  P_ajustada = P_observada × factor.
        Ejemplo: 0.20 = asumimos que solo el 20% de los clientes con la
        probabilidad observada efectivamente adoptarán el producto.
    factor_captura_ticket : float
        Fracción del uplift observado en ticket que capturaremos.
        Ejemplo: 0.50 = asumimos capturar la mitad del diferencial.
    factor_captura_frecuencia : float
        Fracción del uplift observado en frecuencia que capturaremos.
        Ejemplo: 0.50 = asumimos capturar la mitad del diferencial.
    """
    nombre: str
    factor_adopcion: float
    factor_captura_ticket: float
    factor_captura_frecuencia: float


# Escenarios predefinidos (pueden sobreescribirse al instanciar)
ESCENARIOS_DEFAULT = {
    "conservador": EscenarioConfig(
        nombre="conservador",
        factor_adopcion=0.20,
        factor_captura_ticket=0.25,
        factor_captura_frecuencia=0.25,
    ),
    "base": EscenarioConfig(
        nombre="base",
        factor_adopcion=0.35,
        factor_captura_ticket=0.50,
        factor_captura_frecuencia=0.50,
    ),
    "agresivo": EscenarioConfig(
        nombre="agresivo",
        factor_adopcion=0.50,
        factor_captura_ticket=0.75,
        factor_captura_frecuencia=0.75,
    ),
}


@dataclass
class FiltrosElegibilidad:
    """
    Reglas configurables para filtrar el universo objetivo de clientes.

    Attributes
    ----------
    max_productos : int
        Máximo número de productos distintos que puede tener un cliente
        para ser elegible (clientes ya saturados se excluyen).
    score_minimo : float
        Score mínimo de potencial requerido (0.0 a 1.0).
    segmentos : list[str] | None
        Si se especifica, solo incluir estos segmentos.
    paises : list[str] | None
        Si se especifica, solo incluir estos países.
    max_clientes : int | None
        Limitar la cantidad de clientes simulados (top N por score).
    """
    max_productos: int = 2
    score_minimo: float = 0.0
    segmentos: list[str] | None = None
    paises: list[str] | None = None
    max_clientes: int | None = None


# ═══════════════════════════════════════════════════════════════════════════════
# SIMULADOR PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

class CrossSellSimulator:
    """
    Simulador estratégico de cross-sell.

    Extrae toda la información necesaria directamente del objeto Dominio,
    calcula las tablas intermedias (adopción, ticket uplift, frecuencia uplift)
    y ejecuta simulaciones bajo múltiples escenarios.

    Usage
    -----
    >>> from funciones.dominios import cargar_dominio
    >>> from funciones.cross_sell_simulator import CrossSellSimulator
    >>> dominio = cargar_dominio(df_c, df_p, df_t)
    >>> sim = CrossSellSimulator(dominio)
    >>> resultados = sim.simular_escenarios()
    >>> resumen = sim.resumen_ejecutivo(resultados)
    """

    def __init__(
        self,
        dominio,
        escenarios: dict[str, EscenarioConfig] | None = None,
        filtros: FiltrosElegibilidad | None = None,
    ):
        """
        Parameters
        ----------
        dominio : Dominio
            Objeto Dominio con clientes, productos y transacciones cargados.
        escenarios : dict, optional
            Diccionario {nombre: EscenarioConfig}. Si None, usa los defaults.
        filtros : FiltrosElegibilidad, optional
            Reglas de elegibilidad. Si None, usa defaults (max_productos=2).
        """
        self.dominio = dominio
        self.escenarios = escenarios or ESCENARIOS_DEFAULT
        self.filtros = filtros or FiltrosElegibilidad()

        # Tablas intermedias (se calculan lazily en la primera simulación)
        self._df_clientes: pd.DataFrame | None = None
        self._matriz_adopcion: pd.DataFrame | None = None
        self._impacto_ticket: dict | None = None
        self._tabla_frecuencia: pd.DataFrame | None = None
        self._tipos_producto: list[str] = []

        # Precalcular catálogo de tipos de producto
        self._tipos_producto = sorted(set(
            p.tipo_producto.strip() for p in dominio.productos
        ))

    # ───────────────────────────────────────────────────────────────────────
    # PREPARACIÓN DE DATOS
    # ───────────────────────────────────────────────────────────────────────

    def _preparar_clientes(self) -> pd.DataFrame:
        """
        Extrae un DataFrame enriquecido de clientes directamente del Dominio.

        Columnas generadas:
            id_cliente, segmento, pais, genero, antiguedad_dias,
            n_productos, n_transacciones, ticket_mean, ticket_max,
            volumen_actual, productos_actuales (set), ultima_fecha_txn,
            recencia_dias, score_potencial
        """
        if self._df_clientes is not None:
            return self._df_clientes

        hoy = datetime.now()
        registros = []

        for c in self.dominio.clientes:
            if not c.transacciones:
                continue

            txns = sorted(c.transacciones, key=lambda t: t.fecha)
            montos = [t.monto_usd for t in txns]
            productos = set(t.producto.tipo_producto.strip() for t in txns)

            primera = txns[0].fecha
            ultima = txns[-1].fecha
            volumen = sum(montos)
            n_txns = len(txns)

            registros.append({
                "id_cliente": c.id_cliente,
                "segmento": c.segmento.strip(),
                "pais": c.pais.strip(),
                "genero": c.genero.strip(),
                "antiguedad_dias": (hoy - primera).days,
                "n_productos": len(productos),
                "n_transacciones": n_txns,
                "ticket_mean": volumen / n_txns if n_txns > 0 else 0,
                "ticket_max": max(montos) if montos else 0,
                "volumen_actual": volumen,
                "productos_actuales": productos,
                "ultima_fecha_txn": ultima,
                "recencia_dias": (hoy - ultima).days,
            })

        df = pd.DataFrame(registros)

        if df.empty:
            self._df_clientes = df
            return df

        # Calcular score de potencial (normalización Min-Max compuesta)
        df["score_potencial"] = self._calcular_score_potencial(df)
        self._df_clientes = df
        return df

    @staticmethod
    def _calcular_score_potencial(df: pd.DataFrame) -> pd.Series:
        """
        Score compuesto de potencial de crecimiento.

        Componentes (pesos):
            - Frecuencia transaccional (35%): más txns = más activo
            - Ticket promedio (35%): mayor ticket = más valor
            - Recencia (30%): menor recencia = más reciente = mejor

        Normalización Min-Max: cada componente se escala de 0 a 1.
        """
        def _norm(s: pd.Series) -> pd.Series:
            mn, mx = s.min(), s.max()
            return (s - mn) / (mx - mn) if mx > mn else pd.Series(0.5, index=s.index)

        score_freq = _norm(df["n_transacciones"])
        score_ticket = _norm(df["ticket_mean"])
        # Recencia invertida: menor = mejor
        score_recencia = 1 - _norm(df["recencia_dias"])

        return 0.35 * score_freq + 0.35 * score_ticket + 0.30 * score_recencia

    # ───────────────────────────────────────────────────────────────────────
    # MATRIZ DE ADOPCIÓN (PROBABILIDAD CONDICIONAL)
    # ───────────────────────────────────────────────────────────────────────

    def _calcular_matriz_adopcion(self) -> pd.DataFrame:
        """
        Construye la matriz P(adopta B | ya tiene A) a partir de los datos.

        Para cada par de tipos de producto (A, B):
            P(B|A) = #{clientes con A y B} / #{clientes con A}

        Returns
        -------
        DataFrame cuadrado con tipos de producto como índice y columnas.
        La diagonal es NaN (P(A|A) no es informativa).
        """
        if self._matriz_adopcion is not None:
            return self._matriz_adopcion

        tipos = self._tipos_producto

        # Construir canastas de productos por cliente
        canastas = []
        for c in self.dominio.clientes:
            if not c.transacciones:
                continue
            productos = set(t.producto.tipo_producto.strip() for t in c.transacciones)
            canastas.append(productos)

        matriz = pd.DataFrame(np.nan, index=tipos, columns=tipos)

        for prod_a in tipos:
            clientes_con_a = [c for c in canastas if prod_a in c]
            n_con_a = len(clientes_con_a)
            if n_con_a == 0:
                continue
            for prod_b in tipos:
                if prod_a == prod_b:
                    continue  # Dejar NaN en la diagonal
                n_con_ab = sum(1 for c in clientes_con_a if prod_b in c)
                matriz.loc[prod_a, prod_b] = n_con_ab / n_con_a

        self._matriz_adopcion = matriz
        return matriz

    # ───────────────────────────────────────────────────────────────────────
    # IMPACTO EN TICKET POR PRODUCTO
    # ───────────────────────────────────────────────────────────────────────

    def _calcular_impacto_ticket(self) -> dict:
        """
        Calcula el diferencial en ticket promedio entre clientes que
        TIENEN un producto vs los que NO lo tienen.

        Para cada tipo de producto:
            uplift = media(ticket | tiene) - media(ticket | no tiene)

        También ejecuta Mann-Whitney U test para evaluar significancia.

        Returns
        -------
        dict[str, dict] con keys: media_tiene, media_no_tiene,
            uplift_usd, p_value, significativo, n_tiene, n_no_tiene
        """
        if self._impacto_ticket is not None:
            return self._impacto_ticket

        df = self._preparar_clientes()
        if df.empty:
            self._impacto_ticket = {}
            return {}

        resultados = {}
        for tipo in self._tipos_producto:
            tiene = df[df["productos_actuales"].apply(lambda s: tipo in s)]["ticket_mean"]
            no_tiene = df[df["productos_actuales"].apply(lambda s: tipo not in s)]["ticket_mean"]

            if len(tiene) >= 2 and len(no_tiene) >= 2:
                _, p_val = stats.mannwhitneyu(tiene, no_tiene, alternative="two-sided")
            else:
                p_val = 1.0

            media_t = float(tiene.mean()) if len(tiene) > 0 else 0.0
            media_n = float(no_tiene.mean()) if len(no_tiene) > 0 else 0.0

            resultados[tipo] = {
                "media_tiene": media_t,
                "media_no_tiene": media_n,
                "uplift_usd": media_t - media_n,
                "p_value": p_val,
                "significativo": p_val < 0.05,
                "n_tiene": len(tiene),
                "n_no_tiene": len(no_tiene),
            }

        self._impacto_ticket = resultados
        return resultados

    # ───────────────────────────────────────────────────────────────────────
    # UPLIFT EN FRECUENCIA POR MAYOR PENETRACIÓN
    # ───────────────────────────────────────────────────────────────────────

    def _calcular_uplift_frecuencia(self) -> pd.DataFrame:
        """
        Construye una tabla de frecuencia promedio observada por nivel
        de penetración de productos (k).

        La tabla permite estimar cuánto aumenta la frecuencia esperada
        cuando un cliente pasa de k productos a k+1.

        Returns
        -------
        DataFrame con columnas: n_productos, freq_media, n_clientes,
            delta_freq (incremento respecto al nivel anterior).
        """
        if self._tabla_frecuencia is not None:
            return self._tabla_frecuencia

        df = self._preparar_clientes()
        if df.empty:
            self._tabla_frecuencia = pd.DataFrame()
            return self._tabla_frecuencia

        tabla = (
            df.groupby("n_productos")
            .agg(
                freq_media=("n_transacciones", "mean"),
                n_clientes=("id_cliente", "count"),
            )
            .reset_index()
            .sort_values("n_productos")
        )

        # Delta: incremento al pasar de k a k+1
        tabla["delta_freq"] = tabla["freq_media"].diff().fillna(0)

        self._tabla_frecuencia = tabla
        return tabla

    def _obtener_delta_frecuencia(self, n_productos_actual: int) -> float:
        """
        Retorna el incremento esperado en frecuencia cuando un cliente
        con `n_productos_actual` adopta un producto adicional.

        Lógica basada en datos:
            delta = freq_media(k+1) - freq_media(k)

        Si el nivel k+1 no existe en los datos observados, retorna el
        promedio general de deltas positivos como fallback conservador.
        """
        tabla = self._calcular_uplift_frecuencia()
        if tabla.empty:
            return 0.0

        k_target = n_productos_actual + 1

        # Buscar el delta observado para k → k+1
        fila = tabla[tabla["n_productos"] == k_target]
        if not fila.empty:
            return max(0.0, float(fila.iloc[0]["delta_freq"]))

        # Fallback: promedio de deltas positivos observados
        deltas_positivos = tabla[tabla["delta_freq"] > 0]["delta_freq"]
        return float(deltas_positivos.mean()) if len(deltas_positivos) > 0 else 0.0

    # ───────────────────────────────────────────────────────────────────────
    # NEXT-BEST-PRODUCT
    # ───────────────────────────────────────────────────────────────────────

    def _asignar_next_best_product(
        self,
        productos_actuales: set,
    ) -> tuple[str | None, float]:
        """
        Determina el mejor producto a recomendar a un cliente dado su
        portafolio actual.

        Regla de consolidación:
            Para cada producto candidato B (que el cliente NO tiene),
            calculamos la probabilidad máxima P(B|A) entre todos los
            productos A que el cliente SÍ tiene.

            Justificación: si CUALQUIER producto actual del cliente
            predice fuertemente la adopción de B, esa señal es relevante
            independientemente de qué tan predecible sea B desde otros
            productos del portafolio.

        Parameters
        ----------
        productos_actuales : set[str]
            Tipos de producto que el cliente ya posee.

        Returns
        -------
        (producto_recomendado, probabilidad_observada)
            Producto con mayor probabilidad consolidada, o (None, 0.0)
            si no hay candidatos.
        """
        matriz = self._calcular_matriz_adopcion()
        todos = set(self._tipos_producto)
        faltantes = todos - productos_actuales

        if not faltantes or not productos_actuales:
            return None, 0.0

        mejor_producto = None
        mejor_prob = -1.0

        for candidato in faltantes:
            # Probabilidad consolidada: MÁXIMO entre P(candidato | A)
            # para cada producto A que el cliente ya tiene
            probs = []
            for prod_actual in productos_actuales:
                if prod_actual in matriz.index and candidato in matriz.columns:
                    val = matriz.loc[prod_actual, candidato]
                    if pd.notna(val):
                        probs.append(float(val))

            if probs:
                prob_consolidada = max(probs)
                if prob_consolidada > mejor_prob:
                    mejor_prob = prob_consolidada
                    mejor_producto = candidato

        return mejor_producto, max(mejor_prob, 0.0)

    # ───────────────────────────────────────────────────────────────────────
    # FILTRADO DE UNIVERSO ELEGIBLE
    # ───────────────────────────────────────────────────────────────────────

    def _filtrar_elegibles(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aplica las reglas de elegibilidad configuradas en self.filtros.

        Criterios aplicados secuencialmente:
            1. n_productos <= max_productos
            2. score_potencial >= score_minimo
            3. Segmentos permitidos (si se especifican)
            4. Países permitidos (si se especifican)
            5. Excluir clientes con TODOS los productos
            6. Limitar a max_clientes (top N por score)
        """
        f = self.filtros
        n_total_productos = len(self._tipos_producto)

        # 1. Penetración máxima
        mask = df["n_productos"] <= f.max_productos

        # 2. Score mínimo
        mask &= df["score_potencial"] >= f.score_minimo

        # 3. Segmentos
        if f.segmentos:
            mask &= df["segmento"].isin(f.segmentos)

        # 4. Países
        if f.paises:
            mask &= df["pais"].isin(f.paises)

        # 5. Excluir saturados
        mask &= df["n_productos"] < n_total_productos

        elegibles = df[mask].copy()

        # 6. Limitar cantidad
        if f.max_clientes is not None and len(elegibles) > f.max_clientes:
            elegibles = elegibles.nlargest(f.max_clientes, "score_potencial")

        return elegibles.reset_index(drop=True)

    # ───────────────────────────────────────────────────────────────────────
    # SIMULACIÓN
    # ───────────────────────────────────────────────────────────────────────

    def simular(self, escenario: EscenarioConfig) -> pd.DataFrame:
        """
        Ejecuta la simulación completa para un escenario dado.

        Pipeline:
            1. Preparar y enriquecer DataFrame de clientes
            2. Filtrar universo elegible
            3. Asignar next-best-product a cada cliente
            4. Calcular probabilidad de adopción ajustada
            5. Estimar uplift en frecuencia y ticket
            6. Proyectar volumen incremental

        Parameters
        ----------
        escenario : EscenarioConfig
            Configuración del escenario a simular.

        Returns
        -------
        DataFrame con detalle por cliente (ver docstring de clase).
        """
        # 1. Preparar datos
        df_all = self._preparar_clientes()
        if df_all.empty:
            print("⚠ No hay clientes con transacciones en el dominio.")
            return pd.DataFrame()

        impacto_ticket = self._calcular_impacto_ticket()

        # 2. Filtrar elegibles
        elegibles = self._filtrar_elegibles(df_all)
        if elegibles.empty:
            print(f"⚠ No hay clientes elegibles bajo los filtros actuales.")
            return pd.DataFrame()

        # 3-6. Procesar cada cliente
        resultados = []

        for _, row in elegibles.iterrows():
            # 3. Next-best-product
            producto_rec, prob_observada = self._asignar_next_best_product(
                row["productos_actuales"]
            )

            if producto_rec is None:
                continue  # Sin productos para recomendar

            # 4. Probabilidad de adopción ajustada
            prob_ajustada = prob_observada * escenario.factor_adopcion

            # 5a. Uplift en frecuencia
            delta_freq_raw = self._obtener_delta_frecuencia(row["n_productos"])
            uplift_freq = delta_freq_raw * escenario.factor_captura_frecuencia

            # 5b. Uplift en ticket
            info_ticket = impacto_ticket.get(producto_rec, {})
            uplift_ticket_raw = max(0.0, info_ticket.get("uplift_usd", 0.0))
            uplift_ticket = uplift_ticket_raw * escenario.factor_captura_ticket

            # 6. Proyección de volumen
            # ──────────────────────────────────────────────────────────────
            # Lógica:
            #   Si el cliente ADOPTA el producto (con probabilidad prob_ajustada):
            #     freq_nueva = freq_actual + uplift_freq
            #     ticket_nuevo = ticket_actual + uplift_ticket
            #     volumen_si_adopta = freq_nueva × ticket_nuevo
            #
            #   Si NO adopta (probabilidad 1 - prob_ajustada):
            #     volumen_si_no_adopta = volumen_actual
            #
            #   Volumen proyectado (valor esperado):
            #     V_proy = prob × V_si_adopta + (1 - prob) × V_actual
            #
            #   Volumen incremental = V_proy - V_actual
            # ──────────────────────────────────────────────────────────────
            freq_actual = row["n_transacciones"]
            ticket_actual = row["ticket_mean"]
            volumen_actual = row["volumen_actual"]

            freq_proyectada = freq_actual + uplift_freq
            ticket_proyectado = ticket_actual + uplift_ticket
            volumen_si_adopta = freq_proyectada * ticket_proyectado

            volumen_proyectado = (
                prob_ajustada * volumen_si_adopta
                + (1 - prob_ajustada) * volumen_actual
            )
            volumen_incremental = volumen_proyectado - volumen_actual

            resultados.append({
                "id_cliente": row["id_cliente"],
                "segmento": row["segmento"],
                "pais": row["pais"],
                "n_productos_actual": row["n_productos"],
                "productos_actuales": ", ".join(sorted(row["productos_actuales"])),
                "producto_recomendado": producto_rec,
                "prob_adopcion_observada": round(prob_observada, 4),
                "prob_adopcion_ajustada": round(prob_ajustada, 4),
                "freq_actual": freq_actual,
                "freq_proyectada": round(freq_proyectada, 2),
                "ticket_actual": round(ticket_actual, 2),
                "ticket_proyectado": round(ticket_proyectado, 2),
                "volumen_actual": round(volumen_actual, 2),
                "volumen_proyectado": round(volumen_proyectado, 2),
                "volumen_incremental": round(volumen_incremental, 2),
                "score_potencial": round(row["score_potencial"], 4),
                "escenario": escenario.nombre,
            })

        return pd.DataFrame(resultados)

    def simular_escenarios(
        self,
        escenarios: dict[str, EscenarioConfig] | None = None,
    ) -> dict[str, pd.DataFrame]:
        """
        Ejecuta la simulación para todos los escenarios configurados.

        Parameters
        ----------
        escenarios : dict, optional
            Si None, usa self.escenarios (los defaults o los pasados en __init__).

        Returns
        -------
        dict[nombre_escenario, DataFrame_detalle]
        """
        esc = escenarios or self.escenarios
        resultados = {}

        for nombre, config in esc.items():
            print(f"  ▸ Simulando escenario: {nombre}...")
            resultados[nombre] = self.simular(config)

        print("  ✅ Simulación completa.\n")
        return resultados

    # ───────────────────────────────────────────────────────────────────────
    # AGREGACIONES Y RESÚMENES
    # ───────────────────────────────────────────────────────────────────────

    @staticmethod
    def resumen_ejecutivo(resultados: dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Genera un resumen ejecutivo comparando los 3 escenarios.

        Métricas:
            - Clientes elegibles
            - Adopciones esperadas (sum de prob_ajustada)
            - Volumen incremental total
            - Uplift porcentual total
            - Uplift promedio por cliente
        """
        filas = []
        for nombre, df in resultados.items():
            if df.empty:
                filas.append({
                    "escenario": nombre,
                    "clientes_elegibles": 0,
                    "adopciones_esperadas": 0,
                    "volumen_actual_total": 0,
                    "volumen_incremental_total": 0,
                    "uplift_pct_total": 0,
                    "uplift_promedio_cliente": 0,
                })
                continue

            vol_actual = df["volumen_actual"].sum()
            vol_inc = df["volumen_incremental"].sum()

            filas.append({
                "escenario": nombre,
                "clientes_elegibles": len(df),
                "adopciones_esperadas": round(df["prob_adopcion_ajustada"].sum(), 1),
                "volumen_actual_total": round(vol_actual, 2),
                "volumen_incremental_total": round(vol_inc, 2),
                "uplift_pct_total": round(vol_inc / vol_actual * 100, 2) if vol_actual > 0 else 0,
                "uplift_promedio_cliente": round(vol_inc / len(df), 2),
            })

        return pd.DataFrame(filas)

    @staticmethod
    def resumen_por_producto(resultados: dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Resumen agregado por producto recomendado y escenario.

        Métricas por producto:
            - Veces recomendado
            - Volumen incremental agregado
            - Uplift de ticket promedio
            - Uplift de frecuencia promedio
        """
        todas = []
        for nombre, df in resultados.items():
            if df.empty:
                continue
            resumen = df.groupby("producto_recomendado").agg(
                veces_recomendado=("id_cliente", "count"),
                vol_incremental_total=("volumen_incremental", "sum"),
                ticket_uplift_medio=("ticket_proyectado", "mean"),
                ticket_actual_medio=("ticket_actual", "mean"),
                freq_uplift_media=("freq_proyectada", "mean"),
                freq_actual_media=("freq_actual", "mean"),
            ).reset_index()
            resumen["escenario"] = nombre
            resumen["delta_ticket_medio"] = (
                resumen["ticket_uplift_medio"] - resumen["ticket_actual_medio"]
            ).round(2)
            resumen["delta_freq_media"] = (
                resumen["freq_uplift_media"] - resumen["freq_actual_media"]
            ).round(2)
            todas.append(resumen)

        return pd.concat(todas, ignore_index=True) if todas else pd.DataFrame()

    @staticmethod
    def resumen_por_segmento_pais(resultados: dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Resumen estratégico por segmento y país para cada escenario.
        """
        todas = []
        for nombre, df in resultados.items():
            if df.empty:
                continue
            resumen = df.groupby(["segmento", "pais"]).agg(
                n_clientes=("id_cliente", "count"),
                vol_actual=("volumen_actual", "sum"),
                vol_incremental=("volumen_incremental", "sum"),
                score_medio=("score_potencial", "mean"),
            ).reset_index()
            resumen["escenario"] = nombre
            resumen["uplift_pct"] = (
                resumen["vol_incremental"] / resumen["vol_actual"] * 100
            ).round(2)
            todas.append(resumen)

        return pd.concat(todas, ignore_index=True) if todas else pd.DataFrame()

    # ───────────────────────────────────────────────────────────────────────
    # EXPORTAR
    # ───────────────────────────────────────────────────────────────────────

    def exportar_excel(
        self,
        resultados: dict[str, pd.DataFrame],
        ruta: str = "simulacion_cross_sell.xlsx",
    ) -> None:
        """
        Exporta todos los resultados a un archivo Excel multi-hoja.

        Hojas generadas:
            - Resumen Ejecutivo
            - Resumen por Producto
            - Resumen Segmento-País
            - Detalle {escenario} (una hoja por escenario)
            - Matriz Adopción
            - Impacto Ticket
            - Tabla Frecuencia
        """
        try:
            import openpyxl  # noqa: F401
        except ImportError:
            print("⚠ Instala openpyxl para exportar a Excel: pip install openpyxl")
            print("  Exportando a CSV como alternativa...")
            self._exportar_csvs(resultados, ruta.replace(".xlsx", ""))
            return

        with pd.ExcelWriter(ruta, engine="openpyxl") as writer:
            # Resúmenes
            self.resumen_ejecutivo(resultados).to_excel(
                writer, sheet_name="Resumen Ejecutivo", index=False
            )
            self.resumen_por_producto(resultados).to_excel(
                writer, sheet_name="Resumen Producto", index=False
            )
            self.resumen_por_segmento_pais(resultados).to_excel(
                writer, sheet_name="Resumen Segmento-País", index=False
            )

            # Detalle por escenario
            for nombre, df in resultados.items():
                sheet = f"Detalle {nombre.capitalize()}"[:31]  # Excel max 31 chars
                df.to_excel(writer, sheet_name=sheet, index=False)

            # Tablas intermedias
            self._calcular_matriz_adopcion().to_excel(
                writer, sheet_name="Matriz Adopción"
            )

            imp = self._calcular_impacto_ticket()
            if imp:
                pd.DataFrame(imp).T.to_excel(
                    writer, sheet_name="Impacto Ticket"
                )

            self._calcular_uplift_frecuencia().to_excel(
                writer, sheet_name="Tabla Frecuencia", index=False
            )

        print(f"  📄 Resultados exportados a: {ruta}")

    @staticmethod
    def _exportar_csvs(resultados: dict[str, pd.DataFrame], prefijo: str) -> None:
        """Fallback: exporta cada escenario como CSV separado."""
        for nombre, df in resultados.items():
            path = f"{prefijo}_{nombre}.csv"
            df.to_csv(path, index=False)
            print(f"  📄 {path}")

    # ───────────────────────────────────────────────────────────────────────
    # VISUALIZACIONES (OPCIONALES)
    # ───────────────────────────────────────────────────────────────────────

    @staticmethod
    def visualizar_resultados(resultados: dict[str, pd.DataFrame]) -> None:
        """
        Genera un dashboard de 5 gráficos con los resultados de la simulación.

        Gráficos:
            1. Barras: volumen incremental por escenario
            2. Top 15 clientes por upside esperado (escenario base)
            3. Donut: distribución por producto recomendado
            4. Heatmap: adopciones esperadas por segmento × producto
            5. Scatter: score potencial vs volumen incremental
        """
        import matplotlib.pyplot as plt
        import seaborn as sns

        fig, axes = plt.subplots(2, 3, figsize=(20, 12))
        fig.suptitle(
            "Dashboard de Simulación Cross-Sell",
            fontsize=16, fontweight="bold", y=1.02,
        )

        # ── 1. Barras por escenario ──────────────────────────────────────
        ax = axes[0, 0]
        nombres = []
        incrementos = []
        colores_esc = {"conservador": "#3b82f6", "base": "#22c55e", "agresivo": "#f59e0b"}

        for nombre, df in resultados.items():
            nombres.append(nombre.capitalize())
            incrementos.append(df["volumen_incremental"].sum() if not df.empty else 0)

        bars = ax.bar(
            nombres, incrementos,
            color=[colores_esc.get(n.lower(), "#888") for n in nombres],
            edgecolor="white", linewidth=1.5
        )
        for bar, val in zip(bars, incrementos):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                    f"${val:,.0f}", ha="center", va="bottom", fontweight="bold", fontsize=9)

        ax.set_ylabel("Volumen Incremental (USD)")
        ax.set_title("Volumen Incremental por Escenario", fontweight="bold")

        import matplotlib.ticker as ticker
        ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda y, p: f"${y:,.0f}"))

        # ── 2. Top clientes (escenario base) ─────────────────────────────
        ax = axes[0, 1]
        df_base = resultados.get("base", pd.DataFrame())
        if not df_base.empty:
            top15 = df_base.nlargest(15, "volumen_incremental")
            y_pos = range(len(top15))
            colores = plt.cm.RdYlGn(
                np.linspace(0.3, 0.9, len(top15))
            )[::-1]
            ax.barh(y_pos, top15["volumen_incremental"].values,
                    color=colores, edgecolor="white")
            ax.set_yticks(y_pos)
            ax.set_yticklabels(
                [f"Cli. {int(r['id_cliente'])} ({r['segmento']})"
                 for _, r in top15.iterrows()],
                fontsize=8
            )
            ax.invert_yaxis()
            ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda y, p: f"${y:,.0f}"))

        ax.set_title("Top 15 Clientes — Upside (Esc. Base)", fontweight="bold")

        # ── 3. Donut por producto recomendado ────────────────────────────
        ax = axes[0, 2]
        if not df_base.empty:
            prod_counts = df_base["producto_recomendado"].value_counts()
            wedges, texts, autotexts = ax.pie(
                prod_counts.values, labels=prod_counts.index,
                autopct="%1.0f%%", startangle=90,
                wedgeprops={"linewidth": 1.5, "edgecolor": "white"},
                textprops={"fontsize": 9},
            )
            centre = plt.Circle((0, 0), 0.55, fc="white")
            ax.add_patch(centre)

        ax.set_title("Distribución de Recomendaciones", fontweight="bold")

        # ── 4. Heatmap segmento × producto ───────────────────────────────
        ax = axes[1, 0]
        if not df_base.empty:
            pivot = df_base.groupby(
                ["segmento", "producto_recomendado"]
            )["volumen_incremental"].sum().unstack(fill_value=0)

            sns.heatmap(
                pivot, annot=True, fmt=",.0f", cmap="YlGn",
                ax=ax, linewidths=0.5,
                cbar_kws={"label": "Vol. Incremental (USD)"}
            )
            ax.set_xlabel("Producto Recomendado")
            ax.set_ylabel("Segmento")

        ax.set_title("Volumen Incremental: Segmento × Producto", fontweight="bold")

        # ── 5. Scatter: score vs volumen incremental ─────────────────────
        ax = axes[1, 1]
        if not df_base.empty:
            scatter = ax.scatter(
                df_base["score_potencial"],
                df_base["volumen_incremental"],
                c=df_base["prob_adopcion_ajustada"],
                cmap="YlOrRd", alpha=0.7, s=50, edgecolors="white"
            )
            plt.colorbar(scatter, ax=ax, label="Prob. Adopción Ajustada")
            ax.set_xlabel("Score de Potencial", fontweight="bold")
            ax.set_ylabel("Volumen Incremental (USD)", fontweight="bold")
            ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda y, p: f"${y:,.0f}"))

        ax.set_title("Score Potencial vs Volumen Incremental", fontweight="bold")

        # ── 6. Tabla resumen compacta ────────────────────────────────────
        ax = axes[1, 2]
        ax.axis("off")
        texto = "RESUMEN DE SIMULACIÓN\n" + "═" * 40 + "\n\n"

        for nombre, df in resultados.items():
            if df.empty:
                continue
            vol_inc = df["volumen_incremental"].sum()
            vol_act = df["volumen_actual"].sum()
            pct = vol_inc / vol_act * 100 if vol_act > 0 else 0
            adop = df["prob_adopcion_ajustada"].sum()
            texto += (
                f"▸ {nombre.upper()}\n"
                f"  Clientes: {len(df)}  |  Adopt. esp.: {adop:.0f}\n"
                f"  Vol. Incr.: ${vol_inc:,.0f}  ({pct:.1f}%)\n\n"
            )

        ax.text(
            0.05, 0.95, texto, transform=ax.transAxes,
            fontsize=10, verticalalignment="top", fontfamily="monospace",
            bbox=dict(boxstyle="round", facecolor="lightyellow", alpha=0.6)
        )

        plt.tight_layout()
        plt.show()

    # ───────────────────────────────────────────────────────────────────────
    # DIAGNÓSTICO
    # ───────────────────────────────────────────────────────────────────────

    def diagnostico(self) -> None:
        """
        Imprime un resumen diagnóstico de las tablas intermedias
        para validar que los datos están correctamente calculados.
        """
        df = self._preparar_clientes()
        matriz = self._calcular_matriz_adopcion()
        impacto = self._calcular_impacto_ticket()
        freq = self._calcular_uplift_frecuencia()

        print("=" * 60)
        print("DIAGNÓSTICO DEL SIMULADOR")
        print("=" * 60)

        print(f"\n📊 Clientes totales: {len(df)}")
        print(f"📦 Tipos de producto: {self._tipos_producto}")
        print(f"📋 Filtros activos:")
        print(f"   max_productos = {self.filtros.max_productos}")
        print(f"   score_minimo  = {self.filtros.score_minimo}")
        print(f"   segmentos     = {self.filtros.segmentos or 'todos'}")
        print(f"   paises        = {self.filtros.paises or 'todos'}")

        elegibles = self._filtrar_elegibles(df)
        print(f"\n🎯 Clientes elegibles: {len(elegibles)}")

        print(f"\n📐 Matriz de adopción P(B|A):")
        print(matriz.to_string())

        print(f"\n💰 Impacto en ticket por producto:")
        for prod, info in impacto.items():
            sig = "★" if info["significativo"] else " "
            print(f"   {sig} {prod}: Δ${info['uplift_usd']:,.2f} "
                  f"(p={info['p_value']:.4f})")

        print(f"\n📈 Tabla de frecuencia por penetración:")
        print(freq.to_string(index=False))

        print("\n" + "=" * 60)
