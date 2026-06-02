import { useState } from 'react'
import { profile } from '../../data/profile'

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex min-h-[68px] w-[min(1120px,calc(100%-2rem))] items-center justify-between">
        <a href="#hero" className="font-serif text-lg font-semibold tracking-wide">
          <span className="text-moss">Francis</span> Garcia
        </a>

        <nav className="hidden md:block">
          <ul className="flex gap-7 text-sm font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-bone/80 transition-colors hover:text-moss"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="text-2xl text-bone md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="md:hidden">
          <ul className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-col gap-3 pb-4 text-sm font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-1 text-bone/80 hover:text-moss"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.links.resume}
                className="block py-1 text-clay hover:text-moss"
              >
                Resume
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
