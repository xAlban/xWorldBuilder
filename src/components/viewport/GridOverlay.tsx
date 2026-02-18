import { useMemo } from 'react'
import { useBuilderStore } from '@/stores/builderStore'
import { BufferGeometry, Float32BufferAttribute } from 'three'

function GridOverlay() {
  const showGrid = useBuilderStore((s) => s.showGrid)
  const gridSpacing = useBuilderStore((s) => s.gridSpacing)
  const zoneWidth = useBuilderStore((s) => s.zoneWidth)
  const zoneHeight = useBuilderStore((s) => s.zoneHeight)

  const geometry = useMemo(() => {
    if (!showGrid) return null

    const halfW = zoneWidth / 2
    const halfH = zoneHeight / 2
    const positions: number[] = []

    // ---- Vertical lines ----
    for (
      let x = -halfW;
      x <= halfW;
      x += gridSpacing
    ) {
      positions.push(x, 0.01, -halfH, x, 0.01, halfH)
    }

    // ---- Horizontal lines ----
    for (
      let z = -halfH;
      z <= halfH;
      z += gridSpacing
    ) {
      positions.push(-halfW, 0.01, z, halfW, 0.01, z)
    }

    const geo = new BufferGeometry()
    geo.setAttribute(
      'position',
      new Float32BufferAttribute(positions, 3),
    )
    return geo
  }, [showGrid, gridSpacing, zoneWidth, zoneHeight])

  if (!showGrid || !geometry) return null

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </lineSegments>
  )
}

export default GridOverlay
