import { motion } from 'framer-motion'
import ChapterHeader from '../components/ChapterHeader'
import DataQualityBadge from '../components/DataQualityBadge'
import { DATA_QUALITY } from '../data/quality'

export default function S02_DataQuality({ onNext, onPrev }) {
  const { datasets, summary } = DATA_QUALITY

  return (
    <motion.section className="flex flex-col gap-8">
      <ChapterHeader
        eyebrow="Capítulo 01 — Fundamentos"
        title="Auditoría de Calidad de Datos"
        description="Antes de analizar, validamos. Cada campo, cada relación, cada rango fue revisado para garantizar que los hallazgos posteriores sean confiables."
        storyLabel="Resultado de la auditoría"
        storyText={`${summary.total_checks} de ${summary.total_checks} validaciones superadas`}
        storyDetail={summary.verdict}
      />

      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card border border-emerald-400/20 p-5 flex items-center gap-4"
      >
        <span className="text-3xl">✓</span>
        <div>
          <p className="text-emerald-400 font-bold text-lg">
            {summary.overall_score}% · 0 errores encontrados
          </p>
          <p className="text-slate-400 text-sm mt-0.5">
            Base de datos íntegra · Lista para análisis · Sin imputaciones ni supuestos
          </p>
        </div>
      </motion.div>

      {/* Dataset cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {datasets.map((ds, i) => (
          <motion.div
            key={ds.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="glass-card p-5"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-700">
              <span className="text-2xl">{ds.icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{ds.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ds.description}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-slate-400">
                    <span className="text-white font-bold">{ds.rows.toLocaleString()}</span> filas
                  </span>
                  <span className="text-xs text-slate-400">
                    <span className="text-white font-bold">{ds.columns}</span> columnas
                  </span>
                </div>
              </div>
            </div>

            {/* Checks */}
            <div className="divide-y divide-slate-800">
              {ds.checks.map((check) => (
                <DataQualityBadge
                  key={check.label}
                  label={check.label}
                  pass={check.pass}
                  detail={check.detail}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Why it matters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card-accent p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
          Por qué importa
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          La integridad de los datos es la base de cualquier análisis confiable.
          Sin nulos, sin duplicados y con relaciones íntegras entre los tres datasets,
          podemos estar seguros de que los hallazgos reflejan la realidad del negocio —
          no artefactos de datos sucios.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { icon: '🚫', label: 'Sin nulos',               detail: 'En ninguno de los 3 datasets' },
            { icon: '🔗', label: 'Integridad referencial',  detail: 'Todos los IDs cruzados son válidos' },
            { icon: '✓',  label: 'Conversión de monedas',   detail: 'USD, EUR, COP → USD normalizado' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1 text-center">
              <span className="text-xl">{item.icon}</span>
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
          ← Anterior
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-cyan-400 text-slate-900 font-bold rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer text-sm"
        >
          Continuar → Panorama del negocio
        </button>
      </div>
    </motion.section>
  )
}
