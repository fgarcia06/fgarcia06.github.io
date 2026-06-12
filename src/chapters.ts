export interface Chapter {
  id: string
  label: string
  /** Per-section accent — tints the nav, content, and 3D backdrop. */
  accent: string
}

export const chapters: Chapter[] = [
  { id: 'home', label: 'Home', accent: '#6c8cff' },
  { id: 'about', label: 'About', accent: '#7cd4fd' },
  { id: 'work', label: 'Work', accent: '#9d8cff' },
  { id: 'skills', label: 'Skills', accent: '#6c8cff' },
  { id: 'contact', label: 'Contact', accent: '#7cd4fd' },
]
