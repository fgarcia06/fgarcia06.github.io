import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Oversized, faint section word behind the content (exaggerated-minimalism).
 * Travels on the deepest parallax plane — it drifts upward slower than the
 * page while its section crosses the viewport, amplifying scroll depth.
 * Decorative only — hidden from assistive tech.
 */
export function GhostLabel({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [140, -140])
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0])

  return (
    <motion.span
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute -z-10 select-none font-serif font-bold uppercase leading-none tracking-[-0.04em] text-bone/[0.035] ${className}`}
      style={{
        fontSize: 'clamp(6rem, 26vw, 24rem)',
        ...(reduce ? {} : { y, opacity }),
      }}
    >
      {text}
    </motion.span>
  )
}
