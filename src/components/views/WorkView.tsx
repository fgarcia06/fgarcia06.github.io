import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { Stagger, Item } from '../stage/Stagger'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { WorkCard } from '../works/WorkCard'
import { WorkVisual } from '../works/WorkVisual'
import { projects, type Project } from '../../data/projects'

export function WorkView({ accent }: { accent: string }) {
  const [active, setActive] = useState<Project | null>(null)

  // Lock body scroll AND chapter navigation while a case study is open.
  useEffect(() => {
    if (!active) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.navLocked = '1'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      delete document.body.dataset.navLocked
      window.removeEventListener('keydown', onKey)
    }
  }, [active])

  return (
    <div className="relative">
      <GhostLabel text="Work" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger>
        <ViewHeader
          no={3}
          accent={accent}
          eyebrow="Selected work"
          title="Things I've built"
          intro="Click a project — it expands into the full case study."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <Item key={p.id}>
              <WorkCard project={p} onOpen={() => setActive(p)} />
            </Item>
          ))}
        </div>
      </Stagger>

      <AnimatePresence>
        {active && <CaseOverlay project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}

function CaseOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
      <motion.div
        className="absolute inset-0 bg-bg/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.article
        className="relative z-10 max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-7"
        style={{ ['--card-accent' as string]: project.accent } as React.CSSProperties}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onClose}
          aria-label="Close case study"
          data-cursor="grow"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-bg/60 text-bone transition-colors hover:border-[color:var(--card-accent)]"
        >
          ✕
        </button>

        <div className="aspect-[16/9]">
          <motion.div layoutId={`visual-${project.id}`} className="h-full w-full">
            <WorkVisual project={project} px={px} py={py} active />
          </motion.div>
        </div>

        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.07, delayChildren: 0.15 }}>
          {[
            <div key="head">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{project.dates}</p>
              <h3 className="mt-1 font-serif text-3xl text-bone">{project.title}</h3>
              <p className="mt-1 text-sm text-[color:var(--card-accent)]">{project.label}</p>
            </div>,
            <p key="summary" className="text-bone/90">
              {project.summary}
            </p>,
            <div key="metrics" className="flex flex-wrap gap-3">
              {project.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-bg/40 px-3 py-2">
                  <div className="font-serif text-xl text-[color:var(--card-accent)]">{m.value}</div>
                  <div className="text-xs text-muted">{m.label}</div>
                </div>
              ))}
            </div>,
            <ul key="points" className="list-disc space-y-2 pl-5 text-bone/90 marker:text-[color:var(--card-accent)]">
              {project.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>,
            <div key="tags" className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-sm text-bone/90">
                  {t}
                </span>
              ))}
            </div>,
          ].map((child, i) => (
            <motion.div
              key={i}
              className="mt-5 first:mt-6"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </motion.article>
    </div>
  )
}
