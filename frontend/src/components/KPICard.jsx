import { motion } from 'framer-motion'

const TONE_CLASSES = {
  cyan:    { border: 'kpi-cyan',    text: 'text-cyan-400',    bg: 'bg-cyan-400/8' },
  emerald: { border: 'kpi-emerald', text: 'text-emerald-400', bg: 'bg-emerald-400/8' },
  amber:   { border: 'kpi-amber',   text: 'text-amber-400',   bg: 'bg-amber-400/8' },
  rose:    { border: 'kpi-rose',    text: 'text-rose-400',    bg: 'bg-rose-400/8' },
  slate:   { border: 'kpi-slate',   text: 'text-slate-400',   bg: 'bg-slate-400/8' },
  violet:  { border: 'kpi-violet',  text: 'text-violet-400',  bg: 'bg-violet-400/8' },
}

export default function KPICard({ value, label, note, tone = 'cyan', icon, delay = 0 }) {
  const cls = TONE_CLASSES[tone] || TONE_CLASSES.cyan

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card ${cls.border} p-5 flex flex-col gap-1`}
    >
      {icon && (
        <span className={`text-xl mb-1 ${cls.text}`}>{icon}</span>
      )}
      <span className={`num text-3xl font-bold text-white leading-none`}>
        {value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
        {label}
      </span>
      {note && (
        <span className="text-xs text-slate-500 mt-1 leading-snug">{note}</span>
      )}
    </motion.div>
  )
}
