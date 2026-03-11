import { motion } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import InsightCard from '../components/InsightCard'
import ChartCard from '../components/ChartCard'
import CrossSellHeatmap from '../charts/CrossSellHeatmap'
import TopEligibleTable from '../charts/TopEligibleTable'
import TicketImpactBar from '../charts/TicketImpactBar'
import { CROSSSELL_SUMMARY } from '../data/crossSell'
import { fmtUSD, fmtPct } from '../utils/formatters'

export default function S06_CrossSellIntelligence({ onNext, onPrev }) {
  return (
    <motion.section className="flex flex-col gap-8">
      <ChapterHeader
        eyebrow="Capítulo 05 — Next-Best-Product"
        title="Inteligencia de Cross-sell"
        description="¿A quién conviene ofrecerle algo más? ¿Y qué producto recomendar? La probabilidad condicional entre productos da la respuesta."
        storyLabel="Recomendación principal"
        storyText={`Tarjeta de Crédito: top recomendación · ${CROSSSELL_SUMMARY.pct_recommend_tarjeta}% de los elegibles (13 de 35)`}
        storyDetail={`P(Tarjeta de Crédito | Préstamo) = 86.7% — la probabilidad condicional más alta de la matriz. ${CROSSSELL_SUMMARY.eligible_clients} clientes elegibles identificados.`}
      />

      {/* Insight strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InsightCard label="Clientes elegibles"       value={`${CROSSSELL_SUMMARY.eligible_clients}`}       text="Con ≤2 productos actuales"                         tone="neutral" />
        <InsightCard label="Mayor prob. condicional"  value="P(Tarjeta|Préstamo) = 86.7%"                   text="Señal más fuerte de la matriz de adopción"         tone="positive" />
        <InsightCard label="Ingreso potencial (Base)" value={fmtUSD(CROSSSELL_SUMMARY.ingreso_potencial_base)} text="Escenario base · 35 elegibles"                tone="positive" />
      </div>

      {/* Adoption matrix heatmap - full width */}
      <ChartCard
        title="Matriz de Adopción Condicional P(B|A)"
        question="¿Si un cliente ya tiene el producto A, qué probabilidad hay de que adopte el producto B?"
        tag="Probabilidad Condicional"
      >
        <CrossSellHeatmap />
      </ChartCard>

      {/* Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-accent p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
          Lectura de la matriz
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          La Tarjeta de Crédito tiene la probabilidad condicional de adopción más alta en todas las filas
          (≥70.0%). Esto confirma su rol de <strong>producto ancla</strong>: si un cliente todavía no la tiene,
          la probabilidad de adoptarla — independientemente de su cartera actual — supera el 70%.
        </p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { cond: 'Si tiene Préstamo',      rec: 'Tarjeta', prob: '86.7%' },
            { cond: 'Si tiene Cta. Corriente',rec: 'Tarjeta', prob: '85.1%' },
            { cond: 'Si tiene Cta. Ahorros',  rec: 'Tarjeta', prob: '84.8%' },
            { cond: 'Si tiene Tarjeta',       rec: 'Cta. Ahorros', prob: '71.2%' },
          ].map((r) => (
            <div key={r.cond} className="glass-card p-3">
              <p className="text-xs text-slate-500 mb-1">{r.cond}</p>
              <p className="text-sm font-bold text-white">→ {r.rec}</p>
              <p className="text-lg font-bold text-cyan-400">{r.prob}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Table + ticket impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Top Clientes Elegibles"
          question="¿Cuáles son los 10 clientes con mayor potencial de cross-sell?"
          tag="Accionable"
        >
          <TopEligibleTable />
        </ChartCard>
        <ChartCard
          title="Impacto en Ticket por Producto"
          question="Contexto: ¿qué producto realmente mueve el ticket?"
          tag="Fundamento"
        >
          <TicketImpactBar />
        </ChartCard>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">← Penetración y Comportamiento</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm">
          Continuar → Simulación Estratégica
        </button>
      </div>
    </motion.section>
  )
}
