/**
 * components.js — Pure HTML-string builders for reusable UI pieces.
 * All functions return strings; callers set innerHTML.
 *
 * Dependencies: config.js (fmtUSD, fmt, fmtPct, quarterLabel, monthLabel)
 */

function sectionIntro({ eyebrow, title, description, highlightLabel, highlightText, detail }) {
  return `
    <div class="page-intro">
      <div class="section-copy">
        <span class="eyebrow">${eyebrow}</span>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
      <div class="story-card">
        <span class="story-label">${highlightLabel}</span>
        <strong>${highlightText}</strong>
        <p>${detail}</p>
      </div>
    </div>
  `;
}

function kpiCard({ value, label, note, tone }) {
  return `
    <article class="kpi" data-tone="${tone}">
      <div class="value">${value}</div>
      <div class="label">${label}</div>
      <div class="kpi-note">${note}</div>
    </article>
  `;
}

function insightStrip(items) {
  return `
    <div class="insight-strip">
      ${items.map(({ label, value, text }) => `
        <article class="insight">
          <span>${label}</span>
          <strong>${value}</strong>
          <p>${text}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function panelCard({ num = "", title, question, id, tag, tall = false }) {
  return `
    <article class="card">
      <div class="card-header">
        <div>
          <div class="card-title">
            ${num ? `<span class="num">${num}</span>` : ""}
            <span class="card-title-text">${title}</span>
          </div>
          ${question ? `<div class="card-question">${question}</div>` : ""}
        </div>
        <span class="card-tag">${tag}</span>
      </div>
      <div class="chart${tall ? " tall" : ""}" id="${id}"></div>
    </article>
  `;
}
