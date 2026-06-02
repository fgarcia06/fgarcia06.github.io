export interface Chapter {
  id: string
  label: string
  /** Per-chapter accent — tints the nav, content, and 3D backdrop. */
  accent: string
}

export const chapters: Chapter[] = [
  { id: 'home', label: 'Home', accent: '#9caa7b' },
  { id: 'about', label: 'About', accent: '#c79a6a' },
  { id: 'work', label: 'Work', accent: '#b7c4a0' },
  { id: 'skills', label: 'Skills', accent: '#8a8159' },
  { id: 'contact', label: 'Contact', accent: '#c79a6a' },
]
