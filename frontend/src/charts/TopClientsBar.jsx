import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

const SEG_COLORS = { PYME: '#34d399', Corporativo: '#fbbf24', Retail: '#22d3ee' }

export default function TopClientsBar() {
  const data = useData()
  const TOP_CLIENTS = data.business_overview.TOP_CLIENTS

  const sorted  = [...TOP_CLIENTS].sort((a, b) => a.volumen - b.volumen)
  const labels  = sorted.map((c) => `Cliente ${c.id}`)
  const values  = sorted.map((c) => c.volumen)
  const colors  = sorted.map((c) => SEG_COLORS[c.segmento] || '#94a3b8')

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
        const c = sorted[i]
        return `<b>Cliente ${c.id}</b><br/>Volumen: ${fmtUSD(c.volumen)}<br/>Segmento: ${c.segmento}<br/>País: ${c.pais}`
      },
    },
    grid: { left: 70, right: 60, top: 8, bottom: 8, containLabel: false },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `$${(v/1000).toFixed(0)}K` },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    yAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [0, 3, 3, 0] } })),
        barMaxWidth: 18,
        label: {
          show: true,
          position: 'right',
          formatter: (p) => `$${(p.value/1000).toFixed(0)}K`,
          color: '#94a3b8',
          fontSize: 9,
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '300px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
