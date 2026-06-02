import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const BASE =
  'rounded-[var(--radius-card)] border border-border bg-surface/70 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-moss/50'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()

  if (reduce) return <article className={`${BASE} ${className}`}>{children}</article>

  return (
    <motion.article
      className={`${BASE} ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.article>
  )
}
