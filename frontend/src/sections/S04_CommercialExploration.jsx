import { motion } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import InsightCard from '../components/InsightCard'
import ChartCard from '../components/ChartCard'
import ParetoChart from '../charts/ParetoChart'
import TopClientsBar from '../charts/TopClientsBar'
import TrendChart from '../charts/TrendChart'
import GeoTreemap from '../charts/GeoTreemap'
import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

export default function S04_CommercialExploration({ onNext, onPrev }) {
  const data = useData()
  const HIGHLIGHTS = data.kpis.HIGHLIGHTS

  return (
    <motion.section className="flex flex-col gap-8">
      <ChapterHeader
        eyebrow="Capítulo 03 — Dónde está el negocio"
        title="Exploración Comercial"
        description="Identificamos la concentración del valor, los clientes que mueven el negocio y los patrones geográficos y temporales más relevantes."
        storyLabel="Clave del capítulo"
        storyText={`El ${HIGHLIGHTS.pareto80_clients} de los clientes genera el 80% del volumen`}
        storyDetail={`Argentina lidera por volumen USD (${fmtUSD(HIGHLIGHTS.top_country_volume)} · clientes top). La concentración es moderada — no extrema.`}
      />

      {/* Insight strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InsightCard label="País líder"      value={HIGHLIGHTS.top_country}    text={`${fmtUSD(HIGHLIGHTS.top_country_volume)} · clientes top`} tone="neutral" />
        <InsightCard label="Pareto 80%"      value={`~${HIGHLIGHTS.pareto80_clients} clientes`} text="Concentran el 80% del volumen total" tone="warning" />
        <InsightCard label="Mejor trimestre" value={HIGHLIGHTS.best_quarter}   text="Pico de volumen trimestral" tone="positive" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Análisis de Pareto"
          question="¿Cuántos clientes concentran el 80% del negocio?"
          tag="Concentración"
        >
          <ParetoChart />
        </ChartCard>
        <ChartCard
          title="Top 15 Clientes por Volumen"
          question="¿Quiénes son los clientes más valiosos?"
          tag="Ranking"
        >
          <TopClientsBar />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Evolución Trimestral"
          question="¿Cuándo fue el pico? ¿La tendencia es estable?"
          tag="Tendencia"
        >
          <TrendChart />
        </ChartCard>
        <ChartCard
          title="Distribución Geográfica"
          question="¿Qué mercados aportan más volumen?"
          tag="Geografía"
        >
          <GeoTreemap />
        </ChartCard>
      </div>

      {/* Narrative callout */}
      <div className="glass-card-accent p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Interpretación</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          La base tiene una concentración moderada — no extrema. Los {HIGHLIGHTS.pareto80_clients} clientes Pareto son prioritarios
          pero los restantes también generan volumen significativo. Esta estructura sugiere que una
          estrategia de cross-sell sobre los clientes medios puede tener impacto sustancial sin depender
          exclusivamente del top tier.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">← Panorama General</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm">
          Continuar → Penetración y Comportamiento
        </button>
      </div>
    </motion.section>
  )
}
