import { Item } from './Stagger'
import { TextReveal } from '../ui/TextReveal'

/** Centered chapter header: numbered grotesk eyebrow + oversized title. */
export function ViewHeader({
  no,
  eyebrow,
  title,
  intro,
  accent,
}: {
  no: number
  eyebrow: string
  title: string
  intro?: string
  accent: string
}) {
  return (
    <Item className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 flex items-center justify-center gap-3 font-grotesk text-xs uppercase tracking-[0.3em] text-muted">
        <span className="tabular-nums" style={{ color: accent }}>
          0{no}
        </span>
        <span className="h-px w-10" style={{ backgroundColor: accent }} />
        {eyebrow}
      </p>
      <h2
        className="font-serif font-bold leading-[0.95] tracking-[-0.03em] text-bone"
        style={{ fontSize: 'var(--text-giant)' }}
      >
        {title}
      </h2>
      {intro && (
        <TextReveal
          text={intro}
          delay={0.2}
          className="mx-auto mt-4 max-w-xl text-lg text-muted"
        />
      )}
    </Item>
  )
}
