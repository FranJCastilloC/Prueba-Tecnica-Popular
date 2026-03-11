import { motion } from 'framer-motion'

export default function ChapterHeader({ eyebrow, title, description, storyLabel, storyText, storyDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Left: text */}
        <div className="flex-1">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 text-base leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>

        {/* Right: story card (only if storyLabel provided) */}
        {storyLabel && (
          <div className="md:w-72 glass-card-accent p-5 flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
              {storyLabel}
            </p>
            {storyText && (
              <p className="text-white font-semibold text-sm leading-snug mb-1">
                {storyText}
              </p>
            )}
            {storyDetail && (
              <p className="text-slate-400 text-xs leading-relaxed">
                {storyDetail}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
