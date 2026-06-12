import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

/**
 * Scroll-linked depth plane. While its slot crosses the viewport the content
 * translates against the scroll direction — positive `speed` lags behind
 * (background planes), negative `speed` overtakes (foreground planes).
 * `speed` is roughly "viewport-relative drift": 0.5 → ±60px over the pass.
 */
export function Parallax({
  children,
  speed = 0.5,
  className = '',
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 120, speed * -120])

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  )
}

/**
 * Fade + rise reveal tied to scroll position rather than time — content
 * settles into place as it approaches the middle of the viewport, the way
 * kenta-style sites breathe in while you scroll.
 */
export function ScrollReveal({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'start 55%'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [48, 0])

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { opacity, y }}>
      {children}
    </motion.div>
  )
}
