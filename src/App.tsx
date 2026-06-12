import { useMemo, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { chapters } from './chapters'
import { useSmoothScroll, scrollToId } from './hooks/useLenis'
import { useActiveSection } from './hooks/useActiveSection'
import { usePrefersReducedMotion, useIsMobile } from './hooks/useMediaQuery'
import { PersistentBackdrop } from './components/canvas/PersistentBackdrop'
import { Cursor } from './components/ui/Cursor'
import { ScanlineOverlay } from './components/ui/HudDecor'
import { Intro } from './components/stage/Intro'
import { TopBar } from './components/stage/TopBar'
import { ChapterNav } from './components/stage/ChapterNav'
import { ScrollProgress } from './components/stage/ScrollProgress'
import { HomeView } from './components/views/HomeView'
import { AboutView } from './components/views/AboutView'
import { WorkView } from './components/views/WorkView'
import { SkillsView } from './components/views/SkillsView'
import { ContactView } from './components/views/ContactView'
import { profile } from './data/profile'

const SECTION_IDS = chapters.map((c) => c.id)

/** One scroll chapter: full-bleed section with the shared content column. */
function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="relative flex min-h-dvh items-center">
      <div className="mx-auto w-[min(1120px,calc(100%-2.5rem))] py-24 md:py-32">{children}</div>
    </section>
  )
}

export default function App() {
  useSmoothScroll()
  const reduce = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const index = useActiveSection(SECTION_IDS)
  const accent = chapters[index].accent

  // Scroll-velocity skew — the page leans into fast scrolls and settles back.
  // Skipped on phones: skewing the whole page every scroll frame repaints the
  // entire document and is the single biggest cause of mobile scroll jank.
  const skewOff = reduce || isMobile
  const { scrollY, scrollYProgress } = useScroll()
  const velocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(velocity, { stiffness: 260, damping: 48, mass: 0.6 })
  const skewY = useTransform(smoothVelocity, [-2600, 2600], [-1.2, 1.2], { clamp: true })

  const sections = useMemo(
    () => [
      { id: 'home', node: <HomeView /> },
      { id: 'about', node: <AboutView accent={chapters[1].accent} /> },
      { id: 'work', node: <WorkView accent={chapters[2].accent} /> },
      { id: 'skills', node: <SkillsView accent={chapters[3].accent} /> },
      { id: 'contact', node: <ContactView accent={chapters[4].accent} /> },
    ],
    [],
  )

  return (
    <div className="relative w-full bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-bone"
      >
        Skip to content
      </a>

      <Intro />
      <PersistentBackdrop accent={accent} progress={scrollYProgress} />
      <ScanlineOverlay />
      <Cursor />
      <ScrollProgress accent={accent} />
      <TopBar index={index} />
      <ChapterNav index={index} />

      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <motion.div style={skewOff ? undefined : { skewY, transformOrigin: '50% 50%' }}>
          {sections.map((s) => (
            <Section key={s.id} id={s.id}>
              {s.node}
            </Section>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex min-h-[72px] w-[min(1120px,calc(100%-2.5rem))] flex-wrap items-center justify-between gap-3 py-4">
          <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-muted">
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </p>
          <button
            onClick={() => scrollToId('home')}
            data-cursor="grow"
            className="cursor-pointer font-grotesk text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-moss"
          >
            Back to top ↑
          </button>
        </div>
      </footer>
    </div>
  )
}
