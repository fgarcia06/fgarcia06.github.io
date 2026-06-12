import { Fragment, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { FlowStage } from '../../data/projects'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Interactive architecture view for a project. A compact "pipeline at a glance"
 * strip of stage chips sits above a vertical timeline that spells out what each
 * stage does. Hovering / focusing either representation highlights the same
 * stage in both, so the diagram reads as one connected system.
 */
export function ProjectFlow({ stages, accent }: { stages: FlowStage[]; accent: string }) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  return (
    <div>
      {/* pipeline at a glance */}
      <div className="mb-7 flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {stages.map((s, i) => {
          const on = active === i
          return (
            <Fragment key={s.label}>
              <button
                type="button"
                data-cursor="grow"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={on}
                className="cursor-pointer rounded-full border px-3 py-1 font-grotesk text-[11px] uppercase tracking-[0.12em] transition-colors duration-200"
                style={
                  on
                    ? { backgroundColor: accent, borderColor: accent, color: '#07090e' }
                    : { borderColor: 'var(--color-border)', color: 'rgba(236,228,211,0.7)' }
                }
              >
                {s.label}
              </button>
              {i < stages.length - 1 && (
                <span aria-hidden className="select-none text-sm" style={{ color: `${accent}aa` }}>
                  →
                </span>
              )}
            </Fragment>
          )
        })}
      </div>

      {/* detailed timeline */}
      <ol className="relative space-y-1">
        {/* rail */}
        <span aria-hidden className="absolute bottom-2 left-[7px] top-2 border-l border-dashed" style={{ borderColor: `${accent}55` }} />
        {stages.map((s, i) => {
          const on = active === i
          return (
            <motion.li
              key={s.label}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
              onMouseEnter={() => setActive(i)}
              className="relative cursor-default rounded-lg py-2 pl-7 pr-3 transition-colors duration-200"
              style={{ backgroundColor: on ? `${accent}12` : 'transparent' }}
            >
              {/* node */}
              <span
                aria-hidden
                className="absolute left-0 top-3 grid h-[15px] w-[15px] place-items-center rounded-full border-2 transition-colors duration-200"
                style={{ borderColor: accent, backgroundColor: on ? accent : '#07090e' }}
              >
                <span className="font-grotesk text-[8px] font-bold tabular-nums" style={{ color: on ? '#07090e' : accent }}>
                  {i + 1}
                </span>
              </span>
              <p className="font-grotesk text-sm font-semibold tracking-tight text-bone">{s.label}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.detail}</p>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
