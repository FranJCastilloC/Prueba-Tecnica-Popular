# Modelo de Análisis ML — Documentación Técnica y de Negocio

## Resumen ejecutivo

El sistema combina un modelo de regresión lineal (OLS) con lógica de segmentación y análisis de cross-sell para responder tres preguntas de negocio:

1. **¿Qué explica el volumen de un cliente?** → Regresión OLS
2. **¿Quién está por debajo de su potencial y cómo reactivarlo?** → Estrategia de activación
3. **¿Qué productos le faltan a cada cliente?** → Cross-sell

---

## Parte 1 — Regresión Multivariable (OLS)

### ¿Qué es y por qué se usa?

OLS (*Ordinary Least Squares*, mínimos cuadrados ordinarios) es un modelo estadístico que encuentra la relación lineal entre una variable objetivo y un conjunto de predictores. En este caso:

```
Volumen del cliente = f(transacciones, ticket, antigüedad, volatilidad, segmento, país, género)
```

Se eligió OLS sobre modelos más complejos (Random Forest, XGBoost) porque:
- Con 100 observaciones, los modelos complejos tienden a sobreajustar
- La interpretabilidad es prioritaria: cada coeficiente tiene un significado de negocio directo
- El R² obtenido (0.958) es suficientemente alto para las decisiones que se toman

### Variables del modelo

El modelo usa **12 predictores** construidos a nivel cliente (agrupando las 500 transacciones):

| Variable | Tipo | Construcción |
|---|---|---|
| `n_transacciones` | Continua | Conteo de transacciones del cliente |
| `ticket_mean` | Continua | Monto promedio por transacción |
| `ticket_max` | Continua | Transacción más alta del cliente |
| `num_productos` | Continua | Número de productos distintos usados |
| `antiguedad_dias` | Continua | Días entre primera y última transacción |
| `volatilidad` | Continua | Std del pct_change mensual del volumen |
| `seg_PYME` | Dummy | 1 si el cliente es PYME, 0 si no |
| `seg_Corporativo` | Dummy | 1 si el cliente es Corporativo, 0 si no |
| `pais_Argentina` | Dummy | 1 si el cliente es de Argentina, 0 si no |
| `pais_Chile` | Dummy | 1 si el cliente es de Chile, 0 si no |
| `pais_Colombia` | Dummy | 1 si el cliente es de Colombia, 0 si no |
| `sexo_femenino` | Dummy | 1 si el cliente es F, 0 si no |

**Baselines implícitos:** México (país), Retail (segmento), Masculino (género). Los coeficientes de las dummies se interpretan como diferencias respecto al grupo base.

### Resultados del modelo

```
R²        = 0.9577   →  el modelo explica el 95.8% de la varianza en el volumen
R² ajust. = 0.9519   →  penalizando por 12 predictores sigue siendo 95.2%
N         = 100 clientes
```

### Coeficientes — interpretación técnica

| Variable | Coeficiente | p-valor | Significativo | Interpretación |
|---|---:|---:|:---:|---|
| `n_transacciones` | **+$5,758.73** | 0.0000 | ★ | Cada transacción adicional genera en promedio $5,759 más de volumen anual |
| `ticket_mean` | **+$4.19** | 0.0000 | ★ | Cada $1 de incremento en ticket promedio genera $4.19 de volumen adicional |
| `ticket_max` | **−$0.66** | 0.0205 | ★ | Efecto marginalmente negativo: clientes con transacciones muy grandes y pocas, tienden a tener menor volumen acumulado |
| `seg_Corporativo` | +$1,237 | 0.127 | — | Corporativos generan más volumen, pero no es estadísticamente significativo |
| `pais_Chile` | +$618 | 0.492 | — | Sin diferencia significativa respecto a México |
| `seg_PYME` | +$601 | 0.450 | — | Sin diferencia significativa respecto a Retail |
| `sexo_femenino` | +$523 | 0.436 | — | Sin diferencia significativa |
| `num_productos` | −$395 | 0.411 | — | No significativo una vez controlando por transacciones |
| `pais_Argentina` | −$390 | 0.672 | — | No significativo |
| `pais_Colombia` | −$347 | 0.696 | — | No significativo |
| `volatilidad` | +$23 | 0.528 | — | No significativo |
| `antiguedad_dias` | −$1.18 | 0.736 | — | No significativo |

> **★ = p < 0.05**: rechaza la hipótesis nula de que el coeficiente es cero al 5% de significancia.

### ¿Qué dice esto del negocio?

El modelo revela tres señales muy claras:

**1. El volumen es casi enteramente función de la actividad transaccional.**
`n_transacciones` explica la mayor parte del poder predictivo. Un cliente que hace 5 transacciones al año genera aproximadamente $28,794 más que uno que hace 0. Esto sugiere que la estrategia más eficiente para crecer el volumen es aumentar la frecuencia de uso.

**2. El ticket importa, pero menos de lo esperado.**
`ticket_mean` es significativo ($4.19 por $1 de aumento), pero su coeficiente es 1,373 veces menor que el de transacciones. Dicho de otro modo: doblar el ticket de $5,000 a $10,000 genera el mismo impacto que añadir solo 3–4 transacciones.

**3. La demografía y geografía no explican el volumen.**
País, segmento, género y antigüedad no son estadísticamente significativos. Los clientes de México, Chile, Argentina y Colombia se comportan de manera similar una vez controlados por su nivel de actividad. Esto simplifica la estrategia comercial: no es necesario segmentar por mercado, sino por comportamiento.

---

## Parte 2 — Estrategia de Activación

### Construcción de la segmentación

Con los coeficientes del modelo, cada cliente es clasificado según su posición relativa en el espacio (transacciones, ticket):

```python
txn_mediana  = mediana del portfolio  (~5 transacciones)
ticket_mediana = mediana del portfolio (~$5,072)
```

| Segmento | Condición | Intervención |
|---|---|---|
| **DORMIDO CON POTENCIAL** | txn < mediana AND ticket > mediana | Reactivar frecuencia de uso |
| **ACTIVO BAJO VALOR** | txn > mediana AND ticket < mediana | Aumentar monto por transacción |
| **ESTRELLA** | txn > mediana AND ticket > mediana AND gap > −5% | Retener y escalar |
| **CRISIS** | txn < mediana AND ticket < mediana | Win-back urgente |
| **NORMAL** | Resto | Seguimiento estándar |

### Distribución actual del portfolio

| Segmento | N clientes | Impacto/cliente | Impacto total |
|---|---:|---:|---:|
| CRISIS | 27 | $11,517 | $310,971 |
| ESTRELLA | 24 | $5,759 | $138,210 |
| DORMIDO CON POTENCIAL | 21 | $14,397 | $302,333 |
| ACTIVO BAJO VALOR | 14 | $5,031 | $70,440 |
| NORMAL | 14 | $0 | $0 |

El segmento CRISIS tiene el mayor número de clientes (27) y el segundo mayor impacto potencial. Los dormidos con potencial tienen el impacto unitario más alto ($14,397/cliente) porque tienen capacidad de gasto probada pero baja frecuencia.

### Proyección de impacto por intervención

Los impactos se calculan usando los coeficientes reales del modelo, no valores arbitrarios:

```
DORMIDO:      coef_txn × 2.5  =  $5,759 × 2.5  =  $14,397/cliente
              (se asume duplicar txns: de ~2.5 a ~5)

ACTIVO:       coef_ticket × 1200  =  $4.19 × 1,200  =  $5,031/cliente
              (se asume subir $1,200 el ticket promedio)

ESTRELLA:     coef_txn × 1  =  $5,759/cliente
              (retener + 1 txn adicional)

CRISIS:       coef_txn × 2  =  $5,759 × 2  =  $11,517/cliente
              (triplicar txns: de ~1 a ~3)
```

---

## Parte 3 — Cross-sell

### Construcción de la matriz de presencia

Para cada cliente se construye un vector binario de 10 dimensiones (una por producto del catálogo):

```
Cliente 1001: [1, 0, 1, 0, 1, 0, 0, 1, 0, 1]
              P1    P3    P5       P8    P10
```

Un `1` indica que el cliente ha realizado al menos una transacción con ese producto. Un `0` indica una oportunidad de cross-sell.

### Estimación del ingreso potencial

Para cada producto faltante, el ingreso estimado se calcula como:

```
ingreso_est = volumen_medio_del_producto × 3 transacciones estimadas
```

El factor 3 es conservador: asume que un cliente nuevo en un producto realiza solo 3 transacciones en su primer año (la mediana del portfolio es 5). Se usa el producto faltante con mayor `volumen_medio` como **top recomendación**.

### Interpretación de negocio

El cross-sell es el mecanismo de crecimiento más eficiente en este portfolio porque:

1. El costo de adquisición es cero — son clientes existentes
2. La confianza ya está establecida — el cliente ya opera con la institución
3. El producto recomendado ya tiene una tasa de aceptación implícita (otros clientes similares lo usan)

---

## Parte 4 — Sistema de Recomendaciones por Meta

### Algoritmo de priorización

Dado un objetivo de volumen $M$, el sistema construye un pool combinado de oportunidades:

1. **Capa 1 (Activación):** Clientes de `tabla_accionable` ordenados por `|gap|` descendente. El gap es la diferencia entre volumen real y esperado según el modelo.

2. **Capa 2 (Cross-sell):** Clientes restantes de `crosssell.oportunidades` ordenados por `ingreso_estimado` descendente. Solo se incluyen clientes no presentes en la capa 1.

3. **Selección greedy:** El sistema selecciona secuencialmente el cliente con mayor impacto hasta cubrir la brecha `$M − volumen_actual`.

Este enfoque greedy es óptimo bajo el supuesto de que los impactos son independientes entre clientes (razonable dado que el modelo OLS no captura efectos de red). En la práctica produce un plan de acción de mínimo esfuerzo.

### Fórmula del gap individual

```
gap_i = volumen_real_i − volumen_esperado_i

donde:
volumen_esperado_i = predicción del modelo OLS para el cliente i
```

Un gap negativo grande significa que el cliente está generando menos volumen del que el modelo predice para su perfil. Es el candidato prioritario para intervención.

---

## Diagnóstico del modelo

### Gráfico: Predicho vs Real

Los puntos deben estar cerca de la línea diagonal (predicción perfecta). En este modelo los puntos están muy concentrados alrededor de la línea, confirmando el alto R².

Los outliers más alejados de la línea corresponden a clientes con comportamientos atípicos que el modelo no captura bien (por ejemplo, clientes con 1 sola transacción de monto muy alto).

### Gráfico: Distribución de Residuos

Los residuos (error = real − predicho) deben distribuirse alrededor de cero. La distribución ligeramente sesgada a la derecha indica que el modelo subestima ligeramente a los clientes de mayor volumen, lo cual es típico en datos financieros con distribución de cola pesada.

### Gráfico: QQ-Plot

Compara los residuos del modelo contra lo que se esperaría de una distribución normal perfecta. Los puntos del centro siguen la línea roja (normal teórica), pero los extremos se desvían. Esto indica **normalidad aproximada** con outliers en los extremos — aceptable para inferencia con n=100.

### Implicaciones para el negocio

Los 3 coeficientes estadísticamente significativos (`n_transacciones`, `ticket_mean`, `ticket_max`) tienen p-valores <0.05, lo que significa que existe menos del 5% de probabilidad de observar estos efectos si en realidad fueran cero. Los intervalos de confianza al 95% no cruzan el cero para estas variables, confirmando que las estimaciones son robustas.

Las variables demográficas (país, género, segmento) no son significativas, pero se mantienen en el modelo como **variables de control** para evitar sesgo por omisión.

---

## Limitaciones y consideraciones

| Limitación | Impacto | Mitigación |
|---|---|---|
| N=100 clientes | Poder estadístico limitado para variables con efectos pequeños | Los efectos principales (transacciones, ticket) son robustos incluso con N pequeño |
| OLS asume linealidad | No captura efectos no lineales (p.ej. rendimientos decrecientes) | Aceptable para el rango de variación observado en los datos |
| Colinealidad potencial entre ticket_mean y ticket_max | Puede inflar errores estándar | Los VIFs calculados están dentro del rango aceptable (<10) |
| Estimaciones de cross-sell conservadoras (×3) | Subestima el potencial real | Ajustar el multiplicador según experiencia histórica de adopción de productos |
| Segmentación usa medianas del portfolio | Las medianas cambiarán con nuevos clientes | Regenerar el modelo con `python generar_datos.py` al incorporar nuevos datos |
