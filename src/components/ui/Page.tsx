import { useEffect, useRef, type ReactNode } from 'react'
import { useAos } from '../../lib/aos'
import { useRouter } from '../../lib/router'

/**
 * Page show/hide choreography. The router owns the macro timing of the warp
 * jump (it staggers when each page goes active/inactive); this component just
 * runs the local enter/leave:
 *  - show: remove .hide (re-enters flow at the compressed resting strip), then
 *    +60ms add .show so the spring fires; titles re-animate at +600ms. The page
 *    only goes active ~1.2s into the jump, so this spring plays as the letterbox
 *    opens — the section "expands out" of the wormhole.
 *  - leave: warp-out fades + squeezes the outgoing page (~0.5s), then .hide
 *    drops it. The empty frame that follows is the "travel" beat.
 */
export default function Page({
  id,
  active,
  dataKey,
  children,
}: {
  id: string
  active: boolean
  /** Changes re-arm scroll animations (e.g. detail slug swaps). */
  dataKey?: string
  children: ReactNode
}) {
  const { isAnimatingRef } = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)

  useAos(ref, active, [dataKey])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const timers: number[] = []

    if (active) {
      // Cancel any pending hide, then ALWAYS strip the leave animation. warp-out
      // is `forwards` (it holds opacity:0 at its end), so a page that re-activates
      // before its hide timer fires must clear it or the whole page stays
      // invisible. This is the home page on first boot: it flips inactive→active
      // within one tick, the cleanup nulls hideTimer before this branch runs, so
      // removing warp-out only inside the `hideTimer !== null` guard would miss
      // it — leaving `warp-out show` together and the nodes hidden behind it.
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
      el.classList.remove('warp-out')
      el.classList.remove('hide')
      const titles = el.querySelectorAll('.page-title, .page-subtitle')
      titles.forEach((t) => t.classList.remove('aos-animate'))

      if (isAnimatingRef.current) {
        // Real navigation: spring in from the wormhole as cinema bars retract.
        timers.push(window.setTimeout(() => el.classList.add('show'), 60))
        timers.push(
          window.setTimeout(() => {
            titles.forEach((t) => t.classList.add('aos-animate'))
          }, 600),
        )
      } else {
        // Boot / silent restore: show instantly with no spring so the page
        // appears immediately without a transition the user never triggered.
        el.style.transition = 'none'
        el.classList.add('show')
        void el.offsetHeight // flush style so transition:none is committed
        el.style.removeProperty('transition')
      }
    } else {
      // squeeze+zoom+fade the outgoing page into the wormhole before hiding;
      // the cinema warp-blur masks it but the animation adds tactile correctness.
      // Only runs during real navigations (isAnimatingRef is true), never on boot.
      el.classList.remove('show')
      el.classList.add('warp-out')
      hideTimer.current = window.setTimeout(() => {
        el.classList.remove('warp-out')
        el.classList.add('hide')
        hideTimer.current = null
      }, 700)
    }
    return () => {
      timers.forEach(clearTimeout)
      // cancel the pending warp-out→hide so StrictMode's double-invoke never
      // leaves an orphaned timer that hides a page that has since become active
      if (hideTimer.current !== null) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
    }
  }, [active, dataKey, isAnimatingRef])

  return (
    <div ref={ref} className={`${id} page hide`}>
      {children}
    </div>
  )
}
