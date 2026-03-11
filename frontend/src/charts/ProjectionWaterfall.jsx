import ReactECharts from 'echarts-for-react'
import { KPIs } from '../data/kpis'
import { fmtUSD } from '../utils/formatters'

export default function ProjectionWaterfall({ scenario }) {
  if (!scenario) return null

  const base   = KPIs.volumen_total
  const incr   = scenario.incremental
  const total  = base + incr

  // Waterfall: [base invisible, increment, final total shown differently]
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const idx = params[0].dataIndex
        if (idx === 0) return `<b>Volumen actual</b><br/>${fmtUSD(base)}`
        if (idx === 1) return `<b>Incremento cross-sell</b><br/>+${fmtUSD(incr)}<br/>Escenario ${scenario.label}: +${scenario.uplift_pct}%`
        return `<b>Volumen proyectado</b><br/>${fmtUSD(total)}<br/>+${scenario.uplift_pct}% vs. base`
      },
    },
    grid: { left: 12, right: 12, top: 20, bottom: 12, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Volumen Actual', `Incremento\nEsc. ${scenario.label}`, 'Proyectado'],
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `$${(v/1000000).toFixed(2)}M` },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      // Bar 0: actual (solid slate)
      {
        type: 'bar',
        stack: 'total',
        data: [
          { value: base, itemStyle: { color: '#334155', borderRadius: [4, 4, 0, 0] } },
          { value: 0 },
          { value: 0 },
        ],
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top',
          formatter: (p) => p.dataIndex === 0 ? fmtUSD(base) : '',
          color: '#94a3b8',
          fontSize: 10,
        },
      },
      // Bar 1: increment (colored by scenario)
      {
        type: 'bar',
        stack: 'total',
        data: [
          { value: 0 },
          { value: incr, itemStyle: { color: scenario.color, borderRadius: [4, 4, 0, 0] } },
          { value: 0 },
        ],
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top',
          formatter: (p) => p.dataIndex === 1 ? `+${fmtUSD(incr)}` : '',
          color: scenario.color,
          fontSize: 10,
          fontWeight: 'bold',
        },
      },
      // Bar 2: total (cyan)
      {
        type: 'bar',
        data: [
          { value: 0 },
          { value: 0 },
          { value: total, itemStyle: { color: '#22d3ee', borderRadius: [4, 4, 0, 0] } },
        ],
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top',
          formatter: (p) => p.dataIndex === 2 ? `${fmtUSD(total)}\n+${scenario.uplift_pct}%` : '',
          color: '#22d3ee',
          fontSize: 10,
          fontWeight: 'bold',
          lineHeight: 18,
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '280px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
