import { useEffect, useState, type CSSProperties } from 'react'
import Page from './Page'
import Thumb from './Thumb'
import { home, about, skills, social, shareUrls, detailFor, relatedFor, type Section, type ListItem } from '../../data/site'
import { useRouter } from '../../lib/router'
import { useTilt } from '../../lib/tilt'
import { GitHubIcon, LinkedInIcon, EmailIcon, TwitterIcon, FacebookIcon } from './icons'

/* ------------------------------------------------------------------ */
/* home                                                                */
/* ------------------------------------------------------------------ */

export function HomePage() {
  const { visibleState } = useRouter()
  return (
    <Page id="home" active={visibleState === 'home'}>
      <div className="titles">
        <div className="page-title" data-aos="fade-in" style={{ transitionDuration: '2s' }}>
          {home.title}
        </div>
        <div
          className="page-subtitle"
          data-aos="fade-in"
          style={{ transitionDuration: '2s', transitionDelay: '.4s' }}
        >
          {home.subtitle}
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* section list pages (projects / prototypes)                          */
/* ------------------------------------------------------------------ */

function ListEntry({ item, align, onOpen }: { item: ListItem; align: string; onOpen: () => void }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      data-aos="fade-up"
      className={`list-item work-item ${align}`}
      style={{ '--accent': item.project.accent } as CSSProperties}
      onClick={onOpen}
    >
      <div className="tilt" ref={tilt}>
        <Thumb project={item.project} className="thumb-img" />
        <div className="titles">
          <div className="subtitle">{item.subtitle}</div>
          <div className="title">{item.title}</div>
        </div>
      </div>
    </div>
  )
}

export function SectionPage({ section }: { section: Section }) {
  const { visibleState, go } = useRouter()
  return (
    <Page id={section.id} active={visibleState === section.id}>
      <div className="page-title" data-aos="zoom-in">
        {section.title}
      </div>
      <div className="page-subtitle" data-aos="zoom-in">
        {section.subtitle}
      </div>
      <div className="page-content"></div>
      <div className="list">
        {section.list.map((item, i) => (
          <ListEntry
            key={item.slug}
            item={item}
            align={i % 2 === 0 ? 'right' : ''}
            onOpen={() => go(`${section.id}/${item.slug}`)}
          />
        ))}
        {section.todo && (
          <div className="todo-content" data-aos="fade-in">
            {section.todo}
          </div>
        )}
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* skills                                                              */
/* ------------------------------------------------------------------ */

function SkillCard({ group, index }: { group: (typeof skills.groups)[number]; index: number }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      className="skill-card"
      data-aos="fade-up"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="skill-card-tilt" ref={tilt}>
        {/* angular Tacet-style corner brackets */}
        <span className="skill-corner tl" />
        <span className="skill-corner br" />
        <div className="skill-card-head">
          <span className="skill-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="skill-card-title">{group.title}</span>
          <span className="skill-glyph" aria-hidden>◆</span>
        </div>
        <div className="skill-scanline" />
        <div className="skill-tags">
          {group.tags.map((t) => (
            <span className="skill-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkillsPage() {
  const { visibleState } = useRouter()
  return (
    <Page id="skills" active={visibleState === 'skills'}>
      <div className="page-title" data-aos="zoom-in">
        {skills.title}
      </div>
      <div className="page-subtitle" data-aos="zoom-in">
        {skills.subtitle}
      </div>

      <div className="skills-block info-block">
        <div className="section-title" data-aos="fade-in">
          [ resonance stack ]
        </div>
        <div className="skills-grid">
          {skills.groups.map((g, i) => (
            <SkillCard key={g.title} group={g} index={i} />
          ))}
        </div>
      </div>
    </Page>
  )
}

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
      <div className="page-subtitle" data-aos="zoom-in">
        {about.subtitle}
      </div>
      <div className="feature" data-aos="zoom-in">
        <div className="feature-content">
          <img className="info-portrait" src={about.portrait} alt="Francis Garcia" />
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

/* ------------------------------------------------------------------ */
/* detail pages                                                        */
/* ------------------------------------------------------------------ */

function RelatedEntry({ item, onOpen }: { item: ListItem; onOpen: () => void }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      className="tilt list-item"
      ref={tilt}
      style={{ '--accent': item.project.accent } as CSSProperties}
      onClick={onOpen}
    >
      <Thumb project={item.project} className="thumb-img" />
      <div className="titles">
        <div className="subtitle">{item.subtitle}</div>
        <div className="title">{item.title}</div>
      </div>
    </div>
  )
}

export function DetailPage({ section }: { section: Section }) {
  const { visibleState, dataState, go } = useRouter()
  const prefix = `${section.id}/`
  const [slug, setSlug] = useState<string | null>(null)

  // swap content only when the router's dataState reaches this section,
  // so the outgoing page keeps its old content while sliding away
  useEffect(() => {
    if (dataState.startsWith(prefix)) setSlug(dataState.slice(prefix.length))
  }, [dataState, prefix])

  if (section.list.length === 0) return null
  const detail = slug ? detailFor(section, slug) : undefined
  const active = visibleState.startsWith(prefix)

  const share = (kind: 'twitter' | 'facebook') => {
    if (!detail) return
    const urls = shareUrls(detail.item.title)
    window.open(
      urls[kind],
      `${kind} share`,
      `width=600,height=400,top=${window.innerHeight / 2 - 200},left=${window.innerWidth / 2 - 300}`,
    )
  }

  const related = detail ? relatedFor(section, detail.item) : []

  return (
    <Page id={`${section.id}-detail`} active={active} dataKey={slug ?? ''}>
      {detail && (
        <>
          <div className="page-title" data-aos="zoom-in">
            {detail.item.title}
          </div>
          <div className="page-subtitle" data-aos="zoom-in">
            {detail.item.project.label}
          </div>
          <div className="feature" data-aos="fade-in">
            <div className="feature-content">
              {/* TODO(content): reference shows a project video/gallery here;
                  no captures exist in my sources — generated visual instead */}
              <Thumb project={detail.item.project} className="feature-thumb sixteen-nine" />
            </div>
          </div>

          <div className="next-button" data-aos="fade-left" onClick={() => go(`${prefix}${detail.next.slug}`)}>
            <svg className="next-button-circle" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="47" fill="none" stroke="#fff" strokeWidth="2" />
            </svg>
            <svg className="next-button-arrow" viewBox="0 0 100 40">
              <path d="M2 20 H92 M76 6 L94 20 L76 34" fill="none" stroke="#fff" strokeWidth="3" />
            </svg>
          </div>

          <div className="client" data-aos="fade-in">
            <b>Context: </b>
            {detail.item.project.context}
          </div>
          <div className="role" data-aos="fade-in">
            <b>Stack: </b>
            {detail.item.project.label}
          </div>

          <div className="content-title section-title" data-aos="fade-in">
            [ brief ]
          </div>
          <div className="content" data-aos="fade-in">
            <p className="content-summary">{detail.item.project.summary}</p>
            <ul>
              {detail.item.project.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className="content-quote">{detail.item.project.takeaway}</div>
          </div>

          <div className="social-block info-block" data-aos="fade-in">
            <div className="social-title section-title">[ share ]</div>
            <div className="social-list">
              <span className="social-link list-item" onClick={() => share('twitter')}>
                <TwitterIcon />
              </span>
              <span className="social-link list-item" onClick={() => share('facebook')}>
                <FacebookIcon />
              </span>
            </div>
          </div>

          {related.length > 0 && (
            <>
              <div className="related-title section-title" data-aos="fade-in">
                [ related {section.title} ]
              </div>
              <div className="related-list" data-aos="fade-in">
                {related.map((r) => (
                  <RelatedEntry key={r.slug} item={r} onOpen={() => go(`${prefix}${r.slug}`)} />
                ))}
              </div>
            </>
          )}

          <div className="bottom-nav">
            <div className="bottom-back" onClick={() => go(`${prefix}${detail.prev.slug}`)}>
              &#8672; prev
            </div>
            <div className="bottom-up" onClick={() => go(section.id)}>
              back to {section.title}
            </div>
            <div className="bottom-next" onClick={() => go(`${prefix}${detail.next.slug}`)}>
              next &#8674;
            </div>
          </div>
        </>
      )}
    </Page>
  )
}
