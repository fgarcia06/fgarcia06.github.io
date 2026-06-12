import { useEffect } from 'react'

/**
 * Minimal AOS clone: elements carry data-aos="fade-up | zoom-in | fade-in |
 * fade-left" (styled in index.css) and gain .aos-animate once they enter
 * the viewport (offset 60px, like the reference's AOS.init). Implemented
 * with synchronous scroll-position checks — the same strategy AOS uses —
 * rather than IntersectionObserver, so reveals are deterministic.
 */

/** Re-arm and observe all [data-aos] under root whenever `armed` flips true. */
export function useAos(
  root: React.RefObject<HTMLElement | null>,
  armed: boolean,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const el = root.current
    if (!el || !armed) return

    const targets = Array.from(el.querySelectorAll('[data-aos]'))
    targets.forEach((t) => t.classList.remove('aos-animate'))
    let pending = new Set(targets)

    const check = () => {
      if (pending.size === 0) return
      const vh = window.innerHeight
      for (const t of [...pending]) {
        const rect = (t as HTMLElement).getBoundingClientRect()
        // skip detached/hidden elements (display:none rects are 0x0 at 0,0)
        if (rect.width === 0 && rect.height === 0) continue
        if (rect.top < vh - 60 && rect.bottom > 0) {
          t.classList.add('aos-animate')
          pending.delete(t)
        }
      }
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        check()
        ticking = false
      })
    }

    // first pass after the page's .show transition has begun (the wrapper
    // removes display:none immediately and adds .show at +100ms)
    const timers = [window.setTimeout(check, 150), window.setTimeout(check, 1100)]
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      pending = new Set()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, ...deps])
}
