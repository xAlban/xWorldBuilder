import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import BuilderCamera from './BuilderCamera'
import BuilderGround from './BuilderGround'
import GridOverlay from './GridOverlay'
import PlacedObject from './PlacedObject'
import { useBuilderStore } from '@/stores/builderStore'

function BuilderCanvas() {
  const objects = useBuilderStore((s) => s.objects)

  return (
    <Canvas
      gl={{ antialias: true }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <BuilderCamera />

      {/* ---- Lighting matching xTactics ---- */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} />

      <BuilderGround />
      <GridOverlay />

      {/* ---- Render all placed objects ---- */}
      <Suspense fallback={null}>
        {objects.map((obj) => (
          <PlacedObject key={obj.id} obj={obj} />
        ))}
      </Suspense>
    </Canvas>
  )
}

export default BuilderCanvas
