import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { education, experience, type Job } from '../../data/experience'
import { Stagger, Item } from '../stage/Stagger' // Item still used for education row
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { CountUp } from '../ui/CountUp'
import { Modal } from '../ui/Modal'

const EASE = [0.22, 1, 0.36, 1] as const

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

        <div className="flex w-full max-w-3xl flex-col divide-y divide-border border-y border-border">
          {experience.map((job, idx) => (
            <motion.div
              key={job.role + job.org}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -32 : 32, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-48px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setOpen(job)}
                data-cursor="grow"
                className="group flex w-full cursor-pointer flex-col items-center gap-3 py-6 text-center sm:gap-4 sm:py-8"
              >
                <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-muted">
                  {job.role} · {job.org} · {job.dates}
                </p>
                <h3
                  className="max-w-2xl font-serif font-semibold leading-[1] tracking-[-0.02em] text-bone transition-colors group-hover:text-[color:var(--a)]"
                  style={{ ['--a' as string]: accent, fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)' } as React.CSSProperties}
                >
                  {job.headline}
                </h3>
                <p className="max-w-xl text-muted">{job.blurb}</p>

                <div className="mt-1 flex flex-wrap justify-center gap-8">
                  {job.metrics.map((m) => (
                    <div key={m.label} className="flex flex-col items-center">
                      <CountUp value={m.value} className="font-serif text-2xl font-bold" />
                      <span className="mt-0.5 text-[11px] text-muted">{m.label}</span>
                    </div>
                  ))}
                </div>

                <span className="mt-1 font-grotesk text-xs uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-bone">
                  View details →
                </span>
              </button>
            </motion.div>
          ))}
        </div>

        <Item className="mt-6">
          <p className="font-grotesk text-sm text-muted">
            <span className="text-bone">{education.degree}</span> · {education.school} · {education.dates}
          </p>
        </Item>
      </Stagger>

      <AnimatePresence>
        {open && (
          <Modal accent={accent} onClose={() => setOpen(null)} ariaLabel={`${open.role} at ${open.org}`} size="lg">
            <div className="p-6 sm:p-9">
              <p className="font-grotesk text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
                {open.role} · {open.dates}
              </p>
              <h3 className="mt-2 font-serif text-3xl font-bold leading-tight text-bone sm:text-4xl">{open.org}</h3>
              <p className="mt-1 text-sm text-muted">{open.location}</p>
              <p className="mt-4 max-w-2xl text-bone/85">{open.blurb}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {open.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-bg/40 px-3 py-3" style={{ color: accent }}>
                    <CountUp value={m.value} className="font-serif text-2xl font-bold" />
                    <div className="mt-0.5 text-xs leading-snug text-muted">{m.label}</div>
                  </div>
                ))}
              </div>

              <ul className="mt-6 space-y-3">
                {open.points.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE }}
                    className="flex gap-3 text-bone/90"
                  >
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                    <TextReveal as="span" text={p} stagger={0.01} />
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
