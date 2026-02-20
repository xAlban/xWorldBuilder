import { useBuilderStore } from '@/stores/builderStore'

function BoxSelectOverlay() {
  const boxSelectStart = useBuilderStore((s) => s.boxSelectStart)
  const boxSelectCurrent = useBuilderStore((s) => s.boxSelectCurrent)

  if (!boxSelectStart || !boxSelectCurrent) return null

  // ---- Compute screen-space rectangle ----
  const left = Math.min(boxSelectStart.screenX, boxSelectCurrent.screenX)
  const top = Math.min(boxSelectStart.screenY, boxSelectCurrent.screenY)
  const width = Math.abs(boxSelectCurrent.screenX - boxSelectStart.screenX)
  const height = Math.abs(boxSelectCurrent.screenY - boxSelectStart.screenY)

  return (
    <div
      className="pointer-events-none fixed z-50 border border-blue-500 bg-blue-500/15"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  )
}

export default BoxSelectOverlay
