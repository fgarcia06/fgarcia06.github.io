import { motion } from 'framer-motion'
import { chapters } from '../../chapters'

/** Bottom-left chapter index + prev/next affordance, with a navigation hint. */
export function ChapterCounter({
  index,
  onPrev,
  onNext,
}: {
  index: number
  onPrev: () => void
  onNext: () => void
}) {
  const accent = chapters[index].accent
  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-4">
      <div className="flex items-baseline gap-1 font-serif tabular-nums">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl"
          style={{ color: accent }}
        >
          0{index + 1}
        </motion.span>
        <span className="text-sm text-muted">/ 0{chapters.length}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={index === 0}
          aria-label="Previous chapter"
          data-cursor="grow"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-border text-bone transition-colors hover:border-moss disabled:cursor-default disabled:opacity-30 sm:h-9 sm:w-9"
        >
          ↑
        </button>
        <button
          onClick={onNext}
          disabled={index === chapters.length - 1}
          aria-label="Next chapter"
          data-cursor="grow"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-border text-bone transition-colors hover:border-moss disabled:cursor-default disabled:opacity-30 sm:h-9 sm:w-9"
        >
          ↓
        </button>
      </div>

      <span className="hidden text-xs text-muted/70 lg:block">Scroll, swipe, or use arrow keys</span>
    </div>
  )
}
