import type { CSSProperties, ReactNode } from 'react'

/**
 * Micrographics annotation kit.
 *
 * A small set of presentational marks borrowed from the "Micrographics" design
 * language (Zachary Winterton): monospace asset labels, registration marks,
 * circled indices, aspect-ratio tags, CE-style badges and dotted micro-grids.
 * They layer over the existing dark/HUD theme as a cohesive "design-utility"
 * detailing pass — every piece is monochrome (white/grey, low alpha), rendered
 * as vector SVG or styled text (no emoji), and purely decorative: `aria-hidden`
 * with `pointer-events:none` so none of it interferes with the real UI.
 */

type Common = { className?: string; style?: CSSProperties }

/** Deterministic archive code from a seed (slug / index), e.g. `2026_MG_042`. */
// eslint-disable-next-line react-refresh/only-export-components -- utility function co-located with the components that use it; no HMR concern
export function microCode(seed: string | number): string {
  const s = String(seed)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return `2026_MG_${String(h % 1000).padStart(3, '0')}`
}

/** Monospace technical caption, tracked-out and low-contrast. */
export function MicroLabel({ children, className = '', style }: Common & { children: ReactNode }) {
  return (
    <span className={`micro-label ${className}`} style={style} aria-hidden>
      {children}
    </span>
  )
}

/** Registration / crosshair mark. */
export function RegMark({ size, className = '', style }: Common & { size?: number }) {
  return (
    <svg
      className={`micro-reg ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1" />
      <path
        d="M12 1.5V8 M12 16V22.5 M1.5 12H8 M16 12H22.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

/** Circled index / numeral badge (mirrors the existing `.skill-index` read). */
export function CircledIndex({ value, className = '', style }: Common & { value: number | string }) {
  const text = typeof value === 'number' ? String(value).padStart(2, '0') : value
  return (
    <span className={`micro-circled ${className}`} style={style} aria-hidden>
      <svg viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="micro-circled-text">{text}</span>
    </span>
  )
}

/** Aspect-ratio bracket tag — corner brackets framing a ratio, e.g. ⌐16:9¬. */
export function AspectBracket({ ratio = '16:9', className = '', style }: Common & { ratio?: string }) {
  return (
    <span className={`micro-aspect ${className}`} style={style} aria-hidden>
      {ratio}
    </span>
  )
}

/** Small pill badge — CE marks, category tags, etc. */
export function MicroBadge({ children, className = '', style }: Common & { children: ReactNode }) {
  return (
    <span className={`micro-badge ${className}`} style={style} aria-hidden>
      {children}
    </span>
  )
}

/** Dotted micro-grid corner ornament. */
export function DotGrid({ cols = 6, rows = 4, className = '', style }: Common & { cols?: number; rows?: number }) {
  const dots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={2 + c * 5} cy={2 + r * 5} r="0.85" fill="currentColor" />)
    }
  }
  return (
    <svg
      className={`micro-grid ${className}`}
      style={style}
      width={cols * 5}
      height={rows * 5}
      viewBox={`0 0 ${cols * 5} ${rows * 5}`}
      aria-hidden
    >
      {dots}
    </svg>
  )
}

/** The golden ratio, φ — used for proportions and labelled throughout. */
export const PHI = 1.618033988749895

/**
 * A true golden (logarithmic) spiral: r = a·e^(bθ) with b = ln(φ)/(π/2), so the
 * radius grows by exactly φ every quarter turn. Sampled into a polyline once at
 * module load. Reads as a slowly-rotating galaxy arm in the background.
 */
function goldenSpiralPath(turns: number, steps: number): { d: string; r: number } {
  const b = Math.log(PHI) / (Math.PI / 2)
  const maxT = turns * 2 * Math.PI
  const maxR = Math.exp(b * maxT)
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * maxT
    const r = Math.exp(b * t)
    const x = r * Math.cos(t)
    const y = r * Math.sin(t)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return { d: d.trim(), r: maxR }
}

const SPIRAL = goldenSpiralPath(3.25, 320)

/** Faint golden-spiral ornament (decorative, non-interactive). */
export function GoldenSpiral({ className = '', style }: Common) {
  const r = SPIRAL.r
  return (
    <svg
      className={`golden-spiral ${className}`}
      style={style}
      viewBox={`${-r} ${-r} ${2 * r} ${2 * r}`}
      fill="none"
      aria-hidden
    >
      <path d={SPIRAL.d} stroke="currentColor" strokeWidth={r * 0.005} />
      <circle cx="0" cy="0" r={r * 0.012} fill="currentColor" />
    </svg>
  )
}

/**
 * Phi-proportion guide grid — vertical + horizontal rules at the 0.382 / 0.618
 * golden sections of the viewport, with small φ tick labels. Pure structure
 * lines; very low contrast so they read as drafting guides, not chrome.
 */
export function PhiGrid({ className = '' }: { className?: string }) {
  const sections = [38.2, 61.8]
  return (
    <div className={`phi-grid ${className}`} aria-hidden>
      {sections.map((p) => (
        <span key={`v${p}`} className="phi-line phi-v" style={{ left: `${p}%` }} />
      ))}
      {sections.map((p) => (
        <span key={`h${p}`} className="phi-line phi-h" style={{ top: `${p}%` }} />
      ))}
      <span className="phi-mark" style={{ left: '38.2%', top: '61.8%' }} />
      <span className="phi-mark" style={{ left: '61.8%', top: '38.2%' }} />
    </div>
  )
}

/**
 * Wraps a child (an image / generated visual) with technical corner brackets,
 * a registration mark and an optional caption row — the editorial "framed
 * asset" treatment used on the detail-page hero and the About portrait.
 */
export function MicroFrame({
  children,
  caption,
  className = '',
}: {
  children: ReactNode
  caption?: ReactNode
  className?: string
}) {
  return (
    <div className={`micro-frame ${className}`}>
      {children}
      <span className="micro-frame-corner tl" aria-hidden />
      <span className="micro-frame-corner tr" aria-hidden />
      <span className="micro-frame-corner bl" aria-hidden />
      <span className="micro-frame-corner br" aria-hidden />
      <RegMark className="micro-frame-reg" />
      {caption && (
        <span className="micro-frame-caption" aria-hidden>
          {caption}
        </span>
      )}
    </div>
  )
}
