import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navigation from './components/Navigation'
import { DataProvider, useData } from './providers/DataProvider'

// Sections
import S01_Landing              from './sections/S01_Landing'
import S02_DataQuality          from './sections/S02_DataQuality'
import S03_BusinessOverview     from './sections/S03_BusinessOverview'
import S04_CommercialExploration from './sections/S04_CommercialExploration'
import S05_PenetrationBehavior  from './sections/S05_PenetrationBehavior'
import S06_CrossSellIntelligence from './sections/S06_CrossSellIntelligence'
import S07_StrategicSimulation  from './sections/S07_StrategicSimulation'
import S08_ExecutiveClose       from './sections/S08_ExecutiveClose'

const CHAPTERS = [
  { id: 0, label: 'Bienvenida',           component: S01_Landing },
  { id: 1, label: 'Calidad de Datos',     component: S02_DataQuality },
  { id: 2, label: 'Panorama General',     component: S03_BusinessOverview },
  { id: 3, label: 'Exploración Comercial',component: S04_CommercialExploration },
  { id: 4, label: 'Penetración',          component: S05_PenetrationBehavior },
  { id: 5, label: 'Cross-sell',           component: S06_CrossSellIntelligence },
  { id: 6, label: 'Simulación',           component: S07_StrategicSimulation },
  { id: 7, label: 'Conclusiones',         component: S08_ExecutiveClose },
]

const SECTION_VARIANTS = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

function AppContent() {
  const data = useData()
  const [currentChapter, setCurrentChapter] = useState(0)

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="text-cyan-400 text-sm animate-pulse mb-2">Cargando análisis…</div>
          <div className="text-slate-600 text-xs">Ejecutando modelo Python</div>
        </div>
      </div>
    )
  }

  const { component: ActiveSection } = CHAPTERS[currentChapter]

  const navigate = (index) => {
    const clamped = Math.max(0, Math.min(CHAPTERS.length - 1, index))
    setCurrentChapter(clamped)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navigation
        chapters={CHAPTERS}
        currentChapter={currentChapter}
        onNavigate={navigate}
      />

      <main className="flex-1 ml-14 md:ml-56 min-h-screen overflow-x-hidden pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            variants={SECTION_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="min-h-screen px-4 py-8 md:px-8 md:py-10 max-w-7xl mx-auto"
          >
            <ActiveSection
              onNext={() => navigate(currentChapter + 1)}
              onPrev={() => navigate(currentChapter - 1)}
              isFirst={currentChapter === 0}
              isLast={currentChapter === CHAPTERS.length - 1}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  )
}
