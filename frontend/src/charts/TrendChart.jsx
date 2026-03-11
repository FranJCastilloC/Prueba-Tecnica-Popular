import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'
import { fmtUSD, quarterLabel } from '../utils/formatters'

export default function TrendChart() {
  const data = useData()
  const QUARTERLY = data.business_overview.QUARTERLY

  const labels   = QUARTERLY.map((q) => quarterLabel(q.quarter))
  const volumes  = QUARTERLY.map((q) => q.volumen)
  const txns     = QUARTERLY.map((q) => q.n_txn)

  const lastIdx = labels.length - 1
  const lastLabel = labels[lastIdx]

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (params) => {
        const q = params[0]
        const isLast = q.dataIndex === lastIdx
        const suffix = isLast ? '<br/><i style="color:#fbbf24">⚠ Trimestre incompleto</i>' : ''
        return `<b>${q.name}</b><br/>Volumen: ${fmtUSD(params[0].value)}<br/>Transacciones: ${params[1]?.value}${suffix}`
      },
    },
    legend: {
      data: ['Volumen USD', '# Txn'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0,
    },
    grid: { left: 12, right: 12, bottom: 30, top: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        color: (value, index) => index === lastIdx ? '#fbbf24' : '#64748b',
        fontSize: 11,
        formatter: (value, index) => index === lastIdx ? `${value}*` : value,
      },
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
        data: volumes.map((v, i) => ({
          value: v,
          itemStyle: i === lastIdx
            ? { color: '#334155', opacity: 0.45, borderColor: '#fbbf24', borderWidth: 1, borderType: 'dashed', borderRadius: [4, 4, 0, 0] }
            : undefined,
        })),
        barMaxWidth: 40,
        itemStyle: {
          color: (p) => {
            if (p.dataIndex === lastIdx) return '#334155'
            const maxIdx = volumes.indexOf(Math.max(...volumes.slice(0, lastIdx)))
            return p.dataIndex === maxIdx ? '#22d3ee' : '#334155'
          },
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: false,
        },
        markArea: {
          silent: true,
          data: [[
            { xAxis: lastLabel, itemStyle: { color: 'rgba(251,191,36,0.04)' } },
            { xAxis: lastLabel },
          ]],
        },
      },
      {
        name: '# Txn',
        type: 'line',
        yAxisIndex: 1,
        data: txns.map((t, i) => ({
          value: t,
          itemStyle: i === lastIdx ? { borderColor: '#fbbf24', borderWidth: 2 } : undefined,
        })),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#34d399', width: 2 },
        itemStyle: { color: '#34d399' },
        areaStyle: { color: 'rgba(52,211,153,0.07)' },
      },
    ],
    graphic: [{
      type: 'text',
      right: 14,
      bottom: 4,
      style: {
        text: '* Trimestre incompleto',
        fill: '#fbbf24',
        fontSize: 10,
        fontStyle: 'italic',
      },
    }],
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
