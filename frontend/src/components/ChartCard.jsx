export default function ChartCard({ title, question, tag, children, className = '' }) {
  return (
    <div className={`glass-card p-5 flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {question && (
            <p className="text-xs text-slate-500 italic mt-0.5">{question}</p>
          )}
        </div>
        {tag && (
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {tag}
          </span>
        )}
      </div>
      {/* Chart slot */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
