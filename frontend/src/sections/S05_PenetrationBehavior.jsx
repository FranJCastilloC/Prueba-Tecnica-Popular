import { motion } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import InsightCard from '../components/InsightCard'
import ChartCard from '../components/ChartCard'
import ScatterPenetration from '../charts/ScatterPenetration'
import PenetrationHistogram from '../charts/PenetrationHistogram'
import TicketImpactBar from '../charts/TicketImpactBar'
import { useData } from '../providers/DataProvider'

export default function S05_PenetrationBehavior({ onNext, onPrev }) {
  const data = useData()
  const SPEARMAN = data.penetration.SPEARMAN

  return (
    <motion.section className="flex flex-col gap-8">
      <ChapterHeader
        eyebrow="Capítulo 04 — El patrón transaccional"
        title="Penetración y Comportamiento"
        description="¿Más productos implica más actividad? La evidencia estadística confirma que sí — pero el tipo de producto importa tanto como la cantidad."
        storyLabel="Hallazgo estadístico"
        storyText={`Correlación Spearman ρ = ${SPEARMAN.rho} · p < 0.001`}
        storyDetail="Clientes con más productos transaccionan significativamente más. La relación es fuerte y estadísticamente válida."
      />

      {/* Insight strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InsightCard label="Correlación Spearman" value={`ρ = ${SPEARMAN.rho}`}    text="Productos ↔ Frecuencia · p < 0.001 ★"     tone="positive" />
        <InsightCard label="Media de penetración" value="2.76 productos"            text="Por cliente activo (rango 1–4)"            tone="neutral"  />
        <InsightCard label="Producto tractor"     value="Tarjeta de Crédito"        text="+$1,559 en ticket · Significativo ★"       tone="positive" />
      </div>

      {/* Scatter full width */}
      <ChartCard
        title="Penetración vs. Frecuencia Transaccional"
        question="¿Cuántas transacciones adicionales genera cada producto nuevo que adopta un cliente?"
        tag="Correlación"
      >
        <ScatterPenetration />
      </ChartCard>

      {/* Row 2: histogram + ticket impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Distribución de Productos por Cliente"
          question="¿Cuántos productos tiene típicamente cada cliente?"
          tag="Penetración"
        >
          <PenetrationHistogram />
        </ChartCard>
        <ChartCard
          title="Impacto en Ticket por Producto"
          question="¿Qué productos elevan el ticket promedio? (Mann-Whitney U)"
          tag="Ticket Uplift"
        >
          <TicketImpactBar />
        </ChartCard>
      </div>

      {/* Interpretation callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="glass-card-accent p-5 border border-emerald-400/15">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">✓ Tarjeta de Crédito</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Único producto con incremento de ticket <strong>estadísticamente significativo</strong>
            (+$1,559, p=0.001). Clientes que lo tienen generan en promedio $3,348 por transacción
            vs. $1,788 quienes no lo tienen.
          </p>
        </div>
        <div className="glass-card-accent p-5 border border-rose-400/15">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2">⚠ Cuenta de Ahorros</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Reduce el ticket promedio de forma significativa (-$803, p=0.046). No es una señal
            negativa per se — puede reflejar un perfil conservador con mayor frecuencia de
            transacciones pequeñas.
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">← Exploración Comercial</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm">
          Continuar → Inteligencia de Cross-sell
        </button>
      </div>
    </motion.section>
  )
}
