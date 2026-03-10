/**
 * sections.js — One render function per tab.
 * Each receives a DOM element, sets its innerHTML, then calls the chart functions.
 *
 * Dependencies: components.js, charts.js, config.js
 * Reads: DATA (app.js), HIGHLIGHTS (app.js)
 */

function renderOverview(el) {
  const k = DATA.kpis;

  el.innerHTML = `
    ${sectionIntro({
      eyebrow: "General",
      title: "Radiografía del negocio",
      description: "Resumen ejecutivo del volumen, la actividad y los patrones que explican el negocio antes de entrar al detalle.",
      highlightLabel: "señal principal",
      highlightText: `${HIGHLIGHTS.i80} clientes concentran el 80% del volumen`,
      detail: `${quarterLabel(HIGHLIGHTS.bestQuarter)} fue el trimestre más fuerte y ${HIGHLIGHTS.topCountry} aporta ${fmtPct(HIGHLIGHTS.topCountryShare)} del total analizado.`,
    })}

    <div class="kpis">
      ${kpiCard({ value: fmtUSD(k.volumen_total),        label: "Volumen total",     note: `${HIGHLIGHTS.topCountry} lidera con ${fmtPct(HIGHLIGHTS.topCountryShare)}`,       tone: "blue"  })}
      ${kpiCard({ value: fmt(k.n_transacciones),          label: "Transacciones",     note: `Pico reciente en ${quarterLabel(HIGHLIGHTS.bestQuarter)}`,                        tone: "mint"  })}
      ${kpiCard({ value: fmt(k.n_clientes),               label: "Clientes activos",  note: `${HIGHLIGHTS.i80} explican el 80% del negocio`,                                  tone: "amber" })}
      ${kpiCard({ value: fmt(k.n_productos),              label: "Productos",         note: `Promedio de ${HIGHLIGHTS.avgProducts.toFixed(1)} por cliente`,                    tone: "coral" })}
      ${kpiCard({ value: fmtUSD(k.ticket_promedio, true), label: "Ticket promedio",   note: `Mix dominante: ${HIGHLIGHTS.topSegment}`,                                         tone: "teal"  })}
    </div>

    ${insightStrip([
      { label: "Trimestre líder",  value: quarterLabel(HIGHLIGHTS.bestQuarter), text: "Periodo con el mayor volumen consolidado." },
      { label: "Producto estrella", value: HIGHLIGHTS.topProduct,               text: `Aporta ${fmtPct(HIGHLIGHTS.topProductShare)} del volumen total.` },
      { label: "Mercado principal", value: HIGHLIGHTS.topCountry,               text: `Concentra ${fmtPct(HIGHLIGHTS.topCountryShare)} del volumen del portafolio.` },
    ])}

    <div class="grid-2">
      ${panelCard({ title: "Curva de Pareto",      question: "¿Cuántos clientes explican la mayor parte del negocio?",                    id: "ov-pareto", tag: "Concentración", tall: true })}
      ${panelCard({ title: "Tendencia trimestral", question: "¿Cómo se mueven volumen y actividad a lo largo del tiempo?",               id: "ov-trend",  tag: "Momentum",      tall: true })}
    </div>

    <div class="grid-2 grid-full">
      ${panelCard({ title: "Distribución geográfica",    question: "¿Qué países concentran la operación y dónde hay mayor peso actual?",  id: "ov-tree", tag: "Geografía" })}
      ${panelCard({ title: "Top 15 clientes por volumen", question: "¿Quiénes son los clientes con mayor aporte en la cartera actual?",   id: "ov-top",  tag: "Clientes"  })}
    </div>
  `;

  chartPareto("ov-pareto");
  chartTrend("ov-trend");
  chartTreemap("ov-tree");
  chartTopClientes("ov-top");
}

function renderTier1(el) {
  el.innerHTML = `
    ${sectionIntro({
      eyebrow: "Tier 1",
      title: "Lectura crítica para decisiones rápidas",
      description: "Las cuatro vistas que mejor explican concentración, crecimiento, rentabilidad y distribución geográfica.",
      highlightLabel: "foco ejecutivo",
      highlightText: `${HIGHLIGHTS.i80} clientes, ${HIGHLIGHTS.topCountry} y ${HIGHLIGHTS.topProduct} lideran la lectura`,
      detail: "Aquí están las visualizaciones de mayor impacto para priorizar cartera, expansión y rentabilidad.",
    })}

    ${insightStrip([
      { label: "Cliente top",       value: `Cliente ${HIGHLIGHTS.topClientId}`,      text: `Representa ${fmtPct(HIGHLIGHTS.topClientShare)} del volumen consolidado.` },
      { label: "País dominante",    value: HIGHLIGHTS.topCountry,                    text: "Es la geografía con mayor peso dentro del negocio actual." },
      { label: "Mejor trimestre",   value: quarterLabel(HIGHLIGHTS.bestQuarter),     text: "Marca el mejor momento de actividad dentro de la serie." },
    ])}

    <div class="grid-2">
      ${panelCard({ num: "1", title: "Pareto de clientes",      question: "¿Dónde se concentra realmente el negocio?",                              id: "t1-pareto", tag: "Crítico" })}
      ${panelCard({ num: "2", title: "Tendencia trimestral",    question: "¿Hay aceleración, estabilidad o caída en el periodo?",                    id: "t1-trend",  tag: "Crítico" })}
      ${panelCard({ num: "3", title: "Rentabilidad por producto", question: "¿Qué productos combinan mejor tasa, volumen y actividad?",             id: "t1-bubble", tag: "Crítico" })}
      ${panelCard({ num: "4", title: "Mapa geográfico",         question: "¿Qué países sostienen el negocio hoy y dónde expandir?",                 id: "t1-tree",   tag: "Crítico" })}
    </div>
  `;

  chartPareto("t1-pareto");
  chartTrend("t1-trend");
  chartBubble("t1-bubble");
  chartTreemap("t1-tree");
}

function renderTier2(el) {
  el.innerHTML = `
    ${sectionIntro({
      eyebrow: "Tier 2",
      title: "Segmentación y potencial de crecimiento",
      description: "Gráficos orientados a entender profundidad de relación, afinidad por segmento y oportunidad comercial.",
      highlightLabel: "hallazgo clave",
      highlightText: `${HIGHLIGHTS.topSegment} lidera el mix con ${fmtPct(HIGHLIGHTS.topSegmentShare)}`,
      detail: "La combinación entre profundidad de productos y segmento ayuda a detectar oportunidades reales de cross-sell.",
    })}

    ${insightStrip([
      { label: "Profundidad media",  value: `${HIGHLIGHTS.avgProducts.toFixed(1)} productos`, text: "Promedio de productos activos por cliente en la base." },
      { label: "Patrón más común",   value: `${HIGHLIGHTS.modalProducts} productos`,          text: "Es la profundidad con mayor frecuencia dentro del portafolio." },
      { label: "Segmento líder",     value: HIGHLIGHTS.topSegment,                           text: "Es el grupo con mayor aporte económico actual." },
    ])}

    <div class="grid-2">
      ${panelCard({ num: "5", title: "Productos por cliente",        question: "¿Hay espacio para profundizar relación y cross-sell?",                    id: "t2-hist",   tag: "Mix" })}
      ${panelCard({ num: "6", title: "Heatmap producto × segmento",  question: "¿Qué categorías funcionan mejor en cada segmento?",                       id: "t2-heat",   tag: "Mix" })}
      ${panelCard({ num: "7", title: "Composición por segmentos",    question: "¿Cómo se reparte el volumen entre los grupos comerciales?",                id: "t2-donut",  tag: "Mix" })}
      ${panelCard({ num: "8", title: "Productos vs volumen",         question: "¿Existe relación entre profundidad de cartera y valor generado?",          id: "t2-scatter",tag: "Mix" })}
    </div>
  `;

  chartHistogram("t2-hist");
  chartHeatmap("t2-heat");
  chartDonut("t2-donut");
  chartScatterReg("t2-scatter");
}

function renderTier3(el) {
  el.innerHTML = `
    ${sectionIntro({
      eyebrow: "Tier 3",
      title: "Contexto complementario del comportamiento",
      description: "Vistas adicionales para leer estacionalidad, eficiencia geográfica, diferencias por segmento y dispersión de montos.",
      highlightLabel: "señal temporal",
      highlightText: `El pico mensual aparece en ${monthLabel(HIGHLIGHTS.bestMonth)} y el piso en ${monthLabel(HIGHLIGHTS.lowMonth)}`,
      detail: `${HIGHLIGHTS.topCountryByClients} es el país con mayor base de clientes y la serie mensual muestra variaciones de cadencia.`,
    })}

    ${insightStrip([
      { label: "Mes más fuerte",  value: monthLabel(HIGHLIGHTS.bestMonth),        text: "Mayor volumen mensual dentro de toda la serie." },
      { label: "Mes más débil",   value: monthLabel(HIGHLIGHTS.lowMonth),         text: "Punto mínimo del periodo analizado." },
      { label: "Base más amplia", value: HIGHLIGHTS.topCountryByClients,         text: "Es la geografía con mayor cantidad de clientes." },
    ])}

    <div class="grid-2">
      ${panelCard({ num: "9",  title: "Evolución mensual",    question: "¿Existen patrones o cambios en la cadencia mensual?",                         id: "t3-area",  tag: "Contexto" })}
      ${panelCard({ num: "10", title: "Eficiencia por país",  question: "¿Qué mercados combinan mejor base de clientes y ticket promedio?",             id: "t3-pais",  tag: "Contexto" })}
      ${panelCard({ num: "11", title: "Radar por segmentos",  question: "¿En qué dimensiones se diferencian los segmentos clave?",                      id: "t3-radar", tag: "Contexto" })}
      ${panelCard({ num: "12", title: "Distribución y outliers", question: "¿Hay comportamientos atípicos o dispersión relevante?",                    id: "t3-box",   tag: "Contexto" })}
    </div>
  `;

  chartArea("t3-area");
  chartScatterPais("t3-pais");
  chartRadar("t3-radar");
  chartBoxplots("t3-box");
}

function renderRentabilidad(el) {
  el.innerHTML = `
    ${sectionIntro({
      eyebrow: "Rentabilidad",
      title: "Vista dedicada al portafolio de productos",
      description: "Dashboard centrado en los productos que mejor combinan volumen, tasa, segmento y participación.",
      highlightLabel: "producto líder",
      highlightText: `${HIGHLIGHTS.topProduct} lidera con ${fmtPct(HIGHLIGHTS.topProductShare)} del volumen total`,
      detail: `${HIGHLIGHTS.highestRateProduct} tiene la tasa más alta del portafolio con ${fmtPct(HIGHLIGHTS.highestRate)} y ${HIGHLIGHTS.topSegment} domina el mix por segmento.`,
    })}

    ${insightStrip([
      { label: "Producto top",      value: HIGHLIGHTS.topProduct,          text: "Es el producto con mayor impacto actual en volumen." },
      { label: "Tasa más alta",     value: HIGHLIGHTS.highestRateProduct,  text: `Registra ${fmtPct(HIGHLIGHTS.highestRate)} de tasa dentro del portafolio.` },
      { label: "Segmento dominante", value: HIGHLIGHTS.topSegment,         text: "El segmento con mayor volumen en la mezcla total." },
    ])}

    <div class="grid-2">
      ${panelCard({ title: "Rentabilidad por producto",     question: "¿Qué productos se posicionan mejor por tasa, volumen y actividad?",     id: "r-bubble", tag: "Producto" })}
      ${panelCard({ title: "Heatmap producto × segmento",   question: "¿Qué combinaciones producto-segmento resultan más potentes?",           id: "r-heat",   tag: "Producto" })}
      ${panelCard({ title: "Ranking por volumen",           question: "¿Cuáles son los productos con mayor aporte absoluto?",                  id: "r-rank",   tag: "Producto" })}
      ${panelCard({ title: "Participación por producto",    question: "¿Cómo se reparte el portafolio entre los productos actuales?",          id: "r-pie",    tag: "Producto" })}
    </div>
  `;

  chartBubble("r-bubble");
  chartHeatmap("r-heat");
  chartRanking("r-rank");
  chartPieProductos("r-pie");
}

// ── Análisis ML ───────────────────────────────────────────────────────────────

function renderAnalisis(el) {
  const r = DATA.regresion;
  const firstId = Object.keys(DATA.journey)[0];

  el.innerHTML = `
    ${sectionIntro({
      eyebrow: "ML · OLS",
      title: "Regresión multivariable del volumen",
      description: "Modelo OLS con 12 variables que explica el volumen del cliente. Incluye transacciones, ticket, antigüedad, volatilidad, segmento, país y género.",
      highlightLabel: "ajuste del modelo",
      highlightText: `R² = ${r.r2} · R² adj = ${r.r2_adj}`,
      detail: `El modelo explica el ${(r.r2 * 100).toFixed(1)}% de la varianza del volumen en ${r.n_obs} clientes. La variable más predictiva es n_transacciones.`,
    })}

    <div class="kpis" style="grid-template-columns: repeat(3, minmax(0,1fr)); max-width: 680px;">
      ${kpiCard({ value: r.r2.toFixed(3),     label: "R²",           note: "Varianza explicada por el modelo",          tone: "blue"  })}
      ${kpiCard({ value: r.r2_adj.toFixed(3), label: "R² ajustado",  note: "Penaliza por número de predictores",        tone: "mint"  })}
      ${kpiCard({ value: fmt(r.n_obs),        label: "Observaciones",note: "Clientes incluidos en el ajuste OLS",       tone: "amber" })}
    </div>

    <div class="grid-2">
      ${panelCard({ title: "Predicho vs Real", question: "¿Qué tan bien ajusta el modelo a los datos reales?",         id: "an-scatter", tag: `R²=${r.r2}`, tall: true })}
      ${panelCard({ title: "Coeficientes con IC 95%", question: "¿Qué variables tienen mayor impacto y cuáles son significativas?", id: "an-coefs", tag: "Regresión", tall: true })}
    </div>

    <div class="grid-2" style="margin-top: 20px;">
      ${panelCard({ title: "Distribución de residuos", question: "¿Los errores del modelo son aproximadamente normales y centrados en cero?",  id: "an-resid", tag: "Diagnóstico" })}
      ${panelCard({ title: "QQ-Plot de residuos", question: "¿Se cumple el supuesto de normalidad en los residuos del modelo?",               id: "an-qq",    tag: "Diagnóstico" })}
    </div>

    <div class="section-divider"></div>

    <div class="page-intro" style="margin-top: 28px;">
      <div class="section-copy">
        <span class="eyebrow">Journey</span>
        <h2>Trayectoria del cliente</h2>
        <p>Evolución temporal de volumen acumulado y adopción de productos. Selecciona cualquier cliente de la base.</p>
      </div>
      <div class="journey-selector-wrap story-card">
        <span class="story-label">Seleccionar cliente</span>
        <select id="journey-select" onchange="updateJourney(this.value)">
          ${Object.entries(DATA.journey).map(([id, c]) =>
            `<option value="${id}">Cliente ${id} — ${fmtUSD(c.volumen_total)}</option>`
          ).join("")}
        </select>
        <div id="journey-ficha"></div>
      </div>
    </div>

    <div class="grid-2" id="journey-charts">
      ${panelCard({ title: "Volumen acumulado", question: "¿Cómo crece el volumen del cliente a lo largo del tiempo?",          id: "an-journey-vol",  tag: "Trayectoria", tall: true })}
      ${panelCard({ title: "Adopción de productos", question: "¿Cuándo y en qué orden el cliente incorporó cada producto?",     id: "an-journey-prod", tag: "Trayectoria", tall: true })}
    </div>

    <div class="section-divider"></div>

    ${sectionIntro({
      eyebrow: "Estrategia",
      title: "Plan de activación por segmento",
      description: "Cada cliente es clasificado según su perfil de transacciones y ticket. El impacto proyectado usa los coeficientes reales del modelo OLS.",
      highlightLabel: "proyección total",
      highlightText: `+${fmtPct(DATA.estrategia.pct_crecimiento)} sobre volumen actual`,
      detail: `Impacto proyectado de ${fmtUSD(DATA.estrategia.impacto_total)} si se ejecutan las intervenciones por segmento. Volumen proyectado: ${fmtUSD(DATA.estrategia.volumen_proyectado)}.`,
    })}

    <div class="kpis" style="grid-template-columns: repeat(4, minmax(0,1fr));">
      ${kpiCard({ value: fmtUSD(DATA.estrategia.volumen_actual),     label: "Volumen actual",     note: "Base consolidada del periodo",            tone: "blue"  })}
      ${kpiCard({ value: fmtUSD(DATA.estrategia.impacto_total),      label: "Impacto proyectado", note: "Si se aplican todas las intervenciones",   tone: "mint"  })}
      ${kpiCard({ value: fmtPct(DATA.estrategia.pct_crecimiento),    label: "% Crecimiento",      note: "Incremento sobre volumen base",            tone: "amber" })}
      ${kpiCard({ value: fmt(DATA.estrategia.tabla_accionable.length), label: "Clientes a activar", note: "Con brecha >5% bajo lo esperado",        tone: "coral" })}
    </div>

    <div class="grid-2">
      ${panelCard({ title: "Impacto por segmento", question: "¿Qué segmento genera más oportunidad de crecimiento?",          id: "an-est-segs",    tag: "Estrategia", tall: true })}
      ${panelCard({ title: "Proyección de volumen", question: "¿Cuánto crece el negocio si se ejecuta la estrategia?",        id: "an-est-wf",      tag: "Estrategia", tall: true })}
    </div>

    <div style="margin-top:20px;">
      ${panelCard({ title: "Clientes a intervenir", question: "¿Quiénes están por debajo de su potencial y en qué segmento caen?", id: "an-est-scatter", tag: "Mapa" })}
    </div>

    <div class="section-divider"></div>

    <div class="page-intro" style="margin-top: 28px;">
      <div class="section-copy">
        <span class="eyebrow">Simulador</span>
        <h2>Calculadora de impacto</h2>
        <p>Ajusta los parámetros de intervención y ve en tiempo real el impacto proyectado según los coeficientes del modelo.</p>
      </div>
      <div class="story-card" style="display:flex;flex-direction:column;gap:16px;">
        <span class="story-label">Parámetros de intervención</span>

        <div class="calc-grid">
          <label class="calc-label">Segmento objetivo</label>
          <select id="calc-segmento" onchange="calcularImpacto()" class="calc-select">
            <option value="TODOS">Todos los segmentos</option>
            <option value="DORMIDO_CON_POTENCIAL">Dormidos con potencial</option>
            <option value="ACTIVO_BAJO_VALOR">Activos bajo valor</option>
            <option value="ESTRELLA">Estrellas</option>
            <option value="CRISIS">En crisis</option>
          </select>
          <span></span>

          <label class="calc-label">+ Transacciones por cliente</label>
          <input type="range" id="calc-txn" min="0" max="10" step="0.5" value="2.5"
                 oninput="document.getElementById('calc-txn-val').textContent=this.value; calcularImpacto()">
          <span id="calc-txn-val" class="calc-val">2.5</span>

          <label class="calc-label">+ Ticket por transacción (USD)</label>
          <input type="range" id="calc-ticket" min="0" max="5000" step="100" value="1200"
                 oninput="document.getElementById('calc-ticket-val').textContent=fmtUSD(Number(this.value)); calcularImpacto()">
          <span id="calc-ticket-val" class="calc-val">$1,200</span>
        </div>

        <div class="calc-result" id="calc-result">
          <div class="calc-result-row"><span>Clientes afectados</span><strong id="r-clientes">—</strong></div>
          <div class="calc-result-row"><span>Impacto por cliente</span><strong id="r-unitario">—</strong></div>
          <div class="calc-result-row"><span>Impacto total</span><strong id="r-total">—</strong></div>
          <div class="calc-result-row"><span>Volumen proyectado</span><strong id="r-proyectado">—</strong></div>
          <div class="calc-result-row calc-highlight"><span>Crecimiento</span><strong id="r-crecimiento">—</strong></div>
        </div>
      </div>
    </div>

    <div class="section-divider"></div>

    ${(() => {
      const cs  = DATA.crosssell;
      const topProd = Object.keys(cs.top_por_producto)[0] || "—";
      return `
        ${sectionIntro({
          eyebrow: "Cross-sell",
          title: "Oportunidades de producto por cliente",
          description: "Para cada cliente se identifican los productos del catálogo que aún no tiene. La recomendación prioriza el producto con mayor volumen medio de transacción.",
          highlightLabel: "potencial identificado",
          highlightText: `${cs.total_oportunidades} clientes con productos faltantes`,
          detail: `Ingreso potencial estimado de ${fmtUSD(cs.ingreso_potencial_total)} si se ejecuta la recomendación top de cada cliente.`,
        })}

        <div class="kpis" style="grid-template-columns: repeat(3, minmax(0,1fr)); max-width: 680px;">
          ${kpiCard({ value: fmt(cs.total_oportunidades), label: "Oportunidades",       note: "Clientes con al menos 1 producto faltante",      tone: "coral" })}
          ${kpiCard({ value: fmtUSD(cs.ingreso_potencial_total), label: "Ingreso potencial", note: "Estimado con ~3 txns del producto recomendado", tone: "mint"  })}
          ${kpiCard({ value: topProd, label: "Mayor brecha",          note: "Producto con más clientes sin él",               tone: "blue"  })}
        </div>

        <div class="grid-2">
          ${panelCard({ title: "Matriz cliente–producto", question: "¿Qué productos tiene cada cliente y cuáles le faltan?",            id: "an-cs-heat", tag: "Presencia", tall: true })}
          ${panelCard({ title: "Productos con mayor brecha", question: "¿Qué productos son más comunes como oportunidad de cross-sell?", id: "an-cs-top",  tag: "Ranking"   })}
        </div>

      `;
    })()}

    <div class="section-divider" style="margin-top:24px;"></div>

    <div class="page-intro" style="margin-top: 28px;">
      <div class="section-copy">
        <span class="eyebrow">Recomendaciones</span>
        <h2>¿Cuánto quieres crecer?</h2>
        <p>Define una meta de volumen y el sistema calcula en tiempo real qué clientes activar y con qué intervención para llegar a ella con el menor número de acciones.</p>
      </div>
      <div class="story-card" style="display:flex;flex-direction:column;gap:16px;">
        <span class="story-label">Meta de volumen</span>
        <div class="meta-slider-wrap">
          <div class="meta-slider-labels">
            <span>${fmtUSD(DATA.estrategia.volumen_actual)}</span>
            <span id="meta-val" class="meta-current">${fmtUSD(DATA.estrategia.volumen_actual * 1.3)}</span>
            <span>${fmtUSD(DATA.estrategia.volumen_actual * 2)}</span>
          </div>
          <input type="range" id="meta-slider"
            class="meta-range"
            min="${DATA.estrategia.volumen_actual}"
            max="${DATA.estrategia.volumen_actual * 2}"
            step="${Math.round(DATA.estrategia.volumen_actual * 0.01)}"
            value="${DATA.estrategia.volumen_actual * 1.3}"
            oninput="actualizarRecomendaciones(this.value)">
        </div>
        <div class="meta-progress-wrap">
          <div class="meta-progress-bar">
            <div id="meta-progress-fill" class="meta-progress-fill" style="width:0%"></div>
          </div>
          <div class="meta-stats">
            <span>Actual: <strong>${fmtUSD(DATA.estrategia.volumen_actual)}</strong></span>
            <span id="meta-gap-label">Brecha: <strong>—</strong></span>
            <span id="meta-pct-label">Cubierto: <strong>—</strong></span>
          </div>
        </div>
      </div>
    </div>

    <div class="rec-kpis-wrap" id="rec-summary"></div>
    <div id="rec-tabla-wrap" class="card" style="margin-top:16px;padding:0;overflow:hidden;"></div>
  `;

  // Regresión charts
  chartRegScatter("an-scatter");
  chartRegCoefs("an-coefs");
  chartRegResiduos("an-resid");
  chartRegQQ("an-qq");

  // Journey inicial
  updateJourney(firstId);

  // Estrategia charts
  chartEstrategiaSegmentos("an-est-segs");
  chartEstrategiaWaterfall("an-est-wf");
  chartEstrategiaScatter("an-est-scatter");

  // Simulador — inicializar
  calcularImpacto();

  // Cross-sell charts
  chartCrosssellHeatmap("an-cs-heat");
  chartCrosssellTop("an-cs-top");

  // Recomendaciones — inicializar con meta de +30%
  actualizarRecomendaciones(DATA.estrategia.volumen_actual * 1.3);
}

function updateJourney(cid) {
  const c = DATA.journey[String(cid)];
  if (!c) return;

  const ficha = document.getElementById("journey-ficha");
  if (ficha) {
    ficha.innerHTML = `
      <div class="journey-kpi-row">
        <span><strong>${fmtUSD(c.volumen_total)}</strong><small>Volumen total</small></span>
        <span><strong>${fmt(c.n_transacciones)}</strong><small>Transacciones</small></span>
        <span><strong>${c.n_productos}</strong><small>Productos</small></span>
        <span><strong>${fmtUSD(c.ticket_prom)}</strong><small>Ticket prom.</small></span>
        <span><strong>${c.antiguedad_dias}d</strong><small>Antigüedad</small></span>
        <span><strong>${c.pais}</strong><small>${c.segmento}</small></span>
      </div>
    `;
  }

  // Re-render journey charts (Plotly purge prevents ghost traces)
  const volEl  = document.getElementById("an-journey-vol");
  const prodEl = document.getElementById("an-journey-prod");
  if (volEl)  Plotly.purge("an-journey-vol");
  if (prodEl) Plotly.purge("an-journey-prod");

  chartJourneyVol("an-journey-vol", cid);
  chartJourneyProd("an-journey-prod", cid);
}

function calcularImpacto() {
  const e          = DATA.estrategia;
  const segmento   = document.getElementById("calc-segmento")?.value || "TODOS";
  const txn_delta  = parseFloat(document.getElementById("calc-txn")?.value || 0);
  const tick_delta = parseFloat(document.getElementById("calc-ticket")?.value || 0);

  // Filtrar tabla de clientes accionables
  const clientes = segmento === "TODOS"
    ? e.tabla_accionable
    : e.tabla_accionable.filter(r => r.segmento_oportunidad === segmento);

  const n          = clientes.length;
  const imp_unit   = e.coef_txn * txn_delta + e.coef_ticket * tick_delta;
  const imp_total  = imp_unit * n;
  const vol_proy   = e.volumen_actual + imp_total;
  const pct_crec   = e.volumen_actual > 0 ? (imp_total / e.volumen_actual) * 100 : 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("r-clientes",    fmt(n));
  set("r-unitario",    fmtUSD(imp_unit));
  set("r-total",       fmtUSD(imp_total));
  set("r-proyectado",  fmtUSD(vol_proy));
  set("r-crecimiento", `+${pct_crec.toFixed(1)}%`);
}

// ── Sistema de recomendaciones por meta ───────────────────────────────────────

function actualizarRecomendaciones(meta) {
  meta = parseFloat(meta);
  const actual = DATA.estrategia.volumen_actual;
  const brecha = meta - actual;

  const metaEl = document.getElementById("meta-val");
  const gapEl  = document.getElementById("meta-gap-label");
  const pctEl  = document.getElementById("meta-pct-label");
  const fillEl = document.getElementById("meta-progress-fill");
  const sumEl  = document.getElementById("rec-summary");
  const tabEl  = document.getElementById("rec-tabla-wrap");

  if (metaEl) metaEl.textContent = fmtUSD(meta);
  if (gapEl)  gapEl.innerHTML  = `Brecha: <strong>${fmtUSD(Math.max(brecha, 0))}</strong>`;

  if (brecha <= 0) {
    if (fillEl) fillEl.style.width = "100%";
    if (pctEl)  pctEl.innerHTML = `Cubierto: <strong>100%</strong>`;
    if (sumEl)  sumEl.innerHTML = `<p style="color:var(--mint);padding:8px 0;font-weight:700">La meta ya está cubierta por el volumen actual.</p>`;
    if (tabEl)  tabEl.innerHTML = "";
    return;
  }

  // ── Construir pool de oportunidades ──────────────────────────────────────
  const pool = [];

  for (const c of DATA.estrategia.tabla_accionable) {
    pool.push({
      id_cliente:  c.id_cliente,
      tipo:        c.segmento_oportunidad,
      segmento:    c.segmento,
      descripcion: _descIntervencion(c.segmento_oportunidad),
      impacto:     Math.abs(c.gap),
      fuente:      "activación",
    });
  }

  const csIds = new Set(pool.map(p => p.id_cliente));
  for (const o of DATA.crosssell.oportunidades) {
    if (csIds.has(o.id_cliente)) continue;
    pool.push({
      id_cliente:  o.id_cliente,
      tipo:        "CROSS_SELL",
      segmento:    o.segmento,
      descripcion: `Cross-sell: ${o.top_recomendacion}`,
      impacto:     o.ingreso_estimado,
      fuente:      "cross-sell",
    });
  }

  pool.sort((a, b) => b.impacto - a.impacto);

  let acumulado = 0;
  const seleccionados = [];
  for (const item of pool) {
    if (acumulado >= brecha) break;
    acumulado += item.impacto;
    seleccionados.push({ ...item, acumulado });
  }

  const pct = Math.min((acumulado / brecha) * 100, 100);
  if (fillEl) fillEl.style.width = pct + "%";
  if (pctEl)  pctEl.innerHTML = `Cubierto: <strong>${pct.toFixed(0)}%</strong>`;

  const tipos = {};
  seleccionados.forEach(s => { tipos[s.fuente] = (tipos[s.fuente] || 0) + 1; });

  if (sumEl) sumEl.innerHTML = `
    <div class="rec-kpis">
      ${kpiCard({ value: fmt(seleccionados.length),     label: "Clientes a activar", note: "Para alcanzar la meta definida",       tone: "blue"  })}
      ${kpiCard({ value: fmtUSD(acumulado),              label: "Impacto total",      note: "Suma de intervenciones seleccionadas", tone: "mint"  })}
      ${kpiCard({ value: fmt(tipos["activación"] || 0),  label: "Por activación",     note: "Transacciones o ticket",              tone: "amber" })}
      ${kpiCard({ value: fmt(tipos["cross-sell"] || 0),  label: "Por cross-sell",     note: "Nuevos productos recomendados",       tone: "coral" })}
    </div>
  `;

  if (tabEl) tabEl.innerHTML = `
    <div class="card-header" style="padding:20px 20px 14px;">
      <div>
        <div class="card-title"><span class="card-title-text">Plan de intervención priorizado</span></div>
        <div class="card-question">Contactar en este orden para llegar a la meta con el menor número de acciones</div>
      </div>
      <span class="card-tag">Meta: ${fmtUSD(meta)}</span>
    </div>
    <div style="overflow-x:auto;padding:0 4px 16px;">
      <table class="crosssell-table">
        <thead>
          <tr>
            <th>#</th><th>Cliente</th><th>Tipo</th><th>Segmento</th>
            <th>Intervención</th><th>Impacto est.</th><th>Acumulado</th><th>% Meta</th>
          </tr>
        </thead>
        <tbody>
          ${seleccionados.map((s, i) => `
            <tr>
              <td><strong>${i + 1}</strong></td>
              <td><strong>${s.id_cliente}</strong></td>
              <td><span class="cs-badge" style="${_badgeStyle(s.fuente)}">${s.fuente}</span></td>
              <td>${s.segmento}</td>
              <td>${s.descripcion}</td>
              <td><strong>${fmtUSD(s.impacto)}</strong></td>
              <td>${fmtUSD(s.acumulado)}</td>
              <td>
                <div class="mini-bar">
                  <div style="width:${Math.min(s.acumulado / brecha * 100, 100).toFixed(1)}%"></div>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function _descIntervencion(tipo) {
  const map = {
    DORMIDO_CON_POTENCIAL: "Reactivar transacciones",
    ACTIVO_BAJO_VALOR:     "Subir ticket promedio",
    ESTRELLA:              "+1 transacción/mes",
    CRISIS:                "Win-back urgente",
    NORMAL:                "Seguimiento estándar",
  };
  return map[tipo] || tipo.replace(/_/g, " ");
}

function _badgeStyle(fuente) {
  return fuente === "cross-sell"
    ? "background:var(--mint-alpha);color:#2f9078;"
    : "background:var(--blue-alpha);color:var(--blue);";
}
