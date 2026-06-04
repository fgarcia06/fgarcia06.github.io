import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

const motionVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir >= 0 ? 48 : -48, filter: 'blur(6px)' }),
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({ opacity: 0, y: dir >= 0 ? -48 : 48, filter: 'blur(6px)' }),
}

const reducedVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * A single full-viewport chapter. Animates in/out with a directional
 * rise + blur dissolve while the persistent 3D backdrop continues behind it.
 * The inner element is the scroll container the nav hook watches for edges.
 */
export function Stage({ direction, children }: { direction: number; children: ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <motion.section
      data-stage-scroll
      custom={direction}
      variants={reduce ? reducedVariants : motionVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: reduce ? 0.25 : 0.5, ease: EASE }}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain"
    >
      <div className="flex min-h-full items-center">
        <div className="mx-auto w-[min(1120px,calc(100%-2.5rem))] py-28">{children}</div>
      </div>
    </motion.section>
  )
}
