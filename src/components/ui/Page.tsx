import { useEffect, useRef, type ReactNode } from 'react'
import { useAos } from '../../lib/aos'

/**
 * Page show/hide choreography, reworked into a depth/zoom model so navigation
 * reads as travelling through space:
 *  - show: remove .hide (re-enters DOM flow), then +100ms add .show — the page
 *    zooms in from deep space (scale up from far) and fades in; titles
 *    re-animate at +500ms.
 *  - hide: remove .show, add .zoom-through — the outgoing page rushes toward
 *    and past the viewer (scale up + fade); .hide (display:none) lands at
 *    +1000ms once it's gone. First paint hides instantly without animating.
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
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useAos(ref, active, [dataKey])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const timers: number[] = []

    if (active) {
      el.classList.remove('hide', 'zoom-through')
      const titles = el.querySelectorAll('.page-title, .page-subtitle')
      titles.forEach((t) => t.classList.remove('aos-animate'))
      timers.push(window.setTimeout(() => el.classList.add('show'), 100))
      timers.push(
        window.setTimeout(() => {
          titles.forEach((t) => t.classList.add('aos-animate'))
        }, 500),
      )
    } else {
      el.classList.remove('show')
      if (first.current) {
        el.classList.add('hide')
      } else {
        // fly the outgoing page through the camera, then drop it from flow
        el.classList.add('zoom-through')
        timers.push(
          window.setTimeout(() => {
            el.classList.add('hide')
            el.classList.remove('zoom-through')
          }, 1000),
        )
      }
    }
    first.current = false
    return () => timers.forEach(clearTimeout)
  }, [active, dataKey])

  return (
    <div ref={ref} className={`${id} page hide`}>
      {children}
    </div>
  )
}
