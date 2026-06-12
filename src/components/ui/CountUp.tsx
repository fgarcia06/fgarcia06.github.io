import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Counts a numeric value up from zero on mount, preserving any prefix/suffix
 * (">", "%", "+", "~", "<"). Non-numeric values (e.g. "iOS + Android") render
 * as-is. Uses tabular figures and reserves the final width so the surrounding
 * layout never shifts while the digits change.
 */
export function CountUp({
  value,
  className,
  duration = 900,
}: {
  value: string
  className?: string
  duration?: number
}) {
  const reduce = useReducedMotion()
  const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/)
  const prefix = match?.[1] ?? ''
  const hasMatch = match !== null
  const target = match ? parseFloat(match[2]) : 0
  const decimals = match?.[2].includes('.') ? 1 : 0
  const suffix = match?.[3] ?? ''

  const [n, setN] = useState(reduce || !hasMatch ? target : 0)
  const raf = useRef(0)

  // Deps are primitives only — depending on `match` (a fresh array each render)
  // would restart the timer on every frame and freeze the count.
  useEffect(() => {
    if (reduce || !hasMatch) return
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [reduce, hasMatch, target, duration])

  if (!hasMatch) return <span className={className}>{value}</span>

  return (
    <span
      className={`inline-flex justify-center tabular-nums ${className ?? ''}`}
      style={{ minWidth: `${value.length}ch` }}
    >
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  )
}
