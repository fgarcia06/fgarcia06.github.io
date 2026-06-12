import { useStillMotion } from '../../hooks/useMediaQuery'

interface MarqueeStripProps {
  items: string[]
  accent: string
  speed?: number
  reverse?: boolean
  className?: string
}

/**
 * Infinite scrolling ticker of text items driven by CSS animation.
 * Doubles the array for a seamless loop. Respects prefers-reduced-motion.
 */
export function MarqueeStrip({ items, accent, speed = 45, reverse = false, className = '' }: MarqueeStripProps) {
  const reduce = useStillMotion()
  const doubled = [...items, ...items]

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div
        className="flex w-max gap-10"
        style={
          reduce
            ? {}
            : {
                animation: `marquee-scroll ${speed}s linear infinite`,
                animationDirection: reverse ? 'reverse' : 'normal',
              }
        }
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.24em] text-muted/50">
              {item}
            </span>
            <span
              aria-hidden
              className="inline-block h-1 w-1 shrink-0 rounded-full opacity-25"
              style={{ backgroundColor: accent }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
