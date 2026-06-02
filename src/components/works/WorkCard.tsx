import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Project } from '../../data/projects'
import { useInteractive } from '../../hooks/useMediaQuery'
import { WorkVisual } from './WorkVisual'
import { CountUp } from '../ui/CountUp'

/**
 * Interactive project tile: pointer-driven 3D tilt with parallax visual layers.
 * Click / Enter / Space opens the shared-layout case overlay.
 */
export function WorkCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
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
      className="group cursor-pointer rounded-[var(--radius-card)] border border-border bg-surface/70 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-[color:var(--card-accent)] focus-visible:border-[color:var(--card-accent)]"
    >
      <div>
        <div className="aspect-[16/10]">
          <motion.div layoutId={`visual-${project.id}`} className="h-full w-full">
            <WorkVisual project={project} px={px} py={py} />
          </motion.div>
        </div>

        <div className="mt-5 text-center">
          <p className="font-grotesk text-xs uppercase tracking-[0.18em] text-muted">{project.dates}</p>
          <h3 className="mt-1 font-serif text-3xl font-semibold leading-tight tracking-[-0.02em] text-bone">
            {project.title}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-bone/80">{project.tagline}</p>
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
          Open case study →
        </p>
      </div>
    </motion.div>
  )
}
