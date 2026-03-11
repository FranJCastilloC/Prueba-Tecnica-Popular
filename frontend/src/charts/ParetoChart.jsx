import ReactECharts from 'echarts-for-react'
import { PARETO } from '../data/businessOverview'
import { fmtUSD } from '../utils/formatters'

export default function ParetoChart() {
  // Find where 80% is crossed
  const idx80 = PARETO.pct_acum.findIndex((p) => p >= 80)
  const labels = PARETO.id_cliente.map((id, i) => `C${id}`)
  const top30Labels = labels.slice(0, 30)
  const top30Vol    = PARETO.volumen.slice(0, 30)
  const top30Pct    = PARETO.pct_acum.slice(0, 30)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const i = params[0].dataIndex
        return `<b>Cliente ${PARETO.id_cliente[i]}</b><br/>Volumen: ${fmtUSD(PARETO.volumen[i])}<br/>% Acumulado: ${PARETO.pct_acum[i].toFixed(1)}%`
      },
    },
    grid: { left: 12, right: 12, bottom: 40, top: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: top30Labels,
      axisLabel: { color: '#64748b', fontSize: 9, rotate: 45 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `$${(v/1000).toFixed(0)}K` },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      {
        type: 'value',
        min: 0, max: 100,
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        type: 'bar',
        data: top30Vol,
        yAxisIndex: 0,
        barMaxWidth: 30,
        itemStyle: {
          color: (p) => p.dataIndex < idx80 ? '#22d3ee' : '#334155',
          borderRadius: [3, 3, 0, 0],
        },
      },
      {
        type: 'line',
        data: top30Pct,
        yAxisIndex: 1,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#fbbf24', width: 2 },
        markLine: {
          symbol: 'none',
          data: [{ yAxis: 80 }],
          lineStyle: { color: '#fb7185', type: 'dashed', width: 1 },
          label: {
            formatter: '80%',
            color: '#fb7185',
            fontSize: 10,
          },
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
