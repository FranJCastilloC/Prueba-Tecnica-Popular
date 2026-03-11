import ReactECharts from 'echarts-for-react'
import { SEGMENT_PRODUCT_HEATMAP } from '../data/scenarios'
import { fmtUSD } from '../utils/formatters'

export default function SegmentProductHeatmap() {
  const { tipos, segmentos, valores } = SEGMENT_PRODUCT_HEATMAP

  // Flatten to [segIdx, tipoIdx, value]
  const data = []
  valores.forEach((row, tipoIdx) => {
    row.forEach((val, segIdx) => {
      data.push([segIdx, tipoIdx, val])
    })
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (p) => {
        const seg   = segmentos[p.value[0]]
        const tipo  = tipos[p.value[1]]
        return `<b>${tipo} × ${seg}</b><br/>Volumen: ${fmtUSD(p.value[2])}`
      },
    },
    grid: { left: 110, right: 60, top: 8, bottom: 40, containLabel: false },
    xAxis: {
      type: 'category',
      data: segmentos,
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      axisLine: { show: false },
      splitArea: { show: false },
    },
    yAxis: {
      type: 'category',
      data: tipos,
      axisLabel: {
        color: '#94a3b8', fontSize: 10,
        formatter: (v) => v.length > 16 ? v.slice(0, 15) + '…' : v,
      },
      axisLine: { show: false },
      splitArea: { show: false },
    },
    visualMap: {
      min: 80000,
      max: 340000,
      show: false,
      inRange: { color: ['#1e293b', '#22d3ee'] },
    },
    series: [
      {
        type: 'heatmap',
        data,
        label: {
          show: true,
          formatter: (p) => `$${(p.value[2] / 1000).toFixed(0)}K`,
          color: '#f1f5f9',
          fontSize: 11,
          fontWeight: 'bold',
        },
        itemStyle: { borderColor: 'rgba(15,23,42,0.5)', borderWidth: 2 },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(34,211,238,0.2)' },
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '260px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
