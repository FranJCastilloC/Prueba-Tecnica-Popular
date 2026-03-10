/**
 * app.js — Bootstrap, navigation, and derived highlights.
 * Entry point: init() is called on DOMContentLoaded.
 *
 * Dependencies: config.js, components.js, charts.js, sections.js
 * Exports globals: DATA, HIGHLIGHTS (consumed by sections.js and charts.js)
 */

const TABS = [
  { id: "overview",     label: "Panorama",     kicker: "Overview"  },
  { id: "tier1",        label: "Críticos",      kicker: "Tier 1"    },
  { id: "tier2",        label: "Importantes",   kicker: "Tier 2"    },
  { id: "tier3",        label: "Complementarios", kicker: "Tier 3"  },
  { id: "rentabilidad", label: "Rentabilidad",  kicker: "Focus"     },
];

let DATA;
let HIGHLIGHTS;

// ── Derived insights ─────────────────────────────────────────────────────────

function getHighlights() {
  const pareto   = DATA.pareto.clientes.pct_acum;
  const i80      = pareto.findIndex(v => v >= 80) + 1;

  const trimestral     = DATA.trimestral;
  const bestQuarterIdx = trimestral.volumen.indexOf(Math.max(...trimestral.volumen));

  const treemap        = DATA.treemap;
  const topCountryIdx  = treemap.volumen.indexOf(Math.max(...treemap.volumen));

  const segmentData    = DATA.donut_segmentos;
  const topSegmentIdx  = segmentData.volumen.indexOf(Math.max(...segmentData.volumen));

  const ranking        = DATA.ranking_productos;
  const topProductIdx  = ranking.volumen.indexOf(Math.max(...ranking.volumen));

  const monthly        = DATA.mensual;
  const bestMonthIdx   = monthly.volumen.indexOf(Math.max(...monthly.volumen));
  const lowMonthIdx    = monthly.volumen.indexOf(Math.min(...monthly.volumen));

  const productDepth   = DATA.productos_por_cliente;
  const totalClients   = Object.values(productDepth).reduce((s, v) => s + v, 0);
  const avgProducts    = Object.entries(productDepth).reduce((s, [n, c]) => s + Number(n) * c, 0) / totalClients;
  const modalProducts  = Number(Object.keys(productDepth).sort((a, b) => productDepth[b] - productDepth[a])[0]);

  const countryScatter       = DATA.scatter_paises;
  const topCountryClientsIdx = countryScatter.n_clientes.indexOf(Math.max(...countryScatter.n_clientes));

  const bubble          = DATA.bubble_productos;
  const highestRateIdx  = bubble.tasa_pct.indexOf(Math.max(...bubble.tasa_pct));

  return {
    i80,
    bestQuarter:          trimestral.trimestre[bestQuarterIdx],
    topCountry:           treemap.pais[topCountryIdx],
    topCountryShare:      (treemap.volumen[topCountryIdx] / DATA.kpis.volumen_total) * 100,
    topSegment:           segmentData.segmento[topSegmentIdx],
    topSegmentShare:      (segmentData.volumen[topSegmentIdx] / DATA.kpis.volumen_total) * 100,
    topProduct:           ranking.nombre_producto[topProductIdx],
    topProductShare:      (ranking.volumen[topProductIdx] / DATA.kpis.volumen_total) * 100,
    topClientId:          DATA.top_clientes.id_cliente[0],
    topClientShare:       (DATA.top_clientes.volumen[0] / DATA.kpis.volumen_total) * 100,
    bestMonth:            monthly.mes[bestMonthIdx],
    lowMonth:             monthly.mes[lowMonthIdx],
    avgProducts,
    modalProducts,
    topCountryByClients:  countryScatter.pais[topCountryClientsIdx],
    highestRateProduct:   bubble.nombre_producto[highestRateIdx],
    highestRate:          bubble.tasa_pct[highestRateIdx],
  };
}

// ── Shell metrics (topbar + hero badges) ─────────────────────────────────────

function updateShellMetrics() {
  const k = DATA.kpis;

  document.getElementById("topbar-meta").innerHTML = `
    <div class="top-metric"><span>Clientes</span><strong>${fmt(k.n_clientes)}</strong></div>
    <div class="top-metric"><span>Productos</span><strong>${fmt(k.n_productos)}</strong></div>
    <div class="top-metric"><span>Transacciones</span><strong>${fmt(k.n_transacciones)}</strong></div>
    <div class="top-metric"><span>Periodo</span><strong>${monthLabel(DATA.mensual.mes[0])} – ${monthLabel(DATA.mensual.mes[DATA.mensual.mes.length - 1])}</strong></div>
  `;

  document.getElementById("hero-volume").textContent = fmtUSD(k.volumen_total);

  document.getElementById("hero-badges").innerHTML = `
    <span class="hero-badge">Pareto 80% en ${HIGHLIGHTS.i80} clientes</span>
    <span class="hero-badge">${HIGHLIGHTS.topSegment} lidera el mix</span>
    <span class="hero-badge">${HIGHLIGHTS.topCountry} es el país #1</span>
    <span class="hero-badge">${HIGHLIGHTS.topProduct} destaca en rentabilidad</span>
  `;
}

// ── Navigation ────────────────────────────────────────────────────────────────

function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";

  TABS.forEach(tab => {
    const btn = document.createElement("button");
    btn.dataset.tab = tab.id;
    btn.innerHTML = `<small>${tab.kicker}</small><span>${tab.label}</span>`;
    btn.addEventListener("click", () => showTab(tab.id));
    nav.appendChild(btn);
  });
}

function showTab(id) {
  document.querySelectorAll(".nav button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === id);
  });

  const app = document.getElementById("app");
  app.innerHTML = "";

  const section = document.createElement("div");
  section.className = "section active";
  app.appendChild(section);

  const renderers = {
    overview:     renderOverview,
    tier1:        renderTier1,
    tier2:        renderTier2,
    tier3:        renderTier3,
    rentabilidad: renderRentabilidad,
  };

  renderers[id](section);
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function init() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
    HIGHLIGHTS = getHighlights();
    updateShellMetrics();
    buildNav();
    showTab("overview");
  } catch (err) {
    document.getElementById("app").innerHTML = `
      <div class="loader">
        <p style="color:#d96d66">Error al cargar data.json: ${err.message}</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", init);
