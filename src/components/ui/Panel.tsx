import type { ReactNode } from 'react'

/** Static glass card. Entrance animation is handled by the parent <Item>. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={`rounded-[var(--radius-card)] border border-border bg-surface/70 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-moss/50 ${className}`}
    >
      {children}
    </article>
  )
}
