import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../../data/profile'
import { Stagger, Item } from '../stage/Stagger'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { MagneticButton } from '../ui/MagneticButton'
import { Parallax } from '../scroll/Parallax'
import { Readout, Diamond, Waveform } from '../ui/HudDecor'

/** Decorative grid of faint dots riding a deep scroll-parallax plane. */
function DotGrid({ accent }: { accent: string }) {
  const cols = 7
  const rows = 5
  return (
    <Parallax speed={0.7} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div aria-hidden className="absolute inset-0">
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
      </div>
    </Parallax>
  )
}

export function ContactView({ accent }: { accent: string }) {
  const reduce = useReducedMotion()

  return (
    <div className="relative">
      {!reduce && <DotGrid accent={accent} />}

      <GhostLabel text="Hello" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center text-center">
        <Item>
          <p className="mb-4 flex items-center justify-center gap-2.5">
            <Diamond size={5} color="var(--color-cyber)" />
            <Readout color="var(--color-cyber)" flicker>
              Transmission open
            </Readout>
            <Readout color="rgba(231,234,242,0.35)">// 05 — Get in touch</Readout>
          </p>
        </Item>

        {/* Heading rides a slightly faster plane than the page for depth */}
        <Item>
          <Parallax speed={-0.18}>
            <h2
              className="font-serif font-bold leading-[1.02] tracking-[-0.02em] text-bone"
              style={{ fontSize: 'clamp(2rem, 7vw, 6rem)' }}
            >
              Let's build
              <br />
              something.
            </h2>
          </Parallax>
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
            className="group mt-8 inline-flex max-w-full cursor-pointer items-center gap-3 break-words font-serif text-xl font-medium text-clay transition-colors hover:text-bone sm:text-2xl md:text-3xl"
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

        <Item>
          <Waveform bars={16} color={accent} className="mt-5 opacity-60" />
        </Item>

        <Item className="mt-8 flex flex-wrap justify-center gap-3">
          <MagneticButton href={profile.links.linkedin} external chamfer className="border border-border px-5 py-3 font-semibold text-bone transition-colors duration-200 hover:border-moss sm:py-2.5">
            LinkedIn
          </MagneticButton>
          <MagneticButton href={profile.links.github} external chamfer className="border border-border px-5 py-3 font-semibold text-bone transition-colors duration-200 hover:border-moss sm:py-2.5">
            GitHub
          </MagneticButton>
          <MagneticButton href={`tel:+1${profile.phone.replace(/\D/g, '')}`} chamfer className="border border-border px-5 py-3 font-semibold text-bone transition-colors duration-200 hover:border-moss sm:py-2.5">
            {profile.phone}
          </MagneticButton>
        </Item>

        <Item className="mt-10 font-grotesk text-sm text-muted">Based in {profile.location}</Item>
      </Stagger>
    </div>
  )
}
