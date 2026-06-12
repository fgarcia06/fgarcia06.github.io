import { motion, useTransform, type MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import type { Project, VisualKind } from '../../data/projects'
import { CrossGrid, CornerTicks } from '../ui/Texture'
import { useStillMotion } from '../../hooks/useMediaQuery'

/**
 * Wuthering-Waves-styled generated project preview: a dark HUD panel with
 * angular chrome (corner brackets, diamond ticks, hatch zones, readouts, a
 * resonance waveform) framing a per-project geometric motif. Replaces the
 * old landscape illustrations with something flatter, sharper and more
 * game-UI — while staying data-driven from the project entry.
 */

type Px = MotionValue<number>
type ArtProps = { a: string; reduce: boolean; active: boolean }

const INK = '#0b0e15'
const BONE = '#e7eaf2'
/** WuWa signature pale-gold, reserved for small HUD readouts. */
const GOLD = '#e3cf96'

export function HudPreview({
  project,
  px,
  py,
  active = false,
  bare = false,
  index,
  still = false,
}: {
  project: Project
  px: Px
  py: Px
  active?: boolean
  bare?: boolean
  index?: number
  /** Force a fully static HUD (no looping animation) regardless of viewport. */
  still?: boolean
}) {
  // Phones get the static HUD: 10 of these animating at once destroys scroll.
  // `still` also freezes it inside the opened case-study modal so scrolling
  // the dialog stays smooth.
  const reduce = useStillMotion() || still
  const a = project.accent
  const Art = ART[project.visual]

  // Motif drifts with the pointer; chrome counter-drifts a touch for depth.
  const artX = useTransform(px, [-0.5, 0.5], [-16, 16])
  const artY = useTransform(py, [-0.5, 0.5], [-12, 12])
  const hudX = useTransform(px, [-0.5, 0.5], [6, -6])

  const code = index !== undefined ? String(index + 1).padStart(2, '0') : '—'

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${bare ? '' : 'rounded-2xl border border-border'}`}
      style={{ backgroundColor: INK }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: a, opacity: 0.04 }} />
      <CrossGrid color={a} opacity={0.08} gap={26} />

      {/* Hatch zones — angular texture blocks, top-left + bottom-right */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-16 w-44"
        style={{
          background: `repeating-linear-gradient(135deg, ${a}22 0 1px, transparent 1px 7px)`,
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 40px) 100%, 0 100%)',
          opacity: active ? 0.9 : 0.55,
          transition: 'opacity 0.4s',
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 h-20 w-56"
        style={{
          background: `repeating-linear-gradient(135deg, ${a}1c 0 1px, transparent 1px 7px)`,
          clipPath: 'polygon(48px 0, 100% 0, 100% 100%, 0 100%)',
          opacity: active ? 0.9 : 0.55,
          transition: 'opacity 0.4s',
        }}
      />

      {/* Per-project geometric motif (parallax plane) */}
      <motion.div className="absolute inset-0" style={{ x: artX, y: artY }}>
        <svg viewBox="0 0 480 270" className="h-full w-full" aria-hidden>
          <Reticle a={a} reduce={!!reduce} active={active} />
          <Art a={a} reduce={!!reduce} active={active} />
        </svg>
      </motion.div>

      {/* HUD chrome (counter-parallax plane) */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: hudX }}>
        {/* Top readout bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-7 pt-3.5">
          <span
            className="flex items-center gap-2 font-grotesk text-[9px] uppercase"
            style={{ color: active ? GOLD : `${BONE}66`, letterSpacing: '0.28em', transition: 'color 0.3s' }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rotate-45"
              style={{ backgroundColor: active ? GOLD : `${a}aa`, transition: 'background-color 0.3s' }}
            />
            PRJ-{code} // {project.category}
          </span>
          <span
            className="hidden font-grotesk text-[9px] uppercase sm:block"
            style={{ color: `${BONE}40`, letterSpacing: '0.22em' }}
          >
            {project.context}
          </span>
        </div>

        {/* Right edge — diamond rail */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.5 w-1.5 rotate-45"
              style={{
                backgroundColor: active && i === 1 ? GOLD : 'transparent',
                border: `1px solid ${active ? a : `${BONE}33`}`,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Bottom-right: resonance waveform + tag readout */}
        <div className="absolute bottom-3.5 right-7 flex items-end gap-4">
          <span
            className="mb-0.5 hidden font-grotesk text-[9px] uppercase md:block"
            style={{ color: `${BONE}38`, letterSpacing: '0.2em' }}
          >
            {project.tags.slice(0, 3).join(' / ')}
          </span>
          <div className="flex h-5 items-end gap-[3px]" aria-hidden>
            {WAVE_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="block w-[2px]"
                style={{
                  height: `${h}%`,
                  backgroundColor: active ? a : `${a}77`,
                  transformOrigin: 'bottom',
                  transition: 'background-color 0.3s',
                  animation: reduce ? undefined : `eqbar ${1.4 + (i % 5) * 0.18}s ease-in-out ${i * 0.09}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Scan band — only while engaged */}
        {!reduce && active && (
          <div
            className="absolute inset-x-0 top-0 h-10"
            style={{
              background: `linear-gradient(180deg, transparent, ${a}14 55%, ${a}26 100%)`,
              borderBottom: `1px solid ${a}55`,
              animation: 'scanY 3s linear infinite',
            }}
          />
        )}

        <CornerTicks color={active ? `${a}cc` : `${a}55`} length={11} margin={9} />
      </motion.div>
    </div>
  )
}

/* ── Shared geometry helpers ─────────────────────────────────────────────── */

const WAVE_HEIGHTS = [40, 75, 55, 100, 65, 85, 45, 95, 60, 78, 50, 88]

function ringPts(cx: number, cy: number, r: number, n: number, startDeg = -90) {
  return Array.from({ length: n }, (_, i) => {
    const t = ((startDeg + (360 / n) * i) * Math.PI) / 180
    return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t), i }
  })
}

function hexPoints(cx: number, cy: number, r: number) {
  return ringPts(cx, cy, r, 6, -90)
    .map((p) => `${p.x},${p.y}`)
    .join(' ')
}

/** Rotated-square "diamond" marker — the signature WuWa tick. */
function Dia({ cx, cy, r, color, filled = false }: { cx: number; cy: number; r: number; color: string; filled?: boolean }) {
  const d = `M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z`
  return <path d={d} fill={filled ? color : 'none'} stroke={color} strokeWidth="1.3" />
}

/** Card/panel rectangle with one chamfered corner. */
function chamfer(x: number, y: number, w: number, h: number, c: number) {
  return `${x},${y} ${x + w - c},${y} ${x + w},${y + c} ${x + w},${y + h} ${x},${y + h}`
}

/** Slow rotating targeting ring behind every motif. */
function Reticle({ a, reduce, active }: ArtProps) {
  return (
    <g
      style={{
        animation: reduce ? undefined : `spinSlow ${active ? 26 : 44}s linear infinite`,
        transformBox: 'fill-box',
        transformOrigin: 'center',
      }}
      opacity={active ? 0.5 : 0.3}
    >
      <circle cx="300" cy="135" r="92" fill="none" stroke={`${a}55`} strokeWidth="1" strokeDasharray="3 9" />
      {ringPts(300, 135, 92, 4, -90).map((p) => (
        <Dia key={p.i} cx={p.x} cy={p.y} r={3} color={`${a}88`} />
      ))}
    </g>
  )
}

const dash = (reduce: boolean, dur = 2.4) =>
  reduce ? undefined : ({ animation: `dashFlow ${dur}s linear infinite` } as const)

const spin = (reduce: boolean, dur: number, reverse = false) =>
  reduce
    ? undefined
    : ({
        animation: `spinSlow ${dur}s linear infinite ${reverse ? 'reverse' : ''}`,
        transformBox: 'fill-box',
        transformOrigin: 'center',
      } as const)

/* ── Motifs ──────────────────────────────────────────────────────────────── */

/** 1. fitness — orbital progress arcs + heartbeat trace. */
function FitnessArt({ a, reduce, active }: ArtProps) {
  const arcs = [
    { r: 38, sweep: 200, color: a, dur: 18 },
    { r: 54, sweep: 150, color: BONE, dur: 26 },
    { r: 70, sweep: 250, color: a, dur: 34 },
  ]
  return (
    <g>
      {arcs.map((arc, i) => (
        <g key={i} style={spin(reduce, arc.dur, i % 2 === 1)}>
          <circle
            cx="300"
            cy="135"
            r={arc.r}
            fill="none"
            stroke={arc.color}
            strokeOpacity={active ? 0.8 : 0.55}
            strokeWidth={i === 0 ? 3 : 2}
            strokeLinecap="round"
            strokeDasharray={`${(arc.sweep / 360) * 2 * Math.PI * arc.r} ${2 * Math.PI * arc.r}`}
          />
        </g>
      ))}
      <polyline
        points="120,135 165,135 178,112 192,158 204,135 232,135"
        fill="none"
        stroke={a}
        strokeOpacity={active ? 0.9 : 0.6}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeDasharray="6 4"
        style={dash(reduce, 1.8)}
      />
      <Dia cx={300} cy={135} r={5} color={a} filled />
    </g>
  )
}

/** 2. tracking — locked target boxes + crosshair + flowing trajectory. */
function TrackingArt({ a, reduce, active }: ArtProps) {
  const boxes = [
    { x: 196, y: 84, s: 40 },
    { x: 318, y: 64, s: 30 },
    { x: 288, y: 168, s: 34 },
  ]
  return (
    <g>
      <path
        d="M150 200 C 210 170, 220 100, 300 80 S 420 110, 440 70"
        fill="none"
        stroke={`${a}88`}
        strokeWidth="1.4"
        strokeDasharray="7 6"
        style={dash(reduce, 2)}
      />
      {boxes.map((b, i) => {
        const L = 10
        return (
          <g key={i} opacity={active ? 1 : 0.7}>
            {/* corner brackets only — open target frame */}
            <path
              d={`M${b.x} ${b.y + L} V${b.y} H${b.x + L} M${b.x + b.s - L} ${b.y} H${b.x + b.s} V${b.y + L}
                 M${b.x + b.s} ${b.y + b.s - L} V${b.y + b.s} H${b.x + b.s - L} M${b.x + L} ${b.y + b.s} H${b.x} V${b.y + b.s - L}`}
              fill="none"
              stroke={i === 0 ? a : `${BONE}99`}
              strokeWidth="1.6"
            />
            <text
              x={b.x + b.s + 6}
              y={b.y + 8}
              fill={`${BONE}55`}
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="1"
            >
              ID:{i + 1}
            </text>
          </g>
        )
      })}
      {/* crosshair */}
      <g opacity={active ? 0.95 : 0.6}>
        <circle cx="300" cy="135" r="16" fill="none" stroke={a} strokeWidth="1.4" />
        <path d="M300 109 v14 M300 147 v14 M274 135 h14 M312 135 h14" stroke={a} strokeWidth="1.4" />
        <Dia cx={300} cy={135} r={3} color={a} filled />
      </g>
    </g>
  )
}

/** 3. poker — fanned chamfered cards + dashed chip ring. */
function PokerArt({ a, reduce, active }: ArtProps) {
  const cards = [
    { rot: -16, suit: '♠' },
    { rot: 0, suit: '♦' },
    { rot: 16, suit: '♣' },
  ]
  return (
    <g>
      <g style={spin(reduce, 24)}>
        <circle cx="186" cy="170" r="22" fill="none" stroke={`${a}99`} strokeWidth="2" strokeDasharray="10 7" />
      </g>
      <circle cx="186" cy="170" r="13" fill="none" stroke={`${BONE}44`} strokeWidth="1.2" />
      {cards.map((c, i) => (
        <g key={i} transform={`rotate(${c.rot} 310 200)`} opacity={active || i === 1 ? 1 : 0.75}>
          <polygon
            points={chamfer(286, 88, 48, 70, 10)}
            fill={INK}
            stroke={i === 1 ? a : `${BONE}66`}
            strokeWidth="1.5"
          />
          <text
            x="310"
            y="130"
            textAnchor="middle"
            fontSize="18"
            fill={i === 1 ? a : `${BONE}aa`}
            fontFamily="monospace"
          >
            {c.suit}
          </text>
        </g>
      ))}
      <polyline
        points="160,90 200,90 212,76"
        fill="none"
        stroke={`${a}66`}
        strokeWidth="1.2"
        strokeDasharray="5 5"
        style={dash(reduce, 2.6)}
      />
    </g>
  )
}

/** 4. crypto — hex lattice with keyhole core + marching bitstream. */
function CryptoArt({ a, reduce, active }: ArtProps) {
  return (
    <g>
      <polygon points={hexPoints(300, 135, 38)} fill={`${a}10`} stroke={a} strokeWidth="1.8" opacity={active ? 1 : 0.8} />
      <polygon points={hexPoints(382, 95, 20)} fill="none" stroke={`${BONE}55`} strokeWidth="1.3" />
      <polygon points={hexPoints(228, 192, 16)} fill="none" stroke={`${BONE}44`} strokeWidth="1.3" />
      <path d="M334 118 L364 104 M276 158 L240 184" stroke={`${a}66`} strokeWidth="1.2" strokeDasharray="4 4" />
      {/* keyhole */}
      <circle cx="300" cy="128" r="9" fill="none" stroke={a} strokeWidth="2" />
      <path d="M300 136 v16" stroke={a} strokeWidth="3" strokeLinecap="round" />
      {/* bitstream */}
      <path
        d="M130 96 H252 M348 172 H444"
        stroke={`${a}77`}
        strokeWidth="1.4"
        strokeDasharray="10 5 3 5"
        style={dash(reduce, 1.6)}
      />
      <text x="136" y="88" fill={`${BONE}44`} fontSize="8" fontFamily="monospace" letterSpacing="2">
        AES-256-GCM
      </text>
    </g>
  )
}

/** 5. lottery — entry matrix + draw ring with the winning diamond lit. */
function LotteryArt({ a, reduce, active }: ArtProps) {
  const filled = [1, 4, 6, 9, 12, 14, 18, 21, 23]
  return (
    <g>
      {/* entry matrix */}
      <g opacity={active ? 0.95 : 0.7}>
        {Array.from({ length: 25 }).map((_, i) => {
          const x = 158 + (i % 5) * 15
          const y = 92 + Math.floor(i / 5) * 15
          const on = filled.includes(i)
          return <rect key={i} x={x} y={y} width="7" height="7" fill={on ? `${a}cc` : `${BONE}22`} />
        })}
      </g>
      {/* draw ring */}
      <g style={spin(reduce, active ? 14 : 30)}>
        <circle cx="338" cy="136" r="52" fill="none" stroke={`${BONE}33`} strokeWidth="1" strokeDasharray="2 6" />
        {ringPts(338, 136, 52, 8).map((p) => (
          <Dia key={p.i} cx={p.x} cy={p.y} r={5} color={p.i === 0 ? GOLD : `${BONE}66`} filled={p.i === 0} />
        ))}
      </g>
      <Dia cx={338} cy={136} r={7} color={a} />
      <path d="M338 70 l-6 -10 h12 Z" fill={a} opacity={active ? 1 : 0.7} />
    </g>
  )
}

/** 6. asteroid — wireframe rocks, intercept curve, ship leading its shot. */
function AsteroidArt({ a, reduce, active }: ArtProps) {
  return (
    <g>
      <g style={spin(reduce, 36)}>
        <polygon
          points="352,74 376,66 396,80 392,104 366,110 348,94"
          fill="none"
          stroke={`${BONE}77`}
          strokeWidth="1.4"
        />
      </g>
      <g style={spin(reduce, 48, true)}>
        <polygon points="170,96 188,86 204,94 206,112 188,122 172,112" fill="none" stroke={`${BONE}55`} strokeWidth="1.2" />
      </g>
      {/* intercept trajectory */}
      <path
        d="M236 196 Q 290 160, 332 120"
        fill="none"
        stroke={`${a}99`}
        strokeWidth="1.5"
        strokeDasharray="8 6"
        style={dash(reduce, 1.8)}
      />
      {/* predicted intercept marker */}
      <g opacity={active ? 1 : 0.75}>
        <path d="M332 108 v8 M332 124 v8 M320 120 h8 M336 120 h8" stroke={a} strokeWidth="1.6" />
        <Dia cx={332} cy={120} r={4} color={a} />
      </g>
      {/* ship */}
      <g transform="rotate(38 236 196)">
        <polygon points="236,182 228,206 236,200 244,206" fill={a} stroke={BONE} strokeWidth="1" />
      </g>
    </g>
  )
}

/** 7. voice — resonance spectrum + concentric mic rings (peak WuWa). */
function VoiceArt({ a, reduce, active }: ArtProps) {
  const heights = [10, 22, 14, 34, 24, 48, 30, 60, 38, 52, 26, 40, 18, 28, 12]
  return (
    <g>
      {heights.map((h, i) => {
        const x = 196 + i * 14
        return (
          <rect
            key={i}
            x={x}
            y={135 - h / 2}
            width="5"
            height={h}
            rx="2.5"
            fill={i % 3 === 0 ? a : `${BONE}88`}
            opacity={active ? 0.95 : 0.65}
            style={
              reduce
                ? undefined
                : {
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    animation: `eqbar ${1.2 + (i % 4) * 0.22}s ease-in-out ${i * 0.08}s infinite`,
                  }
            }
          />
        )
      })}
      <circle cx="160" cy="135" r="14" fill="none" stroke={a} strokeWidth="1.8" />
      <circle cx="160" cy="135" r="24" fill="none" stroke={`${a}66`} strokeWidth="1.2" strokeDasharray="3 6" />
      <Dia cx={160} cy={135} r={4} color={a} filled />
      <text x="196" y="190" fill={`${BONE}44`} fontSize="8" fontFamily="monospace" letterSpacing="2">
        “YES” → FAN ON
      </text>
    </g>
  )
}

/** 8. database — sheared document plates + flowing query line. */
function DatabaseArt({ a, reduce, active }: ArtProps) {
  const plates = [0, 1, 2]
  return (
    <g>
      {plates.map((i) => (
        <polygon
          key={i}
          points={`${250 + i * 10},${100 + i * 26} ${382 + i * 10},${100 + i * 26} ${370 + i * 10},${124 + i * 26} ${238 + i * 10},${124 + i * 26}`}
          fill={i === 1 ? `${a}14` : 'none'}
          stroke={i === 1 ? a : `${BONE}55`}
          strokeWidth="1.4"
          opacity={active ? 1 : 0.8}
        />
      ))}
      <path
        d="M150 112 H 232"
        stroke={`${a}99`}
        strokeWidth="1.5"
        strokeDasharray="9 6"
        style={dash(reduce, 1.6)}
      />
      <text x="150" y="102" fill={`${BONE}44`} fontSize="8" fontFamily="monospace" letterSpacing="1">
        find(&#123; ... &#125;)
      </text>
      {[0, 1, 2].map((i) => (
        <Dia key={i} cx={416} cy={108 + i * 26} r={3} color={i === 1 ? a : `${BONE}55`} filled={i === 1} />
      ))}
    </g>
  )
}

/** 9. motor — spinning rotor + sweep gauge. */
function MotorArt({ a, reduce, active }: ArtProps) {
  const R = 2 * Math.PI * 58
  return (
    <g>
      {/* gauge arc */}
      <circle
        cx="300"
        cy="135"
        r="58"
        fill="none"
        stroke={`${BONE}33`}
        strokeWidth="2"
        strokeDasharray={`${R * 0.72} ${R}`}
        transform="rotate(130 300 135)"
      />
      <circle
        cx="300"
        cy="135"
        r="58"
        fill="none"
        stroke={a}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${R * (active ? 0.55 : 0.34)} ${R}`}
        transform="rotate(130 300 135)"
        style={{ transition: 'stroke-dasharray 0.6s' }}
      />
      {/* rotor */}
      <g style={spin(reduce, active ? 3 : 9)}>
        {[0, 120, 240].map((deg) => (
          <polygon
            key={deg}
            points="300,135 318,115 326,127"
            fill={`${a}cc`}
            transform={`rotate(${deg} 300 135)`}
          />
        ))}
      </g>
      <circle cx="300" cy="135" r="9" fill={INK} stroke={a} strokeWidth="2" />
      {ringPts(300, 135, 74, 12).map((p) => (
        <circle key={p.i} cx={p.x} cy={p.y} r="1.4" fill={`${BONE}55`} />
      ))}
      <text x="370" y="92" fill={`${BONE}44`} fontSize="8" fontFamily="monospace" letterSpacing="2">
        PWM 1kHz
      </text>
    </g>
  )
}

/** 10. roulette — six chambers, one armed. */
function RouletteArt({ a, reduce, active }: ArtProps) {
  return (
    <g>
      <g style={spin(reduce, active ? 10 : 26)}>
        <circle cx="300" cy="135" r="62" fill="none" stroke={`${BONE}33`} strokeWidth="1" strokeDasharray="2 7" />
        {ringPts(300, 135, 44, 6).map((p) => (
          <Dia key={p.i} cx={p.x} cy={p.y} r={7} color={p.i === 0 ? a : `${BONE}66`} filled={p.i === 0} />
        ))}
      </g>
      <circle cx="300" cy="135" r="15" fill="none" stroke={a} strokeWidth="1.8" />
      <Dia cx={300} cy={135} r={4} color={a} filled />
      {/* pointer */}
      <path d="M300 58 l-7 -12 h14 Z" fill={active ? GOLD : `${BONE}88`} style={{ transition: 'fill 0.3s' }} />
      <text x="346" y="206" fill={`${BONE}44`} fontSize="8" fontFamily="monospace" letterSpacing="2">
        1 / 6
      </text>
    </g>
  )
}

const ART: Record<VisualKind, ComponentType<ArtProps>> = {
  fitness: FitnessArt,
  tracking: TrackingArt,
  poker: PokerArt,
  crypto: CryptoArt,
  lottery: LotteryArt,
  asteroid: AsteroidArt,
  voice: VoiceArt,
  database: DatabaseArt,
  motor: MotorArt,
  roulette: RouletteArt,
}
