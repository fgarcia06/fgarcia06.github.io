import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Earthy palette sampled per particle for an organic, garden-like field.
const PALETTE = ['#9caa7b', '#6f7d52', '#c79a6a', '#ece4d3', '#8a8159'].map(
  (c) => new THREE.Color(c),
)

const COUNT = 2600

export function ParticleField() {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)

  // Base positions, per-particle colors, and bob phase/speed/amplitude.
  const { positions, base, colors, phase } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const base = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const phase = new Float32Array(COUNT * 3) // x: phase, y: speed, z: amplitude

    for (let i = 0; i < COUNT; i++) {
      // Distribute in a flattened ellipsoid so the field spreads horizontally.
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

    // Slow drift plus gentle parallax toward the pointer.
    group.rotation.y += delta * 0.02
    const targetX = state.pointer.y * 0.12
    const targetY = state.pointer.x * 0.18
    group.rotation.x += (targetX - group.rotation.x) * 0.04
    group.rotation.z += (targetY * 0.2 - group.rotation.z) * 0.04

    // Per-particle vertical bob — cheap CPU update of the y component.
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
