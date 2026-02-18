import { useCallback, useRef, useState } from 'react'
import { useBuilderStore } from '@/stores/builderStore'
import { CATALOG_BY_ID, getModelPath } from '@/catalog/megakitRegistry'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'

// ---- Ground colors matching xTactics ----
const GROUND_COLORS: Record<string, string> = {
  grass: '#4a8c3f',
  rock: '#6a6a6a',
}

function BuilderGround() {
  const zoneWidth = useBuilderStore((s) => s.zoneWidth)
  const zoneHeight = useBuilderStore((s) => s.zoneHeight)
  const groundType = useBuilderStore((s) => s.groundType)
  const groundTransparent = useBuilderStore((s) => s.groundTransparent)
  const mode = useBuilderStore((s) => s.mode)
  const placingModelId = useBuilderStore((s) => s.placingModelId)
  const snapToGrid = useBuilderStore((s) => s.snapToGrid)
  const gridSpacing = useBuilderStore((s) => s.gridSpacing)
  const scatterCount = useBuilderStore((s) => s.scatterCount)
  const scatterRadius = useBuilderStore((s) => s.scatterRadius)
  const addObject = useBuilderStore((s) => s.addObject)
  const pushSnapshot = useBuilderStore((s) => s.pushSnapshot)
  const clearSelection = useBuilderStore((s) => s.clearSelection)
  const setMode = useBuilderStore((s) => s.setMode)
  const meshRef = useRef<Mesh>(null)
  const [hoverPos, setHoverPos] = useState<{
    x: number
    z: number
  } | null>(null)

  // ---- Snap position to grid if enabled ----
  const snapPosition = useCallback(
    (x: number, z: number) => {
      if (!snapToGrid) return { x, z }
      return {
        x: Math.round(x / gridSpacing) * gridSpacing,
        z: Math.round(z / gridSpacing) * gridSpacing,
      }
    },
    [snapToGrid, gridSpacing],
  )

  // ---- Handle ground click to place objects ----
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      if (mode === 'select') {
        clearSelection()
        return
      }

      if (mode === 'place' && placingModelId) {
        const point = e.point
        const pos = snapPosition(point.x, point.z)
        const catalogEntry = CATALOG_BY_ID[placingModelId]

        pushSnapshot()
        addObject({
          modelId: placingModelId,
          position: pos,
          rotationY: 0,
          scale: catalogEntry?.defaultScale ?? 1,
          collisionSize: catalogEntry?.defaultCollisionSize ?? {
            x: 1,
            z: 1,
          },
          noCollision: !(catalogEntry?.hasCollision ?? true),
          type: 'decoration',
        })
        return
      }

      if (mode === 'scatter' && placingModelId) {
        const point = e.point
        const catalogEntry = CATALOG_BY_ID[placingModelId]

        pushSnapshot()
        for (let i = 0; i < scatterCount; i++) {
          // ---- Random position within radius ----
          const angle = Math.random() * Math.PI * 2
          const dist = Math.random() * scatterRadius
          const x = point.x + Math.cos(angle) * dist
          const z = point.z + Math.sin(angle) * dist

          const pos = snapPosition(x, z)
          // ---- Random rotation for variety ----
          const rotationY = Math.random() * Math.PI * 2
          // ---- Slight scale variation ----
          const scale =
            (catalogEntry?.defaultScale ?? 1) * (0.8 + Math.random() * 0.4)

          addObject({
            modelId: placingModelId,
            position: pos,
            rotationY,
            scale,
            collisionSize: catalogEntry?.defaultCollisionSize ?? {
              x: 1,
              z: 1,
            },
            noCollision: !(catalogEntry?.hasCollision ?? true),
            type: 'decoration',
          })
        }
        return
      }
    },
    [
      mode,
      placingModelId,
      snapPosition,
      addObject,
      pushSnapshot,
      clearSelection,
      scatterCount,
      scatterRadius,
      setMode,
    ],
  )

  // ---- Track hover position for ghost preview ----
  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (mode === 'place' || mode === 'scatter') {
        const pos = snapPosition(e.point.x, e.point.z)
        setHoverPos(pos)
      }
    },
    [mode, snapPosition],
  )

  const handlePointerLeave = useCallback(() => {
    setHoverPos(null)
  }, [])

  return (
    <>
      <mesh
        ref={meshRef}
        rotation-x={-Math.PI / 2}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[zoneWidth, zoneHeight]} />
        <meshStandardMaterial
          color={GROUND_COLORS[groundType] ?? '#4a8c3f'}
          transparent={groundTransparent}
          opacity={groundTransparent ? 0.3 : 1}
          wireframe={groundTransparent}
        />
      </mesh>

      {/* ---- Ghost preview at hover position ---- */}
      {hoverPos &&
        (mode === 'place' || mode === 'scatter') &&
        placingModelId && (
          <GhostPreview
            modelId={placingModelId}
            position={hoverPos}
            scatterMode={mode === 'scatter'}
            scatterRadius={scatterRadius}
          />
        )}
    </>
  )
}

// ---- Semi-transparent preview of the model being placed ----
function GhostPreview({
  modelId,
  position,
  scatterMode,
  scatterRadius,
}: {
  modelId: string
  position: { x: number; z: number }
  scatterMode: boolean
  scatterRadius: number
}) {
  const catalogEntry = CATALOG_BY_ID[modelId]

  return (
    <group position={[position.x, 0, position.z]}>
      {/* ---- Placement indicator ---- */}
      <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.5} />
      </mesh>

      {/* ---- Scatter radius preview ---- */}
      {scatterMode && (
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[scatterRadius - 0.1, scatterRadius, 32]} />
          <meshBasicMaterial color="#4a9eff" transparent opacity={0.3} />
        </mesh>
      )}

      {/* ---- Model preview ---- */}
      {catalogEntry && <GhostModel fileName={catalogEntry.fileName} />}
    </group>
  )
}

// ---- Load and display a ghost model ----
import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'

function GhostModel({ fileName }: { fileName: string }) {
  const path = getModelPath(fileName)
  const { scene } = useGLTF(path)
  const cloned = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ('material' in child && child.material) {
        const mat = (child.material as { clone: () => typeof child.material }).clone()
        ;(mat as { transparent: boolean; opacity: number }).transparent = true
        ;(mat as { transparent: boolean; opacity: number }).opacity = 0.5
        child.material = mat
      }
    })
    return clone
  }, [scene])

  return <primitive object={cloned} />
}

export default BuilderGround
