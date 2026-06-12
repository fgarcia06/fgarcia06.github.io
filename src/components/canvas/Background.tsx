import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { backgroundVertex, makeBackgroundFragment } from '../../shaders/background'
import { appState } from '../../lib/appState'
import { isMobile, prefersReducedMotion } from '../../lib/device'

/* Soft round sprite for the ambient particle clouds, generated instead of
 * loading the reference's sprite1.png. */
function makeSpriteTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(180,210,255,.6)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function ShaderPlane() {
  const mesh = useRef<THREE.Mesh>(null!)
  const { viewport, size } = useThree()

  const uniforms = useMemo(
    () => ({
      iTime: { value: 100.0 },
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      iMouse: { value: new THREE.Vector2(0, 0) },
      audio1: { value: 128.0 / 48.0 },
      adj: { value: 0.2 - window.innerHeight / window.innerWidth },
      orbOpacity: { value: 1.0 },
      intensity: { value: 1.0 },
    }),
    [],
  )

  const fragment = useMemo(
    // Mobile gets a lighter raymarch (fewer steps) — same look, less cost.
    () => makeBackgroundFragment(isMobile ? 28 : 60),
    [],
  )

  useFrame((_, delta) => {
    const u = uniforms
    if (!prefersReducedMotion) u.iTime.value += delta
    // constant + flicker, exactly how the reference drives its ring shimmer
    u.audio1.value = 128.0 / 48.0 + Math.random() * 0.1
    // eased mouse follow (.05 lerp per frame, as in the reference)
    u.iMouse.value.x += (appState.mouse.x - u.iMouse.value.x) * 0.05
    u.iMouse.value.y += (appState.mouse.y - u.iMouse.value.y) * 0.05
    // section orb opacity tween
    u.orbOpacity.value = THREE.MathUtils.damp(u.orbOpacity.value, appState.orbTarget, 2.2, delta)
    u.intensity.value = appState.intensity
    u.iResolution.value.set(size.width, size.height)
    u.adj.value = 0.2 - size.height / size.width
  })

  // Fill the camera frustum like the reference's 110-unit plane.
  const aspect = viewport.aspect
  return (
    <mesh ref={mesh} scale={[110 * aspect, 110, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={backgroundVertex}
        fragmentShader={fragment}
        depthWrite={false}
      />
    </mesh>
  )
}

function ParticleCloud({ color, rotationSign }: { color: [number, number, number]; rotationSign: number }) {
  const points = useRef<THREE.Points>(null!)
  const sprite = useMemo(makeSpriteTexture, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const vertices: number[] = []
    for (let i = 0; i < 350; i++) {
      vertices.push(Math.random() * 60 - 30, Math.random() * 60 - 30, Math.random() * 60 - 30)
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    return geo
  }, [])

  const initial = useMemo(
    () => [Math.random() * 6, Math.random() * 6, Math.random() * 6] as const,
    [],
  )

  useFrame(({ clock }) => {
    if (prefersReducedMotion) return
    points.current.rotation.z = initial[2] - 0.03 * clock.elapsedTime * rotationSign
  })

  return (
    <points ref={points} rotation={[initial[0], initial[1], initial[2]]}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={0.3}
        map={sprite}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        transparent
        opacity={0.35}
        color={new THREE.Color(...color)}
      />
    </points>
  )
}

function CameraRig() {
  useFrame(({ camera }) => {
    camera.position.x += (-appState.mouse.x * 0.01 - camera.position.x) * 0.05
    camera.position.y += (appState.mouse.y * 0.01 - camera.position.y) * 0.05
  })
  return null
}

export default function Background() {
  // fade the canvas in over the static gradient once mounted,
  // like the reference's $(canvas).addClass("show")
  const [shown, setShown] = useState(false)
  useEffect(() => setShown(true), [])

  return (
    <Canvas
      id="webgl"
      className={`webgl-canvas ${shown ? 'show' : ''}`}
      dpr={isMobile ? 1 : [1, 2]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 90, near: 1, far: 1000, position: [0, 0, 50] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <ShaderPlane />
      {!isMobile && (
        <>
          <ParticleCloud color={[0.3, 0.7, 0.9]} rotationSign={1} />
          <ParticleCloud color={[0.3, 0.3, 0.8]} rotationSign={-2} />
          <CameraRig />
        </>
      )}
    </Canvas>
  )
}
