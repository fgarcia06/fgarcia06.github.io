import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Page from './Page'
import Thumb from './Thumb'
import { home, about, skills, sections, social, detailFor, relatedFor, buildsForSkill, type Section, type ListItem, type SkillTrace } from '../../data/site'
import { useRouter } from '../../lib/router'
import { useTilt } from '../../lib/tilt'
import { appState, shapeFor, orbOpacityFor } from '../../lib/appState'
import { isMobile, prefersReducedMotion } from '../../lib/device'
import { GitHubIcon, LinkedInIcon, EmailIcon } from './icons'
import {
  MicroLabel,
  RegMark,
  CircledIndex,
  AspectBracket,
  MicroBadge,
  MicroFrame,
  microCode,
} from './Micro'

/* ------------------------------------------------------------------ */
/* home                                                                */
/* ------------------------------------------------------------------ */

/** The interactive entry nodes, now living on their own /sectors page (the
 * "sector chart") reached from the home CTA via the warp transition.
 * Rather than a flat row, they're scattered around the central mark like
 * waypoints floating in space: each sits at a screen corner, drifts on its
 * own loop, and parallaxes by its `depth` as the camera (mouse) moves —
 * nearer nodes swing further, selling the sense of depth. Hovering one
 * morphs/pulses the background mark toward that section's shape, so the
 * canvas previews where the click will take you. */
const homeNodes = [
  { link: 'projects', label: 'Projects', desc: 'Software that shipped', glyph: '▦', meta: `${sections[0].list.length} builds`, pos: 'tl', depth: 30, coord: 'SECTOR 01' },
  { link: 'prototypes', label: 'Prototypes', desc: 'Circuits & contraptions', glyph: '⬡', meta: `${sections[1].list.length} rigs`, pos: 'tr', depth: 18, coord: 'SECTOR 02' },
  { link: 'skills', label: 'Skills', desc: 'Every tool, traced to a build', glyph: '❖', meta: `${skills.groups.length} domains`, pos: 'bl', depth: 22, coord: 'SECTOR 03' },
  { link: 'about', label: 'About', desc: 'Say hello', glyph: '◎', meta: 'Bio · CV', pos: 'br', depth: 36, coord: 'SECTOR 04' },
] as const

function HomeNode({ node, index }: { node: (typeof homeNodes)[number]; index: number }) {
  const { go, state } = useRouter()
  return (
    // pos layer: corner anchor + warp-in entrance (AOS transform)
    <div className={`home-node-pos ${node.pos}`} data-aos="warp-in" style={{ transitionDelay: `${500 + index * 140}ms` }}>
      {/* float layer: continuous drift (CSS animation transform) */}
      <div
        className="home-node-float"
        style={{ animationDelay: `${index * -2.3}s`, animationDuration: `${9 + index * 1.7}s` }}
      >
        <button
          type="button"
          className="home-node"
          // parallax layer: shifts by `--depth` against the mouse (set in JS)
          style={{ '--depth': node.depth } as CSSProperties}
          onClick={() => go(node.link)}
          // preview the section live: morph the central mark into that
          // section's shape (orbTarget drives morphAmount; shapeTarget picks
          // which form) and give it a small flare. Reverts on mouse-leave.
          onMouseEnter={() => {
            appState.shapeTarget = shapeFor(node.link)
            appState.orbTarget = orbOpacityFor(node.link)
            appState.pulse = 0.6
          }}
          // Revert to the CURRENT route's shape, not a hard-coded 'sectors':
          // after a click the route is already the destination, and this
          // leave event re-fires when the page hides (element → display:none),
          // which used to wipe the destination's unique shape mid-travel.
          onMouseLeave={() => {
            appState.shapeTarget = shapeFor(state)
            appState.orbTarget = orbOpacityFor(state)
          }}
        >
          <span className="home-node-corner tl" />
          <span className="home-node-corner br" />
          <RegMark className="home-node-reg" />
          <span className="home-node-coord">{node.coord}</span>
          <span className="home-node-glyph" aria-hidden>{node.glyph}</span>
          <span className="home-node-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="home-node-label">{node.label}</span>
          <span className="home-node-desc">{node.desc}</span>
          <span className="home-node-meta">
            {node.meta}
            <span className="home-node-arrow" aria-hidden>→</span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function HomePage() {
  const { visibleState, go } = useRouter()

  return (
    <Page id="home" active={visibleState === 'home'}>
      {/* the whole screen is the way in — one transparent button under the
          titles keeps it keyboard-reachable (Tab + Enter) */}
      <button
        type="button"
        className="home-open"
        aria-label="Open portfolio"
        onClick={() => go('sectors')}
      />
      <div className="titles">
        <div className="page-title" data-aos="fade-in" style={{ transitionDuration: '2s' }}>
          {home.title}
        </div>
        <div
          className="page-subtitle"
          data-aos="fade-in"
          style={{ transitionDuration: '2s', transitionDelay: '.4s' }}
        >
          {home.subtitle}
        </div>
        <div className="home-hint" data-aos="fade-in" style={{ transitionDelay: '1.4s' }} aria-hidden>
          {home.hint}
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* sectors — the navigation chart holding the four waypoint nodes      */
/* ------------------------------------------------------------------ */

export function SectorsPage() {
  const { visibleState } = useRouter()
  const navRef = useRef<HTMLElement>(null)

  // Drive parallax for every node from one rAF loop: publish the eased,
  // normalized mouse offset as CSS vars; each node multiplies them by its
  // own --depth. Disabled on touch / reduced-motion (mouse stays centered).
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return
    let raf = 0
    let mx = 0
    let my = 0
    const tick = () => {
      const tx = appState.mouse.x / (window.innerWidth / 2)
      const ty = appState.mouse.y / (window.innerHeight / 2)
      mx += (tx - mx) * 0.06
      my += (ty - my) * 0.06
      const el = navRef.current
      if (el) {
        el.style.setProperty('--mx', mx.toFixed(4))
        el.style.setProperty('--my', my.toFixed(4))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Page id="sectors" active={visibleState === 'sectors'}>
      <div className="titles">
        <div className="home-caption" data-aos="fade-in" aria-hidden>
          <RegMark />
          <MicroLabel>FOUR SECTORS · ONE BUILDER · PICK A DOOR</MicroLabel>
          <RegMark />
        </div>
        <div className="page-title" data-aos="fade-in" style={{ transitionDuration: '1.4s' }}>
          sectors
        </div>
        <div
          className="page-subtitle"
          data-aos="fade-in"
          style={{ transitionDuration: '1.4s', transitionDelay: '.3s' }}
        >
          choose a destination
        </div>
      </div>

      <nav className="home-nav" aria-label="Sections" ref={navRef}>
        {homeNodes.map((n, i) => (
          <HomeNode key={n.link} node={n} index={i} />
        ))}
      </nav>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* section list pages (projects / prototypes)                          */
/* ------------------------------------------------------------------ */

/** One card in the horizontal slider. At rest every card is equal; the rich
 * stuff is hover/focus-driven (and mirrored onto the scroll-centred `.is-active`
 * card so touch users get it too): the card lifts with an accent glow, its art
 * slow-zooms (Ken Burns), a light sheen sweeps across, HUD corner brackets snap
 * out, and the footer expands to reveal a preview — tagline, category/stack
 * chips, and an "open case" cue. The whole track also spotlights: peers dim and
 * recede so the focused card pops. Reachable by pointer, keyboard, and touch. */
function SlideCard({ item, index, active, onOpen }: { item: ListItem; index: number; active: boolean; onOpen: () => void }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      role="button"
      tabIndex={active ? 0 : -1}
      aria-label={`${item.title}. ${item.project.tagline}`}
      className={`slide-card ${active ? 'is-active' : ''}`}
      style={{ '--accent': item.project.accent } as CSSProperties}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      // brush the background mark as the cursor crosses a card
      onMouseEnter={() => {
        appState.pulse = 0.45
      }}
    >
      {/* inner layer carries the 3D tilt (useTilt sets its transform) + clips
          the art; the outer .slide-card keeps the eased lift/glow tilt can't */}
      <div className="slide-card-tilt" ref={tilt}>
        <div className="slide-media">
          <Thumb project={item.project} className="slide-thumb" />
          <span className="slide-scrim" aria-hidden />
          <span className="slide-sheen" aria-hidden />
        </div>

        <span className="slide-corner tl" aria-hidden />
        <span className="slide-corner tr" aria-hidden />
        <span className="slide-corner bl" aria-hidden />
        <span className="slide-corner br" aria-hidden />

        <div className="card-micro" aria-hidden>
          <div className="card-micro-left">
            <MicroLabel>ASSET_ID {microCode(item.slug)}</MicroLabel>
            <AspectBracket ratio="16:9" />
          </div>
          <div className="card-micro-right">
            <MicroBadge>{item.project.category}</MicroBadge>
            <CircledIndex value={index + 1} />
          </div>
        </div>

        <div className="slide-foot">
          <div className="slide-eyebrow">
            <span className="slide-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="slide-subtitle">{item.subtitle}</span>
          </div>
          <div className="slide-title">{item.title}</div>
          {/* hidden at rest; the footer expands to reveal it on hover/focus */}
          <div className="slide-extra" aria-hidden>
            <p className="slide-tag">{item.project.tagline}</p>
            <div className="slide-extra-row">
              <div className="slide-chips">
                <span className="slide-chip">{item.project.category}</span>
                <span className="slide-chip ghost">{item.project.label}</span>
              </div>
              <span className="slide-cta">
                open case <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Depth-deck card stack (replaces the arrow slider): cards pile up behind
 * the front one like a held hand of holo-cards. A wheel flick, a vertical
 * swipe, or an arrow key peels the front card away (it flies down-forward)
 * and the deck steps up. The pages are viewport-locked, so scroll input is
 * free to drive the deck. Dots remain for direct navigation and a mono
 * `02 / 06` counter keeps orientation. */
function CardDeck({
  items,
  sectionId,
  pageActive,
  onOpen,
}: {
  items: ListItem[]
  sectionId: string
  /** True while the owning page is the visible route — gates input listeners. */
  pageActive: boolean
  onOpen: (item: ListItem) => void
}) {
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const cooldownRef = useRef(0)
  const wheelAccum = useRef(0)

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(items.length - 1, i))
      if (next === activeRef.current) return
      activeRef.current = next
      setActive(next)
      // brush the background rift as a card is dealt
      appState.pulse = Math.max(appState.pulse, 0.3)
    },
    [items.length],
  )

  /** One flick = one card: a step is ignored while the previous is settling. */
  const step = useCallback(
    (dir: 1 | -1) => {
      const now = performance.now()
      if (now - cooldownRef.current < 500) return
      cooldownRef.current = now
      goTo(activeRef.current + dir)
    },
    [goTo],
  )

  // wheel drives the deck while this page is on screen (page can't scroll)
  useEffect(() => {
    if (!pageActive) return
    wheelAccum.current = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheelAccum.current += e.deltaY
      if (Math.abs(wheelAccum.current) >= 50) {
        step(wheelAccum.current > 0 ? 1 : -1)
        wheelAccum.current = 0
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [pageActive, step])

  // vertical swipe on touch — no page scroll to conflict with
  useEffect(() => {
    if (!pageActive) return
    let startY = 0
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    const onEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY
      if (Math.abs(dy) >= 50) step(dy > 0 ? 1 : -1)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [pageActive, step])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      step(-1)
    }
  }

  return (
    <div
      className="card-deck"
      role="group"
      aria-roledescription="card deck"
      aria-label={`${sectionId} deck — scroll, swipe or arrow keys to browse`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="deck-stage">
        {items.map((item, i) => {
          const offset = i - active
          const state =
            offset === 0 ? 'front' : offset < 0 ? 'passed' : offset <= 3 ? 'behind' : 'deep'
          return (
            <div
              key={item.slug}
              className={`deck-pos ${state}`}
              style={{ '--offset': Math.min(Math.max(offset, 0), 4), zIndex: items.length - Math.abs(offset) } as CSSProperties}
              aria-hidden={offset !== 0}
            >
              <SlideCard
                item={item}
                index={i}
                active={offset === 0}
                // front card opens the case; a peeking card deals the deck to it
                onOpen={() => (offset === 0 ? onOpen(item) : goTo(i))}
              />
            </div>
          )
        })}
      </div>

      <div className="deck-nav">
        <div className="slider-dots" role="tablist" aria-label="Deck position">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show ${item.title}`}
              className={`slider-dot ${i === active ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <span className="deck-counter" aria-hidden>
          {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export function SectionPage({ section }: { section: Section }) {
  const { visibleState, go } = useRouter()
  return (
    <Page id={section.id} active={visibleState === section.id}>
      <div className="page-title" data-aos="zoom-in">
        {section.title}
      </div>
      <div className="section-caption" data-aos="fade-in" aria-hidden>
        <RegMark />
        <MicroLabel>
          [ INDEX ] {String(section.list.length).padStart(2, '0')} BUILDS · SCROLL TO FLIP THE DECK
        </MicroLabel>
        <AspectBracket ratio="MG_990X" />
      </div>
      <div className="page-content"></div>
      {section.list.length > 0 ? (
        <CardDeck
          items={section.list}
          sectionId={section.id}
          pageActive={visibleState === section.id}
          onOpen={(item) => go(`${section.id}/${item.slug}`)}
        />
      ) : (
        section.todo && (
          <div className="todo-content" data-aos="fade-in">
            {section.todo}
          </div>
        )
      )}
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* skills                                                              */
/* ------------------------------------------------------------------ */

/** One open "resonance channel": no card box — an accent rail with a pulsing
 * node, the domain title with its own live EQ, and the skills as bare signal
 * lines. Hover/focus/tap on a skill traces it to real builds (strip below). */
function SkillCluster({
  group,
  index,
  traceTag,
  traces,
  onTrace,
}: {
  group: (typeof skills.groups)[number]
  index: number
  /** The currently traced skill tag (site-wide), for chip on/dim states. */
  traceTag: string | null
  /** tag → linked builds, precomputed once for the whole page. */
  traces: Map<string, SkillTrace[]>
  onTrace: (tag: string) => void
}) {
  return (
    <div
      className="skill-cluster"
      data-aos="warp-in"
      style={{ transitionDelay: `${index * 70}ms`, '--eq-delay': `${index * -0.6}s` } as CSSProperties}
    >
      <span className="cluster-node" aria-hidden />
      <div className="cluster-head">
        <span className="skill-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="cluster-title">{group.title}</span>
        {/* tiny live equalizer — each channel runs its own rhythm */}
        <span className="skill-eq" aria-hidden>
          <i /><i /><i /><i /><i />
        </span>
      </div>
      <div className="cluster-tags">
        {group.tags.map((t) => {
          const n = traces.get(t)?.length ?? 0
          return (
            <button
              type="button"
              className={`skill-tag ${traceTag === t ? 'on' : ''} ${traceTag && traceTag !== t ? 'dim' : ''}`}
              key={t}
              aria-pressed={traceTag === t}
              aria-describedby="skill-trace"
              onMouseEnter={() => onTrace(t)}
              onFocus={() => onTrace(t)}
              onClick={() => onTrace(t)}
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

export function SkillsPage() {
  const { visibleState, go } = useRouter()
  const [traceTag, setTraceTag] = useState<string | null>(null)

  // tag → linked builds, computed once (site data is static)
  const traces = useMemo(() => {
    const m = new Map<string, SkillTrace[]>()
    for (const g of skills.groups) for (const t of g.tags) m.set(t, buildsForSkill(t))
    return m
  }, [])

  // clear the trace when leaving the page so it re-opens fresh
  useEffect(() => {
    if (visibleState !== 'skills') setTraceTag(null)
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
          [ STACK ] {String(skills.groups.length).padStart(2, '0')} DOMAINS · EVERY SKILL EARNED ON A REAL BUILD
        </MicroLabel>
        <AspectBracket ratio="MG_990X" />
      </div>

      <div className="skills-block info-block">
        <div className="section-title" data-aos="fade-in">
          [ the toolkit ]
        </div>
        <div className={`skills-field ${traceTag ? 'tracing' : ''}`}>
          {skills.groups.map((g, i) => (
            <SkillCluster
              key={g.title}
              group={g}
              index={i}
              traceTag={traceTag}
              traces={traces}
              onTrace={setTraceTag}
            />
          ))}
        </div>
        {/* decorative resonance baseline under the field */}
        <div className="skills-baseline" data-aos="fade-in" aria-hidden>
          <span className="baseline-pulse" />
        </div>
      </div>

      {/* trace telemetry strip: where the hovered skill was actually used */}
      <div id="skill-trace" className={`skill-trace ${traceTag ? 'live' : ''}`} aria-live="polite">
        {traceTag ? (
          <>
            <span className="trace-tag">{traceTag}</span>
            {traced.length > 0 && (
              <>
                <span className="trace-sep" aria-hidden>▸</span>
                <span className="trace-links">
                  {traced.map(({ item, sectionId }) => (
                    <button
                      type="button"
                      key={item.slug}
                      className="trace-link"
                      style={{ '--accent': item.project.accent } as CSSProperties}
                      onClick={() => go(`${sectionId}/${item.slug}`)}
                    >
                      <span className="trace-dot" aria-hidden />
                      {item.title}
                      <span className="trace-kind">{sectionId === 'projects' ? 'PRJ' : 'PRT'}</span>
                    </button>
                  ))}
                </span>
              </>
            )}
          </>
        ) : (
          <span className="trace-hint">hover a skill to trace it to a build</span>
        )}
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* about                                                               */
/* ------------------------------------------------------------------ */

export function AboutPage() {
  const { visibleState } = useRouter()
  return (
    <Page id="about" active={visibleState === 'about'}>
      <div className="page-title" data-aos="zoom-in">
        {about.title}
      </div>
      <div className="section-caption" data-aos="fade-in" aria-hidden>
        <RegMark />
        <MicroLabel>[ PROFILE ] EDMONTON, AB · COMPUTER ENGINEERING</MicroLabel>
        <AspectBracket ratio="MG_990X" />
      </div>
      <div className="feature" data-aos="zoom-in">
        <div className="feature-content">
          <MicroFrame className="portrait-frame" caption="SUBJECT_01 · PORTRAIT">
            <img className="info-portrait" src={about.portrait} alt="Francis Garcia" />
          </MicroFrame>
        </div>
      </div>

      <div className="bio-title section-title" data-aos="fade-in">
        [ bio ]
      </div>
      <div className="bio" data-aos="fade-in">
        {about.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="education-block info-block">
        <div className="section-title" data-aos="fade-in">
          [ education ]
        </div>
        <div className="education" data-aos="fade-in">
          <div className="experience-role">{about.education.degree}</div>
          <div className="experience-org">
            {about.education.school} — {about.education.location} · {about.education.dates}
          </div>
        </div>
      </div>

      <div className="experience-block info-block">
        <div className="section-title" data-aos="fade-in">
          [ experience ]
        </div>
        <div className="experience-list">
          {about.experience.map((job) => (
            <div className="experience-item" data-aos="fade-in" key={job.org}>
              <div className="experience-role">{job.role}</div>
              <div className="experience-org">
                {job.org} — {job.location} · {job.dates}
              </div>
              <ul>
                {job.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="social-block info-block">
        <div className="social-title section-title" data-aos="fade-in">
          [ contact | social ]
        </div>
        <div className="contact-line" data-aos="fade-in">
          {about.contact.email} · {about.contact.phone} · {about.contact.location}
        </div>
        <div className="social-list" data-aos="fade-in">
          {social.map((s) => (
            <a
              key={s.title}
              className="social-link list-item"
              href={s.url}
              target={s.url.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              title={s.title}
            >
              {s.icon === 'github' && <GitHubIcon />}
              {s.icon === 'linkedin' && <LinkedInIcon />}
              {s.icon === 'email' && <EmailIcon />}
            </a>
          ))}
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* detail pages                                                        */
/* ------------------------------------------------------------------ */

function RelatedEntry({ item, onOpen }: { item: ListItem; onOpen: () => void }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      className="tilt list-item"
      ref={tilt}
      style={{ '--accent': item.project.accent } as CSSProperties}
      onClick={onOpen}
    >
      <Thumb project={item.project} className="thumb-img" />
      <div className="card-micro" aria-hidden>
        <div className="card-micro-left">
          <MicroLabel>ASSET_ID {microCode(item.slug)}</MicroLabel>
        </div>
        <div className="card-micro-right">
          <MicroBadge>{item.project.category}</MicroBadge>
        </div>
      </div>
      <div className="titles">
        <div className="subtitle">{item.subtitle}</div>
        <div className="title">{item.title}</div>
      </div>
    </div>
  )
}

export function DetailPage({ section }: { section: Section }) {
  const { visibleState, dataState, go } = useRouter()
  const prefix = `${section.id}/`
  const [slug, setSlug] = useState<string | null>(null)

  // swap content only when the router's dataState reaches this section,
  // so the outgoing page keeps its old content while sliding away
  useEffect(() => {
    if (dataState.startsWith(prefix)) setSlug(dataState.slice(prefix.length))
  }, [dataState, prefix])

  if (section.list.length === 0) return null
  const detail = slug ? detailFor(section, slug) : undefined
  const active = visibleState.startsWith(prefix)

  const related = detail ? relatedFor(section, detail.item) : []

  return (
    <Page id={`${section.id}-detail`} active={active} dataKey={slug ?? ''}>
      {detail && (
        <>
          <div className="page-title" data-aos="zoom-in">
            {detail.item.title}
          </div>
          <div className="page-subtitle" data-aos="zoom-in">
            {detail.item.project.label}
          </div>
          <div className="feature" data-aos="fade-in">
            <div className="feature-content">
              {/* TODO(content): reference shows a project video/gallery here;
                  no captures exist in my sources — generated visual instead */}
              <MicroFrame
                className="feature-frame"
                caption={`ASSET_ID ${microCode(detail.item.slug)} · ${detail.item.project.category}`}
              >
                <Thumb project={detail.item.project} className="feature-thumb sixteen-nine" />
                <AspectBracket className="feature-aspect" ratio="16:9" />
              </MicroFrame>
            </div>
          </div>

          <div className="client" data-aos="fade-in">
            <b>Context: </b>
            {detail.item.project.context}
          </div>
          <div className="role" data-aos="fade-in">
            <b>Stack: </b>
            {detail.item.project.label}
          </div>

          <div className="content-title section-title" data-aos="fade-in">
            [ brief ]
          </div>
          <div className="content" data-aos="fade-in">
            <p className="content-summary">{detail.item.project.summary}</p>
            <ul>
              {detail.item.project.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className="content-quote">{detail.item.project.takeaway}</div>
          </div>

          {related.length > 0 && (
            <>
              <div className="related-title section-title" data-aos="fade-in">
                [ related {section.title} ]
              </div>
              <div className="related-list" data-aos="fade-in">
                {related.map((r) => (
                  <RelatedEntry key={r.slug} item={r} onOpen={() => go(`${prefix}${r.slug}`)} />
                ))}
              </div>
            </>
          )}

          <div className="bottom-nav">
            <div className="bottom-back" onClick={() => go(`${prefix}${detail.prev.slug}`)}>
              &#8672; prev
            </div>
            <div className="bottom-up" onClick={() => go(section.id)}>
              back to {section.title}
            </div>
            <div className="bottom-next" onClick={() => go(`${prefix}${detail.next.slug}`)}>
              next &#8674;
            </div>
          </div>
        </>
      )}
    </Page>
  )
}
