import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { education, experience, type Job } from '../../data/experience'
import { Stagger, Item } from '../stage/Stagger'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { CountUp } from '../ui/CountUp'
import { Popup } from '../ui/Popup'

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
          {experience.map((job) => (
            <Item key={job.role + job.org}>
              <button
                onClick={() => setOpen(job)}
                data-cursor="grow"
                className="group flex w-full cursor-pointer flex-col items-center gap-4 py-8 text-center"
              >
                <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-muted">
                  {job.role} · {job.org} · {job.dates}
                </p>
                <h3
                  className="max-w-2xl font-serif font-semibold leading-[1] tracking-[-0.02em] text-bone transition-colors group-hover:text-[color:var(--a)]"
                  style={{ ['--a' as string]: accent, fontSize: 'var(--text-display)' } as React.CSSProperties}
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
            </Item>
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
          <Popup accent={accent} onClose={() => setOpen(null)}>
            <p className="font-grotesk text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
              {open.role} · {open.dates}
            </p>
            <h3 className="mt-2 font-serif text-3xl font-bold text-bone">{open.org}</h3>
            <p className="mt-1 text-sm text-muted">{open.location}</p>
            <ul className="mt-5 space-y-3 text-bone/90">
              {open.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden style={{ color: accent }}>
                    —
                  </span>
                  <TextReveal as="span" text={p} stagger={0.012} />
                </li>
              ))}
            </ul>
          </Popup>
        )}
      </AnimatePresence>
    </div>
  )
}
