const TONE_TEXT = {
  positive: 'text-emerald-400',
  neutral:  'text-cyan-400',
  warning:  'text-amber-400',
  danger:   'text-rose-400',
}

export default function InsightCard({ label, value, text, tone = 'neutral' }) {
  const textColor = TONE_TEXT[tone] || TONE_TEXT.neutral
  return (
    <div className="glass-card p-4 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
      <p className={`font-bold text-lg num leading-tight ${textColor}`}>{value}</p>
      {text && <p className="text-xs text-slate-400 leading-snug">{text}</p>}
    </div>
  )
}
