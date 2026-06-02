import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import type { Project } from '../../data/projects'

type Px = MotionValue<number>

/**
 * Generated, animated visual for each project — no static screenshots.
 * Drifting tinted blobs + an SVG diagram that hints at what the project does:
 * activity rings for the fitness app, tracked bounding boxes for the CV system.
 * Inner layers parallax against the card's pointer position.
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

  // Parallax: layers shift opposite the pointer by different depths.
  const blobX = useTransform(px, [-0.5, 0.5], [18, -18])
  const blobY = useTransform(py, [-0.5, 0.5], [14, -14])
  const artX = useTransform(px, [-0.5, 0.5], [-10, 10])
  const artY = useTransform(py, [-0.5, 0.5], [-8, 8])

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border"
      style={{ background: `radial-gradient(120% 120% at 30% 20%, ${a}22, #14130d 70%)` }}
    >
      {/* Drifting organic blobs */}
      <motion.div className="absolute inset-0" style={{ x: blobX, y: blobY }}>
        <div
          className="absolute -left-10 top-2 h-40 w-40 rounded-full blur-2xl"
          style={{ background: `${a}55`, animation: reduce ? undefined : 'drift 14s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 right-2 h-44 w-44 rounded-full blur-2xl"
          style={{ background: '#6f7d5255', animation: reduce ? undefined : 'driftSlow 18s ease-in-out infinite' }}
        />
      </motion.div>

      {/* Project-specific diagram */}
      <motion.div className="absolute inset-0 grid place-items-center" style={{ x: artX, y: artY }}>
        {project.visual === 'fitness' ? (
          <FitnessArt accent={a} reduce={!!reduce} active={active} />
        ) : (
          <TrackingArt accent={a} reduce={!!reduce} active={active} />
        )}
      </motion.div>

      {/* Scan sweep highlight */}
      {!reduce && (
        <div
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ animation: `sweep ${active ? 3.5 : 6}s ease-in-out infinite` }}
        />
      )}
    </div>
  )
}

function FitnessArt({ accent, reduce, active }: { accent: string; reduce: boolean; active: boolean }) {
  const rings = [
    { r: 58, color: accent, dash: 300 },
    { r: 44, color: '#ece4d3', dash: 226 },
    { r: 30, color: '#9caa7b', dash: 158 },
  ]
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40" style={{ animation: reduce ? undefined : 'spinSlow 40s linear infinite' }}>
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
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 * i }}
          />
        </g>
      ))}
    </svg>
  )
}

function TrackingArt({ accent, reduce, active }: { accent: string; reduce: boolean; active: boolean }) {
  const boxes = [
    { x: 24, y: 30, w: 38, h: 30, d: 0 },
    { x: 92, y: 64, w: 34, h: 34, d: 0.6 },
    { x: 54, y: 92, w: 30, h: 24, d: 1.2 },
  ]
  return (
    <svg viewBox="0 0 160 160" className="h-44 w-44">
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
