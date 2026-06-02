import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useInteractive } from '../../hooks/useMediaQuery'

/**
 * Element that drifts toward the pointer while hovered, then springs back.
 * Renders an anchor when `href` is given, otherwise a button (`onClick`).
 * Inert on touch / reduced-motion devices.
 */
export function MagneticButton({
  href,
  onClick,
  children,
  className = '',
  external = false,
  strength = 0.4,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  external?: boolean
  strength?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const interactive = useInteractive()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

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
    style: { x: sx, y: sy },
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
