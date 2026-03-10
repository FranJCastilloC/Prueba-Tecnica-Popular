"""
Definición atómica de campos y esquemas de entidades.

Cada campo se define UNA sola vez en CAMPOS con todas sus restricciones:
dtype, nullable, unique, regla de dominio y si es campo de texto.

Las entidades (ESQUEMA) referencian esos campos por nombre, sin duplicar
definiciones. Esto es el contrato de datos: la fuente de verdad.
"""

import pandas as pd


# =========================================================
# CATÁLOGO DE CAMPOS
# =========================================================

CAMPOS = {
    # --- IDs ---
    "id_cliente": {
        "dtype": "int64",
        "nullable": False,
        "unique": True,
        "texto": False,
    },
    "id_producto": {
        "dtype": "int64",
        "nullable": False,
        "unique": True,
        "texto": False,
    },
    "id_transaccion": {
        "dtype": "int64",
        "nullable": False,
        "unique": True,
        "texto": False,
    },

    # --- Clientes ---
    "nombre": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
    },
    "edad": {
        "dtype": "int64",
        "nullable": False,
        "unique": False,
        "texto": False,
        "regla": {"tipo": "rango", "min_val": 18, "max_val": 100},
    },
    "genero": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
        "regla": {"tipo": "enumerado", "valores_validos": {"M", "F"}},
    },
    "pais": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
        "regla": {"tipo": "categoria"},
    },
    "segmento": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
        "regla": {"tipo": "categoria"},
    },

    # --- Productos ---
    "nombre_producto": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
    },
    "tipo_producto": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
        "regla": {"tipo": "categoria"},
    },
    "tasa_interes": {
        "dtype": "float64",
        "nullable": False,
        "unique": False,
        "texto": False,
        "regla": {"tipo": "rango", "min_val": 0, "max_val": 1},
    },
    "moneda": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
        "regla": {"tipo": "categoria"},
    },

    # --- Transacciones ---
    "fecha": {
        "dtype": "datetime64[ns]",
        "nullable": False,
        "unique": False,
        "texto": False,
        "regla": {"tipo": "fecha"},
    },
    "monto": {
        "dtype": "float64",
        "nullable": False,
        "unique": False,
        "texto": False,
        "regla": {"tipo": "positivo", "min_val": 0},
    },
    "tipo_transaccion": {
        "dtype": "object",
        "nullable": False,
        "unique": False,
        "texto": True,
        "regla": {"tipo": "categoria"},
    },
}


# =========================================================
# ESQUEMAS DE ENTIDAD (referencian CAMPOS, no duplican)
# =========================================================

ESQUEMA = {
    "clientes": {
        "campos": [
            "id_cliente", "nombre", "edad", "genero", "pais", "segmento",
        ],
        "clave_primaria": ["id_cliente"],
        "relaciones": [],
    },
    "catalogo_productos": {
        "campos": [
            "id_producto", "nombre_producto", "tipo_producto",
            "tasa_interes", "moneda",
        ],
        "clave_primaria": ["id_producto"],
        "relaciones": [],
    },
    "transacciones": {
        "campos": [
            "id_transaccion", "id_cliente", "id_producto",
            "fecha", "monto", "tipo_transaccion",
        ],
        "clave_primaria": ["id_transaccion"],
        "relaciones": [
            {
                "columna_fk": "id_cliente",
                "referencia": "clientes",
                "columna_pk": "id_cliente",
            },
            {
                "columna_fk": "id_producto",
                "referencia": "catalogo_productos",
                "columna_pk": "id_producto",
            },
        ],
    },
}


# =========================================================
# FUNCIONES DE RESOLUCIÓN (derivan todo desde CAMPOS + ESQUEMA)
# =========================================================

def obtener_dtypes(entidad: str) -> dict[str, str]:
    """Devuelve {columna: dtype} para una entidad."""
    return {
        campo: CAMPOS[campo]["dtype"]
        for campo in ESQUEMA[entidad]["campos"]
    }


def obtener_reglas_dominio(entidad: str) -> list[dict]:
    """Construye la lista de reglas de dominio para una entidad."""
    reglas = []
    for campo in ESQUEMA[entidad]["campos"]:
        definicion = CAMPOS[campo]
        if "regla" not in definicion:
            continue
        regla = {"columna": campo, **definicion["regla"]}
        reglas.append(regla)
    return reglas


def obtener_columnas_texto(entidad: str) -> list[str]:
    """Devuelve las columnas de texto de una entidad."""
    return [
        campo for campo in ESQUEMA[entidad]["campos"]
        if CAMPOS[campo].get("texto", False)
    ]


def obtener_columnas_clave(entidad: str) -> list[str]:
    """Devuelve las columnas de clave primaria de una entidad."""
    return ESQUEMA[entidad]["clave_primaria"]


def obtener_columnas_no_nullable(entidad: str) -> list[str]:
    """Devuelve las columnas que no aceptan nulos."""
    return [
        campo for campo in ESQUEMA[entidad]["campos"]
        if not CAMPOS[campo].get("nullable", True)
    ]


def obtener_columnas_unique(entidad: str) -> list[str]:
    """Devuelve las columnas que deben tener valores únicos."""
    return [
        campo for campo in ESQUEMA[entidad]["campos"]
        if CAMPOS[campo].get("unique", False)
    ]


def obtener_relaciones(entidad: str) -> list[dict]:
    """Devuelve las relaciones FK de una entidad."""
    return ESQUEMA[entidad]["relaciones"]


def normalizar_dtypes(df: pd.DataFrame, entidad: str) -> pd.DataFrame:
    """
    Aplica los tipos de datos definidos para la entidad al DataFrame.

    Args:
        df: DataFrame a normalizar.
        entidad: Nombre de la entidad en ESQUEMA.

    Returns:
        DataFrame con dtypes aplicados.
    """
    dtypes = obtener_dtypes(entidad)
    for col, dtype in dtypes.items():
        if col not in df.columns:
            continue
        if dtype == "datetime64[ns]":
            df[col] = pd.to_datetime(df[col], errors="coerce")
        else:
            df[col] = df[col].astype(dtype)
    return df
