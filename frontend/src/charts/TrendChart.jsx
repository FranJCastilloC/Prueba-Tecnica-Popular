import ReactECharts from 'echarts-for-react'
import { QUARTERLY } from '../data/businessOverview'
import { fmtUSD, quarterLabel } from '../utils/formatters'

export default function TrendChart() {
  const labels   = QUARTERLY.map((q) => quarterLabel(q.quarter))
  const volumes  = QUARTERLY.map((q) => q.volumen)
  const txns     = QUARTERLY.map((q) => q.n_txn)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const q = params[0]
        return `<b>${q.name}</b><br/>Volumen: ${fmtUSD(params[0].value)}<br/>Transacciones: ${params[1]?.value}`
      },
    },
    legend: {
      data: ['Volumen USD', 'Transacciones'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0,
    },
    grid: { left: 12, right: 12, bottom: 30, top: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#64748b', fontSize: 11 },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Volumen USD',
        nameTextStyle: { color: '#475569', fontSize: 10 },
        axisLabel: {
          color: '#64748b', fontSize: 10,
          formatter: (v) => `$${(v/1000).toFixed(0)}K`,
        },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      {
        type: 'value',
        name: '# Txn',
        nameTextStyle: { color: '#475569', fontSize: 10 },
        axisLabel: { color: '#64748b', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Volumen USD',
        type: 'bar',
        yAxisIndex: 0,
        data: volumes,
        barMaxWidth: 40,
        itemStyle: {
          color: (p) => {
            const maxIdx = volumes.indexOf(Math.max(...volumes))
            return p.dataIndex === maxIdx ? '#22d3ee' : '#334155'
          },
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: false,
        },
      },
      {
        name: 'Transacciones',
        type: 'line',
        yAxisIndex: 1,
        data: txns,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#34d399', width: 2 },
        itemStyle: { color: '#34d399' },
        areaStyle: { color: 'rgba(52,211,153,0.07)' },
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
