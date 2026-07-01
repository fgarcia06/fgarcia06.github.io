import { useEffect } from 'react'

/**
 * Minimal AOS clone: elements carry data-aos="fade-up | zoom-in | fade-in |
 * fade-left" (styled in index.css) and gain .aos-animate once they enter
 * the viewport (offset 60px, like the reference's AOS.init). Implemented
 * with synchronous scroll-position checks — the same strategy AOS uses —
 * rather than IntersectionObserver, so reveals are deterministic.
 */

/** Re-arm and observe all [data-aos] under root whenever `armed` flips true.
 *  `startDelay` controls when the first check fires after the page becomes
 *  active — during a cinema navigation pass 1800 so the check fires after the
 *  bars have fully opened; on boot/silent restores pass 100 for an instant check. */
export function useAos(
  root: React.RefObject<HTMLElement | null>,
  armed: boolean,
  deps: unknown[] = [],
  startDelay = 100,
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

    // first pass timed to when the page is fully revealed:
    //   startDelay=1800 → fires ~1750ms after cinema bars started opening (3.5s cinema)
    //   startDelay=100  → fires immediately on boot/silent restores
    const timers = [
      window.setTimeout(check, startDelay),
      window.setTimeout(check, startDelay + 800),
    ]
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      pending = new Set()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, ...deps, startDelay])
}
