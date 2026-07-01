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
      pulse: { value: 0.0 },
      shape: { value: 0.0 },
      warp: { value: 0.0 },
    }),
    [],
  )

  // The 3D Tacet Mark is raymarched — mobile gets fewer steps for the same
  // look at lower cost.
  const fragment = useMemo(() => makeBackgroundFragment(isMobile ? 40 : 80), [])

  useFrame((_, delta) => {
    const u = uniforms
    if (!prefersReducedMotion) u.iTime.value += delta
    // constant + flicker, exactly how the reference drives its ring shimmer
    u.audio1.value = 128.0 / 48.0 + Math.random() * 0.1
    // eased mouse follow (.05 lerp per frame, as in the reference)
    u.iMouse.value.x += (appState.mouse.x - u.iMouse.value.x) * 0.05
    u.iMouse.value.y += (appState.mouse.y - u.iMouse.value.y) * 0.05
    // section orb opacity tween
    // snappier than the original 2.2 so the tacet↔abstract morph feels fast
    u.orbOpacity.value = THREE.MathUtils.damp(u.orbOpacity.value, appState.orbTarget, 3.4, delta)
    // which abstract shape the mark morphs into — eased so the gyroid↔ring
    // swap cross-fades smoothly when moving between section groups
    u.shape.value = THREE.MathUtils.damp(u.shape.value, appState.shapeTarget, 3.0, delta)
    u.intensity.value = appState.intensity
    // decay the navigation burst toward 0 (~1s tail) and feed it to the shader
    appState.pulse = THREE.MathUtils.damp(appState.pulse, 0, 3.2, delta)
    u.pulse.value = appState.pulse
    // decay the hyperspace warp on a long tail (read by Starfield). A low
    // damping rate (1.1 vs the old 2.4) ~doubles the travel: the streak lingers
    // and decelerates over ~2s instead of snapping back — motion-driven, not a
    // flash.
    appState.warp = THREE.MathUtils.damp(appState.warp, 0, 0.35, delta)
    // feed the warp to the shader's radial stretch (skip for reduced-motion so
    // the frame never distorts/disorients for those users)
    u.warp.value = prefersReducedMotion ? 0 : appState.warp
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

/* A field of stars streaming past the camera, giving the home scene a steady
 * sense of forward flight through space. Points start far down the -z tunnel
 * and travel toward the camera (+z); once they pass it they recycle to the
 * far end with fresh x/y. sizeAttenuation makes near stars naturally larger,
 * so they appear to rush by. */
function Starfield() {
  const points = useRef<THREE.Points>(null!)
  const material = useRef<THREE.PointsMaterial>(null!)
  const sprite = useMemo(makeSpriteTexture, [])
  const COUNT = 480
  const NEAR = 60 // just behind the camera (z=50)
  const FAR = -220

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 160
      arr[i * 3 + 1] = (Math.random() - 0.5) * 110
      arr[i * 3 + 2] = FAR + Math.random() * (NEAR - FAR)
    }
    return arr
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((_, delta) => {
    if (prefersReducedMotion) return
    const warp = appState.warp
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    // cruise speed, with a big additive burst during a navigation warp
    const step = delta * (26 + warp * warp * 320)
    for (let i = 0; i < COUNT; i++) {
      const zi = i * 3 + 2
      arr[zi] += step
      if (arr[zi] > NEAR) {
        // recycle to the far end with a new transverse position
        arr[zi] = FAR
        arr[i * 3] = (Math.random() - 0.5) * 160
        arr[i * 3 + 1] = (Math.random() - 0.5) * 110
      }
    }
    attr.needsUpdate = true
    // fatten + brighten the stars during the jump so they read as streaks
    if (material.current) {
      material.current.size = 0.6 + warp * 2.6
      material.current.opacity = 0.55 + warp * 0.4
    }
  })

  return (
    <points ref={points}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        ref={material}
        size={0.6}
        map={sprite}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={0.55}
        sizeAttenuation
        color={new THREE.Color(0.7, 0.85, 1)}
      />
    </points>
  )
}

function CameraRig() {
  useFrame(({ camera, clock }) => {
    if (prefersReducedMotion) return
    // gentle multi-frequency wander so the scene keeps drifting through space
    // even when the mouse is still — a slow, never-repeating exploratory float.
    const t = clock.elapsedTime
    const driftX = Math.sin(t * 0.07) * 1.1 + Math.sin(t * 0.023) * 0.6
    const driftY = Math.cos(t * 0.05) * 0.8 + Math.sin(t * 0.017) * 0.45
    const targetX = -appState.mouse.x * 0.01 + driftX
    const targetY = appState.mouse.y * 0.01 + driftY
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    // bank slightly toward the drift so it reads as banking, not sliding
    camera.rotation.z += (driftX * 0.004 - camera.rotation.z) * 0.04
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
          <Starfield />
          <ParticleCloud color={[0.3, 0.7, 0.9]} rotationSign={1} />
          <ParticleCloud color={[0.3, 0.3, 0.8]} rotationSign={-2} />
          <CameraRig />
        </>
      )}
    </Canvas>
  )
}
