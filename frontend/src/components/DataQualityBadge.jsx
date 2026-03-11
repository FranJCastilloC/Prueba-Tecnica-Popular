export default function DataQualityBadge({ label, pass, detail }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {/* Icon */}
      <span className={`mt-0.5 flex-shrink-0 text-base ${pass ? 'badge-pass' : 'badge-fail'}`}>
        {pass ? '✓' : '✗'}
      </span>
      {/* Content */}
      <div>
        <p className={`text-sm font-medium ${pass ? 'text-slate-100' : 'text-rose-300'}`}>
          {label}
        </p>
        {detail && (
          <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
        )}
      </div>
    </div>
  )
}
