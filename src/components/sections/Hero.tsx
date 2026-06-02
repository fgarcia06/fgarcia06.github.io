import { profile, highlights } from '../../data/profile'
import { HeroBackdrop } from '../canvas/HeroBackdrop'
import { Reveal } from '../ui/Reveal'

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen scroll-mt-24 overflow-hidden">
      <HeroBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col justify-center">
        <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] grid-cols-1 items-center gap-10 pt-20 pb-12 md:grid-cols-[1.3fr_0.7fr]">
          <div>
            <Reveal>
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-moss">
                Computer Engineering · Software Co-op
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-bone md:text-6xl">
                {profile.name}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 font-serif text-xl text-clay md:text-2xl">{profile.title}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 max-w-xl text-muted">{profile.tagline}</p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="rounded-full bg-moss px-5 py-2.5 font-semibold text-bg transition-transform hover:-translate-y-0.5"
                >
                  View Projects
                </a>
                <a
                  href="#about"
                  className="rounded-full border border-border px-5 py-2.5 font-semibold text-bone transition-colors hover:border-moss"
                >
                  See Experience
                </a>
                <a
                  href={profile.links.resume}
                  className="rounded-full border border-border px-5 py-2.5 font-semibold text-bone transition-colors hover:border-moss"
                >
                  Resume
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-6 flex gap-4 text-sm text-muted">
                <a href={profile.links.github} target="_blank" rel="noreferrer" className="hover:text-moss">
                  GitHub
                </a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="hover:text-moss">
                  LinkedIn
                </a>
                <a href={`mailto:${profile.email}`} className="hover:text-moss">
                  Email
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mx-auto w-full max-w-[320px]">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
              <img
                src={profile.portrait}
                alt={profile.name}
                className="aspect-square w-full object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] grid-cols-1 gap-4 pb-10 sm:grid-cols-3">
          {highlights.map((h, i) => (
            <Reveal key={h.label} delay={0.1 * i}>
              <div className="rounded-[var(--radius-card)] border border-border bg-surface/60 p-5 text-center backdrop-blur-sm">
                <strong className="block font-serif text-3xl text-moss">{h.value}</strong>
                <span className="mt-1 block text-sm text-muted">{h.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
