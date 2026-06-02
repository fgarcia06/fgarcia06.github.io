import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ParticleField } from './ParticleField'

// Default-exported for React.lazy code-splitting of the three.js bundle.
export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 55 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ scene }) => {
        // Fog the field into the page background for organic depth.
        scene.fog = new THREE.FogExp2(new THREE.Color('#14130d'), 0.055)
      }}
    >
      <ParticleField />
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  )
}
