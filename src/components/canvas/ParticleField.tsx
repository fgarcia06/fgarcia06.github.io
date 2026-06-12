import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointMaterial } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'

// Cool, professional palette sampled per particle — azure, ice, violet, ink.
const PALETTE = ['#6c8cff', '#3d5ab8', '#7cd4fd', '#e7eaf2', '#9d8cff'].map(
  (c) => new THREE.Color(c),
)
const WHITE = new THREE.Color('#ffffff')
const COUNT = 2600

/**
 * Persistent point field driven by page scroll. `progress` (0–1 across the
 * whole document) dollies the camera forward through the particles and slowly
 * rolls the field, so scrolling reads as travelling through depth — while
 * `accent` recolors the material toward the active section.
 */
export function ParticleField({
  accent = '#6c8cff',
  progress,
}: {
  accent?: string
  progress?: MotionValue<number>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)
  const pointsRef = useRef<THREE.Points>(null)

  const target = useMemo(() => new THREE.Color(accent).lerp(WHITE, 0.4), [accent])

  const { positions, base, colors, phase } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const base = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const phase = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      const r = Math.cbrt(Math.random()) * 9
      const theta = Math.random() * Math.PI * 2
      const u = Math.random() * 2 - 1
      const s = Math.sqrt(1 - u * u)
      const x = r * s * Math.cos(theta)
      const y = r * u * 0.5
      const z = r * s * Math.sin(theta)

      positions.set([x, y, z], i * 3)
      base.set([x, y, z], i * 3)

      const c = PALETTE[(Math.random() * PALETTE.length) | 0]
      colors.set([c.r, c.g, c.b], i * 3)

      phase.set(
        [Math.random() * Math.PI * 2, 0.3 + Math.random() * 0.6, 0.15 + Math.random() * 0.35],
        i * 3,
      )
    }
    return { positions, base, colors, phase }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const group = groupRef.current
    const points = pointsRef.current
    if (!group || !points) return

    // Recolor the whole field toward the active section accent.
    if (matRef.current) matRef.current.color.lerp(target, 0.03)

    // Scroll-driven travel: dolly the camera into the field and roll it
    // gently over the full page — the backdrop becomes a journey, not a slide.
    const p = progress?.get() ?? 0
    const cam = state.camera
    cam.position.z += (12 - p * 7 - cam.position.z) * 0.06
    cam.position.y += (-p * 1.6 - cam.position.y) * 0.06
    const targetRotZ = (p - 0.5) * 0.22
    group.rotation.z += (targetRotZ - group.rotation.z) * 0.04

    // Slow ambient drift + gentle parallax toward the pointer.
    group.rotation.y += delta * 0.025
    const px = state.pointer.y * 0.12
    group.rotation.x += (px - group.rotation.x) * 0.04

    // Per-particle vertical bob.
    const arr = points.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      const iy = i * 3 + 1
      arr[iy] = base[iy] + Math.sin(t * phase[i * 3 + 1] + phase[i * 3]) * phase[i * 3 + 2]
    }
    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <PointMaterial
          ref={matRef}
          transparent
          vertexColors
          size={0.06}
          sizeAttenuation
          depthWrite={false}
          opacity={0.9}
        />
      </points>
    </group>
  )
}
