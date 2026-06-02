import { Nav } from './components/sections/Nav'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Projects } from './components/sections/Projects'
import { Skills } from './components/sections/Skills'
import { Contact } from './components/sections/Contact'
import { profile } from './data/profile'
import { useLenis } from './hooks/useLenis'
import { useIsMobile, usePrefersReducedMotion } from './hooks/useMediaQuery'

export default function App() {
  const isMobile = useIsMobile()
  const reduceMotion = usePrefersReducedMotion()
  // Native scrolling on phones and when reduced motion is requested.
  useLenis(!isMobile && !reduceMotion)

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-wrap justify-between gap-3 border-t border-border py-6 text-sm text-muted">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href="#hero" className="text-moss hover:underline">
          Back to top
        </a>
      </footer>
    </div>
  )
}
