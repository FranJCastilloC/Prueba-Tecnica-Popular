import ReactECharts from 'echarts-for-react'
import { ADOPTION_MATRIX } from '../data/crossSell'

export default function CrossSellHeatmap() {
  const { products, values } = ADOPTION_MATRIX

  // Build flat data array for ECharts heatmap: [x, y, value]
  const data = []
  values.forEach((row, rowIdx) => {
    row.forEach((val, colIdx) => {
      data.push([colIdx, rowIdx, val === null ? null : val])
    })
  })

  const validData = data.filter((d) => d[2] !== null)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (p) => {
        if (p.value[2] === null || p.value[2] === undefined) return 'Mismo producto'
        const pct = (p.value[2] * 100).toFixed(1)
        const yProd = products[p.value[1]]
        const xProd = products[p.value[0]]
        return `<b>P(${xProd} | ${yProd})</b><br/>Probabilidad: <b>${pct}%</b><br/>Si el cliente ya tiene <i>${yProd}</i>,<br/>hay ${pct}% de adoptar <i>${xProd}</i>`
      },
    },
    grid: { left: 100, right: 80, top: 16, bottom: 60, containLabel: false },
    xAxis: {
      type: 'category',
      data: products,
      name: 'Producto recomendado (B)',
      nameTextStyle: { color: '#64748b', fontSize: 9 },
      nameLocation: 'middle',
      nameGap: 42,
      axisLabel: {
        color: '#94a3b8', fontSize: 9,
        formatter: (v) => v.length > 14 ? v.slice(0, 13) + '…' : v,
      },
      splitArea: { show: false },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: products,
      name: 'Ya tiene (A)',
      nameTextStyle: { color: '#64748b', fontSize: 9 },
      nameLocation: 'middle',
      nameGap: 80,
      axisLabel: {
        color: '#94a3b8', fontSize: 9,
        formatter: (v) => v.length > 14 ? v.slice(0, 13) + '…' : v,
      },
      splitArea: { show: false },
      axisLine: { show: false },
    },
    visualMap: {
      min: 0.5,
      max: 0.9,
      calculable: false,
      show: false,
      inRange: { color: ['#1e3a4a', '#22d3ee'] },
    },
    series: [
      {
        type: 'heatmap',
        data: validData,
        label: {
          show: true,
          formatter: (p) => p.value[2] !== null ? `${(p.value[2] * 100).toFixed(0)}%` : '',
          color: '#f1f5f9',
          fontSize: 11,
          fontWeight: 'bold',
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(34,211,238,0.3)' },
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
