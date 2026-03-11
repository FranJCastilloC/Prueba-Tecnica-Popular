import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

export default function SegmentDonut() {
  const data = useData()
  const SEGMENTS = data.kpis.SEGMENTS

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(148,163,184,0.2)',
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      formatter: (p) =>
        `<b>${p.name}</b><br/>Volumen: ${fmtUSD(p.value)}<br/>Participación: ${p.percent.toFixed(1)}%<br/>Clientes: ${SEGMENTS.find(s => s.segmento === p.name)?.n_clientes}`,
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: 'rgba(15,23,42,0.9)' },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          fontSize: 11,
          fontWeight: 'bold',
          color: '#0f172a',
        },
        data: SEGMENTS.map((s) => ({
          name: s.segmento,
          value: s.volumen,
          itemStyle: { color: s.color },
        })),
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' },
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
