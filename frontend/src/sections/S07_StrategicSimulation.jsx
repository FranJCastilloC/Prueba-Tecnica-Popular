import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import ScenarioSelector from '../components/ScenarioSelector'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import ScenarioBar from '../charts/ScenarioBar'
import ProjectionWaterfall from '../charts/ProjectionWaterfall'
import SegmentProductHeatmap from '../charts/SegmentProductHeatmap'
import { SCENARIOS } from '../data/scenarios'
import { fmtUSD, fmtPct } from '../utils/formatters'

const SCENARIO_LIST = Object.values(SCENARIOS)

export default function S07_StrategicSimulation({ onNext, onPrev }) {
  const [activeKey, setActiveKey] = useState('base')
  const scenario = SCENARIOS[activeKey]

  return (
    <motion.section className="flex flex-col gap-8">
      <ChapterHeader
        eyebrow="Capítulo 06 — ¿Qué pasa si ejecutamos?"
        title="Simulación Estratégica de Cross-sell"
        description="Convertimos el análisis en una herramienta de decisión. Tres escenarios modelan el impacto de una campaña de cross-sell sobre los 35 clientes elegibles."
        storyLabel="Escenario Base"
        storyText="+$44,688 en volumen incremental · +12.42% uplift"
        storyDetail="9.7 adopciones esperadas sobre 35 clientes elegibles. Sin adquirir nuevos clientes."
      />

      {/* Scenario selector */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Selecciona escenario
        </p>
        <ScenarioSelector
          scenarios={SCENARIO_LIST}
          selected={activeKey}
          onChange={setActiveKey}
        />
        <p className="text-xs text-slate-500 italic">{scenario.description}</p>
      </div>

      {/* KPI cards — animated when scenario changes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <KPICard
            value={`${scenario.adoptions}`}
            label="Adopciones esperadas"
            note={`De ${35} clientes elegibles`}
            tone={scenario.colorClass}
          />
          <KPICard
            value={fmtUSD(scenario.incremental)}
            label="Vol. Incremental"
            note="Sobre la base actual de $2.54M"
            tone={scenario.colorClass}
          />
          <KPICard
            value={fmtPct(scenario.uplift_pct)}
            label="Uplift %"
            note="Crecimiento sin nuevos clientes"
            tone={scenario.colorClass}
          />
          <KPICard
            value={fmtPct(scenario.factor_adopcion * 100)}
            label="Tasa de adopción"
            note="Sobre probabilidad observada"
            tone="slate"
          />
        </motion.div>
      </AnimatePresence>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Proyección de Volumen"
          question="¿Cuánto crece el portafolio bajo este escenario?"
          tag={`Esc. ${scenario.label}`}
        >
          <ProjectionWaterfall scenario={scenario} />
        </ChartCard>
        <ChartCard
          title="Comparativa de Escenarios"
          question="¿Cuánto genera cada escenario?"
          tag="Comparativa"
        >
          <ScenarioBar />
        </ChartCard>
      </div>

      {/* Segment-product heatmap */}
      <ChartCard
        title="Volumen por Segmento × Tipo de Producto"
        question="¿Dónde se concentra el volumen según segmento y tipo de producto?"
        tag="Heatmap"
      >
        <SegmentProductHeatmap />
      </ChartCard>

      {/* Summary narrative */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIO_LIST.map((s) => (
          <motion.button
            key={s.key}
            onClick={() => setActiveKey(s.key)}
            whileHover={{ scale: 1.01 }}
            className={`glass-card p-4 text-left cursor-pointer transition-all ${
              s.key === activeKey ? 'border border-opacity-40' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ borderColor: s.key === activeKey ? s.color : 'transparent' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>
              {s.label}
            </p>
            <p className="text-xl font-bold text-white num">{fmtUSD(s.incremental)}</p>
            <p className="text-sm text-slate-400">+{s.uplift_pct}% uplift</p>
            <p className="text-xs text-slate-500 mt-1">{s.adoptions} adopciones esperadas</p>
          </motion.button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">← Inteligencia de Cross-sell</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm">
          Continuar → Conclusiones
        </button>
      </div>
    </motion.section>
  )
}
