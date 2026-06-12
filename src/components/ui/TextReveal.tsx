import { motion, useReducedMotion } from 'framer-motion'

/**
 * Soft word-by-word reveal for captions and filler copy (fade + blur + rise).
 * Plays once when scrolled into view. Plain text under reduced motion.
 *
 * Note: the joining space is rendered BETWEEN the word spans — trailing
 * whitespace inside an inline-block gets trimmed at layout, which fuses the
 * words into one unbreakable string.
 */
export function TextReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.018,
  as: Tag = 'p',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: 'p' | 'span' | 'h2'
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  if (reduce) return <Tag className={className}>{text}</Tag>

  const MotionTag = motion[Tag] as typeof motion.p
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </MotionTag>
  )
}
