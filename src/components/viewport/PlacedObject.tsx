import { useCallback, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useBuilderStore } from '@/stores/builderStore'
import { getModelPath, CATALOG_BY_ID } from '@/catalog/megakitRegistry'
import type { BuilderObject } from '@/types/builder'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'

// ---- Portal colors matching xTactics ----
const COMBAT_PORTAL_COLOR = '#e74c3c'
const ZONE_PORTAL_COLOR = '#3498db'

interface PlacedObjectProps {
  obj: BuilderObject
}

function PlacedObject({ obj }: PlacedObjectProps) {
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const selectObject = useBuilderStore((s) => s.selectObject)
  const startDrag = useBuilderStore((s) => s.startDrag)
  const mode = useBuilderStore((s) => s.mode)
  const draggingId = useBuilderStore((s) => s.draggingId)
  const groupRef = useRef<Group>(null)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  const isSelected = selectedIds.includes(obj.id)
  const isDragging = draggingId === obj.id

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (mode !== 'select') return
      e.stopPropagation()
      // ---- Store pointer down position for drag detection ----
      pointerDownPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }

      const additive =
        e.nativeEvent.shiftKey || e.nativeEvent.ctrlKey || e.nativeEvent.metaKey
      // ---- Start drag on pointer down ----
      startDrag(obj.id, additive)
      document.body.style.cursor = 'grabbing'
    },
    [mode, startDrag, obj.id],
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (mode !== 'select') return
      e.stopPropagation()

      const additive =
        e.nativeEvent.shiftKey || e.nativeEvent.ctrlKey || e.nativeEvent.metaKey

      // ---- Check if drag occurred ----
      if (pointerDownPos.current) {
        const dx = e.nativeEvent.clientX - pointerDownPos.current.x
        const dy = e.nativeEvent.clientY - pointerDownPos.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 5) {
          // ---- Drag happened ----
          // If additive, ensure selected (force=true)
          if (additive) {
            selectObject(obj.id, true, true)
          }
          pointerDownPos.current = null
          return
        }
      }
      pointerDownPos.current = null

      // ---- Toggle selection ----
      selectObject(obj.id, additive)
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
      onPointerDown={handlePointerDown}
    >
      {/* ---- Render portal torus or GLTF model ---- */}
      {obj.type === 'combatPortal' || obj.type === 'zonePortal' ? (
        <PortalMesh type={obj.type} />
      ) : (
        <DecorationMesh modelId={obj.modelId} />
      )}
      {/* ---- Selection wireframe highlight ---- */}
      {isSelected && !isDragging && (
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
      {/* ---- Drag highlight ---- */}
      {isDragging && (
        <mesh>
          <boxGeometry args={[2, 3, 2]} />
          <meshBasicMaterial
            color="#ffa500"
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  )
}

// ---- Portal torus matching xTactics visual style ----
function PortalMesh({ type }: { type: 'combatPortal' | 'zonePortal' }) {
  const color =
    type === 'combatPortal' ? COMBAT_PORTAL_COLOR : ZONE_PORTAL_COLOR
  return (
    <mesh>
      <torusGeometry args={[0.6, 0.15, 16, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}

// ---- Separated model loading for Suspense fallback ----
function DecorationMesh({ modelId }: { modelId: string }) {
  const catalogEntry = CATALOG_BY_ID[modelId]
  const fileName = catalogEntry?.fileName ?? `${modelId}.gltf`
  const modelPath = getModelPath(fileName)
  const { scene } = useGLTF(modelPath)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return <primitive object={cloned} />
}

export default PlacedObject
