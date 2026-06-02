import { Section } from '../ui/Section'
import { Card } from '../ui/Card'
import { Tag } from '../ui/Tag'
import { skillGroups } from '../../data/skills'

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Toolkit"
      title="Technical Skills"
      intro="Software engineering capabilities highlighted for internship and early-career software roles."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {skillGroups.map((g) => (
          <Card key={g.title}>
            <h3 className="font-serif text-lg text-bone">{g.title}</h3>
            {g.tags && (
              <div className="mt-3 flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            )}
            {g.items && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-bone/90 marker:text-moss">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </Section>
  )
}
