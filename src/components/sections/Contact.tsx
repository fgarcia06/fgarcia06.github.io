import { Section } from '../ui/Section'
import { Card } from '../ui/Card'
import { profile } from '../../data/profile'

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="Get in touch"
      title="Contact"
      intro="Open to backend, embedded software, and full-stack internship or new-grad opportunities."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-serif text-xl text-bone">Reach Out</h3>
          <p className="mt-2 text-muted">
            Email is the fastest way to connect for interviews, project discussions, or technical
            opportunities.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href={`mailto:${profile.email}`} className="text-bone hover:text-moss">
              {profile.email}
            </a>
            <a href={`tel:+1${profile.phone.replace(/\D/g, '')}`} className="text-bone hover:text-moss">
              {profile.phone}
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="font-serif text-xl text-bone">Profiles</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="text-bone hover:text-moss">
                linkedin.com/in/fgarcia06
              </a>
            </li>
            <li>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="text-bone hover:text-moss">
                github.com/fgarcia06
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted">Location: {profile.location}</p>
        </Card>
      </div>
    </Section>
  )
}
