import { motion } from 'framer-motion'
import KPICard from '../components/KPICard'
import { useData } from '../providers/DataProvider'
import { fmtUSD, fmtNum } from '../utils/formatters'

const DATASETS = [
  { label: '500', desc: 'transacciones', icon: '🔄' },
  { label: '100', desc: 'clientes',      icon: '👥' },
  { label: '10',  desc: 'productos',     icon: '📦' },
  { label: '4',   desc: 'países',        icon: '🌎' },
  { label: '17',  desc: 'meses',         icon: '📅' },
]

export default function S01_Landing({ onNext }) {
  const data = useData()
  const KPIs = data.kpis.KPIs

  const KPI_CARDS = [
    { value: fmtUSD(KPIs.volumen_total),    label: 'Volumen Total',       note: 'Convertido a USD',                         tone: 'cyan',    delay: 0.05 },
    { value: fmtNum(KPIs.n_transacciones),  label: 'Transacciones',       note: '2023 – 2024',                              tone: 'emerald', delay: 0.10 },
    { value: fmtNum(KPIs.n_clientes),       label: 'Clientes Activos',    note: 'Chile · Argentina · México · Colombia',    tone: 'amber',   delay: 0.15 },
    { value: fmtNum(KPIs.n_produs),         label: 'Productos',           note: '4 tipos de producto',                      tone: 'violet',  delay: 0.20 },
    { value: fmtUSD(KPIs.ticket_promedio, true), label: 'Ticket Promedio', note: 'Por transacción en USD',                  tone: 'rose',    delay: 0.25 },
  ]

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-10"
    >
      {/* Hero */}
      <div className="relative pt-6">
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none -translate-x-1/4 -translate-y-1/4" />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3"
        >
          Prueba Técnica · Análisis de Datos Financieros
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-3xl"
        >
          De los datos al negocio:<br />
          <span className="text-cyan-400">inteligencia de cross-sell</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-6"
        >
          Análisis completo sobre tres datasets financieros: desde la auditoría de calidad
          hasta la simulación estratégica de cross-sell con escenarios de impacto comercial.
        </motion.p>

        {/* Dataset badges */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {DATASETS.map((d) => (
            <span
              key={d.desc}
              className="glass-card px-3 py-1.5 text-sm text-slate-300 flex items-center gap-1.5"
            >
              <span>{d.icon}</span>
              <span className="font-bold text-white">{d.label}</span>
              <span className="text-slate-500">{d.desc}</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Objetivo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card-accent p-6 max-w-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
          Objetivo del análisis
        </p>
        <p className="text-slate-300 leading-relaxed">
          Identificar palancas de crecimiento mediante el análisis de concentración,
          comportamiento transaccional y cross-sell inteligente. El resultado final es una
          simulación de impacto que cuantifica el upside de una estrategia comercial dirigida.
        </p>
      </motion.div>

      {/* KPI cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Principales métricas del portafolio
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {KPI_CARDS.map((k) => (
            <KPICard key={k.label} {...k} />
          ))}
        </div>
      </div>

      {/* Story timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
          Recorrido del análisis
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: '01', title: 'Calidad de datos', desc: 'Auditoría completa de los 3 datasets' },
            { n: '02', title: 'Exploración de negocio', desc: 'Segmentos, países, productos, concentración' },
            { n: '03', title: 'Penetración y comportamiento', desc: 'Correlación productos × frecuencia' },
            { n: '04', title: 'Simulación cross-sell', desc: '3 escenarios de impacto comercial' },
          ].map((step) => (
            <div key={step.n} className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-cyan-400">{step.n}</span>
              <p className="text-sm font-semibold text-white">{step.title}</p>
              <p className="text-xs text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onNext}
          className="px-8 py-3 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm"
        >
          Comenzar Análisis →
        </button>
      </motion.div>
    </motion.section>
  )
}
