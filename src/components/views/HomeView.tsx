import { motion, useReducedMotion } from 'framer-motion'
import { profile, highlights } from '../../data/profile'
import { Stagger, Item } from '../stage/Stagger'
import { GhostLabel } from '../stage/GhostLabel'
import { SplitText } from '../ui/SplitText'
import { TextReveal } from '../ui/TextReveal'
import { MagneticButton } from '../ui/MagneticButton'
import { CountUp } from '../ui/CountUp'

export function HomeView({ go }: { go: (i: number) => void }) {
  const reduce = useReducedMotion()

  return (
    <div className="relative flex flex-col items-center text-center">
      <GhostLabel text="Profile" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center">
        {/* Profile image */}
        <Item>
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto h-28 w-28 md:h-32 md:w-32"
          >
            <div
              aria-hidden
              className="absolute -inset-1.5 rounded-full opacity-60 blur-md"
              style={{ background: 'conic-gradient(from 180deg, #9caa7b, #c79a6a, #9caa7b)' }}
            />
            <img
              src={profile.portrait}
              alt="Francis Garcia"
              className="relative h-full w-full rounded-full border border-border object-cover"
            />
          </motion.div>
        </Item>

        <Item>
          <p className="mt-6 font-grotesk text-xs uppercase tracking-[0.3em] text-moss">
            Computer Engineering · Robotics &amp; Software
          </p>
        </Item>

        {/* Oversized centered name */}
        <SplitText
          as="h1"
          text="Francis"
          className="mt-2 block text-center font-serif font-bold leading-[0.86] tracking-[-0.04em] text-bone text-[length:var(--text-mega)]"
          delay={0}
        />
        <SplitText
          as="h1"
          text="Garcia"
          className="block text-center font-serif font-bold leading-[0.86] tracking-[-0.04em] text-clay text-[length:var(--text-mega)]"
          delay={0.12}
        />

        <TextReveal
          text={profile.statement}
          delay={0.35}
          className="mx-auto mt-6 max-w-2xl text-center font-serif italic leading-tight text-bone/90"
        />
        <TextReveal
          text={profile.tagline}
          delay={0.5}
          className="mx-auto mt-3 max-w-md text-center text-muted"
        />

        <Item>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton onClick={() => go(2)} className="rounded-full bg-moss px-6 py-3 font-semibold text-bg">
              View Work
            </MagneticButton>
            <MagneticButton
              onClick={() => go(4)}
              className="rounded-full border border-border px-6 py-3 font-semibold text-bone transition-colors hover:border-moss"
            >
              Get in Touch
            </MagneticButton>
            <MagneticButton
              href={profile.links.resume}
              className="rounded-full px-4 py-3 font-grotesk text-sm uppercase tracking-widest text-muted transition-colors hover:text-bone"
            >
              Résumé →
            </MagneticButton>
          </div>
        </Item>

        {/* Centered count-up stats */}
        <Item className="w-full">
          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-6">
            {highlights.map((h) => (
              <div key={h.label} className="flex flex-col items-center">
                <dt>
                  <CountUp value={h.value} className="font-serif text-4xl font-bold text-moss md:text-5xl" />
                </dt>
                <dd className="mt-1 max-w-[18ch] text-xs leading-snug text-muted">{h.label}</dd>
              </div>
            ))}
          </dl>
        </Item>
      </Stagger>
    </div>
  )
}
