import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

export default function ProductBubble() {
  const data = useData()
  const PRODUCT_RANKING = data.business_overview.PRODUCT_RANKING
  const PRODUCT_TYPE_COLORS = data.kpis.PRODUCT_TYPE_COLORS

  // Build series per product type
  const types = [...new Set(PRODUCT_RANKING.map((p) => p.tipo))]
  const series = types.map((tipo) => {
    const prods = PRODUCT_RANKING.filter((p) => p.tipo === tipo)
    return {
      name: tipo,
      type: 'scatter',
      data: prods.map((p) => [p.tasa * 100, p.volumen, p.n_txn, p.nombre]),
      symbolSize: (val) => Math.max(8, Math.sqrt(val[2]) * 3),
      itemStyle: { color: PRODUCT_TYPE_COLORS[tipo] || '#94a3b8', opacity: 0.85 },
      label: {
        show: true,
        formatter: (p) => p.value[3],
        position: 'top',
        fontSize: 9,
        color: '#94a3b8',
      },
    }
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (p) =>
        `<b>${p.value[3]}</b><br/>Tipo: ${p.seriesName}<br/>Tasa: ${p.value[0].toFixed(1)}%<br/>Volumen: ${fmtUSD(p.value[1])}<br/>Transacciones: ${p.value[2]}`,
    },
    legend: {
      data: types,
      bottom: 0,
      textStyle: { color: '#94a3b8', fontSize: 10 },
    },
    grid: { left: 12, right: 12, bottom: 36, top: 8, containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Tasa de interés (%)',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    yAxis: {
      type: 'value',
      name: 'Volumen USD',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `$${(v/1000).toFixed(0)}K` },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series,
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
