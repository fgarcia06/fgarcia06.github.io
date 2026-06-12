import { useEffect, useRef, type ReactNode } from 'react'
import { useAos } from '../../lib/aos'

/**
 * Clone of the reference's showPage/hidePage choreography:
 *  - show: remove .hide (re-enters DOM flow), then +100ms add .show
 *    (.8s ease-in-out slide-up + fade via CSS); page titles re-animate
 *    at +500ms like the section views do.
 *  - hide: remove .show immediately (slide-down + fade), add .hide
 *    (display:none) after 1000ms.
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
      el.classList.remove('hide')
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
        timers.push(window.setTimeout(() => el.classList.add('hide'), 1000))
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
