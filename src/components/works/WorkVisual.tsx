import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import type { Project, VisualKind } from '../../data/projects'
import { CrossGrid, CornerTicks } from '../ui/Texture'

type Px = MotionValue<number>
type ArtProps = { accent: string; reduce: boolean; active: boolean }

/**
 * Generated, animated visual for each project — no static screenshots.
 * A drifting tinted-blob backdrop plus a per-project SVG diagram that hints at
 * what the project actually does (poker cards, an encryption sweep, a lottery
 * draw, an asteroid intercept, a voice equalizer, a database, an LED
 * tachometer, a revolver). Inner layers parallax against the pointer.
 */
export function WorkVisual({
  project,
  px,
  py,
  active = false,
}: {
  project: Project
  px: Px
  py: Px
  active?: boolean
}) {
  const reduce = useReducedMotion()
  const a = project.accent
  const Art = ART[project.visual]

  // Parallax: layers shift opposite the pointer by different depths.
  const blobX = useTransform(px, [-0.5, 0.5], [18, -18])
  const blobY = useTransform(py, [-0.5, 0.5], [14, -14])
  const artX = useTransform(px, [-0.5, 0.5], [-10, 10])
  const artY = useTransform(py, [-0.5, 0.5], [-8, 8])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border" style={{ backgroundColor: '#15140d' }}>
      {/* flat accent wash + blueprint grid — solid colors, no gradient */}
      <div className="absolute inset-0" style={{ backgroundColor: a, opacity: 0.05 }} />
      <CrossGrid color={a} opacity={0.1} gap={22} />

      {/* a single soft glow for depth */}
      <motion.div className="absolute inset-0" style={{ x: blobX, y: blobY }}>
        <div
          className="absolute -left-8 top-0 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `${a}3b`, animation: reduce ? undefined : 'drift 16s ease-in-out infinite' }}
        />
      </motion.div>

      {/* Project-specific diagram */}
      <motion.div className="absolute inset-0 grid place-items-center" style={{ x: artX, y: artY }}>
        <Art accent={a} reduce={!!reduce} active={active} />
      </motion.div>

      {/* Thin glowing scanline (replaces the gradient sweep) */}
      {!reduce && (
        <div
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{ backgroundColor: `${a}66`, boxShadow: `0 0 12px ${a}aa`, animation: `sweep ${active ? 3.5 : 6}s ease-in-out infinite` }}
        />
      )}

      {/* corner registration ticks */}
      <CornerTicks color={`${a}55`} length={9} margin={7} />
    </div>
  )
}

/* -- shared helpers ----------------------------------------------------- */

/** N evenly spaced points on a circle, first point at 12 o'clock. */
function ringPoints(cx: number, cy: number, r: number, n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), i }
  })
}

const svgClass = 'h-44 w-44'
const EASE = [0.22, 1, 0.36, 1] as const

/* -- 1. AI Fitness: activity rings --------------------------------------- */

function FitnessArt({ accent, reduce, active }: ArtProps) {
  const rings = [
    { r: 58, color: accent, dash: 300 },
    { r: 44, color: '#ece4d3', dash: 226 },
    { r: 30, color: '#9caa7b', dash: 158 },
  ]
  return (
    <svg viewBox="0 0 160 160" className={svgClass} style={{ animation: reduce ? undefined : 'spinSlow 40s linear infinite' }}>
      {rings.map((ring, i) => (
        <g key={i}>
          <circle cx="80" cy="80" r={ring.r} fill="none" stroke="#ffffff12" strokeWidth="9" />
          <motion.circle
            cx="80"
            cy="80"
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={ring.dash}
            transform="rotate(-90 80 80)"
            initial={{ strokeDashoffset: ring.dash }}
            whileInView={{ strokeDashoffset: ring.dash * (active ? 0.12 : 0.28 + i * 0.12) }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.1 * i }}
          />
        </g>
      ))}
    </svg>
  )
}

/* -- 2. Object tracking: drifting bounding boxes ------------------------- */

function TrackingArt({ accent, reduce, active }: ArtProps) {
  const boxes = [
    { x: 24, y: 30, w: 38, h: 30, d: 0 },
    { x: 92, y: 64, w: 34, h: 34, d: 0.6 },
    { x: 54, y: 92, w: 30, h: 24, d: 1.2 },
  ]
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      <rect x="6" y="6" width="148" height="148" rx="10" fill="none" stroke="#ffffff14" />
      {boxes.map((b, i) => (
        <g key={i}>
          <motion.rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="3"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            animate={reduce ? undefined : { x: [b.x, b.x + 10, b.x], y: [b.y, b.y - 6, b.y] }}
            transition={{ duration: active ? 3 : 5, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
          />
          <motion.circle
            cx={b.x + b.w / 2}
            cy={b.y + b.h / 2}
            r="2.5"
            fill={accent}
            style={{ animation: reduce ? undefined : 'pulseSoft 2.4s ease-in-out infinite' }}
          />
          <text x={b.x} y={b.y - 4} fill={accent} fontSize="7" fontFamily="monospace">
            id:{i + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* -- 3. Rust poker: a dealt hand ----------------------------------------- */

function PokerArt({ accent, reduce, active }: ArtProps) {
  const spread = active ? 22 : 18
  const cards = [
    { rot: -spread, x: -34, rank: 'A', suit: '♠', color: '#ece4d3' },
    { rot: 0, x: 0, rank: 'K', suit: '♥', color: accent },
    { rot: spread, x: 34, rank: 'Q', suit: '♦', color: accent },
  ]
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* pot chip */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? undefined : 'spinSlow 9s linear infinite' }}>
        <circle cx="80" cy="34" r="11" fill="#1d1b13" stroke={accent} strokeWidth="2.5" strokeDasharray="5 5" />
        <circle cx="80" cy="34" r="4" fill={accent} />
      </g>

      <g style={{ animation: reduce ? undefined : 'floaty 6s ease-in-out infinite' }}>
        {cards.map((c, i) => (
          <motion.g
            key={i}
            initial={reduce ? false : { opacity: 0, y: 34, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: c.rot }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.13 * i, ease: EASE }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <g transform={`translate(${80 + c.x} 96)`}>
              <rect x="-23" y="-34" width="46" height="68" rx="6" fill="#211f16" stroke={accent} strokeWidth="1.5" />
              <text x="-16" y="-18" fill={c.color} fontSize="13" fontFamily="Georgia, serif" fontWeight="700">
                {c.rank}
              </text>
              <text
                x="0"
                y="8"
                fill={c.color}
                fontSize="26"
                textAnchor="middle"
                style={{ animation: reduce ? undefined : `pulseSoft ${3 + i * 0.4}s ease-in-out infinite` }}
              >
                {c.suit}
              </text>
            </g>
          </motion.g>
        ))}
      </g>
    </svg>
  )
}

/* -- 4. Secure FS: a decrypt sweep over cipher cells, behind a padlock --- */

function CryptoArt({ accent, reduce }: ArtProps) {
  const cells = Array.from({ length: 36 }, (_, k) => ({ c: k % 6, r: Math.floor(k / 6), k }))
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* cipher grid with a diagonal decrypt wave */}
      {cells.map(({ c, r, k }) => (
        <motion.rect
          key={k}
          x={18 + c * 21}
          y={18 + r * 21}
          width="14"
          height="14"
          rx="3"
          fill={accent}
          initial={{ opacity: 0.08 }}
          animate={reduce ? { opacity: 0.18 } : { opacity: [0.07, 0.55, 0.07] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: ((c + r) % 7) * 0.22 }}
        />
      ))}

      {/* scanline */}
      {!reduce && (
        <motion.rect
          x="14"
          width="132"
          height="3"
          rx="1.5"
          fill="#ffffff"
          opacity="0.18"
          initial={{ y: 16 }}
          animate={{ y: [16, 142, 16] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* halo to lift the padlock off the busy grid */}
      <circle cx="80" cy="86" r="30" fill="#14130d" opacity="0.82" />

      {/* padlock */}
      <path d="M68 80 v-9 a12 12 0 0 1 24 0 v9" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <rect x="60" y="80" width="40" height="30" rx="6" fill="#211f16" stroke={accent} strokeWidth="2.5" />
      <circle cx="80" cy="92" r="4" fill={accent} />
      <rect x="78.5" y="93" width="3" height="9" rx="1.5" fill={accent} />
    </svg>
  )
}

/* -- 5. Event lottery: a QR code, then a fair draw ----------------------- */

function LotteryArt({ accent, reduce }: ArtProps) {
  const m = 7 // module size
  const ox = 56
  const oy = 22
  // 3 finder patterns (corners) of the QR.
  const finders = [
    [0, 0],
    [4, 0],
    [0, 4],
  ]
  // Scattered data modules.
  const data = [
    [4, 4], [5, 4], [6, 4], [4, 5], [6, 5], [5, 6], [4, 6], [6, 6],
    [3, 1], [3, 3], [1, 3], [3, 5], [5, 3],
  ]
  const entrants = Array.from({ length: 8 }, (_, i) => ({ x: 30 + i * 14, i }))
  const selected = new Set([1, 4, 6])

  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* QR finders */}
      {finders.map(([fc, fr], i) => (
        <g key={`f${i}`}>
          <rect x={ox + fc * m} y={oy + fr * m} width={m * 3} height={m * 3} rx="2.5" fill="none" stroke={accent} strokeWidth="3" />
          <rect x={ox + (fc + 1) * m} y={oy + (fr + 1) * m} width={m} height={m} fill={accent} />
        </g>
      ))}
      {/* QR data modules, faintly flickering */}
      {data.map(([dc, dr], i) => (
        <motion.rect
          key={`d${i}`}
          x={ox + dc * m + 1}
          y={oy + dr * m + 1}
          width={m - 2}
          height={m - 2}
          rx="1"
          fill={accent}
          animate={reduce ? { opacity: 0.7 } : { opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: (i % 5) * 0.3 }}
        />
      ))}

      <text x="80" y="106" fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
        DRAW
      </text>

      {/* entrant waitlist — winners light up on a loop */}
      {entrants.map(({ x, i }) => {
        const win = selected.has(i)
        return (
          <g key={`e${i}`}>
            <circle cx={x} cy={124} r="6.5" fill="none" stroke={win ? accent : '#4a4530'} strokeWidth="2" />
            {win && (
              <motion.circle
                cx={x}
                cy={124}
                r="4"
                fill={accent}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 1, 0], scale: [0.5, 1.25, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 + i * 0.25 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* -- 6. Fuzzy/GA asteroid: lead-angle intercept -------------------------- */

function AsteroidArt({ accent, reduce }: ArtProps) {
  const xs = [12, 56, 104, 150]
  const op = [0, 1, 1, 0]
  const drift = { duration: 6.5, repeat: Infinity, ease: 'linear' as const }
  const targetY = 40

  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* decorative drifting asteroids */}
      {[
        { y: 26, dur: 9, delay: 0, r: 6 },
        { y: 70, dur: 7.5, delay: 2, r: 8 },
      ].map((d, i) => (
        <motion.polygon
          key={i}
          points="-7,-3 -2,-7 5,-5 7,2 2,7 -5,6"
          fill="none"
          stroke="#6c6650"
          strokeWidth="1.5"
          initial={{ x: -12, y: d.y, opacity: 0 }}
          animate={reduce ? { x: 90, opacity: 0.6 } : { x: [-12, 172], opacity: [0, 0.7, 0.7, 0] }}
          transition={reduce ? undefined : { duration: d.dur, repeat: Infinity, ease: 'linear', delay: d.delay }}
        />
      ))}

      {/* lead-intercept line ship -> predicted point */}
      <motion.line
        x1="80"
        y1="104"
        x2={reduce ? 118 : 56}
        y2={reduce ? targetY : targetY}
        stroke={accent}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        animate={reduce ? undefined : { x2: xs.map((v) => v + 12), opacity: op }}
        transition={reduce ? undefined : drift}
      />

      {/* target asteroid */}
      <motion.g
        initial={{ x: xs[0], opacity: 0 }}
        animate={reduce ? { x: 104, opacity: 1 } : { x: xs, opacity: op }}
        transition={reduce ? undefined : drift}
      >
        <polygon points={`-9,${targetY - 4} -3,${targetY - 9} 6,${targetY - 6} 9,${targetY + 2} 3,${targetY + 8} -6,${targetY + 7}`} fill="#2a2718" stroke={accent} strokeWidth="1.5" />
      </motion.g>

      {/* reticle locked on target (outer g tracks x; inner g spins in place) */}
      <motion.g
        initial={{ x: xs[0], opacity: 0 }}
        animate={reduce ? { x: 104, opacity: 1 } : { x: xs, opacity: op }}
        transition={reduce ? undefined : drift}
      >
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? undefined : 'spinSlow 5s linear infinite' }}>
          <circle cx="0" cy={targetY} r="14" fill="none" stroke={accent} strokeWidth="1" opacity="0.8" />
          <path d={`M0,${targetY - 18} v6 M0,${targetY + 12} v6 M-18,${targetY} h6 M12,${targetY} h6`} stroke={accent} strokeWidth="1.5" />
        </g>
      </motion.g>

      {/* bullet */}
      {!reduce && (
        <motion.circle
          r="2.4"
          fill="#ece4d3"
          initial={{ cx: 80, cy: 100, opacity: 0 }}
          animate={{ cx: [80, 116], cy: [100, targetY + 6], opacity: [0, 0, 1, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeIn' }}
        />
      )}

      {/* ship */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={reduce ? undefined : { rotate: [-7, 7, -7] }}
        transition={reduce ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="80,94 71,114 80,108 89,114" fill={accent} stroke="#ece4d3" strokeWidth="1" />
      </motion.g>
    </svg>
  )
}

/* -- 7. Voice fan: mic -> equalizer -> spinning fan ---------------------- */

function VoiceArt({ accent, reduce }: ArtProps) {
  const bars = Array.from({ length: 9 }, (_, i) => i)
  const blades = [0, 120, 240]
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* mic */}
      <g stroke={accent} strokeWidth="2" fill="none">
        <rect x="20" y="58" width="12" height="26" rx="6" fill="#211f16" />
        <path d="M16 78 a10 10 0 0 0 20 0" />
        <line x1="26" y1="88" x2="26" y2="98" />
        <line x1="20" y1="98" x2="32" y2="98" />
      </g>

      {/* equalizer / mel bars */}
      {bars.map((i) => {
        const peak = [0.45, 0.8, 0.35, 1, 0.6, 0.9, 0.4, 0.75, 0.5][i]
        return (
          <motion.rect
            key={i}
            x={46 + i * 7}
            y="58"
            width="4.5"
            height="42"
            rx="2"
            fill={accent}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
            initial={{ scaleY: 0.2 }}
            animate={reduce ? { scaleY: peak } : { scaleY: [0.15, peak, 0.3, peak * 0.7, 0.2] }}
            transition={reduce ? undefined : { duration: 1.4 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
          />
        )
      })}

      {/* "yes" detection chip */}
      <motion.g
        animate={reduce ? { opacity: 1 } : { opacity: [0.2, 1, 1, 0.2] }}
        transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.6, 1] }}
      >
        <rect x="60" y="24" width="40" height="18" rx="9" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="80" y="37" fill={accent} fontSize="11" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
          yes
        </text>
      </motion.g>

      {/* fan */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? undefined : 'spinSlow 2.4s linear infinite' }}>
        {blades.map((b) => (
          <ellipse key={b} cx="122" cy="108" rx="5" ry="15" fill={accent} opacity="0.85" transform={`rotate(${b} 122 108)`} />
        ))}
      </g>
      <circle cx="122" cy="108" r="4" fill="#ece4d3" />
    </svg>
  )
}

/* -- 8. MongoDB CLI: documents dropping into a store --------------------- */

function DatabaseArt({ accent, reduce }: ArtProps) {
  const docs = [
    { x: 64, delay: 0 },
    { x: 80, delay: 1 },
    { x: 96, delay: 2 },
  ]
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* falling JSON documents */}
      {docs.map((d, i) => (
        <motion.g
          key={i}
          initial={{ y: -54, opacity: 0 }}
          animate={reduce ? { y: 0, opacity: 1 } : { y: [-54, 0, 0], opacity: [0, 1, 0] }}
          transition={reduce ? undefined : { duration: 3, repeat: Infinity, ease: 'easeIn', delay: d.delay, times: [0, 0.55, 1] }}
        >
          <rect x={d.x - 8} y="40" width="16" height="20" rx="2.5" fill="#211f16" stroke={accent} strokeWidth="1.5" />
          <text x={d.x} y="53" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {'{}'}
          </text>
        </motion.g>
      ))}

      {/* database cylinder */}
      <g stroke={accent} fill="none" strokeWidth="2">
        <path d="M50 74 v34 a30 9 0 0 0 60 0 v-34" fill="#1d1b13" />
        <ellipse cx="80" cy="74" rx="30" ry="9" fill="#211f16" />
        <path d="M50 90 a30 9 0 0 0 60 0" opacity="0.5" />
        <path d="M50 100 a30 9 0 0 0 60 0" opacity="0.35" />
      </g>

      {/* terminal prompt */}
      <text x="40" y="140" fill={accent} fontSize="11" fontFamily="monospace">
        &gt;
      </text>
      <text x="52" y="140" fill="#a89c80" fontSize="10" fontFamily="monospace">
        find()
      </text>
      <rect
        x="92"
        y="131"
        width="6"
        height="11"
        fill={accent}
        style={{ animation: reduce ? undefined : 'blink 1s step-end infinite' }}
      />
    </svg>
  )
}

/* -- 9. DC motor: WS2812 tachometer ring + spinning rotor ---------------- */

function MotorArt({ accent, reduce, active }: ArtProps) {
  const leds = ringPoints(80, 80, 52)
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      <circle cx="80" cy="80" r="52" fill="none" stroke="#ffffff10" strokeWidth="2" />

      {/* 12 LEDs, green -> red, chasing like a rev sweep */}
      {leds.map(({ x, y, i }) => {
        const hue = 130 - (130 / 11) * i
        const color = `hsl(${hue} 68% 55%)`
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="6"
            fill={color}
            initial={{ opacity: 0.14 }}
            animate={reduce ? { opacity: i < 7 ? 0.95 : 0.18 } : { opacity: [0.14, 1, 0.14] }}
            transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.13 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )
      })}

      {/* spinning rotor */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? undefined : `spinSlow ${active ? 1.1 : 1.8}s linear infinite` }}>
        {[0, 90].map((r) => (
          <rect key={r} x="78" y="58" width="4" height="44" rx="2" fill={accent} transform={`rotate(${r} 80 80)`} />
        ))}
      </g>
      <circle cx="80" cy="80" r="8" fill="#211f16" stroke={accent} strokeWidth="2" />
    </svg>
  )
}

/* -- 10. Russian roulette: breathing ring + spinning chamber ------------- */

function RouletteArt({ accent, reduce, active }: ArtProps) {
  const leds = ringPoints(80, 80, 54)
  const chambers = ringPoints(80, 80, 30, 6)
  const zap = 0
  return (
    <svg viewBox="0 0 160 160" className={svgClass}>
      {/* outer 12-LED ring, idle breathe (blue) */}
      {leds.map(({ x, y, i }) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="4.5"
          fill="#6f86c7"
          animate={reduce ? { opacity: 0.4 } : { opacity: [0.15, 0.55, 0.15] }}
          transition={reduce ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
        />
      ))}

      {/* 6 chambers */}
      {chambers.map(({ x, y, i }) =>
        i === zap ? (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="7"
            fill={accent}
            stroke={accent}
            strokeWidth="2"
            animate={reduce ? { opacity: 0.9 } : { opacity: [0.3, 1, 0.3] }}
            transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <circle key={i} cx={x} cy={y} r="7" fill="#1d1b13" stroke="#4a4530" strokeWidth="2" />
        ),
      )}

      {/* spinning selector pointing at the current chamber (pivots on ring center) */}
      <g style={{ transformBox: 'view-box', transformOrigin: '80px 80px', animation: reduce ? undefined : `spinSlow ${active ? 1.6 : 2.6}s linear infinite` }}>
        <circle cx="80" cy="50" r="9" fill="none" stroke="#ece4d3" strokeWidth="2.5" />
        <line x1="80" y1="80" x2="80" y2="59" stroke="#ece4d3" strokeWidth="2" opacity="0.6" />
      </g>

      {/* center knob */}
      <circle cx="80" cy="80" r="9" fill="#211f16" stroke={accent} strokeWidth="2" />
      <rect x="79" y="73" width="2" height="7" rx="1" fill={accent} />
    </svg>
  )
}

/* -- registry ------------------------------------------------------------ */

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
