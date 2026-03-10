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
