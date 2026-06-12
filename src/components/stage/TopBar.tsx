import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { chapters } from '../../chapters'
import { profile } from '../../data/profile'
import { scrollToId } from '../../hooks/useLenis'

const EASE = [0.22, 1, 0.36, 1] as const

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

/**
 * Brand + desktop anchor nav + mobile menu. Slides away while scrolling down
 * and returns the moment the visitor scrolls up — content stays unobstructed.
 */
export function TopBar({ index }: { index: number }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    // Never hide near the top, while the menu is open, or when scrolling up.
    setHidden(y > prev && y > 160 && !open)
  })

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40"
      animate={{ y: hidden ? '-110%' : '0%' }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <div className="bg-gradient-to-b from-bg/85 to-transparent pb-3 backdrop-blur-[2px]">
        <div className="mx-auto flex min-h-[64px] w-[min(1120px,calc(100%-2.5rem))] items-center justify-between">
          <button
            onClick={() => scrollToId('home')}
            data-cursor="grow"
            className="cursor-pointer font-serif text-lg font-semibold tracking-tight"
          >
            <span className="text-moss">Francis</span> Garcia
          </button>

          <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => scrollToId(c.id)}
                aria-current={i === index ? 'true' : undefined}
                data-cursor="grow"
                className={`cursor-pointer font-grotesk text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
                  i === index ? 'text-bone' : 'text-muted hover:text-bone'
                }`}
              >
                {c.label}
              </button>
            ))}
            <a
              href={profile.links.resume}
              data-cursor="grow"
              className="cursor-pointer border border-border px-4 py-1.5 font-grotesk text-xs uppercase tracking-[0.18em] text-bone/85 transition-colors duration-200 hover:border-moss hover:text-moss"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            >
              Résumé
            </a>
          </nav>

          <button
            className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-bone/80 transition-colors hover:text-bone md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              key="mobile-nav"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: EASE }}
              aria-label="Sections"
              className="mx-auto w-[min(1120px,calc(100%-2.5rem))] md:hidden"
            >
              <ul className="flex flex-col gap-1 rounded-2xl border border-border bg-surface/95 p-2 backdrop-blur-md">
                {chapters.map((c, i) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        scrollToId(c.id)
                        setOpen(false)
                      }}
                      aria-current={i === index ? 'true' : undefined}
                      className={`flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl px-4 text-sm transition-colors duration-150 ${
                        i === index
                          ? 'bg-white/5 text-bone'
                          : 'text-muted hover:bg-white/[0.03] hover:text-bone active:bg-white/[0.06]'
                      }`}
                    >
                      <span className="tabular-nums text-xs font-medium" style={{ color: c.accent }}>
                        0{i + 1}
                      </span>
                      {c.label}
                      {i === index && (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
                      )}
                    </button>
                  </li>
                ))}
                <li>
                  <a
                    href={profile.links.resume}
                    className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl px-4 text-sm text-muted transition-colors duration-150 hover:bg-white/[0.03] hover:text-bone"
                  >
                    <span className="text-xs font-medium text-moss">↗</span>
                    Résumé
                  </a>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
