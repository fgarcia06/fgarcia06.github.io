import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { chapters } from '../../chapters'
import { profile } from '../../data/profile'

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

/** Brand + résumé link, with a smooth-animated mobile chapter menu. */
export function TopBar({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex min-h-[64px] w-[min(1120px,calc(100%-2.5rem))] items-center justify-between">
        <button
          onClick={() => onSelect(0)}
          data-cursor="grow"
          className="cursor-pointer font-serif text-lg font-semibold tracking-wide"
        >
          <span className="text-moss">Francis</span> Garcia
        </button>

        <div className="flex items-center gap-4">
          <a
            href={profile.links.resume}
            data-cursor="grow"
            className="hidden cursor-pointer text-sm font-medium text-bone/80 transition-colors hover:text-moss sm:block"
          >
            Résumé
          </a>
          <button
            className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-bone/80 transition-colors hover:text-bone md:hidden"
            aria-label={open ? 'Close menu' : 'Open chapters'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
            aria-label="Chapters"
            className="mx-auto w-[min(1120px,calc(100%-2.5rem))] md:hidden"
          >
            <ul className="flex flex-col gap-1 rounded-2xl border border-border bg-surface/95 p-2 backdrop-blur-md">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelect(i)
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
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
