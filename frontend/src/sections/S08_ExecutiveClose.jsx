import { motion } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import { REGRESSION, HIGHLIGHTS } from '../data/kpis'
import { fmtUSD, fmtPct } from '../utils/formatters'

const FINDINGS = [
  {
    n: '01',
    title: '29 clientes = 80% del negocio',
    body: 'Alta concentración de valor. Riesgo y oportunidad simultáneos. Proteger los top clientes mientras se expande la base media.',
    tone: 'amber',
    icon: '📊',
  },
  {
    n: '02',
    title: 'Tarjeta de Crédito es el producto tractor',
    body: 'Único producto con incremento de ticket estadísticamente significativo (+$1,559, p=0.001). Debe liderar cualquier estrategia de cross-sell.',
    tone: 'cyan',
    icon: '💳',
  },
  {
    n: '03',
    title: 'Frecuencia antes que ticket',
    body: `Cada transacción adicional vale $${REGRESSION.coef_txn.toLocaleString()} en volumen (R²=0.96). La palanca principal es la actividad, no el monto unitario.`,
    tone: 'emerald',
    icon: '📈',
  },
  {
    n: '04',
    title: '35 clientes elegibles para cross-sell',
    body: 'Escenario base: +$44,688 (+12.42%) sin adquirir nuevos clientes. Escenario agresivo: +$99,688 (+27.70%). Potencial real y cuantificado.',
    tone: 'violet',
    icon: '🎯',
  },
]

const NEXT_STEPS = [
  {
    paso: '01',
    title: 'Activar los 35 elegibles',
    body: 'Oferta dirigida de Tarjeta de Crédito como producto de entrada. Priorizar los 10 con mayor score de potencial.',
    urgency: 'Alta prioridad',
    color: '#22d3ee',
  },
  {
    paso: '02',
    title: 'Programa de frecuencia',
    body: 'Clientes DORMIDO CON POTENCIAL (21): alto ticket, baja actividad. Activación con incentivos transaccionales.',
    urgency: 'Prioridad media',
    color: '#fbbf24',
  },
  {
    paso: '03',
    title: 'KPI predictor: # transacciones',
    body: `Monitorear mensualmente n_transacciones como señal adelantada. R²=0.96 confirma que es el mejor predictor de volumen.`,
    urgency: 'Monitoreo continuo',
    color: '#34d399',
  },
]

const TONE_BORDER = {
  cyan:    'border-cyan-400/30',
  emerald: 'border-emerald-400/30',
  amber:   'border-amber-400/30',
  violet:  'border-violet-400/30',
  rose:    'border-rose-400/30',
}

const TONE_TEXT = {
  cyan:    'text-cyan-400',
  emerald: 'text-emerald-400',
  amber:   'text-amber-400',
  violet:  'text-violet-400',
}

export default function S08_ExecutiveClose({ onPrev, isLast }) {
  return (
    <motion.section className="flex flex-col gap-10">
      <ChapterHeader
        eyebrow="Capítulo 07 — Síntesis"
        title="Conclusiones Ejecutivas"
        description="El análisis partió de datos limpios y terminó en una simulación con impacto cuantificado. Estos son los hallazgos que importan."
        storyLabel="Resumen ejecutivo en 40 segundos"
        storyText="Datos limpios → Negocio mapeado → Palancas identificadas → Impacto simulado"
        storyDetail="Una estrategia dirigida puede generar entre +$12K y +$100K en volumen incremental sobre la base actual de $1.59M"
      />

      {/* 4 findings */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Hallazgos principales
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FINDINGS.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card border ${TONE_BORDER[f.tone]} p-5`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold ${TONE_TEXT[f.tone]}`}>{f.n}</span>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Priority spotlight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="glass-card-accent p-5 border border-emerald-400/20">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            Segmento prioritario
          </p>
          <p className="text-2xl font-bold text-white">PYME</p>
          <p className="text-xs text-slate-400 mt-1">37.82% del volumen · Segmento con mayor potencial de cross-sell identificado</p>
        </div>
        <div className="glass-card-accent p-5 border border-cyan-400/20">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Producto tractor
          </p>
          <p className="text-2xl font-bold text-white">Tarjeta de Crédito</p>
          <p className="text-xs text-slate-400 mt-1">+$1,559 uplift de ticket · p=0.001 · Recomendado en 74% de los casos elegibles</p>
        </div>
        <div className="glass-card-accent p-5 border border-amber-400/20">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            Mercado más valioso
          </p>
          <p className="text-2xl font-bold text-white">Argentina</p>
          <p className="text-xs text-slate-400 mt-1">{fmtUSD(451939)} · 23 clientes · Ticket $3,373 · Líder por volumen USD</p>
        </div>
      </motion.div>

      {/* Next steps */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Próximos pasos recomendados
        </p>
        <div className="flex flex-col gap-3">
          {NEXT_STEPS.map((step, i) => (
            <motion.div
              key={step.paso}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="glass-card p-4 flex items-start gap-4"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-900"
                style={{ background: step.color }}
              >
                {step.paso}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-slate-900"
                    style={{ background: step.color + '44', color: step.color }}
                  >
                    {step.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card-accent p-6 text-center border border-cyan-400/10"
      >
        <p className="text-slate-400 text-sm italic leading-relaxed max-w-2xl mx-auto">
          "La simulación demuestra que una estrategia de cross-sell dirigida puede convertirse
          en una palanca concreta de crecimiento, especialmente si se enfoca en clientes
          subpenetrados y en productos con impacto probado en ticket y frecuencia."
        </p>
        <p className="text-xs text-slate-600 mt-3">— Conclusión del análisis estratégico</p>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-start pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
          ← Volver a Simulación
        </button>
      </div>
    </motion.section>
  )
}
