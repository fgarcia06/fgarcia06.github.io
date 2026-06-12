import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useInteractive } from '../../hooks/useMediaQuery'
import { CHAMFER } from './HudDecor'

/**
 * Element that drifts toward the pointer while hovered, then springs back.
 * Renders an anchor when `href` is given, otherwise a button (`onClick`).
 * `chamfer` applies the HUD corner cut. Inert on touch / reduced-motion.
 */
export function MagneticButton({
  href,
  onClick,
  children,
  className = '',
  external = false,
  strength = 0.4,
  chamfer = false,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  external?: boolean
  strength?: number
  chamfer?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const interactive = useInteractive()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 380, damping: 20, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 380, damping: 20, mass: 0.3 })

  function onMove(e: React.MouseEvent) {
    if (!interactive || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function reset() {
    x.set(0)
    y.set(0)
  }

  const common = {
    onMouseMove: onMove,
    onMouseLeave: reset,
    style: { x: sx, y: sy, ...(chamfer ? { clipPath: CHAMFER } : {}) },
    'data-cursor': 'grow',
    className: `cursor-pointer ${className}`,
  } as const

  if (href) {
    const extra = external ? { target: '_blank', rel: 'noreferrer' } : {}
    return (
      <motion.a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} {...common} {...extra}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick} {...common}>
      {children}
    </motion.button>
  )
}
