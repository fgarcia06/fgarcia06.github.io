import { AnimatePresence } from 'framer-motion'
import { chapters } from './chapters'
import { useChapterNav } from './hooks/useChapterNav'
import { PersistentBackdrop } from './components/canvas/PersistentBackdrop'
import { Cursor } from './components/ui/Cursor'
import { Intro } from './components/stage/Intro'
import { TopBar } from './components/stage/TopBar'
import { ChapterNav } from './components/stage/ChapterNav'
import { ChapterCounter } from './components/stage/ChapterCounter'
import { Stage } from './components/stage/Stage'
import { HomeView } from './components/views/HomeView'
import { AboutView } from './components/views/AboutView'
import { WorkView } from './components/views/WorkView'
import { SkillsView } from './components/views/SkillsView'
import { ContactView } from './components/views/ContactView'

export default function App() {
  const { index, direction, go, next, prev } = useChapterNav()
  const accent = chapters[index].accent

  function renderView() {
    switch (index) {
      case 0:
        return <HomeView go={go} />
      case 1:
        return <AboutView accent={accent} />
      case 2:
        return <WorkView accent={accent} />
      case 3:
        return <SkillsView accent={accent} />
      default:
        return <ContactView accent={accent} />
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-bone"
      >
        Skip to content
      </a>

      <Intro />
      <PersistentBackdrop accent={accent} mood={index} />
      <Cursor />
      <TopBar index={index} onSelect={go} />
      <ChapterNav index={index} onSelect={go} />

      <main id="main" tabIndex={-1} className="relative z-10 h-full outline-none">
        <AnimatePresence mode="wait" custom={direction}>
          <Stage key={chapters[index].id} direction={direction}>
            {renderView()}
          </Stage>
        </AnimatePresence>
      </main>

      <ChapterCounter index={index} onPrev={prev} onNext={next} />
    </div>
  )
}
