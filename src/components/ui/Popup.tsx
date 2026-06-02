import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Centered modal: fades a backdrop, springs in a panel, locks body scroll,
 * freezes chapter navigation, and closes on Escape / backdrop / ✕.
 * Wrap usage in <AnimatePresence> for exit animation.
 */
export function Popup({
  onClose,
  accent = '#9caa7b',
  children,
}: {
  onClose: () => void
  accent?: string
  children: ReactNode
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.navLocked = '1'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      delete document.body.dataset.navLocked
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <motion.div
        className="absolute inset-0 bg-bg/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8"
        style={{ ['--card-accent' as string]: accent } as React.CSSProperties}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          data-cursor="grow"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-bg/60 text-bone transition-colors hover:border-[color:var(--card-accent)]"
        >
          ✕
        </button>
        {children}
      </motion.div>
    </div>
  )
}
