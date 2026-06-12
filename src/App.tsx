import { Suspense, lazy, useEffect } from 'react'
import { RouterProvider } from './lib/router'
import { sections } from './data/site'
import { bindMouse } from './lib/appState'
import { isMobile } from './lib/device'
import { Header, FooterMenu, LoaderBar, Bars } from './components/ui/Chrome'
import { HomePage, SectionPage, InfoPage, DetailPage } from './components/ui/Pages'

// The WebGL layer is the heaviest chunk — load it lazily; the static
// radial-gradient .background div underneath doubles as its fallback.
const Background = lazy(() => import('./components/canvas/Background'))

export default function App() {
  useEffect(() => {
    if (!isMobile) bindMouse()
  }, [])

  return (
    <RouterProvider>
      {/* static gradient backdrop, identical to the reference's .background */}
      <div className="background" />
      <Suspense fallback={null}>
        <Background />
      </Suspense>

      <HomePage />
      {sections.map((s) => (
        <SectionPage key={s.id} section={s} />
      ))}
      {sections.map((s) => (
        <DetailPage key={`${s.id}-detail`} section={s} />
      ))}
      <InfoPage />

      <FooterMenu />
      <Header />
      <LoaderBar />
      <Bars />
    </RouterProvider>
  )
}
