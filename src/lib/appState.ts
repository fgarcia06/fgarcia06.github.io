/**
 * Tiny shared mutable state between the DOM layer and the canvas, mirroring
 * the reference's APP.mouse / orbOpacity tweens without re-rendering React
 * on every mousemove. The canvas reads these refs each frame.
 * (Deliberately three-free so the WebGL chunk stays lazy.)
 */
export const appState = {
  /** Pixel offset from window center, like the reference's APP.mouse. */
  mouse: { x: 0, y: 0 },
  /** Target the shader's orbOpacity eases toward (set per section). */
  orbTarget: 1.0,
  /** Which abstract shape the mark morphs into, per section group:
   * 0 = gyroid, 1 = woven ring, 2 = metaball cluster, 3 = faceted diamond. */
  shapeTarget: 0.0,
  /** Landing press-and-hold intensity (1 → 2). */
  intensity: 1.0,
  /** Spikes to 1 on navigation, decays to 0 — drives the mark's warp/flash. */
  pulse: 0.0,
  /** Spikes to 1 on navigation, then decays slowly back to 0 (in Background) —
   * drives the starfield hyperspace streak. A slow decay makes the travel long
   * and motion-driven: the stars streak, then decelerate as you "arrive". */
  warp: 0.0,
  /** Pause rendering when an overlay would fully cover the canvas. */
  paused: false,
}

/** orbOpacity per route state — values lifted from the reference webgl.js. */
export function orbOpacityFor(state: string): number {
  const section = state.split('/')[0]
  switch (section) {
    case 'home':
      return 1.0
    case 'prototypes':
      return 0.5
    case 'skills':
      return 0.45
    case 'about':
      return 0.4
    default:
      // projects + their details
      return 0.3
  }
}

/** Which abstract shape a route morphs into. Each section group gets a unique
 * silhouette; home + projects keep the smooth gyroid. */
export function shapeFor(state: string): number {
  const section = state.split('/')[0]
  switch (section) {
    case 'prototypes':
      return 1.0 // woven ring
    case 'skills':
      return 2.0 // metaball cluster
    case 'about':
      return 3.0 // faceted diamond
    default:
      // home + projects (+ their details)
      return 0.0 // gyroid
  }
}

let mouseBound = false

/** Throttled via rAF — at most one state write per frame. */
export function bindMouse() {
  if (mouseBound) return
  mouseBound = true
  let queued = false
  let lastX = 0
  let lastY = 0
  window.addEventListener('mousemove', (e) => {
    lastX = e.clientX - window.innerWidth / 2
    lastY = e.clientY - window.innerHeight / 2
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      appState.mouse.x = lastX
      appState.mouse.y = lastY
      queued = false
    })
  })
}
