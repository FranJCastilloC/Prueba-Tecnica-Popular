import ReactECharts from 'echarts-for-react'
import { PENETRATION_HISTOGRAM } from '../data/penetration'

export default function PenetrationHistogram() {
  const COLORS = ['#fb7185','#fbbf24','#fbbf24','#34d399','#34d399','#22d3ee','#22d3ee','#a78bfa']

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const p = params[0]
        return `<b>${p.name}</b><br/>Clientes: ${p.value}`
      },
    },
    grid: { left: 8, right: 8, top: 20, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: PENETRATION_HISTOGRAM.map((d) => `${d.n_productos} prod.`),
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Clientes',
      nameTextStyle: { color: '#475569', fontSize: 10 },
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        type: 'bar',
        data: PENETRATION_HISTOGRAM.map((d, i) => ({
          value: d.n_clientes,
          itemStyle: { color: COLORS[i], borderRadius: [4, 4, 0, 0] },
        })),
        barMaxWidth: 50,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: '#94a3b8',
          fontSize: 11,
          fontWeight: 'bold',
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              name: 'Media 3.7',
              xAxis: '4 prod.',
              lineStyle: { color: '#22d3ee', type: 'dashed', width: 1.5 },
              label: { formatter: 'Media ≈ 3.7', color: '#22d3ee', fontSize: 10 },
            },
          ],
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
