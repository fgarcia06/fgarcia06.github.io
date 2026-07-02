import { useEffect, useRef, type CSSProperties } from 'react'
import Page from '../Page'
import { sections, skills } from '../../../data/site'
import { useRouter } from '../../../lib/router'
import { appState, shapeFor, orbOpacityFor } from '../../../lib/appState'
import { isMobile, prefersReducedMotion } from '../../../lib/device'
import { RegMark, MicroLabel } from '../Micro'

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
