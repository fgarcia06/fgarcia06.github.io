import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Grain, CornerTicks } from './Texture'
import { getLenis } from '../../hooks/useLenis'

const SIZES = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' } as const

/**
 * Accessible, self-contained dialog. Portals to <body> so it escapes the
 * transformed/clipping chapter Stage and genuinely covers the viewport, then
 * makes the rest of the app `inert` — background can't be scrolled, clicked,
 * tabbed into, or read by assistive tech. Focus is trapped inside and restored
 * to the trigger on close. Render inside <AnimatePresence> for exit animation.
 *
 * The panel carries the site's "field-notes" signature: a top accent hairline,
 * corner registration ticks, and film grain — no gradients.
 */
export function Modal({
  onClose,
  accent = '#6c8cff',
  ariaLabel,
  size = 'lg',
  children,
}: {
  onClose: () => void
  accent?: string
  ariaLabel: string
  size?: keyof typeof SIZES
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.getElementById('root')
    const prevFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    document.body.dataset.navLocked = '1'
    getLenis()?.stop()
    root?.setAttribute('inert', '')
    root?.setAttribute('aria-hidden', 'true')

    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)
      if (focusable.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey && (activeEl === first || activeEl === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prevOverflow
      delete document.body.dataset.navLocked
      getLenis()?.start()
      root?.removeAttribute('inert')
      root?.removeAttribute('aria-hidden')
      prevFocused?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <motion.div
        className="absolute inset-0 bg-bg/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[90dvh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface outline-none`}
        style={{ ['--card-accent' as string]: accent } as React.CSSProperties}
        initial={{ opacity: 0, y: 16, scale: 0.97, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 16, scale: 0.97, filter: 'blur(6px)' }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* field-notes signature */}
        <span aria-hidden className="absolute inset-x-0 top-0 z-20 h-[2px]" style={{ backgroundColor: accent }} />
        <CornerTicks color={`${accent}99`} length={16} margin={10} className="z-20" />
        <Grain opacity={0.07} className="z-20" />

        <button
          onClick={onClose}
          aria-label="Close dialog"
          data-cursor="grow"
          className="absolute right-3 top-3 z-30 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-border bg-bg/60 text-bone backdrop-blur transition-colors hover:border-[color:var(--card-accent)] hover:text-[color:var(--card-accent)] sm:right-4 sm:top-4 sm:h-10 sm:w-10"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="relative z-10 overflow-y-auto">{children}</div>
      </motion.div>
    </div>,
    document.body,
  )
}
