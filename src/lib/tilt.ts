import { useEffect, useRef } from 'react'
import { isMobile } from './device'

/**
 * Recreation of the reference's VanillaTilt settings:
 * reverse, max 5deg, scale 1.03 on hover, eased reset on leave.
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isMobile) return

    let raf = 0
    const max = 5
    const scale = 1.03

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        // reverse: tilt away from the cursor
        const rx = (max / 2 - py * max).toFixed(2)
        const ry = (px * max - max / 2).toFixed(2)
        el.style.transition = ''
        el.style.transform = `perspective(1000px) rotateX(${Number(rx) * -1}deg) rotateY(${Number(ry) * -1}deg) scale3d(${scale}, ${scale}, ${scale})`
      })
    }

    const onLeave = () => {
      cancelAnimationFrame(raf)
      el.style.transition = 'transform .4s cubic-bezier(.03,.98,.52,.99)'
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return ref
}
