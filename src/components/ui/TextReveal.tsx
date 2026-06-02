import { motion, useReducedMotion } from 'framer-motion'

/**
 * Soft word-by-word reveal for captions and filler copy (fade + blur + rise).
 * Runs on mount so it re-plays each time a chapter is shown. Plain text under
 * reduced motion.
 */
export function TextReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.025,
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
      animate="show"
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  )
}
