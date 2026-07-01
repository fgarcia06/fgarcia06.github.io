import { useEffect, useRef, type CSSProperties } from 'react'
import { appState } from '../../lib/appState'
import { isMobile, prefersReducedMotion } from '../../lib/device'
import { GoldenSpiral, PhiGrid, MicroLabel, RegMark, DotGrid, PHI } from './Micro'

/**
 * Ambient micrographic instrumentation, layered over the WebGL nebula but
 * behind the page content (z-index 5). It turns the empty space around the
 * sections into a navigable "deep field": a slowly-rotating golden spiral,
 * phi-proportion drafting guides, registration marks pinned to the golden
 * sections, and live navigation telemetry (R.A./DEC/φ/velocity) that ticks
 * forward — faster during a hyperspace jump — so the whole site reads as a
 * craft drifting through space rather than a static page.
 *
 * Everything is decorative: aria-hidden, pointer-events:none. A single rAF loop
 * drives the eased mouse parallax (each element shifts by its own `--depth`)
 * and writes the ticking readouts straight to the DOM, so React never
 * re-renders on motion.
 */
const depth = (d: number) => ({ '--depth': d } as CSSProperties)

export default function MicroBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const raRef = useRef<HTMLSpanElement>(null)
  const decRef = useRef<HTMLSpanElement>(null)
  const velRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    let raf = 0
    let mx = 0
    let my = 0
    let last = 0
    const t0 = performance.now()

    const tick = (now: number) => {
      // eased parallax (mouse stays centred on touch, so depths rest at 0)
      if (!isMobile) {
        const tx = appState.mouse.x / (window.innerWidth / 2)
        const ty = appState.mouse.y / (window.innerHeight / 2)
        mx += (tx - mx) * 0.05
        my += (ty - my) * 0.05
        const el = rootRef.current
        if (el) {
          el.style.setProperty('--mx', mx.toFixed(4))
          el.style.setProperty('--my', my.toFixed(4))
        }
      }

      // tick the telemetry ~10×/s so it reads as live navigation data; the
      // warp burst accelerates the drift, selling the jump as real travel.
      if (now - last > 90) {
        last = now
        const elapsed = (now - t0) / 1000
        const speed = 1 + appState.warp * 60

        const raTot = (50880 + elapsed * speed) % 86400
        const h = Math.floor(raTot / 3600)
        const m = Math.floor((raTot % 3600) / 60)
        const s = Math.floor(raTot % 60)
        if (raRef.current)
          raRef.current.textContent = `${String(h).padStart(2, '0')}ʰ${String(m).padStart(2, '0')}ᵐ${String(s).padStart(2, '0')}ˢ`

        const dec = 38.24 + Math.sin(elapsed * 0.07) * 5 + my * 7
        const dm = Math.abs(Math.round((Math.abs(dec) % 1) * 60))
        if (decRef.current)
          decRef.current.textContent = `${dec >= 0 ? '+' : '−'}${String(Math.floor(Math.abs(dec))).padStart(2, '0')}°${String(dm).padStart(2, '0')}′`

        const vel = 0.382 + appState.warp * 0.618 + Math.abs(mx) * 0.04
        if (velRef.current) velRef.current.textContent = `${vel.toFixed(3)} c`
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="micro-bg" ref={rootRef} aria-hidden>
      <div className="micro-bg-spiral parallax" style={depth(20)}>
        <GoldenSpiral />
      </div>

      <PhiGrid className="micro-bg-phi" />

      <RegMark className="micro-bg-reg parallax r1" style={depth(38)} />
      <RegMark className="micro-bg-reg parallax r2" style={depth(16)} />

      <DotGrid className="micro-bg-dots parallax d1" cols={7} rows={5} style={depth(30)} />
      <DotGrid className="micro-bg-dots parallax d2" cols={5} rows={7} style={depth(22)} />

      <div className="micro-tel tel-tl parallax" style={depth(12)}>
        <MicroLabel>NAV // DEEP FIELD</MicroLabel>
        <MicroLabel>
          R.A. <span ref={raRef}>14ʰ08ᵐ00ˢ</span>
        </MicroLabel>
        <MicroLabel>
          DEC <span ref={decRef}>+38°24′</span>
        </MicroLabel>
      </div>

      <div className="micro-tel tel-br parallax" style={depth(18)}>
        <MicroLabel>PHI {PHI.toFixed(10)}</MicroLabel>
        <MicroLabel>FIB 1·1·2·3·5·8·13·21·34</MicroLabel>
        <MicroLabel>
          VEC <span ref={velRef}>0.382 c</span>
        </MicroLabel>
      </div>
    </div>
  )
}
