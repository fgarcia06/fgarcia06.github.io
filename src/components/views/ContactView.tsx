import { profile } from '../../data/profile'
import { Stagger, Item } from '../stage/Stagger'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { MagneticButton } from '../ui/MagneticButton'

export function ContactView({ accent }: { accent: string }) {
  return (
    <div className="relative">
      <GhostLabel text="Hello" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center text-center">
        <Item>
          <p className="mb-4 font-grotesk text-xs uppercase tracking-[0.3em] text-muted">
            <span style={{ color: accent }}>05</span> — Get in touch
          </p>
        </Item>

        <Item>
          <h2
            className="font-serif font-bold leading-[0.9] tracking-[-0.03em] text-bone"
            style={{ fontSize: 'var(--text-giant)' }}
          >
            Let's build
            <br />
            something.
          </h2>
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
            className="group mt-8 inline-flex cursor-pointer items-center gap-3 font-serif text-2xl text-clay transition-colors hover:text-bone md:text-3xl"
          >
            {profile.email}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: accent }}>
              →
            </span>
          </a>
        </Item>

        <Item className="mt-8 flex flex-wrap justify-center gap-3">
          <MagneticButton href={profile.links.linkedin} external className="rounded-full border border-border px-5 py-2.5 font-semibold text-bone transition-colors hover:border-moss">
            LinkedIn
          </MagneticButton>
          <MagneticButton href={profile.links.github} external className="rounded-full border border-border px-5 py-2.5 font-semibold text-bone transition-colors hover:border-moss">
            GitHub
          </MagneticButton>
          <MagneticButton href={`tel:+1${profile.phone.replace(/\D/g, '')}`} className="rounded-full border border-border px-5 py-2.5 font-semibold text-bone transition-colors hover:border-moss">
            {profile.phone}
          </MagneticButton>
        </Item>

        <Item className="mt-10 font-grotesk text-sm text-muted">Based in {profile.location}</Item>
      </Stagger>
    </div>
  )
}
