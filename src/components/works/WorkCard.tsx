import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import type { Project } from '../../data/projects'
import { useInteractive } from '../../hooks/useMediaQuery'
import { WorkVisual } from './WorkVisual'
import { CountUp } from '../ui/CountUp'
import { Highlight } from '../ui/Highlight'

const EASE = [0.22, 1, 0.36, 1] as const

export function WorkCard({
  project,
  index,
  onOpen,
}: {
  project: Project
  index?: number
  onOpen: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const interactive = useInteractive()
  const idx = index ?? 0

  // Scroll-driven parallax: visual layer shifts ±14px as card travels through viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const visualY = useTransform(scrollYProgress, [0, 1], [14, -14])

  // Mouse tilt
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 })
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 20 })

  function onMove(e: React.MouseEvent) {
    if (!interactive || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Open case study: ${project.title}`}
      data-cursor="grow"
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      initial={{ opacity: 0, scale: 0.9, y: 48 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.018, transition: { duration: 0.3, ease: EASE } }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        opacity: { duration: 0.5 },
        y: { duration: 0.72, ease: EASE },
        scale: { duration: 0.88, ease: EASE },
      }}
      style={
        interactive
          ? ({
              rotateX: rotX,
              rotateY: rotY,
              transformPerspective: 1000,
              '--card-accent': project.accent,
            } as React.CSSProperties)
          : ({ '--card-accent': project.accent } as React.CSSProperties)
      }
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface/70 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-[color:var(--card-accent)] hover:shadow-[0_24px_64px_-28px_var(--card-accent)] focus-visible:border-[color:var(--card-accent)]"
    >
      {/* ── Visual ── overflow-hidden container clips the taller inner layer */}
      <div className="relative h-[260px] overflow-hidden sm:h-[280px]">
        {/* Parallax layer: extends 18px beyond clip on top/bottom so it can shift ±14px */}
        <motion.div
          className="absolute inset-x-0"
          style={{ top: -18, bottom: -18, y: visualY }}
        >
          {/* CSS zoom on hover, isolated from the layoutId morph */}
          <div className="h-full w-full origin-center transition-transform duration-500 ease-out group-hover:scale-[1.07]">
            <motion.div layoutId={`visual-${project.id}`} className="h-full w-full">
              <WorkVisual project={project} px={px} py={py} />
            </motion.div>
          </div>
        </motion.div>

        {/* category badge */}
        <span
          className="pointer-events-none absolute left-3 top-3 rounded-full border bg-bg/60 px-2.5 py-1 font-grotesk text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm"
          style={{ borderColor: `${project.accent}66`, color: project.accent }}
        >
          {project.category}
        </span>
        <span className="pointer-events-none absolute right-3 top-2 font-serif text-2xl font-bold tabular-nums text-bone/20">
          {String(idx + 1).padStart(2, '0')}
        </span>

        {/* Bottom gradient vignette for content legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/[0.025]" />
      </div>

      {/* ── Content ── left-aligned, title + tagline front and center */}
      <div className="flex flex-col p-5 sm:p-6">
        <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-muted">
          {project.context}
        </p>
        <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight tracking-[-0.02em] text-bone sm:text-[1.75rem]">
          {project.title}
        </h3>
        <Highlight
          text={project.tagline}
          terms={project.highlights}
          accent={project.accent}
          className="mt-1.5 block font-serif text-base leading-snug text-bone/75"
        />
        <p className="mt-1 text-sm font-medium text-[color:var(--card-accent)]">{project.label}</p>

        {/* Metrics + CTA in one row */}
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {project.metrics.slice(0, 2).map((m) => (
              <div key={m.label}>
                <CountUp value={m.value} className="font-serif text-lg font-bold text-[color:var(--card-accent)]" />
                <span className="ml-0.5 block text-[11px] text-muted">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="shrink-0 font-grotesk text-xs uppercase tracking-[0.2em] text-[color:var(--card-accent)]">
            Case study{' '}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
