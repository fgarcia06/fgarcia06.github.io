import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Page from './Page'
import Thumb from './Thumb'
import { home, about, skills, sections, social, shareUrls, detailFor, relatedFor, type Section, type ListItem } from '../../data/site'
import { useRouter } from '../../lib/router'
import { useTilt } from '../../lib/tilt'
import { appState, shapeFor, orbOpacityFor } from '../../lib/appState'
import { isMobile, prefersReducedMotion } from '../../lib/device'
import { GitHubIcon, LinkedInIcon, EmailIcon, TwitterIcon, FacebookIcon } from './icons'

/* ------------------------------------------------------------------ */
/* home                                                                */
/* ------------------------------------------------------------------ */

/** The interactive entry nodes that replace the old bottom footer menu.
 * Rather than a flat row, they're scattered around the central mark like
 * waypoints floating in space: each sits at a screen corner, drifts on its
 * own loop, and parallaxes by its `depth` as the camera (mouse) moves —
 * nearer nodes swing further, selling the sense of depth. Hovering one
 * morphs/pulses the background mark toward that section's shape, so the
 * canvas previews where the click will take you. */
const homeNodes = [
  { link: 'projects', label: 'Projects', desc: 'Systems & applications', glyph: '▦', meta: `${sections[0].list.length} builds`, pos: 'tl', depth: 30, coord: 'SECTOR 01' },
  { link: 'prototypes', label: 'Prototypes', desc: 'Hardware & experiments', glyph: '⬡', meta: `${sections[1].list.length} rigs`, pos: 'tr', depth: 18, coord: 'SECTOR 02' },
  { link: 'skills', label: 'Skills', desc: 'The resonance stack', glyph: '❖', meta: `${skills.groups.length} domains`, pos: 'bl', depth: 22, coord: 'SECTOR 03' },
  { link: 'about', label: 'About', desc: 'Profile & contact', glyph: '◎', meta: 'Bio · CV', pos: 'br', depth: 36, coord: 'SECTOR 04' },
] as const

function HomeNode({ node, index }: { node: (typeof homeNodes)[number]; index: number }) {
  const { go } = useRouter()
  return (
    // pos layer: corner anchor + warp-in entrance (AOS transform)
    <div className={`home-node-pos ${node.pos}`} data-aos="warp-in" style={{ transitionDelay: `${500 + index * 140}ms` }}>
      {/* float layer: continuous drift (CSS animation transform) */}
      <div
        className="home-node-float"
        style={{ animationDelay: `${index * -2.3}s`, animationDuration: `${9 + index * 1.7}s` }}
      >
        <button
          type="button"
          className="home-node"
          // parallax layer: shifts by `--depth` against the mouse (set in JS)
          style={{ '--depth': node.depth } as CSSProperties}
          onClick={() => go(node.link)}
          // preview the section live: morph the central mark into that
          // section's shape (orbTarget drives morphAmount; shapeTarget picks
          // which form) and give it a small flare. Reverts on mouse-leave.
          onMouseEnter={() => {
            appState.shapeTarget = shapeFor(node.link)
            appState.orbTarget = orbOpacityFor(node.link)
            appState.pulse = 0.6
          }}
          onMouseLeave={() => {
            appState.shapeTarget = shapeFor('home')
            appState.orbTarget = orbOpacityFor('home')
          }}
        >
          <span className="home-node-corner tl" />
          <span className="home-node-corner br" />
          <span className="home-node-coord">{node.coord}</span>
          <span className="home-node-glyph" aria-hidden>{node.glyph}</span>
          <span className="home-node-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="home-node-label">{node.label}</span>
          <span className="home-node-desc">{node.desc}</span>
          <span className="home-node-meta">
            {node.meta}
            <span className="home-node-arrow" aria-hidden>→</span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function HomePage() {
  const { visibleState } = useRouter()
  const navRef = useRef<HTMLElement>(null)

  // Drive parallax for every node from one rAF loop: publish the eased,
  // normalized mouse offset as CSS vars; each node multiplies them by its
  // own --depth. Disabled on touch / reduced-motion (mouse stays centered).
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return
    let raf = 0
    let mx = 0
    let my = 0
    const tick = () => {
      const tx = appState.mouse.x / (window.innerWidth / 2)
      const ty = appState.mouse.y / (window.innerHeight / 2)
      mx += (tx - mx) * 0.06
      my += (ty - my) * 0.06
      const el = navRef.current
      if (el) {
        el.style.setProperty('--mx', mx.toFixed(4))
        el.style.setProperty('--my', my.toFixed(4))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

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
        <div className="home-hint" data-aos="fade-in" style={{ transitionDelay: '1.4s' }}>
          choose a sector to engage
        </div>
      </div>

      <nav className="home-nav" aria-label="Sections" ref={navRef}>
        {homeNodes.map((n, i) => (
          <HomeNode key={n.link} node={n} index={i} />
        ))}
      </nav>
    </Page>
  )
}

/* ------------------------------------------------------------------ */
/* section list pages (projects / prototypes)                          */
/* ------------------------------------------------------------------ */

function ListEntry({ item, align, index, onOpen }: { item: ListItem; align: string; index: number; onOpen: () => void }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      data-aos="warp-in"
      className={`list-item work-item ${align}`}
      style={{ '--accent': item.project.accent, transitionDelay: `${index * 90}ms` } as CSSProperties}
      onClick={onOpen}
      // brush the background mark as the cursor crosses a card
      onMouseEnter={() => {
        appState.pulse = 0.45
      }}
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
            index={i}
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
      data-aos="warp-in"
      style={{ transitionDelay: `${index * 80}ms` }}
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
