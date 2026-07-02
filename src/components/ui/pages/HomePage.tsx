import Page from '../Page'
import { home } from '../../../data/site'
import { useRouter } from '../../../lib/router'

/* ------------------------------------------------------------------ */
/* home                                                                */
/* ------------------------------------------------------------------ */

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
