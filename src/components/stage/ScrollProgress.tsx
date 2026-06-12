import { motion, useScroll, useSpring } from 'framer-motion'

/** Hairline page-progress indicator pinned to the top edge. */
export function ScrollProgress({ accent }: { accent: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left"
      style={{
        scaleX,
        background: `linear-gradient(90deg, ${accent}, var(--color-clay))`,
      }}
    />
  )
}
