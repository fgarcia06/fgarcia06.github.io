/**
 * Cinematic transition controller. On each navigation the router fires
 * `cinema.play(...)`, which bumps a monotonic id and notifies the <Cinema>
 * overlay so it can replay its anamorphic letterbox "scene cut": the frame
 * crops to a widescreen aspect, holds while the page swap happens behind it,
 * then opens back out. Driven imperatively (no per-frame React renders),
 * mirroring the loader.
 */

export interface CinemaCue {
  /** Monotonic id — changing it re-arms the CSS animation in the overlay. */
  id: number
  /** Where we're heading; lets the overlay pick the aspect label / feel. */
  kind: 'home' | 'section' | 'detail'
  /** Aspect-ratio label flashed during the crop (e.g. "2.39 : 1"). */
  aspect: string
  /** Destination sector label shown in the hyperspace-jump readout. */
  label: string
  /** Pseudo target coordinate flashed during the jump (deterministic per dest). */
  coord: string
}

type CinemaListener = (cue: CinemaCue) => void

let listener: CinemaListener | null = null
let id = 0

export const cinema = {
  subscribe(fn: CinemaListener) {
    listener = fn
    return () => {
      if (listener === fn) listener = null
    }
  },
  play(kind: CinemaCue['kind'], label = '') {
    id += 1
    // wider crops read as more "cinematic"; detail pages get the widest jump
    const aspect = kind === 'detail' ? '2.76 : 1' : kind === 'section' ? '2.39 : 1' : '1.85 : 1'
    const dest = (label || kind).toUpperCase()
    // deterministic "jump target" so each destination has a stable coordinate
    const seed = dest.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const coord = `RA ${String(seed % 24).padStart(2, '0')}ʰ${String(seed % 60).padStart(2, '0')}ᵐ · PHI ${(1.4 + (seed % 240) / 1000).toFixed(3)}`
    listener?.({ id, kind, aspect, label: dest, coord })
  },
}
