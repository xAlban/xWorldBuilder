import { useCallback, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useBuilderStore } from '@/stores/builderStore'
import { getModelPath, CATALOG_BY_ID } from '@/catalog/megakitRegistry'
import type { BuilderObject } from '@/types/builder'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'

interface PlacedObjectProps {
  obj: BuilderObject
}

function PlacedObject({ obj }: PlacedObjectProps) {
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const selectObject = useBuilderStore((s) => s.selectObject)
  const mode = useBuilderStore((s) => s.mode)
  const groupRef = useRef<Group>(null)

  const isSelected = selectedIds.includes(obj.id)

  // ---- Resolve model path ----
  const catalogEntry = CATALOG_BY_ID[obj.modelId]
  const fileName = catalogEntry?.fileName ?? `${obj.modelId}.gltf`
  const modelPath = getModelPath(fileName)

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (mode !== 'select') return
      e.stopPropagation()
      // ---- Shift+click for additive selection ----
      selectObject(obj.id, e.nativeEvent.shiftKey)
    },
    [mode, selectObject, obj.id],
  )

  return (
    <group
      ref={groupRef}
      position={[obj.position.x, 0, obj.position.z]}
      rotation={[0, obj.rotationY, 0]}
      scale={obj.scale}
      onClick={handleClick}
    >
      <ModelMesh path={modelPath} />
      {/* ---- Selection wireframe highlight ---- */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[2, 3, 2]} />
          <meshBasicMaterial
            color="#4a9eff"
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  )
}

// ---- Separated model loading for Suspense fallback ----
function ModelMesh({ path }: { path: string }) {
  const { scene } = useGLTF(path)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return <primitive object={cloned} />
}

export default PlacedObject
