import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { profile } from '../../data/profile'
import { Stagger, Item } from '../stage/Stagger'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { MagneticButton } from '../ui/MagneticButton'
import { useMouseParallax } from '../../hooks/useMouseParallax'

/** Decorative grid of faint dots that shifts with mouse parallax. */
function DotGrid({ accent, x, y }: { accent: string; x: MotionValue<number>; y: MotionValue<number> }) {
  const cols = 7
  const rows = 5
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ x, y }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2.4rem',
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: accent, opacity: 0.07 + (i % 3) * 0.03 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function ContactView({ accent }: { accent: string }) {
  const reduce = useReducedMotion()
  const { x: mouseX, y: mouseY } = useMouseParallax()
  const gridX = useTransform(mouseX, (v) => v * 12)
  const gridY = useTransform(mouseY, (v) => v * 8)
  const headX = useTransform(mouseX, (v) => v * -6)
  const headY = useTransform(mouseY, (v) => v * -4)

  return (
    <div className="relative">
      {!reduce && <DotGrid accent={accent} x={gridX} y={gridY} />}

      <GhostLabel text="Hello" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center text-center">
        <Item>
          <p className="mb-4 font-grotesk text-xs uppercase tracking-[0.3em] text-muted">
            <span style={{ color: accent }}>05</span> — Get in touch
          </p>
        </Item>

        {/* Heading drifts slightly opposite to the dot grid for depth */}
        <Item>
          <motion.h2
            className="font-serif font-bold leading-[0.9] tracking-[-0.03em] text-bone"
            style={{ fontSize: 'clamp(2rem, 7vw, 6rem)', x: headX, y: headY }}
          >
            Let's build
            <br />
            something.
          </motion.h2>
        </Item>

        <TextReveal
          text="Open to robotics, embedded, full-stack, and applied-ML roles."
          delay={0.25}
          className="mx-auto mt-5 max-w-md text-muted"
        />

        <Item>
          <a
            href={`mailto:${profile.email}`}
            data-cursor="grow"
            className="group mt-8 inline-flex max-w-full cursor-pointer items-center gap-3 break-words font-serif text-xl text-clay transition-colors hover:text-bone sm:text-2xl md:text-3xl"
          >
            {profile.email}
            <motion.span
              aria-hidden
              className="inline-block"
              style={{ color: accent }}
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </a>
        </Item>

        <Item className="mt-8 flex flex-wrap justify-center gap-3">
          <MagneticButton href={profile.links.linkedin} external className="rounded-full border border-border px-5 py-3 font-semibold text-bone transition-colors hover:border-moss sm:py-2.5">
            LinkedIn
          </MagneticButton>
          <MagneticButton href={profile.links.github} external className="rounded-full border border-border px-5 py-3 font-semibold text-bone transition-colors hover:border-moss sm:py-2.5">
            GitHub
          </MagneticButton>
          <MagneticButton href={`tel:+1${profile.phone.replace(/\D/g, '')}`} className="rounded-full border border-border px-5 py-3 font-semibold text-bone transition-colors hover:border-moss sm:py-2.5">
            {profile.phone}
          </MagneticButton>
        </Item>

        <Item className="mt-10 font-grotesk text-sm text-muted">Based in {profile.location}</Item>
      </Stagger>
    </div>
  )
}
