import ReactECharts from 'echarts-for-react'
import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

export default function ScenarioBar() {
  const data = useData()
  const SCENARIOS = data.scenarios.SCENARIOS
  const scenarioList = Object.values(SCENARIOS)

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
        const s = scenarioList[i]
        return `<b>Escenario ${s.label}</b><br/>Volumen incremental: ${fmtUSD(s.incremental)}<br/>Uplift: +${s.uplift_pct}%<br/>Adopciones esperadas: ${s.adoptions}`
      },
    },
    grid: { left: 12, right: 12, top: 24, bottom: 12, containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarioList.map((s) => s.label),
      axisLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Vol. incremental USD',
      nameTextStyle: { color: '#475569', fontSize: 10 },
      axisLabel: { color: '#64748b', fontSize: 10, formatter: (v) => `$${(v/1000).toFixed(0)}K` },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    series: [
      {
        type: 'bar',
        data: scenarioList.map((s) => ({
          value: s.incremental,
          itemStyle: { color: s.color, borderRadius: [6, 6, 0, 0] },
        })),
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top',
          formatter: (p) => {
            const s = scenarioList[p.dataIndex]
            return `${fmtUSD(s.incremental)}\n+${s.uplift_pct}%`
          },
          color: '#f1f5f9',
          fontSize: 11,
          fontWeight: 'bold',
          lineHeight: 18,
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '280px', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
