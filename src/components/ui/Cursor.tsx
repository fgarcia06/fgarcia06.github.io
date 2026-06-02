import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useInteractive } from '../../hooks/useMediaQuery'

/**
 * Soft trailing cursor with a moss ring that grows over interactive elements
 * (links, buttons, anything with [data-cursor]). Desktop + motion-on only;
 * the OS cursor is hidden globally via CSS while this is active.
 */
export function Cursor() {
  const interactive = useInteractive()
  const [grow, setGrow] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 })

  useEffect(() => {
    if (!interactive) return
    document.documentElement.classList.add('has-custom-cursor')

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const el = (e.target as HTMLElement).closest(
        'a, button, [data-cursor], [role="button"]',
      )
      setGrow(Boolean(el))
    }
    const leave = () => setVisible(false)

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerout', leave)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerout', leave)
    }
  }, [interactive, x, y])

  if (!interactive) return null

  return (
    <>
      {/* Precise dot — follows instantly. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      />
      {/* Trailing ring — springs, grows on interactive targets. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] -translate-x-1/2 -translate-y-1/2 rounded-full border border-moss/70"
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
        animate={{
          width: grow ? 56 : 30,
          height: grow ? 56 : 30,
          backgroundColor: grow ? 'rgba(156,170,123,0.14)' : 'rgba(156,170,123,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
    </>
  )
}
