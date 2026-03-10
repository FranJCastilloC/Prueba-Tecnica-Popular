"""
Módulo de auditoría y limpieza de datos para DataFrames de pandas.

Qué te revisa este código
-------------------------
Este bloque valida:

- Nulos: valores faltantes por columna
- Duplicados: filas duplicadas (completas o por clave)
- IDs duplicados en claves primarias
- Género inválido (valores fuera del dominio esperado)
- Edades fuera de rango
- Tasas de interés absurdas (fuera de [0, 1])
- Fechas inválidas (no parseables)
- Montos menores o iguales a cero
- Tipos de transacción (dominios categóricos)
- Integridad referencial:
  - Que todo id_cliente de transacciones exista en clientes
  - Que todo id_producto de transacciones exista en catalogo_productos
- Problemas de texto:
  - Espacios basura (al inicio o final)
  - Strings vacíos
- Dominios raros (valores fuera de lo esperado en columnas categóricas)

Todas las funciones retornan un dict de hallazgos además de imprimir,
para que el flujo pueda decidir programáticamente si la data es apta.
"""

import pandas as pd

from funciones.campos import (
    obtener_columnas_clave,
    obtener_columnas_texto,
    obtener_reglas_dominio,
    obtener_relaciones,
)


# =========================================================
# 1. FUNCIONES DE AUDITORÍA GENÉRICAS
# =========================================================


def resumen_general_df(nombre: str, df: pd.DataFrame) -> dict:
    """
    Imprime y retorna un resumen general de un DataFrame.

    Args:
        nombre: Identificador del DataFrame para el reporte.
        df: DataFrame a auditar.

    Returns:
        Dict con filas, columnas, dtypes.
    """
    print(f"\n{'='*80}")
    print(f"RESUMEN GENERAL -> {nombre}")
    print(f"{'='*80}")
    print(f"Filas: {df.shape[0]}")
    print(f"Columnas: {df.shape[1]}")
    print("\nColumnas:")
    print(df.columns.tolist())
    print("\nTipos de datos:")
    print(df.dtypes)
    print("\nPrimeras filas:")
    print(df.head())

    return {
        "filas": df.shape[0],
        "columnas": df.shape[1],
        "dtypes": df.dtypes.to_dict(),
    }


def revisar_nulos(nombre: str, df: pd.DataFrame) -> dict:
    """
    Analiza y reporta valores nulos por columna.

    Args:
        nombre: Identificador del DataFrame para el reporte.
        df: DataFrame a auditar.

    Returns:
        Dict con total de nulos y detalle por columna.
    """
    print(f"\n{'-'*80}")
    print(f"NULOS -> {nombre}")
    print(f"{'-'*80}")
    nulos = df.isnull().sum()
    pct_nulos = (nulos / len(df)) * 100

    resultado = pd.DataFrame({
        'nulos': nulos,
        'porcentaje_%': pct_nulos.round(2)
    }).sort_values(by='nulos', ascending=False)

    print(resultado)

    total = int(nulos.sum())
    detalle = {col: int(n) for col, n in nulos.items() if n > 0}
    return {"total_nulos": total, "detalle": detalle}


def revisar_duplicados(
    nombre: str,
    df: pd.DataFrame,
    columnas_clave: list[str] | None = None,
) -> dict:
    """
    Detecta filas duplicadas (completas o por clave).

    Args:
        nombre: Identificador del DataFrame para el reporte.
        df: DataFrame a auditar.
        columnas_clave: Columnas que definen unicidad. Si es None,
            solo se revisan duplicados exactos de fila completa.

    Returns:
        Dict con conteos de duplicados exactos y por clave.
    """
    print(f"\n{'-'*80}")
    print(f"DUPLICADOS -> {nombre}")
    print(f"{'-'*80}")

    total_exactos = int(df.duplicated().sum())
    print(f"Duplicados exactos (fila completa): {total_exactos}")

    resultado = {"duplicados_exactos": total_exactos, "duplicados_clave": 0}

    if columnas_clave:
        columnas_existentes = [c for c in columnas_clave if c in df.columns]
        if columnas_existentes:
            dup_clave = int(df.duplicated(subset=columnas_existentes).sum())
            print(f"Duplicados por clave {columnas_existentes}: {dup_clave}")
            resultado["duplicados_clave"] = dup_clave

            if dup_clave > 0:
                print("\nEjemplos de duplicados por clave:")
                print(df[df.duplicated(subset=columnas_existentes, keep=False)]
                      .sort_values(by=columnas_existentes)
                      .head(10))

    return resultado


def revisar_dominios(
    df: pd.DataFrame,
    nombre: str,
    reglas: list[dict],
) -> list[dict]:
    """
    Valida dominios de columnas según reglas configurables.

    Cada regla es un dict con:
        - columna (str): nombre de la columna a validar
        - tipo (str): 'enumerado' | 'rango' | 'positivo' | 'fecha' | 'categoria'
        - valores_validos (set|list): para tipo 'enumerado'
        - min_val, max_val (float|int): para tipo 'rango' o 'positivo'

    Args:
        df: DataFrame a auditar.
        nombre: Identificador para el reporte.
        reglas: Lista de reglas de validación.

    Returns:
        Lista de hallazgos, cada uno con columna, tipo y cantidad de inválidos.
    """
    print(f"\n{'-'*80}")
    print(f"REVISIÓN DE DOMINIOS -> {nombre}")
    print(f"{'-'*80}")

    hallazgos = []

    for regla in reglas:
        col = regla.get('columna')
        if col not in df.columns:
            continue

        tipo = regla.get('tipo', 'categoria')

        if tipo == 'enumerado':
            valores_validos = set(regla.get('valores_validos', []))
            invalidos = df[~df[col].isin(valores_validos)]
            n = len(invalidos)
            print(f"\nRegistros con {col} inválido (fuera de {valores_validos}): {n}")
            if n > 0:
                print(invalidos.head(10))
            hallazgos.append({"columna": col, "tipo": tipo, "invalidos": n})

        elif tipo == 'rango':
            min_val = regla.get('min_val')
            max_val = regla.get('max_val')
            mask = pd.Series(False, index=df.index)
            if min_val is not None:
                mask = mask | (df[col] < min_val)
            if max_val is not None:
                mask = mask | (df[col] > max_val)
            invalidos = df[mask]
            n = len(invalidos)
            rango_str = f"[{min_val}, {max_val}]"
            print(f"\nRegistros con {col} fuera de rango {rango_str}: {n}")
            if n > 0:
                print(invalidos.head(10))
            hallazgos.append({"columna": col, "tipo": tipo, "invalidos": n})

        elif tipo == 'positivo':
            min_val = regla.get('min_val', 0)
            invalidos = df[df[col] <= min_val]
            n = len(invalidos)
            print(f"\nRegistros con {col} <= {min_val}: {n}")
            if n > 0:
                print(invalidos.head(10))
            hallazgos.append({"columna": col, "tipo": tipo, "invalidos": n})

        elif tipo == 'fecha':
            fechas = pd.to_datetime(df[col], errors='coerce')
            invalidos = df[fechas.isna()]
            n = len(invalidos)
            print(f"\nRegistros con {col} inválida (no parseable): {n}")
            if n > 0:
                print(invalidos.head(10))
            hallazgos.append({"columna": col, "tipo": tipo, "invalidos": n})

        if tipo == 'categoria' or regla.get('mostrar_unicos', tipo == 'categoria'):
            print(f"\nValores únicos en {col}:")
            print(sorted(df[col].dropna().unique().tolist()))

    return hallazgos


def revisar_integridad_referencial(
    df_principal: pd.DataFrame,
    nombre_principal: str,
    relaciones: list[dict],
) -> list[dict]:
    """
    Verifica que las FK del DataFrame principal existan en tablas de referencia.

    Cada relación es un dict con:
        - columna_fk (str): columna de clave foránea en df_principal
        - df_referencia (pd.DataFrame): tabla de referencia
        - columna_pk (str): columna de clave primaria en df_referencia

    Args:
        df_principal: DataFrame que contiene las claves foráneas.
        nombre_principal: Identificador del DataFrame principal.
        relaciones: Lista de relaciones a validar.

    Returns:
        Lista de hallazgos con columna FK y cantidad de huérfanos.
    """
    print(f"\n{'-'*80}")
    print(f"INTEGRIDAD REFERENCIAL -> {nombre_principal}")
    print(f"{'-'*80}")

    hallazgos = []

    for rel in relaciones:
        col_fk = rel.get('columna_fk')
        df_ref = rel.get('df_referencia')
        col_pk = rel.get('columna_pk', col_fk)

        if col_fk not in df_principal.columns or df_ref is None:
            continue

        valores_validos = set(df_ref[col_pk])
        huerfanos = df_principal[~df_principal[col_fk].isin(valores_validos)]
        n = len(huerfanos)
        print(f"\nRegistros con {col_fk} inexistente en referencia: {n}")
        if n > 0:
            print(huerfanos[[col_fk]].head(10))
        hallazgos.append({"columna_fk": col_fk, "huerfanos": n})

    return hallazgos


def revisar_texto(
    nombre: str,
    df: pd.DataFrame,
    columnas_texto: list[str],
) -> list[dict]:
    """
    Audita la calidad de columnas de texto (espacios, vacíos, distribución).

    Args:
        nombre: Identificador del DataFrame para el reporte.
        df: DataFrame a auditar.
        columnas_texto: Lista de nombres de columnas a revisar.

    Returns:
        Lista de hallazgos con espacios y vacíos por columna.
    """
    print(f"\n{'-'*80}")
    print(f"CALIDAD DE TEXTO -> {nombre}")
    print(f"{'-'*80}")

    hallazgos = []

    for col in columnas_texto:
        if col not in df.columns:
            continue
        como_str = df[col].astype(str)
        espacios = int((como_str.str.strip() != como_str).sum())
        vacios = int((como_str.str.strip() == '').sum())
        print(f"\nColumna: {col}")
        print(f"Espacios al inicio/final: {espacios}")
        print(f"Vacíos como string: {vacios}")
        print("Ejemplos de valores únicos:")
        print(df[col].dropna().astype(str).str.strip().value_counts().head(10))
        hallazgos.append({"columna": col, "espacios": espacios, "vacios": vacios})

    return hallazgos


# =========================================================
# 2. AUDITORÍA DE UNA ENTIDAD (genérica)
# =========================================================


def auditoria_entidad(
    df: pd.DataFrame,
    entidad: str,
) -> dict:
    """
    Ejecuta auditoría completa sobre un DataFrame usando el esquema de campos.py.

    Args:
        df: DataFrame a auditar.
        entidad: Nombre de la entidad en ESQUEMA ('clientes', etc.).

    Returns:
        Dict con todos los hallazgos. 'es_valido' es True si no hay problemas.
    """
    resultado = {
        "entidad": entidad,
        "resumen": resumen_general_df(entidad, df),
        "nulos": revisar_nulos(entidad, df),
        "duplicados": revisar_duplicados(
            entidad, df,
            columnas_clave=obtener_columnas_clave(entidad),
        ),
        "dominios": revisar_dominios(
            df, entidad,
            obtener_reglas_dominio(entidad),
        ),
        "texto": revisar_texto(
            entidad, df,
            obtener_columnas_texto(entidad),
        ),
    }

    resultado["es_valido"] = (
        resultado["nulos"]["total_nulos"] == 0
        and resultado["duplicados"]["duplicados_clave"] == 0
        and all(h["invalidos"] == 0 for h in resultado["dominios"])
        and all(h["espacios"] == 0 and h["vacios"] == 0 for h in resultado["texto"])
    )

    estado = "LIMPIO" if resultado["es_valido"] else "CON PROBLEMAS"
    print(f"\n{'='*80}")
    print(f"RESULTADO -> {entidad}: {estado}")
    print(f"{'='*80}")

    return resultado


# =========================================================
# 3. AUDITORÍA COMPLETA (múltiples entidades + integridad)
# =========================================================


def auditoria_completa(
    clientes: pd.DataFrame,
    catalogo_productos: pd.DataFrame,
    transacciones: pd.DataFrame,
) -> dict:
    """
    Auditoría completa del esquema clientes / catálogo / transacciones.

    Ejecuta validaciones por entidad + integridad referencial.

    Args:
        clientes: DataFrame de clientes.
        catalogo_productos: DataFrame de catálogo de productos.
        transacciones: DataFrame de transacciones.

    Returns:
        Dict con resultados por entidad, integridad y flag global 'es_valido'.
    """
    resultados = {
        "clientes": auditoria_entidad(clientes, "clientes"),
        "catalogo_productos": auditoria_entidad(catalogo_productos, "catalogo_productos"),
        "transacciones": auditoria_entidad(transacciones, "transacciones"),
    }

    dfs = {"clientes": clientes, "catalogo_productos": catalogo_productos}
    relaciones_raw = obtener_relaciones("transacciones")
    relaciones = [
        {**rel, "df_referencia": dfs[rel["referencia"]]}
        for rel in relaciones_raw
    ]
    resultados["integridad"] = revisar_integridad_referencial(
        transacciones, "transacciones", relaciones,
    )

    resultados["es_valido"] = (
        all(r["es_valido"] for r in [resultados["clientes"], resultados["catalogo_productos"], resultados["transacciones"]])
        and all(h["huerfanos"] == 0 for h in resultados["integridad"])
    )

    estado = "TODO LIMPIO" if resultados["es_valido"] else "HAY PROBLEMAS"
    print(f"\n{'#'*80}")
    print(f"AUDITORÍA GLOBAL: {estado}")
    print(f"{'#'*80}")

    return resultados


# =========================================================
# 4. EJECUCIÓN (solo cuando se ejecuta como script)
# =========================================================

if __name__ == '__main__':
    from funciones.campos import normalizar_dtypes

    _DATA_PATH = 'data'
    clientes = normalizar_dtypes(pd.read_csv(f'{_DATA_PATH}/clientes.csv'), 'clientes')
    catalogo_productos = normalizar_dtypes(pd.read_csv(f'{_DATA_PATH}/catalogo_productos.csv'), 'catalogo_productos')
    transacciones = normalizar_dtypes(pd.read_csv(f'{_DATA_PATH}/transacciones.csv'), 'transacciones')
    auditoria_completa(clientes, catalogo_productos, transacciones)
