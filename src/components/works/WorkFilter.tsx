import { motion } from 'framer-motion'

export interface FilterItem {
  key: string
  label: string
  count: number
}

/** Chamfered corner — matches the angular panel language of the section. */
const CHAMFER = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'

/**
 * Category filter chips in angular HUD style. The active chip is marked by a
 * shared-layout fill that springs between selections. Implemented as a
 * tablist for keyboard / screen reader users; the parent owns the filtering.
 */
export function WorkFilter({
  items,
  active,
  onChange,
  accent,
}: {
  items: FilterItem[]
  active: string
  onChange: (key: string) => void
  accent: string
}) {
  return (
    <div role="tablist" aria-label="Filter projects by category" className="flex flex-wrap justify-center gap-2">
      {items.map((it) => {
        const on = active === it.key
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={on}
            data-cursor="grow"
            onClick={() => onChange(it.key)}
            className="relative flex min-h-[44px] cursor-pointer items-center border px-4 py-1 font-grotesk text-sm tracking-wide transition-colors duration-200 sm:min-h-0 sm:py-1.5"
            style={{ clipPath: CHAMFER, borderColor: on ? accent : 'var(--color-border)' }}
          >
            {on && (
              <motion.span
                layoutId="filter-pill"
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundColor: `${accent}22`, clipPath: CHAMFER }}
                transition={{ type: 'spring', stiffness: 600, damping: 40 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 ${on ? 'text-bone' : 'text-muted hover:text-bone'} transition-colors duration-200`}>
              {on && (
                <span aria-hidden className="inline-block h-1 w-1 rotate-45" style={{ backgroundColor: accent }} />
              )}
              {it.label}
              <span className="text-xs tabular-nums opacity-60">{it.count}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
