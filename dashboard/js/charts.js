/**
 * charts.js — One function per chart. Each receives a DOM id and reads
 * from the global DATA object populated by app.js after fetch.
 *
 * Dependencies: config.js (ly, PALETTE, PLOTLY_CFG), Plotly
 */

function chartPareto(id) {
  const d = DATA.pareto.clientes;
  const n = d.id_cliente.length;
  const nCliente = Array.from({ length: n }, (_, i) => i + 1);

  Plotly.newPlot(id, [
    {
      x: nCliente,
      y: d.pct_acum,
      type: "scatter",
      mode: "lines",
      fill: "tozeroy",
      fillcolor: "rgba(239,142,128,0.25)",
      name: "% acumulado",
      line: { color: PALETTE.coral, width: 2.4 },
      hovertemplate: "Cliente %{x} de " + n + "<br>% acumulado: %{y:.1f}%<extra></extra>",
    },
    {
      x: [1, n],
      y: [80, 80],
      type: "scatter",
      mode: "lines",
      name: "80%",
      line: { color: PALETTE.red, width: 1.4, dash: "dot" },
      hoverinfo: "skip",
    },
  ], ly({
    yaxis: {
      title: "% acumulado del volumen",
      range: [0, 105],
      tickvals: [0, 20, 40, 60, 80, 100],
      gridcolor: "rgba(24,51,44,0.07)",
    },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
    xaxis: {
      title: "Clientes (ordenados por volumen)",
      tickmode: "array",
      tickvals: n <= 20 ? nCliente : [1, Math.round(n * 0.25), Math.round(n * 0.5), Math.round(n * 0.75), n],
      tickangle: 0,
    },
  }), PLOTLY_CFG);
}

function chartTrend(id) {
  const d = DATA.trimestral;
  const labels = d.trimestre.map(quarterLabel);
  const x = Array.from({ length: labels.length }, (_, i) => i);

  Plotly.newPlot(id, [
    {
      x, y: d.n_transacciones,
      type: "bar",
      name: "# Transacciones",
      yaxis: "y2",
      marker: { color: PALETTE.mintAlpha, line: { color: PALETTE.mint, width: 1 } },
      hovertemplate: "%{text}<br>Txns: %{y}<extra></extra>",
      text: labels,
    },
    {
      x, y: d.volumen,
      type: "scatter",
      mode: "lines+markers",
      name: "Volumen",
      line: { color: PALETTE.blue, width: 2.4 },
      marker: { size: 7, color: PALETTE.blue },
      hovertemplate: "%{text}<br>Volumen: $%{y:,.0f}<extra></extra>",
      text: labels,
    },
  ], ly({
    xaxis:  { tickvals: x, ticktext: labels, tickangle: 30 },
    yaxis:  { title: "Volumen (USD)" },
    yaxis2: {
      title: "# Transacciones",
      overlaying: "y",
      side: "right",
      gridcolor: "transparent",
      tickfont: { color: "#5d6d69" },
      titlefont: { color: "#334743" },
    },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}

function chartBubble(id) {
  const d = DATA.bubble_productos;
  const n = d.nombre_producto.length;
  const tipos = [...new Set(d.tipo_producto.map(t => t.trim()))];
  const palette = [PALETTE.blue, PALETTE.mint, PALETTE.amber, PALETTE.coral, PALETTE.teal, PALETTE.slate];
  const colorMap = Object.fromEntries(tipos.map((t, i) => [t, palette[i % palette.length]]));

  // Jitter: agrupar por tasa similar y distribuir en abanico para evitar solapamiento
  const xRange = Math.max(...d.tasa_pct) - Math.min(...d.tasa_pct) || 1;
  const yRange = Math.max(...d.volumen) - Math.min(...d.volumen) || 1;
  const jitterX = xRange * 0.08;
  const jitterY = yRange * 0.04;

  const xJittered = [];
  const yJittered = [];
  for (let i = 0; i < n; i++) {
    const x0 = d.tasa_pct[i];
    const y0 = d.volumen[i];
    const sameTasa = d.tasa_pct.map((t, j) => Math.abs(t - x0) < 0.6 ? j : -1).filter(j => j >= 0).sort((a, b) => a - b);
    const pos = sameTasa.indexOf(i);
    const k = sameTasa.length;
    const angle = k > 1 ? (pos / (k - 1) - 0.5) * Math.PI * 0.85 : 0;
    xJittered.push(x0 + (k > 1 ? Math.sin(angle) * jitterX : 0));
    yJittered.push(y0 + (k > 1 ? Math.cos(angle) * jitterY : 0));
  }

  const maxTxn = Math.max(...d.n_transacciones);
  const traces = tipos.map(tipo => {
    const idx = d.tipo_producto.map((t, i) => t.trim() === tipo ? i : -1).filter(i => i >= 0);
    return {
      x: idx.map(i => xJittered[i]),
      y: idx.map(i => yJittered[i]),
      text: idx.map(i => d.nombre_producto[i]),
      customdata: idx.map(i => [d.tasa_pct[i], d.n_transacciones[i]]),
      mode: "markers+text",
      type: "scatter",
      name: tipo,
      textposition: "top center",
      textfont: { size: 10, color: "#18332c", family: "Manrope" },
      marker: {
        size: idx.map(i => Math.max((d.n_transacciones[i] / maxTxn) * 50, 18)),
        color: colorMap[tipo],
        opacity: 0.72,
        line: { color: "rgba(255,255,255,0.8)", width: 1.2 },
      },
      hovertemplate: "<b>%{text}</b><br>Tasa: %{customdata[0]:.1f}%<br>Volumen: $%{y:,.0f}<br>Txns: %{customdata[1]}<extra></extra>",
    };
  });

  Plotly.newPlot(id, traces, ly({
    xaxis:  {
      title: "Tasa de interés (%)",
      zeroline: true,
      range: [Math.min(...d.tasa_pct) - 2, Math.max(...d.tasa_pct) + 2],
    },
    yaxis:  {
      title: "Volumen (USD)",
      range: [Math.min(...d.volumen) - 15000, Math.max(...d.volumen) + 15000],
    },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
    margin: { l: 60, r: 32, t: 56, b: 56 },
  }), PLOTLY_CFG);
}

function chartTreemap(id) {
  const d = DATA.treemap;
  const labels = d.pais.map((p, i) =>
    `${p}<br>$${(d.volumen[i] / 1000).toFixed(0)}K<br>${d.n_transacciones[i]} txns<br>Monto promo./txn: $${d.ticket_promedio[i].toLocaleString("es-DO", { maximumFractionDigits: 0 })}`
  );

  Plotly.newPlot(id, [{
    type: "treemap",
    labels: d.pais,
    parents: d.pais.map(() => ""),
    values: d.volumen,
    text: labels,
    textinfo: "text",
    hovertemplate: "<b>%{label}</b><br>Volumen: $%{value:,.0f}<br>Ticket prom: $%{customdata:,.0f}<extra></extra>",
    customdata: d.ticket_promedio,
    marker: {
      colors: d.volumen,
      colorscale: [[0, "#c3e8f4"], [1, "#2563a8"]],
      showscale: false,
      line: { width: 2, color: "rgba(255,255,255,0.7)" },
    },
    textfont: { size: 12, color: "#18332c", family: "Manrope" },
  }], ly({ margin: { l: 8, r: 8, t: 8, b: 8 } }), PLOTLY_CFG);
}

function chartHistogram(id) {
  const d = DATA.productos_por_cliente;
  const keys   = Object.keys(d).map(Number).sort((a, b) => a - b);
  const counts  = keys.map(k => d[String(k)]);
  const total   = counts.reduce((s, v) => s + v, 0);
  const mean    = keys.reduce((s, k, i) => s + k * counts[i], 0) / total;
  const median  = (() => {
    let cum = 0;
    for (let i = 0; i < keys.length; i++) {
      cum += counts[i];
      if (cum >= total / 2) return keys[i];
    }
    return keys[Math.floor(keys.length / 2)];
  })();

  Plotly.newPlot(id, [
    {
      x: keys,
      y: counts,
      type: "bar",
      name: "Clientes",
      marker: { color: PALETTE.blueAlpha, line: { color: PALETTE.blue, width: 1.2 } },
      hovertemplate: "%{x} producto(s): %{y} clientes<extra></extra>",
    },
  ], ly({
    xaxis: { title: "# productos por cliente", dtick: 1 },
    yaxis: { title: "Frecuencia" },
    shapes: [
      { type: "line", x0: mean,   x1: mean,   y0: 0, y1: 1, yref: "paper", line: { color: PALETTE.coral, width: 2, dash: "dash" } },
      { type: "line", x0: median, x1: median, y0: 0, y1: 1, yref: "paper", line: { color: PALETTE.mint,  width: 2, dash: "dot" } },
    ],
    annotations: [
      { x: mean,   y: 1, yref: "paper", text: `Media: ${mean.toFixed(1)}`,   showarrow: false, font: { color: PALETTE.coral, size: 11 }, yanchor: "bottom" },
      { x: median, y: 1, yref: "paper", text: `Mediana: ${median}`, showarrow: false, font: { color: PALETTE.mint,  size: 11 }, yanchor: "bottom", xshift: 40 },
    ],
  }), PLOTLY_CFG);
}

function chartHeatmap(id) {
  const d = DATA.heatmap;
  Plotly.newPlot(id, [{
    z: d.valores,
    x: d.segmentos,
    y: d.tipos,
    type: "heatmap",
    colorscale: "YlOrRd",
    hovertemplate: "<b>%{y} × %{x}</b><br>Volumen: $%{z:,.0f}<extra></extra>",
    colorbar: {
      title: "Volumen",
      titlefont: { color: "#334743", size: 11 },
      tickfont:  { color: "#5d6d69", size: 10 },
      tickformat: ",.0s",
    },
  }], ly({
    xaxis: { title: "Segmento" },
    yaxis: { title: "Tipo producto" },
    margin: { l: 110, r: 18, t: 24, b: 50 },
  }), PLOTLY_CFG);
}

function chartDonut(id) {
  const d = DATA.donut_segmentos;
  const labels = d.segmento.map((s, i) =>
    `${s}<br>${d.pct[i].toFixed(1)}% | $${(d.volumen[i] / 1000).toFixed(0)}K<br>${d.n_clientes[i]} clientes`
  );
  const colors = [PALETTE.blue, PALETTE.mint, PALETTE.amber];

  Plotly.newPlot(id, [{
    labels: d.segmento,
    values: d.volumen,
    text: labels,
    type: "pie",
    hole: 0.52,
    textinfo: "none",
    hovertemplate: "<b>%{label}</b><br>%{text}<extra></extra>",
    marker: {
      colors,
      line: { color: "rgba(255,255,255,0.85)", width: 2.4 },
    },
  }], ly({
    legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.06, bgcolor: "transparent" },
    margin: { l: 18, r: 18, t: 18, b: 18 },
  }), PLOTLY_CFG);
}

function chartScatterReg(id) {
  const d = DATA.scatter_regresion;
  const segmentos = [...new Set(d.segmento)];
  const palette   = [PALETTE.blue, PALETTE.mint, PALETTE.amber];
  const colorMap  = Object.fromEntries(segmentos.map((s, i) => [s, palette[i % palette.length]]));

  const traces = segmentos.map(seg => {
    const idx = d.segmento.map((s, i) => s === seg ? i : -1).filter(i => i >= 0);
    return {
      x: idx.map(i => d.n_productos[i]),
      y: idx.map(i => d.volumen[i]),
      mode: "markers",
      type: "scatter",
      name: seg,
      marker: { color: colorMap[seg], size: 9, opacity: 0.8, line: { color: "rgba(255,255,255,0.6)", width: 1 } },
      hovertemplate: `${seg}<br>Productos: %{x}<br>Volumen: $%{y:,.0f}<extra></extra>`,
    };
  });

  // regression line
  const x = d.n_productos, y = d.volumen;
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  const slope = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / x.reduce((s, v) => s + (v - mx) ** 2, 0);
  const intercept = my - slope * mx;
  const xMin = Math.min(...x), xMax = Math.max(...x);
  const r2 = (() => {
    const ssTot = y.reduce((s, v) => s + (v - my) ** 2, 0);
    const ssRes = x.reduce((s, v, i) => s + (y[i] - (slope * v + intercept)) ** 2, 0);
    return 1 - ssRes / ssTot;
  })();

  traces.push({
    x: [xMin, xMax],
    y: [slope * xMin + intercept, slope * xMax + intercept],
    mode: "lines",
    type: "scatter",
    name: `R² = ${r2.toFixed(3)}`,
    line: { color: PALETTE.ink, width: 2, dash: "dash" },
    hoverinfo: "skip",
  });

  Plotly.newPlot(id, traces, ly({
    xaxis: { title: "# productos" },
    yaxis: { title: "Volumen (USD)" },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}

function chartArea(id) {
  const d = DATA.mensual;
  const ma3 = d.volumen.map((_, i) => {
    const slice = d.volumen.slice(Math.max(0, i - 2), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  Plotly.newPlot(id, [
    {
      x: d.mes, y: d.volumen,
      type: "scatter",
      fill: "tozeroy",
      fillcolor: PALETTE.blueAlpha,
      line: { color: PALETTE.blue, width: 2.2 },
      name: "Volumen",
      hovertemplate: "%{x}<br>$%{y:,.0f}<extra></extra>",
    },
    {
      x: d.mes, y: ma3,
      type: "scatter",
      mode: "lines",
      line: { color: PALETTE.coral, width: 2.8 },
      name: "MA 3 meses",
      hovertemplate: "%{x}<br>MA: $%{y:,.0f}<extra></extra>",
    },
  ], ly({
    xaxis: { tickangle: 40 },
    yaxis: { title: "Volumen (USD)" },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}

function chartScatterPais(id) {
  const d = DATA.scatter_paises;
  const maxVol = Math.max(...d.volumen);
  const colors = [PALETTE.blue, PALETTE.mint, PALETTE.amber, PALETTE.coral, PALETTE.teal];

  Plotly.newPlot(id, [{
    x: d.n_clientes,
    y: d.ticket_promedio,
    text: d.pais,
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { size: 12, color: "#18332c", family: "Manrope" },
    marker: {
      size: d.volumen.map(v => Math.max((v / maxVol) * 65, 22)),
      color: colors.slice(0, d.pais.length),
      opacity: 0.78,
      line: { color: "rgba(24,51,44,0.12)", width: 1.2 },
    },
    hovertemplate: "<b>%{text}</b><br>Clientes: %{x}<br>Ticket promedio: $%{y:,.0f}<extra></extra>",
  }], ly({
    xaxis: { title: "# clientes" },
    yaxis: { title: "Ticket promedio por transacción (USD)" },
  }), PLOTLY_CFG);
}

function chartRadar(id) {
  const r = DATA.radar;
  const lineColors = [PALETTE.blue, PALETTE.mint, PALETTE.amber];
  const fillColors = [PALETTE.blueAlpha, PALETTE.mintAlpha, PALETTE.amberAlpha];

  const traces = r.segmentos.map((seg, i) => ({
    type: "scatterpolar",
    r: [...r.valores[i], r.valores[i][0]],
    theta: [...r.dimensiones, r.dimensiones[0]],
    fill: "toself",
    fillcolor: fillColors[i] || "rgba(150,150,150,0.14)",
    name: seg,
    line: { color: lineColors[i] || "#96a4a0", width: 2.5 },
    marker: { size: 4 },
  }));

  Plotly.newPlot(id, traces, {
    ...PLOTLY_LAYOUT,
    polar: {
      bgcolor: "transparent",
      radialaxis: {
        gridcolor:  "rgba(24,51,44,0.08)",
        linecolor:  "rgba(24,51,44,0.08)",
        range: [0, 1.1],
        tickfont: { size: 9, color: "#5d6d69" },
      },
      angularaxis: {
        gridcolor: "rgba(24,51,44,0.08)",
        linecolor: "rgba(24,51,44,0.08)",
        tickfont:  { color: "#5d6d69" },
      },
    },
    legend: { x: 0.78, y: 1.08, bgcolor: "transparent" },
  }, PLOTLY_CFG);
}

function chartBoxplots(id) {
  const groups = [DATA.boxplot.tipo_transaccion, DATA.boxplot.pais, DATA.boxplot.segmento];
  const allColors = [PALETTE.blue, PALETTE.mint, PALETTE.amber, PALETTE.coral, PALETTE.teal, PALETTE.red];
  let colorIndex = 0;
  const traces = [];

  groups.forEach(group => {
    Object.entries(group).forEach(([key, values]) => {
      traces.push({
        y: values,
        type: "box",
        name: key,
        marker: { color: allColors[colorIndex % allColors.length], outliercolor: PALETTE.red },
        boxpoints: "outliers",
        line: { width: 1.5 },
      });
      colorIndex++;
    });
  });

  Plotly.newPlot(id, traces, ly({
    showlegend: false,
    yaxis: { title: "Monto (USD)" },
  }), PLOTLY_CFG);
}

function chartTopClientes(id) {
  const d = DATA.top_clientes;
  const labels = [...d.id_cliente].reverse().map(c => `Cliente ${c}`);
  const values = [...d.volumen].reverse();

  Plotly.newPlot(id, [{
    y: labels,
    x: values,
    type: "bar",
    orientation: "h",
    marker: {
      color: values.map((_, i) => `rgba(93,142,247,${0.35 + (i / Math.max(values.length - 1, 1)) * 0.55})`),
      line: { color: PALETTE.blue, width: 0.7 },
    },
    hovertemplate: "%{y}<br>Volumen: $%{x:,.0f}<extra></extra>",
  }], ly({
    margin: { l: 112, r: 24, t: 16, b: 48 },
    xaxis: { title: "Volumen (USD)" },
    height: 420,
  }), PLOTLY_CFG);
}

function chartRanking(id) {
  const d = DATA.ranking_productos;
  const labels = [...d.nombre_producto].reverse();
  const values = [...d.volumen].reverse();

  Plotly.newPlot(id, [{
    y: labels,
    x: values,
    type: "bar",
    orientation: "h",
    marker: {
      color: values.map((_, i) => `hsl(${192 + i * 10}, 58%, 70%)`),
      line: { color: "rgba(24,51,44,0.08)", width: 0.7 },
    },
    hovertemplate: "%{y}<br>Volumen: $%{x:,.0f}<extra></extra>",
  }], ly({
    margin: { l: 146, r: 24, t: 16, b: 48 },
    xaxis: { title: "Volumen (USD)" },
  }), PLOTLY_CFG);
}

function chartPieProductos(id) {
  const d = DATA.ranking_productos;

  Plotly.newPlot(id, [{
    labels: d.nombre_producto,
    values: d.volumen,
    type: "pie",
    textinfo: "label+percent",
    textfont: { size: 10, color: "#18332c", family: "Manrope" },
    marker: {
      colors: d.nombre_producto.map((_, i) => `hsl(${192 + i * 12}, 58%, 70%)`),
      line: { color: "rgba(255,255,255,0.85)", width: 2.4 },
    },
    hovertemplate: "<b>%{label}</b><br>Volumen: $%{value:,.0f}<br>%{percent}<extra></extra>",
  }], ly({ showlegend: false }), PLOTLY_CFG);
}

// ── Regresión ─────────────────────────────────────────────────────────────────

function chartRegScatter(id) {
  const r = DATA.regresion;
  const min_v = Math.min(...r.y_real, ...r.y_pred);
  const max_v = Math.max(...r.y_real, ...r.y_pred);

  Plotly.newPlot(id, [
    {
      x: r.y_real,
      y: r.y_pred,
      mode: "markers",
      type: "scatter",
      name: "Clientes",
      marker: { color: PALETTE.blue, size: 8, opacity: 0.7, line: { color: "rgba(255,255,255,0.6)", width: 1 } },
      hovertemplate: "Real: $%{x:,.0f}<br>Pred: $%{y:,.0f}<extra></extra>",
    },
    {
      x: [min_v, max_v],
      y: [min_v, max_v],
      mode: "lines",
      type: "scatter",
      name: "Pred. perfecta",
      line: { color: PALETTE.red, width: 2, dash: "dash" },
      hoverinfo: "skip",
    },
  ], ly({
    xaxis: { title: "Volumen Real (USD)" },
    yaxis: { title: "Volumen Predicho (USD)" },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}

function chartRegResiduos(id) {
  const res = DATA.regresion.residuos;
  Plotly.newPlot(id, [
    {
      x: res,
      type: "histogram",
      nbinsx: 22,
      marker: { color: PALETTE.amber, opacity: 0.82, line: { color: "rgba(255,255,255,0.6)", width: 0.5 } },
      name: "Residuos",
      hovertemplate: "%{x:,.0f} — %{y} clientes<extra></extra>",
    },
    {
      x: [0, 0],
      y: [0, res.length * 0.22],
      mode: "lines",
      type: "scatter",
      line: { color: PALETTE.red, width: 2, dash: "dash" },
      name: "Media = 0",
      hoverinfo: "skip",
    },
  ], ly({
    xaxis: { title: "Residuo (USD)" },
    yaxis: { title: "Frecuencia" },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
    barmode: "overlay",
  }), PLOTLY_CFG);
}

function chartRegCoefs(id) {
  const coefs = DATA.regresion.coeficientes;
  const keys  = Object.keys(coefs).sort((a, b) => Math.abs(coefs[b].coef) - Math.abs(coefs[a].coef));

  const vals    = keys.map(k => coefs[k].coef);
  const errLow  = keys.map(k => coefs[k].coef - coefs[k].ci_low);
  const errHigh = keys.map(k => coefs[k].ci_high - coefs[k].coef);
  const colors  = vals.map(v => v > 0 ? "#22c55e" : "#ef4444");
  const sig     = keys.map(k => coefs[k].pvalue < 0.05 ? "★" : "");

  Plotly.newPlot(id, [{
    y: keys.map((k, i) => `${k} ${sig[i]}`),
    x: vals,
    type: "bar",
    orientation: "h",
    error_x: { type: "data", symmetric: false, array: errHigh, arrayminus: errLow, color: "rgba(24,51,44,0.45)", thickness: 1.5, width: 5 },
    marker: { color: colors, opacity: 0.8 },
    hovertemplate: "%{y}<br>Coef: %{x:,.1f}<extra></extra>",
  }], ly({
    xaxis: { title: "Coeficiente (★ p<0.05)", zeroline: true, zerolinecolor: "rgba(24,51,44,0.35)", zerolinewidth: 1.5 },
    margin: { l: 148, r: 24, t: 24, b: 48 },
    showlegend: false,
  }), PLOTLY_CFG);
}

function chartRegQQ(id) {
  const res = [...DATA.regresion.residuos].sort((a, b) => a - b);
  const n   = res.length;
  const mu  = res.reduce((s, v) => s + v, 0) / n;
  const sd  = Math.sqrt(res.reduce((s, v) => s + (v - mu) ** 2, 0) / (n - 1));
  const std = res.map(v => (v - mu) / sd);

  // Theoretical quantiles from standard normal using probit approximation
  const probit = p => {
    const a = [2.515517, 0.802853, 0.010328];
    const b = [1.432788, 0.189269, 0.001308];
    const t = Math.sqrt(-2 * Math.log(Math.min(p, 1 - p)));
    const num = a[0] + a[1] * t + a[2] * t * t;
    const den = 1 + b[0] * t + b[1] * t * t + b[2] * t * t * t;
    return p < 0.5 ? -(t - num / den) : t - num / den;
  };
  const theo = std.map((_, i) => probit((i + 0.5) / n));

  // Reference line through 25th and 75th percentiles
  const q1t = theo[Math.floor(n * 0.25)], q3t = theo[Math.floor(n * 0.75)];
  const q1s = std[Math.floor(n * 0.25)],  q3s = std[Math.floor(n * 0.75)];
  const slope = (q3s - q1s) / (q3t - q1t);
  const intc  = q1s - slope * q1t;
  const xLine = [theo[0], theo[n - 1]];

  Plotly.newPlot(id, [
    {
      x: theo,
      y: std,
      mode: "markers",
      type: "scatter",
      marker: { color: PALETTE.mint, size: 7, opacity: 0.75, line: { color: "rgba(255,255,255,0.5)", width: 1 } },
      name: "Residuos",
      hovertemplate: "Teórico: %{x:.2f}<br>Muestral: %{y:.2f}<extra></extra>",
    },
    {
      x: xLine,
      y: xLine.map(x => slope * x + intc),
      mode: "lines",
      type: "scatter",
      line: { color: PALETTE.red, width: 2 },
      name: "Normal teórica",
      hoverinfo: "skip",
    },
  ], ly({
    xaxis: { title: "Cuantiles teóricos" },
    yaxis: { title: "Cuantiles muestrales (std)" },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}

// ── Journey ───────────────────────────────────────────────────────────────────

function chartJourneyVol(id, cid) {
  const c = DATA.journey[String(cid)];
  const yK = c.vol_acum_y.map(v => v / 1000); // en $K

  Plotly.newPlot(id, [
    {
      x: c.vol_acum_x,
      y: yK,
      type: "scatter",
      fill: "tozeroy",
      fillcolor: PALETTE.blueAlpha,
      line: { color: PALETTE.blue, width: 2.2 },
      name: "Vol. acumulado",
      hovertemplate: "Mes %{x}<br>$%{y:.1f}K<extra></extra>",
    },
    {
      x: c.productos.map(p => p.mes),
      y: c.productos.map(p => {
        const idx = c.vol_acum_x.indexOf(p.mes);
        return idx >= 0 ? yK[idx] : null;
      }),
      mode: "markers+text",
      type: "scatter",
      text: c.productos.map(p => p.label),
      textposition: "top center",
      textfont: { size: 10, color: PALETTE.ink },
      marker: { color: PALETTE.red, size: 10, symbol: "circle" },
      name: "Nuevo producto",
      hovertemplate: "%{text}: %{customdata}<br>Mes %{x}<extra></extra>",
      customdata: c.productos.map(p => p.nombre),
    },
  ], ly({
    xaxis: { title: "Meses desde 1ra transacción", dtick: 1 },
    yaxis: { title: "Volumen acumulado ($K)" },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}

function chartJourneyProd(id, cid) {
  const c = DATA.journey[String(cid)];

  Plotly.newPlot(id, [
    {
      x: c.step_x,
      y: c.step_y,
      type: "scatter",
      mode: "lines+markers",
      line: { color: PALETTE.mint, width: 2.4, shape: "hv" },
      marker: { color: PALETTE.mint, size: 7 },
      fill: "tozeroy",
      fillcolor: PALETTE.mintAlpha,
      name: "Productos",
      hovertemplate: "Mes %{x}<br>%{y} producto(s)<extra></extra>",
    },
    ...c.productos.map(p => ({
      x: [p.mes],
      y: [c.step_y[p.mes] || 0],
      mode: "markers+text",
      type: "scatter",
      text: [p.label],
      textposition: "top center",
      textfont: { size: 9, color: PALETTE.ink },
      marker: { color: PALETTE.amber, size: 9, symbol: "diamond" },
      name: p.label,
      showlegend: false,
      hovertemplate: `${p.label}: ${p.nombre}<extra></extra>`,
    })),
  ], ly({
    xaxis: { title: "Meses desde 1ra transacción", dtick: 1 },
    yaxis: { title: "Productos acumulados", dtick: 1 },
    legend: { x: 0, y: 1.08, orientation: "h", bgcolor: "transparent" },
  }), PLOTLY_CFG);
}
