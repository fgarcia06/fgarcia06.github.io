import { profile } from './profile'
import { education, experience } from './experience'
import { skillGroups } from './skills'
import { projects, type Project } from './projects'

/**
 * Site data assembled into the same shape the reference site
 * (richardmattka.com data/site.js) feeds its views: a menu, one entry per
 * section with title / subtitle / list, and a detail record per item.
 * Every string here is sourced from resume.md or projects-info/ — the only
 * exceptions are clearly-marked TODO(content) placeholders for fields the
 * reference layout expects but my sources don't provide.
 */

export type SectionId = 'work' | 'prototypes' | 'art' | 'press'

export interface ListItem {
  title: string
  subtitle: string
  slug: string
  project: Project
}

export interface Section {
  id: SectionId
  title: string
  pageTitle: string
  subtitle: string
  list: ListItem[]
  /** Set when the reference layout expects items but my sources have none. */
  todo?: string
}

export const siteTitle = 'Francis Garcia | Portfolio'

export const home = {
  title: 'Francis Garcia',
  pageTitle: siteTitle,
  // profile.title, formatted like the reference's pipe-separated subtitle
  // (trimmed to fit the home page's wide letter-spacing).
  subtitle: 'Robotics | Full-Stack | Applied ML',
}

export const menu = [
  { title: 'home', link: 'home' },
  { title: 'work', link: 'work' },
  { title: 'prototypes', link: 'prototypes' },
  { title: 'art', link: 'art' },
  { title: 'press', link: 'press' },
  { title: 'info', link: 'info' },
  // TODO(content): the reference menu also has "reel" opening a showreel
  // video. No reel/video content exists in my sources, so it is omitted.
]

const bySlug = (id: string) => {
  const p = projects.find((p) => p.id === id)
  if (!p) throw new Error(`unknown project id ${id}`)
  return { title: p.title, subtitle: p.context, slug: p.id, project: p }
}

export const sections: Section[] = [
  {
    id: 'work',
    title: 'work',
    pageTitle: 'Francis Garcia | Work',
    subtitle: 'Projects | Systems | Applications',
    list: [
      'ai-fitness',
      'object-tracking',
      'rust-poker',
      'secure-fs',
      'event-lottery',
      'mongo-twitter-cli',
    ].map(bySlug),
  },
  {
    id: 'prototypes',
    title: 'prototypes',
    pageTitle: 'Francis Garcia | Prototypes',
    subtitle: 'Embedded | Hardware | Experiments',
    list: [
      'voice-fan',
      'fuzzy-asteroid',
      'dc-motor-controller',
      'russian-roulette-hmi',
    ].map(bySlug),
  },
  {
    id: 'art',
    title: 'art',
    pageTitle: 'Francis Garcia | Art',
    subtitle: '',
    list: [],
    todo:
      'TODO(content): the reference has an art section (fractal/3D artwork). No artwork exists in resume.md or projects-info/ — add pieces here when available.',
  },
  {
    id: 'press',
    title: 'press',
    pageTitle: 'Francis Garcia | Press',
    subtitle: '',
    list: [],
    todo:
      'TODO(content): the reference has a press section (magazine articles + interviews). No press/publications exist in resume.md or projects-info/ — add coverage here when available.',
  },
]

export function sectionById(id: string): Section | undefined {
  return sections.find((s) => s.id === id)
}

export function detailFor(section: Section, slug: string) {
  const i = section.list.findIndex((l) => l.slug === slug)
  if (i < 0) return undefined
  const n = section.list.length
  return {
    item: section.list[i],
    prev: section.list[(i - 1 + n) % n],
    next: section.list[(i + 1) % n],
  }
}

/** Related items share at least one tag, like the reference's tag matching. */
export function relatedFor(section: Section, item: ListItem, max = 6): ListItem[] {
  const tags = new Set(item.project.tags)
  return section.list
    .filter((l) => l.slug !== item.slug && l.project.tags.some((t) => tags.has(t)))
    .slice(0, max)
}

/* ------------------------------------------------------------------ */
/* info page — all content from resume.md                              */
/* ------------------------------------------------------------------ */

export const info = {
  title: 'info',
  pageTitle: 'Francis Garcia | Info',
  subtitle: 'About | Experience | Skills | Contact',
  portrait: profile.portrait,
  // Assembled strictly from resume.md facts (education, roles, skills).
  bio: [
    `Francis Garcia is a Computer Engineering student (B.Sc., Software Co-op) at the ${education.school} in ${profile.location} (${education.dates}), building automation, full-stack, and applied-ML systems.`,
    'As a Junior Robotics Engineer at TRICCA Technologies he delivered a production-ready automated pipetting system for a University of Alberta chemistry lab — engineering Python and C++ control modules over I2C, SPI, GPIO, and serial protocols on a Klipper/Moonraker/Mainsail firmware stack, cutting QA cycle time by 60% with automated test pipelines, and shipping a full-stack web app for browser-based remote operation.',
    'As a Process Control Lab Assistant at a University of Alberta research lab he implemented a SINDy pipeline reconstructing governing ODEs from experimental sensor data to under 5% model error, and applied Kalman filtering, PID tuning, and MPC to improve closed-loop control fidelity.',
    'His toolset spans Python, C++, C, Java, JavaScript/TypeScript, SQL, and MATLAB; React Native, Next.js, Node.js, TensorFlow, OpenCV, NumPy, and Pandas; and embedded work with Arduino, Raspberry Pi, I2C/SPI/UART, PWM, Klipper, Fusion 360, and 3D printing. On the AI/ML side: YOLO, TensorFlow/ONNX, Kalman filtering, MPC, SINDy, RL, and LLM API integration (OpenAI, Claude).',
  ],
  education,
  experience,
  skillGroups,
  contact: {
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  },
}

export const social = [
  { title: 'GitHub', url: profile.links.github, icon: 'github' as const },
  { title: 'LinkedIn', url: profile.links.linkedin, icon: 'linkedin' as const },
  { title: 'Email', url: `mailto:${profile.email}`, icon: 'email' as const },
]

/** Share targets used by the [ share ] block on detail pages, matching the
 * reference's twitter/facebook share popups but pointing at my URLs. */
export function shareUrls(title: string) {
  const url = window.location.href
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${title} — Francis Garcia`,
    )}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  }
}
