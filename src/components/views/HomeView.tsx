import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { profile, highlights } from '../../data/profile'
import { Stagger, Item } from '../stage/Stagger'
import { GhostLabel } from '../stage/GhostLabel'
import { TextReveal } from '../ui/TextReveal'
import { MagneticButton } from '../ui/MagneticButton'
import { CountUp } from '../ui/CountUp'
import { Readout, Diamond, Waveform, CHAMFER } from '../ui/HudDecor'
import { useMouseParallax } from '../../hooks/useMouseParallax'
import { scrollToId } from '../../hooks/useLenis'

const CYBER = 'var(--color-cyber)'

export function HomeView() {
  const reduce = useReducedMotion()
  const { x: mouseX, y: mouseY } = useMouseParallax()

  // Mouse depth — portrait nearest, name drifts opposite for separation.
  const portraitX = useTransform(mouseX, (v) => v * 10)
  const portraitY = useTransform(mouseY, (v) => v * 10)
  const nameX = useTransform(mouseX, (v) => v * -5)
  const blob1X = useTransform(mouseX, (v) => v * -20)
  const blob1Y = useTransform(mouseY, (v) => v * -14)
  const blob2X = useTransform(mouseX, (v) => v * 18)
  const blob2Y = useTransform(mouseY, (v) => v * 12)

  // Scroll depth — as the hero scrolls away the content recedes: it lags the
  // scroll, shrinks a touch and dissolves, while deeper layers lag harder.
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 170])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const nameY = useTransform(scrollYProgress, [0, 1], [0, 110])
  const statsY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <div ref={ref} className="relative flex flex-col items-center text-center">
      {/* Ambient depth blobs */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-40 -top-20 h-[420px] w-[420px] rounded-full blur-[90px]"
            style={{
              background: 'radial-gradient(circle, rgba(108,140,255,0.09) 0%, transparent 70%)',
              x: blob1X,
              y: blob1Y,
            }}
          />
          <motion.div
            className="absolute -right-28 bottom-0 h-[320px] w-[320px] rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(124,212,253,0.07) 0%, transparent 70%)',
              x: blob2X,
              y: blob2Y,
            }}
          />
        </div>
      )}

      <GhostLabel text="Profile" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* HUD frame readouts — pinned to the hero's corners */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-2 -inset-y-10 hidden md:block">
        <span className="absolute left-0 top-0 flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rotate-45"
            style={{ backgroundColor: CYBER, animation: reduce ? undefined : 'flickerSoft 6s linear infinite' }}
          />
          <Readout color={CYBER} flicker>
            SYS.ONLINE
          </Readout>
          <Readout color="rgba(231,234,242,0.35)">// PORTFOLIO v2.1</Readout>
        </span>
        <Readout color="rgba(231,234,242,0.3)" className="absolute bottom-0 left-0">
          53.5461° N / 113.4938° W
        </Readout>
        <Readout color="rgba(231,234,242,0.3)" className="absolute bottom-0 right-0">
          EDMONTON.AB // EST.2021
        </Readout>
        <span className="absolute right-0 top-0">
          <Waveform color="var(--color-moss)" bars={10} />
        </span>
      </div>

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="flex w-full flex-col items-center"
      >
        {/* delay ≈ intro-curtain lift so the entrance plays in the open */}
        <Stagger delay={0.7} className="flex flex-col items-center">
          {/* Portrait — nearest parallax plane, framed by a rotating reticle */}
          <Item>
            <motion.div style={{ x: portraitX, y: portraitY }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.66 }}
                className="relative mx-auto h-28 w-28 md:h-32 md:w-32"
              >
                <div
                  aria-hidden
                  className="absolute -inset-1.5 rounded-full opacity-60 blur-md"
                  style={{ background: 'conic-gradient(from 180deg, #6c8cff, #7cd4fd, #9d8cff, #6c8cff)' }}
                />
                {/* Rotating targeting ring + cardinal diamonds */}
                {!reduce && (
                  <svg
                    aria-hidden
                    viewBox="0 0 100 100"
                    className="absolute -inset-4"
                    style={{ animation: 'spinSlow 24s linear infinite' }}
                  >
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#6c8cff55" strokeWidth="0.8" strokeDasharray="2 5" />
                    {[0, 90, 180, 270].map((deg) => (
                      <rect
                        key={deg}
                        x="48.4"
                        y="2.4"
                        width="3.2"
                        height="3.2"
                        fill="#7cd4fd"
                        transform={`rotate(${deg} 50 50) rotate(45 50 4)`}
                      />
                    ))}
                  </svg>
                )}
                <img
                  src={profile.portrait}
                  alt="Francis Garcia"
                  className="relative h-full w-full rounded-full border border-border object-cover"
                />
              </motion.div>
            </motion.div>
          </Item>

          {/* Terminal-style role line */}
          <Item>
            <p className="mt-7 flex items-center justify-center gap-2.5 font-grotesk text-xs uppercase tracking-[0.28em] text-moss">
              <Diamond size={5} color="var(--color-moss)" />
              Robotics // Full-Stack // Applied ML
              <span
                aria-hidden
                className="inline-block h-3.5 w-[7px] bg-moss/80"
                style={{ animation: reduce ? undefined : 'blink 1.1s step-end infinite' }}
              />
            </p>
          </Item>

          {/* Name — clip-rise entrance, soft ambient glow, mid-depth plane */}
          <motion.div style={reduce ? undefined : { x: nameX, y: nameY }}>
            <h1 className="mt-2 block text-center font-serif font-bold leading-[0.97] tracking-[-0.02em] text-bone text-[length:var(--text-mega)]">
              <span className="inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.74 }}
                  style={{ textShadow: '0 0 45px rgba(108,140,255,0.45), 0 0 100px rgba(108,140,255,0.15)' }}
                >
                  Francis
                </motion.span>
              </span>
            </h1>
            <h1 className="block text-center font-serif font-bold leading-[0.97] tracking-[-0.02em] text-clay text-[length:var(--text-mega)]">
              <span className="inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.83 }}
                  style={{ textShadow: '0 0 45px rgba(124,212,253,0.4), 0 0 100px rgba(124,212,253,0.12)' }}
                >
                  Garcia
                </motion.span>
              </span>
            </h1>
          </motion.div>

          <TextReveal
            text={profile.statement}
            delay={0.95}
            className="mx-auto mt-6 max-w-2xl text-center font-serif text-xl font-medium italic leading-snug text-bone/90 sm:text-2xl"
          />
          <TextReveal
            text={profile.tagline}
            delay={1.05}
            className="mx-auto mt-3 max-w-md text-center text-muted"
          />

          <Item>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton
                chamfer
                onClick={() => scrollToId('work')}
                className="bg-moss px-6 py-3 font-semibold text-bg transition-colors duration-200 hover:bg-clay"
              >
                View Work
              </MagneticButton>
              <MagneticButton
                chamfer
                onClick={() => scrollToId('contact')}
                className="border border-border px-6 py-3 font-semibold text-bone transition-colors duration-200 hover:border-moss"
              >
                Get in Touch
              </MagneticButton>
              <MagneticButton
                href={profile.links.resume}
                className="px-4 py-3 font-grotesk text-sm uppercase tracking-widest text-muted transition-colors duration-200 hover:text-bone"
              >
                Résumé →
              </MagneticButton>
            </div>
          </Item>

          {/* Stats — chamfered readout panels on a counter-parallax plane */}
          <Item className="w-full">
            <motion.div style={reduce ? undefined : { y: statsY }}>
              <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 sm:mt-12 sm:gap-4">
                {highlights.map((h, i) => (
                  <div
                    key={h.label}
                    className="group relative flex flex-col items-center border border-border bg-surface/40 px-3 py-4 backdrop-blur-sm transition-colors duration-200 hover:border-moss/60"
                    style={{ clipPath: CHAMFER }}
                  >
                    <span
                      aria-hidden
                      className="absolute right-2 top-2 h-1 w-1 rotate-45 bg-border transition-colors duration-200 group-hover:bg-moss"
                    />
                    <dt>
                      <CountUp value={h.value} className="font-serif text-3xl font-bold text-moss sm:text-4xl" />
                    </dt>
                    <dd className="mt-1.5 max-w-[20ch] text-xs leading-snug text-muted">{h.label}</dd>
                    {i === 1 && <Waveform bars={8} className="mt-2 opacity-50" color="var(--color-moss)" />}
                  </div>
                ))}
              </dl>
            </motion.div>
          </Item>
        </Stagger>
      </motion.div>

      {/* Scroll cue — fades the moment the journey begins */}
      <motion.button
        onClick={() => scrollToId('about')}
        aria-label="Scroll to next section"
        data-cursor="grow"
        className="absolute -bottom-14 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 text-muted transition-colors hover:text-bone sm:-bottom-20"
        style={reduce ? undefined : { opacity: cueOpacity }}
      >
        <span className="font-grotesk text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          aria-hidden
          className="block h-9 w-px bg-gradient-to-b from-moss to-transparent"
          animate={reduce ? undefined : { scaleY: [0.3, 1, 0.3], originY: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>
    </div>
  )
}
