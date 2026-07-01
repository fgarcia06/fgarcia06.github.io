import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { loader } from './loader'
import { cinema } from './cinema'
import { appState, orbOpacityFor, shapeFor } from './appState'
import { home, sections, sectionById, siteTitle } from '../data/site'

/**
 * State-string router cloned from the reference's APP.go: states are
 * "home", "projects", "projects/<slug>", … pushed onto real history entries.
 *
 * Timing choreography for detail pages matches main.js exactly:
 *   t=0     loader.show(0); previous page starts sliding out
 *   t=500   loader.update(.7)
 *   t=800   detail data swaps in
 *   t=1000  detail page slides in; loader completes and hides
 */

interface RouterValue {
  /** The requested route (updates immediately). */
  state: string
  /** Route whose page is currently shown ('' while a detail loads). */
  visibleState: string
  /** Route whose detail data is rendered (lags 800ms on detail loads). */
  dataState: string
  go: (state: string, push?: boolean) => void
  /** True during a real navigation click (false on boot/silent). Page
   *  components use this to decide spring-in vs instant-show. */
  isAnimatingRef: React.MutableRefObject<boolean>
}

const RouterContext = createContext<RouterValue | null>(null)

function titleFor(state: string): string {
  const [section, page] = state.split('/')
  if (section === 'home' || !section) return home.pageTitle
  if (section === 'about') return 'Francis Garcia | About'
  if (section === 'skills') return 'Francis Garcia | Skills'
  const s = sectionById(section)
  if (!s) return siteTitle
  if (page) {
    const item = s.list.find((l) => l.slug === page)
    if (item) return `Francis Garcia | ${item.title}`
  }
  return s.pageTitle
}

function isValid(state: string): boolean {
  const [section, page] = state.split('/')
  if (section === 'home' || section === 'about' || section === 'skills') return !page
  const s = sectionById(section)
  if (!s) return false
  if (!page) return true
  return s.list.some((l) => l.slug === page)
}

/** Eased scroll back to top over 1s, like the reference's jQuery animate. */
function scrollToTop() {
  const start = window.scrollY
  if (start <= 0) return
  const t0 = performance.now()
  const dur = 1000
  const step = (now: number) => {
    const t = Math.min((now - t0) / dur, 1)
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    window.scrollTo(0, start * (1 - ease))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function stateFromLocation(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
  return path === '' ? 'home' : path
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState('loading')
  const [visibleState, setVisibleState] = useState('')
  const [dataState, setDataState] = useState('')
  const stateRef = useRef(state)
  const timers = useRef<number[]>([])
  /** Set to true for the full 5s cinema duration on each real navigation;
   *  stays false on boot so pages appear instantly without the spring. */
  const isAnimatingRef = useRef(false)

  // `silent` suppresses the cinematic transition (used for the first boot
  // nav, where the page is arriving rather than cutting between scenes).
  const go = useCallback((next: string, push = true, silent = false) => {
    // legacy routes from before the work→projects / info→about rename
    next = next.replace(/^work(\/|$)/, 'projects$1').replace(/^info$/, 'about')
    if (stateRef.current === next) return
    if (!isValid(next)) next = 'home'
    const isDetail = next.includes('/')

    timers.current.forEach(clearTimeout)
    timers.current = []

    stateRef.current = next
    setState(next)
    document.title = titleFor(next)
    appState.orbTarget = orbOpacityFor(next)
    appState.shapeTarget = shapeFor(next)
    // kick the Tacet Mark's section-change burst (decayed in Background)
    appState.pulse = 1.0
    // spike the hyperspace warp; it decays slowly in Background so the starfield
    // streaks forward then decelerates — the long, motion-driven "travel" beat
    appState.warp = 1.0
    // play the cinematic letterbox "scene cut" (skipped on the first boot nav)
    if (!silent) {
      const sector = next.split('/')[0]
      cinema.play(next === 'home' ? 'home' : isDetail ? 'detail' : 'section', sector)
      // arm the page spring for this navigation; cleared after 5.1s (cinema + margin)
      isAnimatingRef.current = true
      timers.current.push(
        window.setTimeout(() => { isAnimatingRef.current = false }, 5100),
      )
    }
    if (push) {
      window.history.pushState(next, '', next === 'home' ? '/' : `/${next}`)
    }

    if (isDetail) {
      loader.update(0)
      loader.show()
      // hold an empty frame while we "travel": the outgoing page fades out, the
      // letterbox squeezes shut, then the detail arrives as the bars open.
      // Timed to the 5s cinema: bars close at 0.65s, hold 0.65-3.1s, retract 3.1-5s.
      setVisibleState('')
      timers.current.push(
        window.setTimeout(() => loader.update(0.7), 1500),
        window.setTimeout(() => setDataState(next), 2500),
        window.setTimeout(() => {
          setVisibleState(next)
          loader.update(1)
          loader.hide()
        }, 3100),
      )
    } else {
      setDataState(next)
      if (silent) {
        // boot / history-restore with no cinema: arrive instantly, no travel
        setVisibleState(next)
      } else {
        // Three-beat warp jump, staggered so the flow reads as a journey:
        //   1. exit   — current page squeezes + fades away (0–0.65s)
        //   2. travel — visibleState='' holds an EMPTY frame while the bars hold
        //      shut and the starfield streaks past for ~2.45s (0.65–3.1s)
        //   3. arrive — new section springs in as bars retract (3.1–5.0s)
        // Timing is keyed to the 5s cinema (bars close=13%, hold=13-62%, open=62-100%).
        setVisibleState('')
        timers.current.push(window.setTimeout(() => setVisibleState(next), next === 'home' ? 2600 : 3100))
      }
    }

    window.setTimeout(scrollToTop, 50)
  }, [])

  // boot: resolve initial state (incl. the GitHub Pages 404 redirect) and
  // listen for back/forward.
  useEffect(() => {
    const redirected = sessionStorage.getItem('spa-redirect')
    if (redirected) {
      sessionStorage.removeItem('spa-redirect')
      window.history.replaceState(null, '', redirected)
    }
    go(stateFromLocation(), false, true)

    const onPop = (e: PopStateEvent) => {
      const s = typeof e.state === 'string' && e.state ? e.state : stateFromLocation()
      go(s, false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [go])

  return (
    <RouterContext.Provider value={{ state, visibleState, dataState, go, isAnimatingRef }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter outside RouterProvider')
  return ctx
}

export { sections }
