import { useEffect, useState } from 'react'
import { menu } from '../../data/site'
import { useRouter } from '../../lib/router'
import { loader } from '../../lib/loader'

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

export function FooterMenu() {
  const { state, go } = useRouter()
  const onHome = state === 'home'
  return (
    <div className={`footer-menu ${onHome ? 'show' : ''}`}>
      <ul className="menu-items">
        {menu
          .filter((m) => m.link !== 'home')
          .map((m) => (
            <li key={m.link} className="menu-item" onClick={() => go(m.link)}>
              {m.title}
            </li>
          ))}
      </ul>
    </div>
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
