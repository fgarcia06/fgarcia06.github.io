import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import type { ComponentType } from 'react'
import type { Project, VisualKind } from '../../data/projects'
import { CrossGrid, CornerTicks } from '../ui/Texture'

type Px = MotionValue<number>
type ArtProps = { accent: string; reduce: boolean; active: boolean }

export function WorkVisual({
  project,
  px,
  py,
  active = false,
  bare = false,
}: {
  project: Project
  px: Px
  py: Px
  active?: boolean
  bare?: boolean
}) {
  const reduce = useReducedMotion()
  const a = project.accent
  const Art = ART[project.visual]

  const blobX = useTransform(px, [-0.5, 0.5], [28, -28])
  const blobY = useTransform(py, [-0.5, 0.5], [20, -20])
  const artX  = useTransform(px, [-0.5, 0.5], [-18, 18])
  const artY  = useTransform(py, [-0.5, 0.5], [-14, 14])

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${bare ? '' : 'rounded-2xl border border-border'}`}
      style={{ backgroundColor: '#15140d' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: a, opacity: 0.05 }} />
      <CrossGrid color={a} opacity={0.1} gap={22} />

      {/* Dual ambient glows — left + right for full-width coverage */}
      <motion.div className="absolute inset-0" style={{ x: blobX, y: blobY }}>
        <div
          className="absolute -left-10 top-4 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `${a}40`, animation: reduce ? undefined : 'drift 16s ease-in-out infinite' }}
        />
        <div
          className="absolute -right-10 bottom-4 h-48 w-48 rounded-full blur-3xl"
          style={{ background: `${a}28`, animation: reduce ? undefined : 'drift 20s ease-in-out infinite reverse' }}
        />
      </motion.div>

      {/* Landscape SVG art — fills the full card */}
      <motion.div className="absolute inset-0" style={{ x: artX, y: artY }}>
        <Art accent={a} reduce={!!reduce} active={active} />
      </motion.div>

      {/* Scanline */}
      {!reduce && (
        <div
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{
            backgroundColor: `${a}66`,
            boxShadow: `0 0 12px ${a}aa`,
            animation: `sweep ${active ? 2.5 : 5}s ease-in-out infinite`,
          }}
        />
      )}

      <CornerTicks color={`${a}55`} length={9} margin={7} />
    </div>
  )
}

/* ── Shared constants ─────────────────────────────────────────────────────── */

const svgClass = 'h-full w-full'
const EASE = [0.22, 1, 0.36, 1] as const

function ringPts(cx: number, cy: number, r: number, n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), i }
  })
}

/* ── 1. FitnessArt — panoramic activity rings with stat panels ────────────── */

function FitnessArt({ accent, reduce, active }: ArtProps) {
  const rings = [
    { r: 98,  color: accent,    fill: active ? 0.88 : 0.72 },
    { r: 76,  color: '#ece4d3', fill: active ? 0.65 : 0.50 },
    { r: 54,  color: '#9caa7b', fill: active ? 0.78 : 0.65 },
  ]
  return (
    <svg viewBox="0 0 480 270" className={svgClass}
      style={{ animation: reduce ? undefined : 'spinSlow 40s linear infinite' }}>
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.r
        return (
          <g key={i}>
            <circle cx="240" cy="135" r={ring.r} fill="none" stroke="#ffffff10" strokeWidth="11" />
            <motion.circle
              cx="240" cy="135" r={ring.r}
              fill="none" stroke={ring.color} strokeWidth="11" strokeLinecap="round"
              strokeDasharray={circ}
              transform="rotate(-90 240 135)"
              initial={{ strokeDashoffset: circ }}
              whileInView={{ strokeDashoffset: circ * (1 - ring.fill) }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.15 * i }}
            />
          </g>
        )
      })}
      {/* Left stat panel */}
      <text x="82" y="116" fill={accent} fontSize="30" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.9">720</text>
      <text x="82" y="132" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.55">KCAL</text>
      <text x="82" y="157" fill="#ece4d3" fontSize="22" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.72">42</text>
      <text x="82" y="172" fill="#ece4d3" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.45">MIN</text>
      {/* Right stat panel */}
      <text x="398" y="116" fill="#9caa7b" fontSize="28" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.85">75%</text>
      <text x="398" y="132" fill="#9caa7b" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.5">GOAL</text>
      <text x="398" y="157" fill={accent} fontSize="22" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.7">8.2k</text>
      <text x="398" y="172" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.45">STEPS</text>
    </svg>
  )
}

/* ── 2. TrackingArt — four drifting bounding boxes across the scene ────────── */

function TrackingArt({ accent, reduce, active }: ArtProps) {
  const boxes = [
    { cx: 80,  cy: 85,  w: 72, h: 52, delay: 0,   conf: '94%', id: '01' },
    { cx: 200, cy: 158, w: 62, h: 48, delay: 0.5, conf: '87%', id: '02' },
    { cx: 315, cy: 88,  w: 70, h: 54, delay: 1.0, conf: '96%', id: '03' },
    { cx: 420, cy: 162, w: 58, h: 44, delay: 1.5, conf: '79%', id: '04' },
  ]
  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      <rect x="8" y="8" width="464" height="254" rx="8" fill="none" stroke="#ffffff14" />
      {/* Tracking path */}
      {!reduce && (
        <motion.path
          d={`M ${boxes.map(b => `${b.cx},${b.cy}`).join(' L ')}`}
          fill="none" stroke={`${accent}40`} strokeWidth="1.5" strokeDasharray="5 5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
        />
      )}
      {boxes.map((b, i) => (
        <motion.g
          key={i}
          animate={reduce ? undefined : { x: [0, 9, 0], y: [0, -6, 0] }}
          transition={{ duration: active ? 2.5 : 4.5, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        >
          <rect x={b.cx - b.w / 2} y={b.cy - b.h / 2} width={b.w} height={b.h} rx="3" fill="none" stroke={accent} strokeWidth="2" />
          {/* Corner ticks */}
          <path d={`M${b.cx-b.w/2},${b.cy-b.h/2+8} v-8 h8 M${b.cx+b.w/2-8},${b.cy-b.h/2} h8 v8`} fill="none" stroke={accent} strokeWidth="2.5" />
          <path d={`M${b.cx-b.w/2},${b.cy+b.h/2-8} v8 h8 M${b.cx+b.w/2-8},${b.cy+b.h/2} h8 v-8`} fill="none" stroke={accent} strokeWidth="2.5" />
          <motion.circle cx={b.cx} cy={b.cy} r="3" fill={accent}
            style={{ animation: reduce ? undefined : 'pulseSoft 2.4s ease-in-out infinite' }} />
          <text x={b.cx - b.w / 2} y={b.cy - b.h / 2 - 5} fill={accent} fontSize="10" fontFamily="monospace">{b.conf}</text>
          <text x={b.cx + b.w / 2} y={b.cy - b.h / 2 - 5} fill="#a89c80" fontSize="9" fontFamily="monospace" textAnchor="end">ID:{b.id}</text>
        </motion.g>
      ))}
      {/* Status bar */}
      <text x="240" y="248" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="3" opacity="0.5">TRACKING · 4 OBJECTS · ACTIVE</text>
    </svg>
  )
}

/* ── 3. PokerArt — full poker table view ────────────────────────────────────── */

function PokerArt({ accent, reduce, active: _active }: ArtProps) {
  const commCards = [
    { x: 108, rank: 'A', suit: '♠', color: '#ece4d3' },
    { x: 157, rank: 'K', suit: '♥', color: accent },
    { x: 206, rank: 'Q', suit: '♦', color: accent },
    { x: 255, rank: 'J', suit: '♣', color: '#ece4d3' },
    { x: 304, rank: '10', suit: '♠', color: '#ece4d3' },
  ]
  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* Table felt */}
      <ellipse cx="240" cy="250" rx="240" ry="108" fill="#1a1812" stroke="#3d3820" strokeWidth="2" />
      <ellipse cx="240" cy="250" rx="222" ry="95" fill="none" stroke="#3d3820" strokeWidth="1" opacity="0.5" />

      {/* Pot display */}
      <text x="240" y="34" fill="#a89c80" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.7">POT</text>
      <text x="240" y="54" fill={accent} fontSize="20" fontFamily="monospace" textAnchor="middle" fontWeight="bold">$1,240</text>

      {/* Spinning chip */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? undefined : 'spinSlow 9s linear infinite' }}>
        <circle cx="240" cy="76" r="14" fill="#1d1b13" stroke={accent} strokeWidth="2.5" strokeDasharray="5 5" />
        <circle cx="240" cy="76" r="5" fill={accent} />
      </g>

      {/* Community cards */}
      <g style={{ animation: reduce ? undefined : 'floaty 6s ease-in-out infinite' }}>
        {commCards.map((c, i) => (
          <motion.g
            key={i}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 * i, ease: EASE }}
          >
            <rect x={c.x} y="100" width="41" height="60" rx="5" fill="#211f16" stroke={accent} strokeWidth="1.5" />
            <text x={c.x + 6} y="118" fill={c.color} fontSize="14" fontFamily="Georgia,serif" fontWeight="700">{c.rank}</text>
            <text x={c.x + 20} y="141" fill={c.color} fontSize="24" textAnchor="middle">{c.suit}</text>
          </motion.g>
        ))}
      </g>

      {/* Hole cards (face down, right) */}
      <rect x="360" y="180" width="41" height="60" rx="5" fill="#1a1812" stroke={`${accent}55`} strokeWidth="1.5" />
      <rect x="382" y="174" width="41" height="60" rx="5" fill="#211f16" stroke={`${accent}88`} strokeWidth="1.5" />
      <line x1="384" y1="176" x2="421" y2="232" stroke={`${accent}33`} strokeWidth="1" />
      <line x1="421" y1="176" x2="384" y2="232" stroke={`${accent}33`} strokeWidth="1" />

      {/* Chip stacks (left) */}
      {[0, 7, 14, 21, 28].map((off) => (
        <ellipse key={off} cx="72" cy={195 - off} rx="22" ry="7" fill="#2a2718" stroke={accent} strokeWidth="1.5" />
      ))}
      <rect x="50" y="143" width="44" height="52" fill="#2a2718" />
      {[0, 7, 14].map((off) => (
        <ellipse key={off} cx="110" cy={200 - off} rx="20" ry="6" fill="#2a2718" stroke={`${accent}88`} strokeWidth="1.5" />
      ))}
      <rect x="90" y="158" width="40" height="42" fill="#2a2718" />
      <text x="90" y="224" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.65">$860</text>
    </svg>
  )
}

/* ── 4. CryptoArt — full-width cipher grid + padlock ─────────────────────── */

function CryptoArt({ accent, reduce, active: _active }: ArtProps) {
  const cols = 22
  const rows = 11
  const cw = 19
  const ch = 19
  const ox = 14
  const oy = 16
  const cells = Array.from({ length: cols * rows }, (_, k) => ({
    c: k % cols, r: Math.floor(k / cols), k,
  }))
  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {cells.map(({ c, r, k }) => (
        <motion.rect
          key={k}
          x={ox + c * (cw + 2)}
          y={oy + r * (ch + 2)}
          width={cw} height={ch} rx="3"
          fill={accent}
          initial={{ opacity: 0.07 }}
          animate={reduce ? { opacity: 0.18 } : { opacity: [0.06, 0.50, 0.06] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: ((c + r) % 8) * 0.18 }}
        />
      ))}

      {/* Full-width scanline */}
      {!reduce && (
        <motion.rect
          x={ox} width={cols * (cw + 2) - 2} height="3" rx="1.5"
          fill="#ffffff" opacity="0.18"
          initial={{ y: oy }}
          animate={{ y: [oy, oy + rows * (ch + 2) - 4, oy] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Padlock halo + padlock centered */}
      <circle cx="240" cy="135" r="34" fill="#14130d" opacity="0.85" />
      <path d="M226 129 v-10 a14 14 0 0 1 28 0 v10" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <rect x="216" y="129" width="48" height="36" rx="7" fill="#211f16" stroke={accent} strokeWidth="2.5" />
      <circle cx="240" cy="144" r="5" fill={accent} />
      <rect x="238.5" y="145.5" width="3" height="10" rx="1.5" fill={accent} />
    </svg>
  )
}

/* ── 5. LotteryArt — QR scanner left, live draw right ───────────────────── */

function LotteryArt({ accent, reduce }: ArtProps) {
  const m = 8
  const ox = 36
  const oy = 28
  const finders = [[0, 0], [4, 0], [0, 4]]
  const data = [
    [4, 4],[5, 4],[6, 4],[4, 5],[6, 5],[5, 6],[4, 6],[6, 6],
    [3, 1],[3, 3],[1, 3],[3, 5],[5, 3],[6, 2],[2, 6],
  ]
  const drumBalls = Array.from({ length: 6 }, (_, i) => ({ angle: (i / 6) * Math.PI * 2 }))
  const winners = [1, 3, 5]
  const entrants = Array.from({ length: 10 }, (_, i) => ({ x: 36 + i * 38, i }))

  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* QR code (left side) */}
      {finders.map(([fc, fr], i) => (
        <g key={`f${i}`}>
          <rect x={ox + fc * m} y={oy + fr * m} width={m * 3} height={m * 3} rx="2.5" fill="none" stroke={accent} strokeWidth="3" />
          <rect x={ox + (fc + 1) * m} y={oy + (fr + 1) * m} width={m} height={m} fill={accent} />
        </g>
      ))}
      {data.map(([dc, dr], i) => (
        <motion.rect
          key={`d${i}`}
          x={ox + dc * m + 1} y={oy + dr * m + 1} width={m - 2} height={m - 2} rx="1"
          fill={accent}
          animate={reduce ? { opacity: 0.7 } : { opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: (i % 5) * 0.3 }}
        />
      ))}
      <text x={ox + 28} y={oy + 7 * m + 16} fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="1">SCAN TO ENTER</text>

      {/* Divider */}
      <line x1="175" y1="20" x2="175" y2="175" stroke="#3a3520" strokeWidth="1" />

      {/* Lottery drum (right side) */}
      <ellipse cx="330" cy="100" rx="72" ry="72" fill="none" stroke={`${accent}40`} strokeWidth="1.5" />
      <ellipse cx="330" cy="100" rx="56" ry="56" fill="#1d1b13" stroke={`${accent}60`} strokeWidth="2" />
      <g style={{ transformBox: 'fill-box', transformOrigin: '330px 100px', animation: reduce ? undefined : 'spinSlow 8s linear infinite' }}>
        {drumBalls.map((b, i) => {
          const x = 330 + 40 * Math.cos(b.angle)
          const y = 100 + 40 * Math.sin(b.angle)
          return (
            <motion.circle key={i} cx={x} cy={y} r="9"
              fill="#2a2718" stroke={accent} strokeWidth="1.5"
              animate={reduce ? { opacity: 0.8 } : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          )
        })}
      </g>
      <text x="330" y="104" fill={accent} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LIVE</text>

      {/* Countdown */}
      <text x="420" y="60" fill="#a89c80" fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="1" opacity="0.7">DRAW IN</text>
      <text x="420" y="80" fill={accent} fontSize="18" fontFamily="monospace" textAnchor="middle" fontWeight="bold">3:24</text>

      {/* Entrant circles (bottom) */}
      <text x="240" y="188" fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.6">ENTRIES</text>
      {entrants.map(({ x, i }) => {
        const win = winners.includes(i)
        return (
          <g key={`e${i}`}>
            <circle cx={x} cy="210" r="9" fill="none" stroke={win ? accent : '#4a4530'} strokeWidth="2" />
            {win && (
              <motion.circle cx={x} cy="210" r="5.5" fill={accent}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 1, 0], scale: [0.5, 1.25, 1, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 + i * 0.2 }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            )}
          </g>
        )
      })}
      <text x="240" y="234" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="1" opacity="0.55">3 WINNERS · FAIR DRAW</text>
    </svg>
  )
}

/* ── 6. AsteroidArt — wide space interception scene ─────────────────────── */

function AsteroidArt({ accent, reduce }: ArtProps) {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    x: 10 + (i * 16.7) % 460,
    y: 5 + (i * 9.3) % 260,
    r: 0.8 + (i % 3) * 0.5,
  }))
  const asteroids = [
    { y: 52, dur: 9,   delay: 0, r: 7,  cx: -14 },
    { y: 118, dur: 7.5, delay: 2, r: 9,  cx: -14 },
    { y: 76, dur: 11,  delay: 4.5, r: 5, cx: -14 },
  ]
  const targetY = 52
  const xs = [20, 100, 200, 340, 460]
  const op = [0, 1, 1, 1, 0]

  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* Stars */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity="0.3" />
      ))}

      {/* Drifting asteroids */}
      {asteroids.map((a, i) => (
        <motion.g key={i}
          initial={{ x: a.cx, opacity: 0 }}
          animate={reduce ? { x: 240, opacity: 0.6 } : { x: [-14, 494], opacity: [0, 0.7, 0.7, 0] }}
          transition={reduce ? undefined : { duration: a.dur, repeat: Infinity, ease: 'linear', delay: a.delay }}
        >
          <polygon points="-8,-4 -2,-8 6,-5 8,2 2,8 -6,7" fill="#2a2718" stroke="#6c6650" strokeWidth="1.5"
            transform={`translate(0 ${a.y})`} />
        </motion.g>
      ))}

      {/* Lead-intercept trajectory */}
      <motion.line
        x1="240" y1="210" x2="56" y2={targetY}
        stroke={accent} strokeWidth="1.5" strokeDasharray="5 5"
        animate={reduce ? undefined : { x2: xs, opacity: op }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      />

      {/* Reticle tracking the target */}
      <motion.g
        initial={{ x: xs[0], opacity: 0 }}
        animate={reduce ? { x: 340, opacity: 1 } : { x: xs, opacity: op }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      >
        <g style={{ transformBox: 'fill-box', transformOrigin: `0px ${targetY}px`, animation: reduce ? undefined : 'spinSlow 5s linear infinite' }}>
          <circle cx="0" cy={targetY} r="18" fill="none" stroke={accent} strokeWidth="1" opacity="0.8" />
          <circle cx="0" cy={targetY} r="5" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6" />
          <path d={`M0,${targetY - 22} v8 M0,${targetY + 14} v8 M-22,${targetY} h8 M14,${targetY} h8`} stroke={accent} strokeWidth="1.5" />
        </g>
        <polygon points="-9,-4 -3,-9 6,-6 9,2 3,8 -6,7" fill="#2a2718" stroke={accent} strokeWidth="1.5"
          transform={`translate(0 ${targetY})`} />
      </motion.g>

      {/* Bullet */}
      {!reduce && (
        <motion.circle r="2.5" fill="#ece4d3"
          initial={{ cx: 240, cy: 208, opacity: 0 }}
          animate={{ cx: [240, 340], cy: [208, targetY + 4], opacity: [0, 0, 1, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeIn' }}
        />
      )}

      {/* Ship */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: '240px 210px' }}
        animate={reduce ? undefined : { rotate: [-8, 8, -8] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="240,198 229,222 240,216 251,222" fill={accent} stroke="#ece4d3" strokeWidth="1" />
      </motion.g>

      {/* Range display */}
      <text x="54" y="246" fill={accent} fontSize="9" fontFamily="monospace" opacity="0.6" letterSpacing="1">INTERCEPT: LEAD-ANGLE GA</text>
    </svg>
  )
}

/* ── 7. VoiceArt — full-width mic → EQ bars → fan ───────────────────────── */

function VoiceArt({ accent, reduce }: ArtProps) {
  const bars = Array.from({ length: 20 }, (_, i) => i)
  const peaks = [0.4,0.75,0.35,0.9,0.55,0.85,0.45,1,0.6,0.8,0.5,0.95,0.4,0.7,0.35,0.85,0.55,0.65,0.45,0.8]
  const blades = [0, 120, 240]

  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* Mic */}
      <g stroke={accent} strokeWidth="2" fill="none">
        <rect x="32" y="90" width="16" height="42" rx="8" fill="#211f16" />
        <path d="M26 120 a14 14 0 0 0 28 0" />
        <line x1="40" y1="134" x2="40" y2="148" />
        <line x1="32" y1="148" x2="48" y2="148" />
      </g>

      {/* Waveform ripples */}
      {[22, 36, 50].map((r, i) => (
        <motion.path key={i}
          d={`M40,${135 - r * 0.4} q${r * 0.4},0 0,${r * 0.8}`}
          fill="none" stroke={accent} strokeWidth="1.5" opacity="0.3"
          animate={reduce ? undefined : { opacity: [0.08, 0.4, 0.08], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          style={{ transformBox: 'fill-box', transformOrigin: '40px 135px' }}
        />
      ))}

      {/* "YES" detection chip */}
      <motion.g
        animate={reduce ? { opacity: 1 } : { opacity: [0.25, 1, 1, 0.25] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.6, 1] }}
      >
        <rect x="192" y="28" width="52" height="22" rx="11" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="218" y="43" fill={accent} fontSize="12" fontFamily="monospace" textAnchor="middle" letterSpacing="1">yes</text>
      </motion.g>

      {/* 20 EQ bars */}
      {bars.map((i) => {
        const bx = 94 + i * 15
        return (
          <motion.rect key={i} x={bx} y="90" width="10" height="82" rx="3"
            fill={accent}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
            initial={{ scaleY: 0.2 }}
            animate={reduce ? { scaleY: peaks[i] } : { scaleY: [0.12, peaks[i], 0.25, peaks[i] * 0.7, 0.15] }}
            transition={reduce ? undefined : { duration: 1.3 + (i % 4) * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
          />
        )
      })}

      {/* Frequency label */}
      <text x="218" y="192" fill={accent} fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.45">MEL SPECTROGRAM</text>

      {/* Fan (spinning) */}
      <g style={{ transformBox: 'fill-box', transformOrigin: '440px 135px', animation: reduce ? undefined : 'spinSlow 2.2s linear infinite' }}>
        {blades.map((b) => (
          <ellipse key={b} cx="440" cy="135" rx="7" ry="22" fill={accent} opacity="0.85" transform={`rotate(${b} 440 135)`} />
        ))}
      </g>
      <circle cx="440" cy="135" r="5" fill="#ece4d3" />
    </svg>
  )
}

/* ── 8. DatabaseArt — wide terminal + multiple document streams ──────────── */

function DatabaseArt({ accent, reduce }: ArtProps) {
  const streams = [
    { x: 155, delay: 0 },
    { x: 215, delay: 1 },
    { x: 275, delay: 2 },
    { x: 335, delay: 0.5 },
  ]
  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* Falling documents */}
      {streams.map((s, i) => (
        <motion.g key={i}
          initial={{ y: -60, opacity: 0 }}
          animate={reduce ? { y: 0, opacity: 1 } : { y: [-60, 10, 10], opacity: [0, 1, 0] }}
          transition={reduce ? undefined : { duration: 3, repeat: Infinity, ease: 'easeIn', delay: s.delay, times: [0, 0.55, 1] }}
        >
          <rect x={s.x - 12} y="44" width="24" height="30" rx="3" fill="#211f16" stroke={accent} strokeWidth="1.5" />
          <text x={s.x} y="63" fill={accent} fontSize="10" fontFamily="monospace" textAnchor="middle">{'{}'}</text>
          {/* Index connector */}
          <line x1={s.x} y1="74" x2={s.x} y2="95" stroke={`${accent}50`} strokeWidth="1" strokeDasharray="3 3" />
        </motion.g>
      ))}

      {/* Main cylinder */}
      <g stroke={accent} fill="none" strokeWidth="2">
        <path d="M175 110 v58 a65 14 0 0 0 130 0 v-58" fill="#1d1b13" />
        <ellipse cx="240" cy="110" rx="65" ry="14" fill="#211f16" />
        <path d="M175 133 a65 14 0 0 0 130 0" opacity="0.45" />
        <path d="M175 150 a65 14 0 0 0 130 0" opacity="0.3" />
      </g>

      {/* Left index label */}
      <text x="80" y="120" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.6" letterSpacing="1">INDEXED</text>
      <text x="80" y="136" fill={accent} fontSize="20" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.8">4.2M</text>
      <text x="80" y="150" fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.5">documents</text>

      {/* Right query label */}
      <text x="400" y="120" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.6" letterSpacing="1">LATENCY</text>
      <text x="400" y="136" fill={accent} fontSize="20" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.8">4ms</text>
      <text x="400" y="150" fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.5">avg query</text>

      {/* Wide terminal */}
      <rect x="16" y="218" width="448" height="38" rx="5" fill="#0f0e09" stroke="#3a3520" strokeWidth="1.5" />
      <text x="30" y="241" fill={accent} fontSize="12" fontFamily="monospace">&gt;</text>
      <text x="46" y="241" fill="#a89c80" fontSize="11" fontFamily="monospace">db.collection.find({'{ status: "active" }'})</text>
      <rect x="326" y="231" width="7" height="13" rx="1" fill={accent}
        style={{ animation: reduce ? undefined : 'blink 1s step-end infinite' }} />
    </svg>
  )
}

/* ── 9. MotorArt — PWM waveform + LED ring + RPM gauge ───────────────────── */

function MotorArt({ accent, reduce, active }: ArtProps) {
  const leds = ringPts(240, 135, 88)
  const pwmPoints = [20,65,20,65,20,65,20,65,20].map((y, i) => `${40 + i * 14},${y}`).join(' ')

  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* PWM waveform (left panel) */}
      <text x="80" y="35" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="1" opacity="0.6">PWM DUTY</text>
      <text x="80" y="56" fill={accent} fontSize="22" fontFamily="monospace" textAnchor="middle" fontWeight="bold">78%</text>
      <polyline points={pwmPoints} fill="none" stroke={accent} strokeWidth="2" opacity="0.7"
        style={{ transform: 'translate(0, 65px)' }} />
      <text x="80" y="165" fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.5" letterSpacing="1">SIGNAL</text>
      <motion.rect x="40" y="135" width="2" height={30} fill={accent} opacity="0.9"
        animate={reduce ? undefined : { x: [40, 160, 40] }}
        transition={{ duration: active ? 1 : 1.6, repeat: Infinity, ease: 'linear' }}
      />

      {/* LED ring */}
      <circle cx="240" cy="135" r="88" fill="none" stroke="#ffffff08" strokeWidth="2" />
      {leds.map(({ x, y, i }) => {
        const hue = 128 - (128 / 11) * i
        const color = `hsl(${hue} 68% 55%)`
        return (
          <motion.circle key={i} cx={x} cy={y} r="7.5" fill={color}
            initial={{ opacity: 0.14 }}
            animate={reduce ? { opacity: i < 8 ? 0.95 : 0.18 } : { opacity: [0.14, 1, 0.14] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
          />
        )
      })}

      {/* Spinning rotor */}
      <g style={{ transformBox: 'fill-box', transformOrigin: '240px 135px', animation: reduce ? undefined : `spinSlow ${active ? 1 : 1.8}s linear infinite` }}>
        {[0, 90].map((r) => (
          <rect key={r} x="238" y="92" width="4" height="86" rx="2" fill={accent} transform={`rotate(${r} 240 135)`} />
        ))}
      </g>
      <circle cx="240" cy="135" r="10" fill="#211f16" stroke={accent} strokeWidth="2" />

      {/* RPM gauge (right panel) */}
      <text x="400" y="35" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="1" opacity="0.6">SPEED</text>
      <text x="400" y="56" fill={accent} fontSize="22" fontFamily="monospace" textAnchor="middle" fontWeight="bold">1840</text>
      <text x="400" y="72" fill="#a89c80" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.5">RPM</text>
      {/* Semicircle gauge */}
      <path d="M358 150 a42 42 0 0 1 84 0" fill="none" stroke="#ffffff12" strokeWidth="8" />
      <motion.path d="M358 150 a42 42 0 0 1 84 0" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round"
        strokeDasharray="132"
        initial={{ strokeDashoffset: 132 }}
        animate={{ strokeDashoffset: 132 * (active ? 0.15 : 0.32) }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <text x="400" y="165" fill="#a89c80" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.5" letterSpacing="1">TACHOMETER</text>
    </svg>
  )
}

/* ── 10. RouletteArt — gun barrel + spinning cylinder + trajectory ─────────── */

function RouletteArt({ accent, reduce, active }: ArtProps) {
  const outerLeds = ringPts(240, 135, 88)
  const chambers  = ringPts(240, 135, 42, 6)
  const zap = 0

  return (
    <svg viewBox="0 0 480 270" className={svgClass}>
      {/* Gun barrel silhouette (left → cylinder) */}
      <path d="M20 122 h180 v-6 h6 v-6 h8 v34 h-8 v-6 h-6 v-6 H20 z"
        fill="#1e1c14" stroke="#5a5535" strokeWidth="1.5" />
      <line x1="20" y1="135" x2="182" y2="135" stroke={`${accent}40`} strokeWidth="1" />
      {/* Sight */}
      <rect x="135" y="108" width="6" height="10" rx="1" fill="#5a5535" />

      {/* Outer LED ring */}
      {outerLeds.map(({ x, y, i }) => (
        <motion.circle key={i} cx={x} cy={y} r="5.5" fill="#6f86c7"
          animate={reduce ? { opacity: 0.4 } : { opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
        />
      ))}

      {/* 6 chambers */}
      {chambers.map(({ x, y, i }) =>
        i === zap ? (
          <motion.circle key={i} cx={x} cy={y} r="9" fill={accent} stroke={accent} strokeWidth="2"
            animate={reduce ? { opacity: 0.9 } : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <circle key={i} cx={x} cy={y} r="9" fill="#1d1b13" stroke="#4a4530" strokeWidth="2" />
        ),
      )}

      {/* Spinning selector */}
      <g style={{ transformBox: 'view-box', transformOrigin: '240px 135px', animation: reduce ? undefined : `spinSlow ${active ? 1.4 : 2.4}s linear infinite` }}>
        <circle cx="240" cy="93" r="10" fill="none" stroke="#ece4d3" strokeWidth="2.5" />
        <line x1="240" y1="135" x2="240" y2="103" stroke="#ece4d3" strokeWidth="2" opacity="0.6" />
      </g>

      {/* Center knob */}
      <circle cx="240" cy="135" r="11" fill="#211f16" stroke={accent} strokeWidth="2.5" />
      <rect x="239" y="127" width="2" height="8" rx="1" fill={accent} />

      {/* Bullet trajectory (right) */}
      {!reduce && (
        <motion.line x1="328" y1="135" x2="470" y2="135"
          stroke={accent} strokeWidth="2" strokeDasharray="6 5" opacity="0.6"
          animate={{ strokeDashoffset: [0, -22] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {/* Muzzle flash */}
      {!reduce && (
        <motion.g
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: '330px 135px' }}
        >
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line key={a} x1="330" y1="135"
              x2={330 + 16 * Math.cos(a * Math.PI / 180)}
              y2={135 + 16 * Math.sin(a * Math.PI / 180)}
              stroke={accent} strokeWidth="2" opacity="0.8" />
          ))}
        </motion.g>
      )}

      {/* Labels */}
      <text x="400" y="215" fill={accent} fontSize="9" fontFamily="monospace" textAnchor="middle" letterSpacing="2" opacity="0.55">CHAMBER 1/6</text>
      <text x="88" y="215" fill="#a89c80" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.45">.357 MAG</text>
    </svg>
  )
}

/* ── Registry ─────────────────────────────────────────────────────────────── */

const ART: Record<VisualKind, ComponentType<ArtProps>> = {
  fitness:  FitnessArt,
  tracking: TrackingArt,
  poker:    PokerArt,
  crypto:   CryptoArt,
  lottery:  LotteryArt,
  asteroid: AsteroidArt,
  voice:    VoiceArt,
  database: DatabaseArt,
  motor:    MotorArt,
  roulette: RouletteArt,
}
