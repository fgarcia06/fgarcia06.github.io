function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Renders `text`, wrapping every occurrence of any phrase in `terms` in an
 * accent-colored, medium-weight span. Matching is case-insensitive and longest
 * phrase first, so overlapping terms resolve to the most specific one.
 */
export function Highlight({
  text,
  terms,
  accent,
  className,
}: {
  text: string
  terms?: string[]
  accent: string
  className?: string
}) {
  if (!terms?.length) return <span className={className}>{text}</span>

  const sorted = [...terms].sort((a, b) => b.length - a.length)
  const re = new RegExp(`(${sorted.map(escapeRegExp).join('|')})`, 'gi')
  const lower = new Set(terms.map((t) => t.toLowerCase()))

  // split() with a capturing group keeps the delimiters as array entries.
  const parts = text.split(re)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        lower.has(part.toLowerCase()) ? (
          <span key={i} className="font-medium" style={{ color: accent }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}
