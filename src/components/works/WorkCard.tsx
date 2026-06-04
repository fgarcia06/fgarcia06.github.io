import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Project } from '../../data/projects'
import { useInteractive } from '../../hooks/useMediaQuery'
import { WorkVisual } from './WorkVisual'
import { CountUp } from '../ui/CountUp'
import { Highlight } from '../ui/Highlight'

/**
 * Interactive project tile: pointer-driven 3D tilt with parallax visual layers,
 * a category badge + index over the generated visual, a short tag set, and a
 * soft accent glow on hover. Click / Enter / Space opens the case overlay.
 */
export function WorkCard({ project, index, onOpen }: { project: Project; index?: number; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const interactive = useInteractive()

  // Pointer position within the card, normalized to [-0.5, 0.5].
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 })
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 20 })

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={
        {
          rotateX: interactive ? rotX : 0,
          rotateY: interactive ? rotY : 0,
          transformPerspective: 1000,
          '--card-accent': project.accent,
        } as React.CSSProperties
      }
      className="group relative flex h-full cursor-pointer flex-col rounded-[var(--radius-card)] border border-border bg-surface/70 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-[color:var(--card-accent)] hover:shadow-[0_22px_60px_-26px_var(--card-accent)] focus-visible:border-[color:var(--card-accent)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
        <motion.div layoutId={`visual-${project.id}`} className="h-full w-full">
          <WorkVisual project={project} px={px} py={py} />
        </motion.div>

        {/* category badge + running index, floating over the visual */}
        <span
          className="pointer-events-none absolute left-3 top-3 rounded-full border bg-bg/55 px-2.5 py-1 font-grotesk text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm"
          style={{ borderColor: `${project.accent}66`, color: project.accent }}
        >
          {project.category}
        </span>
        {index != null && (
          <span className="pointer-events-none absolute right-3 top-2 font-serif text-2xl font-bold text-bone/25 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="mt-5 text-center">
        <p className="font-grotesk text-xs uppercase tracking-[0.18em] text-muted">{project.context}</p>
        <h3 className="mt-1 font-serif text-3xl font-semibold leading-tight tracking-[-0.02em] text-bone">
          {project.title}
        </h3>
        <Highlight
          text={project.tagline}
          terms={project.highlights}
          accent={project.accent}
          className="mx-auto mt-2 block max-w-sm text-bone/80"
        />
      </div>

      {/* top tags */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {project.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-border pt-4">
        {project.metrics.map((m) => (
          <div key={m.label} className="text-center">
            <CountUp value={m.value} className="font-serif text-xl font-bold text-[color:var(--card-accent)]" />
            <span className="mt-0.5 block text-xs text-muted">{m.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center font-grotesk text-xs uppercase tracking-[0.2em] text-[color:var(--card-accent)]">
        Open case study{' '}
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
      </p>
    </motion.div>
  )
}
