import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { useMouseParallax } from '../../hooks/useMouseParallax'

/**
 * Oversized, faint chapter word behind the content (exaggerated-minimalism).
 * Drifts on a deeper parallax plane than the page content, amplifying depth.
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
  const { x: mouseX, y: mouseY } = useMouseParallax()
  const parallaxX = useTransform(mouseX, (v) => v * -24)
  const parallaxY = useTransform(mouseY, (v) => v * -16)

  return (
    <motion.span
      aria-hidden
      initial={reduce ? false : { opacity: 0, scale: 1.06, filter: 'blur(18px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute -z-10 select-none font-serif font-bold uppercase leading-none tracking-[-0.04em] text-bone/[0.035] ${className}`}
      style={{
        fontSize: 'clamp(6rem, 26vw, 24rem)',
        x: parallaxX,
        y: parallaxY,
      }}
    >
      {text}
    </motion.span>
  )
}
