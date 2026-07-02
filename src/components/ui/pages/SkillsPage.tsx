import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Page from '../Page'
import { skills, buildsForSkill, type SkillTrace } from '../../../data/site'
import { useRouter } from '../../../lib/router'
import { appState } from '../../../lib/appState'
import { isMobile } from '../../../lib/device'
import { MicroLabel, RegMark, AspectBracket } from '../Micro'

/* ------------------------------------------------------------------ */
/* skills                                                              */
/* ------------------------------------------------------------------ */

/** Neon hue per panel. Panels rest near-monochrome; their hue only ignites
 * under the cursor, so color itself is the hover reward. */
const panelAccents = ['#38e1ff', '#ff4fd8', '#ffc857', '#9d6bff', '#59ffa0', '#ff7a5c', '#57a9ff'] as const

/** One domain panel of the skills console: a chamfered HUD plate holding its
 * skills as bare signal lines. Every animation is cursor-driven — a spotlight
 * tracks the pointer (CSS vars written straight to the node, so a mousemove
 * never re-renders React), the panel's neon hue ignites on hover while
 * siblings step back, the title ghost-splits once as the cursor enters, and
 * hovering a skill streams its builds to the trace monitor. */
function SkillPanel({
  group,
  index,
  traceTag,
  lockedTag,
  traces,
  onHover,
  onLeave,
  onToggle,
}: {
  group: (typeof skills.groups)[number]
  index: number
  /** Currently traced skill (live hover wins over the pin), for on/dim states. */
  traceTag: string | null
  /** Skill pinned by click — its trace survives the cursor travelling away. */
  lockedTag: string | null
  /** tag → linked builds, precomputed once for the whole page. */
  traces: Map<string, SkillTrace[]>
  onHover: (tag: string) => void
  onLeave: () => void
  onToggle: (tag: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--px', `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`)
    el.style.setProperty('--py', `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`)
  }
  return (
    <div
      ref={ref}
      className="skill-panel"
      data-aos="warp-in"
      style={
        {
          transitionDelay: `${index * 80}ms`,
          '--panel-accent': panelAccents[index % panelAccents.length],
        } as CSSProperties
      }
      onMouseMove={isMobile ? undefined : onMove}
      // brush the background rift as the cursor crosses a panel
      onMouseEnter={() => {
        appState.pulse = Math.max(appState.pulse, 0.3)
      }}
    >
      <span className="panel-corner tl" aria-hidden />
      <span className="panel-corner br" aria-hidden />
      <span className="panel-spot" aria-hidden />
      <span className="panel-scan" aria-hidden />
      <div className="panel-head">
        <span className="skill-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="panel-title" data-text={group.title}>
          {group.title}
        </span>
        <span className="panel-count">{String(group.tags.length).padStart(2, '0')} SIG</span>
      </div>
      <div className="panel-tags" onMouseLeave={onLeave}>
        {group.tags.map((t) => {
          const n = traces.get(t)?.length ?? 0
          const on = traceTag === t
          return (
            <button
              type="button"
              key={t}
              className={`skill-tag ${on ? 'on' : ''} ${traceTag && !on ? 'dim' : ''} ${lockedTag === t ? 'pinned' : ''}`}
              aria-pressed={lockedTag === t}
              aria-describedby="skill-trace"
              onMouseEnter={() => onHover(t)}
              onFocus={() => onHover(t)}
              onClick={() => onToggle(t)}
            >
              <span className="chip-tick" aria-hidden />
              {t}
              {n > 0 && <span className="chip-count">×{n}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Eighth cell of the console grid: a live telemetry monitor. Hovering any
 * skill streams the builds that actually used it here; a click pins the trace
 * so the cursor can travel over and open a build without losing it. */
function TracePanel({
  traceTag,
  lockedTag,
  traced,
  onOpen,
}: {
  traceTag: string | null
  lockedTag: string | null
  traced: SkillTrace[]
  onOpen: (path: string) => void
}) {
  return (
    // AOS owns this wrapper's class list (it appends .aos-animate via the DOM);
    // the dynamic `live` class lives one level down so React re-renders never
    // wipe the entrance state and blank the panel.
    <div
      className="trace-slot"
      data-aos="warp-in"
      style={{ transitionDelay: `${panelAccents.length * 80}ms` } as CSSProperties}
    >
      <div
        className={`skill-panel trace-panel ${traceTag ? 'live' : ''}`}
        style={{ '--panel-accent': '#ff4fd8' } as CSSProperties}
      >
      <span className="panel-corner tl" aria-hidden />
      <span className="panel-corner br" aria-hidden />
      <div className="panel-head">
        <span className="skill-index">TX</span>
        <span className="panel-title" data-text="trace monitor">
          trace monitor
        </span>
        <span className="panel-count">{lockedTag ? 'PINNED' : traceTag ? 'LIVE' : 'IDLE'}</span>
      </div>
      <div id="skill-trace" className="panel-trace-body" aria-live="polite">
        {traceTag ? (
          <>
            <span className="trace-tag">{traceTag}</span>
            {traced.length > 0 ? (
              <span className="trace-links">
                {traced.map(({ item, sectionId }) => (
                  <button
                    type="button"
                    key={item.slug}
                    className="trace-link"
                    style={{ '--accent': item.project.accent } as CSSProperties}
                    onClick={() => onOpen(`${sectionId}/${item.slug}`)}
                  >
                    <span className="trace-dot" aria-hidden />
                    {item.title}
                    <span className="trace-kind">{sectionId === 'projects' ? 'PRJ' : 'PRT'}</span>
                  </button>
                ))}
              </span>
            ) : (
              <span className="trace-none">no direct build link — supporting tool</span>
            )}
          </>
        ) : (
          <span className="trace-hint">hover a skill to trace its builds · click to pin</span>
        )}
        </div>
      </div>
    </div>
  )
}

export function SkillsPage() {
  const { visibleState, go } = useRouter()
  // hover previews live; a click pins the trace so it survives the cursor
  // travelling to the monitor to open a build
  const [hoverTag, setHoverTag] = useState<string | null>(null)
  const [lockedTag, setLockedTag] = useState<string | null>(null)
  const traceTag = hoverTag ?? lockedTag

  // tag → linked builds, computed once (site data is static)
  const traces = useMemo(() => {
    const m = new Map<string, SkillTrace[]>()
    for (const g of skills.groups) for (const t of g.tags) m.set(t, buildsForSkill(t))
    return m
  }, [])
  const toolCount = useMemo(() => skills.groups.reduce((n, g) => n + g.tags.length, 0), [])

  // reset the console when leaving the page so it re-opens fresh
  useEffect(() => {
    if (visibleState !== 'skills') {
      setHoverTag(null)
      setLockedTag(null)
    }
  }, [visibleState])

  const traced = traceTag ? traces.get(traceTag) ?? [] : []

  return (
    <Page id="skills" active={visibleState === 'skills'}>
      <div className="page-title" data-aos="zoom-in">
        {skills.title}
      </div>
      <div className="section-caption" data-aos="fade-in" aria-hidden>
        <RegMark />
        <MicroLabel>
          [ STACK ] {String(skills.groups.length).padStart(2, '0')} DOMAINS · {toolCount} SIGNALS · HOVER TO TRACE · CLICK TO PIN
        </MicroLabel>
        <AspectBracket ratio="MG_990X" />
      </div>

      <div className="skills-block info-block">
        <div className={`skills-grid ${traceTag ? 'tracing' : ''}`}>
          {skills.groups.map((g, i) => (
            <SkillPanel
              key={g.title}
              group={g}
              index={i}
              traceTag={traceTag}
              lockedTag={lockedTag}
              traces={traces}
              onHover={setHoverTag}
              onLeave={() => setHoverTag(null)}
              onToggle={(t) => {
                setLockedTag((cur) => (cur === t ? null : t))
                appState.pulse = 0.6
              }}
            />
          ))}
          <TracePanel traceTag={traceTag} lockedTag={lockedTag} traced={traced} onOpen={go} />
        </div>
      </div>
    </Page>
  )
}
