import { useState } from 'react'
import { chapters } from '../../chapters'
import { profile } from '../../data/profile'

/** Brand + résumé link, with a mobile chapter menu (the rail is desktop-only). */
export function TopBar({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex min-h-[68px] w-[min(1120px,calc(100%-2.5rem))] items-center justify-between">
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
            className="cursor-pointer text-2xl text-bone md:hidden"
            aria-label="Open chapters"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Chapters" className="mx-auto w-[min(1120px,calc(100%-2.5rem))] md:hidden">
          <ul className="flex flex-col gap-1 rounded-2xl border border-border bg-surface/95 p-3 backdrop-blur-md">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    onSelect(i)
                    setOpen(false)
                  }}
                  aria-current={i === index ? 'true' : undefined}
                  className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm ${
                    i === index ? 'bg-white/5 text-bone' : 'text-muted'
                  }`}
                >
                  <span className="mr-2 text-xs tabular-nums" style={{ color: c.accent }}>
                    0{i + 1}
                  </span>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
