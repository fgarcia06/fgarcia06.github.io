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

export type SectionId = 'projects' | 'prototypes'

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
  subtitle: 'Software Dev | Full-Stack | AI Engineering',
  /** Pulsing prompt under the hero — the whole screen is the button. */
  hint: 'click anywhere to open portfolio',
}

export const menu = [
  { title: 'home', link: 'home' },
  { title: 'projects', link: 'projects' },
  { title: 'prototypes', link: 'prototypes' },
  { title: 'skills', link: 'skills' },
  { title: 'about', link: 'about' },
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
    id: 'projects',
    title: 'projects',
    pageTitle: 'Francis Garcia | Projects',
    subtitle: 'Systems that survived contact with real users',
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
    subtitle: 'Hardware experiments — wired, printed, field-tested',
    list: [
      'voice-fan',
      'fuzzy-asteroid',
      'dc-motor-controller',
      'russian-roulette-hmi',
    ].map(bySlug),
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
/* skill → build tracing: which portfolio pieces actually use a tool   */
/* ------------------------------------------------------------------ */

/** Skill-chip tokens whose spelling differs from the project tags. */
const skillAliases: Record<string, string[]> = {
  sql: ['postgresql'],
  yolo: ['yolov5'],
  tensorflow: ['tensorflow lite micro'],
  'raspberry pi': ['rp2040', 'pico sdk'],
  'kalman filtering': ['kalman filter'],
  'jwt auth': ['jwt'],
  openai: ['openai api'],
  llms: ['openai api'],
}

/** Normalize a tag into comparable tokens: parentheses become alternatives,
 * then split on / and , — "React Native (Expo)" → ['react native','expo'];
 * "TensorFlow / ONNX" → ['tensorflow','onnx']. */
function tagTokens(tag: string): string[] {
  return tag
    .replace(/\(([^)]*)\)/g, '/$1')
    .split(/[/,]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export interface SkillTrace {
  item: ListItem
  sectionId: SectionId
}

/** Every build (project or prototype) whose tags match the given skill tag. */
export function buildsForSkill(tag: string): SkillTrace[] {
  const tokens = tagTokens(tag).flatMap((t) => [t, ...(skillAliases[t] ?? [])])
  const out: SkillTrace[] = []
  for (const s of sections) {
    for (const item of s.list) {
      const projTokens = new Set(item.project.tags.flatMap(tagTokens))
      if (tokens.some((t) => projTokens.has(t))) out.push({ item, sectionId: s.id })
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* about page — all content from resume.md                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* skills page — its own section, lifted out of about                  */
/* ------------------------------------------------------------------ */

export const skills = {
  title: 'skills',
  pageTitle: 'Francis Garcia | Skills',
  subtitle: 'The toolkit — hover any skill to trace it to a build',
  groups: skillGroups,
}

export const about = {
  title: 'about',
  pageTitle: 'Francis Garcia | About',
  subtitle: 'The person behind the machines',
  portrait: profile.portrait,
  // Assembled strictly from resume.md facts (education, roles, skills).
  bio: [
    `I'm a Computer Engineering student at the ${education.school}, building robotics, full-stack, and applied-ML systems.`,
    'I make machines move and software think — from production lab robots to real-time perception and data-driven control.',
  ],
  education,
  experience,
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
