/**
 * CSS-only fallback shown on mobile, when reduced motion is requested,
 * and while the WebGL scene lazy-loads. Mirrors the earthy palette so the
 * swap to the live scene is seamless.
 */
export function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(700px 420px at 22% 30%, rgba(156,170,123,0.22), transparent 60%),' +
          'radial-gradient(620px 420px at 82% 24%, rgba(199,154,106,0.16), transparent 60%),' +
          'radial-gradient(680px 460px at 50% 96%, rgba(111,125,82,0.20), transparent 64%)',
      }}
    />
  )
}
