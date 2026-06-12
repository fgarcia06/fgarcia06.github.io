/**
 * CSS-only fallback shown on mobile, when reduced motion is requested, and
 * while the WebGL scene lazy-loads. Tints toward the active chapter accent so
 * it still "changes" between chapters without WebGL.
 */
export function StaticBackdrop({ accent = '#6c8cff' }: { accent?: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 transition-[background] duration-500"
      style={{
        background:
          `radial-gradient(720px 460px at 24% 28%, ${accent}33, transparent 60%),` +
          `radial-gradient(640px 460px at 82% 22%, ${accent}1f, transparent 60%),` +
          'radial-gradient(680px 480px at 50% 98%, rgba(61,90,184,0.20), transparent 64%)',
      }}
    />
  )
}
