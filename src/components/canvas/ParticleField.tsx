import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Earthy palette sampled per particle for an organic, garden-like field.
const PALETTE = ['#9caa7b', '#6f7d52', '#c79a6a', '#ece4d3', '#8a8159'].map(
  (c) => new THREE.Color(c),
)
const WHITE = new THREE.Color('#ffffff')
const COUNT = 2600

/**
 * Persistent point field. `accent` and `mood` (the active chapter index) are
 * lerped every frame so the whole field gently recolors and drifts as the
 * visitor moves between chapters — the backdrop "changes display" with them.
 */
export function ParticleField({ accent = '#9caa7b', mood = 0 }: { accent?: string; mood?: number }) {
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

    // Recolor the whole field toward the active chapter accent.
    if (matRef.current) matRef.current.color.lerp(target, 0.03)

    // Per-chapter parallax: shift + tilt the field as chapters change.
    const targetX = (mood - 2) * 0.5
    const targetRotZ = (mood - 2) * 0.05
    group.position.x += (targetX - group.position.x) * 0.03
    group.rotation.z += (targetRotZ - group.rotation.z) * 0.03

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
