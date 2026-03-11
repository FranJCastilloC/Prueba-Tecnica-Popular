import ReactECharts from 'echarts-for-react'
import { GEO } from '../data/businessOverview'
import { fmtUSD } from '../utils/formatters'

export default function GeoTreemap() {
  const total = GEO.reduce((a, c) => a + c.volumen, 0)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (p) => {
        const d = GEO.find(g => g.pais === p.name)
        if (!d) return p.name
        return `<b>${d.pais}</b><br/>Volumen: ${fmtUSD(d.volumen)}<br/>Participación: ${((d.volumen/total)*100).toFixed(1)}%<br/>Clientes: ${d.n_clientes}<br/>Ticket prom.: ${fmtUSD(d.ticket)}`
      },
    },
    series: [
      {
        type: 'treemap',
        width: '100%',
        height: '100%',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: (p) => {
            const d = GEO.find(g => g.pais === p.name)
            if (!d) return p.name
            return [`{pais|${d.pais}}`, `{vol|${fmtUSD(d.volumen)}}`, `{pct|${((d.volumen/total)*100).toFixed(1)}%}`].join('\n')
          },
          rich: {
            pais: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
            vol:  { fontSize: 11, color: 'rgba(15,23,42,0.8)' },
            pct:  { fontSize: 11, color: 'rgba(15,23,42,0.7)', fontStyle: 'italic' },
          },
        },
        itemStyle: { borderWidth: 3, borderColor: 'rgba(15,23,42,0.6)', gapWidth: 3 },
        data: GEO.map((g) => ({
          name: g.pais,
          value: g.volumen,
          itemStyle: { color: g.color },
        })),
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
