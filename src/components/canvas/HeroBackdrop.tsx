import { lazy, Suspense, useRef } from 'react'
import { useInView } from 'framer-motion'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { StaticBackdrop } from './StaticBackdrop'

const HeroCanvas = lazy(() => import('./HeroCanvas'))

export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.1 })
  const isMobile = useIsMobile()
  const reduceMotion = usePrefersReducedMotion()

  // Only run WebGL on capable, motion-friendly viewports — and only while
  // the hero is actually visible, so it stops rendering once scrolled past.
  const show3D = !isMobile && !reduceMotion && inView

  return (
    <div ref={ref} className="absolute inset-0 z-0" aria-hidden>
      {show3D ? (
        <Suspense fallback={<StaticBackdrop />}>
          <HeroCanvas />
        </Suspense>
      ) : (
        <StaticBackdrop />
      )}
      {/* Readability scrim so copy stays legible over the field. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/10 to-bg/80" />
    </div>
  )
}
