import { chapters } from '../../chapters'
import { scrollToId } from '../../hooks/useLenis'

/** Fixed vertical section rail with active state, labels on hover/focus. */
export function ChapterNav({ index }: { index: number }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 md:flex"
    >
      {chapters.map((c, i) => {
        const active = i === index
        return (
          <button
            key={c.id}
            onClick={() => scrollToId(c.id)}
            aria-label={`Go to ${c.label}`}
            aria-current={active ? 'true' : undefined}
            data-cursor="grow"
            className="group flex cursor-pointer items-center justify-end gap-3"
          >
            <span
              className={`text-xs uppercase tracking-[0.18em] transition-all duration-200 ${
                active ? 'text-bone opacity-100' : 'text-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              }`}
            >
              {c.label}
            </span>
            <span
              className="block rounded-full transition-all duration-200"
              style={{
                width: active ? 26 : 8,
                height: 8,
                backgroundColor: active ? c.accent : 'rgba(139,147,166,0.45)',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
