/**
 * config.js — Shared palette, Plotly layout defaults, and number formatters.
 * All other modules read from these constants; nothing is hardcoded elsewhere.
 */

const PALETTE = {
  ink:        "#18332c",
  blue:       "#5d8ef7",
  blueAlpha:  "rgba(93,142,247,0.16)",
  mint:       "#6bc7b0",
  mintAlpha:  "rgba(107,199,176,0.18)",
  amber:      "#f1b66d",
  amberAlpha: "rgba(241,182,109,0.18)",
  coral:      "#ef8e80",
  coralAlpha: "rgba(239,142,128,0.18)",
  teal:       "#56b8b1",
  tealAlpha:  "rgba(86,184,177,0.18)",
  slate:      "#6d7f8f",
  red:        "#d96d66",
  seg: {
    Retail:      "#5d8ef7",
    PYME:        "#6bc7b0",
    Corporativo: "#f1b66d",
    Corporate:   "#f1b66d",
  },
};

const PLOTLY_LAYOUT = {
  paper_bgcolor: "transparent",
  plot_bgcolor:  "transparent",
  font: { color: "#5d6d69", family: "Manrope, sans-serif", size: 12 },
  hoverlabel: {
    bgcolor:     "rgba(255,255,255,0.96)",
    bordercolor: "rgba(24,51,44,0.08)",
    font: { color: "#18332c", family: "Manrope, sans-serif", size: 12 },
  },
  margin: { l: 56, r: 18, t: 24, b: 50 },
  xaxis: {
    gridcolor:     "rgba(24,51,44,0.07)",
    zerolinecolor: "rgba(24,51,44,0.08)",
    linecolor:     "rgba(24,51,44,0.08)",
    tickfont:  { color: "#5d6d69" },
    titlefont: { color: "#334743" },
  },
  yaxis: {
    gridcolor:     "rgba(24,51,44,0.07)",
    zerolinecolor: "rgba(24,51,44,0.08)",
    linecolor:     "rgba(24,51,44,0.08)",
    tickfont:  { color: "#5d6d69" },
    titlefont: { color: "#334743" },
  },
};

const PLOTLY_CFG = { responsive: true, displayModeBar: false };

/** Merge per-chart overrides with the shared base layout. */
function ly(overrides = {}) {
  return {
    ...PLOTLY_LAYOUT,
    ...overrides,
    xaxis: { ...PLOTLY_LAYOUT.xaxis, ...(overrides.xaxis || {}) },
    yaxis: { ...PLOTLY_LAYOUT.yaxis, ...(overrides.yaxis || {}) },
  };
}

// ── Formatters ──────────────────────────────────────────────────────────────

const _numFmt = new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 });
const _pctFmt = new Intl.NumberFormat("es-DO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const _usdFmt = new Intl.NumberFormat("es-DO", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const _usdPreciseFmt = new Intl.NumberFormat("es-DO", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmt(n)                     { return _numFmt.format(n); }
function fmtUSD(n, precise = false) { return precise ? _usdPreciseFmt.format(n) : _usdFmt.format(n); }
function fmtPct(n)                  { return `${_pctFmt.format(n)}%`; }

function quarterLabel(value) {
  const [year, quarter] = value.split("Q");
  return `Q${quarter} ${year}`;
}

function monthLabel(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-DO", { month: "short", year: "numeric" })
    .format(new Date(year, month - 1, 1));
}
