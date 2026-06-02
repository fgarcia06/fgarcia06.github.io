import { useEffect, useState } from 'react'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True on small viewports — used to skip the WebGL scene on phones. */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')

/** Honors the OS "reduce motion" accessibility setting. */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)')

/** A precise pointer (mouse/trackpad) capable of true hover. */
export const useHasFinePointer = () =>
  useMediaQuery('(hover: hover) and (pointer: fine)')

/**
 * True only where rich pointer interactions make sense: a fine pointer and
 * no reduced-motion request. Gates the custom cursor, magnetic buttons, tilt.
 */
export function useInteractive() {
  const fine = useHasFinePointer()
  const reduce = usePrefersReducedMotion()
  return fine && !reduce
}
