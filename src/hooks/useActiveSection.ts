import { useEffect, useState } from 'react'

/**
 * Index of the section currently straddling the vertical middle of the
 * viewport. Powers the section rail, top bar state, and backdrop accent.
 */
export function useActiveSection(ids: readonly string[]): number {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const i = ids.indexOf(entry.target.id)
          if (i >= 0) setActive(i)
        }
      },
      // A thin band around the viewport midline — exactly one section wins.
      { rootMargin: '-45% 0px -45% 0px' },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}
