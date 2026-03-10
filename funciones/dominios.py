"""
Capa de dominio: entidades OOP con referencias entre objetos.

Cliente, Producto y Transaccion forman un grafo de objetos navegable.
Las 3 fuentes de datos se unifican como una sola entidad mediante
cargar_dominio(), que sigue el flujo:

    CSV → normalizar_dtypes (campos.py) → auditoria (limpieza.py) → objetos OOP

Si la auditoría detecta problemas, cargar_dominio() lanza un error
(o continua con advertencia si se indica).
"""

from dataclasses import dataclass, field
from datetime import datetime

import pandas as pd

from funciones.campos import normalizar_dtypes
from funciones.limpieza import auditoria_completa


@dataclass
class Cliente:
    """
    Representa un cliente individual.

    Responsabilidad:
    - Almacenar y exponer la información del cliente
    - Agrupar sus transacciones asociadas
    """
    id_cliente: int
    nombre: str
    edad: int
    genero: str
    pais: str
    segmento: str
    _transacciones: list = field(default_factory=list, repr=False)

    @property
    def transacciones(self) -> list:
        """Lista de transacciones asociadas a este cliente."""
        return self._transacciones

    def agregar_transaccion(self, transaccion: "Transaccion") -> None:
        """Registra una transacción en el historial del cliente."""
        self._transacciones.append(transaccion)


@dataclass
class Producto:
    """
    Representa un producto financiero.

    Responsabilidad:
    - Almacenar información maestra del producto
    - Servir como catálogo normalizado
    """
    id_producto: int
    nombre_producto: str
    tipo_producto: str
    tasa_interes: float
    moneda: str


@dataclass
class Transaccion:
    """
    Representa un evento transaccional.

    Usa referencias a objetos Cliente y Producto (no solo IDs),
    permitiendo navegación directa: transaccion.cliente.nombre
    """
    id_transaccion: int
    cliente: Cliente
    producto: Producto
    fecha: datetime
    monto: float
    tipo_transaccion: str

    @property
    def id_cliente(self) -> int:
        """ID del cliente (conveniencia para compatibilidad)."""
        return self.cliente.id_cliente

    @property
    def id_producto(self) -> int:
        """ID del producto (conveniencia para compatibilidad)."""
        return self.producto.id_producto

    @property
    def monto_usd(self) -> float:
        """Monto convertido a USD usando tasas de cambio estáticas."""
        tasas = {"USD": 1.0, "COP": 1/3771.28, "EUR": 1/0.86}
        return self.monto * tasas.get(self.producto.moneda, 1.0)


@dataclass
class Dominio:
    """
    Contenedor principal que unifica las 3 fuentes como una sola entidad.

    Permite acceso directo a listas y lookups:
        dominio.clientes          -> lista de Cliente
        dominio.cliente(1001)     -> Cliente por ID
        dominio.transacciones     -> lista de Transaccion
        dominio.auditoria         -> resultados de la auditoría
    """
    clientes: list[Cliente]
    productos: list[Producto]
    transacciones: list[Transaccion]
    auditoria: dict

    _clientes_idx: dict[int, Cliente] = field(default_factory=dict, repr=False)
    _productos_idx: dict[int, Producto] = field(default_factory=dict, repr=False)

    def __post_init__(self):
        self._clientes_idx = {c.id_cliente: c for c in self.clientes}
        self._productos_idx = {p.id_producto: p for p in self.productos}

    def cliente(self, id_cliente: int) -> Cliente | None:
        """Busca un cliente por ID."""
        return self._clientes_idx.get(id_cliente)

    def producto(self, id_producto: int) -> Producto | None:
        """Busca un producto por ID."""
        return self._productos_idx.get(id_producto)

    @property
    def es_valido(self) -> bool:
        """True si la auditoría no encontró problemas."""
        return self.auditoria.get("es_valido", False)


def cargar_dominio(
    clientes_df: pd.DataFrame,
    productos_df: pd.DataFrame,
    transacciones_df: pd.DataFrame,
    *,
    strict: bool = True,
) -> Dominio:
    """
    Flujo completo: normalizar → auditar → construir objetos OOP.

    Args:
        clientes_df: DataFrame raw de clientes.
        productos_df: DataFrame raw de catálogo de productos.
        transacciones_df: DataFrame raw de transacciones.
        strict: Si True, lanza ValueError cuando la auditoría falla.
            Si False, construye los objetos con advertencia.

    Returns:
        Instancia de Dominio con todo conectado.

    Raises:
        ValueError: Si strict=True y la data no pasa la auditoría.
    """
    # 1. Normalizar dtypes
    clientes_df = normalizar_dtypes(clientes_df.copy(), "clientes")
    productos_df = normalizar_dtypes(productos_df.copy(), "catalogo_productos")
    transacciones_df = normalizar_dtypes(transacciones_df.copy(), "transacciones")

    # 2. Auditar
    resultado_auditoria = auditoria_completa(clientes_df, productos_df, transacciones_df)

    if not resultado_auditoria["es_valido"] and strict:
        raise ValueError(
            "La data no pasó la auditoría de limpieza. "
            "Usa strict=False para cargar de todas formas."
        )

    # 3. Construir objetos
    clientes = {}
    for _, row in clientes_df.iterrows():
        c = Cliente(
            id_cliente=int(row["id_cliente"]),
            nombre=str(row["nombre"]),
            edad=int(row["edad"]),
            genero=str(row["genero"]),
            pais=str(row["pais"]),
            segmento=str(row["segmento"]),
        )
        clientes[c.id_cliente] = c

    productos = {}
    for _, row in productos_df.iterrows():
        p = Producto(
            id_producto=int(row["id_producto"]),
            nombre_producto=str(row["nombre_producto"]),
            tipo_producto=str(row["tipo_producto"]),
            tasa_interes=float(row["tasa_interes"]),
            moneda=str(row["moneda"]),
        )
        productos[p.id_producto] = p

    transacciones = []
    for _, row in transacciones_df.iterrows():
        cliente = clientes.get(int(row["id_cliente"]))
        producto = productos.get(int(row["id_producto"]))
        if cliente is None or producto is None:
            continue
        t = Transaccion(
            id_transaccion=int(row["id_transaccion"]),
            cliente=cliente,
            producto=producto,
            fecha=pd.to_datetime(row["fecha"]),
            monto=float(row["monto"]),
            tipo_transaccion=str(row["tipo_transaccion"]),
        )
        transacciones.append(t)
        cliente.agregar_transaccion(t)

    return Dominio(
        clientes=list(clientes.values()),
        productos=list(productos.values()),
        transacciones=transacciones,
        auditoria=resultado_auditoria,
    )
