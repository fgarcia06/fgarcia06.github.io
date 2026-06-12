import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { Stagger } from '../stage/Stagger'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { WorkFilter, type FilterItem } from '../works/WorkFilter'
import { HudPreview } from '../works/HudPreview'
import { ProjectFlow } from '../works/ProjectFlow'
import { Highlight } from '../ui/Highlight'
import { CountUp } from '../ui/CountUp'
import { Modal } from '../ui/Modal'
import { projects, categoryOrder, type Project } from '../../data/projects'
const EASE = [0.22, 1, 0.36, 1] as const

/** Chamfered corner — the angular WuWa panel cut. */
const CHAMFER = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'

// ── Project visual row ────────────────────────────────────────────────────────

function WorkProjectRow({
  project,
  index,
  isHovered,
  onEnter,
  onLeave,
  onOpen,
}: {
  project: Project
  index: number
  isHovered: boolean
  onEnter: () => void
  onLeave: () => void
  onOpen: () => void
}) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Open case study: ${project.title}`}
      data-cursor="grow"
      className="group relative h-[240px] cursor-pointer overflow-hidden border-b border-border sm:h-[340px]"
      onMouseEnter={onEnter}
      onMouseLeave={() => { onLeave(); reset() }}
      onMouseMove={onMove}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() }
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.32, ease: EASE, delay: index * 0.03 }}
    >
      {/* Layer 1 — HUD preview, always alive, breathes in on hover */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        <HudPreview project={project} px={px} py={py} active={isHovered} index={index} bare />
      </motion.div>

      {/* Layer 2 — legibility gradients + hover wash sweeping in from the left */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg/65 to-transparent" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(100deg, ${project.accent}16 0%, transparent 45%)` }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.18, ease: EASE }}
      />

      {/* Hover chrome — slanted accent blade + top edge line */}
      <motion.span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px] origin-top"
        style={{ backgroundColor: project.accent, transform: 'skewY(-12deg)' }}
        animate={{ scaleY: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: EASE }}
      />
      <motion.span
        aria-hidden
        className="absolute left-0 top-0 h-px w-full origin-left"
        style={{ backgroundColor: `${project.accent}88` }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.26, ease: EASE }}
      />

      {/* Oversized watermark index — deep layer, right side */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 select-none font-serif text-[9rem] font-bold leading-none tracking-tight transition-colors duration-200 lg:block"
        style={{ color: isHovered ? `${project.accent}14` : 'rgba(231,234,242,0.04)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Layer 3 — text content */}
      <div className="absolute inset-0 z-20 flex items-end justify-between p-6 sm:p-7">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-2 font-grotesk text-xs tabular-nums tracking-[0.12em] transition-colors duration-200"
              style={{ color: isHovered ? project.accent : 'var(--color-muted)' }}
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rotate-45 transition-colors duration-200"
                style={{ backgroundColor: isHovered ? project.accent : 'var(--color-border)' }}
              />
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="border px-2.5 py-0.5 font-grotesk text-[10px] uppercase tracking-[0.18em] transition-[border-color,color,background-color] duration-200"
              style={{
                clipPath: CHAMFER,
                borderColor: isHovered ? `${project.accent}88` : 'var(--color-border)',
                color: isHovered ? project.accent : 'var(--color-muted)',
                backgroundColor: isHovered ? `${project.accent}10` : 'transparent',
              }}
            >
              {project.category}
            </span>
          </div>
          <motion.h3
            className="mt-2.5 font-serif text-2xl font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 sm:text-3xl"
            style={{ color: isHovered ? project.accent : 'var(--color-bone)' }}
            animate={{ x: isHovered ? 10 : 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {project.title}
          </motion.h3>
          <p className="mt-1.5 font-grotesk text-[11px] uppercase tracking-[0.16em] text-muted">
            {project.context}
          </p>
        </div>

        {/* Chamfered OPEN chip — slides in on hover */}
        <motion.span
          aria-hidden
          className="mb-1 hidden shrink-0 items-center gap-2 border px-4 py-2 font-grotesk text-[11px] uppercase tracking-[0.22em] sm:flex"
          style={{
            clipPath: CHAMFER,
            borderColor: `${project.accent}88`,
            color: project.accent,
            backgroundColor: `${project.accent}10`,
          }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 16 }}
          transition={{ duration: 0.17, ease: EASE }}
        >
          Open
          <span className="text-sm leading-none">→</span>
        </motion.span>
      </div>
    </motion.div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function WorkView({ accent }: { accent: string }) {
  const [active, setActive]             = useState<Project | null>(null)
  const [filter, setFilter]             = useState<string>('all')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
          intro="Ten projects across full-stack, embedded, security and ML."
        />
      </Stagger>

      <div className="mt-4">
        <div className="mb-6">
          <WorkFilter
            items={filters}
            active={filter}
            onChange={(f) => { setFilter(f); setHoveredIndex(null) }}
            accent={accent}
          />
        </div>

        {/* Rows container */}
        <div className="relative border-t border-border">
          {/* Project rows */}
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              >
                <WorkProjectRow
                  project={p}
                  index={i}
                  isHovered={hoveredIndex === i}
                  onEnter={() => setHoveredIndex(i)}
                  onLeave={() => setHoveredIndex(null)}
                  onOpen={() => setActive(p)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {active && <CaseOverlay project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ── Case study overlay ────────────────────────────────────────────────────────

type Tab = 'overview' | 'flow'

function CaseOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const [tab, setTab] = useState<Tab>('overview')
  const projectIndex = projects.findIndex((p) => p.id === project.id)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'flow', label: 'How it works' },
  ]

  return (
    <Modal accent={project.accent} onClose={onClose} ariaLabel={`${project.title} case study`} size="xl">
      <motion.div
        className="aspect-[16/9] sm:aspect-[2/1]"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.26, ease: EASE }}
        style={{ '--card-accent': project.accent } as React.CSSProperties}
      >
        <div className="h-full w-full">
          <HudPreview project={project} px={px} py={py} active index={projectIndex} bare />
        </div>
      </motion.div>

      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-muted">{project.context}</p>
            <h3 className="mt-2 font-serif text-3xl font-semibold leading-snug text-bone sm:text-4xl">
              {project.title}
            </h3>
            <Highlight
              text={project.tagline}
              terms={project.highlights}
              accent={project.accent}
              className="mt-3 block font-serif text-lg leading-normal text-bone/95"
            />
            <p className="mt-3 font-grotesk text-sm tracking-wide" style={{ color: project.accent }}>
              {project.label}
            </p>
          </div>
          <span
            className="hidden shrink-0 border px-3 py-1 font-grotesk text-[11px] uppercase tracking-[0.18em] sm:block"
            style={{ clipPath: CHAMFER, borderColor: `${project.accent}66`, color: project.accent }}
          >
            {project.category}
          </span>
        </div>

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
                    transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: EASE }}
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
      <p className="leading-relaxed text-bone/90">{project.summary}</p>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        style={{ '--card-accent': project.accent } as React.CSSProperties}
      >
        {project.metrics.map((m) => (
          <div key={m.label} className="border border-border bg-bg/40 px-3 py-3" style={{ clipPath: CHAMFER }}>
            <CountUp value={m.value} className="font-serif text-2xl font-bold text-[color:var(--card-accent)]" />
            <div className="mt-1 text-xs leading-snug text-muted">{m.label}</div>
          </div>
        ))}
      </div>

      <ul className="space-y-3">
        {project.points.map((pt, i) => (
          <motion.li
            key={pt}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.035 * i, ease: EASE }}
            className="flex gap-3 leading-relaxed text-bone/90"
          >
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45" style={{ backgroundColor: project.accent }} />
            <span>{pt}</span>
          </motion.li>
        ))}
      </ul>

      <div
        className="flex flex-wrap gap-2 border-t border-border pt-5"
        style={{ '--card-accent': project.accent } as React.CSSProperties}
      >
        {project.tags.map((t) => (
          <span
            key={t}
            className="border border-border bg-white/[0.03] px-3 py-1 text-sm tracking-wide text-bone/90 transition-colors duration-200 hover:border-[color:var(--card-accent)] hover:text-bone"
            style={{ clipPath: CHAMFER }}
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
      <div className="flex gap-3 border-l-2 bg-bg/40 p-4" style={{ borderColor: project.accent }}>
        <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke={project.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18h6M10 21h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
        </svg>
        <div>
          <p className="font-grotesk text-[11px] uppercase tracking-[0.18em]" style={{ color: project.accent }}>Key insight</p>
          <p className="mt-1.5 leading-relaxed text-bone/90">{project.takeaway}</p>
        </div>
      </div>
    </div>
  )
}
