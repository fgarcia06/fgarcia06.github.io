import { lazy, Suspense } from 'react'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { StaticBackdrop } from './StaticBackdrop'

const HeroCanvas = lazy(() => import('./HeroCanvas'))

/**
 * Full-viewport 3D field that lives behind every chapter and morphs with the
 * active chapter accent. Falls back to a tinted static gradient on mobile and
 * under reduced motion.
 */
export function PersistentBackdrop({ accent, mood }: { accent: string; mood: number }) {
  const isMobile = useIsMobile()
  const reduceMotion = usePrefersReducedMotion()
  const show3D = !isMobile && !reduceMotion

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      {show3D ? (
        <Suspense fallback={<StaticBackdrop accent={accent} />}>
          <HeroCanvas accent={accent} mood={mood} />
        </Suspense>
      ) : (
        <StaticBackdrop accent={accent} />
      )}
      {/* Readability scrim. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/20 to-bg/70" />
    </div>
  )
}
