import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * First-load curtain: a bold name reveal that lifts away after a beat.
 * Skipped entirely under reduced motion.
 */
export function Intro() {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(!reduce)

  useEffect(() => {
    if (reduce) return
    const t = setTimeout(() => setShow(false), 1700)
    return () => clearTimeout(t)
  }, [reduce])

  if (reduce) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-bg"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="overflow-hidden px-6">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="font-serif text-[clamp(2.5rem,9vw,7rem)] font-bold tracking-[-0.03em] text-bone"
            >
              Francis Garcia
            </motion.h1>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-10 font-grotesk text-xs uppercase tracking-[0.3em] text-moss"
          >
            Robotics · Software · ML
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
