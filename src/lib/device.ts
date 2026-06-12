/** Coarse device check, evaluated once — mirrors the reference's APP.isMobile
 * gate that drops particles, mouse parallax, and heavy raymarching. */
export const isMobile: boolean =
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 801px)').matches ||
    window.matchMedia('(pointer: coarse)').matches)

export const prefersReducedMotion: boolean =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
