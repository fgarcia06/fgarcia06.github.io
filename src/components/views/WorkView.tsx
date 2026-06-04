import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { Stagger, Item } from '../stage/Stagger'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { WorkCard } from '../works/WorkCard'
import { WorkVisual } from '../works/WorkVisual'
import { WorkFilter, type FilterItem } from '../works/WorkFilter'
import { ProjectFlow } from '../works/ProjectFlow'
import { Highlight } from '../ui/Highlight'
import { CountUp } from '../ui/CountUp'
import { Modal } from '../ui/Modal'
import { projects, categoryOrder, type Project } from '../../data/projects'

const EASE = [0.22, 1, 0.36, 1] as const

export function WorkView({ accent }: { accent: string }) {
  const [active, setActive] = useState<Project | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Filter chips: "All" plus every category that has at least one project.
  const filters = useMemo<FilterItem[]>(() => {
    const counts = new Map<string, number>()
    projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1))
    return [
      { key: 'all', label: 'All', count: projects.length },
      ...categoryOrder
        .filter((c) => counts.has(c))
        .map((c) => ({ key: c, label: c, count: counts.get(c) ?? 0 })),
    ]
  }, [])

  const shown = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  )

  return (
    <div className="relative">
      <GhostLabel text="Work" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger>
        <ViewHeader
          no={3}
          accent={accent}
          eyebrow="Selected work"
          title="Things I've built"
          intro="Ten projects across full-stack, embedded, security and ML. Filter the set, then open any card for the full case study."
        />

        <Item className="mb-9">
          <WorkFilter items={filters} active={filter} onChange={setFilter} accent={accent} />
        </Item>
      </Stagger>

      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.28, ease: 'easeOut' } }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <WorkCard project={p} index={i} onOpen={() => setActive(p)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {active && <CaseOverlay project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}

type Tab = 'overview' | 'flow'

function CaseOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const [tab, setTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'flow', label: 'How it works' },
  ]

  return (
    <Modal accent={project.accent} onClose={onClose} ariaLabel={`${project.title} case study`} size="xl">
      {/* hero visual (shared-layout morph target) */}
      <div className="aspect-[16/9] sm:aspect-[2/1]">
        <motion.div layoutId={`visual-${project.id}`} className="h-full w-full">
          <WorkVisual project={project} px={px} py={py} active />
        </motion.div>
      </div>

      <div className="p-5 sm:p-7">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{project.context}</p>
            <h3 className="mt-1 font-serif text-3xl leading-tight text-bone sm:text-4xl">{project.title}</h3>
            <Highlight
              text={project.tagline}
              terms={project.highlights}
              accent={project.accent}
              className="mt-2 block font-serif text-lg leading-snug text-bone/85"
            />
            <p className="mt-2 text-sm text-[color:var(--card-accent)]">{project.label}</p>
          </div>
          <span
            className="hidden shrink-0 rounded-full border px-3 py-1 font-grotesk text-[11px] uppercase tracking-[0.14em] sm:block"
            style={{ borderColor: `${project.accent}66`, color: project.accent }}
          >
            {project.category}
          </span>
        </div>

        {/* tab bar */}
        <div role="tablist" aria-label="Case study sections" className="mt-6 flex gap-6 border-b border-border">
          {tabs.map((t) => {
            const on = tab === t.key
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                data-cursor="grow"
                onClick={() => setTab(t.key)}
                className={`relative -mb-px cursor-pointer pb-3 font-grotesk text-sm tracking-wide transition-colors duration-200 ${on ? 'text-bone' : 'text-muted hover:text-bone'}`}
              >
                {t.label}
                {on && (
                  <motion.span
                    layoutId="case-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full"
                    style={{ backgroundColor: project.accent }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="pt-6"
          >
            {tab === 'overview' ? <Overview project={project} /> : <HowItWorks project={project} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  )
}

function Overview({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <p className="text-bone/90">{project.summary}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {project.metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-bg/40 px-3 py-3">
            <CountUp value={m.value} className="font-serif text-2xl font-bold text-[color:var(--card-accent)]" />
            <div className="mt-0.5 text-xs leading-snug text-muted">{m.label}</div>
          </div>
        ))}
      </div>

      <ul className="space-y-2.5">
        {project.points.map((pt, i) => (
          <motion.li
            key={pt}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE }}
            className="flex gap-3 text-bone/90"
          >
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: project.accent }} />
            <span>{pt}</span>
          </motion.li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 border-t border-border pt-5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-sm text-bone/90 transition-colors duration-200 hover:border-[color:var(--card-accent)] hover:text-bone"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function HowItWorks({ project }: { project: Project }) {
  return (
    <div className="space-y-7">
      <ProjectFlow stages={project.flow} accent={project.accent} />

      {/* key-insight callout */}
      <div
        className="flex gap-3 rounded-xl border-l-2 bg-bg/40 p-4"
        style={{ borderColor: project.accent }}
      >
        <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke={project.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18h6M10 21h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
        </svg>
        <div>
          <p className="font-grotesk text-[11px] uppercase tracking-[0.16em]" style={{ color: project.accent }}>
            Key insight
          </p>
          <p className="mt-1 text-bone/90">{project.takeaway}</p>
        </div>
      </div>
    </div>
  )
}
