import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Page from '../Page'
import Thumb from '../Thumb'
import { type ListItem, type Section } from '../../../data/site'
import { useRouter } from '../../../lib/router'
import { useTilt } from '../../../lib/tilt'
import { appState } from '../../../lib/appState'
import {
  MicroLabel,
  RegMark,
  CircledIndex,
  AspectBracket,
  MicroBadge,
  microCode,
} from '../Micro'

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
 * free to drive the deck. Stepping past either end loops to the other side.
 * Dots remain for direct navigation and a mono `02 / 06` counter keeps
 * orientation. */
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
  const lastWheelTs = useRef(0)

  const goTo = useCallback(
    (i: number) => {
      const n = items.length
      // wrap rather than clamp: stepping past either end loops to the other side
      const next = ((i % n) + n) % n
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
      // Windows/Firefox report line- or page-mode deltas (deltaY ~1-4) instead of
      // pixels — normalize so the 50px threshold below is reachable on every platform.
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const dy = e.deltaY * scale
      const now = performance.now()
      // new gesture (paused >300ms) or a direction flip — start the accumulator over
      if (now - lastWheelTs.current > 300 || (wheelAccum.current !== 0 && (dy > 0) !== (wheelAccum.current > 0))) {
        wheelAccum.current = 0
      }
      lastWheelTs.current = now
      // a step is still settling — swallow deltas so one long flick doesn't queue extra cards
      if (now - cooldownRef.current < 500) {
        wheelAccum.current = 0
        return
      }
      wheelAccum.current += dy
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
      aria-label={`${sectionId} deck — scroll, swipe or arrow keys to browse, loops at the ends`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="deck-stage">
        {items.map((item, i) => {
          const n = items.length
          // shortest signed distance around the loop, so wrapping from the
          // last card to the first (or back) poses like a normal forward/back step
          let offset = i - active
          if (offset > n / 2) offset -= n
          else if (offset < -n / 2) offset += n
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
