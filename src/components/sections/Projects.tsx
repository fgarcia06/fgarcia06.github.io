import { Section } from '../ui/Section'
import { Card } from '../ui/Card'
import { Tag } from '../ui/Tag'
import { projects } from '../../data/projects'

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Selected Projects"
      intro="Project summaries and technologies with hiring-relevant impact signals."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.title} className="overflow-hidden">
            <figure className="relative mb-4 aspect-video overflow-hidden rounded-xl border border-border">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              <figcaption className="absolute bottom-2 left-2 rounded-full border border-border bg-bg/80 px-3 py-1 text-xs">
                {p.label}
              </figcaption>
            </figure>
            <h3 className="font-serif text-xl text-bone">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.dates}</p>
            <p className="mt-3 text-bone/90">{p.summary}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-bone/90 marker:text-moss">
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
