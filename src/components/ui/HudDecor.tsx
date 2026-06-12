import { useReducedMotion } from 'framer-motion'

/**
 * Shared HUD decoration kit — the angular Wuthering-Waves / Edgerunners
 * design language used across all sections: chamfered panels, diamond marks,
 * readout labels, hatch texture blocks, resonance waveforms, and the global
 * CRT scanline overlay.
 */

/** Chamfered corner cut used by panels, chips and buttons. */
export const CHAMFER = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'

/** Wider cut for large panels/cards. */
export const CHAMFER_LG = 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)'

/** WuWa signature pale-gold for readout text. */
export const GOLD = '#e3cf96'

/** Small rotated-square diamond mark. */
export function Diamond({
  size = 6,
  color = 'var(--color-moss)',
  filled = true,
  className = '',
}: {
  size?: number
  color?: string
  filled?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rotate-45 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: filled ? color : 'transparent',
        border: filled ? undefined : `1px solid ${color}`,
      }}
    />
  )
}

/** Uppercase grotesk HUD readout, e.g. `REC.01 // FIELD LOG`. */
export function Readout({
  children,
  color = GOLD,
  flicker = false,
  className = '',
}: {
  children: React.ReactNode
  color?: string
  flicker?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span
      className={`font-grotesk text-[10px] uppercase ${className}`}
      style={{
        color,
        letterSpacing: '0.26em',
        animation: flicker && !reduce ? 'flickerSoft 7s linear infinite' : undefined,
      }}
    >
      {children}
    </span>
  )
}

/** Diagonal hatch texture block with a slanted clip — angular filler. */
export function HatchBlock({
  color = 'var(--color-moss)',
  className = '',
  flip = false,
}: {
  color?: string
  className?: string
  flip?: boolean
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block ${className}`}
      style={{
        background: `repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px 7px)`,
        opacity: 0.35,
        clipPath: flip
          ? 'polygon(24px 0, 100% 0, 100% 100%, 0 100%)'
          : 'polygon(0 0, 100% 0, calc(100% - 24px) 100%, 0 100%)',
      }}
    />
  )
}

/** Animated resonance / equalizer strip (the WuWa waveform). */
export function Waveform({
  color = 'var(--color-moss)',
  bars = 12,
  className = '',
  active = true,
}: {
  color?: string
  bars?: number
  className?: string
  active?: boolean
}) {
  const reduce = useReducedMotion()
  const heights = [40, 75, 55, 100, 65, 85, 45, 95, 60, 78, 50, 88, 42, 70, 58, 92]
  return (
    <span aria-hidden className={`flex h-4 items-end gap-[3px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="block w-[2px]"
          style={{
            height: `${heights[i % heights.length]}%`,
            backgroundColor: color,
            opacity: active ? 0.8 : 0.4,
            transformOrigin: 'bottom',
            animation: reduce ? undefined : `eqbar ${1.3 + (i % 5) * 0.17}s ease-in-out ${i * 0.09}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

/**
 * Sitewide CRT scanline overlay (Edgerunners): static hairlines plus one
 * soft band drifting down. Sits above the 3D backdrop, below the content.
 */
export function ScanlineOverlay() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(231,234,242,0.014) 0px, rgba(231,234,242,0.014) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {!reduce && (
        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(124,212,253,0.03) 55%, rgba(124,212,253,0.05))',
            animation: 'scanY 11s linear infinite',
          }}
        />
      )}
    </div>
  )
}
