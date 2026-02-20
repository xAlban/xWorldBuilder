import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useBuilderStore } from '@/stores/builderStore'
import { CATALOG_BY_ID, getModelPath } from '@/catalog/megakitRegistry'
import { createTerrain } from '@/utils/terrainUtils'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useGLTF } from '@react-three/drei'

// ---- Ground colors matching xTactics ----
const GROUND_COLORS: Record<string, string> = {
  grass: '#70c048',
  rock: '#6a6a6a',
}

// ---- Terrain subdivision: 1 segment per 2 world units (matches xTactics) ----
const SEGMENT_DENSITY = 2

// ---- Portal colors matching xTactics ----
const PORTAL_COLORS: Record<string, string> = {
  __combatPortal: '#e74c3c',
  __zonePortal: '#3498db',
}

function BuilderGround() {
  const zoneWidth = useBuilderStore((s) => s.zoneWidth)
  const zoneHeight = useBuilderStore((s) => s.zoneHeight)
  const groundType = useBuilderStore((s) => s.groundType)
  const groundTransparent = useBuilderStore((s) => s.groundTransparent)
  const heightmap = useBuilderStore((s) => s.heightmap)
  const mode = useBuilderStore((s) => s.mode)
  const placingModelId = useBuilderStore((s) => s.placingModelId)
  const snapToGrid = useBuilderStore((s) => s.snapToGrid)
  const gridSpacing = useBuilderStore((s) => s.gridSpacing)
  const scatterCount = useBuilderStore((s) => s.scatterCount)
  const scatterRadius = useBuilderStore((s) => s.scatterRadius)
  const draggingId = useBuilderStore((s) => s.draggingId)
  const addObject = useBuilderStore((s) => s.addObject)
  const moveSelection = useBuilderStore((s) => s.moveSelection)
  const pushSnapshot = useBuilderStore((s) => s.pushSnapshot)
  const clearSelection = useBuilderStore((s) => s.clearSelection)
  const stopDrag = useBuilderStore((s) => s.stopDrag)
  const startBoxSelect = useBuilderStore((s) => s.startBoxSelect)
  const updateBoxSelect = useBuilderStore((s) => s.updateBoxSelect)
  const commitBoxSelect = useBuilderStore((s) => s.commitBoxSelect)
  const meshRef = useRef<Mesh>(null)

  // ---- Build terrain from heightmap config ----
  const terrain = useMemo(
    () => (heightmap ? createTerrain(heightmap) : null),
    [heightmap],
  )

  // ---- Build displaced geometry when heightmap is active ----
  const geometry = useMemo(() => {
    if (!terrain) return null
    const segsX = Math.ceil(zoneWidth / SEGMENT_DENSITY)
    const segsZ = Math.ceil(zoneHeight / SEGMENT_DENSITY)
    const geo = new THREE.PlaneGeometry(zoneWidth, zoneHeight, segsX, segsZ)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position!
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, terrain.getHeightAt(pos.getX(i), pos.getZ(i)))
    }
    geo.computeVertexNormals()
    return geo
  }, [zoneWidth, zoneHeight, terrain])
  const [hoverPos, setHoverPos] = useState<{
    x: number
    z: number
  } | null>(null)
  // ---- Track pointer down for box-select drag detection ----
  const groundPointerDown = useRef<{
    screenX: number
    screenY: number
    worldX: number
    worldZ: number
  } | null>(null)
  const isBoxSelecting = useRef(false)

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

  // ---- Check if placing a portal type ----
  const isPortalPlacement =
    placingModelId === '__combatPortal' || placingModelId === '__zonePortal'

  // ---- Handle pointer down on ground for box-select ----
  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (mode === 'select' && !draggingId && e.nativeEvent.button === 0) {
        groundPointerDown.current = {
          screenX: e.nativeEvent.clientX,
          screenY: e.nativeEvent.clientY,
          worldX: e.point.x,
          worldZ: e.point.z,
        }
        isBoxSelecting.current = false
      }
    },
    [mode, draggingId],
  )

  // ---- Handle ground click to place objects ----
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      // ---- If box-select just ended, skip click ----
      if (isBoxSelecting.current) {
        isBoxSelecting.current = false
        groundPointerDown.current = null
        return
      }
      groundPointerDown.current = null

      // ---- If dragging, stop drag on click (pointerUp handles it too) ----
      if (draggingId) return

      if (mode === 'select') {
        clearSelection()
        return
      }

      if (mode === 'place' && placingModelId) {
        const point = e.point
        const pos = snapPosition(point.x, point.z)

        // ---- Portal placement ----
        if (
          placingModelId === '__combatPortal' ||
          placingModelId === '__zonePortal'
        ) {
          pushSnapshot()
          addObject({
            modelId: placingModelId,
            position: { ...pos, y: 0 },
            rotationY: 0,
            scale: 1,
            collisionSize: { x: 1, z: 1 },
            noCollision: false,
            walkable: false,
            type:
              placingModelId === '__combatPortal'
                ? 'combatPortal'
                : 'zonePortal',
            ...(placingModelId === '__zonePortal'
              ? {
                  targetZoneId: '',
                  targetSpawnPosition: { x: 0, z: 0 },
                }
              : {}),
          })
          return
        }

        // ---- Decoration placement ----
        const catalogEntry = CATALOG_BY_ID[placingModelId]
        pushSnapshot()
        addObject({
          modelId: placingModelId,
          position: { ...pos, y: 0 },
          rotationY: 0,
          scale: catalogEntry?.defaultScale ?? 1,
          collisionSize: catalogEntry?.defaultCollisionSize ?? {
            x: 1,
            z: 1,
          },
          noCollision: !(catalogEntry?.hasCollision ?? true),
          walkable: false,
          type: 'decoration',
        })
        return
      }

      if (mode === 'scatter' && placingModelId && !isPortalPlacement) {
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
            position: { ...pos, y: 0 },
            rotationY,
            scale,
            collisionSize: catalogEntry?.defaultCollisionSize ?? {
              x: 1,
              z: 1,
            },
            noCollision: !(catalogEntry?.hasCollision ?? true),
            walkable: false,
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
      draggingId,
      isPortalPlacement,
    ],
  )

  // ---- Track hover position for ghost preview + drag movement + box-select ----
  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      // ---- Drag mode: update dragged object position (preserves Y) ----
      if (draggingId) {
        const pos = snapPosition(e.point.x, e.point.z)
        const leaderObj = useBuilderStore
          .getState()
          .objects.find((o) => o.id === draggingId)
        moveSelection(draggingId, {
          ...pos,
          y: leaderObj?.position.y ?? 0,
        })
        return
      }

      // ---- Box-select: detect drag threshold then update ----
      if (mode === 'select' && groundPointerDown.current) {
        const dx = e.nativeEvent.clientX - groundPointerDown.current.screenX
        const dy = e.nativeEvent.clientY - groundPointerDown.current.screenY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (!isBoxSelecting.current && dist > 5) {
          isBoxSelecting.current = true
          startBoxSelect(
            groundPointerDown.current.screenX,
            groundPointerDown.current.screenY,
            groundPointerDown.current.worldX,
            groundPointerDown.current.worldZ,
          )
        }

        if (isBoxSelecting.current) {
          updateBoxSelect(
            e.nativeEvent.clientX,
            e.nativeEvent.clientY,
            e.point.x,
            e.point.z,
          )
        }
        return
      }

      if (mode === 'place' || mode === 'scatter') {
        const pos = snapPosition(e.point.x, e.point.z)
        setHoverPos(pos)
      }
    },
    [mode, snapPosition, draggingId, moveSelection, startBoxSelect, updateBoxSelect],
  )

  // ---- Stop drag or commit box-select on pointer up ----
  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (draggingId) {
        stopDrag()
        document.body.style.cursor = 'default'
      }

      // ---- Commit box selection ----
      if (isBoxSelecting.current) {
        const additive =
          e.nativeEvent.shiftKey || e.nativeEvent.ctrlKey || e.nativeEvent.metaKey
        commitBoxSelect(additive)
      }
      groundPointerDown.current = null
    },
    [draggingId, stopDrag, commitBoxSelect],
  )

  // ---- Also listen for global pointer up in case mouse leaves the ground ----
  useEffect(() => {
    const handleGlobalPointerUp = (e: PointerEvent) => {
      const state = useBuilderStore.getState()
      if (state.draggingId) {
        state.stopDrag()
        document.body.style.cursor = 'default'
      }
      // ---- Commit box-select if pointer leaves the ground ----
      if (isBoxSelecting.current) {
        const additive = e.shiftKey || e.ctrlKey || e.metaKey
        state.commitBoxSelect(additive)
        isBoxSelecting.current = false
        groundPointerDown.current = null
      }
    }
    window.addEventListener('pointerup', handleGlobalPointerUp)
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setHoverPos(null)
  }, [])

  return (
    <>
      {geometry ? (
        // ---- Displaced terrain mesh (heightmap active) ----
        <mesh
          ref={meshRef}
          geometry={geometry}
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <meshStandardMaterial
            color={GROUND_COLORS[groundType] ?? '#70c048'}
            transparent={groundTransparent}
            opacity={groundTransparent ? 0.3 : 1}
            wireframe={groundTransparent}
          />
        </mesh>
      ) : (
        // ---- Flat ground plane (no heightmap) ----
        <mesh
          ref={meshRef}
          rotation-x={-Math.PI / 2}
          position={[0, 0, 0]}
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <planeGeometry args={[zoneWidth, zoneHeight]} />
          <meshStandardMaterial
            color={GROUND_COLORS[groundType] ?? '#70c048'}
            transparent={groundTransparent}
            opacity={groundTransparent ? 0.3 : 1}
            wireframe={groundTransparent}
          />
        </mesh>
      )}

      {/* ---- Ghost preview at hover position ---- */}
      {hoverPos &&
        (mode === 'place' || mode === 'scatter') &&
        placingModelId && (
          <GhostPreview
            modelId={placingModelId}
            position={hoverPos}
            scatterMode={mode === 'scatter'}
            scatterRadius={scatterRadius}
            isPortal={isPortalPlacement}
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
  isPortal,
}: {
  modelId: string
  position: { x: number; z: number }
  scatterMode: boolean
  scatterRadius: number
  isPortal: boolean
}) {
  const catalogEntry = CATALOG_BY_ID[modelId]
  const portalColor = PORTAL_COLORS[modelId]

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

      {/* ---- Portal ghost or model ghost ---- */}
      {isPortal && portalColor ? (
        <mesh>
          <torusGeometry args={[0.6, 0.15, 16, 32]} />
          <meshBasicMaterial color={portalColor} transparent opacity={0.5} />
        </mesh>
      ) : (
        catalogEntry && <GhostModel fileName={catalogEntry.fileName} />
      )}
    </group>
  )
}

// ---- Load and display a ghost model ----
function GhostModel({ fileName }: { fileName: string }) {
  const path = getModelPath(fileName)
  const { scene } = useGLTF(path)
  const cloned = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => {
            const newMat = m.clone()
            newMat.transparent = true
            newMat.opacity = 0.5
            return newMat
          })
        } else {
          const newMat = mesh.material.clone()
          newMat.transparent = true
          newMat.opacity = 0.5
          mesh.material = newMat
        }
      }
    })
    return clone
  }, [scene])

  return <primitive object={cloned} />
}

export default BuilderGround
