import { useMemo, type CSSProperties } from 'react'
import type { Project } from '../../data/projects'

/**
 * Generated 16:9 visual for list items and detail features.
 * Each project gets a deterministic abstract visual derived from its accent
 * color and kind, animated with the cheap transform/opacity keyframes in
 * index.css (t-dash, t-pulse, …). Animation is disabled wholesale under
 * prefers-reduced-motion via the .thumb-anim guard.
 * TODO(content): swap for real captures when available.
 */

function seeded(slug: string) {
  let h = 2166136261
  for (const c of slug) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** stroke-dashoffset target for .t-dash (a negative multiple of the dash
 * period so the marching loop wraps cleanly). */
const dashTo = (p: string): CSSProperties => ({ '--p': p } as CSSProperties)
const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` })

function Motif({ project }: { project: Project }) {
  const a = project.accent
  switch (project.visual) {
    case 'fitness': {
      const beat = '40,150 110,150 135,80 165,200 195,120 225,150 600,150'
      return (
        <g stroke={a} fill="none" strokeWidth="2">
          {/* faint full trace + a bright pulse travelling along it */}
          <polyline points={beat} opacity=".25" />
          <polyline
            className="t-dash"
            points={beat}
            pathLength={100}
            strokeDasharray="14 86"
            style={{ ...dashTo('-100px'), animationDuration: '2.2s' }}
            opacity=".95"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              className="t-grow"
              style={delay(i * 0.18)}
              x={420 + i * 30}
              y={200 - i * 18}
              width="16"
              height={40 + i * 18}
              fill={a}
              opacity={0.25 + i * 0.12}
              stroke="none"
            />
          ))}
        </g>
      )
    }
    case 'tracking':
      return (
        <g stroke={a} fill="none" strokeWidth="2">
          <rect className="t-pulse" x="90" y="80" width="90" height="70" />
          <rect className="t-pulse" style={delay(0.9)} x="300" y="140" width="70" height="56" />
          <rect className="t-pulse" style={delay(1.7)} x="470" y="70" width="80" height="64" />
          <path
            className="t-dash"
            d="M135 115 C 230 95, 280 160, 335 168 S 470 110, 510 102"
            strokeDasharray="3 7"
            style={dashTo('-40px')}
            opacity=".7"
          />
          <circle className="t-pulse" cx="135" cy="115" r="3" fill={a} stroke="none" />
          <circle className="t-pulse" style={delay(0.9)} cx="335" cy="168" r="3" fill={a} stroke="none" />
          <circle className="t-pulse" style={delay(1.7)} cx="510" cy="102" r="3" fill={a} stroke="none" />
        </g>
      )
    case 'poker':
      return (
        <g>
          {[0, 1, 2].map((i) => (
            // rotation lives on the wrapper so the CSS bob transform on the
            // card doesn't overwrite it
            <g key={i} transform={`rotate(${(i - 1) * 12} ${276 + i * 60} 150)`}>
              <rect
                className="t-bob"
                style={delay(i * 0.45)}
                x={230 + i * 60}
                y={84}
                width="92"
                height="132"
                rx="8"
                fill="rgba(255,255,255,.06)"
                stroke={a}
                strokeWidth="2"
                opacity={0.5 + i * 0.25}
              />
            </g>
          ))}
          <circle
            className="t-dash"
            cx="150"
            cy="150"
            r="40"
            fill="none"
            stroke={a}
            strokeWidth="2"
            strokeDasharray="6 6"
            style={{ ...dashTo('-24px'), animationDuration: '2.4s' }}
            opacity=".6"
          />
        </g>
      )
    case 'crypto':
      return (
        <g>
          {Array.from({ length: 48 }).map((_, i) => (
            <rect
              key={i}
              className={i % 3 === 0 ? 't-flicker' : undefined}
              style={i % 3 === 0 ? delay(((i * 7919) % 13) * 0.21) : undefined}
              x={70 + (i % 12) * 42}
              y={70 + Math.floor(i / 12) * 42}
              width="26"
              height="26"
              fill={a}
              opacity={((i * 7919) % 13) / 26 + 0.04}
            />
          ))}
          <rect x="262" y="106" width="116" height="88" rx="8" fill="#0b0c0d" stroke={a} strokeWidth="2.5" />
          <path
            className="t-pulse"
            style={{ animationDuration: '3.5s' }}
            d="M286 106 v-16 a34 34 0 0 1 68 0 v16"
            fill="none"
            stroke={a}
            strokeWidth="2.5"
          />
        </g>
      )
    case 'lottery':
      return (
        <g stroke={a} strokeWidth="2">
          {Array.from({ length: 25 }).map((_, i) => (
            <rect
              key={i}
              className="t-pulse"
              // diagonal sweep across the 5×5 grid
              style={delay(((i % 5) + Math.floor(i / 5)) * 0.18)}
              x={170 + (i % 5) * 28}
              y={80 + Math.floor(i / 5) * 28}
              width="20"
              height="20"
              fill={i === 12 ? a : 'none'}
              opacity={i === 12 ? 1 : 0.35}
            />
          ))}
          <rect x="420" y="100" width="110" height="110" fill="none" opacity=".8" />
          <path d="M438 118 h74 M438 136 h74 M438 154 h40" opacity=".6" />
          <rect
            className="t-pulse"
            style={{ animationDuration: '1.8s' }}
            x="455"
            y="168"
            width="40"
            height="40"
            fill={a}
            opacity=".5"
            stroke="none"
          />
        </g>
      )
    case 'asteroid':
      return (
        <g stroke={a} fill="none" strokeWidth="2">
          <polygon className="t-bob" points="320,160 300,185 340,185" fill={a} opacity=".9" />
          <circle className="t-bob" style={{ animationDuration: '4.2s' }} cx="150" cy="90" r="26" opacity=".7" />
          <circle
            className="t-bob"
            style={{ animationDuration: '3.4s', animationDelay: '.8s' }}
            cx="480"
            cy="120"
            r="16"
            opacity=".55"
          />
          <circle
            className="t-bob"
            style={{ animationDuration: '2.7s', animationDelay: '1.4s' }}
            cx="420"
            cy="220"
            r="10"
            opacity=".4"
          />
          <path
            className="t-dash"
            d="M320 158 L 165 102"
            strokeDasharray="2 8"
            style={dashTo('-40px')}
            opacity=".8"
          />
          <path
            className="t-dash"
            d="M255 70 a 130 130 0 0 1 130 180"
            strokeDasharray="1 10"
            style={{ ...dashTo('-44px'), animationDuration: '4s' }}
            opacity=".4"
          />
        </g>
      )
    case 'voice':
      return (
        <g>
          {Array.from({ length: 32 }).map((_, i) => {
            const h = 12 + Math.abs(Math.sin(i * 0.9)) * 90
            return (
              <rect
                key={i}
                className="t-eq"
                style={{ animationDelay: `${(i % 7) * 0.13}s` }}
                x={90 + i * 14}
                y={150 - h / 2}
                width="6"
                height={h}
                fill={a}
                opacity={0.35 + Math.abs(Math.sin(i * 0.9)) * 0.6}
              />
            )
          })}
        </g>
      )
    case 'database':
      return (
        <g stroke={a} fill="none" strokeWidth="2">
          <ellipse className="t-pulse" style={{ animationDuration: '3.5s' }} cx="300" cy="84" rx="100" ry="24" />
          <path d="M200 84 v120 a100 24 0 0 0 200 0 v-120" opacity=".9" />
          <path d="M200 144 a100 24 0 0 0 200 0 M200 174 a 100 24 0 0 0 200 0" opacity=".5" />
          <path
            className="t-dash"
            d="M440 100 h80 M440 130 h64 M440 160 h72 M440 190 h52"
            opacity=".5"
            strokeDasharray="4 6"
            style={dashTo('-40px')}
          />
        </g>
      )
    case 'motor':
      return (
        <g stroke={a} fill="none" strokeWidth="2.5">
          <path d="M 180 200 A 90 90 0 1 1 420 200" opacity=".35" strokeWidth="10" strokeLinecap="round" />
          <path d="M 180 200 A 90 90 0 0 1 300 60" opacity="1" strokeWidth="10" strokeLinecap="round" />
          <line className="t-needle" x1="300" y1="150" x2="368" y2="106" strokeWidth="3" />
          <circle cx="300" cy="150" r="8" fill={a} stroke="none" />
        </g>
      )
    case 'roulette':
      return (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = (i / 12) * Math.PI * 2 - Math.PI / 2
            return (
              <circle
                key={i}
                className="t-chase"
                style={delay(i * 0.2)}
                cx={300 + Math.cos(ang) * 80}
                cy={150 + Math.sin(ang) * 80}
                r="9"
                fill={a}
                stroke={a}
                strokeWidth="2"
                opacity=".25"
              />
            )
          })}
          <circle
            className="t-dash"
            cx="300"
            cy="150"
            r="26"
            fill="none"
            stroke={a}
            strokeWidth="2"
            strokeDasharray="4 9"
            style={{ ...dashTo('-39px'), animationDuration: '3s' }}
            opacity=".6"
          />
        </g>
      )
  }
}

export default function Thumb({ project, className }: { project: Project; className?: string }) {
  const stars = useMemo(() => {
    const rnd = seeded(project.id)
    return Array.from({ length: 40 }).map(() => ({
      x: rnd() * 600,
      y: rnd() * 300,
      r: rnd() * 1.2 + 0.2,
      o: rnd() * 0.5 + 0.08,
    }))
  }, [project.id])

  return (
    <svg
      viewBox="0 0 600 300"
      preserveAspectRatio="xMidYMid slice"
      className={`thumb-anim ${className ?? ''}`}
      role="img"
      aria-label={project.title}
    >
      <defs>
        <radialGradient id={`bg-${project.id}`} cx="20%" cy="10%" r="120%">
          <stop offset="0%" stopColor="#1d2a31" />
          <stop offset="55%" stopColor="#0b0c0d" />
        </radialGradient>
        <radialGradient id={`glow-${project.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={project.accent} stopOpacity=".2" />
          <stop offset="100%" stopColor={project.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="300" fill={`url(#bg-${project.id})`} />
      <circle className="t-drift" cx="475" cy="75" r="170" fill={`url(#glow-${project.id})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#9fc3d6" opacity={s.o} />
      ))}
      <g opacity=".14" stroke="#5b7a87" strokeWidth="0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="300" />
        ))}
        {[1, 2].map((i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="600" y2={i * 100} />
        ))}
      </g>
      <Motif project={project} />
    </svg>
  )
}
