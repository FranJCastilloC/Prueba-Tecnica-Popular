import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

export default function ParetoChart() {
  const data = useData()
  const PARETO = data.business_overview.PARETO

  const n = PARETO.id_cliente.length
  const clientNumbers = PARETO.id_cliente.map((_, i) => i + 1)
  const idx80 = PARETO.pct_acum.findIndex((p) => p >= 80)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const i = params[0].dataIndex
        return `<b>Cliente #${i + 1}</b> (ID ${PARETO.id_cliente[i]})<br/>Volumen: ${fmtUSD(PARETO.volumen[i])}<br/>% Acumulado: ${PARETO.pct_acum[i].toFixed(1)}%`
      },
    },
    grid: { left: 16, right: 16, bottom: 36, top: 16, containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Clientes (ordenados por volumen)',
      nameLocation: 'middle',
      nameGap: 24,
      nameTextStyle: { color: '#64748b', fontSize: 11 },
      min: 0,
      max: n,
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        formatter: (v) => `${Math.round(v)}`,
      },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    yAxis: {
      type: 'value',
      name: '% acumulado del volumen',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#64748b', fontSize: 11 },
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        type: 'line',
        data: clientNumbers.map((x, i) => [x, PARETO.pct_acum[i]]),
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { color: '#ef8e80', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239,142,128,0.35)' },
              { offset: 1, color: 'rgba(239,142,128,0.08)' },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ yAxis: 80 }],
          lineStyle: { color: '#fb7185', type: 'dashed', width: 1.5 },
          label: {
            formatter: '80%',
            color: '#fb7185',
            fontSize: 11,
            position: 'insideEndTop',
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
