import { motion } from 'framer-motion'

export interface FilterItem {
  key: string
  label: string
  count: number
}

/**
 * Category filter chips. The active chip is marked by a shared-layout pill that
 * springs between selections. Implemented as a tablist for keyboard / screen
 * reader users; the parent owns the filtering state.
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
            className="relative flex min-h-[44px] cursor-pointer items-center rounded-full border px-4 py-1 text-sm transition-colors duration-200 sm:min-h-0 sm:py-1.5"
            style={{ borderColor: on ? accent : 'var(--color-border)' }}
          >
            {on && (
              <motion.span
                layoutId="filter-pill"
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: `${accent}22` }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`relative z-10 ${on ? 'text-bone' : 'text-muted hover:text-bone'} transition-colors duration-200`}>
              {it.label}
              <span className="ml-1.5 text-xs tabular-nums opacity-60">{it.count}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
