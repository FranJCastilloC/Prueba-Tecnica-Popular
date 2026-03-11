import ReactECharts from 'echarts-for-react'
import { PENETRATION_FREQUENCY, SPEARMAN } from '../data/penetration'

export default function ScatterPenetration() {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (p) =>
        `<b>${p.value[0]} producto${p.value[0] > 1 ? 's' : ''}</b><br/>Frecuencia promedio: ${p.value[1].toFixed(2)} txn<br/>Clientes en grupo: ${p.value[2]}`,
    },
    graphic: [
      {
        type: 'text',
        right: 20,
        top: 20,
        style: {
          text: `ρ = ${SPEARMAN.rho} · p < 0.001 ★`,
          fill: '#22d3ee',
          font: 'bold 12px Inter, sans-serif',
        },
      },
    ],
    grid: { left: 12, right: 12, bottom: 40, top: 20, containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Productos por cliente',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      min: 0,
      max: 9,
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    yAxis: {
      type: 'value',
      name: 'Transacciones promedio',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      min: 0,
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        type: 'scatter',
        data: PENETRATION_FREQUENCY.map((d) => [d.n_productos, d.avg_txn, d.n_clientes]),
        symbolSize: (val) => Math.max(12, val[2] * 2.5),
        itemStyle: { color: '#22d3ee', opacity: 0.85, borderColor: '#22d3ee33', borderWidth: 2 },
        label: {
          show: true,
          formatter: (p) => `${p.value[1].toFixed(1)} txn`,
          position: 'top',
          color: '#94a3b8',
          fontSize: 10,
        },
      },
      {
        // Trend line — simple linear approximation
        type: 'line',
        data: [[1, 1.67], [8, 9.00]],
        smooth: false,
        symbol: 'none',
        lineStyle: { color: '#34d399', width: 2, type: 'dashed' },
        z: 0,
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '320px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
