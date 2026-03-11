import { useState } from 'react'
import { motion } from 'framer-motion'

const CHAPTER_COLORS = ['#22d3ee','#34d399','#fbbf24','#f472b6','#a78bfa','#22d3ee','#fbbf24','#34d399']

export default function Navigation({ chapters, currentChapter, onNavigate }) {
  const [hovered, setHovered] = useState(null)
  const progress = ((currentChapter + 1) / chapters.length) * 100

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-56 flex-col bg-slate-900/95 border-r border-slate-800 z-40 py-6 px-4">
        {/* Brand */}
        <div className="mb-8 px-2">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Prueba Popular</p>
          <p className="text-xs text-slate-500 mt-0.5">Análisis Financiero</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800 rounded-full mb-6 mx-2">
          <motion.div
            className="h-full bg-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Chapter list */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {chapters.map((ch, i) => {
            const isActive  = i === currentChapter
            const isVisited = i < currentChapter

            return (
              <button
                key={ch.id}
                onClick={() => onNavigate(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer
                  ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
              >
                {/* Dot */}
                <span
                  className="flex-shrink-0 w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    background: isActive || isVisited
                      ? CHAPTER_COLORS[i]
                      : 'transparent',
                    border: isActive || isVisited
                      ? 'none'
                      : `1.5px solid #475569`,
                    boxShadow: isActive ? `0 0 8px ${CHAPTER_COLORS[i]}66` : 'none',
                  }}
                />
                {/* Number */}
                <span
                  className="text-xs font-mono font-semibold flex-shrink-0"
                  style={{ color: isActive ? CHAPTER_COLORS[i] : '#475569' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Label */}
                <span
                  className={`text-xs font-medium leading-tight ${
                    isActive ? 'text-white' : isVisited ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {ch.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Prev / Next */}
        <div className="mt-6 flex items-center justify-between px-2">
          <button
            onClick={() => onNavigate(currentChapter - 1)}
            disabled={currentChapter === 0}
            className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="text-xs text-slate-600">
            {currentChapter + 1} / {chapters.length}
          </span>
          <button
            onClick={() => onNavigate(currentChapter + 1)}
            disabled={currentChapter === chapters.length - 1}
            className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Siguiente →
          </button>
        </div>
      </nav>

      {/* ── Collapsed sidebar (tablet: md-) ── */}
      <nav className="md:hidden fixed left-0 top-0 h-screen w-14 flex-col bg-slate-900/95 border-r border-slate-800 z-40 py-6 flex items-center gap-2">
        {chapters.map((ch, i) => {
          const isActive  = i === currentChapter
          const isVisited = i < currentChapter
          return (
            <button
              key={ch.id}
              onClick={() => onNavigate(i)}
              title={ch.label}
              className="w-6 h-6 flex items-center justify-center cursor-pointer"
            >
              <span
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: isActive || isVisited ? CHAPTER_COLORS[i] : 'transparent',
                  border: isActive || isVisited ? 'none' : '1.5px solid #475569',
                }}
              />
            </button>
          )
        })}
      </nav>

      {/* ── Mobile bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 z-40 flex items-center justify-between px-4 py-3 md:hidden">
        <button
          onClick={() => onNavigate(currentChapter - 1)}
          disabled={currentChapter === 0}
          className="text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer px-2"
        >
          ←
        </button>
        <div className="text-center">
          <p className="text-xs text-cyan-400 font-semibold">{chapters[currentChapter]?.label}</p>
          <p className="text-xs text-slate-600">{currentChapter + 1} / {chapters.length}</p>
        </div>
        <button
          onClick={() => onNavigate(currentChapter + 1)}
          disabled={currentChapter === chapters.length - 1}
          className="text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer px-2"
        >
          →
        </button>
      </div>
    </>
  )
}
