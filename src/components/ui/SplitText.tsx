import { motion, useReducedMotion } from 'framer-motion'

/**
 * Reveals a line of text word-by-word with a clip-rise stagger.
 * Falls back to plain text under reduced motion.
 *
 * The joining space is rendered BETWEEN the clip wrappers — a trailing space
 * inside an inline-block is trimmed at layout, which would fuse the words.
 */
export function SplitText({
  text,
  className = '',
  delay = 0,
  stagger = 0.05,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: 'span' | 'h1' | 'h2' | 'p'
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  if (reduce) return <Tag className={className}>{text}</Tag>

  // Cast away the union to keep JSX from producing an over-complex type.
  const MotionTag = motion[Tag] as typeof motion.span
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden>
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: '110%' },
                visible: {
                  y: 0,
                  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </MotionTag>
  )
}
