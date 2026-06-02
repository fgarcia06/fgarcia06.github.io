import { chapters } from '../../chapters'

/** Fixed vertical chapter rail with active state, labels on hover/focus. */
export function ChapterNav({
  index,
  onSelect,
}: {
  index: number
  onSelect: (i: number) => void
}) {
  return (
    <nav
      aria-label="Chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 md:flex"
    >
      {chapters.map((c, i) => {
        const active = i === index
        return (
          <button
            key={c.id}
            onClick={() => onSelect(i)}
            aria-label={`Go to ${c.label}`}
            aria-current={active ? 'true' : undefined}
            data-cursor="grow"
            className="group flex cursor-pointer items-center justify-end gap-3"
          >
            <span
              className={`text-xs uppercase tracking-[0.18em] transition-all duration-300 ${
                active ? 'text-bone opacity-100' : 'text-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              }`}
            >
              {c.label}
            </span>
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: active ? 26 : 8,
                height: 8,
                backgroundColor: active ? c.accent : 'rgba(168,156,128,0.5)',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
