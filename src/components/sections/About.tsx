import { Section } from '../ui/Section'
import { Card } from '../ui/Card'
import { education, experience } from '../../data/experience'

export function About() {
  return (
    <Section
      id="about"
      eyebrow="Background"
      title="About & Experience"
      intro="Education and work focused on automation software, verification, and data-driven system evaluation."
    >
      <Card className="mb-6">
        <h3 className="font-serif text-xl text-bone">{education.school}</h3>
        <p className="mt-1 text-sm text-muted">
          {education.location} · {education.dates}
        </p>
        <p className="mt-3 text-bone/90">{education.degree}</p>
        <p className="mt-3 text-sm text-muted">
          <span className="text-bone/80">Relevant coursework: </span>
          {education.coursework}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {experience.map((job) => (
          <Card key={job.role + job.org}>
            <h3 className="font-serif text-xl text-bone">
              {job.role} · {job.org}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {job.location} · {job.dates}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-bone/90 marker:text-moss">
              {job.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}
