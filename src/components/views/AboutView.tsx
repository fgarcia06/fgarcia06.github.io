import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { education, experience, type Job } from '../../data/experience'
import { Stagger, Item } from '../stage/Stagger'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { CountUp } from '../ui/CountUp'
import { Modal } from '../ui/Modal'
import { Readout, Diamond, Waveform, HatchBlock, CHAMFER, CHAMFER_LG, GOLD } from '../ui/HudDecor'

const EASE = [0.22, 1, 0.36, 1] as const

/** One employment record as an animated HUD field-log panel. */
function JobPanel({
  job,
  index,
  accent,
  onOpen,
}: {
  job: Job
  index: number
  accent: string
  onOpen: () => void
}) {
  const reduce = useReducedMotion()
  return (
    <motion.article
      className="relative sm:pl-12"
      initial={{ opacity: 0, x: -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: EASE, delay: index * 0.08 }}
    >
      {/* Timeline node — pulsing diamond on the rail */}
      <span aria-hidden className="absolute left-0 top-9 hidden sm:block">
        <span className="relative block h-3 w-3 rotate-45 border" style={{ borderColor: accent, backgroundColor: `${accent}22` }}>
          {!reduce && (
            <span
              className="absolute -inset-1.5 rotate-0 border"
              style={{ borderColor: `${accent}44`, animation: 'pulseSoft 2.6s ease-in-out infinite' }}
            />
          )}
        </span>
      </span>

      <button
        onClick={onOpen}
        data-cursor="grow"
        className="group relative w-full cursor-pointer overflow-hidden border border-border bg-surface/50 p-6 text-left backdrop-blur-sm transition-colors duration-200 hover:border-[color:var(--a)] sm:p-7"
        style={{ clipPath: CHAMFER_LG, ['--a' as string]: `${accent}88` } as React.CSSProperties}
      >
        {/* Angular texture + hover chrome */}
        <HatchBlock color={accent} className="absolute right-0 top-0 h-10 w-36 opacity-30" flip />
        {!reduce && (
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background: `linear-gradient(180deg, transparent, ${accent}10 60%, ${accent}1f)`,
              borderBottom: `1px solid ${accent}44`,
              animation: 'scanY 2.6s linear infinite',
            }}
          />
        )}
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
          style={{ backgroundColor: accent, transform: 'skewY(-12deg)' }}
        />

        {/* Header readouts */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Readout color={GOLD}>
            REC.{String(index + 1).padStart(2, '0')} // {job.dates}
          </Readout>
          <Readout color="rgba(231,234,242,0.35)">{job.location}</Readout>
        </div>

        <h3
          className="mt-3 font-serif text-2xl font-semibold leading-snug tracking-[-0.01em] text-bone transition-colors duration-200 group-hover:text-[color:var(--ah)] sm:text-3xl"
          style={{ ['--ah' as string]: accent } as React.CSSProperties}
        >
          {job.headline}
        </h3>
        <p className="mt-1.5 flex items-center gap-2 font-grotesk text-[11px] uppercase tracking-[0.16em] text-muted">
          <Diamond size={4} color={accent} />
          {job.role} · {job.org}
        </p>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">{job.blurb}</p>

        {/* Metric chips */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {job.metrics.map((m) => (
            <span
              key={m.label}
              className="flex items-baseline gap-2 border border-border bg-bg/40 px-3 py-1.5 transition-colors duration-200 group-hover:border-[color:var(--a)]"
              style={{ clipPath: CHAMFER }}
            >
              <CountUp value={m.value} className="font-serif text-lg font-bold" />
              <span className="text-[11px] text-muted">{m.label}</span>
            </span>
          ))}
          <span className="ml-auto hidden items-center gap-3 sm:flex">
            <Waveform bars={8} color={accent} active={false} className="opacity-0 transition-opacity duration-200 group-hover:opacity-70" />
            <span
              className="flex items-center gap-2 border px-3.5 py-1.5 font-grotesk text-[10px] uppercase tracking-[0.2em] opacity-60 transition-all duration-200 group-hover:opacity-100"
              style={{ clipPath: CHAMFER, borderColor: `${accent}66`, color: accent }}
            >
              Access file →
            </span>
          </span>
        </div>
      </button>
    </motion.article>
  )
}

export function AboutView({ accent }: { accent: string }) {
  const [open, setOpen] = useState<Job | null>(null)

  return (
    <div className="relative">
      <GhostLabel text="About" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center text-center">
        <ViewHeader
          no={2}
          accent={accent}
          eyebrow="Background"
          title="Where I've worked"
          intro="Robotics and control systems — production automation to research."
        />
      </Stagger>

      {/* Field log — timeline rail + record panels */}
      <div className="relative mx-auto w-full max-w-3xl">
        <span aria-hidden className="absolute bottom-4 left-[5px] top-4 hidden w-px bg-border sm:block" />
        <div className="flex flex-col gap-6">
          {experience.map((job, idx) => (
            <JobPanel key={job.role + job.org} job={job} index={idx} accent={accent} onOpen={() => setOpen(job)} />
          ))}
        </div>
      </div>

      <Stagger className="flex flex-col items-center">
        <Item className="mt-8">
          <p className="flex flex-wrap items-center justify-center gap-2.5 font-grotesk text-sm text-muted">
            <Diamond size={5} color={accent} />
            <span className="text-bone">{education.degree}</span> · {education.school} · {education.dates}
          </p>
        </Item>
      </Stagger>

      <AnimatePresence>
        {open && (
          <Modal accent={accent} onClose={() => setOpen(null)} ariaLabel={`${open.role} at ${open.org}`} size="lg">
            <div className="p-6 sm:p-9">
              <Readout color={GOLD}>
                {open.role} // {open.dates}
              </Readout>
              <h3 className="mt-3 font-serif text-3xl font-bold leading-snug text-bone sm:text-4xl">{open.org}</h3>
              <p className="mt-1.5 text-sm text-muted">{open.location}</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-bone/95">{open.blurb}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {open.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="border border-border bg-bg/40 px-3 py-3"
                    style={{ clipPath: CHAMFER, color: accent }}
                  >
                    <CountUp value={m.value} className="font-serif text-2xl font-bold" />
                    <div className="mt-1 text-xs leading-snug text-muted">{m.label}</div>
                  </div>
                ))}
              </div>

              <ul className="mt-6 space-y-3">
                {open.points.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 * i, ease: EASE }}
                    className="flex gap-3 leading-relaxed text-bone/90"
                  >
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45" style={{ backgroundColor: accent }} />
                    <TextReveal as="span" text={p} stagger={0.008} />
                  </motion.li>
                ))}
              </ul>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
