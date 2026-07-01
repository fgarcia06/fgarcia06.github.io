import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { menu } from '../../data/site'
import { useRouter } from '../../lib/router'
import { loader } from '../../lib/loader'
import { cinema, type CinemaCue } from '../../lib/cinema'

/**
 * Floating UI chrome layered over the canvas, cloned from the reference:
 * header strip with inline menu (desktop) / hamburger (mobile), fullscreen
 * menu overlay, centered footer menu on home, the thin centered loader
 * line, and the top/bottom letterbox bars that frame the home page.
 */

export function Header() {
  const { state, go } = useRouter()
  const [shade, setShade] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const onHome = state === 'home' || state === 'loading'

  useEffect(() => {
    const onScroll = () => setShade(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close the fullscreen menu on any navigation, like APP.go does
  useEffect(() => setMenuOpen(false), [state])

  return (
    <>
      <div className={`header ${onHome ? '' : 'show'} ${shade ? 'shade' : ''}`}>
        <div className="header-menu">
          <ul className="menu-items">
            {menu.map((m, i) => (
              <li
                key={m.link}
                className={`menu-item menu-${m.link}`}
                onClick={() => go(m.link === 'home' ? 'home' : m.link)}
              >
                {i ? ' | ' : ''}
                {m.title}
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`menu-button ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="menu"
        >
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`menu ${menuOpen ? 'show' : ''}`}>
        <ul className="menu-items">
          {menu.map((m) => (
            <li
              key={m.link}
              className={`menu-item ${state.split('/')[0] === m.link ? 'active' : ''}`}
              onClick={() => {
                setMenuOpen(false)
                go(m.link)
              }}
            >
              {m.title}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export function LoaderBar() {
  const [{ visible, value }, set] = useState({ visible: false, value: 0 })
  useEffect(
    () => loader.subscribe((visible, value) => set({ visible, value })),
    [],
  )
  return (
    <div
      className={`loader ${visible ? 'show' : ''}`}
      // *80 so the line fills 80% of the screen at 100%, per the reference
      style={{ width: `${Math.round(value * 100) * 0.8}%` }}
    />
  )
}

/**
 * Ambient HUD frame layered over every section (hidden on home/loading):
 * angular corner brackets, a drifting scanline, and two telemetry readouts —
 * a status line tied to the current sector and a live "depth" derived from
 * scroll position. Purely decorative (pointer-events: none); the depth digits
 * are written straight to the DOM on scroll so it never re-renders React.
 */
export function Hud() {
  const { state } = useRouter()
  const depthRef = useRef<HTMLSpanElement>(null)
  const hidden = state === 'home' || state === 'loading'
  const sector = (state.split('/')[0] || 'home').toUpperCase()
  // a stable pseudo-coordinate per sector, for flavour
  const coord = sector
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)

  useEffect(() => {
    if (hidden) return
    let ticking = false
    const update = () => {
      ticking = false
      const el = depthRef.current
      if (el) el.textContent = String(Math.round(window.scrollY)).padStart(5, '0')
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hidden])

  return (
    <div className={`hud ${hidden ? '' : 'show'}`} aria-hidden>
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl" />
      <span className="hud-corner br" />
      <div className="hud-scan" />
      <div className="hud-readout hud-tl">
        <span className="hud-dot" /> SECTOR {sector} · LINK ONLINE
      </div>
      <div className="hud-readout hud-br">
        LAT {coord} · DEPTH <span ref={depthRef}>00000</span>
      </div>
    </div>
  )
}

/**
 * Cinematic transition overlay: an anamorphic letterbox that crops the frame
 * to a widescreen aspect on every navigation, then opens back out — a film
 * "scene cut" wrapped around the warp/zoom. Each cue carries a new id, which
 * we use as the element key to re-arm the CSS keyframe animations from the
 * top. Glowing inner frame-lines and a flashed aspect-ratio tag sell it as a
 * camera reframing rather than a plain fade.
 */
export function Cinema() {
  const [cue, setCue] = useState<CinemaCue | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => cinema.subscribe(setCue), [])

  // useLayoutEffect (not useEffect) so the animation restart runs synchronously
  // before the browser paints. useEffect fires after paint, meaning the first
  // painted frame after a cue change has no .play class — on PCs where the
  // compositor is already mid-frame this can lose the animation entirely.
  // Sequence: remove .play → force reflow (commits removal) → add .play →
  // browser schedules the keyframe from 0% in the very same paint pass.
  useLayoutEffect(() => {
    const el = ref.current
    if (!cue || !el) return
    el.classList.remove('play')
    void el.offsetWidth
    el.classList.add('play')
  }, [cue])

  // Always render the div so the DOM element and its GPU layer exist from
  // the start. Conditional null-return meant the element was mounted for the
  // first time ON the first cue, racing with the layout effect — on slower
  // PC render pipelines that mount happened after the first paint, losing
  // the animation on every fresh page load.
  return (
    <div ref={ref} className={`cinema${cue ? ` cinema-${cue.kind}` : ''}`} aria-hidden>
      <div className="cinema-warp" />
      <div className="cinema-bar top">
        <span className="cinema-line" />
      </div>
      <div className="cinema-bar bottom">
        <span className="cinema-line" />
      </div>
      {cue && <div className="cinema-aspect">{cue.aspect}</div>}
      {cue && (
        <div className="cinema-jump">
          <span className="cinema-jump-tag">⊕ HYPERSPACE JUMP</span>
          <span className="cinema-jump-target">{cue.label}</span>
          {cue.desc && <span className="cinema-jump-desc">{cue.desc}</span>}
          <span className="cinema-jump-coord">{cue.coord}</span>
        </div>
      )}
      {cue && (
        <div className="cinema-dest">
          <span className="cinema-dest-index">SECTOR {cue.index}</span>
          {cue.count && <span className="cinema-dest-count">{cue.count}</span>}
        </div>
      )}
    </div>
  )
}

export function Bars() {
  const { state } = useRouter()
  const cls =
    state === 'loading' ? '' : state === 'home' ? 'bar' : 'hide'
  return (
    <>
      <div className={`top-bar ${cls}`}></div>
      <div className={`bottom-bar ${cls}`}></div>
    </>
  )
}
