import { motion, useReducedMotion } from 'framer-motion'

/**
 * Oversized, faint chapter word that fills negative space behind the content
 * (exaggerated-minimalism). Decorative only — hidden from assistive tech.
 */
export function GhostLabel({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      aria-hidden
      initial={reduce ? false : { opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute -z-10 select-none font-serif font-bold uppercase leading-none tracking-[-0.04em] text-bone/[0.035] ${className}`}
      style={{ fontSize: 'clamp(6rem, 26vw, 24rem)' }}
    >
      {text}
    </motion.span>
  )
}
