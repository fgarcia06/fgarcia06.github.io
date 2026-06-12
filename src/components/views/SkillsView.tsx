import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { skillGroups } from '../../data/skills'
import { Stagger, Item } from '../stage/Stagger'
import { Tag } from '../ui/Tag'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'
import { MarqueeStrip } from '../ui/MarqueeStrip'
import { Diamond, HatchBlock, CHAMFER_LG } from '../ui/HudDecor'
import { useInteractive } from '../../hooks/useMediaQuery'

const allTags = skillGroups.flatMap((g) => g.tags)

function TiltPanel({
  children,
  accent,
  index = 0,
  className = '',
}: {
  children: React.ReactNode
  accent: string
  index?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const interactive = useInteractive()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 400, damping: 26 })
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 400, damping: 26 })
  const glowOpacity = useSpring(0, { stiffness: 400, damping: 26 })
  const entranceDelay = (index % 3) * 0.045

  function onMove(e: React.MouseEvent) {
    if (!interactive || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
    glowOpacity.set(1)
  }
  function reset() {
    px.set(0)
    py.set(0)
    glowOpacity.set(0)
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay: entranceDelay }}
      style={{
        clipPath: CHAMFER_LG,
        ...(interactive
          ? {
              rotateX: rotX,
              rotateY: rotY,
              transformPerspective: 900,
            }
          : {}),
      }}
      className={`group relative h-full overflow-hidden border border-border bg-surface/70 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 hover:border-moss/50 ${className}`}
    >
      {/* Angular chrome */}
      <HatchBlock color={accent} className="absolute right-0 top-0 h-8 w-24 opacity-25" flip />
      <span
        aria-hidden
        className="absolute bottom-2 right-2 h-1 w-1 rotate-45 bg-border transition-colors duration-200 group-hover:bg-moss"
      />
      {/* Edge highlight on hover */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120px circle at 50% 0%, ${accent}12 0%, transparent 80%)`,
        }}
      />
      {children}
    </motion.article>
  )
}

export function SkillsView({ accent }: { accent: string }) {
  return (
    <div className="relative">
      <GhostLabel text="Stack" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center text-center">
        <ViewHeader
          no={4}
          accent={accent}
          eyebrow="Toolkit"
          title="What I work with"
          intro="Languages, frameworks, and hardware across robotics, full-stack, and applied ML."
        />

        {/* Marquee strips — always moving, shows the full breadth of the stack */}
        <Item className="w-full">
          <div className="mb-8 flex flex-col gap-3 overflow-hidden py-1">
            <MarqueeStrip items={allTags} accent={accent} speed={50} />
            <MarqueeStrip items={allTags.slice().reverse()} accent={accent} speed={60} reverse />
          </div>
        </Item>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g, i) => (
            <TiltPanel key={g.title} accent={accent} index={i} className="h-full">
              <h3 className="flex items-center justify-center gap-2.5 font-serif text-xl font-semibold" style={{ color: accent }}>
                <Diamond size={5} color={accent} />
                {g.title}
              </h3>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {g.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </TiltPanel>
          ))}
        </div>
      </Stagger>
    </div>
  )
}
