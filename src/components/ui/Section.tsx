import { Reveal } from './Reveal'

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string
  eyebrow?: string
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mx-auto w-[min(1120px,calc(100%-2rem))] scroll-mt-24 py-16">
      <Reveal>
        <header className="mb-8 max-w-2xl">
          {eyebrow && (
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-moss">{eyebrow}</p>
          )}
          <h2 className="font-serif text-3xl leading-tight text-bone md:text-4xl">{title}</h2>
          {intro && <p className="mt-3 text-muted">{intro}</p>}
        </header>
      </Reveal>
      {children}
    </section>
  )
}
