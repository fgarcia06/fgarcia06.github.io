import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './useMediaQuery'

/** Module-level singleton so overlays (Modal) can pause inertia scrolling. */
let lenis: Lenis | null = null

export const getLenis = () => lenis

const EASE_OUT_EXPO = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))

/**
 * Boots Lenis inertia scrolling on the document. Framer Motion's `useScroll`
 * keeps working because Lenis drives the real window scroll position — it
 * only reshapes the easing between input and scrollTop.
 * Skipped under prefers-reduced-motion (native scrolling remains).
 */
export function useSmoothScroll() {
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    if (reduce) return
    const instance = new Lenis({
      duration: 0.95,
      easing: EASE_OUT_EXPO,
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    lenis = instance

    let raf = requestAnimationFrame(function loop(time) {
      instance.raf(time)
      raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelAnimationFrame(raf)
      instance.destroy()
      lenis = null
    }
  }, [reduce])
}

/** Smooth-scrolls to a section by element id (nav links, CTA buttons). */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.1, easing: EASE_OUT_EXPO })
  else el.scrollIntoView({ behavior: 'smooth' })
}
