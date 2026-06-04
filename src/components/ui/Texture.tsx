import { useId } from 'react'

/**
 * Gradient-free surface textures used to give panels a tactile, "engineering
 * field-notes" feel: film grain, a faint plus-mark grid, and corner ticks.
 */

/** Fine film grain via SVG turbulence — adds texture without a gradient. */
export function Grain({ opacity = 0.08, className = '' }: { opacity?: number; className?: string }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay ${className}`} style={{ opacity }}>
      <filter id={`grain-${raw}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${raw})`} />
    </svg>
  )
}

/** Faint blueprint grid of small plus marks (vector, not a gradient). */
export function CrossGrid({
  color = '#ffffff',
  opacity = 0.08,
  gap = 24,
  className = '',
}: {
  color?: string
  opacity?: number
  gap?: number
  className?: string
}) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  const c = gap / 2
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }}>
      <defs>
        <pattern id={`cross-${raw}`} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <path d={`M${c} ${c - 3} v6 M${c - 3} ${c} h6`} stroke={color} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#cross-${raw})`} />
    </svg>
  )
}

/** Four L-shaped registration ticks at the corners — viewfinder framing. */
export function CornerTicks({
  color,
  length = 14,
  margin = 10,
  className = '',
}: {
  color: string
  length?: number
  margin?: number
  className?: string
}) {
  const size = { width: length, height: length, borderColor: color } as const
  const corners = [
    { key: 'tl', edges: 'border-l border-t', pos: { left: margin, top: margin } },
    { key: 'tr', edges: 'border-r border-t', pos: { right: margin, top: margin } },
    { key: 'bl', edges: 'border-l border-b', pos: { left: margin, bottom: margin } },
    { key: 'br', edges: 'border-r border-b', pos: { right: margin, bottom: margin } },
  ]
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {corners.map((c) => (
        <span key={c.key} className={`absolute ${c.edges}`} style={{ ...size, ...c.pos }} />
      ))}
    </div>
  )
}
