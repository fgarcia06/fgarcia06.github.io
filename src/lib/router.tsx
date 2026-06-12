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
import { appState, orbOpacityFor } from './appState'
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
}

const RouterContext = createContext<RouterValue | null>(null)

function titleFor(state: string): string {
  const [section, page] = state.split('/')
  if (section === 'home' || !section) return home.pageTitle
  if (section === 'about') return 'Francis Garcia | About'
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
  if (section === 'home' || section === 'about') return !page
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

  const go = useCallback((next: string, push = true) => {
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
    if (push) {
      window.history.pushState(next, '', next === 'home' ? '/' : `/${next}`)
    }

    if (isDetail) {
      loader.update(0)
      loader.show()
      // everything slides out while the loader runs
      setVisibleState('')
      timers.current.push(
        window.setTimeout(() => loader.update(0.7), 500),
        window.setTimeout(() => setDataState(next), 800),
        window.setTimeout(() => {
          setVisibleState(next)
          loader.update(1)
          loader.hide()
        }, 1000),
      )
    } else {
      setDataState(next)
      setVisibleState(next)
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
    go(stateFromLocation(), false)

    const onPop = (e: PopStateEvent) => {
      const s = typeof e.state === 'string' && e.state ? e.state : stateFromLocation()
      go(s, false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [go])

  return (
    <RouterContext.Provider value={{ state, visibleState, dataState, go }}>
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
