import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'

export default function TicketImpactBar() {
  const data = useData()
  const TICKET_IMPACT = data.penetration.TICKET_IMPACT
  const sorted = [...TICKET_IMPACT].sort((a, b) => b.uplift - a.uplift)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const i = params[0].dataIndex
        const d = sorted[i]
        const sig = d.significant ? ' ★' : ''
        return `<b>${d.tipo}${sig}</b><br/>Uplift ticket: ${d.uplift > 0 ? '+' : ''}$${d.uplift.toLocaleString()}<br/>p-valor: ${d.p_value.toFixed(3)}${d.significant ? ' (significativo)' : ''}<br/>Con producto: $${d.media_tiene.toLocaleString()}<br/>Sin producto: $${d.media_no_tiene.toLocaleString()}`
      },
    },
    grid: { left: 120, right: 60, top: 8, bottom: 8, containLabel: false },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `${v > 0 ? '+' : ''}$${v.toLocaleString()}` },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: sorted.map((d) => d.tipo + (d.significant ? ' ★' : '')),
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => ({
          value: d.uplift,
          itemStyle: {
            color: d.uplift > 0
              ? (d.significant ? '#34d399' : '#34d39966')
              : (d.significant ? '#fb7185' : '#fb718566'),
            borderRadius: d.uplift > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
          },
        })),
        barMaxWidth: 30,
        label: {
          show: true,
          position: (p) => p.value >= 0 ? 'right' : 'left',
          formatter: (p) => `${p.value > 0 ? '+' : ''}$${p.value.toLocaleString()}`,
          color: '#94a3b8',
          fontSize: 10,
          fontWeight: 'bold',
        },
        markLine: {
          symbol: 'none',
          data: [{ xAxis: 0, lineStyle: { color: '#475569', width: 1 } }],
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '240px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
