import { useCallback, useEffect, useRef, useState } from 'react'
import { chapters } from '../chapters'

const COUNT = chapters.length
const LOCK_MS = 750

/**
 * Drives the chaptered, one-screen-at-a-time experience. Navigation comes from
 * clicks, arrow/number keys, wheel, and touch swipes. Wheel/touch only change
 * chapter when the active view is scrolled to its edge, so overflowing views
 * (e.g. on short screens) still scroll their own content first.
 */
export function useChapterNav() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const lockedUntil = useRef(0)

  // Keep a ref so wheel/key handlers read the latest index without re-binding.
  const indexRef = useRef(index)
  indexRef.current = index

  const go = useCallback((next: number, dir?: number) => {
    const clamped = Math.max(0, Math.min(COUNT - 1, next))
    setIndex((cur) => {
      if (clamped === cur) return cur
      setDirection(dir ?? Math.sign(clamped - cur))
      lockedUntil.current = performance.now() + LOCK_MS
      return clamped
    })
  }, [])

  const next = useCallback(() => go(indexRef.current + 1, 1), [go])
  const prev = useCallback(() => go(indexRef.current - 1, -1), [go])

  const isBusy = () => performance.now() < lockedUntil.current || navLocked()

  useEffect(() => {
    const scrollEl = () => document.querySelector<HTMLElement>('[data-stage-scroll]')
    const atTop = () => {
      const el = scrollEl()
      return !el || el.scrollTop <= 2
    }
    const atBottom = () => {
      const el = scrollEl()
      return !el || el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    }

    const onKey = (e: KeyboardEvent) => {
      if (navLocked()) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        go(0)
      } else if (e.key === 'End') {
        go(COUNT - 1)
      } else if (/^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1
        if (n < COUNT) go(n)
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (isBusy()) return
      if (Math.abs(e.deltaY) < 12) return
      if (e.deltaY > 0 && atBottom()) next()
      else if (e.deltaY < 0 && atTop()) prev()
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (isBusy()) return
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 56) return
      if (dy > 0 && atBottom()) next()
      else if (dy < 0 && atTop()) prev()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [go, next, prev])

  return { index, direction, go, next, prev }
}

/** A modal (e.g. the Work case study) sets this to freeze chapter navigation. */
function navLocked() {
  return document.body.dataset.navLocked === '1'
}
