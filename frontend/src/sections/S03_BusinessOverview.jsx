import { motion } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import InsightCard from '../components/InsightCard'
import SegmentDonut from '../charts/SegmentDonut'
import GeoTreemap from '../charts/GeoTreemap'
import ProductBubble from '../charts/ProductBubble'
import TrendChart from '../charts/TrendChart'
import { KPIs, HIGHLIGHTS } from '../data/kpis'
import { fmtUSD, fmtNum, fmtPct } from '../utils/formatters'

const KPI_CARDS = [
  { value: fmtUSD(KPIs.volumen_total),          label: 'Volumen Total USD',    note: '17 meses de actividad',              tone: 'cyan',    delay: 0.05 },
  { value: fmtNum(KPIs.n_transacciones),         label: 'Transacciones',        note: 'Jan 2023 – May 2024',                tone: 'emerald', delay: 0.10 },
  { value: fmtNum(KPIs.n_clientes),              label: 'Clientes Activos',     note: '4 países · 3 segmentos',             tone: 'amber',   delay: 0.15 },
  { value: fmtUSD(KPIs.ticket_promedio, true),   label: 'Ticket Promedio',      note: 'Por transacción',                    tone: 'rose',    delay: 0.20 },
  { value: fmtNum(KPIs.n_productos),             label: 'Productos',            note: '4 tipos, 10 variantes',              tone: 'violet',  delay: 0.25 },
]

export default function S03_BusinessOverview({ onNext, onPrev }) {
  return (
    <motion.section className="flex flex-col gap-8">
      <ChapterHeader
        eyebrow="Capítulo 02 — Panorama"
        title="Radiografía del Negocio"
        description="Una vista completa de la distribución del portafolio: quiénes son los clientes, dónde están, qué productos tienen y cómo evolucionó el negocio."
        storyLabel="Hallazgo central"
        storyText={`${HIGHLIGHTS.pareto80_clients} clientes concentran el 80% del volumen`}
        storyDetail={`Argentina lidera con ${fmtUSD(HIGHLIGHTS.top_country_volume)} (${fmtPct(HIGHLIGHTS.top_country_share)}). PYME es el segmento dominante con ${fmtPct(HIGHLIGHTS.top_segment_share)}.`}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {KPI_CARDS.map((k) => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Insight strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InsightCard label="Segmento líder"  value="PYME"      text={`${fmtPct(HIGHLIGHTS.top_segment_share)} del volumen total en USD`} tone="positive" />
        <InsightCard label="País líder"      value="Argentina" text={`${fmtUSD(HIGHLIGHTS.top_country_volume)} · 23 clientes`}           tone="neutral" />
        <InsightCard label="Mejor trimestre" value="Q3 2023"   text={`${fmtUSD(303779)} — pico de actividad`}                            tone="positive" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Composición por Segmento"
          question="¿Cómo se distribuye el volumen entre PYME, Corporativo y Retail?"
          tag="Segmentación"
        >
          <SegmentDonut />
        </ChartCard>
        <ChartCard
          title="Distribución Geográfica"
          question="¿Qué países generan más volumen?"
          tag="Geografía"
        >
          <GeoTreemap />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Productos: Tasa vs. Volumen"
          question="¿Qué productos son más rentables considerando tasa y volumen?"
          tag="Portafolio"
        >
          <ProductBubble />
        </ChartCard>
        <ChartCard
          title="Tendencia Trimestral"
          question="¿Cómo evolucionó el volumen y la frecuencia en el tiempo?"
          tag="Momentum"
        >
          <TrendChart />
        </ChartCard>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">← Calidad de Datos</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm">
          Continuar → Exploración Comercial
        </button>
      </div>
    </motion.section>
  )
}
