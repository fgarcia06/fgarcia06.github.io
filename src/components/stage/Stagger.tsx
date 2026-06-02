import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Container that staggers its <Item> children in each time a chapter mounts. */
export function Stagger({
  children,
  className,
  delay = 0.1,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

export function Item({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
