import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'
import { useHasFinePointer, usePrefersReducedMotion } from './useMediaQuery'

/**
 * Returns spring-animated normalised mouse coordinates (−1 … 1 on each axis).
 * Multiply by a depth factor to produce parallax offsets for layered elements.
 * Inactive on touch devices and under prefers-reduced-motion.
 */
export function useMouseParallax() {
  const fine = useHasFinePointer()
  const reduce = usePrefersReducedMotion()
  const active = fine && !reduce

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 55, damping: 16, mass: 0.9 })
  const y = useSpring(rawY, { stiffness: 55, damping: 16, mass: 0.9 })

  useEffect(() => {
    if (!active) return
    const handle = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2)
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [active, rawX, rawY])

  return { x, y }
}
