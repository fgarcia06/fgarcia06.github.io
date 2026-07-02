import Page from '../Page'
import { about, social } from '../../../data/site'
import { useRouter } from '../../../lib/router'
import { GitHubIcon, LinkedInIcon, EmailIcon } from '../icons'
import {
  MicroLabel,
  RegMark,
  AspectBracket,
  MicroFrame,
} from '../Micro'

/* ------------------------------------------------------------------ */
/* about                                                               */
/* ------------------------------------------------------------------ */

export function AboutPage() {
  const { visibleState } = useRouter()
  return (
    <Page id="about" active={visibleState === 'about'}>
      <div className="page-title" data-aos="zoom-in">
        {about.title}
      </div>
      <div className="section-caption" data-aos="fade-in" aria-hidden>
        <RegMark />
        <MicroLabel>[ PROFILE ] EDMONTON, AB · COMPUTER ENGINEERING</MicroLabel>
        <AspectBracket ratio="MG_990X" />
      </div>
      <div className="feature" data-aos="zoom-in">
        <div className="feature-content">
          <MicroFrame className="portrait-frame" caption="SUBJECT_01 · PORTRAIT">
            <img className="info-portrait" src={about.portrait} alt="Francis Garcia" />
          </MicroFrame>
        </div>
      </div>

      <div className="bio-title section-title" data-aos="fade-in">
        [ bio ]
      </div>
      <div className="bio" data-aos="fade-in">
        {about.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="education-block info-block">
        <div className="section-title" data-aos="fade-in">
          [ education ]
        </div>
        <div className="education" data-aos="fade-in">
          <div className="experience-role">{about.education.degree}</div>
          <div className="experience-org">
            {about.education.school} — {about.education.location} · {about.education.dates}
          </div>
        </div>
      </div>

      <div className="experience-block info-block">
        <div className="section-title" data-aos="fade-in">
          [ experience ]
        </div>
        <div className="experience-list">
          {about.experience.map((job) => (
            <div className="experience-item" data-aos="fade-in" key={job.org}>
              <div className="experience-role">{job.role}</div>
              <div className="experience-org">
                {job.org} — {job.location} · {job.dates}
              </div>
              <ul>
                {job.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="social-block info-block">
        <div className="social-title section-title" data-aos="fade-in">
          [ contact | social ]
        </div>
        <div className="contact-line" data-aos="fade-in">
          {about.contact.email} · {about.contact.phone} · {about.contact.location}
        </div>
        <div className="social-list" data-aos="fade-in">
          {social.map((s) => (
            <a
              key={s.title}
              className="social-link list-item"
              href={s.url}
              target={s.url.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              title={s.title}
            >
              {s.icon === 'github' && <GitHubIcon />}
              {s.icon === 'linkedin' && <LinkedInIcon />}
              {s.icon === 'email' && <EmailIcon />}
            </a>
          ))}
        </div>
      </div>
    </Page>
  )
}
