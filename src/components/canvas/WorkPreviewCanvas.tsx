/**
 * Per-project Three.js particle scene.
 * Single Canvas instance — never re-mounts. Project changes trigger
 * a fade-out → geometry swap → fade-in inside useFrame.
 */
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Project, VisualKind } from '../../data/projects'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

const N = 1600

// ── Concept-specific particle distributions ───────────────────────────────────

function generatePositions(kind: VisualKind): Float32Array {
  const pos = new Float32Array(N * 3)

  switch (kind) {

    case 'fitness': {
      // Three activity rings at different radii + heights
      const rings = [
        { r: 1.35, y: 0.52,  frac: 0.34 },
        { r: 0.92, y: 0.0,   frac: 0.34 },
        { r: 0.50, y: -0.44, frac: 0.32 },
      ]
      let idx = 0
      for (const ring of rings) {
        const cnt = Math.floor(N * ring.frac)
        for (let i = 0; i < cnt && idx < N; i++, idx++) {
          const t = (i / cnt) * Math.PI * 2
          const j = (Math.random() - 0.5) * 0.09
          pos[idx * 3]     = (ring.r + j) * Math.cos(t)
          pos[idx * 3 + 1] = ring.y + (Math.random() - 0.5) * 0.1
          pos[idx * 3 + 2] = (ring.r + j) * Math.sin(t)
        }
      }
      break
    }

    case 'tracking': {
      // Sparse 3-D grid — bounding-box lattice
      const g = Math.cbrt(N) | 0
      let idx = 0
      for (let x = 0; x < g && idx < N; x++)
        for (let y = 0; y < g && idx < N; y++)
          for (let z = 0; z < g && idx < N; z++, idx++) {
            pos[idx * 3]     = (x / (g - 1) - 0.5) * 2.4
            pos[idx * 3 + 1] = (y / (g - 1) - 0.5) * 2.4
            pos[idx * 3 + 2] = (z / (g - 1) - 0.5) * 2.4
          }
      break
    }

    case 'poker': {
      // Three card-shaped flat clusters, fanned like a dealt hand
      const fan = [-0.38, 0.0, 0.38]
      const rotations = [-0.32, 0.0, 0.32]
      const perCard = Math.floor(N / 3)
      let idx = 0
      for (let c = 0; c < 3; c++) {
        for (let i = 0; i < perCard && idx < N; i++, idx++) {
          const u = (Math.random() - 0.5) * 0.55 // card width
          const v = (Math.random() - 0.5) * 0.80 // card height
          const rot = rotations[c]
          pos[idx * 3]     = u * Math.cos(rot) - v * Math.sin(rot) + fan[c]
          pos[idx * 3 + 1] = u * Math.sin(rot) + v * Math.cos(rot) + (Math.random() - 0.5) * 0.05
          pos[idx * 3 + 2] = (Math.random() - 0.5) * 0.08 + c * 0.06
        }
      }
      break
    }

    case 'crypto': {
      // Wireframe cube — particles concentrated on edges
      for (let i = 0; i < N; i++) {
        const s = 1.2
        const edge = (Math.random() * 12) | 0
        const t = Math.random()
        // 12 edges of a cube
        const corners = [
          [-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],
          [-s,-s, s],[s,-s, s],[s,s, s],[-s,s, s],
        ]
        const edgePairs = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7],
        ]
        const [a, b] = edgePairs[edge % 12]
        const ca = corners[a], cb = corners[b]
        const j = (Math.random() - 0.5) * 0.06
        pos[i * 3]     = ca[0] + (cb[0] - ca[0]) * t + j
        pos[i * 3 + 1] = ca[1] + (cb[1] - ca[1]) * t + j
        pos[i * 3 + 2] = ca[2] + (cb[2] - ca[2]) * t + j
      }
      break
    }

    case 'lottery': {
      // Sphere of lottery balls — tight cluster
      for (let i = 0; i < N; i++) {
        const phi   = Math.acos(1 - 2 * Math.random())
        const theta = Math.random() * Math.PI * 2
        const r     = 0.5 + Math.random() * 0.7 // dense sphere
        pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        pos[i * 3 + 2] = r * Math.cos(phi)
      }
      break
    }

    case 'asteroid': {
      // Thin ecliptic disk with scattered field debris
      for (let i = 0; i < N; i++) {
        if (i < N * 0.7) {
          // Disk ring (asteroid belt)
          const theta = Math.random() * Math.PI * 2
          const r = 0.8 + Math.random() * 0.8
          pos[i * 3]     = r * Math.cos(theta)
          pos[i * 3 + 1] = (Math.random() - 0.5) * 0.18
          pos[i * 3 + 2] = r * Math.sin(theta)
        } else {
          // Scattered debris
          pos[i * 3]     = (Math.random() - 0.5) * 3.2
          pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2
          pos[i * 3 + 2] = (Math.random() - 0.5) * 3.2
        }
      }
      break
    }

    case 'voice': {
      // Double helix — DNA/audio wave
      for (let i = 0; i < N; i++) {
        const strand = i % 2
        const t = (i / N) * Math.PI * 7 - Math.PI * 3.5
        const phase = strand * Math.PI // second strand offset by π
        const r = 0.75 + Math.random() * 0.1
        pos[i * 3]     = r * Math.cos(t + phase)
        pos[i * 3 + 1] = t * 0.26 + (Math.random() - 0.5) * 0.07
        pos[i * 3 + 2] = r * Math.sin(t + phase)
      }
      break
    }

    case 'database': {
      // Vertical cylinder — database storage column
      for (let i = 0; i < N; i++) {
        const theta    = Math.random() * Math.PI * 2
        const onShell  = Math.random() > 0.28
        const r        = onShell ? 1.0 + (Math.random() - 0.5) * 0.07 : Math.random() * 1.0
        pos[i * 3]     = r * Math.cos(theta)
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2.8
        pos[i * 3 + 2] = r * Math.sin(theta)
      }
      break
    }

    case 'motor': {
      // Torus — motor stator/rotor cross-section
      for (let i = 0; i < N; i++) {
        const u = Math.random() * Math.PI * 2
        const v = Math.random() * Math.PI * 2
        const R = 1.0, r = 0.36
        pos[i * 3]     = (R + r * Math.cos(v)) * Math.cos(u)
        pos[i * 3 + 1] = r * Math.sin(v) * 0.55
        pos[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u)
      }
      break
    }

    case 'roulette': {
      // Six chamber clusters arranged in a ring
      for (let i = 0; i < N; i++) {
        const which = (Math.random() * 6) | 0
        const base  = (which / 6) * Math.PI * 2
        const t     = base + (Math.random() - 0.5) * 0.45
        const r     = 0.88 + Math.random() * 0.38
        pos[i * 3]     = r * Math.cos(t)
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.72
        pos[i * 3 + 2] = r * Math.sin(t)
      }
      break
    }
  }

  return pos
}

// ── Internal scene ────────────────────────────────────────────────────────────

function Scene({
  project,
  mouseRef,
}: {
  project: Project
  mouseRef: React.RefObject<{ x: number; y: number }>
}) {
  const reduce     = usePrefersReducedMotion()
  const groupRef   = useRef<THREE.Group>(null)
  const matRef     = useRef<THREE.PointsMaterial>(null)

  // Project transition: fade-out → swap geometry → fade-in
  const [displayed, setDisplayed]   = useState(project)
  const pendingRef                   = useRef(project)
  pendingRef.current                 = project
  const fade = useRef({ opacity: 0.72, target: 0.72, swapping: false })

  useEffect(() => {
    if (project.id === displayed.id) return
    fade.current.target   = 0
    fade.current.swapping = true
  }, [project.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth accent color
  const targetColor = useRef(new THREE.Color(project.accent))
  const liveColor   = useRef(new THREE.Color(project.accent))
  useEffect(() => { targetColor.current.set(project.accent) }, [project.accent])

  const positions = useMemo(() => generatePositions(displayed.visual), [displayed.visual])
  const geometry  = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])
  useEffect(() => () => { geometry.dispose() }, [geometry])

  useFrame((state) => {
    if (!groupRef.current || !matRef.current) return

    // Fade logic
    const f    = fade.current
    const step = 0.07
    if (f.opacity < f.target)      f.opacity = Math.min(f.target, f.opacity + step)
    else if (f.opacity > f.target) f.opacity = Math.max(f.target, f.opacity - step)
    if (f.swapping && f.opacity <= 0.005) {
      setDisplayed(pendingRef.current)
      f.target   = 0.72
      f.swapping = false
    }
    matRef.current.opacity = f.opacity

    // Color lerp
    liveColor.current.lerp(targetColor.current, 0.04)
    matRef.current.color.set(liveColor.current)

    if (reduce) return

    const t = state.clock.elapsedTime
    groupRef.current.rotation.y += 0.0024
    groupRef.current.rotation.x  = Math.sin(t * 0.18) * 0.12

    const mx = mouseRef.current?.x ?? 0
    const my = mouseRef.current?.y ?? 0
    groupRef.current.rotation.y += mx * 0.001
    groupRef.current.rotation.x += my * 0.0007
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={matRef}
          size={0.018}
          color={displayed.accent}
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

export function WorkPreviewCanvas({ project }: { project: Project }) {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth  * 2 - 1,
        y: e.clientY / window.innerHeight * 2 - 1,
      }
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Scene project={project} mouseRef={mouseRef} />
    </Canvas>
  )
}
