const ACTIVE_CLASSES = {
  cyan:    'pill-active-cyan',
  emerald: 'pill-active-emerald',
  amber:   'pill-active-amber',
}

export default function ScenarioSelector({ scenarios, selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {scenarios.map((s) => {
        const isActive = s.key === selected
        const activeClass = isActive ? ACTIVE_CLASSES[s.colorClass] : 'pill-inactive'
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${activeClass}`}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
