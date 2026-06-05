import { useEffect } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useHasFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

/**
 * A soft radial-gradient "spotlight" that lazily follows the cursor.
 * Sits at z-[1] just above the 3D backdrop and shifts with the chapter accent.
 */
export function SpotlightOverlay({ accent }: { accent: string }) {
  const fine = useHasFinePointer()
  const reduce = usePrefersReducedMotion()
  const active = fine && !reduce

  const rawX = useMotionValue(50)
  const rawY = useMotionValue(50)
  const x = useSpring(rawX, { stiffness: 40, damping: 22 })
  const y = useSpring(rawY, { stiffness: 40, damping: 22 })

  useEffect(() => {
    if (!active) return
    const handle = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 100)
      rawY.set((e.clientY / window.innerHeight) * 100)
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [active, rawX, rawY])

  const spotColor = `${accent}15`
  const bg = useMotionTemplate`radial-gradient(680px circle at ${x}% ${y}%, ${spotColor} 0%, transparent 68%)`

  if (!active) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ background: bg }}
    />
  )
}
